/**
 * Security Headers Middleware
 *
 * Provides standardized security headers for all HTTP responses.
 * These headers help protect against XSS, clickjacking, and other vulnerabilities.
 *
 * References:
 * - OWASP: https://cheatsheetseries.owasp.org/cheatsheets/HTTP_Headers_Cheat_Sheet.html
 * - MDN: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers
 */

/**
 * Security header configuration
 *
 * X-Content-Type-Options: nosniff
 *   Prevents MIME type sniffing, ensuring files are treated as the content type specified
 *
 * X-Frame-Options: DENY
 *   Prevents clickjacking attacks by blocking framing
 *
 * Strict-Transport-Security (HSTS)
 *   Enforces HTTPS connections (only applied over HTTPS)
 *
 * Content-Security-Policy (CSP)
 *   Controls resources the browser is allowed to load
 *   - default-src: 'self' - Only load resources from same origin
 *   - script-src: 'self' 'unsafe-inline' - Allow inline scripts (for React/Vite dev)
 *   - style-src: 'self' 'unsafe-inline' - Allow inline styles (for Tailwind/CSS-in-JS)
 *   - img-src: 'self' data: https: - Allow images from same origin, data URLs, and HTTPS
 *   - font-src: 'self' data: - Allow fonts from same origin and data URLs
 *   - connect-src: 'self' - Only allow fetch/XHR to same origin
 *   - frame-ancestors: 'none' - Prevent framing (modern replacement for X-Frame-Options)
 *
 * X-XSS-Protection: 0
 *   Disables legacy XSS filter (modern browsers use CSP instead)
 *
 * Referrer-Policy: strict-origin-when-cross-origin
 *   Controls how much referrer information is sent
 *
 * Permissions-Policy: (formerly Feature-Policy)
 *   Controls browser features and APIs
 */
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '0',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy':
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
} as const;

/**
 * Content-Security-Policy for production (strict)
 *
 * Note: 'unsafe-inline' is needed for:
 * - React/Vite development mode
 * - Tailwind CSS (@apply directives)
 * - CSS-in-JS libraries
 *
 * For production, consider using nonce hashes for stricter CSP
 */
export const CSP_STRICT =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self'; " +
  "frame-ancestors 'none';";

/**
 * Content-Security-Policy for development (more permissive)
 *
 * Allows:
 * - Vite dev server (localhost ports)
 * - React DevTools
 * - Hot Module Replacement (HMR)
 */
export const CSP_DEVELOPMENT =
  "default-src 'self' 'unsafe-eval'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https: http://localhost:*; " +
  "font-src 'self' data:; " +
  "connect-src 'self' http://localhost:* ws://localhost:* ws://localhost:*; " +
  "frame-ancestors 'none';";

/**
 * Get appropriate CSP based on environment
 *
 * @param env - Cloudflare Worker environment
 * @returns CSP string
 */
export function getCSP(env?: { ENVIRONMENT?: string }): string {
  // Check if running in development mode
  const isDevelopment =
    env?.ENVIRONMENT === 'development' ||
    (typeof globalThis !== 'undefined' &&
      // @ts-expect-error - DEV is a Vite global
      ((globalThis as { DEV?: boolean; __DEV__?: boolean }).DEV ||
        (globalThis as { DEV?: boolean; __DEV__?: boolean }).__DEV__));

  return isDevelopment ? CSP_DEVELOPMENT : CSP_STRICT;
}

/**
 * Apply security headers to a Response object
 *
 * @param response - Response object to modify
 * @param env - Optional environment for CSP selection
 * @returns Response with security headers set
 */
export function setSecurityHeaders(
  response: Response,
  env?: { ENVIRONMENT?: string }
): Response {
  // Set standard security headers
  Object.entries(SECURITY_HEADERS).forEach(([key, value]) => {
    // Skip HSTS if not over HTTPS (it's only valid over HTTPS)
    if (key === 'Strict-Transport-Security') {
      const url = response.url || '';
      if (!url.startsWith('https:')) {
        return;
      }
    }
    response.headers.set(key, value);
  });

  // Set CSP based on environment
  response.headers.set('Content-Security-Policy', getCSP(env));

  return response;
}

/**
 * Create a JSON response with security headers and cache headers
 *
 * This is a convenience function that combines security headers with the
 * existing cachedJson functionality.
 *
 * @param data - Response data
 * @param config - Cache configuration
 * @param status - HTTP status code
 * @param env - Optional environment for CSP selection
 * @returns Response with security and cache headers
 */
export function secureJson<T>(
  data: T,
  config?: 'static' | 'list' | 'detail' | 'count' | 'none',
  status?: number,
  env?: { ENVIRONMENT?: string }
): Response {
  const response = Response.json(data, { status });
  const withCache = setSecurityHeaders(response, env);

  // Import setCacheHeaders to avoid circular dependency
  // We'll set basic cache headers here
  if (config && config !== 'none') {
    const cacheTimes = {
      static:
        'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
      list: 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
      detail: 'public, max-age=300, s-maxage=300, stale-while-revalidate=600',
      count: 'public, max-age=120, s-maxage=120, stale-while-revalidate=300',
      none: 'no-store, no-cache, must-revalidate',
    };
    withCache.headers.set('Cache-Control', cacheTimes[config]);
    withCache.headers.set('Vary', 'Accept-Encoding');
  }

  return withCache;
}
