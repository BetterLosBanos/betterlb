/**
 * Legislation Persons API
 * GET /api/legislation/persons - List all persons
 * GET /api/legislation/persons/:id - Get person details with memberships
 */

import { Env } from '../../types';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'persons';

  if (isDetailRequest) {
    return getPersonDetail(context);
  }

  return getPersonsList(context);
}

/**
 * GET /api/legislation/persons
 * Query parameters:
 * - term: sb_12 (filter by term membership)
 * - committee: xxx (filter by committee membership)
 * - limit, offset
 */
async function getPersonsList(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const termId = url.searchParams.get('term');
  const committeeId = url.searchParams.get('committee');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let sql = `
    SELECT DISTINCT p.id, p.first_name, p.middle_name, p.last_name
    FROM persons p
  `;

  const params: string[] = [];
  let paramIndex = 1;
  let hasJoins = false;

  if (termId) {
    sql += `
      JOIN memberships m ON p.id = m.person_id
    `;
    hasJoins = true;
  }

  if (committeeId) {
    sql += `
      JOIN committee_memberships cm ON p.id = cm.person_id
    `;
    hasJoins = true;
  }

  sql += ' WHERE 1=1';

  if (termId) {
    sql += ` AND m.term_id = ?${paramIndex++}`;
    params.push(termId);
  }

  if (committeeId) {
    sql += ` AND cm.committee_id = ?${paramIndex++}`;
    params.push(committeeId);
  }

  sql += ' ORDER BY p.last_name ASC LIMIT ?' + paramIndex++ + ' OFFSET ?' + paramIndex++;
  params.push(limit.toString(), offset.toString());

  try {
    const result = await env.DB.prepare(sql).bind(...params).all();

    return Response.json({
      persons: result.results,
      pagination: {
        limit,
        offset,
      },
    });
  } catch (error) {
    console.error('Error fetching persons:', error);
    return Response.json({ error: 'Failed to fetch persons' }, { status: 500 });
  }
}

/**
 * GET /api/legislation/persons/:id
 * Get person with memberships, committees, and authored documents
 */
async function getPersonDetail(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const personId = pathParts[3];

  // Get person
  const personSql = 'SELECT * FROM persons WHERE id = ?';
  const person = await env.DB.prepare(personSql).bind(personId).first();

  if (!person) {
    return Response.json({ error: 'Person not found' }, { status: 404 });
  }

  // Get memberships
  const membershipsSql = `
    SELECT m.id, m.term_id, m.chamber, m.role, m.rank,
           t.name as term_name, t.ordinal as term_ordinal,
           t.year_range, t.mayor, t.vice_mayor
    FROM memberships m
    JOIN terms t ON m.term_id = t.id
    WHERE m.person_id = ?
    ORDER BY t.term_number DESC
  `;
  const membershipsResult = await env.DB.prepare(membershipsSql).bind(personId).all();

  // Get committee memberships for each term
  for (const membership of membershipsResult.results) {
    const committeeSql = `
      SELECT c.id, c.name, c.type, cm.role
      FROM committee_memberships cm
      JOIN committees c ON cm.committee_id = c.id
      WHERE cm.person_id = ? AND cm.term_id = ?
      ORDER BY c.name ASC
    `;
    const committeeResult = await env.DB.prepare(committeeSql)
      .bind(personId, (membership as any).term_id)
      .all();
    (membership as any).committees = committeeResult.results;
  }

  // Get authored documents
  const documentsSql = `
    SELECT d.id, d.type, d.number, d.title, d.date_enacted, d.status,
           s.id as session_id, s.number as session_number, s.date as session_date
    FROM document_authors da
    JOIN documents d ON da.document_id = d.id
    LEFT JOIN sessions s ON d.session_id = s.id
    WHERE da.person_id = ?
    ORDER BY d.date_enacted DESC
    LIMIT 100
  `;
  const documentsResult = await env.DB.prepare(documentsSql).bind(personId).all();

  // Calculate attendance stats (absences only)
  const attendanceSql = `
    SELECT
      COUNT(DISTINCT s.id) as total_sessions,
      SUM(CASE WHEN sa.person_id IS NOT NULL THEN 1 ELSE 0 END) as absences
    FROM memberships m
    JOIN sessions s ON s.term_id = m.term_id
    LEFT JOIN session_absences sa ON sa.session_id = s.id AND sa.person_id = m.person_id
    WHERE m.person_id = ?
  `;
  const attendanceResult = await env.DB.prepare(attendanceSql).bind(personId).first<any>();

  const totalSessions = attendanceResult?.total_sessions || 0;
  const totalAbsences = attendanceResult?.absences || 0;

  return Response.json({
    ...person,
    memberships: membershipsResult.results,
    authored_documents: documentsResult.results,
    attendance_stats: {
      total_sessions: totalSessions,
      absences: totalAbsences,
      present: totalSessions - totalAbsences,
      attendance_rate: totalSessions > 0
        ? ((totalSessions - totalAbsences) / totalSessions * 100).toFixed(1)
        : null,
    },
  });
}
