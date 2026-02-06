/**
 * Admin Person Search API
 * GET /api/admin/persons-search - Search for persons by name
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface Person {
  id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix?: string | null;
}

interface SearchResponse {
  persons: Array<Person & { full_name: string }>;
}

/**
 * GET /api/admin/persons-search?q=juan
 * Returns list of matching persons
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
      return Response.json({ persons: [] });
    }

    const searchPattern = `%${query}%`;

    // Search by first name, last name, or aliases
    const sql = `
      SELECT id, first_name, middle_name, last_name, suffix
      FROM persons
      WHERE deleted_at IS NULL
        AND (first_name LIKE ?1 OR last_name LIKE ?2 OR aliases LIKE ?3)
      ORDER BY last_name, first_name
      LIMIT 20
    `;

    const results = await env.BETTERLB_DB.prepare(sql)
      .bind(searchPattern, searchPattern, searchPattern)
      .all();

    const persons: Array<Person & { full_name: string }> = [];

    for (const row of results.results as Array<{
      id: string;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      suffix: string | null;
    }>) {
      const parts = [row.first_name, row.middle_name, row.last_name];
      if (row.suffix) parts.push(row.suffix);
      persons.push({
        id: row.id,
        first_name: row.first_name,
        middle_name: row.middle_name,
        last_name: row.last_name,
        suffix: row.suffix,
        full_name: parts.filter(Boolean).join(' '),
      });
    }

    return Response.json({ persons } satisfies SearchResponse);
  } catch (error) {
    console.error('Error searching persons:', error);
    return Response.json(
      { error: 'Failed to search persons' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleSearch);
