/**
 * GET /api/admin/auth/callback
 * Handle GitHub OAuth callback
 */
import { Env } from '../../../types';

const GITHUB_CLIENT_ID = '__GITHUB_CLIENT_ID__';
const GITHUB_CLIENT_SECRET = '__GITHUB_CLIENT_SECRET__';

const AUTHORIZED_USERS: string[] = [];

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
    const tokenResponse = await fetch(
      'https://github.com/login/oauth/access_token',
      {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          client_id: env.GITHUB_CLIENT_ID || GITHUB_CLIENT_ID,
          client_secret: env.GITHUB_CLIENT_SECRET || GITHUB_CLIENT_SECRET,
          code,
          redirect_uri: `${url.origin}/api/admin/auth/callback`,
        }),
      }
    );

    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (error) {
      console.error(
        'Failed to parse OAuth token response:',
        error,
        'Status:',
        tokenResponse.status
      );
      return Response.json(
        { error: 'Invalid OAuth response' },
        { status: 500 }
      );
    }

    if (tokenData.error) {
      return Response.json({ error: tokenData.error }, { status: 400 });
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'User-Agent': 'BetterLB-Admin',
      },
    });

    let userData;
    try {
      userData = await userResponse.json();
    } catch (error) {
      console.error(
        'Failed to parse OAuth user response:',
        error,
        'Status:',
        userResponse.status
      );
      return Response.json(
        { error: 'Invalid OAuth response' },
        { status: 500 }
      );
    }

    // Validate response structure
    if (!userData.id || !userData.login) {
      console.error('OAuth user response missing required fields:', userData);
      return Response.json(
        { error: 'Invalid user data from OAuth provider' },
        { status: 500 }
      );
    }

    const user: GitHubUser = userData;

    // Check if user is authorized
    let authorizedList: string[] = AUTHORIZED_USERS;
    if (env.AUTHORIZED_USERS) {
      try {
        const parsed = JSON.parse(env.AUTHORIZED_USERS);
        if (!Array.isArray(parsed)) {
          console.error('AUTHORIZED_USERS is not an array:', typeof parsed);
          return Response.redirect(`${url.origin}/admin?error=config`, 302);
        }
        authorizedList = parsed;
      } catch (error) {
        console.error(
          'Failed to parse AUTHORIZED_USERS environment variable:',
          error
        );
        return Response.redirect(`${url.origin}/admin?error=config`, 302);
      }
    }

    // Always enforce authorization - empty list means NO ONE is authorized
    if (authorizedList.length === 0 || !authorizedList.includes(user.login)) {
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
        Location: redirectUrl,
        'Set-Cookie': `admin_session=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${24 * 60 * 60}`,
      },
    });
  } catch (error) {
    console.error('OAuth error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
