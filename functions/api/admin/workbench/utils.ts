/**
 * OpenLGU Workbench Shared Query Utilities
 * Ported from scripts/openlgu/review-workbench-server.mjs
 */

import type { D1Database } from '@cloudflare/workers-types';

export interface WorkbenchStats {
  staged_documents: number;
  decisions: number;
  needs_review: number;
  missing_dates: WorkbenchTabStats;
  missing_titles: WorkbenchTabStats;
  missing_terms: WorkbenchTabStats;
  turnover_markers: WorkbenchTabStats;
}

export interface WorkbenchTabStats {
  total: number;
  active: number;
  resolved: number;
  blocked: number;
}

export interface WorkbenchTerm {
  id: string;
  label: string;
  start_date: string;
  end_date: string;
}

export interface WorkbenchSourceRecord {
  id: string;
  source_key: string;
  source_url: string;
  content_hash: string;
  pdf_reachability: string;
  pdf_redirect_url: string | null;
  pdf_checked_at: string | null;
  raw_payload_json: Record<string, unknown>;
}

export interface ReviewDecision {
  id: string;
  source_record_id: string;
  staged_document_id: string | null;
  decision_type: 'set_field' | 'cannot_determine' | 'confirm_turnover';
  field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';
  value: string | null;
  derived: { term_id: string | null; term_inference: string } | null;
  evidence: ReviewEvidence[];
  created_at: string;
  created_by: string;
  is_current_source_hash?: boolean;
}

export interface ReviewEvidence {
  kind:
    | 'pdf_text'
    | 'website_table'
    | 'facebook_post'
    | 'filename_inference'
    | 'manual_inspection';
  note: string;
  url?: string;
  local_path?: string;
}

export interface WorkbenchDocument {
  id: string;
  source_record_id: string;
  candidate_document_id: string | null;
  document_type: string;
  number: string;
  normalized_number: string;
  title: string;
  date_enacted: string;
  pdf_url: string;
  term_id: string;
  session_id: string;
  staging_status: string;
  review_reason: string | null;
  turnover_marker: boolean;
  official_pdf_url: string;
  local_mirror_path: string;
  source_record: WorkbenchSourceRecord | null;
  projected_fields: Record<
    string,
    {
      status: 'active' | 'resolved' | 'blocked';
      decision: ReviewDecision | null;
    }
  >;
  review_decisions: ReviewDecision[];
}

export interface StagedDocumentRow {
  id: string;
  source_record_id: string;
  candidate_document_id: string | null;
  document_type: string;
  number: string;
  normalized_number: string;
  title: string;
  date_enacted: string;
  pdf_url: string;
  term_id: string;
  session_id: string;
  staging_status: string;
  review_reason: string | null;
  turnover_marker: number;
}

export interface SourceRecordRow {
  id: string;
  source_key: string;
  source_url: string;
  content_hash: string;
  pdf_reachability: string;
  pdf_redirect_url: string | null;
  pdf_checked_at: string | null;
  raw_payload_json: string;
}

/** Raw `review_decisions` row as stored in D1 (JSON columns unparsed). */
export interface ReviewDecisionRow {
  id: string;
  source_record_id: string;
  staged_document_id: string | null;
  source_content_hash: string | null;
  decision_type: ReviewDecision['decision_type'];
  field: ReviewDecision['field'];
  value: string | null;
  derived_json: string | null;
  evidence_json: string | null;
  created_at: string;
  created_by: string;
}

// ============================================================================
// Stats
// ============================================================================

