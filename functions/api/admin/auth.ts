/**
 * Admin Authentication API
 * GitHub OAuth for admin access control
 *
 * GET /api/admin/auth/login - Initiate GitHub OAuth flow
 * GET /api/admin/auth/callback - OAuth callback
 * GET /api/admin/auth/session - Get current session
 * POST /api/admin/auth/logout - Logout
 */

import { Env } from '../../types';

// GitHub OAuth configuration
const GITHUB_CLIENT_ID = '__GITHUB_CLIENT_ID__'; // Set via environment variable
const GITHUB_CLIENT_SECRET = '__GITHUB_CLIENT_SECRET__'; // Set via environment variable

// Authorized GitHub usernames for admin access
const AUTHORIZED_USERS = [
  // Add GitHub usernames here
  // e.g., 'octocat', 'another-user'
];

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

/**
 * GET /api/admin/auth/login
 * Redirect to GitHub OAuth
 */
export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const pathParts = url.pathname.split('/').filter(Boolean);

  // Route based on path
  if (pathParts[4] === 'login') {
    return handleLogin(context);
  } else if (pathParts[4] === 'callback') {
    return handleCallback(context);
  } else if (pathParts[4] === 'session') {
    return handleSession(context);
  }

  return Response.json({ error: 'Invalid auth endpoint' }, { status: 404 });
}

async function handleLogin(context: { request: Request; env: Env }) {
  const { env } = context;

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in KV for validation later (5 minute expiry)
  await env.WEATHER_KV.put(`oauth_state:${state}`, JSON.stringify({
    created_at: Date.now(),
  }), { expirationTtl: 300 });

  // Construct GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID || GITHUB_CLIENT_ID,
    redirect_uri: `${new URL(context.request.url).origin}/api/admin/auth/callback`,
    scope: 'read:user user:email',
    state,
  });

  const githubUrl = `https://github.com/login/oauth/authorize?${params}`;

  return Response.redirect(githubUrl, 302);
}

async function handleCallback(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);

  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');

  if (!code || !state) {
    return Response.json({ error: 'Missing code or state' }, { status: 400 });
  }

  // Validate state
  const stateData = await env.WEATHER_KV.get(`oauth_state:${state}`);
  if (!stateData) {
    return Response.json({ error: 'Invalid state' }, { status: 400 });
  }

  // Delete state after validation
  await env.WEATHER_KV.delete(`oauth_state:${state}`);

  try {
    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID || GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET || GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: `${url.origin}/api/admin/auth/callback`,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      return Response.json({ error: tokenData.error }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'BetterLB-Admin',
      },
    });

    const user: GitHubUser = await userResponse.json();

    // Check if user is authorized
    const authorizedList = env.AUTHORIZED_USERS
      ? JSON.parse(env.AUTHORIZED_USERS)
      : AUTHORIZED_USERS;

    if (!authorizedList.includes(user.login)) {
      return Response.redirect(`${url.origin}/admin?unauthorized`, 302);
    }

    // Create session
    const sessionId = crypto.randomUUID();
    const session: AdminSession = {
      user,
      login_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
    };

    // Store session in KV
    await env.WEATHER_KV.put(`session:${sessionId}`, JSON.stringify(session), {
      expirationTtl: 24 * 60 * 60,
    });

    // Set cookie and redirect
    const redirectUrl = `${url.origin}/admin`;
    return new Response(null, {
      status: 302,
      headers: {
        'Location': redirectUrl,
        'Set-Cookie': `admin_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${24 * 60 * 60}`,
      },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}

async function handleSession(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = cookieHeader?.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>) || {};

  const sessionId = cookies.admin_session;

  if (!sessionId) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  // Fetch session from KV
  const sessionData = await env.WEATHER_KV.get(`session:${sessionId}`);

  if (!sessionData) {
    return Response.json({ authenticated: false }, { status: 401 });
  }

  const session: AdminSession = JSON.parse(sessionData);

  // Check if session is expired
  if (new Date(session.expires_at) < new Date()) {
    await env.WEATHER_KV.delete(`session:${sessionId}`);
    return Response.json({ authenticated: false, expired: true }, { status: 401 });
  }

  return Response.json({
    authenticated: true,
    user: session.user,
  });
}

/**
 * POST /api/admin/auth/logout
 */
export async function onRequestPost(context: { request: Request; env: Env }) {
  const { request, env } = context;

  // Get session from cookie
  const cookieHeader = request.headers.get('Cookie');
  const cookies = cookieHeader?.split('; ').reduce((acc, cookie) => {
    const [name, value] = cookie.split('=');
    acc[name] = value;
    return acc;
  }, {} as Record<string, string>) || {};

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
