/**
 * GET /api/admin/recent-activity
 * Returns recently resolved review queue items for the admin dashboard
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

type ItemType = 'document' | 'session' | 'attendance';

interface RecentActivityItem {
  id: string;
  item_type: ItemType;
  item_id: string;
  issue_type: string;
  description: string | null;
  resolved_at: string;
  assigned_to: string | null;
  resolution: string | null;
  document?: {
    id: string;
    type: string;
    number: string;
    title: string;
  };
}

interface RecentActivityResponse {
  items: RecentActivityItem[];
}

async function handleGetRecentActivity(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;

  const sql = `
    SELECT
      rq.id, rq.item_type, rq.item_id, rq.issue_type, rq.description,
      rq.resolved_at, rq.assigned_to, rq.resolution,
      d.id as doc_id, d.type as doc_type, d.number as doc_number, d.title as doc_title
    FROM review_queue rq
    LEFT JOIN documents d ON rq.item_id = d.id AND rq.item_type = 'document'
    WHERE rq.status = 'resolved'
    ORDER BY rq.resolved_at DESC
    LIMIT 10
  `;

  try {
    const result = await env.BETTERLB_DB.prepare(sql).all();

    const items: RecentActivityItem[] = (
      result.results as Array<Record<string, unknown>>
    ).map((row: Record<string, unknown>) => ({
      id: String(row.id),
      item_type: String(row.item_type) as ItemType,
      item_id: String(row.item_id),
      issue_type: String(row.issue_type),
      description: row.description ? String(row.description) : null,
      resolved_at: String(row.resolved_at),
      assigned_to: row.assigned_to ? String(row.assigned_to) : null,
      resolution: row.resolution ? String(row.resolution) : null,
      document: row.doc_id
        ? {
            id: String(row.doc_id),
            type: String(row.doc_type),
            number: String(row.doc_number),
            title: String(row.doc_title),
          }
        : undefined,
    }));

    return Response.json({ items } as RecentActivityResponse);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    return Response.json(
      { error: 'Failed to fetch recent activity' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleGetRecentActivity);
