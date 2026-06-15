/**
 * Workbench Stats Endpoint
 * GET /api/admin/workbench/stats
 */

import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import { Permission } from '../../../utils/rbac';
import { queryStats } from './utils';

export async function handleGetStats(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;
  const stats = await queryStats(env.BETTERLB_DB);
  return Response.json(stats);
}

export const onRequestGet = withAuth(handleGetStats, {
  requirePermission: Permission.WORKBENCH_READ,
});
