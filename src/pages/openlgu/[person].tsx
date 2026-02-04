import { Link, useOutletContext, useParams } from 'react-router-dom';

import {
  BookOpen,
  Calendar,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  Crown,
  FileText,
  ScrollText,
  Shield,
  User,
  Users,
  XCircle,
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
import { PageLoadingState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

// Use the library types as the source of truth to ensure compatibility with helpers
import type {
  Committee,
  DocumentItem,
  Person,
  Session,
  Term,
} from '@/lib/openlgu';
import { getPersonName } from '@/lib/openlgu';
import { toTitleCase } from '@/lib/stringUtils';

// Helper functions to identify role types
function isExecutiveRole(chamber?: string): boolean {
  return chamber === 'executive';
}

function isLegislativeRole(chamber?: string): boolean {
  return chamber === 'sangguniang-bayan';
}

// Define the exact shape of the context provided by the Legislation Layout
interface LegislationContext {
  documents: DocumentItem[];
  persons: Person[];
  sessions: Session[];
  committees: Committee[];
  terms: Term[];
  isLoading: boolean;
}

interface MembershipWithDetails {
  term_id: string;
  chamber?: string;
  role: string;
  rank?: number;
  committees: Array<{ id: string; role: string }>;
  term?: Term;
  sessions: Session[];
  authoredDocs: DocumentItem[];
  attendanceRate: number;
  presentCount: number;
  totalCount: number;
  executiveOrdersSigned?: number;
  termStats?: {
    ordinances: number;
    resolutions: number;
    executiveOrders: number;
  };
}

export default function PersonDetail() {
  const { personId } = useParams<{ personId: string }>();

  // 1. Strictly typed destructuring from context
  const { persons, documents, committees, sessions, terms, isLoading } =
    useOutletContext<LegislationContext>();

  const person = persons.find((p: Person) => p.id === personId);

  if (isLoading) {
    return <PageLoadingState message='Loading official profile...' />;
  }

  if (!person) {
    return (
      <div
        className='p-12 text-center font-bold tracking-widest text-slate-500 uppercase'
        role='alert'
      >
        Official not found
      </div>
    );
  }

  const officialName = getPersonName(person);
  const memberships = person.memberships || [];

  // Calculate overall stats
  const authoredDocs = documents.filter((d: DocumentItem) =>
    d.author_ids.includes(person.id)
  );
  const ordCount = authoredDocs.filter(d => d.type === 'ordinance').length;
  const resCount = authoredDocs.filter(d => d.type === 'resolution').length;
  const eoCount = authoredDocs.filter(d => d.type === 'executive_order').length;

  const allAttendanceRecords = sessions.filter(
    (s: Session) =>
      s.present.includes(person.id) || s.absent.includes(person.id)
  );
  const totalPresent = allAttendanceRecords.filter(s =>
    s.present.includes(person.id)
  ).length;
  const overallAttendanceRate =
    allAttendanceRecords.length > 0
      ? Math.round((totalPresent / allAttendanceRecords.length) * 100)
      : 0;

  // Build membership details with term info
  const membershipsWithDetails: MembershipWithDetails[] = memberships
    .map(m => {
      const term = terms.find(t => t.id === m.term_id);
      const termSessions = sessions.filter(s => s.term_id === m.term_id);
      const presentInTerm = termSessions.filter(s =>
        s.present.includes(person.id)
      ).length;
      const termAttendanceRate =
        termSessions.length > 0
          ? Math.round((presentInTerm / termSessions.length) * 100)
          : 0;

      // Get documents authored during this term
      const termDocs = authoredDocs.filter(
        d => (d as any).term_id === m.term_id
      );
      const termOrdCount = termDocs.filter(d => d.type === 'ordinance').length;
      const termResCount = termDocs.filter(d => d.type === 'resolution').length;
      const termEoCount = termDocs.filter(
        d => d.type === 'executive_order'
      ).length;

      // For executive roles, count executive orders signed (where mayor_id matches)
      const executiveOrdersSigned = isExecutiveRole(m.chamber)
        ? documents.filter(
            d =>
              d.type === 'executive_order' &&
              (d as any).mayor_id === person.id &&
              (d as any).term_id === m.term_id
          ).length
        : undefined;

      return {
        ...m,
        term,
        sessions: termSessions,
        authoredDocs: termDocs,
        attendanceRate: termAttendanceRate,
        presentCount: presentInTerm,
        totalCount: termSessions.length,
        termStats: {
          ordinances: termOrdCount,
          resolutions: termResCount,
          executiveOrders: termEoCount,
        },
        executiveOrdersSigned,
      };
    })
    .sort((a, b) => {
      // Sort by term number descending (newest first)
      const termNumA = a.term?.term_number || 0;
      const termNumB = b.term?.term_number || 0;
      return termNumB - termNumA;
    });

  const latestMembership = membershipsWithDetails[0];
  const totalTermsServed = memberships.length;

  // Check if person has any executive roles
  const hasExecutiveRole = memberships.some(m => isExecutiveRole(m.chamber));
  const hasLegislativeRole = memberships.some(m =>
    isLegislativeRole(m.chamber)
  );

  // Calculate total executive orders signed across all terms
  const totalExecutiveOrdersSigned = documents.filter(
    d => d.type === 'executive_order' && (d as any).mayor_id === person.id
  ).length;

  // Get recent attendance for sidebar (last 10)
  const recentAttendance = allAttendanceRecords.slice(0, 10);
  // Filter recent legislation based on role type
  const recentLegislation = (
    hasExecutiveRole && !hasLegislativeRole
      ? authoredDocs.filter(d => d.type === 'executive_order')
      : authoredDocs
  ).slice(0, 6);

  return (
    <div className='animate-in fade-in mx-auto max-w-6xl space-y-8 px-4 pb-20 duration-500 md:px-0'>
      {/* Breadcrumbs */}
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
            <BreadcrumbPage>{officialName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Unified Profile Header with Stats */}
      <header className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
        {/* Main profile row */}
        <div className='flex flex-col items-center gap-6 md:flex-row md:items-start'>
          {/* Avatar */}
          <div
            className='from-primary-600 to-primary-700 flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br text-4xl font-black text-white shadow-lg'
            aria-hidden='true'
          >
            {person.first_name[0]}
            {person.last_name[0]}
          </div>

          {/* Name and role info */}
          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-3xl font-bold text-slate-900 md:text-4xl'>
              Hon. {officialName}
            </h1>
            <div className='mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex flex-wrap justify-center gap-2 md:justify-start'>
                {latestMembership?.role && (
                  <Badge variant='primary' className='px-3 py-1 text-sm'>
                    {latestMembership.role}
                  </Badge>
                )}
                {latestMembership?.term && (
                  <Badge variant='slate' className='px-3 py-1 text-sm'>
                    {latestMembership.term.name}
                  </Badge>
                )}
              </div>
              <p className='text-sm text-slate-500'>
                {totalTermsServed} term{totalTermsServed > 1 ? 's' : ''} served
                {latestMembership?.term && (
                  <> • {latestMembership.term.year_range}</>
                )}
              </p>
            </div>
          </div>

          {/* Attendance indicator - simplified */}
          <div className='flex shrink-0 flex-col items-center gap-1 rounded-xl bg-slate-50 px-6 py-3 md:items-end'>
            <div className='flex items-center gap-2'>
              {overallAttendanceRate >= 90 ? (
                <CheckCircle2 className='h-5 w-5 text-emerald-600' />
              ) : overallAttendanceRate >= 75 ? (
                <CalendarCheck className='text-secondary-600 h-5 w-5' />
              ) : (
                <XCircle className='h-5 w-5 text-red-600' />
              )}
              <span
                className={`text-3xl leading-none font-black ${
                  overallAttendanceRate >= 90
                    ? 'text-emerald-600'
                    : overallAttendanceRate >= 75
                      ? 'text-secondary-600'
                      : 'text-red-600'
                }`}
              >
                {overallAttendanceRate}%
              </span>
            </div>
            <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Attendance Rate
            </p>
          </div>
        </div>

        {/* Stats bar - horizontal below profile */}
        <div className='mt-8 grid grid-cols-4 gap-4 border-t border-slate-100 pt-6'>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <FileText className='text-primary-600 h-5 w-5' />
              <span className='text-2xl font-bold text-slate-900'>
                {ordCount}
              </span>
            </div>
            <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Ordinances
            </p>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <BookOpen className='text-secondary-600 h-5 w-5' />
              <span className='text-2xl font-bold text-slate-900'>
                {resCount}
              </span>
            </div>
            <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Resolutions
            </p>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <ScrollText className='h-5 w-5 text-purple-600' />
              <span className='text-2xl font-bold text-slate-900'>
                {eoCount}
              </span>
            </div>
            <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Exec. Orders
            </p>
          </div>
          {hasExecutiveRole && totalExecutiveOrdersSigned > 0 ? (
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2'>
                <ScrollText className='h-5 w-5 text-purple-600' />
                <span className='text-2xl font-bold text-slate-900'>
                  {totalExecutiveOrdersSigned}
                </span>
              </div>
              <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                EOs Signed
              </p>
            </div>
          ) : (
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2'>
                <Calendar className='h-5 w-5 text-slate-600' />
                <span className='text-2xl font-bold text-slate-900'>
                  {allAttendanceRecords.length}
                </span>
              </div>
              <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Sessions
              </p>
            </div>
          )}
        </div>
      </header>

      {/* Two-column layout for main content */}
      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main content column - spans 2 */}
        <div className='space-y-8 lg:col-span-2'>
          {/* Service History */}
          <DetailSection title='Service History' icon={Calendar}>
            <div className='space-y-3'>
              {membershipsWithDetails.map((membership, index) => {
                const isActive = index === 0;
                const isExecutive = isExecutiveRole(membership.chamber);
                // Group committees by role and sort within each group
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
                (membership.committees || []).forEach(c => {
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

                return (
                  <div
                    key={membership.term_id}
                    className={`group relative overflow-hidden rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                      isActive
                        ? 'border-primary-400 from-primary-50/50 bg-gradient-to-r to-white'
                        : 'border-slate-200'
                    }`}
                  >
                    {isActive && (
                      <div className='bg-primary-600 absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-[10px] font-bold text-white'>
                        CURRENT TERM
                      </div>
                    )}
                    <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                      <div className='flex-1 space-y-4'>
                        {/* Term header */}
                        <div className='flex flex-wrap items-center gap-2'>
                          <h3 className='text-xl font-bold text-slate-900'>
                            {isExecutive
                              ? membership.term?.year_range ||
                                membership.term_id
                              : membership.term?.name || membership.term_id}
                          </h3>
                          {!isExecutive && (
                            <Badge
                              variant={isActive ? 'primary' : 'slate'}
                              className='text-xs'
                            >
                              {membership.term?.year_range || ''}
                            </Badge>
                          )}
                          <Badge variant='secondary' className='text-xs'>
                            {membership.role}
                            {membership.rank !== undefined &&
                              ` • #${membership.rank}`}
                          </Badge>
                        </div>

                        {/* Committees row - only for legislative roles */}
                        {!isExecutive &&
                          (committeesByRole.chairperson.length > 0 ||
                            committeesByRole.viceChairperson.length > 0 ||
                            committeesByRole.member.length > 0) && (
                            <div className='space-y-3'>
                              {/* Section header */}
                              <div className='flex items-center gap-2 border-b border-slate-100 pb-2'>
                                <Users className='h-4 w-4 text-slate-400' />
                                <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                                  Committee Assignments
                                </span>
                                <span className='ml-auto text-xs text-slate-400'>
                                  {committeesByRole.chairperson.length +
                                    committeesByRole.viceChairperson.length +
                                    committeesByRole.member.length}{' '}
                                  total
                                </span>
                              </div>

                              {/* Committees grid */}
                              <div className='grid gap-2 sm:grid-cols-2'>
                                {/* Chairpersons */}
                                {committeesByRole.chairperson.map(c => (
                                  <div
                                    key={`chair-${c.id}`}
                                    className='group flex items-center gap-3 rounded-lg border border-amber-200/50 bg-gradient-to-r from-amber-50 to-amber-50/50 px-3 py-2.5 transition-all hover:border-amber-300 hover:shadow-sm'
                                  >
                                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-600 shadow-sm'>
                                      <Crown className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='truncate text-sm font-semibold text-slate-800'>
                                        {c.name}
                                      </p>
                                      <p className='text-[10px] font-medium tracking-wide text-amber-600 uppercase'>
                                        Chairperson
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {/* Vice Chairpersons */}
                                {committeesByRole.viceChairperson.map(c => (
                                  <div
                                    key={`vice-${c.id}`}
                                    className='group flex items-center gap-3 rounded-lg border border-blue-200/50 bg-gradient-to-r from-blue-50 to-blue-50/50 px-3 py-2.5 transition-all hover:border-blue-300 hover:shadow-sm'
                                  >
                                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600 shadow-sm'>
                                      <Shield className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='truncate text-sm font-semibold text-slate-800'>
                                        {c.name}
                                      </p>
                                      <p className='text-[10px] font-medium tracking-wide text-blue-600 uppercase'>
                                        Vice Chairperson
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {/* Members */}
                                {committeesByRole.member.map(c => (
                                  <div
                                    key={`member-${c.id}`}
                                    className='group flex items-center gap-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2.5 transition-all hover:border-slate-300 hover:shadow-sm'
                                  >
                                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500'>
                                      <User className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='truncate text-sm font-medium text-slate-700'>
                                        {c.name}
                                      </p>
                                      <p className='text-[10px] font-medium tracking-wide text-slate-400 uppercase'>
                                        Member
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Term stats - inline */}
                        <div className='flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm'>
                          {!isExecutive ? (
                            <>
                              <div className='flex items-center gap-2'>
                                <CalendarCheck
                                  className={`h-4 w-4 ${membership.attendanceRate >= 90 ? 'text-emerald-500' : 'text-slate-400'}`}
                                />
                                <span
                                  className={
                                    membership.attendanceRate >= 90
                                      ? 'font-semibold text-emerald-600'
                                      : 'text-slate-600'
                                  }
                                >
                                  {membership.attendanceRate}% attendance
                                  <span className='font-normal text-slate-400'>
                                    {' '}
                                    ({membership.presentCount}/
                                    {membership.totalCount})
                                  </span>
                                </span>
                              </div>
                              <span className='text-slate-300'>•</span>
                              <span className='text-slate-600'>
                                <span className='text-primary-600 font-semibold'>
                                  {membership.termStats?.ordinances || 0}
                                </span>{' '}
                                ord,
                                <span className='text-secondary-600 font-semibold'>
                                  {' '}
                                  {membership.termStats?.resolutions || 0}
                                </span>{' '}
                                res
                                {membership.termStats?.executiveOrders ? (
                                  <span>
                                    ,{' '}
                                    <span className='font-semibold text-purple-600'>
                                      {membership.termStats.executiveOrders}
                                    </span>{' '}
                                    EO
                                  </span>
                                ) : (
                                  ''
                                )}
                              </span>
                            </>
                          ) : (
                            <span className='text-slate-600'>
                              <span className='font-semibold text-purple-600'>
                                {membership.executiveOrdersSigned || 0}
                              </span>{' '}
                              Executive Orders signed
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Link to term */}
                      {membership.term && (
                        <Link
                          to={`/openlgu/term/${membership.term.id}`}
                          className='group-hover:text-primary-600 shrink-0 text-slate-300 transition-colors'
                          aria-label={`View details for ${membership.term.name}`}
                        >
                          <ChevronRight className='h-6 w-6' />
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </DetailSection>

          {/* Recent Legislation */}
          <DetailSection
            title={
              <div className='flex items-center justify-between gap-4'>
                <span>
                  {hasExecutiveRole && !hasLegislativeRole
                    ? 'Recent Executive Orders'
                    : 'Recent Legislation'}
                </span>
                {authoredDocs.length > 6 && (
                  <Link
                    to={`/openlgu?search=${encodeURIComponent(officialName)}`}
                    className='text-primary-600 hover:text-primary-700 shrink-0 text-sm font-medium'
                  >
                    View all {authoredDocs.length} →
                  </Link>
                )}
              </div>
            }
            icon={ScrollText}
          >
            <div className='divide-y divide-slate-100'>
              {recentLegislation.length > 0 ? (
                recentLegislation.map(doc => {
                  const termBadge = (doc as any).term_id
                    ? terms.find(t => t.id === (doc as any).term_id)
                    : null;

                  return (
                    <Link
                      key={doc.id}
                      to={`/openlgu/documents/${doc.id}`}
                      className='group -mx-5 block min-h-[44px] px-5 py-4 transition-colors hover:bg-slate-50'
                    >
                      <div className='flex items-start gap-3'>
                        <Badge
                          variant={
                            doc.type === 'ordinance'
                              ? 'primary'
                              : doc.type === 'executive_order'
                                ? 'warning'
                                : 'secondary'
                          }
                          className='mt-0.5 shrink-0 text-xs'
                        >
                          {doc.type === 'ordinance'
                            ? 'ORD'
                            : doc.type === 'executive_order'
                              ? 'EO'
                              : 'RES'}
                        </Badge>
                        <div className='min-w-0 flex-1'>
                          <div className='mb-1 flex items-center gap-2'>
                            <span className='font-mono text-[10px] font-bold text-slate-400 uppercase'>
                              {doc.number}
                            </span>
                            <span className='text-slate-300'>•</span>
                            <span className='font-mono text-[10px] font-bold text-slate-300'>
                              {doc.date_enacted}
                            </span>
                            {termBadge && (
                              <>
                                <span className='text-slate-300'>•</span>
                                <span className='text-[10px] font-medium text-slate-400'>
                                  {termBadge.ordinal}
                                </span>
                              </>
                            )}
                          </div>
                          <p className='group-hover:text-primary-600 line-clamp-2 text-sm leading-relaxed font-semibold text-slate-800 transition-colors'>
                            {doc.title}
                          </p>
                        </div>
                        <ChevronRight className='group-hover:text-primary-600 mt-0.5 h-5 w-5 shrink-0 text-slate-300 transition-colors' />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className='py-8 text-center text-sm text-slate-400 italic'>
                  No legislation authored yet.
                </p>
              )}
            </div>
          </DetailSection>
        </div>

        {/* Sidebar column */}
        <aside className='space-y-8'>
          {/* Attendance Log - only show for legislative roles */}
          {hasLegislativeRole ? (
            <DetailSection
              title={
                <div className='flex items-center justify-between gap-4'>
                  <span>Attendance Log</span>
                  <span className='shrink-0 text-xs font-medium text-slate-400'>
                    {allAttendanceRecords.length} sessions
                  </span>
                </div>
              }
              icon={CheckCircle2}
            >
              {recentAttendance.length > 0 ? (
                <div className='scrollbar-thin max-h-96 space-y-3 overflow-y-auto pr-2'>
                  {recentAttendance.map(s => {
                    const isPresent = s.present.includes(person.id);

                    return (
                      <Link
                        key={s.id}
                        to={`/openlgu/session/${s.id}`}
                        className='group hover:border-primary-200 flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs transition-all hover:bg-white hover:shadow-sm'
                      >
                        <div className='flex items-center gap-3'>
                          {isPresent ? (
                            <div className='rounded-full bg-emerald-100 p-1'>
                              <CheckCircle2
                                className='h-3.5 w-3.5 text-emerald-600'
                                aria-label='Present'
                              />
                            </div>
                          ) : (
                            <div className='bg-secondary-100 rounded-full p-1'>
                              <XCircle
                                className='text-secondary-600 h-3.5 w-3.5'
                                aria-label='Absent'
                              />
                            </div>
                          )}
                          <div>
                            <p className='font-semibold text-slate-700'>
                              {s.date}
                            </p>
                            <p className='text-[10px] text-slate-400'>
                              {s.ordinal_number}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className='group-hover:text-primary-600 h-4 w-4 text-slate-300 transition-colors' />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className='py-4 text-center text-sm text-slate-400 italic'>
                  No attendance records found.
                </p>
              )}
            </DetailSection>
          ) : (
            hasExecutiveRole && (
              <DetailSection
                title={
                  <div className='flex items-center justify-between gap-4'>
                    <span>Executive Orders Summary</span>
                    <span className='shrink-0 text-xs font-medium text-slate-400'>
                      {totalExecutiveOrdersSigned} total
                    </span>
                  </div>
                }
                icon={ScrollText}
              >
                <div className='space-y-3'>
                  <p className='text-sm text-slate-600'>
                    As {latestMembership?.role || 'Executive'}, this official
                    has signed {totalExecutiveOrdersSigned} executive order
                    {totalExecutiveOrdersSigned !== 1 ? 's' : ''} across their
                    term{totalTermsServed > 1 ? 's' : ''}.
                  </p>
                  {totalExecutiveOrdersSigned > 0 && (
                    <Link
                      to={`/openlgu?search=${encodeURIComponent(officialName)}&type=executive_order`}
                      className='text-primary-600 hover:text-primary-700 inline-flex items-center gap-2 text-sm font-medium'
                    >
                      View all executive orders →
                    </Link>
                  )}
                </div>
              </DetailSection>
            )
          )}

          {/* Quick summary card */}
          <div className='rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6'>
            <h3 className='mb-4 text-sm font-bold tracking-widest text-slate-400 uppercase'>
              Career Summary
            </h3>
            <dl className='space-y-3'>
              <div className='flex items-center justify-between'>
                <dt className='text-sm text-slate-600'>Total Terms</dt>
                <dd className='text-lg font-bold text-slate-900'>
                  {totalTermsServed}
                </dd>
              </div>
              {hasLegislativeRole && (
                <div className='flex items-center justify-between'>
                  <dt className='text-sm text-slate-600'>Overall Attendance</dt>
                  <dd
                    className={`text-lg font-bold ${
                      overallAttendanceRate >= 90
                        ? 'text-emerald-600'
                        : overallAttendanceRate >= 75
                          ? 'text-secondary-600'
                          : 'text-red-600'
                    }`}
                  >
                    {overallAttendanceRate}%
                  </dd>
                </div>
              )}
              {hasExecutiveRole && totalExecutiveOrdersSigned > 0 && (
                <div className='flex items-center justify-between'>
                  <dt className='text-sm text-slate-600'>
                    Executive Orders Signed
                  </dt>
                  <dd className='text-lg font-bold text-purple-600'>
                    {totalExecutiveOrdersSigned}
                  </dd>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <dt className='text-sm text-slate-600'>Total Documents</dt>
                <dd className='text-lg font-bold text-slate-900'>
                  {authoredDocs.length}
                </dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
