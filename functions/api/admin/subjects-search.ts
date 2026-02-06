/**
 * Admin Subject Search API
 * GET /api/admin/subjects-search - Search for subjects by name
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface Subject {
  id: string;
  name: string;
  slug: string;
}

interface SearchResponse {
  subjects: Subject[];
}

/**
 * GET /api/admin/subjects-search?q=budget
 * Returns list of matching subjects
 */
async function handleSearch(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';

    if (query.length < 2) {
      return Response.json({ subjects: [] });
    }

    const searchPattern = `%${query}%`;

    // Search by name or slug
    const sql = `
      SELECT id, name, slug
      FROM subjects
      WHERE name LIKE ?1 OR slug LIKE ?2
      ORDER BY name
      LIMIT 20
    `;

    const results = await env.BETTERLB_DB.prepare(sql)
      .bind(searchPattern, searchPattern)
      .all();

    const subjects: Subject[] = (
      results.results as Array<{ id: string; name: string; slug: string }>
    ).map(row => ({
      id: row.id,
      name: row.name,
      slug: row.slug,
    }));

    return Response.json({ subjects } satisfies SearchResponse);
  } catch (error) {
    console.error('Error searching subjects:', error);
    return Response.json(
      { error: 'Failed to search subjects' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleSearch);
