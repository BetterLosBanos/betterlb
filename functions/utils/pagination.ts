/**
 * Parse and validate pagination query parameters
 * Provides safe defaults and clamps to maximum values
 *
 * @param value - The query parameter value (string or null)
 * @param defaultValue - Default value if parsing fails
 * @param max - Maximum allowed value (inclusive)
 * @returns Parsed and clamped number
 */
export function parsePaginationParam(
  value: string | null,
  defaultValue: number,
  max: number
): number {
  if (value === null || value === '') {
    return defaultValue;
  }

  const parsed = parseInt(value, 10);

  if (isNaN(parsed)) {
    return defaultValue;
  }

  return Math.min(max, Math.max(1, parsed));
}

/**
 * Common pagination limits
 */
export const PAGINATION_LIMITS = {
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
  DEFAULT_OFFSET: 0,
} as const;
