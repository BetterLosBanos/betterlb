/**
 * GET /api/admin/auth-google/callback
 * Handle Google OAuth callback
 */
import { Env } from '../../../types';

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
}

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
    // Get redirect URI from env or construct from request
    const redirectUri =
      env.GOOGLE_REDIRECT_URI || `${url.origin}/api/admin/auth-google/callback`;

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID || '__GOOGLE_CLIENT_ID__',
        client_secret: env.GOOGLE_CLIENT_SECRET || '__GOOGLE_CLIENT_SECRET__',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    let tokenData;
    try {
      tokenData = await tokenResponse.json();
    } catch (error) {
      console.error(
        'Failed to parse Google OAuth token response:',
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
      console.error('Google token error:', tokenData);
      return Response.json(
        { error: tokenData.error_description || tokenData.error },
        { status: 400 }
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user info
    const userResponse = await fetch(
      `https://www.googleapis.com/oauth2/v2/userinfo?access_token=${accessToken}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    let userData;
    try {
      userData = await userResponse.json();
    } catch (error) {
      console.error(
        'Failed to parse Google user response:',
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
    if (!userData.id || !userData.email) {
      console.error('Google user response missing required fields:', userData);
      return Response.json(
        { error: 'Invalid user data from Google' },
        { status: 500 }
      );
    }

    const googleUser: GoogleUser = userData;

    // Convert Google user to GitHub user format for consistency
    const user: GitHubUser = {
      id: parseInt(googleUser.id, 10) || 0,
      login: googleUser.email, // Use email as login identifier
      name: googleUser.name,
      email: googleUser.email,
      avatar_url: googleUser.picture,
    };

    // Check if user is authorized (support both GitHub usernames and Google emails)
    let authorizedList: string[] = [];
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
    // Support both GitHub usernames and Google emails in the authorized list
    if (
      authorizedList.length === 0 ||
      !authorizedList.includes(googleUser.email)
    ) {
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
    console.error('Google OAuth error:', error);
    return Response.json({ error: 'Authentication failed' }, { status: 500 });
  }
}
