/**
 * Admin Review Queue API
 * GET /api/admin/review-queue - List items needing review
 * POST /api/admin/review-queue - Add new item to review queue
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

type ReviewStatus = 'pending' | 'in_progress' | 'resolved' | 'skipped';
type ItemType = 'document' | 'session' | 'attendance';

interface ReviewItem {
  id: string;
  item_type: ItemType;
  item_id: string;
  issue_type: string;
  description: string | null;
  source_type: 'pdf' | 'facebook' | 'manual' | 'other';
  source_url: string | null;
  status: ReviewStatus;
  assigned_to: string | null;
  resolution: string | null;
  created_at: string;
  resolved_at: string | null;
  document?: {
    id: string;
    type: string;
    number: string;
    title: string;
    pdf_url: string;
  };
}

interface ReviewQueueResponse {
  items: ReviewItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * GET /api/admin/review-queue
 * Query parameters:
 * - status: pending|in_progress|resolved|skipped
 * - item_type: document|session|attendance
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
async function handleGetReviewQueue(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  const statusFilter = url.searchParams.get('status');
  const itemTypeFilter = url.searchParams.get('item_type');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Build query
  let sql = `
    SELECT
      rq.id, rq.item_type, rq.item_id, rq.issue_type, rq.description,
      rq.source_type, rq.source_url, rq.status, rq.assigned_to, rq.resolution,
      rq.created_at, rq.resolved_at,
      d.id as doc_id, d.type as doc_type, d.number as doc_number,
      d.title as doc_title, d.pdf_url as doc_pdf_url
    FROM review_queue rq
    LEFT JOIN documents d ON rq.item_id = d.id AND rq.item_type = 'document'
    WHERE 1=1
  `;

  const params: string[] = [];
  let paramIndex = 1;

  if (
    statusFilter &&
    ['pending', 'in_progress', 'resolved', 'skipped'].includes(statusFilter)
  ) {
    sql += ` AND rq.status = ?${paramIndex++}`;
    params.push(statusFilter);
  }

  if (
    itemTypeFilter &&
    ['document', 'session', 'attendance'].includes(itemTypeFilter)
  ) {
    sql += ` AND rq.item_type = ?${paramIndex++}`;
    params.push(itemTypeFilter);
  }

  sql += ` ORDER BY rq.created_at DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
  params.push(limit.toString(), offset.toString());

  try {
    const result = await env.BETTERLB_DB.prepare(sql)
      .bind(...params)
      .all();

    // Get count for pagination
    let countSql = 'SELECT COUNT(*) as count FROM review_queue WHERE 1=1';
    let countParamIndex = 1;
    const countParams: string[] = [];

    if (statusFilter) {
      countSql += ` AND status = ?${countParamIndex++}`;
      countParams.push(statusFilter);
    }
    if (itemTypeFilter) {
      countSql += ` AND item_type = ?${countParamIndex++}`;
      countParams.push(itemTypeFilter);
    }

    const countResult = await env.BETTERLB_DB.prepare(countSql)
      .bind(...countParams)
      .first<{ count: number }>();
    const total = countResult?.count || 0;

    // Format results
    const items: ReviewItem[] = (result.results as any[]).map((row: any) => ({
      id: row.id,
      item_type: row.item_type,
      item_id: row.item_id,
      issue_type: row.issue_type,
      description: row.description,
      source_type: row.source_type,
      source_url: row.source_url,
      status: row.status,
      assigned_to: row.assigned_to,
      resolution: row.resolution,
      created_at: row.created_at,
      resolved_at: row.resolved_at,
      document: row.doc_id
        ? {
            id: row.doc_id,
            type: row.doc_type,
            number: row.doc_number,
            title: row.doc_title,
            pdf_url: row.doc_pdf_url,
          }
        : undefined,
    }));

    return Response.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    } as ReviewQueueResponse);
  } catch (error) {
    console.error('Error fetching review queue:', error);
    return Response.json(
      { error: 'Failed to fetch review queue' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/review-queue
 * Add a new item to the review queue
 */
async function createReviewItem(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = await request.json();
    const {
      item_type,
      item_id,
      issue_type,
      description,
      source_type,
      source_url,
    } = body as {
      item_type: ItemType;
      item_id: string;
      issue_type: string;
      description?: string;
      source_type?: 'pdf' | 'facebook' | 'manual' | 'other';
      source_url?: string;
    };

    // Validate required fields
    if (!item_type || !item_id || !issue_type) {
      return Response.json(
        { error: 'Missing required fields: item_type, item_id, issue_type' },
        { status: 400 }
      );
    }

    // Validate item_type
    if (!['document', 'session', 'attendance'].includes(item_type)) {
      return Response.json(
        {
          error:
            'Invalid item_type. Must be one of: document, session, attendance',
        },
        { status: 400 }
      );
    }

    // Check if item already exists in review queue
    const existing = await env.BETTERLB_DB.prepare(
      `SELECT id FROM review_queue WHERE item_id = ?1 AND item_type = ?2`
    )
      .bind(item_id, item_type)
      .first();

    if (existing) {
      return Response.json(
        {
          error: 'Item already exists in review queue',
          existing_id: existing.id,
        },
        { status: 409 }
      );
    }

    // Generate review item ID
    const reviewItemId = `review_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Insert into review queue
    await env.BETTERLB_DB.prepare(
      `INSERT INTO review_queue (
        id, item_type, item_id, issue_type, description,
        source_type, source_url, status, assigned_to,
        created_by, created_at
      ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, datetime('now'))`
    )
      .bind(
        reviewItemId,
        item_type,
        item_id,
        issue_type,
        description || null,
        source_type || 'manual',
        source_url || null,
        'pending',
        auth.user.login,
        auth.user.login
      )
      .run();

    // Fetch and return the created item
    const newItem = await env.BETTERLB_DB.prepare(
      `SELECT * FROM review_queue WHERE id = ?1`
    )
      .bind(reviewItemId)
      .first();

    return Response.json(
      {
        success: true,
        item: newItem,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating review item:', error);
    return Response.json(
      { error: 'Failed to create review item' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleGetReviewQueue);
export const onRequestPost = withAuth(createReviewItem);
