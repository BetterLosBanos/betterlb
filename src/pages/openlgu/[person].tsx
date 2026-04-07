import { Link, useOutletContext, useParams } from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Type assertions for extended person properties

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
import { getDocTypeBadgeVariant, getPersonName } from '@/lib/openlgu';
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

  // Auto-generate breadcrumbs using the hook
  const breadcrumbs = useBreadcrumbs();

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
        className='text-kapwa-text-disabled p-12 text-center font-bold tracking-widest uppercase'
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
                        <BreadcrumbPage>{officialName}</BreadcrumbPage>
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

      {/* Unified Profile Header with Stats */}
      <header className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-2xl border p-6 shadow-sm md:p-8'>
        {/* Main profile row */}
        <div className='flex flex-col items-center gap-6 md:flex-row md:items-start'>
          {/* Avatar */}
          <div
            className='flex h-28 w-28 shrink-0 items-center justify-center rounded-2xl from-kapwa-brand-600 to-kapwa-brand-700 text-kapwa-text-inverse bg-linear-to-br text-4xl font-black shadow-lg'
            aria-hidden='true'
          >
            {person.first_name[0]}
            {person.last_name[0]}
          </div>

          {/* Name and role info */}
          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-bold'>
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
              <p className='text-kapwa-text-disabled text-sm'>
                {totalTermsServed} term{totalTermsServed > 1 ? 's' : ''} served
                {latestMembership?.term && (
                  <> • {latestMembership.term.year_range}</>
                )}
              </p>
            </div>
          </div>

          {/* Attendance indicator - simplified */}
          <div className='bg-kapwa-bg-surface-raised flex shrink-0 flex-col items-center gap-1 rounded-xl px-6 py-3 md:items-end'>
            <div className='flex items-center gap-2'>
              {overallAttendanceRate >= 90 ? (
                <CheckCircle2 className='h-5 w-5 text-kapwa-text-success' />
              ) : overallAttendanceRate >= 75 ? (
                <CalendarCheck className='text-kapwa-text-accent-orange h-5 w-5' />
              ) : (
                <XCircle className='text-kapwa-text-danger h-5 w-5' />
              )}
              <span
                className={`text-3xl leading-none font-black ${
                  overallAttendanceRate >= 90
                    ? 'text-kapwa-text-success'
                    : overallAttendanceRate >= 75
                      ? 'text-kapwa-text-accent-orange'
                      : 'text-kapwa-text-danger'
                }`}
              >
                {overallAttendanceRate}%
              </span>
            </div>
            <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
              Attendance Rate
            </p>
          </div>
        </div>

        {/* Stats bar - horizontal below profile */}
        <div className='border-kapwa-border-weak mt-8 grid grid-cols-4 gap-4 border-t pt-6'>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <FileText className='text-kapwa-text-brand h-5 w-5' />
              <span className='text-kapwa-text-strong text-2xl font-bold'>
                {ordCount}
              </span>
            </div>
            <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
              Ordinances
            </p>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <BookOpen className='text-kapwa-text-accent-orange h-5 w-5' />
              <span className='text-kapwa-text-strong text-2xl font-bold'>
                {resCount}
              </span>
            </div>
            <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
              Resolutions
            </p>
          </div>
          <div className='text-center'>
            <div className='flex items-center justify-center gap-2'>
              <ScrollText className='text-kapwa-yellow-700 h-5 w-5' />
              <span className='text-kapwa-text-strong text-2xl font-bold'>
                {eoCount}
              </span>
            </div>
            <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
              Exec. Orders
            </p>
          </div>
          {hasExecutiveRole && totalExecutiveOrdersSigned > 0 ? (
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2'>
                <ScrollText className='text-kapwa-yellow-700 h-5 w-5' />
                <span className='text-kapwa-text-strong text-2xl font-bold'>
                  {totalExecutiveOrdersSigned}
                </span>
              </div>
              <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
                EOs Signed
              </p>
            </div>
          ) : (
            <div className='text-center'>
              <div className='flex items-center justify-center gap-2'>
                <Calendar className='text-kapwa-text-support h-5 w-5' />
                <span className='text-kapwa-text-strong text-2xl font-bold'>
                  {allAttendanceRecords.length}
                </span>
              </div>
              <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
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
                    className={`group bg-kapwa-bg-surface relative overflow-hidden rounded-xl border p-5 shadow-sm transition-all hover:shadow-md ${
                      isActive
                        ? 'border-kapwa-border-brand bg-linear-to-r from-kapwa-brand-weak/50 to-kapwa-bg-surface'
                        : 'border-kapwa-border-weak'
                    }`}
                  >
                    {isActive && (
                      <div className='bg-kapwa-bg-brand-default text-kapwa-text-inverse absolute top-0 right-0 rounded-bl-xl px-3 py-1 text-[10px] font-bold'>
                        CURRENT TERM
                      </div>
                    )}
                    <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                      <div className='flex-1 space-y-4'>
                        {/* Term header */}
                        <div className='flex flex-wrap items-center gap-2'>
                          <h3 className='text-kapwa-text-strong text-xl font-bold'>
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
                              <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-2'>
                                <Users className='text-kapwa-text-disabled h-4 w-4' />
                                <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                                  Committee Assignments
                                </span>
                                <span className='text-kapwa-text-disabled ml-auto text-xs'>
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
                                    className='group flex items-center gap-3 rounded-lg border border-kapwa-border-warning/50 bg-linear-to-r from-kapwa-warning-weak to-kapwa-warning-weak/50 px-3 py-2.5 transition-all hover:border-amber-300 hover:shadow-sm'
                                  >
                                    <div className='flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-kapwa-bg-warning-weak text-kapwa-text-warning shadow-sm'>
                                      <Crown className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='text-kapwa-text-strong truncate text-sm font-semibold'>
                                        {c.name}
                                      </p>
                                      <p className='text-[10px] font-medium tracking-wide text-kapwa-text-warning uppercase'>
                                        Chairperson
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {/* Vice Chairpersons */}
                                {committeesByRole.viceChairperson.map(c => (
                                  <div
                                    key={`vice-${c.id}`}
                                    className='group flex items-center gap-3 rounded-lg border border-kapwa-border-info/50 bg-linear-to-r from-kapwa-info-weak to-kapwa-info-weak/50 px-3 py-2.5 transition-all hover:border-blue-300 hover:shadow-sm'
                                  >
                                    <div className='bg-kapwa-bg-info-weak text-kapwa-text-info flex h-8 w-8 shrink-0 items-center justify-center rounded-lg shadow-sm'>
                                      <Shield className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='text-kapwa-text-strong truncate text-sm font-semibold'>
                                        {c.name}
                                      </p>
                                      <p className='text-kapwa-text-info text-[10px] font-medium tracking-wide uppercase'>
                                        Vice Chairperson
                                      </p>
                                    </div>
                                  </div>
                                ))}
                                {/* Members */}
                                {committeesByRole.member.map(c => (
                                  <div
                                    key={`member-${c.id}`}
                                    className='group border-kapwa-border-weak bg-kapwa-bg-surface-raised hover:border-kapwa-border-weak flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all hover:shadow-sm'
                                  >
                                    <div className='bg-kapwa-bg-hover text-kapwa-text-disabled flex h-8 w-8 shrink-0 items-center justify-center rounded-lg'>
                                      <User className='h-4 w-4' />
                                    </div>
                                    <div className='min-w-0 flex-1'>
                                      <p className='text-kapwa-text-support truncate text-sm font-medium'>
                                        {c.name}
                                      </p>
                                      <p className='text-kapwa-text-disabled text-[10px] font-medium tracking-wide uppercase'>
                                        Member
                                      </p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        {/* Term stats - inline */}
                        <div className='border-kapwa-border-weak flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-4 text-sm'>
                          {!isExecutive ? (
                            <>
                              <div className='flex items-center gap-2'>
                                <CalendarCheck
                                  className={`h-4 w-4 ${membership.attendanceRate >= 90 ? 'text-kapwa-text-success' : 'text-kapwa-text-disabled'}`}
                                />
                                <span
                                  className={
                                    membership.attendanceRate >= 90
                                      ? 'font-semibold text-kapwa-text-success'
                                      : 'text-kapwa-text-support'
                                  }
                                >
                                  {membership.attendanceRate}% attendance
                                  <span className='text-kapwa-text-disabled font-normal'>
                                    {' '}
                                    ({membership.presentCount}/
                                    {membership.totalCount})
                                  </span>
                                </span>
                              </div>
                              <span className='text-kapwa-text-support'>•</span>
                              <span className='text-kapwa-text-support'>
                                <span className='text-kapwa-text-brand font-semibold'>
                                  {membership.termStats?.ordinances || 0}
                                </span>{' '}
                                ord,
                                <span className='text-kapwa-text-accent-orange font-semibold'>
                                  {' '}
                                  {membership.termStats?.resolutions || 0}
                                </span>{' '}
                                res
                                {membership.termStats?.executiveOrders ? (
                                  <span>
                                    ,{' '}
                                    <span className='text-kapwa-yellow-700 font-semibold'>
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
                            <span className='text-kapwa-text-support'>
                              <span className='text-kapwa-yellow-700 font-semibold'>
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
                          className='group-hover:text-kapwa-text-brand text-kapwa-text-support shrink-0 transition-colors'
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
                    className='text-kapwa-text-brand hover:text-kapwa-text-brand shrink-0 text-sm font-medium'
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
                      className='group hover:bg-kapwa-bg-surface-raised -mx-5 block min-h-[44px] px-5 py-4 transition-colors'
                    >
                      <div className='flex items-start gap-3'>
                        <Badge
                          variant={getDocTypeBadgeVariant(doc.type)}
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
                            <span className='text-kapwa-text-disabled font-mono text-[10px] font-bold uppercase'>
                              {doc.number}
                            </span>
                            <span className='text-kapwa-text-support'>•</span>
                            <span className='text-kapwa-text-support font-mono text-[10px] font-bold'>
                              {doc.date_enacted}
                            </span>
                            {termBadge && (
                              <>
                                <span className='text-kapwa-text-support'>
                                  •
                                </span>
                                <span className='text-kapwa-text-disabled text-[10px] font-medium'>
                                  {termBadge.ordinal}
                                </span>
                              </>
                            )}
                          </div>
                          <p className='group-hover:text-kapwa-text-brand text-kapwa-text-strong line-clamp-2 text-sm leading-relaxed font-semibold transition-colors'>
                            {doc.title}
                          </p>
                        </div>
                        <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support mt-0.5 h-5 w-5 shrink-0 transition-colors' />
                      </div>
                    </Link>
                  );
                })
              ) : (
                <p className='text-kapwa-text-disabled py-8 text-center text-sm italic'>
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
                  <span className='text-kapwa-text-disabled shrink-0 text-xs font-medium'>
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
                        className='group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised hover:bg-kapwa-bg-surface flex items-center justify-between rounded-lg border p-3 text-xs transition-all hover:shadow-sm'
                      >
                        <div className='flex items-center gap-3'>
                          {isPresent ? (
                            <div className='rounded-full bg-kapwa-bg-success-weak p-1'>
                              <CheckCircle2
                                className='h-3.5 w-3.5 text-kapwa-text-success'
                                aria-label='Present'
                              />
                            </div>
                          ) : (
                            <div className='bg-kapwa-bg-accent-orange-weak rounded-full p-1'>
                              <XCircle
                                className='text-kapwa-text-accent-orange h-3.5 w-3.5'
                                aria-label='Absent'
                              />
                            </div>
                          )}
                          <div>
                            <p className='text-kapwa-text-support font-semibold'>
                              {s.date}
                            </p>
                            <p className='text-kapwa-text-disabled text-[10px]'>
                              {s.ordinal_number}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-4 w-4 transition-colors' />
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className='text-kapwa-text-disabled py-4 text-center text-sm italic'>
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
                    <span className='text-kapwa-text-disabled shrink-0 text-xs font-medium'>
                      {totalExecutiveOrdersSigned} total
                    </span>
                  </div>
                }
                icon={ScrollText}
              >
                <div className='space-y-3'>
                  <p className='text-kapwa-text-support text-sm'>
                    As {latestMembership?.role || 'Executive'}, this official
                    has signed {totalExecutiveOrdersSigned} executive order
                    {totalExecutiveOrdersSigned !== 1 ? 's' : ''} across their
                    term{totalTermsServed > 1 ? 's' : ''}.
                  </p>
                  {totalExecutiveOrdersSigned > 0 && (
                    <Link
                      to={`/openlgu?search=${encodeURIComponent(officialName)}&type=executive_order`}
                      className='text-kapwa-text-brand hover:text-kapwa-text-brand inline-flex items-center gap-2 text-sm font-medium'
                    >
                      View all executive orders →
                    </Link>
                  )}
                </div>
              </DetailSection>
            )
          )}

          {/* Quick summary card */}
          <div className='border-kapwa-border-weak rounded-xl border bg-linear-to-br from-slate-50 to-kapwa-bg-surface p-6'>
            <h3 className='text-kapwa-text-disabled mb-4 text-sm font-bold tracking-widest uppercase'>
              Career Summary
            </h3>
            <dl className='space-y-3'>
              <div className='flex items-center justify-between'>
                <dt className='text-kapwa-text-support text-sm'>Total Terms</dt>
                <dd className='text-kapwa-text-strong text-lg font-bold'>
                  {totalTermsServed}
                </dd>
              </div>
              {hasLegislativeRole && (
                <div className='flex items-center justify-between'>
                  <dt className='text-kapwa-text-support text-sm'>
                    Overall Attendance
                  </dt>
                  <dd
                    className={`text-lg font-bold ${
                      overallAttendanceRate >= 90
                        ? 'text-kapwa-text-success'
                        : overallAttendanceRate >= 75
                          ? 'text-kapwa-text-accent-orange'
                          : 'text-kapwa-text-danger'
                    }`}
                  >
                    {overallAttendanceRate}%
                  </dd>
                </div>
              )}
              {hasExecutiveRole && totalExecutiveOrdersSigned > 0 && (
                <div className='flex items-center justify-between'>
                  <dt className='text-kapwa-text-support text-sm'>
                    Executive Orders Signed
                  </dt>
                  <dd className='text-kapwa-yellow-700 text-lg font-bold'>
                    {totalExecutiveOrdersSigned}
                  </dd>
                </div>
              )}
              <div className='flex items-center justify-between'>
                <dt className='text-kapwa-text-support text-sm'>
                  Total Documents
                </dt>
                <dd className='text-kapwa-text-strong text-lg font-bold'>
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
