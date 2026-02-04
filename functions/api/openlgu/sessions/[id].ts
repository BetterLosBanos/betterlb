/**
 * Legislation Session Detail API
 * GET /api/legislation/sessions/:id - Get session details with attendance
 */
import { Env } from '../../../types';

interface Session {
  id: string;
  term_id: string;
  number: number;
  type: string;
  date: string;
  ordinal_number: string;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const sessionId = pathParts[pathParts.length - 1]; // Get last path segment as session ID

  // Get session
  const sessionSql = 'SELECT * FROM sessions WHERE id = ?';
  const session = await env.BETTERLB_DB.prepare(sessionSql)
    .bind(sessionId)
    .first<Session>();

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
  const membersResult = await env.BETTERLB_DB.prepare(membersSql)
    .bind(session.term_id)
    .all();

  // Get absences for this session
  const absencesSql = `
    SELECT person_id, reason
    FROM session_absences
    WHERE session_id = ?
  `;
  const absencesResult = await env.BETTERLB_DB.prepare(absencesSql)
    .bind(sessionId)
    .all();
  const absentIds = new Set(
    absencesResult.results.map((r: any) => r.person_id)
  );

  // Build attendance list (absent-only model)
  const all_members = membersResult.results.map((member: any) => ({
    id: member.id,
    first_name: member.first_name,
    middle_name: member.middle_name,
    last_name: member.last_name,
    role: member.role,
    rank: member.rank,
    status: absentIds.has(member.id)
      ? ('absent' as const)
      : ('present' as const),
    reason: absentIds.has(member.id)
      ? absencesResult.results.find((r: any) => r.person_id === member.id)
          ?.reason
      : undefined,
  }));

  // Get documents for this session
  const documentsSql = `
    SELECT id, type, number, title, status
    FROM documents
    WHERE session_id = ?
    ORDER BY date_enacted ASC
  `;
  const documentsResult = await env.BETTERLB_DB.prepare(documentsSql)
    .bind(sessionId)
    .all();

  return Response.json({
    ...session,
    all_members,
    absent_count: absentIds.size,
    present_count: all_members.length - absentIds.size,
    documents: documentsResult.results,
  });
}
