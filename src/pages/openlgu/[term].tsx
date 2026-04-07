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

import { DetailSection, useBreadcrumbs } from '@/components/layout';
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
import { getDocTypeBadgeVariant, getPersonName } from '@/lib/openlgu';
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

  // Auto-generate breadcrumbs using the hook
  const breadcrumbs = useBreadcrumbs();

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
      <div className='text-kapwa-text-disabled p-20 text-center font-bold uppercase'>
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
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className='flex items-center gap-2'>
                {index === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbHome href={crumb.href} />
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{term.ordinal} Term</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* New header pattern - light with left border accent */}
      <header className='border-l-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface rounded-2xl border-l-8 p-6 shadow-sm md:p-10'>
        <div className='flex flex-wrap items-center gap-3'>
          <Badge variant='primary' dot>
            {term.ordinal} Term
          </Badge>
          <Badge variant='slate'>{term.year_range}</Badge>
        </div>
        <h1 className='text-kapwa-text-strong mt-3 kapwa-heading-xl font-extrabold'>
          {term.name}
        </h1>
        <p className='text-kapwa-text-disabled mt-2 flex items-center gap-2 text-xs font-bold'>
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
                  className='group from-kapwa-brand-50 border-kapwa-border-brand hover:border-kapwa-border-brand flex items-center gap-4 rounded-xl border bg-linear-to-r to-kapwa-bg-surface p-4 transition-all hover:shadow-sm'
                >
                  <div className='from-kapwa-brand-500 to-kapwa-brand-600 text-kapwa-text-inverse flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-linear-to-br text-lg font-bold shadow-sm'>
                    {person.first_name[0]}
                    {person.last_name[0]}
                  </div>
                  <div className='flex-1'>
                    <p className='text-kapwa-text-strong text-sm font-bold'>
                      {getPersonName(person)}
                    </p>
                    <p className='text-kapwa-text-brand text-xs font-medium tracking-wide uppercase'>
                      {membership?.role || 'Executive Official'}
                    </p>
                  </div>
                  <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-5 w-5 transition-colors' />
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
                      className='group border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface rounded-xl border p-4 transition-all'
                    >
                      <Link
                        to={`/openlgu/person/${person.id}`}
                        className='flex items-center gap-3'
                      >
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${isVM ? 'bg-kapwa-bg-brand-default text-white' : 'bg-kapwa-bg-surface text-kapwa-text-support'}`}
                        >
                          {person.first_name[0]}
                          {person.last_name[0]}
                        </div>
                        <div className='min-w-0 flex-1'>
                          <p className='text-kapwa-text-strong text-sm font-bold'>
                            {getPersonName(person)}
                          </p>
                          <p className='text-kapwa-text-disabled text-xs font-medium'>
                            {membership?.role}
                          </p>
                        </div>
                      </Link>

                      {/* Committee cards - modern pattern */}
                      {totalCommittees > 0 && (
                        <div className='mt-3 space-y-2'>
                          <div className='border-kapwa-border-weak flex items-center gap-2 border-t pt-2'>
                            <Users className='text-kapwa-text-disabled h-3 w-3' />
                            <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                              {totalCommittees} committee
                              {totalCommittees > 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className='flex flex-wrap gap-2'>
                            {/* Chairpersons */}
                            {committeesByRole.chairperson.map(c => (
                              <div
                                key={`chair-${c.id}`}
                                className='flex items-center gap-1.5 rounded-md border border-kapwa-border-warning/50 bg-linear-to-r from-kapwa-warning-weak to-kapwa-warning-weak/50 px-2 py-1'
                              >
                                <Crown className='h-3 w-3 text-kapwa-text-warning' />
                                <span className='max-w-[120px] truncate text-[10px] font-medium text-kapwa-text-warning'>
                                  {c.name}
                                </span>
                              </div>
                            ))}
                            {/* Vice Chairpersons */}
                            {committeesByRole.viceChairperson.map(c => (
                              <div
                                key={`vice-${c.id}`}
                                className='flex items-center gap-1.5 rounded-md border border-kapwa-border-info/50 bg-linear-to-r from-kapwa-info-weak to-kapwa-info-weak/50 px-2 py-1'
                              >
                                <Shield className='text-kapwa-text-info h-3 w-3' />
                                <span className='text-kapwa-text-info max-w-[120px] truncate text-[10px] font-medium'>
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
                                  className='border-kapwa-border-weak bg-kapwa-bg-hover flex items-center gap-1.5 rounded-md border px-2 py-1'
                                >
                                  <User className='text-kapwa-text-disabled h-3 w-3' />
                                  <span className='text-kapwa-text-support max-w-[120px] truncate text-[10px] font-medium'>
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
            <div className='bg-kapwa-bg-surface border-kapwa-border-brand flex items-center gap-4 rounded-2xl border p-4'>
              <FileText className='text-kapwa-text-brand h-6 w-6' />
              <div>
                <span className='text-kapwa-text-brand-bold block text-2xl leading-none font-black'>
                  {ordCount}
                </span>
                <span className='text-kapwa-text-brand text-[10px] font-bold tracking-widest uppercase'>
                  Ordinances
                </span>
              </div>
            </div>
            <div className='bg-kapwa-bg-accent-orange-weak border-kapwa-border-weak flex items-center gap-4 rounded-2xl border p-4'>
              <BookOpen className='text-kapwa-text-accent-orange h-6 w-6' />
              <div>
                <span className='text-kapwa-text-accent-orange block text-2xl leading-none font-black'>
                  {resCount}
                </span>
                <span className='text-kapwa-text-accent-orange text-[10px] font-bold tracking-widest uppercase'>
                  Resolutions
                </span>
              </div>
            </div>
            {eoCount > 0 && (
              <div className='border-kapwa-border-warning bg-kapwa-bg-warning-weak flex items-center gap-4 rounded-2xl border p-4'>
                <ScrollText className='text-kapwa-text-warning h-6 w-6' />
                <div>
                  <span className='text-kapwa-text-warning block text-2xl leading-none font-black'>
                    {eoCount}
                  </span>
                  <span className='text-[10px] font-bold tracking-widest text-kapwa-text-warning uppercase'>
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
                      className='group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 hover:bg-kapwa-bg-surface flex items-center justify-between rounded-xl border p-4 transition-all hover:shadow-sm'
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
                          <p className='text-kapwa-text-strong font-semibold'>
                            {session.ordinal_number} {session.type} Session
                          </p>
                          <p className='text-kapwa-text-disabled text-sm'>
                            {session.date}
                          </p>
                        </div>
                      </div>
                      <div className='flex items-center gap-4 text-sm'>
                        <span className='text-kapwa-text-strong0'>
                          <span className='text-kapwa-text-brand font-semibold'>
                            {sessionDocs.length}
                          </span>{' '}
                          docs
                        </span>
                        <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-5 w-5' />
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
                      className='hover:bg-kapwa-bg-surface-raised block min-h-[44px] py-4 transition-all'
                    >
                      <div className='mb-1 flex items-center gap-3'>
                        <Badge variant={getDocTypeBadgeVariant(doc.type)}>
                          {doc.type}
                        </Badge>
                        <span className='text-kapwa-text-disabled font-mono text-[10px] font-bold uppercase'>
                          {doc.date_enacted}
                        </span>
                      </div>
                      <p className='text-kapwa-text-strong line-clamp-2 text-sm leading-relaxed font-bold'>
                        {doc.title}
                      </p>
                    </Link>
                  ))}
                {visibleDocs < termDocuments.length && (
                  <button
                    onClick={() => setVisibleDocs(prev => prev + 15)}
                    className='text-kapwa-text-brand hover:text-kapwa-text-brand flex min-h-[48px] w-full items-center justify-center gap-2 py-4 text-xs font-bold tracking-widest uppercase'
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
