/**
 * Sample test data for API integration testing
 * Provides realistic test data matching the database schema
 */

export const sampleTerms = [
  {
    id: 'sb_12',
    term_number: 12,
    name: 'Sangguniang Bayan 12th Term',
    ordinal: '12th',
    year_range: '2022-2025',
    start_date: '2022-07-01',
    end_date: '2025-06-30',
    mayor_id: 'mayor_1',
    vice_mayor_id: 'vm_1',
    created_at: '2022-07-01T00:00:00.000Z',
  },
  {
    id: 'sb_11',
    term_number: 11,
    name: 'Sangguniang Bayan 11th Term',
    ordinal: '11th',
    year_range: '2019-2022',
    start_date: '2019-07-01',
    end_date: '2022-06-30',
    mayor_id: 'mayor_2',
    vice_mayor_id: 'vm_2',
    created_at: '2019-07-01T00:00:00.000Z',
  },
];

export const samplePersons = [
  {
    id: 'person_1',
    first_name: 'Juan',
    middle_name: 'A',
    last_name: 'Dela Cruz',
    suffix: null,
    aliases: JSON.stringify(['Juan Dela Cruz', 'J. Dela Cruz']),
  },
  {
    id: 'person_2',
    first_name: 'Maria',
    middle_name: 'B',
    last_name: 'Santos',
    suffix: null,
    aliases: null,
  },
  {
    id: 'person_3',
    first_name: 'Carlos',
    middle_name: 'C',
    last_name: 'Reyes',
    suffix: 'Jr',
    aliases: JSON.stringify(['Carlitos Reyes']),
  },
  {
    id: 'mayor_1',
    first_name: 'Jose',
    middle_name: 'D',
    last_name: 'Garcia',
    suffix: null,
    aliases: null,
  },
];

export const sampleMemberships = [
  {
    id: 'membership_1',
    person_id: 'person_1',
    term_id: 'sb_12',
    chamber: 'sangguniang_bayan',
    role: 'Councilor',
    rank: 1,
  },
  {
    id: 'membership_2',
    person_id: 'person_2',
    term_id: 'sb_12',
    chamber: 'sangguniang_bayan',
    role: 'Councilor',
    rank: 2,
  },
  {
    id: 'membership_3',
    person_id: 'person_3',
    term_id: 'sb_12',
    chamber: 'sangguniang_bayan',
    role: 'Councilor',
    rank: 3,
  },
  {
    id: 'membership_4',
    person_id: 'person_1',
    term_id: 'sb_11',
    chamber: 'sangguniang_bayan',
    role: 'Councilor',
    rank: 1,
  },
];

export const sampleSessions = [
  {
    id: 'session_1',
    term_id: 'sb_12',
    number: 1,
    ordinal_number: '1st',
    type: 'Regular',
    date: '2024-01-15',
    description: 'First regular session of 2024',
  },
  {
    id: 'session_2',
    term_id: 'sb_12',
    number: 2,
    ordinal_number: '2nd',
    type: 'Regular',
    date: '2024-02-15',
    description: 'Second regular session of 2024',
  },
  {
    id: 'session_3',
    term_id: 'sb_12',
    number: 3,
    ordinal_number: '3rd',
    type: 'Special',
    date: '2024-03-01',
    description: 'Special session on budget',
  },
];

export const sampleSessionAbsences = [
  {
    session_id: 'session_1',
    person_id: 'person_2',
  },
  {
    session_id: 'session_2',
    person_id: 'person_3',
  },
];

export const sampleDocuments = [
  {
    id: 'doc_1',
    type: 'ordinance',
    number: '2024-001',
    title: 'An Ordinance Regulating Business Operations',
    session_id: 'session_1',
    status: 'enacted',
    date_enacted: '2024-01-15',
    pdf_url: 'https://example.com/ordinance-2024-001.pdf',
    moved_by: 'person_1',
    seconded_by: 'person_2',
    source_type: 'facebook',
    needs_review: 0,
    processed: 1,
    created_at: '2024-01-10',
    updated_at: '2024-01-15',
  },
  {
    id: 'doc_2',
    type: 'resolution',
    number: '2024-015',
    title: 'Resolution Expressing Condolences',
    session_id: 'session_1',
    status: 'enacted',
    date_enacted: '2024-01-15',
    pdf_url: 'https://example.com/resolution-2024-015.pdf',
    moved_by: 'person_2',
    seconded_by: 'person_3',
    source_type: 'govph',
    needs_review: 0,
    processed: 1,
    created_at: '2024-01-12',
    updated_at: '2024-01-15',
  },
  {
    id: 'doc_3',
    type: 'ordinance',
    number: '2024-002',
    title: 'An Ordinance Establishing Environmental Guidelines',
    session_id: 'session_2',
    status: 'pending',
    date_enacted: null,
    pdf_url: null,
    moved_by: 'person_1',
    seconded_by: 'person_3',
    source_type: 'facebook',
    needs_review: 1,
    processed: 0,
    created_at: '2024-02-10',
    updated_at: '2024-02-10',
  },
];

export const sampleDocumentAuthors = [
  {
    document_id: 'doc_1',
    person_id: 'person_1',
  },
  {
    document_id: 'doc_1',
    person_id: 'person_2',
  },
  {
    document_id: 'doc_2',
    person_id: 'person_2',
  },
  {
    document_id: 'doc_3',
    person_id: 'person_1',
  },
];

export const sampleCommittees = [
  {
    id: 'committee_1',
    name: 'Committee on Laws',
    type: 'standing',
  },
  {
    id: 'committee_2',
    name: 'Committee on Finance',
    type: 'standing',
  },
  {
    id: 'committee_3',
    name: 'Committee on Environment',
    type: 'special',
  },
];

export const sampleCommitteeMemberships = [
  {
    person_id: 'person_1',
    term_id: 'sb_12',
    committee_id: 'committee_1',
    role: 'Chairperson',
  },
  {
    person_id: 'person_1',
    term_id: 'sb_12',
    committee_id: 'committee_3',
    role: 'Member',
  },
  {
    person_id: 'person_2',
    term_id: 'sb_12',
    committee_id: 'committee_2',
    role: 'Chairperson',
  },
  {
    person_id: 'person_3',
    term_id: 'sb_12',
    committee_id: 'committee_1',
    role: 'Member',
  },
];

/**
 * Create a complete test database with all sample data
 */
export function createSampleDatabase() {
  return {
    terms: sampleTerms,
    persons: samplePersons,
    memberships: sampleMemberships,
    sessions: sampleSessions,
    session_absences: sampleSessionAbsences,
    documents: sampleDocuments,
    document_authors: sampleDocumentAuthors,
    committees: sampleCommittees,
    committee_memberships: sampleCommitteeMemberships,
  };
}
