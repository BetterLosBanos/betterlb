-- OpenLGU Legislative Schema — Clean Rebuild
-- Migration: 001_initial_schema.sql
--
-- BREAKING: Replaces all prior migrations (001-007).
-- See docs/openlgu/schema-rebuild.md for upgrade instructions.
--
-- Schema decisions:
-- - FK enforcement on all relationships
-- - CHECK constraints on enum-like columns
-- - Pipeline tables (source/staging) included
-- - Mover/seconder are staging evidence only (no canonical table)
-- - Executive orders have session_id = NULL (not a legislative session act)
-- - Membership tenure tracked via start_date/end_date (mid-term role changes)

-- ============================================================================
-- SCHEMA MIGRATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS schema_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  applied_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- ============================================================================
-- TERMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS terms (
  id TEXT PRIMARY KEY,
  term_number INTEGER NOT NULL,
  ordinal TEXT NOT NULL,
  name TEXT NOT NULL,
  start_date TEXT NOT NULL,
  end_date TEXT NOT NULL,
  year_range TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_terms_year_range ON terms(year_range);
CREATE INDEX IF NOT EXISTS idx_terms_ordinal ON terms(ordinal);

-- ============================================================================
-- PERSONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  first_name TEXT,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  birth_name TEXT,
  suffix TEXT,
  aliases TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(last_name, first_name);

-- ============================================================================
-- MEMBERSHIPS (person-term relationship with tenure tracking)
-- ============================================================================

CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id),
  term_id TEXT NOT NULL REFERENCES terms(id),
  chamber TEXT NOT NULL,
  role TEXT NOT NULL,
  rank INTEGER,
  start_date TEXT,
  end_date TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memberships_person ON memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_memberships_term ON memberships(term_id);
CREATE INDEX IF NOT EXISTS idx_memberships_role ON memberships(term_id, role);

-- ============================================================================
-- COMMITTEES
-- ============================================================================

CREATE TABLE IF NOT EXISTS committees (
  id TEXT PRIMARY KEY,
  name TEXT,
  type TEXT,
  description TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_committees_name ON committees(name);
CREATE INDEX IF NOT EXISTS idx_committees_type ON committees(type);

-- ============================================================================
-- COMMITTEE MEMBERSHIPS
-- ============================================================================

CREATE TABLE IF NOT EXISTS committee_memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT REFERENCES persons(id),
  committee_id TEXT REFERENCES committees(id),
  term_id TEXT REFERENCES terms(id),
  role TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_committee_memberships_person ON committee_memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_committee ON committee_memberships(committee_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_term ON committee_memberships(term_id);

-- ============================================================================
-- SESSIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  term_id TEXT NOT NULL REFERENCES terms(id),
  number INTEGER,
  type TEXT NOT NULL DEFAULT 'Regular' CHECK(type IN ('Regular', 'Special', 'Inaugural')),
  date TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_term ON sessions(term_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_term_number ON sessions(term_id, number);

-- ============================================================================
-- SESSION ATTENDANCE (Absent-Only Model)
-- ============================================================================

CREATE TABLE IF NOT EXISTS session_absences (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id),
  person_id TEXT NOT NULL REFERENCES persons(id),
  reason TEXT,
  excuse_type TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_absences_session ON session_absences(session_id);
CREATE INDEX IF NOT EXISTS idx_absences_person ON session_absences(person_id);

-- ============================================================================
-- DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  number TEXT NOT NULL,
  title TEXT,
  session_id TEXT REFERENCES sessions(id),
  term_id TEXT REFERENCES terms(id),
  date_enacted TEXT,
  date_filed TEXT,
  pdf_url TEXT,
  source_type TEXT NOT NULL DEFAULT 'website' CHECK(source_type IN ('website', 'facebook', 'manual', 'ocr')),
  publication_status TEXT NOT NULL DEFAULT 'active'
    CHECK(publication_status IN ('active', 'missing_from_source', 'withdrawn', 'superseded', 'manual_only')),
  verification_state TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_state IN ('unverified', 'partially_verified', 'verified', 'disputed')),
  source_confidence REAL,
  canonical_notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date_enacted DESC);
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_term ON documents(term_id);
CREATE INDEX IF NOT EXISTS idx_documents_publication ON documents(publication_status);
CREATE INDEX IF NOT EXISTS idx_documents_verification ON documents(verification_state);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_type_date ON documents(type, date_enacted DESC);

-- ============================================================================
-- DOCUMENT AUTHORS (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_authors (
  document_id TEXT NOT NULL REFERENCES documents(id),
  person_id TEXT REFERENCES persons(id),
  author_type TEXT NOT NULL DEFAULT 'principal' CHECK(author_type IN ('principal', 'co_author')),
  raw_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, person_id, author_type)
);

CREATE INDEX IF NOT EXISTS idx_document_authors_document ON document_authors(document_id);
CREATE INDEX IF NOT EXISTS idx_document_authors_person ON document_authors(person_id);
CREATE INDEX IF NOT EXISTS idx_document_authors_type ON document_authors(author_type);

-- ============================================================================
-- SUBJECTS / TAGS (empty — awaiting AI classification)
-- ============================================================================

CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  parent_id TEXT REFERENCES subjects(id),
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);

