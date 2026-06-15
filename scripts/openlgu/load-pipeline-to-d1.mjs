#!/usr/bin/env node

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PIPELINE_DIR = path.join(ROOT, 'pipeline/openlgu');

const BATCH_SIZE = 50;

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function escapeSql(value) {
  if (value === null || value === undefined) return 'NULL';
  if (typeof value === 'string') {
    return `'${value.replace(/'/g, "''")}'`;
  }
  if (typeof value === 'boolean') return value ? '1' : '0';
  if (typeof value === 'object')
    return `'${JSON.stringify(value).replace(/'/g, "''")}'`;
  return String(value);
}

function batchInsert(table, columns, rows, batchSize = BATCH_SIZE) {
  if (rows.length === 0) return '';
  const statements = [];
  for (let i = 0; i < rows.length; i += batchSize) {
    const chunk = rows.slice(i, i + batchSize);
    const values = chunk
      .map(row => {
        const vals = columns.map(col => escapeSql(row[col]));
        return `(${vals.join(', ')})`;
      })
      .join(',\n    ');
    statements.push(
      `INSERT OR REPLACE INTO ${table} (${columns.join(', ')})\n    VALUES\n    ${values};`
    );
  }
  return statements.join('\n\n');
}

function wranglerCommand(sql, isRemote) {
  const flag = isRemote ? '--remote' : '--local';
  const tempFile = path.join(ROOT, `.wrangler-temp-${Date.now()}.sql`);
  fs.writeFileSync(tempFile, sql);
  try {
    const cmd = `npx wrangler d1 execute BETTERLB_DB ${flag} --file="${tempFile}"`;
    console.log(`  Executing batch...`);
    execSync(cmd, { cwd: ROOT, stdio: 'inherit' });
  } finally {
    fs.unlinkSync(tempFile);
  }
}

function loadSourceRecords(isRemote) {
  console.log('\nLoading source_records...');
  const sourceRecords = readJsonl(
    path.join(PIPELINE_DIR, 'source-records.jsonl')
  );
  if (!sourceRecords.length) {
    console.log('  No source records found.');
    return;
  }

  const sourceKeys = [
    ...new Set(sourceRecords.map(r => r.source_key).filter(Boolean)),
  ];
  if (sourceKeys.length) {
    const scrapeSourcesSql = sourceKeys
      .map(key => {
        const id = `scrape_${key}`;
        return `INSERT OR IGNORE INTO scrape_sources (id, name, source_type, base_url) VALUES ('${id}', '${key}', 'lgu_website', 'https://losbanos.gov.ph');`;
      })
      .join('\n');
    console.log(`  Loading ${sourceKeys.length} scrape_sources...`);
    wranglerCommand(scrapeSourcesSql, isRemote);
  }

  const columns = [
    'id',
    'scrape_run_id',
    'source_id',
    'source_record_id',
    'source_url',
    'source_kind',
    'entity_type',
    'content_hash',
    'raw_payload_json',
    'raw_text',
    'source_updated_at',
    'captured_at',
    'parsed_status',
    'parse_error',
    'pdf_url',
    'pdf_reachability',
    'pdf_redirect_url',
    'pdf_checked_at',
    'source_key',
    'first_seen_at',
    'last_seen_at',
    'collector_version',
  ];

  const rows = sourceRecords.map(r => ({
    id: r.id,
    scrape_run_id: null, // scrape_runs not populated yet, skip FK
    source_id: sourceKeys.includes(r.source_key)
      ? `scrape_${r.source_key}`
      : null,
    source_record_id: null,
    source_url: r.source_url || null,
    source_kind: r.source_kind || 'website_table_row',
    entity_type: 'document',
    content_hash: r.content_hash || null,
    raw_payload_json: r.raw_payload_json || null,
    raw_text: null,
    source_updated_at: null,
    captured_at: r.first_seen_at || null,
    parsed_status: 'parsed',
    parse_error: null,
    pdf_url: r.pdf_url || null,
    pdf_reachability: r.pdf_reachability || null,
    pdf_redirect_url: r.pdf_redirect_url || null,
    pdf_checked_at: r.pdf_checked_at || null,
    source_key: r.source_key || null,
    first_seen_at: r.first_seen_at || null,
    last_seen_at: r.last_seen_at || null,
    collector_version: r.collector_version || null,
  }));

  const sql = batchInsert('source_records', columns, rows);
  console.log(`  Loading ${rows.length} source_records...`);
  wranglerCommand(sql, isRemote);
  console.log(`  Done: ${rows.length} source_records.`);
}

