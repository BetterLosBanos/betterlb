-- Migration 002: Add performance indexes for OpenLGU APIs
-- These indexes optimize common query patterns and JOIN operations

-- Index for documents list queries (filtered by type and ordered by date)
-- Covers: GET /api/legislation/documents?type=x&term=y
CREATE INDEX IF NOT EXISTS idx_documents_type_date
  ON documents(type, date_enacted DESC);

-- Index for committee membership lookups by committee and term
-- Covers: committees API fetching members for a specific term
CREATE INDEX IF NOT EXISTS idx_committee_memberships_committee_term
  ON committee_memberships(committee_id, term_id);

-- Index for sessions by term with date ordering
-- Covers: GET /api/legislation/sessions?term=x
CREATE INDEX IF NOT EXISTS idx_sessions_term_date
  ON sessions(term_id, date DESC, number DESC);

-- Index for memberships by person and term (for attendance queries)
-- Covers: person detail attendance stats
CREATE INDEX IF NOT EXISTS idx_memberships_term_person
  ON memberships(term_id, person_id);

-- Index for document authors lookups
-- Covers: document detail fetching authors, person detail fetching authored documents
CREATE INDEX IF NOT EXISTS idx_document_authors_document_person
  ON document_authors(document_id, person_id);

-- Index for committee memberships by person (for person detail queries)
-- Covers: GET /api/legislation/persons/:id committee memberships
CREATE INDEX IF NOT EXISTS idx_committee_memberships_person_term
  ON committee_memberships(person_id, term_id);

-- Index for session_absences by session (for attendance queries)
-- Covers: sessions list fetching absences
CREATE INDEX IF NOT EXISTS idx_session_absences_session
  ON session_absences(session_id, person_id);

-- Index for documents by session (for term document counts)
-- Covers: terms API counting documents per term
CREATE INDEX IF NOT EXISTS idx_documents_session
  ON documents(session_id);

-- Composite index for documents with session lookups (most common query pattern)
-- Covers: documents list joined with sessions and terms
CREATE INDEX IF NOT EXISTS idx_documents_session_type
  ON documents(session_id, type, date_enacted DESC);
