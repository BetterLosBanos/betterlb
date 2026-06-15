/**
 * Workbench Review Decisions Endpoint
 * GET /api/admin/workbench/review-decisions - List decisions
 * POST /api/admin/workbench/review-decisions - Create decision
 */

import { Env } from '../../../types';
import { AuthContext, withAuth } from '../../../utils/admin-auth';
import {
  createDecision,
  type ReviewEvidence,
  type ReviewDecisionRow,
} from './utils';
import { badRequest, serverError } from '../../../utils/error-response';
import { Permission } from '../../../utils/rbac';

export interface CreateDecisionBody {
  source_record_id: string;
  staged_document_id: string;
  decision_type: 'set_field' | 'cannot_determine' | 'confirm_turnover';
  field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';
  value?: string;
  evidence: ReviewEvidence[];
}

export async function handleGetReviewDecisions(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env } = context;
  const url = new URL(request.url);
  const sourceRecordId = url.searchParams.get('source_record_id');

  let sql = 'SELECT * FROM review_decisions';
  const params: string[] = [];
  if (sourceRecordId) {
    sql += ' WHERE source_record_id = ?';
    params.push(sourceRecordId);
  }
  sql += ' ORDER BY created_at DESC';

  const result = await env.BETTERLB_DB.prepare(sql)
    .bind(...params)
    .all<ReviewDecisionRow>();

  const items = result.results.map(d => ({
    id: d.id,
    source_record_id: d.source_record_id,
    staged_document_id: d.staged_document_id,
    decision_type: d.decision_type,
    field: d.field,
    value: d.value,
    derived: d.derived_json ? JSON.parse(d.derived_json) : null,
    evidence: d.evidence_json ? JSON.parse(d.evidence_json) : [],
    created_at: d.created_at,
    created_by: d.created_by,
  }));

  return Response.json({ items });
}

export async function handleCreateDecision(context: {
  request: Request;
  env: Env;
  auth: AuthContext;
}) {
  const { request, env, auth } = context;

  try {
    const body = (await request.json()) as CreateDecisionBody;

    // Validate
    if (!body.source_record_id) {
      return badRequest('source_record_id is required');
    }
    if (
      !body.decision_type ||
      !['set_field', 'cannot_determine', 'confirm_turnover'].includes(
        body.decision_type
      )
    ) {
      return badRequest('Invalid decision_type');
    }
    if (
      !body.field ||
      !['date_enacted', 'title', 'term_id', 'turnover_marker'].includes(
        body.field
      )
    ) {
      return badRequest('Invalid field');
    }
    if (!Array.isArray(body.evidence)) {
      return badRequest('evidence must be an array');
    }

    // Field-specific validation
    if (body.decision_type === 'set_field') {
      if (body.field === 'date_enacted') {
        if (!body.value || !/^\d{4}-\d{2}-\d{2}$/.test(body.value)) {
          return badRequest('date_enacted must be YYYY-MM-DD');
        }
      } else if (body.field === 'title') {
        if (!body.value || !body.value.trim()) {
          return badRequest('title value is required');
        }
      } else if (body.field === 'term_id') {
        // Validate term exists
        const termCheck = await env.BETTERLB_DB.prepare(
          'SELECT id FROM terms WHERE id = ?'
        )
          .bind(body.value)
          .first();
        if (!termCheck) {
          return badRequest('Invalid term_id');
        }
      }
    }

    if (body.decision_type === 'confirm_turnover') {
      if (body.field !== 'turnover_marker') {
        return badRequest('confirm_turnover requires turnover_marker field');
      }
      const termCheck = await env.BETTERLB_DB.prepare(
        'SELECT id FROM terms WHERE id = ?'
      )
        .bind(body.value)
        .first();
      if (!termCheck) {
        return badRequest('Invalid term_id for turnover confirmation');
      }
    }

    const result = await createDecision(env.BETTERLB_DB, auth.user.login, body);

    return Response.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating decision:', error);
    if (
      error instanceof Error &&
      error.message === 'Unknown source_record_id'
    ) {
      return badRequest('Unknown source_record_id');
    }
    return serverError('Failed to create decision');
  }
}

export const onRequestGet = withAuth(handleGetReviewDecisions, {
  requirePermission: Permission.WORKBENCH_READ,
});
export const onRequestPost = withAuth(handleCreateDecision, {
  requireCSRF: true,
  requirePermission: Permission.WORKBENCH_WRITE,
});
