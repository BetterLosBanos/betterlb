/**
 * Admin Person Merge API
 * POST /api/admin/persons/merge - Merge duplicate person records
 * GET /api/admin/persons/duplicates - Get list of duplicate persons
 */

import { Env } from '../../types';
import { withAuth, AuthContext } from '../../utils/admin-auth';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
}

interface DuplicatePersonGroup {
  person_ids: string[];
  persons: Person[];
  document_count?: number;
  membership_count?: number;
}

interface MergeRequest {
  keep_person_id: string;
  merge_person_ids: string[];
  merge_strategy: 'prefer_keep' | 'prefer_merge' | 'newest' | 'most_complete';
}

interface MergeResult {
  success: boolean;
  merged_count: number;
  updated_tables: {
    memberships?: number;
    document_authors?: number;
    session_absences?: number;
    committee_memberships?: number;
  };
  deleted_ids: string[];
}

/**
 * GET /api/admin/persons/duplicates
 * Get list of duplicate persons that need merging
 */
async function handleGetDuplicates(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;

  try {
    const duplicates: DuplicatePersonGroup[] = [];

    // 1. Exact duplicates (same first, middle, last name)
    const sql_exact = `
      SELECT
        GROUP_CONCAT(p.id) as person_ids,
        GROUP_CONCAT(p.first_name || '|' || p.middle_name || '|' || p.last_name) as names
      FROM persons p
      GROUP BY p.first_name, p.last_name
      HAVING COUNT(*) > 1
      ORDER BY MIN(p.created_at) DESC
    `;

    const exactResults = await env.BETTERLB_DB.prepare(sql_exact).all();

    for (const row of exactResults.results as any[]) {
      const ids = row.person_ids.split(',');
      const names = row.names.split(',').map((n: string) => {
        const parts = n.split('|');
        return { first_name: parts[0], middle_name: parts[1] || null, last_name: parts[2] };
      });

      // Get actual person records
      const personRecords: Person[] = [];
      for (const id of ids) {
        const person = await env.BETTERLB_DB.prepare(
          `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
        ).bind(id).first();
        if (person) personRecords.push(person as unknown as Person);
      }

      // Count related records for the first person
      const docCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM document_authors WHERE person_id IN (${ids.map(() => '?').join(',')})`
      ).bind(...ids).first<{ count: number }>();

      const memberCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM memberships WHERE person_id IN (${ids.map(() => '?').join(',')})`
      ).bind(...ids).first<{ count: number }>();

      duplicates.push({
        person_ids: ids,
        persons: personRecords,
        document_count: docCount?.count || 0,
        membership_count: memberCount?.count || 0,
      });
    }

    // 2. Same first/last name with different middle name
    const sql_middle = `
      SELECT p1.id as id1, p2.id as id2, p1.first_name, p1.middle_name as mn1, p1.last_name,
             p2.middle_name as mn2, p1.suffix
      FROM persons p1
      JOIN persons p2 ON p1.first_name = p2.first_name AND p1.last_name = p2.last_name
        AND p1.middle_name != p2.middle_name
        AND p1.id < p2.id
      ORDER BY p1.last_name, p1.first_name
      LIMIT 50
    `;

    const middleResults = await env.BETTERLB_DB.prepare(sql_middle).all();

    for (const row of middleResults.results as any[]) {
      const person1 = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
      ).bind(row.id1).first() as any;

      const person2 = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
      ).bind(row.id2).first() as any;

      if (person1 && person2) {
        const docCount = await env.BETTERLB_DB.prepare(
          `SELECT COUNT(*) as count FROM document_authors WHERE person_id IN (?1, ?2)`
        ).bind(row.id1, row.id2).first<{ count: number }>();

        const memberCount = await env.BETTERLB_DB.prepare(
          `SELECT COUNT(*) as count FROM memberships WHERE person_id IN (?1, ?2)`
        ).bind(row.id1, row.id2).first<{ count: number }>();

        duplicates.push({
          person_ids: [row.id1, row.id2],
          persons: [person1, person2],
          document_count: docCount?.count || 0,
          membership_count: memberCount?.count || 0,
        });
      }
    }

    return Response.json({ duplicates });
  } catch (error) {
    console.error('Error fetching duplicates:', error);
    return Response.json({ error: 'Failed to fetch duplicates' }, { status: 500 });
  }
}

/**
 * POST /api/admin/persons/merge
 * Merge duplicate person records
 */
async function handleMerge(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = await request.json() as MergeRequest;
    const { keep_person_id, merge_person_ids, merge_strategy } = body;

    if (!keep_person_id || !merge_person_ids || merge_person_ids.length === 0) {
      return Response.json(
        { error: 'Missing required fields: keep_person_id, merge_person_ids' },
        { status: 400 }
      );
    }

    // Validate that keep_person_id exists
    const keepPerson = await env.BETTERLB_DB.prepare(
      `SELECT id FROM persons WHERE id = ?1`
    ).bind(keep_person_id).first();

    if (!keepPerson) {
      return Response.json({ error: 'Keep person not found' }, { status: 404 });
    }

    // Validate all merge_person_ids exist
    for (const id of merge_person_ids) {
      const person = await env.BETTERLB_DB.prepare(
        `SELECT id FROM persons WHERE id = ?1`
      ).bind(id).first();
      if (!person) {
        return Response.json({ error: `Merge person ${id} not found` }, { status: 404 });
      }
    }

    // Perform the merge in a transaction-like manner
    const updatedTables: MergeResult['updated_tables'] = {};
    const deleted_ids: string[] = [];

    // 1. Update memberships - change person_id to keep_person_id
    const memberUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE memberships SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    ).bind(keep_person_id, ...merge_person_ids).run();

    updatedTables.memberships = memberUpdate.meta.changes || 0;

    // 2. Update document_authors
    const authorUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE document_authors SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    ).bind(keep_person_id, ...merge_person_ids).run();

    updatedTables.document_authors = authorUpdate.meta.changes || 0;

    // 3. Update session_absences
    const absenceUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE session_absences SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    ).bind(keep_person_id, ...merge_person_ids).run();

    updatedTables.session_absences = absenceUpdate.meta.changes || 0;

    // 4. Update committee_memberships
    const committeeUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE committee_memberships SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    ).bind(keep_person_id, ...merge_person_ids).run();

    updatedTables.committee_memberships = committeeUpdate.meta.changes || 0;

    // 5. Delete the merged person records
    for (const id of merge_person_ids) {
      await env.BETTERLB_DB.prepare(`DELETE FROM persons WHERE id = ?1`).bind(id).run();
      deleted_ids.push(id);
    }

    // 6. Log the merge action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('merge_persons', ?1, 'person', ?2, ?3, datetime('now'))`
    ).bind(
      auth.user.login,
      keep_person_id,
      JSON.stringify({
        merged_ids: merge_person_ids,
        strategy: merge_strategy,
        updated_tables: updatedTables,
      })
    ).run();

    const result: MergeResult = {
      success: true,
      merged_count: merge_person_ids.length,
      updated_tables,
      deleted_ids,
    };

    return Response.json(result);
  } catch (error) {
    console.error('Error merging persons:', error);
    return Response.json({ error: 'Failed to merge persons' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleGetDuplicates);
export const onRequestPost = withAuth(handleMerge);
