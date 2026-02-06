/**
 * POST /api/admin/review-queue/assign
 * Assign a review queue item to the current user
 */
import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params?: Record<string, string>;
}) {
  return withAuth(
    async (c: { request: Request; env: Env; auth: AuthContext }) => {
      const { request, env, auth } = c;

      try {
        const body = await request.json();
        const { item_id } = body;

        if (!item_id) {
          return Response.json({ error: 'Missing item_id' }, { status: 400 });
        }

        // Get user from session
        const userId = auth.user.login;

        const updateSql = `
        UPDATE review_queue
        SET assigned_to = ?1, status = 'in_progress'
        WHERE id = ?2
      `;

        await env.BETTERLB_DB.prepare(updateSql).bind(userId, item_id).run();

        return Response.json({ success: true });
      } catch (error) {
        console.error('Error assigning item:', error);
        return Response.json(
          { error: 'Failed to assign item' },
          { status: 500 }
        );
      }
    }
  )(context as any);
}
