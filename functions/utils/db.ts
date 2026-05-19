/**
 * Database utilities for D1 operations
 */

/**
 * Assert that a D1 write operation succeeded
 * Throws an error if the operation failed, providing context
 *
 * @param result - The result from a D1 .run() call
 * @param operation - Description of the operation for error messages
 * @throws Error if result.success is false
 */
export function assertWriteSuccess(
  result: { success?: boolean },
  operation: string
): void {
  if (result.success === false) {
    throw new Error(`Database write failed: ${operation}`);
  }
}
