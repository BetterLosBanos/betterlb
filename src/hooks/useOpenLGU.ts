// src/hooks/useOpenLGU.ts
import { useEffect, useState } from 'react';

import {
  loadCommitteesFromAPI,
  loadDocumentsFromAPI,
  loadPersonsFromAPI,
  loadSessionsFromAPI,
  loadTermFromAPI,
  loadTermsFromAPI,
} from '../lib/openlgu';
import type { Person } from '../lib/openlgu';

export interface LegislationData {
  term: Awaited<ReturnType<typeof loadTermFromAPI>>;
  terms: Awaited<ReturnType<typeof loadTermsFromAPI>>;
  committees: Awaited<ReturnType<typeof loadCommitteesFromAPI>>;
  persons: Person[];
  sessions: Awaited<ReturnType<typeof loadSessionsFromAPI>>;
  documents: Awaited<ReturnType<typeof loadDocumentsFromAPI>>;
  isLoading: boolean;
  error: Error | null;
}

export default function useOpenLGU(): LegislationData {
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
        const [term, terms, committees, persons, sessions, documents] =
          await Promise.all([
            loadTermFromAPI(),
            loadTermsFromAPI(),
            loadCommitteesFromAPI(),
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
