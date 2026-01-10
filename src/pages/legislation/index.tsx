import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { Calendar, ArrowRight, Loader2, FileText } from 'lucide-react';
import type { DocumentItem, Person } from '../../lib/legislation';
import type { FilterType } from './layout';
import { getPersonName } from '../../lib/legislation';

interface LegislationContext {
  searchQuery: string;
  filterType: FilterType;
  documents: DocumentItem[];
  persons: Person[];
}

const getBadgeStyles = (type: string) => {
  switch (type) {
    case 'ordinance':
      return 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-700/10';
    case 'resolution':
      return 'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20';
    case 'executive_order':
      return 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20';
    default:
      return 'bg-zinc-50 text-zinc-600 ring-1 ring-inset ring-zinc-500/10';
  }
};

export default function LegislationIndex() {
  const { searchQuery, filterType, documents, persons } =
    useOutletContext<LegislationContext>();

  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

  const filteredDocs = documents.filter(doc => {
    const query = searchQuery.toLowerCase();

    // Check Title
    const matchesTitle = doc.title.toLowerCase().includes(query);

    // Check Document Number
    const matchesNumber = doc.number.toLowerCase().includes(query);

    // Check Authors
    const matchesAuthor = doc.author_ids.some(authorId => {
      const person = persons.find(p => p.id === authorId);
      if (!person) return false;

      const fullName = getPersonName(person).toLowerCase();
      return fullName.includes(query);
    });

    const matchesSearch = matchesTitle || matchesNumber || matchesAuthor;
    const matchesType = filterType === 'all' || doc.type === filterType;

    return matchesSearch && matchesType;
  });

  useEffect(() => {
    setVisibleCount(10);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [searchQuery, filterType]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) setVisibleCount(prev => prev + 10);
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [filteredDocs]);

  const displayedDocs = filteredDocs.slice(0, visibleCount);

  if (filteredDocs.length === 0) {
    return (
      <div className='flex flex-col items-center justify-center py-24 text-center'>
        <div className='rounded-full bg-zinc-100 p-4 mb-4'>
          <FileText className='h-8 w-8 text-zinc-400' />
        </div>
        <p className='text-lg font-medium text-zinc-900'>No documents found</p>
        <p className='text-sm text-zinc-500 max-w-xs mx-auto mt-1'>
          {/* ESLINT FIX: Use entities for quotes */}
          We couldn&apos;t find anything matching &quot;{searchQuery}&quot;
          {filterType !== 'all' ? ` in ${filterType.replace('_', ' ')}s` : ''}.
        </p>
      </div>
    );
  }

  return (
    <section
      aria-label='Legislation Documents List'
      className='mx-auto max-w-5xl space-y-4'
    >
      <div className='flex items-center justify-between pb-2 px-1'>
        <p className='text-sm text-zinc-500'>
          Showing{' '}
          <span className='font-semibold text-zinc-900'>
            {filteredDocs.length}
          </span>{' '}
          documents
          {searchQuery && (
            /* ESLINT FIX: Use entities for quotes */
            <>
              {' '}
              matching{' '}
              <span className='font-semibold text-zinc-900'>
                &quot;{searchQuery}&quot;
              </span>
            </>
          )}
        </p>

        {filterType !== 'all' && (
          <span className='text-xs font-medium uppercase tracking-wider text-zinc-400'>
            {filterType.replace('_', ' ')}s
          </span>
        )}
      </div>

      {displayedDocs.map(doc => (
        <Link key={doc.id} to={`${doc.type}/${doc.id}`} className='group block'>
          <article className='relative flex flex-col gap-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-sm transition-all hover:border-blue-400 hover:shadow-md md:flex-row md:items-start md:justify-between'>
            <div className='flex-1 space-y-3'>
              <header className='flex items-center gap-3'>
                <span
                  className={`inline-flex items-center rounded-md px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${getBadgeStyles(doc.type)}`}
                >
                  {doc.type.replace(/_/g, ' ')}
                </span>

                <time
                  dateTime={doc.date_enacted}
                  className='flex items-center gap-1.5 text-xs font-medium text-zinc-400'
                >
                  <Calendar className='h-3.5 w-3.5' />
                  {doc.date_enacted}
                </time>
              </header>

              <h3 className='text-lg font-bold leading-snug text-zinc-900 transition-colors group-hover:text-blue-700'>
                {doc.title}
              </h3>

              {searchQuery && doc.author_ids.length > 0 && (
                <div className='text-xs text-zinc-500 mt-2'>
                  Authors:{' '}
                  {doc.author_ids
                    .map(id => {
                      const p = persons.find(person => person.id === id);
                      return p ? getPersonName(p) : '';
                    })
                    .filter(Boolean)
                    .join(', ')}
                </div>
              )}
            </div>

            <div className='flex shrink-0 items-center justify-between border-t border-zinc-100 pt-4 md:mt-0 md:flex-col md:items-end md:justify-start md:border-0 md:pt-0'>
              <span className='rounded bg-zinc-100 px-2.5 py-1 font-mono text-xs font-semibold text-zinc-600 border border-zinc-200'>
                {doc.number}
              </span>

              <span className='mt-2 hidden items-center text-sm font-medium text-blue-600 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100 md:inline-flex md:-translate-x-2'>
                View Details
                <ArrowRight className='ml-1 h-4 w-4' />
              </span>
            </div>
          </article>
        </Link>
      ))}

      {visibleCount < filteredDocs.length && (
        <div ref={observerTarget} className='flex justify-center py-8'>
          <Loader2 className='h-6 w-6 animate-spin text-blue-600' />
          <span className='sr-only'>Loading more documents...</span>
        </div>
      )}

      {visibleCount >= filteredDocs.length && filteredDocs.length > 10 && (
        <div className='py-8 text-center'>
          <span className='text-xs font-medium uppercase tracking-widest text-zinc-400'>
            End of Results
          </span>
        </div>
      )}
    </section>
  );
}
