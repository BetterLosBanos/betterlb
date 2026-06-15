/**
 * Workbench Health Endpoint
 * GET /api/admin/workbench/health
 */

import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import { Permission } from '../../../utils/rbac';

export async function handleGetHealth(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;

  const [stagedCount, sourceCount, decisionsCount, termsCount] =
    await Promise.all([
      env.BETTERLB_DB.prepare(
        'SELECT COUNT(*) as count FROM staged_documents'
      ).first<{ count: number }>(),
      env.BETTERLB_DB.prepare(
        'SELECT COUNT(*) as count FROM source_records'
      ).first<{ count: number }>(),
      env.BETTERLB_DB.prepare(
        'SELECT COUNT(*) as count FROM review_decisions'
      ).first<{ count: number }>(),
      env.BETTERLB_DB.prepare('SELECT COUNT(*) as count FROM terms').first<{
        count: number;
      }>(),
    ]);

  const latestCapture = await env.BETTERLB_DB.prepare(
    'SELECT captured_at FROM source_records ORDER BY captured_at DESC LIMIT 1'
  ).first<{ captured_at: string }>();

  return Response.json({
    ok: true,
    error: null,
    loaded_at: latestCapture?.captured_at || null,
    artifacts: {
      staged_documents: stagedCount?.count || 0,
      source_records: sourceCount?.count || 0,
      review_decisions: decisionsCount?.count || 0,
      terms: termsCount?.count || 0,
    },
  });
}

export const onRequestGet = withAuth(handleGetHealth, {
  requirePermission: Permission.WORKBENCH_READ,
});
