/**
 * Legislation Terms API
 * GET /api/legislation/terms - List all terms
 * GET /api/legislation/terms/:id - Get term details with members
 */

import { Env } from '../../types';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'terms';

  if (isDetailRequest) {
    return getTermDetail(context);
  }

  return getTermsList(context);
}

/**
 * GET /api/legislation/terms
 */
async function getTermsList(context: { request: Request; env: Env }) {
  const { env } = context;

  const sql = `
    SELECT
      id, term_number, ordinal, name, start_date, end_date, year_range,
      mayor, vice_mayor, created_at
    FROM terms
    ORDER BY term_number DESC
  `;

  try {
    const result = await env.DB.prepare(sql).all();

    // Get member count and document count for each term
    const terms = await Promise.all(
      result.results.map(async (term: any) => {
        const memberCountSql = `
          SELECT COUNT(DISTINCT person_id) as count
          FROM memberships
          WHERE term_id = ?
        `;
        const memberCount = await env.DB.prepare(memberCountSql)
          .bind(term.id)
          .first<{ count: number }>();

        const docCountSql = `
          SELECT COUNT(*) as count
          FROM documents d
          JOIN sessions s ON d.session_id = s.id
          WHERE s.term_id = ?
        `;
        const docCount = await env.DB.prepare(docCountSql)
          .bind(term.id)
          .first<{ count: number }>();

        return {
          ...term,
          executive: {
            mayor: term.mayor,
            vice_mayor: term.vice_mayor,
          },
          member_count: memberCount?.count || 0,
          document_count: docCount?.count || 0,
        };
      })
    );

    return Response.json({ terms });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return Response.json({ error: 'Failed to fetch terms' }, { status: 500 });
  }
}

/**
 * GET /api/legislation/terms/:id
 * Get term with all members and statistics
 */
async function getTermDetail(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const termId = pathParts[3];

  // Get term
  const termSql = 'SELECT * FROM terms WHERE id = ?';
  const term = await env.DB.prepare(termSql).bind(termId).first();

  if (!term) {
    return Response.json({ error: 'Term not found' }, { status: 404 });
  }

  // Get all members with their roles and committee memberships
  const membersSql = `
    SELECT
      p.id, p.first_name, p.middle_name, p.last_name,
      m.chamber, m.role as m_role, m.rank,
      c.id as committee_id, c.name as committee_name, c.type as committee_type,
      cm.role as committee_role
    FROM memberships m
    JOIN persons p ON m.person_id = p.id
    LEFT JOIN committee_memberships cm ON cm.person_id = p.id AND cm.term_id = m.term_id
    LEFT JOIN committees c ON c.id = cm.committee_id
    WHERE m.term_id = ?
    ORDER BY m.rank ASC, p.last_name ASC, c.name ASC
  `;
  const membersResult = await env.DB.prepare(membersSql).bind(termId).all();

  // Reconstruct the frontend-expected structure: persons with memberships
  const personsMap = new Map<string, any>();
  for (const row of membersResult.results) {
    if (!personsMap.has(row.id)) {
      personsMap.set(row.id, {
        id: row.id,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        memberships: [{
          term_id: termId,
          chamber: row.chamber,
          role: row.m_role,
          rank: row.rank,
          committees: [],
        }],
      });
    }
    // Add committee if present
    if (row.committee_id) {
      const person = personsMap.get(row.id);
      person.memberships[0].committees.push({
        id: row.committee_id,
        role: row.committee_role,
      });
    }
  }

  const persons = Array.from(personsMap.values());

  // Get committees for this term
  const committeesSql = `
    SELECT
      c.id, c.name, c.type,
      GROUP_CONCAT(
        p.first_name || ' ' || p.last_name || ' (' || cm.role || ')',
        ', '
      ) as members
    FROM committees c
    JOIN committee_memberships cm ON cm.committee_id = c.id
    JOIN persons p ON cm.person_id = p.id
    WHERE cm.term_id = ?
    GROUP BY c.id, c.name, c.type
    ORDER BY c.name ASC
  `;
  const committeesResult = await env.DB.prepare(committeesSql).bind(termId).all();

  // Get session statistics
  const statsSql = `
    SELECT
      COUNT(*) as total_sessions,
      SUM(CASE WHEN type = 'Regular' THEN 1 ELSE 0 END) as regular_sessions,
      SUM(CASE WHEN type = 'Special' THEN 1 ELSE 0 END) as special_sessions,
      SUM(CASE WHEN type = 'Inaugural' THEN 1 ELSE 0 END) as inaugural_sessions
    FROM sessions
    WHERE term_id = ?
  `;
  const statsResult = await env.DB.prepare(statsSql).bind(termId).first<any>();

  // Get document statistics
  const docStatsSql = `
    SELECT
      type,
      COUNT(*) as count
    FROM documents d
    JOIN sessions s ON d.session_id = s.id
    WHERE s.term_id = ?
    GROUP BY type
  `;
  const docStatsResult = await env.DB.prepare(docStatsSql).bind(termId).all();

  return Response.json({
    ...term,
    executive: {
      mayor: term.mayor,
      vice_mayor: term.vice_mayor,
    },
    persons, // Frontend expects persons array with memberships
    committees: committeesResult.results.map((c: any) => ({
      id: c.id,
      name: c.name,
      type: c.type,
      members: c.members?.split(', ') || [],
    })),
    statistics: {
      sessions: {
        total: statsResult?.total_sessions || 0,
        regular: statsResult?.regular_sessions || 0,
        special: statsResult?.special_sessions || 0,
        inaugural: statsResult?.inaugural_sessions || 0,
      },
      documents: docStatsResult.results.reduce((acc: any, doc: any) => {
        acc[doc.type] = doc.count;
        return acc;
      }, {}),
    },
  });
}
