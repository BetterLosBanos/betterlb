/**
 * Admin Terms API
 * GET /api/admin/terms/:id/members - Get members for a term
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

interface TermMember {
  id: string;
  person_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  role: string | null;
  chamber: string | null;
}

/**
 * GET /api/admin/terms/:id/members
 * Get all members for a specific term
 */
async function handleGetTermMembers(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { env, params } = context;
  const termId = params.id;

  try {
    const membersResult = await env.BETTERLB_DB.prepare(
      `SELECT
        m.id,
        m.person_id,
        p.first_name,
        p.middle_name,
        p.last_name,
        p.suffix,
        m.role,
        m.chamber
       FROM memberships m
       JOIN persons p ON m.person_id = p.id
       WHERE m.term_id = ?1
       ORDER BY p.last_name, p.first_name`
    )
      .bind(termId)
      .all();

    const members: TermMember[] = membersResult.results.map((row: any) => ({
      id: row.id,
      person_id: row.person_id,
      first_name: row.first_name,
      middle_name: row.middle_name,
      last_name: row.last_name,
      suffix: row.suffix,
      role: row.role,
      chamber: row.chamber,
    }));

    return Response.json({
      term_id: termId,
      members,
      count: members.length,
    });
  } catch (error) {
    console.error('Error fetching term members:', error);
    return Response.json(
      { error: 'Failed to fetch term members' },
      { status: 500 }
    );
  }
}

export const onRequestGet = (context: { request: Request; env: Env }) =>
  withAuth(handleGetTermMembers as any)(context as any);
