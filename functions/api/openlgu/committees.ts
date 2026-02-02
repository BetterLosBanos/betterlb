/**
 * Legislation Committees API
 * GET /api/legislation/committees - List all committees
 */

import { Env } from '../../types';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);

  const termId = url.searchParams.get('term');

  let sql = 'SELECT DISTINCT c.id, c.name, c.type FROM committees c';
  const params: string[] = [];

  if (termId) {
    sql += ' JOIN committee_memberships cm ON cm.committee_id = c.id WHERE cm.term_id = ?';
    params.push(termId);
  }

  sql += ' ORDER BY c.name ASC';

  try {
    const result = await env.BETTERLB_DB.prepare(sql).bind(...params).all();

    // Get members for each committee
    const committees = await Promise.all(
      result.results.map(async (committee: any) => {
        const membersSql = `
          SELECT
            p.id, p.first_name, p.middle_name, p.last_name,
            cm.term_id, cm.role
          FROM committee_memberships cm
          JOIN persons p ON cm.person_id = p.id
          WHERE cm.committee_id = ?
          ${termId ? 'AND cm.term_id = ?' : ''}
          ORDER BY cm.term_id DESC, p.last_name ASC
        `;

        const membersParams: (string | null)[] = [committee.id];
        if (termId) {
          membersParams.push(termId);
        }

        const membersResult = await env.BETTERLB_DB.prepare(membersSql).bind(...membersParams).all();

        return {
          ...committee,
          members: membersResult.results,
        };
      })
    );

    return Response.json({ committees });
  } catch (error) {
    console.error('Error fetching committees:', error);
    return Response.json({ error: 'Failed to fetch committees' }, { status: 500 });
  }
}
