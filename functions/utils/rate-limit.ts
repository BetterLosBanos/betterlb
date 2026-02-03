/**
 * Rate Limiting Utility
 * Provides distributed rate limiting using Cloudflare KV
 */

export interface RateLimitConfig {
  limit: number;
  window: number; // seconds
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
}

/**
 * Check if a request should be rate limited
 * @param kv - KVNamespace for storing rate limit data
 * @param key - Unique identifier for the rate limit bucket (e.g., IP address or user ID)
 * @param config - Rate limit configuration
 * @returns RateLimitResult indicating if request is allowed and rate limit info
 */
export async function checkRateLimit(
  kv: KVNamespace,
  key: string,
  config: RateLimitConfig
): Promise<RateLimitResult> {
  const { limit, window } = config;
  const now = Date.now();

  const record = await kv.get(key, 'json') as { count: number; resetAt: number } | null;

  // No existing record or window expired - start fresh
  if (!record || now > record.resetAt) {
    const resetAt = now + window * 1000;
    await kv.put(key, JSON.stringify({ count: 1, resetAt }), {
      expirationTtl: window
    });
    return { allowed: true, remaining: limit - 1, resetAt };
  }

  // Rate limit exceeded
  if (record.count >= limit) {
    return { allowed: false, remaining: 0, resetAt: record.resetAt };
  }

  // Increment counter
  const newCount = record.count + 1;
  await kv.put(key, JSON.stringify({ count: newCount, resetAt: record.resetAt }), {
    expirationTtl: Math.ceil((record.resetAt - now) / 1000)
  });

  return { allowed: true, remaining: limit - newCount, resetAt: record.resetAt };
}

/**
 * Get client identifier from request
 * Uses CF-Connecting-IP header if available (Cloudflare), otherwise 'anonymous'
 */
export function getClientIdentifier(request: Request): string {
  return request.headers.get('CF-Connecting-IP') || 'anonymous';
}

/**
 * Create a 429 Too Many Requests response with proper headers
 */
export function createRateLimitResponse(result: RateLimitResult): Response {
  return Response.json({
    error: 'Too many requests',
    retryAfter: Math.ceil((result.resetAt - Date.now()) / 1000)
  }, {
    status: 429,
    headers: {
      'Content-Type': 'application/json',
      'Retry-After': Math.ceil((result.resetAt - Date.now()) / 1000).toString(),
      'X-RateLimit-Limit': '100',
      'X-RateLimit-Remaining': '0',
      'X-RateLimit-Reset': new Date(result.resetAt).toISOString()
    }
  });
}
