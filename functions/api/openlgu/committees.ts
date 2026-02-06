/**
 * Legislation Committees API
 * GET /api/legislation/committees - List all committees
 */
import { Env } from '../../types';
import { cachedJson } from '../../utils/cache';
import { CACHE_TTL, createKVCache } from '../../utils/kv-cache';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);

  const termId = url.searchParams.get('term');

  const kvCache = createKVCache(env);
  const cacheKey = kvCache.committeesKey({ term: termId || undefined });

  try {
    const result = await kvCache.get(
      cacheKey,
      async () => {
        // Get committees
        let sql = 'SELECT DISTINCT c.id, c.name, c.type FROM committees c';
        const params: string[] = [];

        if (termId) {
          sql +=
            ' JOIN committee_memberships cm ON cm.committee_id = c.id WHERE cm.term_id = ?';
          params.push(termId);
        }

        sql += ' ORDER BY c.name ASC';

        const committeesResult = await env.BETTERLB_DB.prepare(sql)
          .bind(...params)
          .all();

        // Get all committee IDs for batch fetching members
        const committeeIds = committeesResult.results.map(
          (c: { id: string }) => c.id
        );

        if (committeeIds.length === 0) {
          return { committees: [] };
        }

        // Single query to fetch all members for all committees (fixes N+1)
        const placeholders = committeeIds.map(() => '?').join(',');
        let membersSql = `
          SELECT
            cm.committee_id,
            p.id, p.first_name, p.middle_name, p.last_name,
            cm.term_id, cm.role
          FROM committee_memberships cm
          JOIN persons p ON cm.person_id = p.id
          WHERE cm.committee_id IN (${placeholders})
        `;

        const membersParams: string[] = [...committeeIds];

        if (termId) {
          membersSql += ' AND cm.term_id = ?';
          membersParams.push(termId);
        }

        membersSql +=
          ' ORDER BY cm.committee_id, cm.term_id DESC, p.last_name ASC';

        const membersResult = await env.BETTERLB_DB.prepare(membersSql)
          .bind(...membersParams)
          .all();

        // Group members by committee_id
        const membersByCommittee = new Map<
          string,
          Array<{
            id: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            term_id: string;
            role: string;
          }>
        >();
        for (const member of membersResult.results) {
          const memberRow = member as {
            committee_id: string;
            id: string;
            first_name: string;
            middle_name: string | null;
            last_name: string;
            term_id: string;
            role: string;
          };
          const { committee_id, ...memberData } = memberRow;
          if (!membersByCommittee.has(committee_id)) {
            membersByCommittee.set(committee_id, []);
          }
          membersByCommittee.get(committee_id)!.push(memberData);
        }

        // Combine committees with their members
        const committees = committeesResult.results.map(
          (committee: { id: string; name: string; type: string }) => ({
            ...committee,
            members: membersByCommittee.get(committee.id) || [],
          })
        );

        return { committees };
      },
      termId ? CACHE_TTL.detail : CACHE_TTL.list // Shorter TTL when filtered by term
    );

    return cachedJson(result, termId ? 'detail' : 'list');
  } catch (error) {
    console.error('Error fetching committees:', error);
    return cachedJson({ error: 'Failed to fetch committees' }, 'none', 500);
  }
}
