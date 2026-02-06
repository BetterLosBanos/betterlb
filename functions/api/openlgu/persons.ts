/**
 * Legislation Persons API
 * GET /api/legislation/persons - List all persons
 * GET /api/legislation/persons/:id - Get person details with memberships
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
  const url = new URL(context.request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);
  const isDetailRequest = pathParts.length > 3 && pathParts[3] !== 'persons';

  if (isDetailRequest) {
    return getPersonDetail(context);
  }

  return getPersonsList(context);
}

interface PersonResultRow {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  aliases: string | null;
  membership_id: string | null;
  term_id: string | null;
  chamber: string | null;
  role: string | null;
  rank: number | null;
  term_number: number | null;
  term_ordinal: number | null;
  term_name: string | null;
  year_range: string | null;
  term_start: string | null;
  term_end: string | null;
}

interface CommitteeMembershipRow {
  person_id: string;
  term_id: string;
  committee_id: string;
  committee_name: string;
  committee_role: string;
  committee_type: string;
}

/**
 * GET /api/legislation/persons
 * Query parameters:
 * - term: sb_12 (filter by term membership)
 * - committee: xxx (filter by committee membership)
 * - limit, offset
 */
async function getPersonsList(context: { request: Request; env: Env }) {
  const { env, request } = context;
  const url = new URL(context.request.url);

  // Apply rate limiting - 100 requests per minute per client
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(
    env.WEATHER_KV,
    `api:persons:${clientId}`,
    {
      limit: 100,
      window: 60,
    }
  );

  if (!rateLimitResult.allowed) {
    return createRateLimitResponse(rateLimitResult);
  }

  const termId = url.searchParams.get('term');
  const committeeId = url.searchParams.get('committee');
  const limit = parseInt(url.searchParams.get('limit') || '100');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.personsKey({
    term: termId || undefined,
    committee: committeeId || undefined,
    limit,
    offset,
  });

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Get persons with their memberships
        let sql = `
          SELECT DISTINCT
            p.id, p.first_name, p.middle_name, p.last_name, p.suffix, p.aliases,
            m.id as membership_id, m.term_id, m.chamber, m.role, m.rank,
            t.term_number, t.ordinal as term_ordinal, t.name as term_name,
            t.year_range, t.start_date as term_start, t.end_date as term_end
          FROM persons p
          LEFT JOIN memberships m ON p.id = m.person_id
          LEFT JOIN terms t ON m.term_id = t.id
          WHERE 1=1
        `;

        const params: string[] = [];
        let paramIndex = 1;

        if (termId) {
          sql += ` AND m.term_id = ?${paramIndex++}`;
          params.push(termId);
        }

        if (committeeId) {
          sql += ` AND p.id IN (
            SELECT cm.person_id FROM committee_memberships cm WHERE cm.committee_id = ?${paramIndex++}
          )`;
          params.push(committeeId);
        }

        sql += ' ORDER BY t.term_number DESC, p.last_name ASC LIMIT ? OFFSET ?';
        params.push(limit.toString(), offset.toString());

        const result = await env.BETTERLB_DB.prepare(sql)
          .bind(...params)
          .all();

        // Get committee memberships for all persons
        const personIds = result.results
          .map((r: PersonResultRow) => r.id)
          .filter((v, i, a) => a.indexOf(v) === i);

        let committeeMemberships: CommitteeMembershipRow[] = [];
        if (personIds.length > 0) {
          const placeholders = personIds.map(() => '?').join(',');
          const committeeSql = `
            SELECT cm.person_id, cm.term_id, cm.committee_id, c.name as committee_name,
                   cm.role as committee_role, c.type as committee_type
            FROM committee_memberships cm
            JOIN committees c ON cm.committee_id = c.id
            WHERE cm.person_id IN (${placeholders})
            ORDER BY cm.term_id, c.name ASC
          `;
          const committeeResult = await env.BETTERLB_DB.prepare(committeeSql)
            .bind(...personIds)
            .all<CommitteeMembershipRow>();
          committeeMemberships = committeeResult.results;
        }

        // Group by person and structure the response
        const personsMap = new Map<
          string,
          {
            id: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            suffix: string | null;
            aliases: string[] | null;
            memberships: Array<{
              term_id: string;
              chamber: string | null;
              role: string | null;
              rank: number | null;
              term?: {
                id: string;
                term_number: number | null;
                ordinal: number | null;
                name: string | null;
                year_range: string | null;
                start_date: string | null;
                end_date: string | null;
              };
              committees: Array<{ id: string; role: string }>;
            }>;
            roles: string[];
          }
        >();

        for (const row of result.results) {
          const personId = row.id;

          if (!personsMap.has(personId)) {
            // Parse aliases safely
            let aliases: string[] | null = null;
            if (row.aliases) {
              try {
                const parsed = JSON.parse(row.aliases);
                if (Array.isArray(parsed)) {
                  aliases = parsed;
                } else {
                  console.error(
                    `Person ${row.id} aliases is not an array:`,
                    typeof parsed
                  );
                }
              } catch (error) {
                console.error(
                  `Failed to parse person ${row.id} aliases:`,
                  error
                );
              }
            }

            personsMap.set(personId, {
              id: row.id,
              first_name: row.first_name,
              middle_name: row.middle_name,
              last_name: row.last_name,
              suffix: row.suffix,
              aliases,
              memberships: [],
              roles: [],
            });
          }

          const person = personsMap.get(personId)!;

          // Add membership if exists
          if (row.membership_id) {
            const membership: {
              term_id: string;
              chamber: string | null;
              role: string | null;
              rank: number | null;
              committees: Array<{ id: string; role: string }>;
              term?: {
                id: string;
                term_number: number | null;
                ordinal: number | null;
                name: string | null;
                year_range: string | null;
                start_date: string | null;
                end_date: string | null;
              };
            } = {
              term_id: row.term_id!,
              chamber: row.chamber,
              role: row.role,
              rank: row.rank,
              committees: [],
            };

            // Add term info to membership
            if (row.term_id) {
              membership.term = {
                id: row.term_id,
                term_number: row.term_number,
                ordinal: row.term_ordinal,
                name: row.term_name,
                year_range: row.year_range,
                start_date: row.term_start,
                end_date: row.term_end,
              };
            }

            person.memberships.push(membership);

            // Add role if not already present
            if (row.role && !person.roles.includes(row.role)) {
              person.roles.push(row.role);
            }
          }
        }

        // Add committee memberships to each membership
        for (const personId of personsMap.keys()) {
          const person = personsMap.get(personId)!;
          for (const membership of person.memberships) {
            const termCommittees = committeeMemberships.filter(
              cm =>
                cm.person_id === personId && cm.term_id === membership.term_id
            );
            membership.committees = termCommittees.map(cm => ({
              id: cm.committee_id,
              role: cm.committee_role,
            }));
          }
        }

        const persons = Array.from(personsMap.values());

        // Get total count
        let countSql = 'SELECT COUNT(DISTINCT p.id) as count FROM persons p';
        const countParams: string[] = [];
        let countParamIndex = 1;

        if (termId) {
          countSql += ' JOIN memberships m ON p.id = m.person_id';
        }
        if (committeeId) {
          countSql += ` AND p.id IN (
            SELECT cm.person_id FROM committee_memberships cm WHERE cm.committee_id = ?${countParamIndex++}
          )`;
          countParams.push(committeeId);
        }
        if (termId) {
          countSql += ` AND m.term_id = ?${countParamIndex++}`;
          countParams.push(termId);
        }

        const countResult = await env.BETTERLB_DB.prepare(countSql)
          .bind(...countParams)
          .first<{ count: number }>();
        const total = countResult?.count || 0;

        return {
          persons,
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
    console.error('Error fetching persons:', error);
    return cachedJson({ error: 'Failed to fetch persons' }, 'none', 500);
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

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.personKey(personId);

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Get person
        const personSql = 'SELECT * FROM persons WHERE id = ?';
        const person = await env.BETTERLB_DB.prepare(personSql)
          .bind(personId)
          .first();

        if (!person) {
          return { error: 'Person not found' };
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
        const membershipsResult = await env.BETTERLB_DB.prepare(membershipsSql)
          .bind(personId)
          .all();

        // Get all term IDs for batch fetching committee memberships (fixes N+1)
        const termIds = membershipsResult.results
          .map((m: { term_id: string }) => m.term_id)
          .filter(Boolean);

        // Fetch all committee memberships in a single query
        const committeeMembershipsByTerm = new Map<
          string,
          Array<{
            id: string;
            name: string;
            type: string;
            role: string;
          }>
        >();
        if (termIds.length > 0) {
          const placeholders = termIds.map(() => '?').join(',');
          const committeeSql = `
            SELECT cm.term_id, c.id, c.name, c.type, cm.role
            FROM committee_memberships cm
            JOIN committees c ON cm.committee_id = c.id
            WHERE cm.person_id = ? AND cm.term_id IN (${placeholders})
            ORDER BY cm.term_id, c.name ASC
          `;
          const committeeResult = await env.BETTERLB_DB.prepare(committeeSql)
            .bind(personId, ...termIds)
            .all();

          interface CommitteeRow {
            term_id: string;
            id: string;
            name: string;
            type: string;
            role: string;
          }

          // Group by term_id
          for (const row of committeeResult.results) {
            const committeeRow = row as CommitteeRow;
            if (!committeeMembershipsByTerm.has(committeeRow.term_id)) {
              committeeMembershipsByTerm.set(committeeRow.term_id, []);
            }
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { term_id, ...committeeData } = committeeRow;
            committeeMembershipsByTerm
              .get(committeeRow.term_id)!
              .push(committeeData);
          }
        }

        // Assign committee memberships to each membership
        for (const membership of membershipsResult.results) {
          const membershipTermId = (membership as { term_id: string }).term_id;
          (membership as { committees: unknown[] }).committees =
            committeeMembershipsByTerm.get(membershipTermId) || [];
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
        const documentsResult = await env.BETTERLB_DB.prepare(documentsSql)
          .bind(personId)
          .all();

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
        const attendanceResult = await env.BETTERLB_DB.prepare(attendanceSql)
          .bind(personId)
          .first<{
            total_sessions: number;
            absences: number;
          }>();

        const totalSessions = attendanceResult?.total_sessions || 0;
        const totalAbsences = attendanceResult?.absences || 0;

        return {
          ...person,
          memberships: membershipsResult.results,
          authored_documents: documentsResult.results,
          attendance_stats: {
            total_sessions: totalSessions,
            absences: totalAbsences,
            present: totalSessions - totalAbsences,
            attendance_rate:
              totalSessions > 0
                ? (
                    ((totalSessions - totalAbsences) / totalSessions) *
                    100
                  ).toFixed(1)
                : null,
          },
        };
      },
      CACHE_TTL.detail
    );

    if ((result as { error?: string }).error === 'Person not found') {
      return cachedJson(result, 'none', 404);
    }

    return cachedJson(result, 'detail');
  } catch (error) {
    console.error('Error fetching person detail:', error);
    return cachedJson({ error: 'Failed to fetch person' }, 'none', 500);
  }
}
