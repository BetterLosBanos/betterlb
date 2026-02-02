-- Refined schema for BetterLB legislation database
-- Allows incomplete data for admin console review and completion
-- Migration: 001_initial_schema.sql
--
-- Schema Changes v2:
-- - Removed persons.photo_url (not used in this build)
-- - Removed memberships.start_date, memberships.end_date (term_id is sufficient)
-- - Removed sessions.location (never populated)
-- - Removed documents.content_preview, documents.full_text (not populated, using title instead)
-- - Removed document_authors.author_order (never populated)
-- - Added terms.mayor_id, terms.vice_mayor_id (merged from 002)

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
  mayor TEXT,
  vice_mayor TEXT,
  mayor_id TEXT,
  vice_mayor_id TEXT,
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
  last_name TEXT,
  suffix TEXT,
  aliases TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(last_name, first_name);

-- ============================================================================
-- MEMBERSHIPS (person-term relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT,
  term_id TEXT,
  chamber TEXT,
  role TEXT,
  rank INTEGER,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memberships_person ON memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_memberships_term ON memberships(term_id);

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
  person_id TEXT,
  committee_id TEXT,
  term_id TEXT,
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
  term_id TEXT,
  number INTEGER,
  type TEXT DEFAULT 'Regular',
  date TEXT,
  ordinal_number TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_term ON sessions(term_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);

-- ============================================================================
-- SESSION ATTENDANCE (Absent-Only Model)
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_absences (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  person_id TEXT,
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
  type TEXT,
  number TEXT,
  title TEXT,
  session_id TEXT,
  status TEXT DEFAULT 'pending',
  date_enacted TEXT,
  date_filed TEXT,
  pdf_url TEXT,
  moved_by TEXT,
  seconded_by TEXT,
  source_type TEXT DEFAULT 'pdf',
  needs_review INTEGER DEFAULT 0,
  review_notes TEXT,
  processed INTEGER DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date_enacted DESC);
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_needs_review ON documents(needs_review);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);

-- ============================================================================
-- DOCUMENT AUTHORS (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_authors (
  document_id TEXT,
  person_id TEXT,
  author_type TEXT DEFAULT 'primary',
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_document_authors_document ON document_authors(document_id);
CREATE INDEX IF NOT EXISTS idx_document_authors_person ON document_authors(person_id);

-- ============================================================================
-- SUBJECTS / TAGS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT,
  slug TEXT,
  parent_id TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);
CREATE INDEX IF NOT EXISTS idx_subjects_slug ON subjects(slug);

-- ============================================================================
-- DOCUMENT SUBJECTS (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_subjects (
  document_id TEXT,
  subject_id TEXT,
  relevance_score REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (document_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_document_subjects_document ON document_subjects(document_id);
CREATE INDEX IF NOT EXISTS idx_document_subjects_subject ON document_subjects(subject_id);

-- ============================================================================
-- REVIEW QUEUE
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT PRIMARY KEY,
  item_type TEXT,
  item_id TEXT,
  issue_type TEXT,
  priority TEXT DEFAULT 'medium',
  description TEXT,
  source_type TEXT DEFAULT 'pdf',
  source_url TEXT,
  status TEXT DEFAULT 'pending',
  assigned_to TEXT,
  resolution TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT,
  resolved_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_type ON review_queue(item_type);
CREATE INDEX IF NOT EXISTS idx_review_queue_priority ON review_queue(priority, status);

-- ============================================================================
-- DATA RECONCILIATION
-- ============================================================================
CREATE TABLE IF NOT EXISTS data_conflicts (
  id TEXT PRIMARY KEY,
  entity_type TEXT,
  entity_id TEXT,
  field_name TEXT,
  facebook_value TEXT,
  govph_value TEXT,
  resolved_value TEXT,
  status TEXT DEFAULT 'unresolved',
  resolution_notes TEXT,
  resolved_by TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_conflicts_status ON data_conflicts(status);
CREATE INDEX IF NOT EXISTS idx_conflicts_entity ON data_conflicts(entity_type, entity_id);

-- ============================================================================
-- FACEBOOK SESSION DATA
-- ============================================================================
CREATE TABLE IF NOT EXISTS facebook_session_data (
  id TEXT PRIMARY KEY,
  session_id TEXT,
  post_url TEXT,
  post_id TEXT,
  post_date TEXT,
  session_number INTEGER,
  session_type TEXT,
  raw_content TEXT,
  extracted_data TEXT,
  confidence_score REAL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  processed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_fb_session_data_session ON facebook_session_data(session_id);
CREATE INDEX IF NOT EXISTS idx_fb_session_data_post_date ON facebook_session_data(post_date DESC);

-- ============================================================================
-- AUDIT LOG
-- ============================================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY,
  table_name TEXT,
  record_id TEXT,
  action TEXT,
  old_values TEXT,
  new_values TEXT,
  changed_by TEXT,
  changed_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_audit_table ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log(table_name, record_id);
CREATE INDEX IF NOT EXISTS idx_audit_date ON audit_log(changed_at DESC);

-- ============================================================================
-- VIEWS
-- ============================================================================

-- Document statistics by type and year
CREATE VIEW IF NOT EXISTS v_document_stats AS
SELECT
  type,
  strftime('%Y', date_enacted) as year,
  COUNT(*) as total,
  SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN status = 'vetoed' THEN 1 ELSE 0 END) as vetoed
FROM documents
WHERE type IS NOT NULL
GROUP BY type, year;

-- Person productivity
CREATE VIEW IF NOT EXISTS v_author_productivity AS
SELECT
  p.id as person_id,
  p.first_name || ' ' || COALESCE(p.last_name, '') as full_name,
  COUNT(DISTINCT da.document_id) as documents_authored,
  COUNT(DISTINCT CASE WHEN d.type = 'ordinance' THEN da.document_id END) as ordinances,
  COUNT(DISTINCT CASE WHEN d.type = 'resolution' THEN da.document_id END) as resolutions
FROM persons p
LEFT JOIN document_authors da ON da.person_id = p.id
LEFT JOIN documents d ON d.id = da.document_id
GROUP BY p.id;
