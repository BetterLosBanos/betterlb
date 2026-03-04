import { useEffect, useMemo } from 'react';

import { Link, useOutletContext } from 'react-router-dom';

import { parseAsInteger, useQueryState } from 'nuqs';

import { Badge } from '@/components/ui/Badge';
import { CardSkeleton } from '@/components/ui/Skeletons';
import { IndexPageLayout } from '@/components/layout/IndexPageLayout';

import type {
  Committee,
  DocumentItem,
  Person,
  Session,
  Term,
} from '@/lib/openlgu';
import { getDocTypeBadgeVariant, getPersonName } from '@/lib/openlgu';

import DocumentFilters from './components/DocumentFilters';
import type { FilterType } from './layout';

interface LegislationContext {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  authorIds: string[];
  setAuthorIds: (ids: string[]) => void;
  year: string;
  setYear: (year: string) => void;
  documents: DocumentItem[];
  persons: Person[];
  terms: Term[];
  sessions: Session[];
  committees: Committee[];
  isLoading: boolean;
}

export default function LegislationIndex() {
  const {
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    authorIds,
    setAuthorIds,
    year,
    setYear,
    documents,
    persons,
    isLoading,
  } = useOutletContext<LegislationContext>();

  // Pagination state synced with URL
  const [currentPage, setCurrentPage] = useQueryState(
    'page',
    parseAsInteger.withDefault(1)
  );
  const itemsPerPage = 12;

  // Generate author options from persons
  const authorOptions = useMemo(() => {
    return persons
      .filter(
        p =>
          p.roles.includes('councilor') ||
          p.roles.includes('vice_mayor') ||
          p.roles.includes('mayor')
      )
      .map(person => ({
        label: getPersonName(person),
        value: person.id,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [persons]);

  // Generate year options from documents
  const yearOptions = useMemo(() => {
    const years = new Set(
      documents.map(doc => new Date(doc.date_enacted).getFullYear().toString())
    );
    return Array.from(years)
      .sort()
      .reverse()
      .map(year => ({
        label: year,
        value: year,
      }));
  }, [documents]);

  // Filter documents
  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      doc.title.toLowerCase().includes(query) ||
      doc.number.toLowerCase().includes(query) ||
      doc.author_ids.some(id => {
        const author = persons.find(p => p.id === id);
        return author
          ? getPersonName(author).toLowerCase().includes(query)
          : false;
      });
    const matchesType = filterType === 'all' || doc.type === filterType;
    const matchesAuthor =
      authorIds.length === 0 ||
      doc.author_ids.some(id => authorIds.includes(id));
    const docYear = new Date(doc.date_enacted).getFullYear().toString();
    const matchesYear = !year || docYear === year;

    return matchesSearch && matchesType && matchesAuthor && matchesYear;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredDocs.length / itemsPerPage);
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Reset to page 1 when filters change
  useEffect(() => {
    if (currentPage > 1 && filteredDocs.length > 0) {
      const maxPage = Math.ceil(filteredDocs.length / itemsPerPage);
      if (currentPage > maxPage) {
        setCurrentPage(1);
      }
    }
  }, [
    filterType,
    authorIds,
    year,
    searchQuery,
    filteredDocs.length,
    itemsPerPage,
    currentPage,
    setCurrentPage,
  ]);

  // Show loading skeleton while data is being fetched
  if (isLoading) {
    return (
      <IndexPageLayout
        title='Legislation'
        description='Browse ordinances, resolutions, and executive orders from the Sangguniang Bayan.'
        search={{
          value: searchQuery,
          onChange: setSearchQuery,
          placeholder: 'Search legislation...',
        }}
      >
        <section className='space-y-4'>
          {Array.from({ length: 10 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </section>
      </IndexPageLayout>
    );
  }

  return (
    <IndexPageLayout
      title='Legislation'
      description='Browse ordinances, resolutions, and executive orders from the Sangguniang Bayan.'
      search={{
        value: searchQuery,
        onChange: setSearchQuery,
        placeholder: 'Search legislation...',
      }}
      resultsCount={filteredDocs.length}
      resultsLabel='Results'
      emptyState={
        filteredDocs.length === 0
          ? {
              title: 'No documents found',
              message: `We couldn't find matches for "${searchQuery}"`,
            }
          : undefined
      }
    >
      {/* Filter Bar */}
      <DocumentFilters
        filterType={filterType}
        setFilterType={setFilterType}
        authorIds={authorIds}
        setAuthorIds={setAuthorIds}
        year={year}
        setYear={setYear}
        authorOptions={authorOptions}
        yearOptions={yearOptions}
      />

      {/* Document Cards */}
      {paginatedDocs.map(doc => {
        const authors = doc.author_ids
          .map(id => persons.find(p => p.id === id))
          .filter((p): p is Person => Boolean(p));

        // For executive orders, show the mayor as author if no authors listed
        let displayAuthors = authors;
        if (
          doc.type === 'executive_order' &&
          authors.length === 0 &&
          'mayor_id' in doc &&
          doc.mayor_id
        ) {
          const mayor = persons.find(p => p.id === doc.mayor_id);
          if (mayor) {
            displayAuthors = [mayor];
          }
        }

        const queryParams = new URLSearchParams();
        if (searchQuery) queryParams.set('search', searchQuery);
        if (filterType !== 'all') queryParams.set('type', filterType);
        if (authorIds.length > 0)
          queryParams.set('authors', authorIds.join(','));
        if (year) queryParams.set('year', year);
        const queryString = queryParams.toString();

        return (
          <Link
            key={doc.id}
            to={`documents/${doc.id}${queryString ? `?${queryString}` : ''}`}
            className='group block'
            aria-label={`${doc.type} ${doc.number}: ${doc.title}`}
          >
            <article className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface relative flex min-h-[100px] flex-col gap-4 rounded-2xl border p-5 shadow-xs transition-all hover:shadow-md md:flex-row md:items-start md:justify-between'>
              <div className='flex-1 space-y-2'>
                <header className='flex items-center gap-3'>
                  <Badge variant={getDocTypeBadgeVariant(doc.type)}>
                    {doc.type}
                  </Badge>
                  <span
                    className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'
                    aria-label={`Enacted on ${doc.date_enacted}`}
                  >
                    {doc.date_enacted}
                  </span>
                </header>
                <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong line-clamp-2 text-base leading-snug font-bold transition-colors'>
                  {doc.title}
                </h3>
                <div className='text-kapwa-text-disabled flex items-center gap-2 text-[11px] font-medium'>
                  <span className='bg-kapwa-bg-hover text-kapwa-text-support rounded px-1.5 py-0.5 font-mono font-bold'>
                    {doc.number}
                  </span>
                  <span className='text-kapwa-text-support'>|</span>
                  <span className='truncate'>
                    Authors:{' '}
                    {displayAuthors.length > 0
                      ? displayAuthors.map(a => getPersonName(a)).join(', ')
                      : 'Office of the Mayor'}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        );
      })}

      {/* Bottom Pagination */}
      {totalPages > 1 && (
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex flex-wrap items-center justify-between gap-4 rounded-xl border-t p-4'>
          <span className='text-kapwa-text-disabled text-xs font-medium'>
            Showing {(currentPage - 1) * itemsPerPage + 1}—
            {Math.min(currentPage * itemsPerPage, filteredDocs.length)} of{' '}
            {filteredDocs.length}
          </span>
          <nav className='flex items-center gap-2'>
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-surface-raised disabled:text-kapwa-text-disabled rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              ← Previous
            </button>
            <span className='text-kapwa-text-disabled text-xs font-medium'>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
              className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-surface-raised disabled:text-kapwa-text-disabled rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors disabled:cursor-not-allowed disabled:opacity-50'
            >
              Next →
            </button>
          </nav>
        </div>
      )}
    </IndexPageLayout>
  );
}
