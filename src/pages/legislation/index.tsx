import { useState, useEffect, useRef } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { FileText } from 'lucide-react';
import type { DocumentItem, Person } from '../../lib/legislation';
import type { FilterType } from './layout';
import { getPersonName } from '../../lib/legislation';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

interface LegislationContext {
  searchQuery: string;
  filterType: FilterType;
  documents: DocumentItem[];
  persons: Person[];
}

export default function LegislationIndex() {
  const { searchQuery, filterType, documents, persons } =
    useOutletContext<LegislationContext>();
  const [visibleCount, setVisibleCount] = useState(10);
  const observerTarget = useRef<HTMLDivElement>(null);

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
    return matchesSearch && matchesType;
  });

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

  if (filteredDocs.length === 0) {
    return (
      <EmptyState
        title='No documents found'
        message={`We couldn't find matches for "${searchQuery}"`}
        icon={FileText}
      />
    );
  }

  return (
    <section className='space-y-4 duration-500 animate-in fade-in'>
      <div className='flex justify-start'>
        <Badge variant='slate' className='bg-slate-50 border-slate-200'>
          {filteredDocs.length} Results
        </Badge>
      </div>
      {filteredDocs.slice(0, visibleCount).map(doc => {
        const authors = doc.author_ids
          .map(id => persons.find(p => p.id === id))
          .filter((p): p is Person => Boolean(p));

        return (
          <Link
            key={doc.id}
            to={`${doc.type}/${doc.id}`}
            className='block group'
            aria-label={`${doc.type} ${doc.number}: ${doc.title}`}
          >
            <article className='relative flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:border-primary-300 hover:shadow-md md:flex-row md:items-start md:justify-between min-h-[100px]'>
              <div className='flex-1 space-y-2'>
                <header className='flex gap-3 items-center'>
                  <Badge
                    variant={doc.type === 'ordinance' ? 'primary' : 'warning'}
                  >
                    {doc.type}
                  </Badge>
                  <span
                    className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'
                    aria-label={`Enacted on ${doc.date_enacted}`}
                  >
                    {doc.date_enacted}
                  </span>
                </header>
                <h3 className='text-base font-bold leading-snug transition-colors text-slate-900 group-hover:text-primary-600 line-clamp-2'>
                  {doc.title}
                </h3>
                <div className='flex items-center gap-2 text-[11px] text-slate-500 font-medium'>
                  <span className='px-1.5 py-0.5 bg-slate-100 rounded text-slate-600 font-mono font-bold'>
                    {doc.number}
                  </span>
                  <span className='text-slate-300'>|</span>
                  <span className='truncate'>
                    Sponsors: {authors.map(a => getPersonName(a)).join(', ')}
                  </span>
                </div>
              </div>
            </article>
          </Link>
        );
      })}
      <div ref={observerTarget} className='h-10' />
    </section>
  );
}
