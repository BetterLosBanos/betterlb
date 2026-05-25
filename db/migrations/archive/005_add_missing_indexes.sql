-- Migration 005: Add missing performance indexes
-- Addresses gaps identified in Phase 2 codebase audit

-- Index for document number uniqueness checks
-- Covers: duplicate detection, document lookups by number
CREATE INDEX IF NOT EXISTS idx_documents_number
  ON documents(number);

-- Composite index for documents by type and status
-- Covers: admin filtering documents by type + status
CREATE INDEX IF NOT EXISTS idx_documents_type_status
  ON documents(type, status);