export async function queryStats(db: D1Database): Promise<WorkbenchStats> {
  const [
    stagedCount,
    decisionsCount,
    needsReviewCount,
    missingDates,
    missingTitles,
    missingTerms,
    turnoverMarkers,
  ] = await Promise.all([
    db
      .prepare('SELECT COUNT(*) as count FROM staged_documents')
      .first<{ count: number }>(),
    db
      .prepare('SELECT COUNT(*) as count FROM review_decisions')
      .first<{ count: number }>(),
    db
      .prepare(
        'SELECT COUNT(*) as count FROM staged_documents WHERE staging_status = ?'
      )
      .bind('needs_review')
      .first<{ count: number }>(),
    queryTabStats(db, 'missing_dates'),
    queryTabStats(db, 'missing_titles'),
    queryTabStats(db, 'missing_terms'),
    queryTabStats(db, 'turnover_markers'),
  ]);

  return {
    staged_documents: stagedCount?.count || 0,
    decisions: decisionsCount?.count || 0,
    needs_review: needsReviewCount?.count || 0,
    missing_dates: missingDates,
    missing_titles: missingTitles,
    missing_terms: missingTerms,
    turnover_markers: turnoverMarkers,
  };
}

async function queryTabStats(
  db: D1Database,
  tab: string
): Promise<WorkbenchTabStats> {
  let whereClause = '';
  let field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker' =
    'date_enacted';

  switch (tab) {
    case 'missing_dates':
      whereClause = "sd.date_enacted IS NULL OR sd.date_enacted = ''";
      field = 'date_enacted';
      break;
    case 'missing_titles':
      whereClause = "sd.title IS NULL OR sd.title = ''";
      field = 'title';
      break;
    case 'missing_terms':
      whereClause = "sd.term_id IS NULL OR sd.term_id = ''";
      field = 'term_id';
      break;
    case 'turnover_markers':
      whereClause = 'sd.turnover_marker = 1';
      field = 'turnover_marker';
      break;
  }

  const totalQuery = `
    SELECT COUNT(*) as count
    FROM staged_documents sd
    WHERE ${whereClause}
  `;

  const resolvedQuery = `
    SELECT COUNT(*) as count
    FROM staged_documents sd
    WHERE ${whereClause}
      AND EXISTS (
        SELECT 1 FROM review_decisions rd
        WHERE rd.source_record_id = sd.source_record_id
          AND rd.field = ?
          AND rd.decision_type IN ('set_field', 'confirm_turnover')
      )
  `;

  const blockedQuery = `
    SELECT COUNT(*) as count
    FROM staged_documents sd
    WHERE ${whereClause}
      AND EXISTS (
        SELECT 1 FROM review_decisions rd
        WHERE rd.source_record_id = sd.source_record_id
          AND rd.field = ?
          AND rd.decision_type = 'cannot_determine'
      )
  `;

  const [totalResult, resolvedResult, blockedResult] = await Promise.all([
    db.prepare(totalQuery).first<{ count: number }>(),
    db.prepare(resolvedQuery).bind(field).first<{ count: number }>(),
    db.prepare(blockedQuery).bind(field).first<{ count: number }>(),
  ]);

  const total = totalResult?.count || 0;
  const resolved = resolvedResult?.count || 0;
  const blocked = blockedResult?.count || 0;
  const active = total - resolved - blocked;

  return { total, active, resolved, blocked };
}

// ============================================================================
// Terms
// ============================================================================

export async function queryTerms(db: D1Database): Promise<WorkbenchTerm[]> {
  const result = await db
    .prepare(
      'SELECT id, name, year_range, start_date, end_date FROM terms ORDER BY term_number DESC'
    )
    .all<{
      id: string;
      name: string;
      year_range: string;
      start_date: string;
      end_date: string;
    }>();

  return result.results.map(t => ({
    id: t.id,
    label: t.name || t.year_range || t.id,
    start_date: t.start_date,
    end_date: t.end_date,
  }));
}

// ============================================================================
// Staged Documents
// ============================================================================

export interface QueryStagedDocumentsParams {
  tab:
    | 'missing_dates'
    | 'missing_titles'
    | 'missing_terms'
    | 'turnover_markers';
  status: 'active' | 'resolved' | 'blocked' | 'all';
  page: number;
  limit: number;
  search: string;
}

