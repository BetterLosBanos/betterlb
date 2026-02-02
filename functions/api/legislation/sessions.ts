/**
 * Legislation Sessions API
 * GET /api/legislation/sessions - List all sessions
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

export async function onRequestGet(context: { request: Request; env: Env }) {
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

    // Initialize data arrays
    const presentData: any[] = [];
    const absentData: any[] = [];

    if (sessionIds.length > 0) {
      console.log(`Processing ${sessionIds.length} sessions`);
      
      // SQLite has a limit of 999 variables per query
      // Use a conservative batch size to stay well under the limit
      const BATCH_SIZE = 200;
      const absentSet = new Map<string, string[]>();
      
      // Process absences in batches
      for (let i = 0; i < sessionIds.length; i += BATCH_SIZE) {
        const batch = sessionIds.slice(i, i + BATCH_SIZE);
        const placeholders = batch.map((_, idx) => `?${idx + 1}`).join(',');
        
        const absencesSql = `
          SELECT session_id, person_id
          FROM session_absences
          WHERE session_id IN (${placeholders})
        `;
        
        const absencesResult = await env.BETTERLB_DB.prepare(absencesSql).bind(...batch).all();

        for (const row of absencesResult.results) {
          if (!absentSet.has(row.session_id)) {
            absentSet.set(row.session_id, []);
          }
          absentSet.get(row.session_id)!.push(row.person_id);
        }
      }

      // Get unique term IDs
      const termIds = [...new Set(result.results.map((r: any) => r.term_id).filter(Boolean))];
      
      if (termIds.length > 0) {
        // Build memberships map
        const termMembersMap = new Map<string, string[]>();
        
        // Process term memberships
        for (const tid of termIds) {
          const membershipsSql = `
            SELECT person_id, term_id
            FROM memberships
            WHERE term_id = ?1
          `;
          const membershipsResult = await env.BETTERLB_DB.prepare(membershipsSql).bind(tid).all();
          
          if (!termMembersMap.has(tid)) {
            termMembersMap.set(tid, []);
          }
          
          for (const row of membershipsResult.results) {
            termMembersMap.get(tid)!.push(row.person_id);
          }
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
