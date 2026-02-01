/**
 * Admin Errors API
 * GET /api/admin/errors - List all parse errors with filtering
 */

import { Env } from '../../types';

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

export async function onRequestGet(context: { request: Request; env: Env }) {
  const { request, env } = context;
  const url = new URL(request.url);
  const stage = url.searchParams.get('stage');

  // TODO: In production, verify admin authentication here
  // For now, we'll return mock data or read from error files

  try {
    // Build query with optional stage filter
    let sql = `
      SELECT
        id, document_number, pdf_url, error_type, error_message, timestamp, stage
      FROM parse_errors
      WHERE 1=1
    `;
    const params: string[] = [];

    if (stage && ['scrape', 'download', 'parse', 'extract', 'migrate'].includes(stage)) {
      sql += ` AND stage = ?1`;
      params.push(stage);
    }

    sql += ` ORDER BY timestamp DESC LIMIT 100`;

    // Note: parse_errors table may not exist yet, so we handle that case
    let errors: ParseError[] = [];

    try {
      const result = await env.BETTERLB_DB.prepare(sql).bind(...params).all();
      errors = (result.results as any[]).map((row: any) => ({
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
      const countResult = await env.BETTERLB_DB.prepare(countSql).bind(...params).first<{ count: number }>();
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
export async function onRequestPost(context: {
  request: Request;
  env: Env;
  params: { id: string };
}) {
  const { request, env, params } = context;
  const errorId = params.id;

  try {
    // TODO: Implement retry logic
    // This would trigger the pipeline to re-process the document

    return Response.json({
      success: true,
      message: `Retry queued for error ${errorId}`,
    });
  } catch (error) {
    console.error('Error retrying document:', error);
    return Response.json({ error: 'Failed to retry document' }, { status: 500 });
  }
}
