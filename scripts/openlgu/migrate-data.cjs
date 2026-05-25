#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const REF_DIR = path.join(
  __dirname,
  '..',
  '..',
  'pipeline',
  'openlgu',
  'reference'
);

function readJson(name) {
  const fp = path.join(REF_DIR, name);
  if (!fs.existsSync(fp)) return [];
  return JSON.parse(fs.readFileSync(fp, 'utf8'));
}

function esc(val) {
  if (val === null || val === undefined) return 'NULL';
  return "'" + String(val).replace(/'/g, "''") + "'";
}

// --- Fix term_id FK: sb_09 -> sb_9 ---
function fixTermId(termId) {
  if (termId === 'sb_09') return 'sb_9';
  return termId;
}

// --- Infer term_id from date ---
function inferTermId(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d)) return null;
  if (d >= new Date('2016-07-01') && d <= new Date('2019-06-30')) return 'sb_9';
  if (d >= new Date('2019-07-01') && d <= new Date('2022-06-30'))
    return 'sb_10';
  if (d >= new Date('2022-07-01') && d <= new Date('2025-06-30'))
    return 'sb_11';
  if (d >= new Date('2025-07-01') && d <= new Date('2028-06-30'))
    return 'sb_12';
  return null;
}

// --- Map old source_type to new ---
function mapSourceType(old) {
  const m = {
    pdf: 'manual',
    facebook: 'facebook',
    website: 'website',
    ocr: 'ocr',
  };
  return m[old] || 'manual';
}

// --- Map old status to new publication_status ---
function mapPublicationStatus(doc) {
  if (doc.publication_status) return doc.publication_status;
  if (doc.status === 'active') return 'active';
  return 'active';
}

// --- Map old status to verification_state ---
function mapVerificationState(doc) {
  if (doc.verification_state) return doc.verification_state;
  return 'unverified';
}

// --- Dissolved executive session ---
const EXECUTIVE_SESSION_ID = 'sb_11_2025-01-01_executive';

// --- Duplicate membership to remove ---
const DUPLICATE_MEMBERSHIP_ID = 'perez-muriel-laisa-b_sb_12';

