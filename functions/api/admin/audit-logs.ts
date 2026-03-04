/**
 * Admin Audit Logs API
 * GET /api/admin/audit-logs - Fetch audit logs with filtering and pagination
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';
import { cachedJson } from '../../utils/cache';

/**
 * Query parameters for fetching audit logs
 */
interface AuditLogsQuery {
  action?: string;
  performed_by?: string;
  target_type?: string;
  target_id?: string;
  start_date?: string;
  end_date?: string;
  page?: string;
  limit?: string;
}

/**
 * Audit log entry from database
 */
interface AuditLogRow {
  id: string;
  action: string;
  performed_by: string;
  target_type: string;
  target_id: string | null;
  details: string | null;
  created_at: string;
}

/**
 * Paged response of audit logs
 */
interface AuditLogsResponse {
  logs: Array<{
    id: string;
    action: string;
    performedBy: string;
    targetType: string;
    targetId: string | null;
    details: Record<string, unknown> | null;
    createdAt: string;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Parse pagination parameters
 */
function parsePagination(params: AuditLogsQuery) {
  const page = Math.max(1, parseInt(params.page || '1'));
  const limit = Math.min(100, Math.max(10, parseInt(params.limit || '50')));
  const offset = (page - 1) * limit;

  return { page, limit, offset };
}

/**
 * Build WHERE clause from query parameters
 */
function buildWhereClause(params: AuditLogsQuery): {
  clause: string;
  bindings: Array<string | number>;
} {
  const conditions: string[] = [];
  const bindings: Array<string | number> = [];
  let bindingIndex = 1;

  if (params.action) {
    conditions.push(`action = ?${bindingIndex++}`);
    bindings.push(params.action);
  }

  if (params.performed_by) {
    conditions.push(`performed_by = ?${bindingIndex++}`);
    bindings.push(params.performed_by);
  }

  if (params.target_type) {
    conditions.push(`target_type = ?${bindingIndex++}`);
    bindings.push(params.target_type);
  }

  if (params.target_id) {
    conditions.push(`target_id = ?${bindingIndex++}`);
    bindings.push(params.target_id);
  }

  if (params.start_date) {
    conditions.push(`created_at >= ?${bindingIndex++}`);
    bindings.push(params.start_date);
  }

  if (params.end_date) {
    conditions.push(`created_at <= ?${bindingIndex++}`);
    bindings.push(params.end_date);
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '',
    bindings,
  };
}

/**
 * GET /api/admin/audit-logs
 *
 * Query parameters:
 * - action: Filter by action type
 * - performed_by: Filter by user
 * - target_type: Filter by target type
 * - target_id: Filter by target ID
 * - start_date: Filter by start date (ISO 8601)
 * - end_date: Filter by end date (ISO 8601)
 * - page: Page number (default: 1)
 * - limit: Results per page (default: 50, max: 100)
 */
async function handleGetAuditLogs(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = Object.fromEntries(
    url.searchParams.entries()
  ) as AuditLogsQuery;

  // Parse pagination
  const { page, limit, offset } = parsePagination(params);

  // Build WHERE clause
  const { clause, bindings } = buildWhereClause(params);

  try {
    // Get total count for pagination
    const countResult = await env.BETTERLB_DB.prepare(
      `SELECT COUNT(*) as count FROM admin_audit_log ${clause}`
    )
      .bind(...bindings)
      .first<{ count: number }>();

    const total = countResult?.count || 0;
    const totalPages = Math.ceil(total / limit);

    // Fetch audit logs
    const logsResult = await env.BETTERLB_DB.prepare(
      `SELECT id, action, performed_by, target_type, target_id, details, created_at
       FROM admin_audit_log
       ${clause}
       ORDER BY created_at DESC
       LIMIT ?${bindings.length + 1} OFFSET ?${bindings.length + 2}`
    )
      .bind(...bindings, limit, offset)
      .all<AuditLogRow>();

    // Parse JSON details and format response
    const logs = logsResult.results.map(row => ({
      id: row.id,
      action: row.action,
      performedBy: row.performed_by,
      targetType: row.target_type,
      targetId: row.target_id,
      details: row.details
        ? (JSON.parse(row.details) as Record<string, unknown>)
        : null,
      createdAt: row.created_at,
    }));

    const response: AuditLogsResponse = {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    // Cache for 30 seconds (recent logs)
    return cachedJson(response, 'count', 200);
  } catch (error) {
    console.error('Failed to fetch audit logs:', error);

    return cachedJson(
      {
        error: 'Failed to fetch audit logs',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      'none',
      500
    );
  }
}

/**
 * Export handler with authentication
 */
export const onRequestGet = withAuth(handleGetAuditLogs);
