/**
 * POST /api/admin/auth/logout
 * Logout and clear session
 */
import { Env } from '../../../types';
import { parseCookies } from '../../../utils/cookies';
import {
  logAudit,
  AuditActions,
  AuditTargetTypes,
} from '../../../utils/audit-log';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.admin_session;

  if (sessionId) {
    try {
      // Get the session data before deleting for audit log
      const sessionData = await env.WEATHER_KV.get(
        `session:${sessionId}`,
        'json'
      );
      const userLogin = sessionData?.user?.login || 'unknown';

      // Delete the session
      await env.WEATHER_KV.delete(`session:${sessionId}`);

      // Log the logout action
      await logAudit(env, {
        action: AuditActions.LOGOUT,
        performedBy: userLogin,
        targetType: AuditTargetTypes.USER,
        targetId: userLogin,
        details: {
          session_id: sessionId,
        },
      });
    } catch (error) {
      console.error('Failed to delete session during logout:', error);
      // Continue with redirect - cookie clearing will effectively log user out
      // But log the error for monitoring
    }
  }

  const url = new URL(request.url);

  return new Response(null, {
    status: 302,
    headers: {
      Location: `${url.origin}/admin`,
      'Set-Cookie':
        'admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}
