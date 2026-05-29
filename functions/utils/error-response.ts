/**
 * Standardized Error Response Utility
 *
 * Provides consistent error response shapes across all API endpoints.
 * Helps with frontend error handling and debugging.
 *
 * Standard format:
 * - { error: string } - Basic error message
 * - { error: string, code?: string } - Error with optional code
 * - { error: string, details?: unknown } - Error with additional context
 */

/**
 * Standard error response interface
 */
export interface ErrorResponse {
  error: string;
  code?: string;
  details?: unknown;
}

/**
 * Create a standardized error response
 *
 * @param message - Error message
 * @param statusCode - HTTP status code (default: 500)
 * @param code - Optional error code for client-side handling
 * @param details - Optional additional details about the error
 * @returns Response object with standardized error shape
 *
 * @example
 * ```typescript
 * // Simple error
 * return errorResponse('User not found', 404);
 *
 * // Error with code
 * return errorResponse('Invalid input', 400, 'INVALID_INPUT');
 *
 * // Error with details
 * return errorResponse('Validation failed', 400, undefined, {
 *   fields: ['email', 'password']
 * });
 * ```
 */
export function errorResponse(
  message: string,
  statusCode: number = 500,
  code?: string,
  details?: unknown
): Response {
  const body: ErrorResponse = { error: message };

  if (code) {
    body.code = code;
  }

  if (details !== undefined) {
    body.details = details;
  }

  return Response.json(body, { status: statusCode });
}

/**
 * Common error codes for consistent client-side handling
 */
export const ErrorCodes = {
  // Validation errors (400)
  INVALID_INPUT: 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_FORMAT: 'INVALID_FORMAT',

  // Not found errors (404)
  NOT_FOUND: 'NOT_FOUND',

  // Conflict errors (409)
  ALREADY_EXISTS: 'ALREADY_EXISTS',
  CONFLICT: 'CONFLICT',

  // Server errors (500)
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  DATABASE_ERROR: 'DATABASE_ERROR',
  EXTERNAL_API_ERROR: 'EXTERNAL_API_ERROR',

  // Authentication/Authorization (401/403)
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
} as const;

/**
 * Convenience functions for common error responses
 */

export function notFound(resource: string = 'Resource'): Response {
  return errorResponse(`${resource} not found`, 404, ErrorCodes.NOT_FOUND);
}

export function badRequest(message: string, code?: string): Response {
  return errorResponse(message, 400, code || ErrorCodes.INVALID_INPUT);
}

export function conflict(message: string, details?: unknown): Response {
  return errorResponse(message, 409, ErrorCodes.CONFLICT, details);
}

export function serverError(
  message: string = 'Internal server error'
): Response {
  return errorResponse(message, 500, ErrorCodes.INTERNAL_ERROR);
}

export function unauthorized(message: string = 'Unauthorized'): Response {
  return errorResponse(message, 401, ErrorCodes.UNAUTHORIZED);
}

export function forbidden(message: string = 'Forbidden'): Response {
  return errorResponse(message, 403, ErrorCodes.FORBIDDEN);
}
