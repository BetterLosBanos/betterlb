export interface Person {
  id: string;
  first_name: string;
  last_name: string;
  roles: string[];
  memberships: Array<{
    term_id: string;
    role: string;
    rank?: number;
    committees: Array<{
      id: string;
      role: string;
    }>;
  }>;
}

export interface DocumentItem {
  id: string;
  number: string;
  title: string;
  type: 'ordinance' | 'resolution' | 'executive_order';
  date_enacted: string;
  author_ids: string[];
  session_id: string;
  status: string;
  link: string;
}

export interface Session {
  id: string;
  date: string;
  type: string;
  ordinal_number: string;
  term_id: string;
  present: string[];
  absent: string[];
}

export interface Term {
  id: string;
  name: string;
  ordinal: string;
  year_range: string;
  start_date: string;
  end_date: string;
  executive: {
    mayor: string;
    vice_mayor: string;
  };
}

export interface LegislationContext {
  documents: DocumentItem[];
  persons: Person[];
  sessions: Session[];
  term: Term;
}
