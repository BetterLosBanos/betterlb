/**
 * Admin Terms API
 * GET /api/admin/terms - List all terms
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

async function handleListTerms(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  const limit = parseInt(url.searchParams.get('limit') || '50');

  try {
    const sql = `
      SELECT id, name, year_range, ordinal
      FROM terms
      ORDER BY ordinal DESC
      LIMIT ?1
    `;

    const result = await env.BETTERLB_DB.prepare(sql).bind(limit).all();

    return Response.json({
      terms: result.results,
    });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return Response.json({ error: 'Failed to fetch terms' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleListTerms);
