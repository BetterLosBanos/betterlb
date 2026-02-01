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
  const limit = parseInt(url.searchParams.get('limit') || '1000');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  let sql = `
    SELECT s.*, t.term_number
    FROM sessions s
    LEFT JOIN terms t ON s.term_id = t.id
    WHERE 1=1
  `;
  const params: string[] = [];
  let paramIndex = 1;

  if (termId) {
    sql += ` AND s.term_id = ?${paramIndex++}`;
    params.push(termId);
  }

  if (type) {
    sql += ` AND s.type = ?${paramIndex++}`;
    params.push(type);
  }

  sql += ' ORDER BY t.term_number DESC, s.date DESC, s.number DESC LIMIT ?' + paramIndex++ + ' OFFSET ?' + paramIndex++;
  params.push(limit.toString(), offset.toString());

  try {
    const result = await env.BETTERLB_DB.prepare(sql).bind(...params).all();

    // Get all session IDs to fetch attendance data
    const sessionIds = result.results.map((r: any) => r.id).filter(Boolean);

    // Get absences for all sessions
    let presentData: any[] = [];
    let absentData: any[] = [];

    if (sessionIds.length > 0) {
      // Get absences from session_absences table
      const placeholders = sessionIds.map(() => '?').join(',');
      const absencesSql = `
        SELECT session_id, person_id
        FROM session_absences
        WHERE session_id IN (${placeholders})
      `;
      const absencesResult = await env.BETTERLB_DB.prepare(absencesSql).bind(...sessionIds).all();

      const absentSet = new Map<string, string[]>(); // session_id -> array of person_ids
      for (const row of absencesResult.results) {
        if (!absentSet.has(row.session_id)) {
          absentSet.set(row.session_id, []);
        }
        absentSet.get(row.session_id)!.push(row.person_id);
      }

      // Get term memberships to build present lists
      const termIds = result.results.map((r: any) => r.term_id).filter((v, i, a) => a.indexOf(v) === i);
      if (termIds.length > 0) {
        const termPlaceholders = termIds.map(() => '?').join(',');
        const membershipsSql = `
          SELECT m.person_id, m.term_id
          FROM memberships m
          WHERE m.term_id IN (${termPlaceholders})
        `;
        const membershipsResult = await env.BETTERLB_DB.prepare(membershipsSql).bind(...termIds).all();

        // Group memberships by term
        const termMembersMap = new Map<string, string[]>();
        for (const row of membershipsResult.results) {
          if (!termMembersMap.has(row.term_id)) {
            termMembersMap.set(row.term_id, []);
          }
          termMembersMap.get(row.term_id)!.push(row.person_id);
        }

        // Build present/absent arrays for each session
        for (const session of result.results) {
          const termMembers = termMembersMap.get(session.term_id) || [];
          const absentIds = absentSet.get(session.id) || [];
          const presentIds = termMembers.filter(id => !absentIds.includes(id));

          presentData.push({
            session_id: session.id,
            present: presentIds,
          });
          absentData.push({
            session_id: session.id,
            absent: absentIds,
          });
        }
      }
    }

    // Combine session data with attendance
    const sessions = result.results.map((session: any) => {
      const presentEntry = presentData.find(p => p.session_id === session.id);
      const absentEntry = absentData.find(a => a.session_id === session.id);

      return {
        ...session,
        present: presentEntry?.present || [],
        absent: absentEntry?.absent || [],
      };
    });

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

    const countResult = await env.BETTERLB_DB.prepare(countSql).bind(...countParams).first<{ count: number }>();
    const total = countResult?.count || 0;

    return Response.json({
      sessions,
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
  const session = await env.BETTERLB_DB.prepare(sessionSql).bind(sessionId).first<Session>();

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
  const membersResult = await env.BETTERLB_DB.prepare(membersSql).bind(session.term_id).all();

  // Get absences for this session
  const absencesSql = `
    SELECT person_id, reason
    FROM session_absences
    WHERE session_id = ?
  `;
  const absencesResult = await env.BETTERLB_DB.prepare(absencesSql).bind(sessionId).all();
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
  const documentsResult = await env.BETTERLB_DB.prepare(documentsSql).bind(sessionId).all();

  return Response.json({
    ...session,
    all_members,
    absent_count: absentIds.size,
    present_count: all_members.length - absentIds.size,
    documents: documentsResult.results,
  });
}
