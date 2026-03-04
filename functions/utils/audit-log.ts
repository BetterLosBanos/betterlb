/**
 * Audit Logging Utility
 *
 * Centralized audit logging for all admin actions.
 * Logs capture who/what/when for compliance and security auditing.
 *
 * References:
 * - Security Audit Issue #17: docs/security-audit-update-2026-02-27.md
 * - QA Report: docs/qa-reports/QA_REPORT_T-057_AUDIT_LOGGING.md
 */

import { Env } from '../types';

/**
 * Audit log entry interface
 */
export interface AuditLogEntry {
  /** The action being performed (e.g., 'create_document', 'merge_persons') */
  action: string;
  /** Username of the person performing the action */
  performedBy: string;
  /** Type of target (e.g., 'document', 'person', 'session') */
  targetType: string;
  /** ID of the target (optional) */
  targetId?: string;
  /** Additional details about the action (JSON serializable) */
  details?: Record<string, unknown>;
}

/**
 * Result of an audit log operation
 */
export interface AuditLogResult {
  success: boolean;
  logId?: string;
  error?: string;
}

/**
 * Write an audit log entry to the database
 *
 * @param env - Cloudflare Worker environment
 * @param entry - Audit log entry to record
 * @returns Promise that resolves when log is written
 *
 * @example
 * ```typescript
 * await logAudit(env, {
 *   action: 'create_document',
 *   performedBy: 'admin@example.com',
 *   targetType: 'document',
 *   targetId: 'doc_123',
 *   details: { title: 'Ordinance 001', type: 'ordinance' }
 * });
 * ```
 */
export async function logAudit(
  env: Env,
  entry: AuditLogEntry
): Promise<AuditLogResult> {
  try {
    // Generate unique ID for this log entry
    const logId = crypto.randomUUID();

    // Serialize details to JSON if provided
    const detailsJson = entry.details ? JSON.stringify(entry.details) : null;

    // Insert into audit log table
    await env.BETTERLB_DB.prepare(
      `INSERT INTO admin_audit_log (id, action, performed_by, target_type, target_id, details, created_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, datetime('now'))`
    )
      .bind(
        logId,
        entry.action,
        entry.performedBy,
        entry.targetType,
        entry.targetId || null,
        detailsJson
      )
      .run();

    return {
      success: true,
      logId,
    };
  } catch (error) {
    // Log the error but don't throw - audit logging failures shouldn't break operations
    console.error('Failed to write audit log:', {
      error: error instanceof Error ? error.message : String(error),
      entry: {
        action: entry.action,
        performedBy: entry.performedBy,
        targetType: entry.targetType,
        targetId: entry.targetId,
      },
    });

    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Batch write multiple audit log entries
 * Useful for operations that affect multiple targets
 *
 * @param env - Cloudflare Worker environment
 * @param entries - Array of audit log entries to record
 * @returns Promise that resolves when all logs are written
 *
 * @example
 * ```typescript
 * await logAuditBatch(env, [
 *   { action: 'merge_persons', performedBy: 'admin', targetType: 'person', targetId: 'p1', details: { mergedInto: 'p2' } },
 *   { action: 'merge_persons', performedBy: 'admin', targetType: 'person', targetId: 'p2', details: { absorbed: 'p1' } }
 * ]);
 * ```
 */
export async function logAuditBatch(
  env: Env,
  entries: AuditLogEntry[]
): Promise<AuditLogResult[]> {
  const results: AuditLogResult[] = [];

  // Write entries in parallel for performance
  const promises = entries.map(entry => logAudit(env, entry));
  const settledResults = await Promise.allSettled(promises);

  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      results.push(result.value);
    } else {
      results.push({
        success: false,
        error:
          result.reason instanceof Error
            ? result.reason.message
            : String(result.reason),
      });
    }
  }

  return results;
}

/**
 * Helper to create audit log entries from request context
 *
 * @param action - The action being performed
 * @param targetType - Type of target
 * @param targetId - ID of target
 * @param details - Additional details
 * @returns Partial audit log entry (missing performedBy)
 */
export function createAuditLogEntry(
  action: string,
  targetType: string,
  targetId?: string,
  details?: Record<string, unknown>
): Omit<AuditLogEntry, 'performedBy'> {
  return {
    action,
    targetType,
    targetId,
    details,
  };
}

/**
 * Common audit action types
 */
export const AuditActions = {
  // Document actions
  CREATE_DOCUMENT: 'create_document',
  UPDATE_DOCUMENT: 'update_document',
  DELETE_DOCUMENT: 'delete_document',
  BULK_CREATE_DOCUMENTS: 'bulk_create_documents',
  RESOLVE_DUPLICATE: 'resolve_duplicate',

  // Person actions
  CREATE_PERSON: 'create_person',
  UPDATE_PERSON: 'update_person',
  MERGE_PERSONS: 'merge_persons',
  DELETE_PERSON: 'delete_person',
  ADD_TO_DELETION_QUEUE: 'add_to_deletion_queue',

  // Session actions
  CREATE_SESSION: 'create_session',
  UPDATE_SESSION: 'update_session',
  DELETE_SESSION: 'delete_session',
  UPDATE_ATTENDANCE: 'update_attendance',

  // Review queue actions
  ASSIGN_REVIEW: 'assign_review',
  UPDATE_REVIEW_STATUS: 'update_review_status',
  APPROVE_REVIEW: 'approve_review',
  REJECT_REVIEW: 'reject_review',

  // Reconciliation actions
  RECONCILE_DATA: 'reconcile_data',
  ACCEPT_RECONCILIATION: 'accept_reconciliation',
  REJECT_RECONCILIATION: 'reject_reconciliation',

  // Authentication actions
  LOGIN: 'login',
  LOGOUT: 'logout',
  LOGIN_FAILED: 'login_failed',

  // Parsing actions
  PARSE_FACEBOOK_POST: 'parse_facebook_post',
  PARSE_LEGISLATIVE_POST: 'parse_legislative_post',

  // System actions
  DELETE_ERROR_LOG: 'delete_error_log',
  EXPORT_DATA: 'export_data',
  IMPORT_DATA: 'import_data',
} as const;

/**
 * Common target types
 */
export const AuditTargetTypes = {
  DOCUMENT: 'document',
  PERSON: 'person',
  SESSION: 'session',
  COMMITTEE: 'committee',
  TERM: 'term',
  REVIEW_QUEUE: 'review_queue',
  CONFLICT: 'conflict',
  BATCH: 'batch',
  USER: 'user',
  ERROR_LOG: 'error_log',
  SYSTEM: 'system',
} as const;
