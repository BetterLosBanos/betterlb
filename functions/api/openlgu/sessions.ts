/**
 * Legislation Sessions API
 * GET /api/legislation/sessions - List all sessions
 */
import { Env } from '../../types';
import { cachedJson } from '../../utils/cache';
import { CACHE_TTL, createKVCache } from '../../utils/kv-cache';
import {
  checkRateLimit,
  createRateLimitResponse,
  getClientIdentifier,
} from '../../utils/rate-limit';

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
  const { env, request } = context;
  const url = new URL(context.request.url);

  // Apply rate limiting - 100 requests per minute per client
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(
    env.WEATHER_KV,
    `api:sessions:${clientId}`,
    {
      limit: 100,
      window: 60,
    }
  );

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  const termId = url.searchParams.get('term');
  const type = url.searchParams.get('type');
  const limit = parseInt(url.searchParams.get('limit') || '1000');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.sessionsKey({
    term: termId || undefined,
    type: type || undefined,
    limit,
    offset,
  });

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
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

        sql +=
          ' ORDER BY t.term_number DESC, s.date DESC, s.number DESC LIMIT ? OFFSET ?';
        params.push(limit.toString(), offset.toString());

        const result = await env.BETTERLB_DB.prepare(sql)
          .bind(...params)
          .all();

        // Get all session IDs to fetch attendance data
        const sessionIds = result.results
          .map((r: { id: string }) => r.id)
          .filter(Boolean);

        // Initialize data arrays
        const presentData: Array<{ session_id: string; present: string[] }> =
          [];
        const absentData: Array<{ session_id: string; absent: string[] }> = [];

        if (sessionIds.length > 0) {
          // SQLite has a limit of 999 variables per query
          // Use a conservative batch size to stay under the limit
          const BATCH_SIZE = 100;
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

            const absencesResult = await env.BETTERLB_DB.prepare(absencesSql)
              .bind(...batch)
              .all();

            for (const row of absencesResult.results) {
              const rowTyped = row as { session_id: string; person_id: string };
              if (!absentSet.has(rowTyped.session_id)) {
                absentSet.set(rowTyped.session_id, []);
              }
              absentSet.get(rowTyped.session_id)!.push(rowTyped.person_id);
            }
          }

          // Get unique term IDs and batch fetch memberships (optimization)
          const termIds = [
            ...new Set(
              result.results
                .map((r: { term_id: string }) => r.term_id)
                .filter(Boolean)
            ),
          ];

          if (termIds.length > 0) {
            // Single query to get all memberships for all terms
            const placeholders = termIds.map(() => '?').join(',');
            const membershipsSql = `
              SELECT person_id, term_id
              FROM memberships
              WHERE term_id IN (${placeholders})
            `;
            const membershipsResult = await env.BETTERLB_DB.prepare(
              membershipsSql
            )
              .bind(...termIds)
              .all();

            // Build memberships map
            const termMembersMap = new Map<string, string[]>();
            for (const row of membershipsResult.results) {
              const rowTyped = row as { person_id: string; term_id: string };
              const tid = rowTyped.term_id;
              if (!termMembersMap.has(tid)) {
                termMembersMap.set(tid, []);
              }
              termMembersMap.get(tid)!.push(rowTyped.person_id);
            }

            // Build present/absent arrays for each session
            for (const session of result.results) {
              const sessionTyped = session as { term_id: string; id: string };
              const termMembers =
                termMembersMap.get(sessionTyped.term_id) || [];
              const absentIds = absentSet.get(sessionTyped.id) || [];
              const presentIds = termMembers.filter(
                id => !absentIds.includes(id)
              );

              presentData.push({
                session_id: sessionTyped.id,
                present: presentIds,
              });
              absentData.push({
                session_id: sessionTyped.id,
                absent: absentIds,
              });
            }
          }
        }

        // Combine session data with attendance
        const sessions = result.results.map(
          (session: { id: string; [key: string]: unknown }) => {
            const presentEntry = presentData.find(
              p => p.session_id === session.id
            );
            const absentEntry = absentData.find(
              a => a.session_id === session.id
            );

            return {
              ...session,
              present: presentEntry?.present || [],
              absent: absentEntry?.absent || [],
            };
          }
        );

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

        const countResult = await env.BETTERLB_DB.prepare(countSql)
          .bind(...countParams)
          .first<{ count: number }>();
        const total = countResult?.count || 0;

        return {
          sessions,
          pagination: {
            total,
            limit,
            offset,
            has_more: offset + limit < total,
          },
        };
      },
      CACHE_TTL.list
    );

    return cachedJson(result, 'list');
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return cachedJson({ error: 'Failed to fetch sessions' }, 'none', 500);
  }
}
