import { useMemo, useState } from 'react';

import { Link, useOutletContext, useParams } from 'react-router-dom';

import type {
  DocumentItem,
  LegislationContext,
  Person,
  Session,
} from '@/types';
import {
  BookOpen,
  Calendar,
  ChevronDown,
  Crown,
  FileText,
  Gavel,
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

import { getPersonName } from '@/lib/legislation';

export default function TermDetail() {
  const { termId } = useParams<{ termId: string }>();
  const { persons, term, documents, sessions } =
    useOutletContext<LegislationContext>();
  const [visibleDocs, setVisibleDocs] = useState(10);

  // Sort members with Vice Mayor first
  const sortedMembers = useMemo(() => {
    if (!term || term.id !== termId) return [];

    return persons
      .filter((p: Person) => p.memberships.some(m => m.term_id === term.id))
      .sort((a, b) => {
        const memA = a.memberships.find(m => m.term_id === term.id)!;
        const memB = b.memberships.find(m => m.term_id === term.id)!;
        const isVMA = memA.role.includes('Vice Mayor');
        const isVMB = memB.role.includes('Vice Mayor');
        if (isVMA && !isVMB) return -1;
        if (!isVMA && isVMB) return 1;
        return (memA.rank || 99) - (memB.rank || 99);
      });
  }, [persons, term, termId]);

  // Filter term documents
  const termDocuments = useMemo(() => {
    if (!term || term.id !== termId) return [];
    return documents.filter((doc: DocumentItem) => {
      const session = sessions.find((s: Session) => s.id === doc.session_id);
      return session?.term_id === term.id || doc.session_id.startsWith(term.id);
    });
  }, [documents, sessions, term, termId]);

  if (!term || term.id !== termId) {
    return <div className='p-20 text-center'>Term data not found</div>;
  }

  const ordCount = termDocuments.filter(
    (d: DocumentItem) => d.type === 'ordinance'
  ).length;
  const resCount = termDocuments.filter(
    (d: DocumentItem) => d.type === 'resolution'
  ).length;

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-8 pb-20 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/legislation'>Legislation</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{term.ordinal} Term</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header className='relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12'>
        <div className='relative z-10 space-y-4'>
          <Badge variant='primary' dot>
            {term.year_range}
          </Badge>
          <h1 className='text-3xl font-extrabold tracking-tight md:text-5xl'>
            {term.name}
          </h1>
          <p className='flex items-center gap-2 text-xs font-bold tracking-widest text-slate-400 uppercase'>
            <Calendar className='h-4 w-4' /> {term.start_date} — {term.end_date}
          </p>
        </div>
        <Landmark className='absolute right-[-20px] bottom-[-20px] h-64 w-64 -rotate-12 text-white/5' />
      </header>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            <Crown className='text-secondary-500 h-3.5 w-3.5' /> Municipal Mayor
          </p>
          <p className='text-xl font-bold text-slate-900'>
            {term.executive.mayor}
          </p>
        </div>
        <div className='space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm'>
          <p className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            <Gavel className='text-primary-500 h-3.5 w-3.5' /> Vice Mayor /
            Presiding Officer
          </p>
          <p className='text-xl font-bold text-slate-900'>
            {term.executive.vice_mayor}
          </p>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <aside className='space-y-6'>
          <DetailSection title='Legislative Members' icon={Users}>
            <div className='space-y-3'>
              {sortedMembers.map((person: Person) => {
                const membership = person.memberships.find(
                  m => m.term_id === term.id
                );
                const isVM = membership?.role.includes('Vice Mayor');
                return (
                  <Link
                    key={person.id}
                    to={`/legislation/person/${person.id}`}
                    className='flex min-h-[44px] items-center gap-3 rounded-xl border border-transparent p-2 transition-all hover:border-slate-100 hover:bg-slate-50'
                  >
                    <div
                      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[10px] font-bold ${isVM ? 'bg-primary-600 text-white' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {person.first_name[0]}
                      {person.last_name[0]}
                    </div>
                    <div>
                      <p className='text-sm leading-none font-bold text-slate-700'>
                        {getPersonName(person)}
                      </p>
                      <p className='mt-1 text-[10px] font-medium text-slate-400'>
                        {membership?.role}
                      </p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </DetailSection>
        </aside>

        <div className='space-y-6 lg:col-span-2'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-primary-50 border-primary-100 flex items-center gap-4 rounded-2xl border p-4'>
              <FileText className='text-primary-600 h-6 w-6' />
              <div>
                <span className='text-primary-700 block text-2xl leading-none font-black'>
                  {ordCount}
                </span>
                <span className='text-primary-500 text-[10px] font-bold tracking-widest uppercase'>
                  Ordinances
                </span>
              </div>
            </div>
            <div className='bg-secondary-50 border-secondary-100 flex items-center gap-4 rounded-2xl border p-4'>
              <BookOpen className='text-secondary-600 h-6 w-6' />
              <div>
                <span className='text-secondary-700 block text-2xl leading-none font-black'>
                  {resCount}
                </span>
                <span className='text-secondary-500 text-[10px] font-bold tracking-widest uppercase'>
                  Resolutions
                </span>
              </div>
            </div>
          </div>

          <DetailSection title='Legislative Output' icon={ScrollText}>
            <div className='divide-y divide-slate-100'>
              {termDocuments.slice(0, visibleDocs).map((doc: DocumentItem) => (
                <Link
                  key={doc.id}
                  to={`/legislation/${doc.type}/${doc.id}`}
                  className='block min-h-[44px] py-4 transition-all hover:bg-slate-50'
                >
                  <div className='mb-1 flex items-center gap-3'>
                    <Badge
                      variant={
                        doc.type === 'ordinance' ? 'primary' : 'secondary'
                      }
                    >
                      {doc.type}
                    </Badge>
                    <span className='font-mono text-[10px] font-bold text-slate-400 uppercase'>
                      {doc.date_enacted}
                    </span>
                  </div>
                  <p className='line-clamp-2 text-sm leading-relaxed font-bold text-slate-800'>
                    {doc.title}
                  </p>
                </Link>
              ))}
              {visibleDocs < termDocuments.length && (
                <button
                  onClick={() => setVisibleDocs(prev => prev + 15)}
                  className='text-primary-600 hover:text-primary-700 flex min-h-[48px] w-full items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest uppercase'
                >
                  Load More <ChevronDown className='h-4 w-4' />
                </button>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
