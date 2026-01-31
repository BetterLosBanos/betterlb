-- Initial schema for BetterLB legislation database
-- Migration: 001_initial_schema.sql
-- This schema supports the 12th Sangguniang Bayan legislation data

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
  mayor TEXT NOT NULL,
  vice_mayor TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_terms_year_range ON terms(year_range);
CREATE INDEX IF NOT EXISTS idx_terms_ordinal ON terms(ordinal);

-- ============================================================================
-- PERSONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS persons (
  id TEXT PRIMARY KEY,
  first_name TEXT NOT NULL,
  middle_name TEXT,
  last_name TEXT NOT NULL,
  photo_url TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_persons_name ON persons(last_name, first_name);

-- ============================================================================
-- MEMBERSHIPS (person-term relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  chamber TEXT,
  role TEXT NOT NULL,
  rank INTEGER,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_memberships_person ON memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_memberships_term ON memberships(term_id);

-- ============================================================================
-- COMMITTEES
-- ============================================================================
CREATE TABLE IF NOT EXISTS committees (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_committees_name ON committees(name);
CREATE INDEX IF NOT EXISTS idx_committees_type ON committees(type);

-- ============================================================================
-- COMMITTEE MEMBERSHIPS (person-committee-term relationship)
-- ============================================================================
CREATE TABLE IF NOT EXISTS committee_memberships (
  id TEXT PRIMARY KEY,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  committee_id TEXT NOT NULL REFERENCES committees(id) ON DELETE CASCADE,
  term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_committee_memberships_person ON committee_memberships(person_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_committee ON committee_memberships(committee_id);
CREATE INDEX IF NOT EXISTS idx_committee_memberships_term ON committee_memberships(term_id);

-- ============================================================================
-- SESSIONS
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  id TEXT PRIMARY KEY,
  term_id TEXT NOT NULL REFERENCES terms(id) ON DELETE CASCADE,
  number INTEGER NOT NULL,
  type TEXT NOT NULL DEFAULT 'Regular',
  date TEXT NOT NULL,
  ordinal_number TEXT NOT NULL,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_sessions_date ON sessions(date);
CREATE INDEX IF NOT EXISTS idx_sessions_term ON sessions(term_id);
CREATE INDEX IF NOT EXISTS idx_sessions_type ON sessions(type);
CREATE INDEX IF NOT EXISTS idx_sessions_number ON sessions(number);

-- ============================================================================
-- SESSION ATTENDANCE (Absent-Only Model)
-- Only records absences. All members assumed present unless listed here.
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_absences (
  id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  reason TEXT,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_absences_session ON session_absences(session_id);
CREATE INDEX IF NOT EXISTS idx_absences_person ON session_absences(person_id);

-- Helper view to get all attendance (present = all members - absences)
CREATE VIEW IF NOT EXISTS v_session_attendance AS
SELECT
  s.id as session_id,
  p.id as person_id,
  CASE WHEN sa.person_id IS NOT NULL THEN 'absent' ELSE 'present' END as status,
  sa.reason
FROM sessions s
CROSS JOIN memberships m
JOIN persons p ON p.id = m.person_id
LEFT JOIN session_absences sa ON sa.session_id = s.id AND sa.person_id = p.id
WHERE m.term_id = s.term_id;

-- ============================================================================
-- DOCUMENTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS documents (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK(type IN ('ordinance', 'resolution', 'executive_order')),
  number TEXT NOT NULL,
  title TEXT NOT NULL,
  session_id TEXT NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  date_enacted TEXT NOT NULL,
  pdf_url TEXT NOT NULL,
  content_preview TEXT,
  moved_by TEXT, -- Person who introduced/moved the document (from Facebook)
  seconded_by TEXT, -- Person who seconded (from Facebook)
  source_type TEXT DEFAULT 'pdf' CHECK(source_type IN ('pdf', 'facebook', 'manual')),
  needs_review INTEGER DEFAULT 0,
  review_notes TEXT,
  processed INTEGER DEFAULT 1, -- 1 = fully processed, 0 = pending
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_documents_type ON documents(type);
CREATE INDEX IF NOT EXISTS idx_documents_date ON documents(date_enacted);
CREATE INDEX IF NOT EXISTS idx_documents_number ON documents(number);
CREATE INDEX IF NOT EXISTS idx_documents_session ON documents(session_id);
CREATE INDEX IF NOT EXISTS idx_documents_title ON documents(title);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_needs_review ON documents(needs_review);
CREATE INDEX IF NOT EXISTS idx_documents_source_type ON documents(source_type);
CREATE INDEX IF NOT EXISTS idx_documents_processed ON documents(processed);

-- ============================================================================
-- DOCUMENT AUTHORS (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_authors (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  person_id TEXT NOT NULL REFERENCES persons(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, person_id)
);

CREATE INDEX IF NOT EXISTS idx_document_authors_document ON document_authors(document_id);
CREATE INDEX IF NOT EXISTS idx_document_authors_person ON document_authors(person_id);

-- ============================================================================
-- SUBJECTS
-- ============================================================================
CREATE TABLE IF NOT EXISTS subjects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_subjects_name ON subjects(name);

-- ============================================================================
-- DOCUMENT SUBJECTS (many-to-many)
-- ============================================================================
CREATE TABLE IF NOT EXISTS document_subjects (
  document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
  subject_id TEXT NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  PRIMARY KEY (document_id, subject_id)
);

CREATE INDEX IF NOT EXISTS idx_document_subjects_document ON document_subjects(document_id);
CREATE INDEX IF NOT EXISTS idx_document_subjects_subject ON document_subjects(subject_id);

-- ============================================================================
-- REVIEW QUEUE (for manual review of problematic PDFs/data)
-- ============================================================================
CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT PRIMARY KEY,
  item_type TEXT NOT NULL CHECK(item_type IN ('document', 'session', 'attendance')),
  item_id TEXT NOT NULL,
  issue_type TEXT NOT NULL,
  description TEXT,
  source_type TEXT NOT NULL DEFAULT 'pdf' CHECK(source_type IN ('pdf', 'facebook', 'manual', 'other')),
  source_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'resolved', 'skipped')),
  assigned_to TEXT,
  resolution TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  resolved_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_review_queue_status ON review_queue(status);
CREATE INDEX IF NOT EXISTS idx_review_queue_type ON review_queue(item_type);
CREATE INDEX IF NOT EXISTS idx_review_queue_source_type ON review_queue(source_type);

-- ============================================================================
-- FACEBOOK SESSION DATA (for session info from official Facebook posts)
-- ============================================================================
CREATE TABLE IF NOT EXISTS facebook_session_data (
  id TEXT PRIMARY KEY,
  session_id TEXT REFERENCES sessions(id) ON DELETE SET NULL,
  post_url TEXT NOT NULL,
  post_date TEXT NOT NULL,
  session_number INTEGER,
  session_type TEXT,
  raw_content TEXT, -- Full post text for reference
  extracted_data TEXT, -- JSON: {documents: [{number, title, author, seconded_by}], attendance: {...}}
  created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS fb_session_data_session ON facebook_session_data(session_id);
CREATE INDEX IF NOT EXISTS fb_session_data_post_date ON facebook_session_data(post_date);
