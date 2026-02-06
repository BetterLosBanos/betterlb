/**
 * Admin Authentication Middleware
 * Verifies admin session and authorization for protected API routes
 */
import { Env } from '../types';
import { parseCookies } from './cookies';

export interface GitHubUser {
  id: number;
  login: string;
  name: string;
  email: string | null;
  avatar_url: string;
}

export interface AdminSession {
  user: GitHubUser;
  login_at: string;
  expires_at: string;
}

interface AuthContext {
  user: GitHubUser;
  sessionId: string;
}

/**
 * Verify admin session from request cookies
 * Returns the authenticated user context or throws an error
 */
export async function verifyAdminSession(
  request: Request,
  env: Env
): Promise<AuthContext> {
  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = parseCookies(cookieHeader);
  const sessionId = cookies.admin_session;

  if (!sessionId) {
    throw new AuthError('No session cookie found', 401);
  }

  // Fetch session from KV
  const sessionData = await env.WEATHER_KV.get(`session:${sessionId}`);

  if (!sessionData) {
    throw new AuthError('Invalid session', 401);
  }

  let session: AdminSession;
  try {
    session = JSON.parse(sessionData);
  } catch (error) {
    console.error('Failed to parse session data:', error);
    // Invalidate corrupted session
    await env.WEATHER_KV.delete(`session:${sessionId}`);
    throw new AuthError('Invalid session format', 401);
  }

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    await env.WEATHER_KV.delete(`session:${sessionId}`);
    throw new AuthError('Session expired', 401);
  }

  // Check if user is still authorized
  let authorizedList: string[] = [];
  if (env.AUTHORIZED_USERS) {
    try {
      const parsed = JSON.parse(env.AUTHORIZED_USERS);
      if (!Array.isArray(parsed)) {
        console.error('AUTHORIZED_USERS is not an array:', typeof parsed);
        throw new AuthError(
          'Server configuration error - authentication unavailable',
          500
        );
      }
      authorizedList = parsed;
    } catch (error) {
      console.error(
        'Failed to parse AUTHORIZED_USERS environment variable:',
        error
      );
      throw new AuthError(
        'Server configuration error - authentication unavailable',
        500
      );
    }
  }

  // Always enforce authorization - empty list means NO ONE is authorized
  if (
    authorizedList.length === 0 ||
    !authorizedList.includes(session.user.login)
  ) {
    throw new AuthError('User no longer authorized', 403);
  }

  return {
    user: session.user,
    sessionId,
  };
}

/**
 * Custom error class for authentication failures
 */
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number = 401
  ) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Wrapper function to add authentication to API handlers
 * Returns a 401/403 response if authentication fails
 */
export function withAuth<T extends { request: Request; env: Env }>(
  handler: (context: T & { auth: AuthContext }) => Promise<Response> | Response
): (context: T) => Promise<Response> {
  return async (context: T) => {
    try {
      const auth = await verifyAdminSession(context.request, context.env);
      return handler({ ...context, auth });
    } catch (error) {
      if (error instanceof AuthError) {
        return Response.json(
          {
            error: error.message,
            authenticated: false,
          },
          { status: error.statusCode }
        );
      }
      console.error('Auth middleware error:', error);
      return Response.json({ error: 'Authentication failed' }, { status: 500 });
    }
  };
}
