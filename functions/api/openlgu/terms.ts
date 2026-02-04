/**
 * Legislation Terms API
 * GET /api/legislation/terms - List all terms
 * GET /api/legislation/terms/:id - Get term details with members
 */
import { Env } from '../../types';
import { cachedJson } from '../../utils/cache';
import { CACHE_TTL, createKVCache } from '../../utils/kv-cache';

interface TermResultRow {
  id: string;
  term_number: number;
  ordinal: number;
  name: string;
  start_date: string;
  end_date: string;
  year_range: string;
  mayor_id: string;
  vice_mayor_id: string;
  mayor_name: string;
  mayor_first_name: string;
  mayor_middle_name: string | null;
  mayor_last_name: string;
  vice_mayor_name: string;
  vice_mayor_first_name: string;
  vice_mayor_middle_name: string | null;
  vice_mayor_last_name: string;
  created_at: string;
}

interface MemberCountRow {
  term_id: string;
  count: number;
}

interface DocCountRow {
  term_id: string;
  count: number;
}

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
  const kvCache = createKVCache(env);
  const cacheKey = kvCache.termsKey();

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Get all terms with mayor/vice mayor info
        const termsSql = `
          SELECT
            t.id, t.term_number, t.ordinal, t.name, t.start_date, t.end_date, t.year_range,
            t.mayor_id, t.vice_mayor_id,
            pm.first_name || ' ' || pm.last_name as mayor_name,
            pm.first_name as mayor_first_name, pm.middle_name as mayor_middle_name, pm.last_name as mayor_last_name,
            pv.first_name || ' ' || pv.last_name as vice_mayor_name,
            pv.first_name as vice_mayor_first_name, pv.middle_name as vice_mayor_middle_name, pv.last_name as vice_mayor_last_name,
            t.created_at
          FROM terms t
          LEFT JOIN persons pm ON t.mayor_id = pm.id
          LEFT JOIN persons pv ON t.vice_mayor_id = pv.id
          ORDER BY t.term_number DESC
        `;
        const termsResult = await env.BETTERLB_DB.prepare(termsSql).all();

        if (termsResult.results.length === 0) {
          return { terms: [] };
        }

        // Get all term IDs for batch fetching counts (fixes N+1)
        const termIds = termsResult.results.map((t: TermResultRow) => t.id);

        // Single aggregated query for all term member counts
        const placeholders = termIds.map(() => '?').join(',');
        const memberCountsSql = `
          SELECT term_id, COUNT(DISTINCT person_id) as count
          FROM memberships
          WHERE term_id IN (${placeholders})
          GROUP BY term_id
        `;
        const memberCountsResult = await env.BETTERLB_DB.prepare(
          memberCountsSql
        )
          .bind(...termIds)
          .all<MemberCountRow>();

        const memberCountsMap = new Map<string, number>();
        for (const row of memberCountsResult.results) {
          memberCountsMap.set(row.term_id, row.count);
        }

        // Single aggregated query for all term document counts
        const docCountsSql = `
          SELECT s.term_id, COUNT(d.id) as count
          FROM documents d
          JOIN sessions s ON d.session_id = s.id
          WHERE s.term_id IN (${placeholders})
          GROUP BY s.term_id
        `;
        const docCountsResult = await env.BETTERLB_DB.prepare(docCountsSql)
          .bind(...termIds)
          .all<DocCountRow>();

        const docCountsMap = new Map<string, number>();
        for (const row of docCountsResult.results) {
          docCountsMap.set(row.term_id, row.count);
        }

        // Combine all data
        const terms = termsResult.results.map((term: TermResultRow) => ({
          id: term.id,
          term_number: term.term_number,
          ordinal: term.ordinal,
          name: term.name,
          start_date: term.start_date,
          end_date: term.end_date,
          year_range: term.year_range,
          executive: {
            mayor_id: term.mayor_id,
            mayor: term.mayor_name || term.mayor_id || 'TBD',
            vice_mayor_id: term.vice_mayor_id,
            vice_mayor: term.vice_mayor_name || term.vice_mayor_id || 'TBD',
          },
          member_count: memberCountsMap.get(term.id) || 0,
          document_count: docCountsMap.get(term.id) || 0,
          created_at: term.created_at,
        }));

        return { terms };
      },
      CACHE_TTL.static
    );

    return cachedJson(result, 'static');
  } catch (error) {
    console.error('Error fetching terms:', error);
    return cachedJson({ error: 'Failed to fetch terms' }, 'none', 500);
  }
}

