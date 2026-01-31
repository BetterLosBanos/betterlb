/**
 * Legislation Sessions API
 * GET /api/legislation/sessions - List all sessions
 * GET /api/legislation/sessions/:id - Get session details with attendance
 */

import { Env } from '../../types';

interface Session {
  id: string;
  term_id: string;
  number: number;
  type: string;
  date: string;
  ordinal_number: string;
}

interface SessionWithAttendance extends Session {
  all_members: Array<{
    id: string;
    first_name: string;
    last_name: string;
    status: 'present' | 'absent';
    reason?: string;
  }>;
  absent_count: number;
  present_count: number;
  documents: Array<{
    id: string;
    type: string;
    number: string;
    title: string;
  }>;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'sessions';

  if (isDetailRequest) {
    return getSessionDetail(context);
  }

  return getSessionsList(context);
}

/**
 * GET /api/legislation/sessions
 * Query parameters:
 * - term: sb_12
 * - type: Regular|Special|Inaugural
 * - limit: number
 * - offset: number
 */
async function getSessionsList(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const termId = url.searchParams.get('term');
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let sql = 'SELECT * FROM sessions WHERE 1=1';
  const params: string[] = [];
  let paramIndex = 1;

  if (termId) {
    sql += ` AND term_id = ?${paramIndex++}`;
    params.push(termId);
  }

  if (type) {
    sql += ` AND type = ?${paramIndex++}`;
    params.push(type);
  }

  sql += ' ORDER BY date DESC, number DESC LIMIT ?' + paramIndex++ + ' OFFSET ?' + paramIndex++;
  params.push(limit.toString(), offset.toString());

  try {
    const result = await env.DB.prepare(sql).bind(...params).all();

    // Get count
    let countSql = 'SELECT COUNT(*) as count FROM sessions WHERE 1=1';
    let countParamIndex = 1;
    const countParams: string[] = [];

    if (termId) {
      countSql += ` AND term_id = ?${countParamIndex++}`;
      countParams.push(termId);
    }
    if (type) {
      countSql += ` AND type = ?${countParamIndex++}`;
      countParams.push(type);
    }

    const countResult = await env.DB.prepare(countSql).bind(...countParams).first<{ count: number }>();
    const total = countResult?.count || 0;

    return Response.json({
      sessions: result.results,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return Response.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

/**
 * GET /api/legislation/sessions/:id
 * Get session with attendance (absent-only model) and documents
 */
async function getSessionDetail(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const sessionId = pathParts[3];

  // Get session
  const sessionSql = 'SELECT * FROM sessions WHERE id = ?';
  const session = await env.DB.prepare(sessionSql).bind(sessionId).first<Session>();

  if (!session) {
    return Response.json({ error: 'Session not found' }, { status: 404 });
  }

  // Get all members for this term
  const membersSql = `
    SELECT p.id, p.first_name, p.middle_name, p.last_name, m.role, m.rank
    FROM memberships m
    JOIN persons p ON m.person_id = p.id
    WHERE m.term_id = ?
    ORDER BY m.rank ASC, p.last_name ASC
  `;
  const membersResult = await env.DB.prepare(membersSql).bind(session.term_id).all();

  // Get absences for this session
  const absencesSql = `
    SELECT person_id, reason
    FROM session_absences
    WHERE session_id = ?
  `;
  const absencesResult = await env.DB.prepare(absencesSql).bind(sessionId).all();
  const absentIds = new Set(absencesResult.results.map((r: any) => r.person_id));

  // Build attendance list (absent-only model)
  const all_members = membersResult.results.map((member: any) => ({
    id: member.id,
    first_name: member.first_name,
    middle_name: member.middle_name,
    last_name: member.last_name,
    role: member.role,
    rank: member.rank,
    status: absentIds.has(member.id) ? 'absent' as const : 'present' as const,
    reason: absentIds.has(member.id)
      ? absencesResult.results.find((r: any) => r.person_id === member.id)?.reason
      : undefined,
  }));

  // Get documents for this session
  const documentsSql = `
    SELECT id, type, number, title, status
    FROM documents
    WHERE session_id = ?
    ORDER BY date_enacted ASC
  `;
  const documentsResult = await env.DB.prepare(documentsSql).bind(sessionId).all();

  return Response.json({
    ...session,
    all_members,
    absent_count: absentIds.size,
    present_count: all_members.length - absentIds.size,
    documents: documentsResult.results,
  });
}
