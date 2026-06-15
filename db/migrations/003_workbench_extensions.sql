-- OpenLGU Workbench Extensions
-- Migration: 003_workbench_extensions.sql
--
-- Adds missing columns for JSONL pipeline data compatibility
-- Creates review_decisions table for workbench decisions

-- ============================================================================
-- SOURCE_RECORDS EXTENSIONS
-- ============================================================================

-- PDF reachability fields from collector
ALTER TABLE source_records ADD COLUMN pdf_url TEXT;
ALTER TABLE source_records ADD COLUMN pdf_reachability TEXT;
ALTER TABLE source_records ADD COLUMN pdf_redirect_url TEXT;
ALTER TABLE source_records ADD COLUMN pdf_checked_at TEXT;

-- Source identification and timing
ALTER TABLE source_records ADD COLUMN source_key TEXT;
ALTER TABLE source_records ADD COLUMN first_seen_at TEXT;
ALTER TABLE source_records ADD COLUMN last_seen_at TEXT;
ALTER TABLE source_records ADD COLUMN collector_version TEXT;

-- ============================================================================
-- STAGED_DOCUMENTS EXTENSIONS
-- ============================================================================

ALTER TABLE staged_documents ADD COLUMN turnover_marker INTEGER NOT NULL DEFAULT 0;
ALTER TABLE staged_documents ADD COLUMN co_author_text TEXT;
ALTER TABLE staged_documents ADD COLUMN matching_key TEXT;

-- ============================================================================
-- REVIEW_DECISIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS review_decisions (
  id TEXT PRIMARY KEY,
  schema_version TEXT NOT NULL,
  source_record_id TEXT NOT NULL,
  staged_document_id TEXT,
  source_content_hash TEXT,
  decision_type TEXT NOT NULL,
  field TEXT NOT NULL,
  value TEXT,
  derived_json TEXT,
  term_override_id TEXT,
  term_override_reason TEXT,
  evidence_json TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  created_by TEXT NOT NULL DEFAULT 'system'
);

CREATE INDEX IF NOT EXISTS idx_review_decisions_source_record
  ON review_decisions(source_record_id);

CREATE INDEX IF NOT EXISTS idx_review_decisions_staged_document
  ON review_decisions(staged_document_id);

CREATE INDEX IF NOT EXISTS idx_review_decisions_field
  ON review_decisions(source_record_id, field);

CREATE INDEX IF NOT EXISTS idx_review_decisions_created_at
  ON review_decisions(created_at DESC);

-- ============================================================================
-- SCHEMA MIGRATIONS
-- ============================================================================

INSERT INTO schema_migrations (name) VALUES ('003_workbench_extensions.sql');
