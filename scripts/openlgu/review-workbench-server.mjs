#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PORT = Number(process.env.OPENLGU_REVIEW_PORT || 8789);
const HOST = '127.0.0.1';
const API_PREFIX = '/api/workbench';

const PATHS = {
  stagedDocuments: path.join(ROOT, 'pipeline/openlgu/staged-documents.jsonl'),
  stagedPersonRefs: path.join(
    ROOT,
    'pipeline/openlgu/staged-person-refs.jsonl'
  ),
  sourceRecords: path.join(ROOT, 'pipeline/openlgu/source-records.jsonl'),
  reconciliationShadow: path.join(
    ROOT,
    'pipeline/openlgu/reconciliation-shadow.json'
  ),
  decisions: path.join(ROOT, 'pipeline/openlgu/review-decisions.jsonl'),
  terms: path.join(ROOT, 'pipeline/openlgu/terms.json'),
  fallbackTerms: path.join(ROOT, 'pipeline/openlgu/reference/terms.json'),
  sourcesRoot: path.join(ROOT, 'pipeline/openlgu/sources'),
};

let snapshot;
snapshot = loadSnapshot();

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback;
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function writeJsonlAppend(filePath, record) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.appendFileSync(filePath, `${JSON.stringify(record)}\n`);
}

function normalizeTerm(term) {
  return {
    id: term.id || term.term_id,
    label: term.label || term.name || term.id || term.term_id,
    start_date: term.start_date,
    end_date: term.end_date,
  };
}

function loadSourceRuns() {
  if (!fs.existsSync(PATHS.sourcesRoot)) return [];
  return fs
    .readdirSync(PATHS.sourcesRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => {
      const runPath = path.join(
        PATHS.sourcesRoot,
        entry.name,
        'latest/run.json'
      );
      const run = readJson(runPath, null);
      return run ? { source_key: entry.name, ...run } : null;
    })
    .filter(Boolean);
}

function loadSnapshot() {
  try {
    const stagedDocuments = readJsonl(PATHS.stagedDocuments);
    const stagedPersonRefs = readJsonl(PATHS.stagedPersonRefs);
    const sourceRecords = readJsonl(PATHS.sourceRecords);
    const sourceRecordById = new Map(
      sourceRecords.map(record => [record.id, record])
    );
    const reconciliationShadow = readJson(PATHS.reconciliationShadow, {});
    const decisions = readJsonl(PATHS.decisions);
    const termPath = fs.existsSync(PATHS.terms)
      ? PATHS.terms
      : PATHS.fallbackTerms;
    const terms = readJson(termPath, [])
      .map(normalizeTerm)
      .filter(term => term.id);
    const sourceRuns = loadSourceRuns();

    return {
      ok: true,
      error: null,
      loaded_at: new Date().toISOString(),
      paths: PATHS,
      stagedDocuments,
      stagedPersonRefs,
      sourceRecords,
      sourceRecordById,
      reconciliationShadow,
      decisions,
      terms,
      sourceRuns,
    };
  } catch (error) {
    const previous = snapshot || {};
    return {
      ...previous,
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      loaded_at: previous.loaded_at || null,
    };
  }
}

