/**
 * GET /api/admin/auth/google/login
 * Redirect to Google OAuth
 */
import { Env } from '../../../types';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in KV for validation later (5 minute expiry)
  await env.WEATHER_KV.put(
    `oauth_state:${state}`,
    JSON.stringify({
      created_at: Date.now(),
      provider: 'google',
    }),
    { expirationTtl: 300 }
  );

  // Get redirect URI from env or construct from request
  const redirectUri =
    env.GOOGLE_REDIRECT_URI ||
    `${new URL(context.request.url).origin}/api/admin/auth-google/callback`;

  // Construct Google OAuth URL
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID || '__GOOGLE_CLIENT_ID__',
    redirect_uri: redirectUri,
    scope: 'openid profile email',
    response_type: 'code',
    state,
  });

  const googleUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;

  return Response.redirect(googleUrl, 302);
}
