import { useMemo, useState } from 'react';

import { Link, useOutletContext, useParams } from 'react-router-dom';

import {
  BookOpen,
  Calendar,
  ChevronDown,
  ChevronRight,
  Crown,
  FileText,
  ScrollText,
  Shield,
  User,
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
import { EmptyState, PageLoadingState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

import type { Committee, DocumentItem, Person, Session } from '@/lib/openlgu';
import { getPersonName } from '@/lib/openlgu';
import { isExecutiveRole, isLegislativeRole } from '@/lib/roleHelpers';
import { toTitleCase } from '@/lib/stringUtils';

interface LegislationContext {
  persons: Person[];
  term: {
    id: string;
    ordinal: string;
    name: string;
    year_range: string;
    start_date: string;
    end_date: string;
  } | null;
  terms: {
    id: string;
    ordinal: string;
    name: string;
    year_range: string;
    start_date: string;
    end_date: string;
  }[];
  documents: DocumentItem[];
  sessions: Session[];
  committees: Committee[];
  searchQuery: string;
  filterType: string;
  isLoading: boolean;
}

export default function TermDetail() {
  const { termId } = useParams<{ termId: string }>();
  const { persons, terms, documents, sessions, committees, isLoading } =
    useOutletContext<LegislationContext>();
  const [visibleDocs, setVisibleDocs] = useState(10);

  // Find the requested term from the terms array
  const term = useMemo(() => {
    return terms.find(t => t.id === termId) || null;
  }, [terms, termId]);

  // Filter members by role - executive vs legislative
  const executiveMembers = useMemo(() => {
    if (!term) return [];
    return persons.filter((p: Person) =>
      p.memberships.some(
        m => m.term_id === term.id && isExecutiveRole(m.chamber)
      )
    );
  }, [persons, term]);

  const legislativeMembers = useMemo(() => {
    if (!term) return [];
    return persons
      .filter((p: Person) =>
        p.memberships.some(
          m => m.term_id === term.id && isLegislativeRole(m.chamber)
        )
      )
      .sort((a, b) => {
        const memA = a.memberships.find(m => m.term_id === term.id)!;
        const memB = b.memberships.find(m => m.term_id === term.id)!;
        const isVMA = memA.role.includes('Vice Mayor');
        const isVMB = memB.role.includes('Vice Mayor');
        if (isVMA && !isVMB) return -1;
        if (!isVMA && isVMB) return 1;
        return (memA.rank || 99) - (memB.rank || 99);
      });
  }, [persons, term]);

  // Filter term documents
  const termDocuments = useMemo(() => {
    if (!term) return [];
    return documents.filter((doc: DocumentItem) => {
      // Handle null session_id
      if (!doc.session_id) return false;
      const session = sessions.find((s: Session) => s.id === doc.session_id);
      return session?.term_id === term.id || doc.session_id.startsWith(term.id);
    });
  }, [documents, sessions, term]);

  // Filter sessions for this term
  const termSessions = useMemo(() => {
    if (!term) return [];
    return sessions
      .filter((s: Session) => s.term_id === term.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, term]);

  if (isLoading) {
    return <PageLoadingState message='Loading term data...' />;
  }

  if (!term) {
    return (
      <div className='p-20 text-center font-bold text-slate-500 uppercase'>
        Term data not found
      </div>
    );
  }

  const ordCount = termDocuments.filter(
    (d: DocumentItem) => d.type === 'ordinance'
  ).length;
  const resCount = termDocuments.filter(
    (d: DocumentItem) => d.type === 'resolution'
  ).length;
  const eoCount = termDocuments.filter(
    (d: DocumentItem) => d.type === 'executive_order'
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
            <BreadcrumbLink href='/openlgu'>OpenLGU</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{term.ordinal} Term</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* New header pattern - light with left border accent */}
      <header className='border-l-primary-600 rounded-2xl border-l-8 border-slate-200 bg-white p-6 shadow-sm md:p-10'>
        <div className='flex flex-wrap items-center gap-3'>
          <Badge variant='primary' dot>
            {term.ordinal} Term
          </Badge>
          <Badge variant='slate'>{term.year_range}</Badge>
        </div>
        <h1 className='mt-3 text-2xl font-extrabold text-slate-900 md:text-3xl'>
          {term.name}
        </h1>
        <p className='mt-2 flex items-center gap-2 text-xs font-bold text-slate-500'>
          <Calendar className='h-4 w-4' /> {term.start_date} — {term.end_date}
        </p>
      </header>

      {/* Executive Officials Section - Data Driven */}
      {executiveMembers.length > 0 && (
        <DetailSection title='Executive Officials' icon={Crown}>
          <div className='space-y-3'>
            {executiveMembers.map(person => {
              const membership = person.memberships.find(
                m => m.term_id === term.id
              );
              return (
                <Link
                  key={person.id}
                  to={`/openlgu/person/${person.id}`}
                  className='group from-primary-50 border-primary-100 hover:border-primary-200 flex items-center gap-4 rounded-xl border bg-linear-to-r to-white p-4 transition-all hover:shadow-sm'
                >
                  <div className='from-primary-500 to-primary-600 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-lg font-bold text-white shadow-sm'>
                    {person.first_name[0]}
                    {person.last_name[0]}
                  </div>
                  <div className='flex-1'>
                    <p className='text-sm font-bold text-slate-800'>
                      {getPersonName(person)}
                    </p>
                    <p className='text-primary-600 text-xs font-medium tracking-wide uppercase'>
                      {membership?.role || 'Executive Official'}
                    </p>
                  </div>
                  <ChevronRight className='group-hover:text-primary-600 h-5 w-5 text-slate-300 transition-colors' />
                </Link>
              );
            })}
          </div>
        </DetailSection>
      )}

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Sidebar - Legislative Members */}
        {legislativeMembers.length > 0 && (
          <aside className='space-y-6'>
            <DetailSection title='Legislative Members' icon={Users}>
              <div className='space-y-3'>
                {legislativeMembers.map(person => {
                  const membership = person.memberships.find(
                    m => m.term_id === term.id
                  );
                  const isVM = membership?.role.includes('Vice Mayor');

                  // Group committees by role
                  const committeesByRole = {
                    chairperson: [] as Array<{
                      id: string;
                      role: string;
                      name: string;
                    }>,
                    viceChairperson: [] as Array<{
                      id: string;
                      role: string;
                      name: string;
                    }>,
                    member: [] as Array<{
                      id: string;
                      role: string;
                      name: string;
                    }>,
                  };
                  (membership?.committees || []).forEach(c => {
                    const globalComm = committees.find(gc => gc.id === c.id);
                    const displayName = globalComm
                      ? globalComm.name
                      : toTitleCase(c.id.replace(/-/g, ' '));
                    const normalizedRole = c.role
                      .toLowerCase()
                      .replace(/[^a-z]/g, '');
                    const roleKey = normalizedRole.includes('vicechair')
                      ? 'viceChairperson'
                      : normalizedRole.includes('chair')
                        ? 'chairperson'
                        : 'member';
                    committeesByRole[roleKey].push({
                      id: c.id,
                      role: c.role,
                      name: displayName,
                    });
                  });
                  // Sort committees within each group alphabetically
                  Object.values(committeesByRole).forEach(group =>
                    group.sort((a, b) => a.name.localeCompare(b.name))
                  );

                  const totalCommittees =
                    committeesByRole.chairperson.length +
                    committeesByRole.viceChairperson.length +
                    committeesByRole.member.length;

                  return (
                    <div
                      key={person.id}
                      className='group rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:border-slate-200 hover:bg-white'
                    >
                      <Link
                        to={`/openlgu/person/${person.id}`}
                        className='flex items-center gap-3'
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${isVM ? 'bg-primary-600 text-white' : 'bg-slate-200 text-slate-600'}`}
                        >
                          {person.first_name[0]}
                          {person.last_name[0]}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-sm font-bold text-slate-800'>
                            {getPersonName(person)}
                          </p>
                          <p className='text-xs font-medium text-slate-500'>
                            {membership?.role}
                          </p>
                        </div>
                      </Link>

                      {/* Committee cards - modern pattern */}
                      {totalCommittees > 0 && (
                        <div className='mt-3 space-y-2'>
                          <div className='flex items-center gap-2 border-t border-slate-100 pt-2'>
                            <Users className='h-3 w-3 text-slate-400' />
                            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                              {totalCommittees} committee
                              {totalCommittees > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {/* Chairpersons */}
                            {committeesByRole.chairperson.map(c => (
                              <div
                                key={`chair-${c.id}`}
                                className='flex items-center gap-1.5 rounded-md border border-amber-200/50 bg-linear-to-r from-amber-50 to-amber-50/50 px-2 py-1'
                              >
                                <Crown className='h-3 w-3 text-amber-600' />
                                <span className='max-w-[120px] truncate text-[10px] font-medium text-amber-700'>
                                  {c.name}
                                </span>
                              </div>
                            ))}
                            {/* Vice Chairpersons */}
                            {committeesByRole.viceChairperson.map(c => (
                              <div
                                key={`vice-${c.id}`}
                                className='flex items-center gap-1.5 rounded-md border border-blue-200/50 bg-linear-to-r from-blue-50 to-blue-50/50 px-2 py-1'
                              >
                                <Shield className='h-3 w-3 text-blue-600' />
                                <span className='max-w-[120px] truncate text-[10px] font-medium text-blue-700'>
                                  {c.name}
                                </span>
                              </div>
                            ))}
                            {/* Members - only show if no chair/vice roles */}
                            {committeesByRole.chairperson.length === 0 &&
                              committeesByRole.viceChairperson.length === 0 &&
                              committeesByRole.member.map(c => (
                                <div
                                  key={`member-${c.id}`}
                                  className='flex items-center gap-1.5 rounded-md border border-slate-200 bg-slate-100 px-2 py-1'
                                >
                                  <User className='h-3 w-3 text-slate-500' />
                                  <span className='max-w-[120px] truncate text-[10px] font-medium text-slate-600'>
                                    {c.name}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </DetailSection>
          </aside>
        )}

        {/* Main Content - Stats and Documents */}
        <div
          className={`space-y-6 ${legislativeMembers.length > 0 ? 'lg:col-span-2' : 'lg:col-span-3'}`}
        >
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
            {eoCount > 0 && (
              <div className='flex items-center gap-4 rounded-2xl border border-purple-100 bg-purple-50 p-4'>
                <ScrollText className='h-6 w-6 text-purple-600' />
                <div>
                  <span className='block text-2xl leading-none font-black text-purple-700'>
                    {eoCount}
                  </span>
                  <span className='text-[10px] font-bold tracking-widest text-purple-500 uppercase'>
                    Exec. Orders
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Sessions Section */}
          {termSessions.length > 0 && (
            <DetailSection title='Legislative Sessions' icon={Calendar}>
              <div className='space-y-3'>
                {termSessions.map(session => {
                  const sessionDocs = documents.filter(
                    (d: DocumentItem) => d.session_id === session.id
                  );
                  return (
                    <Link
                      key={session.id}
                      to={`/openlgu/session/${session.id}`}
                      className='group hover:border-primary-200 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition-all hover:bg-white hover:shadow-sm'
                    >
                      <div className='flex items-center gap-4'>
                        <Badge
                          variant={
                            session.type === 'Regular' ? 'primary' : 'secondary'
                          }
                        >
                          {session.type}
                        </Badge>
                        <div>
                          <p className='font-semibold text-slate-800'>
                            {session.ordinal_number} {session.type} Session
                          </p>
                          <p className='text-sm text-slate-500'>
                            {session.date}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <span className='text-slate-500'>
                          <span className='text-primary-600 font-semibold'>
                            {sessionDocs.length}
                          </span>{' '}
                          docs
                        </span>
                        <ChevronRight className='group-hover:text-primary-600 h-5 w-5 text-slate-300' />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </DetailSection>
          )}

          <DetailSection title='Legislative Output' icon={ScrollText}>
            {termDocuments.length === 0 ? (
              <EmptyState
                title='No Documents Found'
                message='No legislative documents were produced during this term.'
                icon={ScrollText}
              />
            ) : (
              <div className='divide-y divide-slate-100'>
                {termDocuments
                  .slice(0, visibleDocs)
                  .map((doc: DocumentItem) => (
                    <Link
                      key={doc.id}
                      to={`/openlgu/documents/${doc.id}`}
                      className='block min-h-[44px] py-4 transition-all hover:bg-slate-50'
                    >
                      <div className='mb-1 flex items-center gap-3'>
                        <Badge
                          variant={
                            doc.type === 'ordinance'
                              ? 'primary'
                              : doc.type === 'executive_order'
                                ? 'warning'
                                : 'secondary'
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
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