export async function queryStagedDocuments(
  db: D1Database,
  params: QueryStagedDocumentsParams
) {
  const { tab, status, page, limit, search } = params;
  const offset = (page - 1) * limit;

  // Build WHERE clause based on tab
  let whereClause = '';
  switch (tab) {
    case 'missing_dates':
      whereClause = "sd.date_enacted IS NULL OR sd.date_enacted = ''";
      break;
    case 'missing_titles':
      whereClause = "sd.title IS NULL OR sd.title = ''";
      break;
    case 'missing_terms':
      whereClause = "sd.term_id IS NULL OR sd.term_id = ''";
      break;
    case 'turnover_markers':
      whereClause = 'sd.turnover_marker = 1';
      break;
  }

  // Determine field for status filter
  const fieldMap = {
    missing_dates: 'date_enacted',
    missing_titles: 'title',
    missing_terms: 'term_id',
    turnover_markers: 'turnover_marker',
  } as const;
  const field = fieldMap[tab];

  // Status filter (subquery for decision)
  let statusFilter = '';
  if (status !== 'all') {
    if (status === 'active') {
      statusFilter = `AND NOT EXISTS (
        SELECT 1 FROM review_decisions rd
        WHERE rd.source_record_id = sd.source_record_id AND rd.field = '${field}'
      )`;
    } else if (status === 'resolved') {
      statusFilter = `AND EXISTS (
        SELECT 1 FROM review_decisions rd
        WHERE rd.source_record_id = sd.source_record_id
          AND rd.field = '${field}'
          AND rd.decision_type IN ('set_field', 'confirm_turnover')
      )`;
    } else if (status === 'blocked') {
      statusFilter = `AND EXISTS (
        SELECT 1 FROM review_decisions rd
        WHERE rd.source_record_id = sd.source_record_id
          AND rd.field = '${field}'
          AND rd.decision_type = 'cannot_determine'
      )`;
    }
  }

  // Search filter (bound params — never interpolate user input)
  let searchFilter = '';
  const searchParams: string[] = [];
  if (search) {
    searchFilter = `AND (
      sd.document_type LIKE ?
      OR sd.number LIKE ?
      OR sd.normalized_number LIKE ?
      OR sd.title LIKE ?
      OR sd.source_record_id LIKE ?
    )`;
    const like = `%${search}%`;
    searchParams.push(like, like, like, like, like);
  }

  const whereSQL = `WHERE ${whereClause} ${statusFilter} ${searchFilter}`;

  // Count query
  const countResult = await db
    .prepare(`SELECT COUNT(*) as count FROM staged_documents sd ${whereSQL}`)
    .bind(...searchParams)
    .first<{ count: number }>();
  const total = countResult?.count || 0;

  // Data query (without raw_payload_json for list view)
  const dataQuery = `
    SELECT
      sd.id, sd.source_record_id, sd.candidate_document_id,
      sd.document_type, sd.number, sd.normalized_number,
      sd.title, sd.date_enacted, sd.pdf_url, sd.term_id,
      sd.session_id, sd.staging_status, sd.review_reason,
      sd.turnover_marker, sd.publication_status,
      sr.source_key, sr.source_url, sr.content_hash,
      sr.pdf_reachability, sr.pdf_redirect_url, sr.pdf_checked_at
    FROM staged_documents sd
    LEFT JOIN source_records sr ON sd.source_record_id = sr.id
    ${whereSQL}
    ORDER BY sd.document_type, sd.normalized_number, sd.id
    LIMIT ? OFFSET ?
  `;

  const itemsResult = await db
    .prepare(dataQuery)
    .bind(...searchParams, limit, offset)
    .all();

  return {
    items: itemsResult.results.map(row => ({
      id: row.id,
      source_record_id: row.source_record_id,
      candidate_document_id: row.candidate_document_id,
      document_type: row.document_type,
      number: row.number,
      normalized_number: row.normalized_number,
      title: row.title,
      date_enacted: row.date_enacted,
      pdf_url: row.pdf_url,
      term_id: row.term_id,
      session_id: row.session_id,
      staging_status: row.staging_status,
      review_reason: row.review_reason,
      turnover_marker: row.turnover_marker === 1,
      official_pdf_url: officialPdfUrl(row.pdf_url),
      local_mirror_path: '',
      source_record: {
        id: row.source_record_id || '',
        source_key: row.source_key || '',
        source_url: row.source_url || '',
        content_hash: row.content_hash || '',
        pdf_reachability: row.pdf_reachability || '',
        pdf_redirect_url: row.pdf_redirect_url,
        pdf_checked_at: row.pdf_checked_at,
        raw_payload_json: {},
      },
      projected_fields: {
        date_enacted: { status: 'active', decision: null },
        title: { status: 'active', decision: null },
        term_id: { status: 'active', decision: null },
        turnover_marker: { status: 'active', decision: null },
      },
      review_decisions: [],
    })),
    total,
    page,
    limit,
    has_more: offset + limit < total,
  };
}

