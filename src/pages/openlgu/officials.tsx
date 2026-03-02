import { useCallback, useMemo, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import { PageLoadingState } from '@/components/ui';
import {
  IndexPageLayout,
  type BreadcrumbItem,
} from '@/components/layout/IndexPageLayout';

import type { DocumentItem, Person, Session, Term } from '@/lib/openlgu';
import { getPersonName } from '@/lib/openlgu';

import OfficialCard from './components/OfficialCard';
import OfficialsFilterBar from './components/OfficialsFilterBar';

interface LegislationContext {
  persons: Person[];
  sessions: Session[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  terms: Term[];
  documents: DocumentItem[];
  isLoading: boolean;
}

// Get the most recent membership for a person
function getLatestMembership(
  person: Person,
  terms: Term[]
): PersonMembership | null {
  if (person.memberships.length === 0) return null;

  // Sort memberships by term number (most recent first)
  const sortedMemberships = [...person.memberships].sort((a, b) => {
    const termA = terms.find(t => t.id === a.term_id);
    const termB = terms.find(t => t.id === b.term_id);
    return (termB?.term_number || 0) - (termA?.term_number || 0);
  });

  return sortedMemberships[0];
}

// Check if person has a specific role
function hasRole(person: Person, roleFilter: string): boolean {
  if (!roleFilter) return true;
  return person.roles.some(r => r === roleFilter);
}

// Check if person served in a specific term
function servedInTerm(person: Person, termFilter: string): boolean {
  if (!termFilter) return true;
  return person.memberships.some(m => m.term_id === termFilter);
}

export default function OfficialsIndex() {
  const {
    persons,
    sessions,
    searchQuery,
    setSearchQuery,
    terms,
    documents,
    isLoading,
  } = useOutletContext<LegislationContext>();

  // Local state for filters
  const [roleFilter, setRoleFilter] = useState('');
  const [termFilter, setTermFilter] = useState('');
  const [expandedPersonId, setExpandedPersonId] = useState<string | null>(null);

  const toggleExpanded = useCallback((personId: string) => {
    setExpandedPersonId(prev => (prev === personId ? null : personId));
  }, []);

  // Filter and sort persons
  const filteredPersons = useMemo(() => {
    return persons
      .filter(person => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          getPersonName(person).toLowerCase().includes(query) ||
          person.roles.some(r => r.toLowerCase().includes(query));
        const matchesRole = hasRole(person, roleFilter);
        const matchesTerm = servedInTerm(person, termFilter);
        return matchesSearch && matchesRole && matchesTerm;
      })
      .sort((a, b) => a.last_name.localeCompare(b.last_name));
  }, [persons, searchQuery, roleFilter, termFilter]);

  // Group persons by first letter of last name for A-Z navigation
  const personsByLetter = useMemo(() => {
    const groups = new Map<string, Person[]>();
    for (const person of filteredPersons) {
      const letter = person.last_name[0].toUpperCase();
      if (!groups.has(letter)) {
        groups.set(letter, []);
      }
      groups.get(letter)!.push(person);
    }
    return groups;
  }, [filteredPersons]);

  // Get sorted letters
  const sortedLetters = useMemo(() => {
    return Array.from(personsByLetter.keys()).sort();
  }, [personsByLetter]);

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Home', href: '/' },
    { label: 'OpenLGU', href: '/openlgu' },
    { label: 'Officials', href: '/openlgu/officials' },
  ];

  return (
    <IndexPageLayout
      title='Officials of Los Baños'
      description='Browse the historical collection of all LGU politicians who have served Los Baños.'
      breadcrumbs={breadcrumbs}
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'Search officials...',
      }}
      resultsCount={filteredPersons.length}
      resultsLabel={filteredPersons.length === 1 ? 'official' : 'officials'}
      emptyState={
        !isLoading && filteredPersons.length === 0
          ? {
              title: 'No officials found',
              message: "We couldn't find any officials matching your filters",
            }
          : undefined
      }
    >
      {/* Filter Bar */}
      <OfficialsFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        roleFilter={roleFilter}
        setRoleFilter={setRoleFilter}
        termFilter={termFilter}
        setTermFilter={setTermFilter}
        terms={terms}
      />

      {/* Loading State */}
      {isLoading ? (
        <PageLoadingState message='Loading officials...' />
      ) : (
        <>
          {/* A-Z grouped list */}
          <div className='space-y-8'>
            {sortedLetters.map(letter => {
              const personsInLetter = personsByLetter.get(letter)!;
              return (
                <div key={letter}>
                  {/* Letter header */}
                  <h2 className='text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface/95 sticky top-0 mb-3 border-b py-2 text-lg font-bold backdrop-blur-sm'>
                    {letter}
                  </h2>

                  {/* Persons in this letter group */}
                  <div className='space-y-3'>
                    {personsInLetter.map(person => {
                      const latestMembership = getLatestMembership(
                        person,
                        terms
                      );
                      if (!latestMembership) return null;

                      const latestTerm = terms.find(
                        t => t.id === latestMembership.term_id
                      );
                      if (!latestTerm) return null;

                      return (
                        <OfficialCard
                          key={person.id}
                          person={person}
                          latestMembership={latestMembership}
                          latestTerm={latestTerm}
                          allTerms={terms}
                          sessions={sessions}
                          documents={documents}
                          isExpanded={expandedPersonId === person.id}
                          onToggle={() => toggleExpanded(person.id)}
                        />
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </IndexPageLayout>
  );
}
