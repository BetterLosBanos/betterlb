-- Migration 007: Canonical publication and verification metadata
-- Keeps existing documents.status, processed, and needs_review intact.
-- Pipeline review state lives in staging; canonical rows only record publication/verification facts.

ALTER TABLE documents ADD COLUMN publication_status TEXT NOT NULL DEFAULT 'active'
  CHECK(publication_status IN ('active', 'missing_from_source', 'withdrawn', 'superseded', 'manual_only'));

ALTER TABLE documents ADD COLUMN verification_state TEXT NOT NULL DEFAULT 'unverified'
  CHECK(verification_state IN ('unverified', 'partially_verified', 'verified', 'disputed'));

ALTER TABLE documents ADD COLUMN source_confidence REAL;

ALTER TABLE documents ADD COLUMN canonical_notes TEXT;

CREATE INDEX IF NOT EXISTS idx_documents_publication_status ON documents(publication_status);
CREATE INDEX IF NOT EXISTS idx_documents_verification_state ON documents(verification_state);