// ============================================================================
// Single Document (with raw_payload_json and decisions)
// ============================================================================

export async function queryDecoratedDocument(
  db: D1Database,
  id: string
): Promise<WorkbenchDocument | null> {
  // Fetch staged doc + source record
  const docResult = await db
    .prepare(
      `
      SELECT
        sd.*, sr.source_key, sr.source_url, sr.content_hash,
        sr.pdf_reachability, sr.pdf_redirect_url, sr.pdf_checked_at, sr.raw_payload_json
      FROM staged_documents sd
      LEFT JOIN source_records sr ON sd.source_record_id = sr.id
      WHERE sd.id = ? OR sd.source_record_id = ?
      LIMIT 1
    `
    )
    .bind(id, id)
    .first();

  if (!docResult) return null;

  const row = docResult as StagedDocumentRow & SourceRecordRow;

  // Fetch decisions
  const decisionsResult = await db
    .prepare(
      `SELECT * FROM review_decisions WHERE source_record_id = ? ORDER BY created_at DESC`
    )
    .bind(row.source_record_id)
    .all<ReviewDecisionRow>();

  const decisions: ReviewDecision[] = decisionsResult.results.map(d => ({
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
    is_current_source_hash: d.source_content_hash === row.content_hash,
  }));

  // Build projected fields
  const projectedFields: Record<
    string,
    {
      status: 'active' | 'resolved' | 'blocked';
      decision: ReviewDecision | null;
    }
  > = {
    date_enacted: { status: 'active', decision: null },
    title: { status: 'active', decision: null },
    term_id: { status: 'active', decision: null },
    turnover_marker: { status: 'active', decision: null },
  };

  for (const decision of decisions) {
    if (decision.is_current_source_hash && decision.field) {
      const status =
        decision.decision_type === 'set_field' ||
        decision.decision_type === 'confirm_turnover'
          ? 'resolved'
          : decision.decision_type === 'cannot_determine'
            ? 'blocked'
            : 'active';
      projectedFields[decision.field] = { status, decision };
    }
  }

  return {
    id: row.id,
    source_record_id: row.source_record_id,
    candidate_document_id: row.candidate_document_id,
    document_type: row.document_type,
    number: row.number,
    normalized_number: row.normalized_number,
    title: row.title,
    date_enacted: row.date_enacted,
    pdf_url: row.pdf_url,
    term_id: row.term_id,
    session_id: row.session_id,
    staging_status: row.staging_status,
    review_reason: row.review_reason,
    turnover_marker: row.turnover_marker === 1,
    official_pdf_url: officialPdfUrl(row.pdf_url),
    local_mirror_path: '',
    source_record: {
      id: row.source_record_id,
      source_key: row.source_key,
      source_url: row.source_url,
      content_hash: row.content_hash,
      pdf_reachability: row.pdf_reachability,
      pdf_redirect_url: row.pdf_redirect_url,
      pdf_checked_at: row.pdf_checked_at,
      raw_payload_json: row.raw_payload_json
        ? JSON.parse(row.raw_payload_json)
        : {},
    },
    projected_fields: projectedFields,
    review_decisions: decisions,
  };
}