interface TermDetailRow {
  id: string;
  term_number: number;
  ordinal: number;
  name: string;
  start_date: string;
  end_date: string;
  year_range: string;
  mayor_id: string;
  vice_mayor_id: string;
  mayor_first_name: string;
  mayor_middle_name: string | null;
  mayor_last_name: string;
  vice_mayor_first_name: string;
  vice_mayor_middle_name: string | null;
  vice_mayor_last_name: string;
  mayor: string;
  vice_mayor: string;
}

interface CommitteeResultRow {
  id: string;
  name: string;
  type: string;
  members: string;
}

interface StatsResultRow {
  total_sessions: number;
  regular_sessions: number;
  special_sessions: number;
  inaugural_sessions: number;
}

interface DocStatsResultRow {
  type: string;
  count: number;
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

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.termKey(termId);

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Get term with mayor and vice mayor details
        const termSql = `
          SELECT
            t.*,
            pm.id as mayor_person_id, pm.first_name as mayor_first_name, pm.middle_name as mayor_middle_name, pm.last_name as mayor_last_name,
            pv.id as vice_mayor_person_id, pv.first_name as vice_mayor_first_name, pv.middle_name as vice_mayor_middle_name, pv.last_name as vice_mayor_last_name
          FROM terms t
          LEFT JOIN persons pm ON t.mayor_id = pm.id
          LEFT JOIN persons pv ON t.vice_mayor_id = pv.id
          WHERE t.id = ?
        `;
        const term = await env.BETTERLB_DB.prepare(termSql)
          .bind(termId)
          .first<TermDetailRow>();

        if (!term) {
          return { error: 'Term not found' };
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
        const membersResult = await env.BETTERLB_DB.prepare(membersSql)
          .bind(termId)
          .all();

        // Reconstruct the frontend-expected structure: persons with memberships
        const personsMap = new Map<
          string,
          {
            id: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            memberships: Array<{
              term_id: string;
              chamber: string | null;
              role: string | null;
              rank: number | null;
              committees: Array<{ id: string; role: string }>;
            }>;
          }
        >();
        for (const row of membersResult.results) {
          const rowTyped = row as {
            id: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            chamber: string | null;
            m_role: string | null;
            rank: number | null;
            committee_id: string;
          };
          if (!personsMap.has(rowTyped.id)) {
            personsMap.set(rowTyped.id, {
              id: rowTyped.id,
              first_name: rowTyped.first_name,
              middle_name: rowTyped.middle_name,
              last_name: rowTyped.last_name,
              memberships: [
                {
                  term_id: termId,
                  chamber: rowTyped.chamber,
                  role: rowTyped.m_role,
                  rank: rowTyped.rank,
                  committees: [],
                },
              ],
            });
          }
          // Add committee if present
          if (rowTyped.committee_id) {
            const person = personsMap.get(rowTyped.id)!;
            const committeeRow = row as { committee_role: string };
            person.memberships[0].committees.push({
              id: rowTyped.committee_id,
              role: committeeRow.committee_role,
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
        const committeesResult = await env.BETTERLB_DB.prepare(committeesSql)
          .bind(termId)
          .all<CommitteeResultRow>();

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
        const statsResult = await env.BETTERLB_DB.prepare(statsSql)
          .bind(termId)
          .first<StatsResultRow>();

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
        const docStatsResult = await env.BETTERLB_DB.prepare(docStatsSql)
          .bind(termId)
          .all<DocStatsResultRow>();

        return {
          id: term.id,
          term_number: term.term_number,
          ordinal: term.ordinal,
          name: term.name,
          start_date: term.start_date,
          end_date: term.end_date,
          year_range: term.year_range,
          executive: {
            mayor_id: term.mayor_id,
            mayor: term.mayor_first_name
              ? `${term.mayor_first_name} ${term.mayor_middle_name || ''} ${term.mayor_last_name}`.trim()
              : term.mayor || 'TBD',
            vice_mayor_id: term.vice_mayor_id,
            vice_mayor: term.vice_mayor_first_name
              ? `${term.vice_mayor_first_name} ${term.vice_mayor_middle_name || ''} ${term.vice_mayor_last_name}`.trim()
              : term.vice_mayor || 'TBD',
          },
          persons, // Frontend expects persons array with memberships
          committees: committeesResult.results.map(c => ({
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
            documents: docStatsResult.results.reduce(
              (acc: Record<string, number>, doc: DocStatsResultRow) => {
                acc[doc.type] = doc.count;
                return acc;
              },
              {}
            ),
          },
        };
      },
      CACHE_TTL.detail
    );

    if ((result as { error?: string }).error === 'Term not found') {
      return cachedJson(result, 'none', 404);
    }

    return cachedJson(result, 'detail');
  } catch (error) {
    console.error('Error fetching term detail:', error);
    return cachedJson({ error: 'Failed to fetch term' }, 'none', 500);
  }
}
