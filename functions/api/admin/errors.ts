/**
 * Admin Errors API
 * GET /api/admin/errors - List all parse errors with filtering
 * POST /api/admin/errors/:id/retry - Retry processing a failed document
 * DELETE /api/admin/errors/:id - Delete an error log entry
 */
import { Env } from '../../types';
import { AuthContext, withAuth } from '../../utils/admin-auth';
import {
  logAudit,
  AuditActions,
  AuditTargetTypes,
} from '../../utils/audit-log';

interface ParseError {
  id: string;
  document_number?: string;
  pdf_url: string;
  error_type: string;
  error_message: string;
  timestamp: string;
  stage: 'scrape' | 'download' | 'parse' | 'extract' | 'migrate';
}

interface ErrorResponse {
  errors: ParseError[];
  total: number;
}

// Type for D1 database row
interface ParseErrorRow {
  id: string;
  document_number?: string;
  pdf_url: string;
  error_type: string;
  error_message: string;
  timestamp: string;
  stage: 'scrape' | 'download' | 'parse' | 'extract' | 'migrate';
}

async function handleGetErrors(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  const stage = url.searchParams.get('stage');

  try {
    // Build query with optional stage filter
    let sql = `
      SELECT
        id, document_number, pdf_url, error_type, error_message, timestamp, stage
      FROM parse_errors
      WHERE 1=1
    `;
    const params: string[] = [];

    if (
      stage &&
      ['scrape', 'download', 'parse', 'extract', 'migrate'].includes(stage)
    ) {
      sql += ` AND stage = ?1`;
      params.push(stage);
    }

    sql += ` ORDER BY timestamp DESC LIMIT 100`;

    // Note: parse_errors table may not exist yet, so we handle that case
    let errors: ParseError[] = [];

    try {
      const result = await env.BETTERLB_DB.prepare(sql)
        .bind(...params)
        .all<ParseErrorRow>();
      errors = result.results.map(row => ({
        id: row.id,
        document_number: row.document_number,
        pdf_url: row.pdf_url,
        error_type: row.error_type,
        error_message: row.error_message,
        timestamp: row.timestamp,
        stage: row.stage,
      }));
    } catch (dbError) {
      // Table doesn't exist yet, return empty array
      console.warn('parse_errors table not found:', dbError);
    }

    // Get count
    let count = errors.length;
    try {
      const countSql = stage
        ? `SELECT COUNT(*) as count FROM parse_errors WHERE stage = ?1`
        : `SELECT COUNT(*) as count FROM parse_errors`;
      const countResult = await env.BETTERLB_DB.prepare(countSql)
        .bind(...params)
        .first<{ count: number }>();
      count = countResult?.count || 0;
    } catch {
      // Ignore count errors
    }

    return Response.json({
      errors,
      total: count,
    } as ErrorResponse);
  } catch (error) {
    console.error('Error fetching parse errors:', error);
    return Response.json({ error: 'Failed to fetch errors' }, { status: 500 });
  }
}

/**
 * POST /api/admin/errors/:id/retry
 * Retry processing a failed document
 */
async function retryError(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { env, params } = context;
  const errorId = params.id;

  try {
    // Get the error record to find what needs to be retried
    const errorRecord = await env.BETTERLB_DB.prepare(
      `SELECT * FROM parse_errors WHERE id = ?1`
    )
      .bind(errorId)
      .first<ParseErrorRow>();

    if (!errorRecord) {
      return Response.json({ error: 'Error not found' }, { status: 404 });
    }

    // Mark as retrying
    await env.BETTERLB_DB.prepare(
      `UPDATE parse_errors SET status = 'retrying', updated_at = datetime('now') WHERE id = ?1`
    )
      .bind(errorId)
      .run();

    // Log the retry action
    await logAudit(env, {
      action: 'retry_parse_error',
      performedBy: context.auth.user.login,
      targetType: AuditTargetTypes.ERROR_LOG,
      targetId: errorId,
      details: {
        stage: errorRecord.stage,
        error_type: errorRecord.error_type,
      },
    });

    // TODO: Implement actual retry logic based on error stage
    // This would trigger the appropriate pipeline step:
    // - scrape: Re-scrape the document list
    // - download: Re-download the PDF
    // - parse: Re-parse the PDF content
    // - extract: Re-extract structured data
    // - migrate: Re-migrate to database

    return Response.json({
      success: true,
      message: `Retry queued for error ${errorId}`,
      stage: errorRecord.stage,
    });
  } catch (error) {
    console.error('Error retrying document:', error);
    return Response.json(
      { error: 'Failed to retry document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/errors/:id
 * Delete an error log entry
 */
async function deleteError(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
  params: { id: string };
}) {
  const { env, params } = context;
  const errorId = params.id;

  try {
    // Get the error record before deleting for audit log
    const errorRecord = await env.BETTERLB_DB.prepare(
      `SELECT * FROM parse_errors WHERE id = ?1`
    )
      .bind(errorId)
      .first<ParseErrorRow>();

    if (!errorRecord) {
      return Response.json({ error: 'Error not found' }, { status: 404 });
    }

    // Delete the error record
    await env.BETTERLB_DB.prepare(`DELETE FROM parse_errors WHERE id = ?1`)
      .bind(errorId)
      .run();

    // Log the deletion
    await logAudit(env, {
      action: AuditActions.DELETE_ERROR_LOG,
      performedBy: context.auth.user.login,
      targetType: AuditTargetTypes.ERROR_LOG,
      targetId: errorId,
      details: {
        stage: errorRecord.stage,
        error_type: errorRecord.error_type,
        document_number: errorRecord.document_number,
      },
    });

    return Response.json({
      success: true,
      message: `Error ${errorId} deleted`,
    });
  } catch (error) {
    console.error('Error deleting error log:', error);
    return Response.json(
      { error: 'Failed to delete error log' },
      { status: 500 }
    );
  }
}

export const onRequestGet = withAuth(handleGetErrors, { requireCSRF: true });

export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  return withAuth(retryError, { requireCSRF: true })(context);
}

export async function onRequestDelete(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  return withAuth(deleteError, { requireCSRF: true })(context);
}
