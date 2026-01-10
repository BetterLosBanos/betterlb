// src/hooks/useLegislation.ts
import {
  loadCommittees,
  loadDocuments,
  loadPersons,
  loadSessions,
  loadTerm,
} from '../lib/legislation';

export default function useLegislation() {
  const term = loadTerm();
  const committees = loadCommittees();
  const persons = loadPersons();
  const sessions = loadSessions();
  const documents = loadDocuments();

  return { term, committees, persons, sessions, documents };
}
