// src/hooks/useLegislation.ts
import { useState, useEffect } from 'react';
import {
  loadCommittees,
  loadDocumentsFromAPI,
  loadSessionsFromAPI,
  loadTerm,
  loadPersonsFromAPI,
  loadTermsFromAPI,
} from '../lib/legislation';
import type { Person } from '../lib/legislation';

export interface LegislationData {
  term: Awaited<ReturnType<typeof loadTerm>>;
  terms: Awaited<ReturnType<typeof loadTermsFromAPI>>;
  committees: Awaited<ReturnType<typeof loadCommittees>>;
  persons: Person[];
  sessions: Awaited<ReturnType<typeof loadSessionsFromAPI>>;
  documents: Awaited<ReturnType<typeof loadDocumentsFromAPI>>;
  isLoading: boolean;
  error: Error | null;
}

export default function useLegislation(): LegislationData {
  const [data, setData] = useState<LegislationData>({
    term: null,
    terms: [],
    committees: [],
    persons: [],
    sessions: [],
    documents: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [term, terms, committees, persons, sessions, documents] = await Promise.all([
          loadTerm(),
          loadTermsFromAPI(),
          loadCommittees(),
          loadPersonsFromAPI(),
          loadSessionsFromAPI(),
          loadDocumentsFromAPI(),
        ]);

        setData({
          term,
          terms,
          committees,
          persons,
          sessions,
          documents,
          isLoading: false,
          error: null,
        });
      } catch (err) {
        setData(prev => ({
          ...prev,
          isLoading: false,
          error: err as Error,
        }));
      }
    }

    loadData();
  }, []);

  return data;
}
