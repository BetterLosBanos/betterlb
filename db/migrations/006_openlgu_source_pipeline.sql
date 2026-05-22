-- Migration 006: OpenLGU source/staging pipeline
-- Adds a non-destructive ingestion layer in front of canonical documents.
-- Canonical records remain protected; source data is staged, reconciled, and promoted explicitly.

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

CREATE TABLE IF NOT EXISTS scrape_runs (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS source_records (
  id TEXT PRIMARY KEY,
  scrape_run_id TEXT,
  source_id TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS staged_documents (
  id TEXT PRIMARY KEY,
  source_record_id TEXT NOT NULL,
  candidate_document_id TEXT,
  document_type TEXT,
  number TEXT,
  normalized_number TEXT,
  title TEXT,
  date_enacted TEXT,
  pdf_url TEXT,
  term_id TEXT,
  session_id TEXT,
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

CREATE TABLE IF NOT EXISTS staged_document_person_refs (
  id TEXT PRIMARY KEY,
  staged_document_id TEXT NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('author', 'mover', 'seconder')),
  raw_name TEXT NOT NULL,
  candidate_person_id TEXT,
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

CREATE TABLE IF NOT EXISTS document_source_matches (
  document_id TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS document_field_provenance (
  document_id TEXT NOT NULL,
  field_name TEXT NOT NULL CHECK(field_name IN ('title', 'date_enacted', 'pdf_url', 'session_id', 'author_ids', 'publication_status')),
  source_record_id TEXT NOT NULL,
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

CREATE TABLE IF NOT EXISTS reconciliation_reports (
  id TEXT PRIMARY KEY,
  run_id TEXT,
  report_type TEXT NOT NULL DEFAULT 'shadow',
  status TEXT NOT NULL DEFAULT 'generated',
  summary_json TEXT NOT NULL,
  artifact_path TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY(run_id) REFERENCES scrape_runs(id)
);

CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_run ON reconciliation_reports(run_id);
CREATE INDEX IF NOT EXISTS idx_reconciliation_reports_created ON reconciliation_reports(created_at DESC);
