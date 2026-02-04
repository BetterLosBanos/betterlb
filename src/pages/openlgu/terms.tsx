import { useMemo } from 'react';

import { Link, useOutletContext } from 'react-router-dom';

import {
  Calendar,
  ChevronRight,
  Crown,
  FileText,
  Landmark,
  ScrollText,
  Users,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

import type { DocumentItem, Person, Session, Term } from '@/lib/openlgu';

interface LegislationContext {
  terms: Term[];
  persons: Person[];
  sessions: Session[];
  documents: DocumentItem[];
}

export default function TermsIndex() {
  const { terms, persons, sessions, documents } =
    useOutletContext<LegislationContext>();

  const termsWithStats = useMemo(() => {
    return terms
      .map(term => {
        const termSessions = sessions.filter(s => s.term_id === term.id);
        const termDocuments = documents.filter(d => {
          if (!d.session_id) return false;
          const session = sessions.find(s => s.id === d.session_id);
          return session?.term_id === term.id;
        });

        const executiveMembers = persons.filter(p =>
          p.memberships.some(
            m => m.term_id === term.id && m.chamber === 'executive'
          )
        );

        const legislativeMembers = persons.filter(p =>
          p.memberships.some(
            m => m.term_id === term.id && m.chamber === 'sangguniang-bayan'
          )
        );

        const ordCount = termDocuments.filter(
          d => d.type === 'ordinance'
        ).length;
        const resCount = termDocuments.filter(
          d => d.type === 'resolution'
        ).length;
        const eoCount = termDocuments.filter(
          d => d.type === 'executive_order'
        ).length;

        return {
          ...term,
          sessionCount: termSessions.length,
          documentCount: termDocuments.length,
          executiveCount: executiveMembers.length,
          legislativeCount: legislativeMembers.length,
          ordCount,
          resCount,
          eoCount,
        };
      })
      .sort((a, b) => b.term_number - a.term_number);
  }, [terms, persons, sessions, documents]);

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-8 pb-20 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/openlgu'>OpenLGU</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Terms</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='border-primary-600 rounded-2xl border-l-8 bg-white p-6 shadow-sm md:p-10'>
        <h1 className='text-2xl font-extrabold text-slate-900 md:text-3xl'>
          Legislative Terms
        </h1>
        <p className='mt-2 text-slate-600'>
          Browse historical records of the Sangguniang Bayan sessions.
        </p>
      </header>

      {termsWithStats.length === 0 ? (
        <EmptyState
          title='No terms found'
          message='No legislative terms are available at this time.'
          icon={Landmark}
        />
      ) : (
        <div className='grid gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {termsWithStats.map(term => (
            <Link
              key={term.id}
              to={`/openlgu/term/${term.id}`}
              className='group block'
            >
              <article className='hover:border-primary-300 h-full rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:shadow-md'>
                <header className='mb-4 flex items-start justify-between'>
                  <div>
                    <Badge variant='primary' dot className='mb-2'>
                      {term.ordinal} Term
                    </Badge>
                    <h3 className='group-hover:text-primary-600 text-xl font-bold text-slate-900 transition-colors'>
                      {term.name}
                    </h3>
                    <p className='mt-1 text-sm text-slate-500'>
                      {term.year_range}
                    </p>
                  </div>
                  <ChevronRight className='group-hover:text-primary-600 h-5 w-5 text-slate-300 transition-colors' />
                </header>

                <div className='mb-4 flex items-center gap-2 text-xs text-slate-500'>
                  <Calendar className='h-3.5 w-3.5' />
                  <span>
                    {term.start_date} — {term.end_date}
                  </span>
                </div>

                <div className='grid grid-cols-2 gap-3 border-t border-slate-100 pt-4'>
                  <div className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <Users className='text-primary-600 h-4 w-4' />
                      <span className='text-lg font-bold text-slate-900'>
                        {term.legislativeCount}
                      </span>
                    </div>
                    <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                      Councilors
                    </p>
                  </div>
                  <div className='text-center'>
                    <div className='flex items-center justify-center gap-1'>
                      <FileText className='text-secondary-600 h-4 w-4' />
                      <span className='text-lg font-bold text-slate-900'>
                        {term.documentCount}
                      </span>
                    </div>
                    <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                      Documents
                    </p>
                  </div>
                </div>

                {(term.ordCount > 0 ||
                  term.resCount > 0 ||
                  term.eoCount > 0) && (
                  <div className='mt-3 flex flex-wrap gap-2'>
                    {term.ordCount > 0 && (
                      <span className='bg-primary-50 text-primary-600 rounded-full px-2 py-1 text-[10px] font-bold'>
                        {term.ordCount} Ord
                      </span>
                    )}
                    {term.resCount > 0 && (
                      <span className='bg-secondary-50 text-secondary-600 rounded-full px-2 py-1 text-[10px] font-bold'>
                        {term.resCount} Res
                      </span>
                    )}
                    {term.eoCount > 0 && (
                      <span className='rounded-full bg-purple-50 px-2 py-1 text-[10px] font-bold text-purple-600'>
                        {term.eoCount} EO
                      </span>
                    )}
                  </div>
                )}
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
