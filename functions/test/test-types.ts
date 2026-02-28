/**
 * Type definitions for OpenLGU API tests
 * Import types from src/lib/openlgu.ts and re-export for test usage
 */

import type {
  Committee,
  DocumentItem,
  Person,
  PersonCommitteeRole,
  PersonMembership,
  Session,
  Term,
} from '../../../src/lib/openlgu';

// Re-export types for test usage
export type {
  Committee,
  DocumentItem,
  Person,
  PersonCommitteeRole,
  PersonMembership,
  Session,
  Term,
};

// API Response Types
export interface CommitteeResponse {
  committees: Array<{
    id: string;
    name: string;
    type: string;
    members: Array<{
      id: string;
      first_name: string;
      last_name: string;
      term_id: string;
      role: string;
    }>;
  }>;
}

export interface CommitteeMemberResponse {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  term_id: string;
  role: string;
  committee: {
    id: string;
    name: string;
    type: string;
  };
}

export interface DocumentResponse {
  documents: DocumentItem[];
}

export interface PersonResponse {
  id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  roles: string[];
  memberships: PersonMembership[];
  committees?: PersonCommitteeRole[];
  documents?: DocumentItem[];
}

export interface SessionResponse {
  id: string;
  term_id: string;
  number: number;
  type: string;
  date: string;
  present: string[];
  absent: string[];
  ordinal_number: string;
  term?: Term;
}

export interface SessionsResponse {
  sessions: Session[];
  term?: Term;
}

export interface TermResponse {
  id: string;
  term_number: number;
  ordinal: string;
  name: string;
  start_date: string;
  end_date: string;
  year_range: string;
  executive: {
    mayor_id?: string;
    mayor: string;
    vice_mayor_id?: string;
    vice_mayor: string;
  };
  sessions?: Session[];
  documents?: DocumentItem[];
}