-- ============================================================================
-- DOCUMENT SUBJECTS (many-to-many)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_subjects (
  document_id TEXT NOT NULL REFERENCES documents(id),
  subject_id TEXT NOT NULL REFERENCES subjects(id),
  relevance_score REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_document_subjects_document ON document_subjects(document_id);
CREATE INDEX IF NOT EXISTS idx_document_subjects_subject ON document_subjects(subject_id);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  table_name TEXT NOT NULL,
  record_id TEXT NOT NULL,
  action TEXT NOT NULL,
  old_values TEXT,
  new_values TEXT,
  changed_by TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(changed_at DESC);

-- ============================================================================
-- PIPELINE: SCRAPE SOURCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS scrape_sources (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  source_type TEXT NOT NULL CHECK(source_type IN ('lgu_website', 'facebook', 'manual_import', 'pdf_ocr')),
  base_url TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  config_json TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_scrape_sources_type ON scrape_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_scrape_sources_active ON scrape_sources(active);

-- ============================================================================
-- PIPELINE: SCRAPE RUNS
-- ============================================================================

CREATE TABLE IF NOT EXISTS scrape_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL REFERENCES scrape_sources(id),
  started_at TEXT NOT NULL DEFAULT (datetime('now')),
  completed_at TEXT,
  status TEXT NOT NULL DEFAULT 'running' CHECK(status IN ('running', 'completed', 'failed', 'cancelled')),
  records_seen INTEGER NOT NULL DEFAULT 0,
  records_changed INTEGER NOT NULL DEFAULT 0,
  error_message TEXT,
  metadata_json TEXT,
  FOREIGN KEY(source_id) REFERENCES scrape_sources(id)
);

CREATE INDEX IF NOT EXISTS idx_scrape_runs_source ON scrape_runs(source_id);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_started ON scrape_runs(started_at DESC);
CREATE INDEX IF NOT EXISTS idx_scrape_runs_status ON scrape_runs(status);

-- ============================================================================
-- PIPELINE: SOURCE RECORDS
-- ============================================================================

CREATE TABLE IF NOT EXISTS source_records (
  id TEXT PRIMARY KEY,
  scrape_run_id TEXT REFERENCES scrape_runs(id),
  source_id TEXT NOT NULL REFERENCES scrape_sources(id),
  source_record_id TEXT,
  source_url TEXT,
  source_kind TEXT NOT NULL CHECK(source_kind IN ('website_table_row', 'facebook_post', 'pdf_ocr', 'manual_entry')),
  entity_type TEXT NOT NULL CHECK(entity_type IN ('document', 'session', 'term', 'person')),
  content_hash TEXT NOT NULL,
  raw_payload_json TEXT,
  raw_text TEXT,
  source_updated_at TEXT,
  captured_at TEXT NOT NULL DEFAULT (datetime('now')),
  parsed_status TEXT NOT NULL DEFAULT 'pending' CHECK(parsed_status IN ('pending', 'parsed', 'ignored', 'error')),
  parse_error TEXT,
  FOREIGN KEY(scrape_run_id) REFERENCES scrape_runs(id),
  FOREIGN KEY(source_id) REFERENCES scrape_sources(id),
  UNIQUE(source_id, source_record_id, content_hash)
);

CREATE INDEX IF NOT EXISTS idx_source_records_source ON source_records(source_id);
CREATE INDEX IF NOT EXISTS idx_source_records_run ON source_records(scrape_run_id);
CREATE INDEX IF NOT EXISTS idx_source_records_kind ON source_records(source_kind);
CREATE INDEX IF NOT EXISTS idx_source_records_entity ON source_records(entity_type);
CREATE INDEX IF NOT EXISTS idx_source_records_hash ON source_records(content_hash);
CREATE INDEX IF NOT EXISTS idx_source_records_captured ON source_records(captured_at DESC);

-- ============================================================================
-- PIPELINE: STAGED DOCUMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS staged_documents (
  id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL REFERENCES source_records(id),
  candidate_document_id TEXT REFERENCES documents(id),
  document_type TEXT,
  number TEXT,
  normalized_number TEXT,
  title TEXT,
  date_enacted TEXT,
  pdf_url TEXT,
  term_id TEXT REFERENCES terms(id),
  session_id TEXT REFERENCES sessions(id),
  raw_author_text TEXT,
  mover_text TEXT,
  seconder_text TEXT,
  publication_status TEXT NOT NULL DEFAULT 'active'
    CHECK(publication_status IN ('active', 'missing_from_source', 'withdrawn', 'superseded', 'manual_only')),
  verification_state TEXT NOT NULL DEFAULT 'unverified'
    CHECK(verification_state IN ('unverified', 'partially_verified', 'verified', 'disputed')),
  confidence_score REAL,
  staging_status TEXT NOT NULL DEFAULT 'new'
    CHECK(staging_status IN ('new', 'matched', 'collision', 'needs_review', 'promoted', 'ignored')),
  review_reason TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(source_record_id) REFERENCES source_records(id),
  FOREIGN KEY(candidate_document_id) REFERENCES documents(id),
  FOREIGN KEY(term_id) REFERENCES terms(id),
  FOREIGN KEY(session_id) REFERENCES sessions(id)
);

CREATE INDEX IF NOT EXISTS idx_staged_documents_source_record ON staged_documents(source_record_id);
CREATE INDEX IF NOT EXISTS idx_staged_documents_candidate ON staged_documents(candidate_document_id);
CREATE INDEX IF NOT EXISTS idx_staged_documents_match_key ON staged_documents(document_type, normalized_number, term_id);
CREATE INDEX IF NOT EXISTS idx_staged_documents_status ON staged_documents(staging_status);
CREATE INDEX IF NOT EXISTS idx_staged_documents_publication ON staged_documents(publication_status);
CREATE INDEX IF NOT EXISTS idx_staged_documents_verification ON staged_documents(verification_state);

-- ============================================================================
-- PIPELINE: STAGED DOCUMENT PERSON REFS
-- ============================================================================

CREATE TABLE IF NOT EXISTS staged_document_person_refs (
  id TEXT PRIMARY KEY,
  staged_document_id TEXT NOT NULL REFERENCES staged_documents(id),
  role TEXT NOT NULL CHECK(role IN ('author', 'co_author', 'mover', 'seconder')),
  raw_name TEXT NOT NULL,
  candidate_person_id TEXT REFERENCES persons(id),
  confidence_score REAL,
  resolution_status TEXT NOT NULL DEFAULT 'unresolved'
    CHECK(resolution_status IN ('unresolved', 'matched', 'ambiguous', 'ignored')),
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(staged_document_id) REFERENCES staged_documents(id),
  FOREIGN KEY(candidate_person_id) REFERENCES persons(id)
);

CREATE INDEX IF NOT EXISTS idx_staged_person_refs_document ON staged_document_person_refs(staged_document_id);
CREATE INDEX IF NOT EXISTS idx_staged_person_refs_role ON staged_document_person_refs(role);
CREATE INDEX IF NOT EXISTS idx_staged_person_refs_candidate ON staged_document_person_refs(candidate_person_id);
CREATE INDEX IF NOT EXISTS idx_staged_person_refs_status ON staged_document_person_refs(resolution_status);

-- ============================================================================
-- PIPELINE: STAGED RECORD COLLISIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS staged_record_collisions (
  id TEXT PRIMARY KEY,
  matching_key TEXT NOT NULL,
  entity_type TEXT NOT NULL DEFAULT 'document',
  staged_record_ids TEXT NOT NULL,
  collision_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'unresolved' CHECK(status IN ('unresolved', 'resolved', 'ignored')),
  notes TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_staged_collisions_key ON staged_record_collisions(matching_key);
CREATE INDEX IF NOT EXISTS idx_staged_collisions_status ON staged_record_collisions(status);

-- ============================================================================
-- PIPELINE: DOCUMENT SOURCE MATCHES
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_source_matches (
  document_id TEXT NOT NULL REFERENCES documents(id),
  source_record_id TEXT NOT NULL REFERENCES source_records(id),
  match_confidence REAL,
  match_method TEXT NOT NULL,
  matched_at TEXT NOT NULL DEFAULT (datetime('now')),
  matched_by TEXT,
  PRIMARY KEY(document_id, source_record_id),
  FOREIGN KEY(document_id) REFERENCES documents(id),
  FOREIGN KEY(source_record_id) REFERENCES source_records(id)
);

CREATE INDEX IF NOT EXISTS idx_document_source_matches_source ON document_source_matches(source_record_id);
CREATE INDEX IF NOT EXISTS idx_document_source_matches_method ON document_source_matches(match_method);

-- ============================================================================
-- PIPELINE: DOCUMENT FIELD PROVENANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_field_provenance (
  document_id TEXT NOT NULL REFERENCES documents(id),
  field_name TEXT NOT NULL CHECK(field_name IN ('title', 'date_enacted', 'pdf_url', 'session_id', 'term_id', 'author_ids', 'publication_status')),
  source_record_id TEXT NOT NULL REFERENCES source_records(id),
  field_value TEXT,
  confidence_score REAL,
  verified_by TEXT,
  verified_at TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY(document_id, field_name, source_record_id),
  FOREIGN KEY(document_id) REFERENCES documents(id),
  FOREIGN KEY(source_record_id) REFERENCES source_records(id)
);

CREATE INDEX IF NOT EXISTS idx_document_field_provenance_document ON document_field_provenance(document_id);
CREATE INDEX IF NOT EXISTS idx_document_field_provenance_source ON document_field_provenance(source_record_id);
CREATE INDEX IF NOT EXISTS idx_document_field_provenance_field ON document_field_provenance(field_name);

-- ============================================================================
-- PIPELINE: RECONCILIATION REPORTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id TEXT PRIMARY KEY,
  run_id TEXT REFERENCES scrape_runs(id),
  report_type TEXT NOT NULL DEFAULT 'shadow',
  status TEXT NOT NULL DEFAULT 'generated',
  summary_json TEXT NOT NULL,
  artifact_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES scrape_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_run ON reconciliation_reports(run_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_created ON reconciliation_reports(created_at DESC);

-- ============================================================================
-- VIEWS
-- ============================================================================

CREATE VIEW IF NOT EXISTS v_document_stats AS
SELECT
  type,
  strftime('%Y', date_enacted) as year,
  COUNT(*) as total,
  SUM(CASE WHEN publication_status = 'active' THEN 1 ELSE 0 END) as active,
  SUM(CASE WHEN verification_state = 'verified' THEN 1 ELSE 0 END) as verified
FROM documents
WHERE type IS NOT NULL
GROUP BY type, year;

CREATE VIEW IF NOT EXISTS v_author_productivity AS
SELECT
  p.id as person_id,
  p.first_name || ' ' || COALESCE(p.last_name, '') as full_name,
  COUNT(DISTINCT da.document_id) as documents_authored,
  COUNT(DISTINCT CASE WHEN da.author_type = 'principal' THEN da.document_id END) as as_principal,
  COUNT(DISTINCT CASE WHEN da.author_type = 'co_author' THEN da.document_id END) as as_co_author,
  COUNT(DISTINCT CASE WHEN d.type = 'ordinance' THEN da.document_id END) as ordinances,
  COUNT(DISTINCT CASE WHEN d.type = 'resolution' THEN da.document_id END) as resolutions
FROM persons p
LEFT JOIN document_authors da ON da.person_id = p.id
LEFT JOIN documents d ON d.id = da.document_id
GROUP BY p.id;
