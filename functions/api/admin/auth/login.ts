/**
 * GET /api/admin/auth/login
 * Redirect to GitHub OAuth
 */
import { Env } from '../../../types';

const GITHUB_CLIENT_ID = '__GITHUB_CLIENT_ID__';

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { env } = context;

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
    client_id: env.GITHUB_CLIENT_ID || GITHUB_CLIENT_ID,
    redirect_uri: `${new URL(context.request.url).origin}/api/admin/auth/callback`,
    scope: 'read:user user:email',
    state,
  });

  const githubUrl = `https://github.com/login/oauth/authorize?${params}`;

  return Response.redirect(githubUrl, 302);
}
