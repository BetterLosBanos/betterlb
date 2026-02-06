/**
 * Admin Reconcile API
 * GET /api/admin/reconcile - List conflicts between sources
 * POST /api/admin/reconcile - Resolve a conflict
 * POST /api/admin/reconcile/skip - Skip a conflict
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

type ReconcileStatus = 'unresolved' | 'resolved' | 'skipped';
type ConflictType = 'moved_by' | 'seconded_by' | 'authors' | 'title' | 'none';

interface ConflictRecord {
  id: string;
  document_id: string;
  conflict_type: ConflictType;
  facebook_value: string | null;
  govph_value: string | null;
  resolved_value: string | null;
  status: ReconcileStatus;
  notes: string | null;
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

interface ReconcileResponse {
  items: ConflictRecord[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
}

/**
 * GET /api/admin/reconcile
 * Query parameters:
 * - status: unresolved|resolved|skipped
 * - conflict_type: moved_by|seconded_by|authors|title|none
 * - limit: number (default 20)
 * - offset: number (default 0)
 */
async function handleGetReconcile(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);

  // TODO: Implement status and conflict_type filters
  // const statusFilter = url.searchParams.get('status');
  // const conflictTypeFilter = url.searchParams.get('conflict_type');
  const limit = parseInt(url.searchParams.get('limit') || '20');
  const offset = parseInt(url.searchParams.get('offset') || '0');

  // Build query - for now we generate conflicts from documents with different source data
  // In a real implementation, you'd have a conflicts table
  let sql = `
    SELECT
      d.id as doc_id, d.type, d.number, d.title, d.pdf_url,
      d.moved_by, d.seconded_by, d.source_type
    FROM documents d
    WHERE d.source_type IN ('pdf', 'facebook')
    ORDER BY d.date_enacted DESC
    LIMIT ?1 OFFSET ?2
  `;

  try {
    const result = await env.BETTERLB_DB.prepare(sql)
      .bind(limit.toString(), offset.toString())
      .all();

    // Generate conflict records from documents
    const items: ConflictRecord[] = [];
    const documents = result.results as any[];

    for (const doc of documents) {
      // Check for moved_by conflicts (if we have Facebook data)
      if (doc.source_type === 'facebook' && doc.moved_by) {
        // Try to find corresponding PDF record
        const pdfDoc = await env.BETTERLB_DB.prepare(
          `SELECT moved_by, seconded_by FROM documents WHERE number = ?1 AND type = ?2 AND source_type = 'pdf'`
        )
          .bind(doc.number, doc.type)
          .first();

        if (pdfDoc && pdfDoc.moved_by !== doc.moved_by) {
          items.push({
            id: `conflict_moved_by_${doc.id}`,
            document_id: doc.id,
            conflict_type: 'moved_by',
            facebook_value: doc.moved_by,
            govph_value: pdfDoc.moved_by,
            resolved_value: null,
            status: 'unresolved',
            notes: null,
            created_at: doc.created_at || new Date().toISOString(),
            resolved_at: null,
            document: {
              id: doc.id,
              type: doc.type,
              number: doc.number,
              title: doc.title,
              pdf_url: doc.pdf_url,
            },
          });
        }
      }
    }

    const total = items.length;

    return Response.json({
      items,
      pagination: {
        total,
        limit,
        offset,
        has_more: offset + limit < total,
      },
    } as ReconcileResponse);
  } catch (error) {
    console.error('Error fetching conflicts:', error);
    return Response.json(
      { error: 'Failed to fetch conflicts' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reconcile
 * Resolve a conflict by setting the resolved value
 */
async function resolveConflict(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { conflict_id, resolved_value, notes } = body;

    if (!conflict_id || resolved_value === undefined) {
      return Response.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Extract document_id from conflict_id
    const documentId = conflict_id.replace(/^conflict_\w+_/, '');

    // Update the document with the resolved value
    const conflictType = conflict_id.match(/^conflict_(\w+)_/)?.[1];

    let updateSql = '';
    if (conflictType === 'moved_by') {
      updateSql = `UPDATE documents SET moved_by = ?1, review_notes = ?2 WHERE id = ?3`;
    } else if (conflictType === 'seconded_by') {
      updateSql = `UPDATE documents SET seconded_by = ?1, review_notes = ?2 WHERE id = ?3`;
    } else {
      return Response.json({ error: 'Invalid conflict type' }, { status: 400 });
    }

    await env.BETTERLB_DB.prepare(updateSql)
      .bind(resolved_value, notes || '', documentId)
      .run();

    return Response.json({ success: true });
  } catch (error) {
    console.error('Error resolving conflict:', error);
    return Response.json(
      { error: 'Failed to resolve conflict' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/reconcile/skip
 * Skip a conflict (mark as resolved without changes)
 */
async function skipConflict(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { conflict_id } = body;

    if (!conflict_id) {
      return Response.json({ error: 'Missing conflict_id' }, { status: 400 });
    }

    // For skipping, we just return success
    // In a real implementation with a conflicts table, we'd update it there
    return Response.json({ success: true, skipped: true });
  } catch (error) {
    console.error('Error skipping conflict:', error);
    return Response.json({ error: 'Failed to skip conflict' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleGetReconcile);

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Route to appropriate handler
  // /api/admin/reconcile/skip -> pathParts[3] = "skip"
  if (pathParts[3] === 'skip') {
    return withAuth(skipConflict)(context);
  }

  return withAuth(resolveConflict)(context);
}
