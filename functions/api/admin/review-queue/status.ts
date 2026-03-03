/* eslint-disable @typescript-eslint/no-explicit-any */
// D1 database result typing uses any for dynamic schema mapping
/**
 * POST /api/admin/review-queue/status
 * Update the status of a review queue item
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import {
  logAudit,
  AuditActions,
  AuditTargetTypes,
} from '../../../utils/audit-log';

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params?: Record<string, string>;
}) {
  return withAuth(
    async (c: { request: Request; env: Env; auth: AuthContext }) => {
      const { request, env } = c;

      try {
        const body = await request.json();
        const { item_id, status } = body;

        if (!item_id || !status) {
          return Response.json(
            { error: 'Missing required fields' },
            { status: 400 }
          );
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

        await env.BETTERLB_DB.prepare(updateSql).bind(status, item_id).run();

        // Log the status update
        await logAudit(env, {
          action: AuditActions.UPDATE_REVIEW_STATUS,
          performedBy: c.auth.user.login,
          targetType: AuditTargetTypes.REVIEW_QUEUE,
          targetId: item_id,
          details: {
            new_status: status,
          },
        });

        return Response.json({ success: true });
      } catch (error) {
        console.error('Error updating status:', error);
        return Response.json(
          { error: 'Failed to update status' },
          { status: 500 }
        );
      }
    }
  )(context as any);
}
