/**
 * Admin Review Queue API
 * GET /api/admin/review-queue - List items needing review
 * POST /api/admin/review-queue/status - Update item status
 * POST /api/admin/review-queue/assign - Assign item to current user
 */

import { Env } from '../../types';

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
export async function onRequestGet(context: { request: Request; env: Env }) {
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

  if (statusFilter && ['pending', 'in_progress', 'resolved', 'skipped'].includes(statusFilter)) {
    sql += ` AND rq.status = ?${paramIndex++}`;
    params.push(statusFilter);
  }

  if (itemTypeFilter && ['document', 'session', 'attendance'].includes(itemTypeFilter)) {
    sql += ` AND rq.item_type = ?${paramIndex++}`;
    params.push(itemTypeFilter);
  }

  sql += ` ORDER BY rq.created_at DESC LIMIT ?${paramIndex++} OFFSET ?${paramIndex++}`;
  params.push(limit.toString(), offset.toString());

  try {
    const result = await env.DB.prepare(sql).bind(...params).all();

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

    const countResult = await env.DB.prepare(countSql).bind(...countParams).first<{ count: number }>();
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
      document: row.doc_id ? {
        id: row.doc_id,
        type: row.doc_type,
        number: row.doc_number,
        title: row.doc_title,
        pdf_url: row.doc_pdf_url,
      } : undefined,
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
    return Response.json({ error: 'Failed to fetch review queue' }, { status: 500 });
  }
}

/**
 * POST /api/admin/review-queue/status
 * Update the status of a review queue item
 */
async function updateStatus(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { item_id, status } = body;

    if (!item_id || !status) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const validStatuses = ['pending', 'in_progress', 'resolved', 'skipped'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updateSql = `
      UPDATE review_queue
      SET status = ?1,
          resolved_at = CASE WHEN ?1 = 'resolved' THEN datetime('now') ELSE resolved_at END
      WHERE id = ?2
    `;

    await env.DB.prepare(updateSql).bind(status, item_id).run();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error updating status:', error);
    return Response.json({ error: 'Failed to update status' }, { status: 500 });
  }
}

/**
 * POST /api/admin/review-queue/assign
 * Assign a review queue item to the current user
 */
async function assignToUser(context: { request: Request; env: Env }) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { item_id } = body;

    if (!item_id) {
      return Response.json({ error: 'Missing item_id' }, { status: 400 });
    }

    // TODO: Get actual user from GitHub OAuth
    // For now, use a placeholder
    const userId = 'admin_user';

    const updateSql = `
      UPDATE review_queue
      SET assigned_to = ?1, status = 'in_progress'
      WHERE id = ?2
    `;

    await env.DB.prepare(updateSql).bind(userId, item_id).run();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error assigning item:', error);
    return Response.json({ error: 'Failed to assign item' }, { status: 500 });
  }
}

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Route to appropriate handler
  if (pathParts[3] === 'status') {
    return updateStatus(context);
  } else if (pathParts[3] === 'assign') {
    return assignToUser(context);
  }

  return Response.json({ error: 'Invalid endpoint' }, { status: 404 });
}
