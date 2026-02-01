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
// Helper Interface for Vite Import
// ------------------
interface LegislationModule<T> {
  default: T;
}

// ------------------
// LOADERS
// ------------------

export function loadCommittees(): Committee[] {
  // We explicitly type the glob result
  const files = import.meta.glob<LegislationModule<Committee>>(
    '../data/legislation/committees/*.json',
    { eager: true }
  );
  return Object.values(files).map(f => f.default);
}

export function loadPersons(): Person[] {
  const files = import.meta.glob<LegislationModule<Person>>(
    '../data/legislation/persons/*.json',
    { eager: true }
  );
  return Object.values(files).map(f => f.default);
}

export function loadSessions(): Session[] {
  const files = import.meta.glob<LegislationModule<Session>>(
    '../data/legislation/sessions/**/*.json',
    { eager: true }
  );

  return Object.values(files)
    .map(f => f.default)
    .sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
}

export function loadTerm(): Term | null {
  const files = import.meta.glob<LegislationModule<Term>>(
    '../data/legislation/term/*.json',
    { eager: true }
  );
  const first = Object.values(files)[0];
  // No need for 'as any' anymore because we typed 'files'
  return first?.default ?? null;
}

export function loadDocuments(): DocumentItem[] {
  // Type the glob results to avoid 'any'
  const resolutions = import.meta.glob<LegislationModule<DocumentItem>>(
    '../data/legislation/documents/sb_12/resolutions/*.json',
    { eager: true }
  );
  const ordinances = import.meta.glob<LegislationModule<DocumentItem>>(
    '../data/legislation/documents/sb_12/ordinances/*.json',
    { eager: true }
  );
  const execOrders = import.meta.glob<LegislationModule<DocumentItem>>(
    '../data/legislation/documents/sb_12/executive_orders/*.json',
    { eager: true }
  );

  const resDocs = Object.values(resolutions).map(f => ({
    ...f.default,
    type: 'resolution' as DocumentType,
  }));
  const ordDocs = Object.values(ordinances).map(f => ({
    ...f.default,
    type: 'ordinance' as DocumentType,
  }));
  const eoDocs = Object.values(execOrders).map(f => ({
    ...f.default,
    type: 'executive_order' as DocumentType,
  }));

  const allDocs = [...resDocs, ...ordDocs, ...eoDocs];

  return allDocs.sort((a, b) => {
    return (
      new Date(b.date_enacted).getTime() - new Date(a.date_enacted).getTime()
    );
  });
}

export function loadDocument(
  type: DocumentType,
  id: string
): DocumentItem | undefined {
  const allDocs = loadDocuments();
  return allDocs.find(d => d.id === id && d.type === type);
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
  photo_url?: string | null;
}

export async function loadPersonsFromAPI(): Promise<Person[]> {
  try {
    const response = await fetch('/api/legislation/persons?limit=100');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.persons || []).map((p: APIPerson) => ({
      id: p.id,
      first_name: p.first_name,
      middle_name: p.middle_name || '',
      last_name: p.last_name,
      roles: [],
      memberships: [],
    }));
  } catch (error) {
    console.error('Failed to load persons from API:', error);
    return [];
  }
}

export async function loadDocumentsFromAPI(): Promise<DocumentItem[]> {
  try {
    const response = await fetch('/api/legislation/documents?limit=5000');
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
    const response = await fetch('/api/legislation/sessions?limit=1000');
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
    const response = await fetch('/api/legislation/terms?limit=10');
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return (data.terms || []).map((t: any) => ({
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
