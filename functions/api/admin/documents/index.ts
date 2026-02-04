/**
 * Admin Documents API
 * GET /api/admin/documents - List all documents with filtering
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

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

  if (
    status &&
    ['active', 'pending', 'suspended', 'inactive'].includes(status)
  ) {
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
  const countResult = await env.BETTERLB_DB.prepare(countSql)
    .bind(...params)
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  // Add pagination and ordering
  sql += ` ORDER BY date_enacted DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
  params.push(limit, offset);

  try {
    const result = await env.BETTERLB_DB.prepare(sql)
      .bind(...params)
      .all();

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
    return Response.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * Bulk Create Request Interface
 */
interface BulkCreateRequest {
  session_id: string;
  documents: Array<{
    type: 'ordinance' | 'resolution' | 'executive_order';
    number: string;
    title: string;
    authors: Array<{ person_id: string; is_new?: boolean; name?: string }>;
    seconded_by?: string; // person_id or null
    moved_by?: string; // person_id or null
  }>;
}

interface BulkCreateResponse {
  success: boolean;
  created: Array<{ document_id: string; number: string }>;
  errors: Array<{ index: number; message: string }>;
}

/**
 * POST /api/admin/documents/bulk
 * Bulk create documents with authors
 */
async function handleBulkCreateDocuments(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = (await request.json()) as BulkCreateRequest;

    if (!body.session_id || !body.documents || body.documents.length === 0) {
      return Response.json(
        { error: 'Missing required fields: session_id, documents' },
        { status: 400 }
      );
    }

    const created: Array<{ document_id: string; number: string }> = [];
    const errors: Array<{ index: number; message: string }> = [];

    // Process each document
    for (let i = 0; i < body.documents.length; i++) {
      const doc = body.documents[i];

      try {
        // Validate required fields
        if (!doc.type || !doc.number || !doc.title) {
          errors.push({
            index: i,
            message: 'Missing required fields: type, number, title',
          });
          continue;
        }

        // Check if document with this number already exists
        const existing = await env.BETTERLB_DB.prepare(
          `SELECT id FROM documents WHERE number = ?1`
        )
          .bind(doc.number)
          .first();

        if (existing) {
          errors.push({
            index: i,
            message: `Document ${doc.number} already exists`,
          });
          continue;
        }

        // Generate document ID
        const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        // Insert document
        await env.BETTERLB_DB.prepare(
          `INSERT INTO documents (id, type, number, title, session_id, status, source_type, moved_by, seconded_by, processed)
           VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)`
        )
          .bind(
            documentId,
            doc.type,
            doc.number,
            doc.title,
            body.session_id,
            'pending',
            'facebook',
            doc.moved_by || null,
            doc.seconded_by || null,
            0
          )
          .run();

        // Insert authors
        if (doc.authors && doc.authors.length > 0) {
          for (const author of doc.authors) {
            if (author.person_id && !author.is_new) {
              await env.BETTERLB_DB.prepare(
                `INSERT INTO document_authors (document_id, person_id, author_type)
                 VALUES (?1, ?2, ?3)`
              )
                .bind(documentId, author.person_id, 'primary')
                .run();
            }
          }
        }

        created.push({ document_id: documentId, number: doc.number });
      } catch (error) {
        console.error(`Error creating document at index ${i}:`, error);
        errors.push({
          index: i,
          message: error instanceof Error ? error.message : 'Unknown error',
        });
      }
    }

    return Response.json({
      success: true,
      created,
      errors,
    } satisfies BulkCreateResponse);
  } catch (error) {
    console.error('Error in bulk create:', error);
    return Response.json(
      { error: 'Failed to bulk create documents' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleListDocuments);
export const onRequestPost = withAuth(handleBulkCreateDocuments);
