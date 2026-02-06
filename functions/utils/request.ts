/**
 * Request Parsing Utilities
 * Safe JSON parsing with size limits and validation
 */
import { Env } from '../types';

/**
 * Parse JSON body from request with size limit validation
 * @param request - The incoming request
 * @param maxSize - Maximum allowed body size in bytes (default: 1MB)
 * @returns Parsed JSON body
 * @throws Error if body is too large or invalid JSON
 */
export async function parseJsonBody<T>(
  request: Request,
  maxSize: number = 1_000_000
): Promise<T> {
  const contentLength = request.headers.get('Content-Length');
  if (contentLength && parseInt(contentLength) > maxSize) {
    throw new Error(
      `Request body too large: ${contentLength} bytes exceeds limit of ${maxSize} bytes`
    );
  }

  const body = await request.text();
  if (body.length > maxSize) {
    throw new Error(
      `Request body too large: ${body.length} bytes exceeds limit of ${maxSize} bytes`
    );
  }

  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error('Invalid JSON in request body');
  }
}

/**
 * Validate that request has valid JSON content type
 */
export function validateJsonContentType(request: Request): boolean {
  const contentType = request.headers.get('Content-Type') || '';
  return contentType.includes('application/json');
}

/**
 * Get request size limit from environment or use default
 */
export function getRequestSizeLimit(env: Env): number {
  const limit = env.REQUEST_SIZE_LIMIT;
  return limit ? parseInt(limit, 10) : 1_000_000; // Default 1MB
}
