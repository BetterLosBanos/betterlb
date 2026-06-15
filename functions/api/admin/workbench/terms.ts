/**
 * Workbench Terms Endpoint
 * GET /api/admin/workbench/terms
 */

import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import { Permission } from '../../../utils/rbac';
import { queryTerms } from './utils';

export async function handleGetTerms(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { env } = context;
  const terms = await queryTerms(env.BETTERLB_DB);
  return Response.json({ items: terms });
}

export const onRequestGet = withAuth(handleGetTerms, {
  requirePermission: Permission.WORKBENCH_READ,
});
