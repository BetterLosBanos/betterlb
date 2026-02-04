/**
 * Admin Dashboard Stats API
 * GET /api/admin/stats - Get dashboard statistics
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';

interface DashboardStats {
  review_queue: {
    total: number;
    pending: number;
    in_progress: number;
    resolved: number;
  };
  documents: {
    total: number;
    pending_review: number;
    processed: number;
  };
  errors: {
    total: number;
    recent: number;
  };
  conflicts: {
    active: number;
  };
  deletion_queue: {
    total: number;
  };
}

/**
 * GET /api/admin/stats
 * Get dashboard statistics
 */
async function handleGetStats(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;

  try {
    // Get review queue stats
    const reviewQueueStats = await env.BETTERLB_DB.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'in_progress' THEN 1 ELSE 0 END) as in_progress,
        SUM(CASE WHEN status = 'resolved' THEN 1 ELSE 0 END) as resolved
       FROM review_queue`
    ).first<{
      total: number;
      pending: number;
      in_progress: number;
      resolved: number;
    }>();

    // Get document stats
    const documentStats = await env.BETTERLB_DB.prepare(
      `SELECT
        COUNT(*) as total,
        SUM(CASE WHEN needs_review = 1 THEN 1 ELSE 0 END) as pending_review,
        SUM(CASE WHEN processed = 1 THEN 1 ELSE 0 END) as processed
       FROM documents`
    ).first<{ total: number; pending_review: number; processed: number }>();

    // Get error stats
    let errorTotal = 0;
    let errorRecent = 0;

    try {
      const errorStats = await env.BETTERLB_DB.prepare(
        `SELECT
          COUNT(*) as total,
          SUM(CASE WHEN datetime(timestamp) > datetime('now', '-7 days') THEN 1 ELSE 0 END) as recent
         FROM parse_errors`
      ).first<{ total: number; recent: number }>();

      errorTotal = errorStats?.total || 0;
      errorRecent = errorStats?.recent || 0;
    } catch {
      // Table doesn't exist yet
    }

    // Get conflict stats
    let conflictActive = 0;

    try {
      const conflictStats = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as active FROM data_conflicts WHERE status = 'unresolved'`
      ).first<{ active: number }>();

      conflictActive = conflictStats?.active || 0;
    } catch {
      // Table doesn't exist yet
    }

    // Get deletion queue stats
    let deletionQueueTotal = 0;

    try {
      const deletionQueueStats = await env.BETTERLB_DB.prepare(
        `SELECT COUNT(*) as total FROM persons WHERE deleted_at IS NOT NULL`
      ).first<{ total: number }>();

      deletionQueueTotal = deletionQueueStats?.total || 0;
    } catch {
      // Column doesn't exist yet
    }

    const stats: DashboardStats = {
      review_queue: {
        total: reviewQueueStats?.total || 0,
        pending: reviewQueueStats?.pending || 0,
        in_progress: reviewQueueStats?.in_progress || 0,
        resolved: reviewQueueStats?.resolved || 0,
      },
      documents: {
        total: documentStats?.total || 0,
        pending_review: documentStats?.pending_review || 0,
        processed: documentStats?.processed || 0,
      },
      errors: {
        total: errorTotal,
        recent: errorRecent,
      },
      conflicts: {
        active: conflictActive,
      },
      deletion_queue: {
        total: deletionQueueTotal,
      },
    };

    return Response.json(stats);
  } catch (error) {
    console.error('Error fetching stats:', error);
    return Response.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }
}

export const onRequestGet = withAuth(handleGetStats);