// ============================================================================
// Create Decision
// ============================================================================

export async function createDecision(
  db: D1Database,
  createdBy: string,
  body: {
    source_record_id: string;
    staged_document_id: string;
    decision_type: 'set_field' | 'cannot_determine' | 'confirm_turnover';
    field: 'date_enacted' | 'title' | 'term_id' | 'turnover_marker';
    value?: string;
    evidence: ReviewEvidence[];
  }
): Promise<{ decision: ReviewDecision; item: WorkbenchDocument | null }> {
  // Validate source_record exists
  const sourceResult = await db
    .prepare('SELECT content_hash FROM source_records WHERE id = ?')
    .bind(body.source_record_id)
    .first<{ content_hash: string }>();

  if (!sourceResult) {
    throw new Error('Unknown source_record_id');
  }

  const contentHash = sourceResult.content_hash;

  // Auto-compute derived
  let derived: { term_id: string | null; term_inference: string } | null = null;
  if (
    body.decision_type === 'set_field' &&
    body.field === 'date_enacted' &&
    body.value
  ) {
    const terms = await queryTerms(db);
    const inferred = inferTerm(body.value, terms);
    derived = { term_id: inferred.term_id, term_inference: 'auto' };
  } else if (body.decision_type === 'set_field' && body.field === 'term_id') {
    derived = { term_id: body.value || null, term_inference: 'manual' };
  } else if (body.decision_type === 'confirm_turnover') {
    derived = { term_id: body.value || null, term_inference: 'manual' };
  }

  const decisionId = `rvd_${crypto.randomUUID()}`;

  await db
    .prepare(
      `
      INSERT INTO review_decisions (
        id, schema_version, source_record_id, staged_document_id,
        source_content_hash, decision_type, field, value,
        derived_json, evidence_json, created_at, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'), ?)
    `
    )
    .bind(
      decisionId,
      'review-decision-v1',
      body.source_record_id,
      body.staged_document_id,
      contentHash,
      body.decision_type,
      body.field,
      body.value || null,
      derived ? JSON.stringify(derived) : null,
      JSON.stringify(body.evidence),
      createdBy
    )
    .run();

  // Fetch the decorated document
  const item = await queryDecoratedDocument(db, body.staged_document_id);

  const decision: ReviewDecision = {
    id: decisionId,
    source_record_id: body.source_record_id,
    staged_document_id: body.staged_document_id,
    decision_type: body.decision_type,
    field: body.field,
    value: body.value || null,
    derived,
    evidence: body.evidence,
    created_at: new Date().toISOString(),
    created_by: createdBy,
    is_current_source_hash: true,
  };

  return { decision, item };
}

// ============================================================================
// Helpers
// ============================================================================

function inferTerm(
  dateValue: string,
  terms: WorkbenchTerm[]
): { term_id: string | null; term_inference: string } {
  const time = Date.parse(dateValue);
  if (Number.isNaN(time)) return { term_id: null, term_inference: 'unmatched' };

  const matches = terms.filter(term => {
    const start = Date.parse(term.start_date);
    const end = Date.parse(term.end_date);
    return (
      !Number.isNaN(start) && !Number.isNaN(end) && time >= start && time <= end
    );
  });

  if (matches.length === 1) {
    return { term_id: matches[0].id, term_inference: 'auto' };
  }
  if (matches.length > 1) {
    return { term_id: null, term_inference: 'ambiguous' };
  }
  return { term_id: null, term_inference: 'unmatched' };
}

export function officialPdfUrl(pdfUrl: string): string {
  if (!pdfUrl) return '';
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `https://losbanos.gov.ph/${pdfUrl.replace(/^\/+/, '')}`;
}