function migrate() {
  const lines = [];
  lines.push('PRAGMA defer_foreign_keys=TRUE;');
  lines.push('');

  // --- Persons ---
  const persons = readJson('remote-persons.json');
  for (const p of persons) {
    lines.push(
      `INSERT INTO persons (id, first_name, middle_name, last_name, birth_name, suffix, aliases, created_at, updated_at) VALUES (` +
        `${esc(p.id)}, ${esc(p.first_name)}, ${esc(p.middle_name)}, ${esc(p.last_name)}, ` +
        `${esc(null)}, ${esc(p.suffix)}, ${esc(p.aliases)}, ${esc(p.created_at)}, ${esc(p.updated_at)});`
    );
  }
  lines.push(`-- Persons: ${persons.length}`);
  lines.push('');

  // --- Memberships (fix sb_09, remove duplicate) ---
  const memberships = readJson('remote-memberships.json');
  let membershipCount = 0;
  for (const m of memberships) {
    if (m.id === DUPLICATE_MEMBERSHIP_ID) {
      lines.push(`-- SKIPPED duplicate: ${m.id}`);
      continue;
    }
    const termId = fixTermId(m.term_id);
    lines.push(
      `INSERT INTO memberships (id, person_id, term_id, chamber, role, rank, start_date, end_date, created_at, updated_at) VALUES (` +
        `${esc(m.id)}, ${esc(m.person_id)}, ${esc(termId)}, ${esc(m.chamber)}, ${esc(m.role)}, ` +
        `${m.rank ?? 'NULL'}, ${esc(m.start_date)}, ${esc(m.end_date)}, ${esc(m.created_at)}, ${esc(m.updated_at)});`
    );
    membershipCount += 1;
  }
  lines.push(`-- Memberships: ${membershipCount}`);
  lines.push('');

  // --- Committees ---
  const committees = readJson('remote-committees.json');
  for (const c of committees) {
    lines.push(
      `INSERT INTO committees (id, name, type, description, created_at, updated_at) VALUES (` +
        `${esc(c.id)}, ${esc(c.name)}, ${esc(c.type)}, ${esc(c.description)}, ${esc(c.created_at)}, ${esc(c.updated_at)});`
    );
  }
  lines.push(`-- Committees: ${committees.length}`);
  lines.push('');

  // --- Committee Memberships ---
  const committeeMemberships = readJson('remote-committee_memberships.json');
  for (const cm of committeeMemberships) {
    lines.push(
      `INSERT INTO committee_memberships (id, person_id, committee_id, term_id, role, created_at, updated_at) VALUES (` +
        `${esc(cm.id)}, ${esc(cm.person_id)}, ${esc(cm.committee_id)}, ${esc(cm.term_id)}, ` +
        `${esc(cm.role)}, ${esc(cm.created_at)}, ${esc(cm.updated_at)});`
    );
  }
  lines.push(`-- Committee Memberships: ${committeeMemberships.length}`);
  lines.push('');

  // --- Sessions (skip executive, fix sb_09 -> sb_9) ---
  const sessions = readJson('remote-sessions.json');
  const validSessionIds = new Set();
  for (const s of sessions) {
    if (s.type === 'Executive') {
      lines.push(`-- SKIPPED executive session: ${s.id}`);
      continue;
    }
    const fixedId = s.id.replace(/^sb_09_/, 'sb_9_');
    const fixedTermId = fixTermId(s.term_id);
    validSessionIds.add(fixedId);
    lines.push(
      `INSERT INTO sessions (id, term_id, number, type, date, created_at, updated_at) VALUES (` +
        `${esc(fixedId)}, ${esc(fixedTermId)}, ${s.number ?? 'NULL'}, ${esc(s.type)}, ${esc(s.date)}, ` +
        `${esc(s.created_at)}, ${esc(s.updated_at)});`
    );
  }
  lines.push(
    `-- Sessions: ${sessions.filter(s => s.type !== 'Executive').length}`
  );
  lines.push('');

  // --- Session Absences (fix session_id refs, map maiden names) ---
  const ABSENCE_PERSON_MAP = {
    'sumangil-evangelista-josephine': 'evangelista-josephine-s',
    'alborida-dizon-dona-t': 'alborida-benedicto-s',
  };
  const absences = readJson('remote-session_absences.json');
  const validPersonIds = new Set(persons.map(p => p.id));
  let skippedAbsences = 0;
  for (const a of absences) {
    if (!a.id) {
      skippedAbsences++;
      continue;
    }
    const fixedSessionId = a.session_id
      ? a.session_id.replace(/^sb_09_/, 'sb_9_')
      : a.session_id;
    if (!validSessionIds.has(fixedSessionId)) {
      skippedAbsences++;
      continue;
    }
    const personId = ABSENCE_PERSON_MAP[a.person_id] || a.person_id;
    if (!validPersonIds.has(personId)) {
      skippedAbsences++;
      continue;
    }
    lines.push(
      `INSERT INTO session_absences (id, session_id, person_id, reason, excuse_type, created_at) VALUES (` +
        `${esc(a.id)}, ${esc(fixedSessionId)}, ${esc(personId)}, ${esc(a.reason)}, ` +
        `${esc(a.excuse_type)}, ${esc(a.created_at)});`
    );
  }
  lines.push(
    `-- Session Absences: ${absences.length - skippedAbsences} (${skippedAbsences} skipped)`
  );
  lines.push('');

  // --- Documents (nullify orphan session refs) ---
  const documents = readJson('remote-documents.json');
  let docCount = 0;
  let orphanSessionDocs = 0;
  for (const d of documents) {
    let sessionId = d.session_id === EXECUTIVE_SESSION_ID ? null : d.session_id;
    if (sessionId) {
      sessionId = sessionId.replace(/^sb_09_/, 'sb_9_');
      if (!validSessionIds.has(sessionId)) {
        orphanSessionDocs += 1;
        sessionId = null;
      }
    }
    const termId = d.term_id || inferTermId(d.date_enacted);
    const sourceType = mapSourceType(d.source_type);
    const pubStatus = mapPublicationStatus(d);
    const verState = mapVerificationState(d);

    lines.push(
      `INSERT INTO documents (id, type, number, title, session_id, term_id, date_enacted, date_filed, pdf_url, source_type, publication_status, verification_state, source_confidence, canonical_notes, created_at, updated_at) VALUES (` +
        `${esc(d.id)}, ${esc(d.type)}, ${esc(d.number)}, ${esc(d.title)}, ${esc(sessionId)}, ` +
        `${esc(termId)}, ${esc(d.date_enacted)}, ${esc(d.date_filed)}, ${esc(d.pdf_url)}, ` +
        `${esc(sourceType)}, ${esc(pubStatus)}, ${esc(verState)}, ${esc(d.source_confidence || null)}, ` +
        `${esc(null)}, ${esc(d.created_at)}, ${esc(d.updated_at)});`
    );
    docCount += 1;
  }
  lines.push(
    `-- Documents: ${docCount} (${orphanSessionDocs} orphan session refs nulled)`
  );
  lines.push('');

  // --- Document Authors (primary -> principal, fix maiden name) ---
  const PERSON_ID_MAP = {
    'sumangil-evangelista-josephine': 'evangelista-josephine-s',
  };
  const docAuthors = readJson('remote-document_authors.json');
  for (const da of docAuthors) {
    const authorType =
      (da.author_type || 'primary') === 'primary'
        ? 'principal'
        : da.author_type;
    const personId = PERSON_ID_MAP[da.person_id] || da.person_id;
    lines.push(
      `INSERT INTO document_authors (document_id, person_id, author_type, raw_name, created_at) VALUES (` +
        `${esc(da.document_id)}, ${esc(personId)}, ${esc(authorType)}, ${esc(null)}, ${esc(da.created_at)});`
    );
  }
  lines.push(`-- Document Authors: ${docAuthors.length}`);
  lines.push('');

  // --- Audit Log (merge admin_audit_log into audit_log) ---
  const auditLog = readJson('remote-audit_log.json');
  const adminAuditLog = readJson('remote-admin_audit_log.json');
  for (const a of auditLog) {
    if (!a.id) continue;
    lines.push(
      `INSERT INTO audit_log (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) VALUES (` +
        `${esc(a.id)}, ${esc(a.table_name)}, ${esc(a.record_id)}, ${esc(a.action)}, ` +
        `${esc(a.old_values)}, ${esc(a.new_values)}, ${esc(a.changed_by)}, ${esc(a.changed_at)});`
    );
  }
  for (const a of adminAuditLog) {
    lines.push(
      `INSERT INTO audit_log (id, table_name, record_id, action, old_values, new_values, changed_by, changed_at) VALUES (` +
        `${esc('audit_admin_' + a.action + '_' + (a.target_id || 'unknown'))}, ` +
        `${esc(a.target_type || 'unknown')}, ${esc(a.target_id)}, ${esc(a.action)}, ` +
        `NULL, ${esc(a.details)}, ${esc(a.performed_by)}, ${esc(a.created_at)});`
    );
  }
  lines.push(`-- Audit Log: ${auditLog.length + adminAuditLog.length}`);
  lines.push('');

  return lines.join('\n');
}

function main() {
  const args = process.argv.slice(2);
  const output = args.find(a => !a.startsWith('-')) || null;

  if (args.includes('--help') || args.includes('-h')) {
    console.log(`Usage: node scripts/openlgu/migrate-data.cjs [output.sql]

Transforms remote D1 data (pipeline/openlgu/reference/remote-*.json)
into SQL for the rebuilt schema.

Options:
  [output.sql]  Write to file instead of stdout
  --help        Show this help
`);
    process.exit(0);
  }

  const sql = migrate();

  if (output) {
    fs.writeFileSync(output, sql);
    console.error(`Wrote migration SQL to ${output}`);
  } else {
    process.stdout.write(sql);
  }
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
