/**
 * Admin Person Merge API
 * POST /api/admin/persons/merge - Merge duplicate person records
 * GET /api/admin/persons/duplicates - Get list of duplicate persons
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';
import { parseJsonBody } from '../../utils/request';

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
  committee_count?: number;
}

interface MergeRequest {
  keep_person_id: string;
  merge_person_ids: string[];
  merge_strategy: 'prefer_keep' | 'prefer_merge' | 'newest' | 'most_complete';
  deletion_mode?: 'delete' | 'flag' | 'skip';
}

interface MergeResult {
  success: boolean;
  merged_count: number;
  updated_tables: {
    memberships?: number;
    document_authors?: number;
    session_absences?: number;
    committee_memberships?: number;
    committee_duplicates_removed?: number;
    absence_duplicates_removed?: number;
    membership_duplicates_removed?: number;
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

    // 1. Exact duplicates (same first, middle, last name) - exclude soft-deleted
    const sql_exact = `
      SELECT
        GROUP_CONCAT(p.id) as person_ids,
        GROUP_CONCAT(p.first_name || '|' || p.middle_name || '|' || p.last_name) as names
      FROM persons p
      WHERE p.deleted_at IS NULL
      GROUP BY p.first_name, p.last_name
      HAVING COUNT(*) > 1
      ORDER BY MIN(p.created_at) DESC
    `;

    const exactResults = await env.BETTERLB_DB.prepare(sql_exact).all();

    for (const row of exactResults.results as Array<{
      person_ids: string;
      names: string;
    }>) {
      const ids = row.person_ids.split(',');

      // Get actual person records
      const personRecords: Person[] = [];
      for (const id of ids) {
        const person = await env.BETTERLB_DB.prepare(
          `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
        )
          .bind(id)
          .first();
        if (person) personRecords.push(person as unknown as Person);
      }

      // Count related records for the first person
      const docCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM document_authors WHERE person_id IN (${ids.map(() => '?').join(',')})`
      )
        .bind(...ids)
        .first<{ count: number }>();

      const memberCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM memberships WHERE person_id IN (${ids.map(() => '?').join(',')})`
      )
        .bind(...ids)
        .first<{ count: number }>();

      const committeeCount = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as count FROM committee_memberships WHERE person_id IN (${ids.map(() => '?').join(',')})`
      )
        .bind(...ids)
        .first<{ count: number }>();

      duplicates.push({
        person_ids: ids,
        persons: personRecords,
        document_count: docCount?.count || 0,
        membership_count: memberCount?.count || 0,
        committee_count: committeeCount?.count || 0,
      });
    }

    // 2. Same first/last name with different middle name - exclude soft-deleted
    const sql_middle = `
      SELECT p1.id as id1, p2.id as id2, p1.first_name, p1.middle_name as mn1, p1.last_name,
             p2.middle_name as mn2, p1.suffix
      FROM persons p1
      JOIN persons p2 ON p1.first_name = p2.first_name AND p1.last_name = p2.last_name
        AND p1.middle_name != p2.middle_name
        AND p1.id < p2.id
        AND p1.deleted_at IS NULL AND p2.deleted_at IS NULL
      ORDER BY p1.last_name, p1.first_name
      LIMIT 50
    `;

    const middleResults = await env.BETTERLB_DB.prepare(sql_middle).all();

    for (const row of middleResults.results as Array<{
      id1: string;
      id2: string;
      first_name: string;
      mn1: string | null;
      last_name: string;
      mn2: string | null;
      suffix: string | null;
    }>) {
      const person1 = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
      )
        .bind(row.id1)
        .first<{
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          suffix: string | null;
        }>();

      const person2 = await env.BETTERLB_DB.prepare(
        `SELECT id, first_name, middle_name, last_name, suffix FROM persons WHERE id = ?1`
      )
        .bind(row.id2)
        .first<{
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          suffix: string | null;
        }>();

      if (person1 && person2) {
        const docCount = await env.BETTERLB_DB.prepare(
          `SELECT COUNT(*) as count FROM document_authors WHERE person_id IN (?1, ?2)`
        )
          .bind(row.id1, row.id2)
          .first<{ count: number }>();

        const memberCount = await env.BETTERLB_DB.prepare(
          `SELECT COUNT(*) as count FROM memberships WHERE person_id IN (?1, ?2)`
        )
          .bind(row.id1, row.id2)
          .first<{ count: number }>();

        const committeeCount = await env.BETTERLB_DB.prepare(
          `SELECT COUNT(*) as count FROM committee_memberships WHERE person_id IN (?1, ?2)`
        )
          .bind(row.id1, row.id2)
          .first<{ count: number }>();

        duplicates.push({
          person_ids: [row.id1, row.id2],
          persons: [person1, person2],
          document_count: docCount?.count || 0,
          membership_count: memberCount?.count || 0,
          committee_count: committeeCount?.count || 0,
        });
      }
    }

    return Response.json({ duplicates });
  } catch (error) {
    console.error('Error fetching duplicates:', error);
    return Response.json(
      { error: 'Failed to fetch duplicates' },
      { status: 500 }
    );
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
    // Parse JSON body with size limit validation (max 1MB)
    const body = (await parseJsonBody<MergeRequest>(
      request,
      1_000_000
    )) as MergeRequest;
    const {
      keep_person_id,
      merge_person_ids,
      merge_strategy,
      deletion_mode = 'delete',
    } = body;

    if (!keep_person_id || !merge_person_ids || merge_person_ids.length === 0) {
      return Response.json(
        { error: 'Missing required fields: keep_person_id, merge_person_ids' },
        { status: 400 }
      );
    }

    // Validate that keep_person_id exists
    const keepPerson = await env.BETTERLB_DB.prepare(
      `SELECT id FROM persons WHERE id = ?1`
    )
      .bind(keep_person_id)
      .first();

    if (!keepPerson) {
      return Response.json({ error: 'Person not found' }, { status: 404 });
    }

    // Validate all merge_person_ids exist
    for (const id of merge_person_ids) {
      const person = await env.BETTERLB_DB.prepare(
        `SELECT id FROM persons WHERE id = ?1`
      )
        .bind(id)
        .first();
      if (!person) {
        return Response.json(
          { error: 'One or more persons to merge not found' },
          { status: 404 }
        );
      }
    }

    // Perform the merge in a transaction-like manner
    const updatedTables: MergeResult['updated_tables'] = {};
    const deleted_ids: string[] = [];
    const flagged_ids: string[] = [];

    // 1. Update memberships - change person_id to keep_person_id
    const memberUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE memberships SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    )
      .bind(keep_person_id, ...merge_person_ids)
      .run();

    updatedTables.memberships = memberUpdate.meta.changes || 0;

    // 2. Update document_authors
    const authorUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE document_authors SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    )
      .bind(keep_person_id, ...merge_person_ids)
      .run();

    updatedTables.document_authors = authorUpdate.meta.changes || 0;

    // 3. Update session_absences
    const absenceUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE session_absences SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    )
      .bind(keep_person_id, ...merge_person_ids)
      .run();

    updatedTables.session_absences = absenceUpdate.meta.changes || 0;

    // 4. Update committee_memberships
    const committeeUpdate = await env.BETTERLB_DB.prepare(
      `UPDATE committee_memberships SET person_id = ?1 WHERE person_id IN (${merge_person_ids.map(() => '?').join(',')})`
    )
      .bind(keep_person_id, ...merge_person_ids)
      .run();

    updatedTables.committee_memberships = committeeUpdate.meta.changes || 0;

    // 5. Detect and remove duplicate committee_memberships
    const committeeDuplicates = await env.BETTERLB_DB.prepare(
      `
      DELETE FROM committee_memberships
      WHERE id IN (
        SELECT cm2.id
        FROM committee_memberships cm1
        INNER JOIN committee_memberships cm2
          ON cm1.committee_id = cm2.committee_id
          AND cm1.term_id = cm2.term_id
          AND cm1.role = cm2.role
          AND cm1.person_id = cm2.person_id
          AND cm1.id < cm2.id
        WHERE cm1.person_id = ?1
      )
    `
    )
      .bind(keep_person_id)
      .run();
    updatedTables.committee_duplicates_removed =
      committeeDuplicates.meta.changes || 0;

    // 6. Detect and remove duplicate session_absences
    const absenceDuplicates = await env.BETTERLB_DB.prepare(
      `
      DELETE FROM session_absences
      WHERE id IN (
        SELECT sa2.id
        FROM session_absences sa1
        INNER JOIN session_absences sa2
          ON sa1.session_id = sa2.session_id
          AND sa1.person_id = sa2.person_id
          AND sa1.id < sa2.id
        WHERE sa1.person_id = ?1
      )
    `
    )
      .bind(keep_person_id)
      .run();
    updatedTables.absence_duplicates_removed =
      absenceDuplicates.meta.changes || 0;

    // 7. Detect and remove duplicate memberships
    const membershipDuplicates = await env.BETTERLB_DB.prepare(
      `
      DELETE FROM memberships
      WHERE id IN (
        SELECT m2.id
        FROM memberships m1
        INNER JOIN memberships m2
          ON m1.term_id = m2.term_id
          AND m1.person_id = m2.person_id
          AND m1.id < m2.id
        WHERE m1.person_id = ?1
      )
    `
    )
      .bind(keep_person_id)
      .run();
    updatedTables.membership_duplicates_removed =
      membershipDuplicates.meta.changes || 0;

    // 8. Handle deletion based on deletion_mode
    for (const id of merge_person_ids) {
      if (deletion_mode === 'delete') {
        // Immediate deletion
        await env.BETTERLB_DB.prepare(`DELETE FROM persons WHERE id = ?1`)
          .bind(id)
          .run();
        deleted_ids.push(id);
      } else if (deletion_mode === 'flag') {
        // Soft delete - set deleted_at timestamp
        await env.BETTERLB_DB.prepare(
          `UPDATE persons SET deleted_at = datetime('now') WHERE id = ?1`
        )
          .bind(id)
          .run();
        flagged_ids.push(id);
      }
      // 'skip' mode - don't touch the records
    }

    // 9. Log the merge action
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (action, performed_by, target_type, target_id, details, created_at)
       VALUES ('merge_persons', ?1, 'person', ?2, ?3, datetime('now'))`
    )
      .bind(
        auth.user.login,
        keep_person_id,
        JSON.stringify({
          merged_ids: merge_person_ids,
          strategy: merge_strategy,
          deletion_mode,
          updated_tables: updatedTables,
        })
      )
      .run();

    const result: MergeResult = {
      success: true,
      merged_count: merge_person_ids.length,
      updated_tables: updatedTables,
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
