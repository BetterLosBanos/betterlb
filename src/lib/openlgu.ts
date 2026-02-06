// ------------------
// Types
// ------------------

export type DocumentType = 'ordinance' | 'resolution' | 'executive_order';

export interface DocumentItem {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  session_id: string;
  status: string;
  date_enacted: string;
  link: string;
  author_ids: string[];
  term_id?: string;
  mayor_id?: string;
  subjects: string[];
}

export interface Committee {
  id: string;
  name: string;
  type: string;
  terms: string[];
}

export interface DocumentItem {
  id: string;
  type: DocumentType;
  number: string;
  title: string;
  session_id: string;
  author_ids: string[];
  status: string;
  date_enacted: string;
  link: string;
  subjects: string[];
}

export interface PersonCommitteeRole {
  id: string;
  role: string;
}

export interface PersonMembership {
  term_id: string;
  chamber?: string;
  role: string;
  rank?: number;
  committees: PersonCommitteeRole[];
}

export interface Person {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  roles: string[];
  memberships: PersonMembership[];
}

export interface Session {
  id: string;
  term_id: string;
  number: number;
  type: string;
  date: string;
  present: string[];
  absent: string[];
  ordinal_number: string;
}

export interface Term {
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
}

// ------------------
// UTILITY HELPERS
// ------------------

export function getPersonById(
  persons: Person[],
  id: string
): Person | undefined {
  if (!id) return undefined;
  return persons.find(p => p.id.toLowerCase() === id.trim().toLowerCase());
}

export function getPersonName(person: Person): string {
  return [person.first_name, person.middle_name, person.last_name]
    .filter(Boolean)
    .join(' ');
}

// ------------------
// API-BASED LOADERS
// ------------------

export interface APIPerson {
  id: string;
  first_name: string;
  middle_name?: string;
  last_name: string;
  aliases?: string[] | null;
  memberships?: Array<{
    term_id: string;
    chamber?: string;
    role: string;
    rank?: number;
    committees: Array<{ id: string; role: string }>;
    term?: {
      id: string;
      term_number: number;
      ordinal: string;
      name: string;
      year_range: string;
    };
  }>;
  roles?: string[];
}

export interface APITerm {
  id: string;
  term_number: number;
  ordinal: string;
  name: string;
  start_date: string;
  end_date: string;
  year_range: string;
  mayor_id?: string;
  vice_mayor_id?: string;
  executive?: {
    mayor?: string;
    vice_mayor?: string;
  };
}

export async function loadPersonsFromAPI(): Promise<Person[]> {
  try {
    const response = await fetch('/api/openlgu/persons?limit=100');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.persons || []).map((p: APIPerson) => ({
      id: p.id,
      first_name: p.first_name,
      middle_name: p.middle_name || '',
      last_name: p.last_name,
      roles: p.roles || [],
      memberships: (p.memberships || []).map((m: any) => ({
        term_id: m.term_id,
        chamber: m.chamber,
        role: m.role,
        rank: m.rank,
        committees: (m.committees || []).map((c: any) => ({
          id: c.id,
          role: c.role,
        })),
      })),
    }));
  } catch (error) {
    console.error('Failed to load persons from API:', error);
    return [];
  }
}

export async function loadDocumentsFromAPI(): Promise<DocumentItem[]> {
  try {
    const response = await fetch('/api/openlgu/documents?limit=5000');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.documents || []).map((d: any) => ({
      id: d.id,
      type: d.type,
      number: d.number,
      title: d.title,
      session_id: d.session_id,
      status: d.status,
      date_enacted: d.date_enacted,
      link: d.pdf_url || d.link,
      author_ids: d.author_ids || [],
      term_id: d.term_id,
      mayor_id: d.mayor_id,
      subjects: [],
    }));
  } catch (error) {
    console.error('Failed to load documents from API:', error);
    return [];
  }
}

export async function loadSessionsFromAPI(): Promise<Session[]> {
  try {
    const response = await fetch('/api/openlgu/sessions?limit=1000');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.sessions || []).map((s: any) => ({
      id: s.id,
      term_id: s.term_id,
      number: s.number,
      type: s.type,
      date: s.date,
      ordinal_number: s.ordinal_number,
      present: s.present || [],
      absent: s.absent || [],
    }));
  } catch (error) {
    console.error('Failed to load sessions from API:', error);
    return [];
  }
}

export async function loadTermsFromAPI(): Promise<Term[]> {
  try {
    const response = await fetch('/api/openlgu/terms?limit=10');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.terms || []).map((t: APITerm) => ({
      id: t.id,
      term_number: t.term_number,
      ordinal: t.ordinal,
      name: t.name,
      start_date: t.start_date,
      end_date: t.end_date,
      year_range: t.year_range,
      executive: {
        mayor_id: t.mayor_id,
        mayor: t.executive?.mayor || 'TBD',
        vice_mayor_id: t.vice_mayor_id,
        vice_mayor: t.executive?.vice_mayor || 'TBD',
      },
    }));
  } catch (error) {
    console.error('Failed to load terms from API:', error);
    return [];
  }
}

export async function loadCommitteesFromAPI(): Promise<Committee[]> {
  try {
    const response = await fetch('/api/openlgu/committees');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.committees || []).map(
      (c: { id: string; name: string; type: string }) => ({
        id: c.id,
        name: c.name,
        type: c.type,
        terms: [],
      })
    );
  } catch (error) {
    console.error('Failed to load committees from API:', error);
    return [];
  }
}

export async function loadTermFromAPI(): Promise<Term | null> {
  try {
    const response = await fetch('/api/openlgu/terms?limit=10');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    const apiTerms: APITerm[] = data.terms || [];

    if (apiTerms.length === 0) return null;

    // Find the current/active term: highest term_number or most recent by date
    const currentTerm = apiTerms.reduce(
      (latest: APITerm | null, term: APITerm) => {
        if (!latest || term.term_number > latest.term_number) {
          return term;
        }
        return latest;
      },
      null
    );

    if (!currentTerm) return null;

    return {
      id: currentTerm.id,
      term_number: currentTerm.term_number,
      ordinal: currentTerm.ordinal,
      name: currentTerm.name,
      start_date: currentTerm.start_date,
      end_date: currentTerm.end_date,
      year_range: currentTerm.year_range,
      executive: {
        mayor_id: currentTerm.mayor_id,
        mayor: currentTerm.executive?.mayor || 'TBD',
        vice_mayor_id: currentTerm.vice_mayor_id,
        vice_mayor: currentTerm.executive?.vice_mayor || 'TBD',
      },
    };
  } catch (error) {
    console.error('Failed to load term from API:', error);
    return null;
  }
}
