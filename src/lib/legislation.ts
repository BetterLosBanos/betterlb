// ------------------
// Types
// ------------------

export type DocumentType = 'ordinance' | 'resolution' | 'executive_order';

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
    mayor: string;
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
