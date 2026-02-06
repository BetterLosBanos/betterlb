/**
 * Cookie Parsing Utility
 * Shared utility for parsing HTTP Cookie headers with proper error handling
 */

/**
 * Parse cookie header into an object
 * Handles quoted values, URL-encoded content, and malformed cookies
 *
 * @param cookieHeader - The Cookie header value from request.headers.get('Cookie')
 * @returns Object with cookie name-value pairs
 */
export function parseCookies(
  cookieHeader: string | null
): Record<string, string> {
  if (!cookieHeader) {
    return {};
  }

  try {
    return cookieHeader.split(';').reduce(
      (acc, cookie) => {
        const trimmed = cookie.trim();
        const firstEq = trimmed.indexOf('=');

        if (firstEq === -1) {
          // Malformed cookie (no =), use empty string as value
          acc[trimmed] = '';
        } else {
          const name = trimmed.slice(0, firstEq);
          try {
            const value = decodeURIComponent(trimmed.slice(firstEq + 1));
            acc[name] = value.replace(/^"(.*)"$/, '$1'); // Remove surrounding quotes
          } catch (decodeError) {
            console.error(
              'Failed to decode cookie value:',
              decodeError,
              'Cookie:',
              name
            );
            // Fallback to raw undecoded value if decodeURIComponent fails
            acc[name] = trimmed.slice(firstEq + 1);
          }
        }
        return acc;
      },
      {} as Record<string, string>
    );
  } catch (error) {
    console.error('Failed to parse cookies:', error);
    return {};
  }
}
