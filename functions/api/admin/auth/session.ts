/**
 * GET /api/admin/auth/session
 * Get current session
 */
import { Env } from '../../../types';
import { parseCookies } from '../../../utils/cookies';

interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatar_url: string;
}

interface AdminSession {
  user: GitHubUser;
  login_at: string;
  expires_at: string;
}

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.admin_session;

  if (!sessionId) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  // Fetch session from KV
  const sessionData = await env.WEATHER_KV.get(`session:${sessionId}`);

  if (!sessionData) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  let session: AdminSession;
  try {
    session = JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to parse session data:', error);
    // Invalidate corrupted session
    await env.WEATHER_KV.delete(`session:${sessionId}`);
    return Response.json(
      { authenticated: false, expired: false },
      { status: 401 }
    );
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    await env.WEATHER_KV.delete(`session:${sessionId}`);
    return Response.json(
      { authenticated: false, expired: true },
      { status: 401 }
    );
  }

  return Response.json({
    authenticated: true,
    user: session.user,
  });
}
