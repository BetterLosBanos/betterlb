/**
 * GET /api/admin/auth/login
 * Redirect to GitHub OAuth
 */
import { Env } from '../../../types';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;
  const url = new URL(context.request.url);

  // Fail loudly if the OAuth app isn't configured. Without this guard an unset
  // GITHUB_CLIENT_ID silently produces a broken authorize URL (client_id is the
  // literal "__GITHUB_CLIENT_ID__"), which is confusing to diagnose.
  if (!env.GITHUB_CLIENT_ID) {
    console.error('GITHUB_CLIENT_ID is not configured for this environment');
    return Response.redirect(`${url.origin}/admin?error=config`, 302);
  }

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in KV for validation later (5 minute expiry)
  await env.WEATHER_KV.put(
    `oauth_state:${state}`,
    JSON.stringify({
      created_at: Date.now(),
    }),
    { expirationTtl: 300 }
  );

  // Construct GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${url.origin}/api/admin/auth/callback`,
    scope: 'read:user user:email',
    state,
  });

  const githubUrl = `https://github.com/login/oauth/authorize?${params}`;

  return Response.redirect(githubUrl, 302);
}
