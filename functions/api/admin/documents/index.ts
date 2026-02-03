/**
 * Admin Documents API
 * GET /api/admin/documents - List all documents with filtering
 */

import { Env } from '../../../types';
import { withAuth, AuthContext } from '../../../utils/admin-auth';

interface Document {
  id: string;
  type: string;
  number: string;
  title: string;
  date_enacted: string;
  status: string;
  processed: number;
  needs_review: number;
  pdf_url: string;
  created_at: string;
  updated_at: string;
}

/**
 * GET /api/admin/documents
 * List all documents with filtering and pagination
 */
async function handleListDocuments(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  const search = url.searchParams.get('search');
  const status = url.searchParams.get('status');
  const type = url.searchParams.get('type');
  const needsReview = url.searchParams.get('needs_review');
  const limit = parseInt(url.searchParams.get('limit') || '50');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Build query
  let sql = `
    SELECT
      id, type, number, title, date_enacted, status,
      processed, needs_review, pdf_url, created_at, updated_at
    FROM documents
    WHERE 1=1
  `;

  const params: (string | number)[] = [];
  let paramIndex = 1;

  if (search) {
    sql += ` AND (number LIKE ?${paramIndex} OR title LIKE ?${paramIndex + 1})`;
    params.push(`%${search}%`, `%${search}%`);
    paramIndex += 2;
  }

  if (status && ['active', 'pending', 'suspended', 'inactive'].includes(status)) {
    sql += ` AND status = ?${paramIndex++}`;
    params.push(status);
  }

  if (type && ['ordinance', 'resolution', 'executive_order'].includes(type)) {
    sql += ` AND type = ?${paramIndex++}`;
    params.push(type);
  }

  if (needsReview === '1' || needsReview === '0') {
    sql += ` AND needs_review = ?${paramIndex++}`;
    params.push(needsReview);
  }

  // Get total count
  const countSql = sql.replace(
    /SELECT.*?FROM/,
    'SELECT COUNT(*) as count FROM'
  );
  const countResult = await env.BETTERLB_DB.prepare(countSql).bind(...params).first<{ count: number }>();
  const total = countResult?.count || 0;

  // Add pagination and ordering
  sql += ` ORDER BY date_enacted DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
  params.push(limit, offset);

  try {
    const result = await env.BETTERLB_DB.prepare(sql).bind(...params).all();

    const documents: Document[] = (result.results as any[]).map((row: any) => ({
      id: row.id,
      type: row.type,
      number: row.number,
      title: row.title,
      date_enacted: row.date_enacted,
      status: row.status,
      processed: row.processed,
      needs_review: row.needs_review,
      pdf_url: row.pdf_url,
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));

    return Response.json({
      documents,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return Response.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleListDocuments);
