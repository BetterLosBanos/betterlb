/**
 * CSRF Protection Utilities
 * Provides token generation and validation for Cross-Site Request Forgery protection
 */

import { Env } from '../types';
import type { AuthContext } from './admin-auth';

/**
 * Generate a CSRF token for a session
 * Tokens are stored in KV with a 24-hour expiration
 *
 * @param env - Cloudflare Workers environment
 * @param sessionId - User session ID
 * @returns CSRF token
 */
export async function generateCSRFToken(
  env: Env,
  sessionId: string
): Promise<string> {
  const token = crypto.randomUUID();
  await env.WEATHER_KV.put(`csrf:${sessionId}:${token}`, '1', {
    expirationTtl: 24 * 60 * 60, // 24 hours
  });
  return token;
}

/**
 * Validate a CSRF token
 * Tokens are one-time use and are deleted after validation
 *
 * @param env - Cloudflare Workers environment
 * @param sessionId - User session ID
 * @param token - CSRF token to validate
 * @returns true if token is valid, false otherwise
 */
export async function validateCSRFToken(
  env: Env,
  sessionId: string,
  token: string
): Promise<boolean> {
  if (!token) {
    return false;
  }

  const key = `csrf:${sessionId}:${token}`;
  const exists = await env.WEATHER_KV.get(key);

  if (exists) {
    // One-time use - delete after validation
    await env.WEATHER_KV.delete(key);
    return true;
  }

  return false;
}

/**
 * Generate CSRF token for an authenticated session
 * Convenience function for use in request handlers
 *
 * @param env - Cloudflare Workers environment
 * @param auth - Authenticated user context
 * @returns CSRF token
 */
export async function getCSRFTokenForSession(
  env: Env,
  auth: AuthContext
): Promise<string> {
  return generateCSRFToken(env, auth.sessionId);
}
