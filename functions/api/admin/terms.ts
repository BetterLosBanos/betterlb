/**
 * Admin Terms API
 * GET /api/admin/terms - List all terms
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';
import {
  formatTermName,
  formatYearRange,
  formatOrdinal,
} from '../../utils/formatters';
import {
  parsePaginationParam,
  PAGINATION_LIMITS,
} from '../../utils/pagination';

async function handleListTerms(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  const limit = parsePaginationParam(
    url.searchParams.get('limit'),
    PAGINATION_LIMITS.DEFAULT_LIMIT,
    PAGINATION_LIMITS.MAX_LIMIT
  );

  try {
    const sql = `
      SELECT id, term_number, start_date, end_date
      FROM terms
      ORDER BY term_number DESC
      LIMIT ?1
    `;

    const result = await env.BETTERLB_DB.prepare(sql).bind(limit).all();

    const terms = result.results.map(
      (row: {
        id: string;
        term_number: number;
        start_date: string;
        end_date: string;
      }) => ({
        id: row.id,
        name: formatTermName(row.term_number),
        year_range: formatYearRange(row.start_date, row.end_date),
        ordinal: formatOrdinal(row.term_number),
      })
    );

    return Response.json({ terms });
  } catch (error) {
    console.error('Error fetching terms:', error);
    return Response.json({ error: 'Failed to fetch terms' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleListTerms);