function inferTerm(dateValue, terms) {
  if (!dateValue) return { term_id: null, term_inference: 'unmatched' };
  const date = Date.parse(dateValue);
  if (Number.isNaN(date)) return { term_id: null, term_inference: 'unmatched' };

  const matches = terms.filter(term => {
    const start = Date.parse(term.start_date);
    const end = Date.parse(term.end_date);
    return (
      !Number.isNaN(start) && !Number.isNaN(end) && date >= start && date <= end
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

function decisionKey(decision) {
  return `${decision.source_record_id}|${decision.field || '__row__'}`;
}

function buildProjection(state = snapshot) {
  const latest = new Map();
  const decisionsBySource = new Map();

  for (const decision of state.decisions || []) {
    const sourceRecord = state.sourceRecordById?.get(decision.source_record_id);
    const currentHash = sourceRecord?.content_hash || null;
    const isCurrent =
      !decision.source_content_hash ||
      !currentHash ||
      decision.source_content_hash === currentHash;
    const enriched = { ...decision, is_current_source_hash: isCurrent };

    if (!decisionsBySource.has(decision.source_record_id)) {
      decisionsBySource.set(decision.source_record_id, []);
    }
    decisionsBySource.get(decision.source_record_id).push(enriched);

    if (isCurrent) latest.set(decisionKey(decision), enriched);
  }

  return { latest, decisionsBySource };
}

function fieldState(doc, field, projection) {
  const decision = projection.latest.get(`${doc.source_record_id}|${field}`);
  if (!decision) return { status: 'active', decision: null };
  if (
    decision.decision_type === 'set_field' ||
    decision.decision_type === 'confirm_turnover'
  ) {
    return { status: 'resolved', decision };
  }
  if (decision.decision_type === 'cannot_determine')
    return { status: 'blocked', decision };
  return { status: 'active', decision };
}

function officialPdfUrl(pdfUrl) {
  if (!pdfUrl) return '';
  if (/^https?:\/\//i.test(pdfUrl)) return pdfUrl;
  return `https://losbanos.gov.ph/${String(pdfUrl).replace(/^\/+/, '')}`;
}

function localMirrorPath(pdfUrl) {
  if (!pdfUrl || /^https?:\/\//i.test(pdfUrl)) return '';
  const relative = String(pdfUrl).replace(/^\/+/, '');
  const candidate = path.join(ROOT, relative);
  return fs.existsSync(candidate) ? relative : '';
}

function decorateDocument(doc, projection = buildProjection()) {
  const sourceRecord =
    snapshot.sourceRecordById.get(doc.source_record_id) || null;
  const decisions =
    projection.decisionsBySource.get(doc.source_record_id) || [];
  return {
    ...doc,
    source_record: sourceRecord
      ? {
          id: sourceRecord.id,
          source_key: sourceRecord.source_key,
          source_url: sourceRecord.source_url,
          content_hash: sourceRecord.content_hash,
          pdf_reachability: sourceRecord.pdf_reachability,
          pdf_redirect_url: sourceRecord.pdf_redirect_url,
          pdf_checked_at: sourceRecord.pdf_checked_at,
          raw_payload_json: sourceRecord.raw_payload_json,
        }
      : null,
    official_pdf_url: officialPdfUrl(doc.pdf_url),
    local_mirror_path: localMirrorPath(doc.pdf_url),
    projected_fields: {
      date_enacted: fieldState(doc, 'date_enacted', projection),
      title: fieldState(doc, 'title', projection),
      term_id: fieldState(doc, 'term_id', projection),
      turnover_marker: fieldState(doc, 'turnover_marker', projection),
    },
    review_decisions: decisions,
  };
}

function tabField(tab) {
  if (tab === 'missing_titles') return 'title';
  if (tab === 'missing_terms') return 'term_id';
  if (tab === 'turnover_markers') return 'turnover_marker';
  return 'date_enacted';
}

function filterDocs(params) {
  const tab = params.get('tab') || 'missing_dates';
  const status = params.get('status') || 'active';
  const search = (params.get('search') || '').trim().toLowerCase();
  const projection = buildProjection();
  const field = tabField(tab);

  let docs = snapshot.stagedDocuments.filter(doc => {
    if (tab === 'missing_dates' && String(doc.date_enacted || '').trim())
      return false;
    if (tab === 'missing_titles' && String(doc.title || '').trim())
      return false;
    if (tab === 'missing_terms' && String(doc.term_id || '').trim())
      return false;
    if (tab === 'turnover_markers' && !doc.turnover_marker) return false;

    const projected = fieldState(doc, field, projection);
    if (status !== 'all' && projected.status !== status) return false;

    if (search) {
      const haystack = [
        doc.document_type,
        doc.number,
        doc.normalized_number,
        doc.title,
        doc.source_record_id,
      ]
        .join(' ')
        .toLowerCase();
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  docs = docs.sort(
    (a, b) =>
      [
        a.document_type.localeCompare(b.document_type),
        a.normalized_number.localeCompare(b.normalized_number),
        a.id.localeCompare(b.id),
      ].find(result => result !== 0) || 0
  );

  return { docs, projection };
}

function stats() {
  const projection = buildProjection();
  const tabs = [
    'missing_dates',
    'missing_titles',
    'missing_terms',
    'turnover_markers',
  ];
  const result = {};

  for (const tab of tabs) {
    const field = tabField(tab);
    let base = snapshot.stagedDocuments;
    if (tab === 'missing_dates')
      base = base.filter(doc => !String(doc.date_enacted || '').trim());
    if (tab === 'missing_titles')
      base = base.filter(doc => !String(doc.title || '').trim());
    if (tab === 'missing_terms')
      base = base.filter(doc => !String(doc.term_id || '').trim());
    if (tab === 'turnover_markers')
      base = base.filter(doc => doc.turnover_marker);

    result[tab] = {
      total: base.length,
      active: base.filter(
        doc => fieldState(doc, field, projection).status === 'active'
      ).length,
      resolved: base.filter(
        doc => fieldState(doc, field, projection).status === 'resolved'
      ).length,
      blocked: base.filter(
        doc => fieldState(doc, field, projection).status === 'blocked'
      ).length,
    };
  }

  return {
    staged_documents: snapshot.stagedDocuments.length,
    decisions: snapshot.decisions.length,
    needs_review: snapshot.stagedDocuments.filter(
      doc => doc.staging_status === 'needs_review'
    ).length,
    ...result,
  };
}

function json(req, res, status, body) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...corsHeaders(req),
  });
  res.end(JSON.stringify(body));
}

function corsHeaders(req) {
  const origin = req?.headers?.origin;
  const allowedOrigins = new Set([
    'http://localhost:5173',
    'http://127.0.0.1:5173',
  ]);
  return {
    'Access-Control-Allow-Origin': allowedOrigins.has(origin)
      ? origin
      : 'http://localhost:5173',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

async function readBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString('utf8');
  return raw ? JSON.parse(raw) : {};
}

function validateDate(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(String(value || '')) &&
    !Number.isNaN(Date.parse(value))
  );
}

function createDecision(body) {
  const sourceRecord = snapshot.sourceRecordById.get(body.source_record_id);
  if (!sourceRecord) {
    const error = new Error('Unknown source_record_id');
    error.status = 400;
    throw error;
  }

  const decisionType = body.decision_type;
  const field = body.field;
  if (
    !['set_field', 'cannot_determine', 'confirm_turnover'].includes(
      decisionType
    )
  ) {
    const error = new Error('Unsupported decision_type for v1');
    error.status = 400;
    throw error;
  }
  if (
    !['date_enacted', 'title', 'term_id', 'turnover_marker'].includes(field)
  ) {
    const error = new Error('Unsupported field');
    error.status = 400;
    throw error;
  }
  if (
    decisionType === 'set_field' &&
    field === 'date_enacted' &&
    !validateDate(body.value)
  ) {
    const error = new Error('date_enacted must be YYYY-MM-DD');
    error.status = 400;
    throw error;
  }
  if (
    decisionType === 'set_field' &&
    field === 'title' &&
    !String(body.value || '').trim()
  ) {
    const error = new Error('title value is required');
    error.status = 400;
    throw error;
  }
  if (decisionType === 'set_field' && field === 'term_id') {
    const termId = String(body.value || '').trim();
    if (!snapshot.terms.some(term => term.id === termId)) {
      const error = new Error('term_id requires a valid term id');
      error.status = 400;
      throw error;
    }
  }
  if (decisionType === 'confirm_turnover') {
    if (field !== 'turnover_marker') {
      const error = new Error(
        'confirm_turnover decisions must use turnover_marker field'
      );
      error.status = 400;
      throw error;
    }
    const termId = String(body.value || '').trim();
    if (!snapshot.terms.some(term => term.id === termId)) {
      const error = new Error('confirm_turnover requires a valid term id');
      error.status = 400;
      throw error;
    }
  }

  let derived = body.derived || null;
  if (decisionType === 'set_field' && field === 'date_enacted') {
    derived = inferTerm(body.value, snapshot.terms);
  }
  if (decisionType === 'confirm_turnover') {
    derived = {
      term_id: String(body.value || '').trim(),
      term_inference: 'manual',
    };
  }
  if (decisionType === 'set_field' && field === 'term_id') {
    derived = {
      term_id: String(body.value || '').trim(),
      term_inference: 'manual',
    };
  }

  return {
    schema_version: 'review-decision-v1',
    id: `rvd_${crypto.randomUUID()}`,
    source_record_id: body.source_record_id,
    staged_document_id: body.staged_document_id || null,
    source_content_hash: sourceRecord.content_hash || null,
    decision_type: decisionType,
    field,
    value:
      decisionType === 'cannot_determine'
        ? null
        : String(body.value || '').trim(),
    derived,
    term_override_id: body.term_override_id || null,
    term_override_reason: body.term_override_reason || null,
    evidence: Array.isArray(body.evidence) ? body.evidence : [],
    created_at: new Date().toISOString(),
    created_by: 'local',
  };
}

async function handle(req, res) {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  if (req.method === 'OPTIONS') {
    res.writeHead(204, corsHeaders(req));
    res.end();
    return;
  }

  try {
    if (!url.pathname.startsWith(API_PREFIX)) {
      json(req, res, 404, { error: 'Not found' });
      return;
    }

    const route = url.pathname.slice(API_PREFIX.length) || '/';

    if (req.method === 'GET' && route === '/health') {
      json(req, res, 200, {
        ok: snapshot.ok,
        error: snapshot.error,
        loaded_at: snapshot.loaded_at,
        artifacts: {
          staged_documents: snapshot.stagedDocuments?.length || 0,
          staged_person_refs: snapshot.stagedPersonRefs?.length || 0,
          source_records: snapshot.sourceRecords?.length || 0,
          review_decisions: snapshot.decisions?.length || 0,
          terms: snapshot.terms?.length || 0,
        },
      });
      return;
    }

    if (req.method === 'POST' && route === '/reload') {
      snapshot = loadSnapshot();
      json(req, res, snapshot.ok ? 200 : 500, {
        ok: snapshot.ok,
        error: snapshot.error,
        loaded_at: snapshot.loaded_at,
      });
      return;
    }

    if (req.method === 'GET' && route === '/stats') {
      json(req, res, 200, stats());
      return;
    }

    if (req.method === 'GET' && route === '/terms') {
      json(req, res, 200, { items: snapshot.terms });
      return;
    }

    if (req.method === 'GET' && route === '/artifact-status') {
      json(req, res, 200, {
        loaded_at: snapshot.loaded_at,
        ok: snapshot.ok,
        error: snapshot.error,
        source_runs: snapshot.sourceRuns,
        reconciliation_summary:
          snapshot.reconciliationShadow?.summary ||
          snapshot.reconciliationShadow ||
          null,
      });
      return;
    }

    if (req.method === 'GET' && route === '/staged-documents') {
      const page = Math.max(1, Number(url.searchParams.get('page') || 1));
      const limit = Math.min(
        100,
        Math.max(1, Number(url.searchParams.get('limit') || 50))
      );
      const { docs, projection } = filterDocs(url.searchParams);
      const offset = (page - 1) * limit;
      json(req, res, 200, {
        items: docs
          .slice(offset, offset + limit)
          .map(doc => decorateDocument(doc, projection)),
        total: docs.length,
        page,
        limit,
        has_more: offset + limit < docs.length,
      });
      return;
    }

    if (req.method === 'GET' && route.startsWith('/staged-documents/')) {
      const id = decodeURIComponent(route.replace('/staged-documents/', ''));
      const doc = snapshot.stagedDocuments.find(
        item => item.id === id || item.source_record_id === id
      );
      if (!doc) {
        json(req, res, 404, { error: 'Staged document not found' });
        return;
      }
      json(req, res, 200, decorateDocument(doc));
      return;
    }

    if (req.method === 'GET' && route === '/review-decisions') {
      const sourceRecordId = url.searchParams.get('source_record_id');
      const items = sourceRecordId
        ? snapshot.decisions.filter(
            decision => decision.source_record_id === sourceRecordId
          )
        : snapshot.decisions;
      json(req, res, 200, { items });
      return;
    }

    if (req.method === 'POST' && route === '/review-decisions') {
      const body = await readBody(req);
      const decision = createDecision(body);
      writeJsonlAppend(PATHS.decisions, decision);
      snapshot = loadSnapshot();
      const doc = snapshot.stagedDocuments.find(
        item => item.source_record_id === decision.source_record_id
      );
      json(req, res, 201, {
        decision,
        item: doc ? decorateDocument(doc) : null,
      });
      return;
    }

    json(req, res, 404, { error: 'Not found' });
  } catch (error) {
    json(req, res, error.status || 500, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

const server = http.createServer(handle);
server.on('error', error => {
  console.error(
    `Failed to start OpenLGU review workbench server on ${HOST}:${PORT}: ${error.message}`
  );
  process.exit(1);
});
server.listen(PORT, HOST, () => {
  console.log(
    `OpenLGU review workbench server listening at http://${HOST}:${PORT}${API_PREFIX}`
  );
});
