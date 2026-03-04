/**
 * CSRF Token Endpoint
 * GET /api/admin/auth/csrf
 *
 * Returns a CSRF token for the authenticated admin session
 */

import { Env } from '../../../types';
import { withAuth } from '../../../utils/admin-auth';
import { getCSRFTokenForSession } from '../../../utils/csrf';

export async function onRequestGet(context: { request: Request; env: Env }) {
  return withAuth(async ({ env, auth }) => {
    const token = await getCSRFTokenForSession(env, auth);
    return Response.json({ csrf_token: token });
  })(context);
}
