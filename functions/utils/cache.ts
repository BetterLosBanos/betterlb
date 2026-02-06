/**
 * HTTP Cache header utilities for OpenLGU APIs
 *
 * Provides standardized cache-control headers for different types of API responses.
 * This enables browser and CDN caching to reduce server load and improve response times.
 */

/**
 * Cache configuration presets
 */
export const CACHE_CONFIGS = {
  /** Static data that rarely changes (1 hour) */
  static: {
    'Cache-Control':
      'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    ETag: true,
  },
  /** List endpoints that change periodically (15 minutes) */
  list: {
    'Cache-Control':
      'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
    ETag: true,
  },
  /** Detail endpoints that may change more frequently (5 minutes) */
  detail: {
    'Cache-Control':
      'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
    ETag: true,
  },
  /** Count/query results (2 minutes) */
  count: {
    'Cache-Control':
      'public, max-age=120, s-maxage=120, stale-while-revalidate=300',
    ETag: true,
  },
  /** No caching for dynamic/personalized content */
  none: {
    'Cache-Control': 'no-store, no-cache, must-revalidate',
    ETag: false,
  },
} as const;

/**
 * Generate a simple ETag from response data
 *
 * @param data - Response data to generate ETag from
 * @returns ETag hash string
 */
function generateETag(data: unknown): string {
  const str = typeof data === 'string' ? data : JSON.stringify(data);
  // Simple hash for ETag (in production, use crypto.subtle.digest)
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return `"${Math.abs(hash).toString(16)}"`;
}

/**
 * Set cache headers on a Response object
 *
 * @param response - Response object to modify
 * @param config - Cache configuration to apply
 * @param data - Optional data for ETag generation
 * @returns Response with cache headers set
 */
export function setCacheHeaders(
  response: Response,
  config: keyof typeof CACHE_CONFIGS = 'none',
  data?: unknown
): Response {
  const cacheConfig = CACHE_CONFIGS[config];

  // Set Cache-Control header
  response.headers.set('Cache-Control', cacheConfig['Cache-Control']);

  // Add ETag if enabled and data is provided
  if (cacheConfig['ETag'] && data !== undefined) {
    response.headers.set('ETag', generateETag(data));
  }

  // Add standard headers for API responses
  response.headers.set('Vary', 'Accept-Encoding');

  return response;
}

/**
 * Create a cached JSON response
 *
 * @param data - Response data
 * @param config - Cache configuration to apply
 * @param status - HTTP status code
 * @returns Response with cache headers and JSON body
 */
export function cachedJson<T>(
  data: T,
  config: keyof typeof CACHE_CONFIGS = 'none',
  status: number = 200
): Response {
  const response = Response.json(data, { status });
  return setCacheHeaders(response, config, data);
}

/**
 * Check if a cached response is still valid based on ETag
 *
 * @param request - Request object
 * @param currentETag - Current ETag for the resource
 * @returns Response if not modified, null otherwise
 */
export function checkETag(
  request: Request,
  currentETag: string
): Response | null {
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch && ifNoneMatch === currentETag) {
    return new Response(null, { status: 304 });
  }
  return null;
}