function loadStagedDocuments(isRemote) {
  console.log('\nLoading staged_documents...');
  const stagedDocs = readJsonl(
    path.join(PIPELINE_DIR, 'staged-documents.jsonl')
  );
  if (!stagedDocs.length) {
    console.log('  No staged documents found.');
    return;
  }

  const columns = [
    'id',
    'source_record_id',
    'candidate_document_id',
    'document_type',
    'number',
    'normalized_number',
    'title',
    'date_enacted',
    'pdf_url',
    'term_id',
    'session_id',
    'raw_author_text',
    'mover_text',
    'seconder_text',
    'publication_status',
    'verification_state',
    'confidence_score',
    'staging_status',
    'review_reason',
    'turnover_marker',
    'co_author_text',
    'matching_key',
    'created_at',
    'updated_at',
  ];

  const rows = stagedDocs.map(d => ({
    id: d.id,
    source_record_id: d.source_record_id,
    candidate_document_id: d.candidate_document_id || null,
    document_type: d.document_type || null,
    number: d.number || null,
    normalized_number: d.normalized_number || null,
    title: d.title || null,
    date_enacted: d.date_enacted || null,
    pdf_url: d.pdf_url || null,
    term_id: d.term_id || null,
    session_id: d.session_id || null,
    raw_author_text: d.raw_author_text || null,
    mover_text: d.mover_text || null,
    seconder_text: d.seconder_text || null,
    publication_status: d.publication_status || 'active',
    verification_state: d.verification_state || 'unverified',
    confidence_score: d.confidence_score || null,
    staging_status: d.staging_status || 'new',
    review_reason: d.review_reason || null,
    turnover_marker: d.turnover_marker ? 1 : 0,
    co_author_text: d.co_author_text || null,
    matching_key: d.matching_key || null,
    created_at: d.created_at || null,
    updated_at: d.updated_at || null,
  }));

  const sql = batchInsert('staged_documents', columns, rows);
  console.log(`  Loading ${rows.length} staged_documents...`);
  wranglerCommand(sql, isRemote);
  console.log(`  Done: ${rows.length} staged_documents.`);
}

function loadStagedPersonRefs(isRemote) {
  console.log('\nLoading staged_document_person_refs...');
  const personRefs = readJsonl(
    path.join(PIPELINE_DIR, 'staged-person-refs.jsonl')
  );
  if (!personRefs.length) {
    console.log('  No person refs found.');
    return;
  }

  const columns = [
    'id',
    'staged_document_id',
    'role',
    'raw_name',
    'candidate_person_id',
    'confidence_score',
    'resolution_status',
    'created_at',
  ];

  const rows = personRefs.map(p => ({
    id: p.id,
    staged_document_id: p.staged_document_id,
    role: p.role || null,
    raw_name: p.raw_name || null,
    candidate_person_id: p.candidate_person_id || null,
    confidence_score: p.confidence_score || null,
    resolution_status: p.resolution_status || 'unresolved',
    created_at: p.created_at || null,
  }));

  const sql = batchInsert('staged_document_person_refs', columns, rows);
  console.log(`  Loading ${rows.length} staged_document_person_refs...`);
  wranglerCommand(sql, isRemote);
  console.log(`  Done: ${rows.length} staged_document_person_refs.`);
}

