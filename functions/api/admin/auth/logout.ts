/**
 * POST /api/admin/auth/logout
 * Logout and clear session
 */

import { Env } from '../../../types';

export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.admin_session;

  if (sessionId) {
    await env.WEATHER_KV.delete(`session:${sessionId}`);
  }

  const url = new URL(request.url);

  return new Response(null, {
    status: 302,
    headers: {
      'Location': `${url.origin}/admin`,
      'Set-Cookie': 'admin_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0',
    },
  });
}

function parseCookies(cookieHeader: string | null): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  return cookieHeader.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>);
}
