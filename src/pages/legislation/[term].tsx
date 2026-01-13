import { useState, useMemo } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  Calendar,
  Users,
  Landmark,
  Gavel,
  Crown,
  FileText,
  BookOpen,
  ScrollText,
  ChevronDown,
} from 'lucide-react';
import { getPersonName } from '@/lib/legislation';
import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import type {
  LegislationContext,
  Person,
  DocumentItem,
  Session,
} from '@/types';

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
    <div className='pb-20 mx-auto space-y-8 max-w-5xl duration-500 animate-in fade-in'>
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

      <header className='overflow-hidden relative p-8 text-white rounded-3xl shadow-xl md:p-12 bg-slate-900'>
        <div className='relative z-10 space-y-4'>
          <Badge variant='primary' dot>
            {term.year_range}
          </Badge>
          <h1 className='text-3xl font-extrabold tracking-tight md:text-5xl'>
            {term.name}
          </h1>
          <p className='flex gap-2 items-center text-xs font-bold tracking-widest uppercase text-slate-400'>
            <Calendar className='w-4 h-4' /> {term.start_date} — {term.end_date}
          </p>
        </div>
        <Landmark className='absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12' />
      </header>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
        <div className='p-6 space-y-4 bg-white rounded-2xl border shadow-sm border-slate-200'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2'>
            <Crown className='w-3.5 h-3.5 text-secondary-500' /> Municipal Mayor
          </p>
          <p className='text-xl font-bold text-slate-900'>
            {term.executive.mayor}
          </p>
        </div>
        <div className='p-6 space-y-4 bg-white rounded-2xl border shadow-sm border-slate-200'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2'>
            <Gavel className='w-3.5 h-3.5 text-primary-500' /> Vice Mayor /
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
                    className='flex items-center gap-3 p-2 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 min-h-[44px]'
                  >
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold ${isVM ? 'text-white bg-primary-600' : 'bg-slate-100 text-slate-500'}`}
                    >
                      {person.first_name[0]}
                      {person.last_name[0]}
                    </div>
                    <div>
                      <p className='text-sm font-bold leading-none text-slate-700'>
                        {getPersonName(person)}
                      </p>
                      <p className='text-[10px] text-slate-400 font-medium mt-1'>
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
            <div className='flex gap-4 items-center p-4 rounded-2xl border bg-primary-50 border-primary-100'>
              <FileText className='w-6 h-6 text-primary-600' />
              <div>
                <span className='block text-2xl font-black leading-none text-primary-700'>
                  {ordCount}
                </span>
                <span className='text-[10px] font-bold text-primary-500 uppercase tracking-widest'>
                  Ordinances
                </span>
              </div>
            </div>
            <div className='flex gap-4 items-center p-4 rounded-2xl border bg-secondary-50 border-secondary-100'>
              <BookOpen className='w-6 h-6 text-secondary-600' />
              <div>
                <span className='block text-2xl font-black leading-none text-secondary-700'>
                  {resCount}
                </span>
                <span className='text-[10px] font-bold text-secondary-500 uppercase tracking-widest'>
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
                  className='block py-4 hover:bg-slate-50 transition-all min-h-[44px]'
                >
                  <div className='flex gap-3 items-center mb-1'>
                    <Badge
                      variant={
                        doc.type === 'ordinance' ? 'primary' : 'secondary'
                      }
                    >
                      {doc.type}
                    </Badge>
                    <span className='text-[10px] font-mono font-bold text-slate-400 uppercase'>
                      {doc.date_enacted}
                    </span>
                  </div>
                  <p className='text-sm font-bold leading-relaxed text-slate-800 line-clamp-2'>
                    {doc.title}
                  </p>
                </Link>
              ))}
              {visibleDocs < termDocuments.length && (
                <button
                  onClick={() => setVisibleDocs(prev => prev + 15)}
                  className='w-full py-4 text-xs font-bold text-primary-600 hover:text-primary-700 uppercase tracking-widest flex items-center justify-center gap-2 min-h-[48px]'
                >
                  Load More <ChevronDown className='w-4 h-4' />
                </button>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