function loadReviewDecisions(isRemote) {
  console.log('\nLoading review_decisions...');
  const decisions = readJsonl(
    path.join(PIPELINE_DIR, 'review-decisions.jsonl')
  );
  if (!decisions.length) {
    console.log('  No review decisions found (expected on first run).');
    return;
  }

  const columns = [
    'id',
    'schema_version',
    'source_record_id',
    'staged_document_id',
    'source_content_hash',
    'decision_type',
    'field',
    'value',
    'derived_json',
    'term_override_id',
    'term_override_reason',
    'evidence_json',
    'created_at',
    'created_by',
  ];

  const rows = decisions.map(d => ({
    id: d.id,
    schema_version: d.schema_version || 'review-decision-v1',
    source_record_id: d.source_record_id,
    staged_document_id: d.staged_document_id || null,
    source_content_hash: d.source_content_hash || null,
    decision_type: d.decision_type,
    field: d.field,
    value: d.value || null,
    derived_json: d.derived ? JSON.stringify(d.derived) : null,
    term_override_id: d.term_override_id || null,
    term_override_reason: d.term_override_reason || null,
    evidence_json: JSON.stringify(d.evidence || []),
    created_at: d.created_at || null,
    created_by: d.created_by || 'system',
  }));

  const sql = batchInsert('review_decisions', columns, rows);
  console.log(`  Loading ${rows.length} review_decisions...`);
  wranglerCommand(sql, isRemote);
  console.log(`  Done: ${rows.length} review_decisions.`);
}

function loadTerms(isRemote) {
  console.log('\nLoading terms...');
  const termsPath = path.join(PIPELINE_DIR, 'terms.json');
  if (!fs.existsSync(termsPath)) {
    console.log('  No terms file found.');
    return;
  }

  const terms = JSON.parse(fs.readFileSync(termsPath, 'utf8'));
  const termNumberMap = {
    sb_9: 9,
    sb_10: 10,
    sb_11: 11,
    sb_12: 12,
    sb_13: 13,
    sb_14: 14,
    sb_15: 15,
    sb_16: 16,
  };

  const sql = terms
    .map(t => {
      const id = t.term_id || t.id;
      const num = termNumberMap[id] || parseInt(id.replace('sb_', ''), 10);
      const ordinal = `${num}${num < 20 ? ['th', 'st', 'nd', 'rd'][((num + 90) % 10) - 4 || 'th'] : 'th'}`;
      const label =
        t.label ||
        `${t.start_date?.split('-')[0]}-${t.end_date?.split('-')[0]}`;
      return `INSERT OR REPLACE INTO terms (id, term_number, ordinal, name, start_date, end_date, year_range) VALUES ('${id}', ${num}, '${ordinal}', 'Sangguniang Bayan ${label}', '${t.start_date}', '${t.end_date}', '${label}');`;
    })
    .join('\n');

  console.log(`  Loading ${terms.length} terms...`);
  wranglerCommand(sql, isRemote);
  console.log(`  Done: ${terms.length} terms.`);
}

function main() {
  const args = process.argv.slice(2);
  const isRemote = args.includes('--remote');
  const isLocal = args.includes('--local') || !isRemote;

  console.log(`\nOpenLGU Pipeline -> D1 Loader`);
  console.log(
    `Target: ${isRemote ? 'REMOTE (production)' : 'LOCAL (development)'}`
  );

  if (!fs.existsSync(PIPELINE_DIR)) {
    console.error(`\nError: Pipeline directory not found: ${PIPELINE_DIR}`);
    process.exit(1);
  }

  // Load terms FIRST - staged_documents have FK to terms
  loadTerms(!isLocal);
  loadSourceRecords(!isLocal);
  loadStagedDocuments(!isLocal);
  loadStagedPersonRefs(!isLocal);
  loadReviewDecisions(!isLocal);

  console.log('\n✓ Pipeline data loaded to D1.\n');
}

main();
