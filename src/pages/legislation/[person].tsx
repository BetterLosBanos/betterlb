import { Link, useOutletContext, useParams } from 'react-router-dom';

import {
  BookOpen,
  CalendarCheck,
  CheckCircle2,
  ChevronRight,
  FileText,
  ScrollText,
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
import { Badge } from '@/components/ui/Badge';

// Use the library types as the source of truth to ensure compatibility with helpers
import type {
  Committee,
  DocumentItem,
  Person,
  Session,
  Term,
} from '@/lib/legislation';
import { getPersonName } from '@/lib/legislation';
import { toTitleCase } from '@/lib/stringUtils';

// Define the exact shape of the context provided by the Legislation Layout
interface LegislationContext {
  documents: DocumentItem[];
  persons: Person[];
  sessions: Session[];
  committees: Committee[];
  terms: Term[];
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
}

const ROLE_PRIORITY: Record<string, number> = {
  Chairperson: 1,
  'Vice Chairperson': 2,
  'Vice Chair': 2,
  Member: 3,
};

export default function PersonDetail() {
  const { personId } = useParams<{ personId: string }>();

  // 1. Strictly typed destructuring from context
  const { persons, documents, committees, sessions, terms } =
    useOutletContext<LegislationContext>();

  const person = persons.find((p: Person) => p.id === personId);

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
  const membershipsWithDetails: MembershipWithDetails[] = memberships.map(m => {
    const term = terms.find(t => t.id === m.term_id);
    const termSessions = sessions.filter(s => s.term_id === m.term_id);
    const presentInTerm = termSessions.filter(s => s.present.includes(person.id)).length;
    const termAttendanceRate = termSessions.length > 0
      ? Math.round((presentInTerm / termSessions.length) * 100)
      : 0;

    // Get documents authored during this term
    const termDocs = authoredDocs.filter(d => (d as any).term_id === m.term_id);
    const termOrdCount = termDocs.filter(d => d.type === 'ordinance').length;
    const termResCount = termDocs.filter(d => d.type === 'resolution').length;
    const termEoCount = termDocs.filter(d => d.type === 'executive_order').length;

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
    };
  }).sort((a, b) => {
    // Sort by term number descending (newest first)
    const termNumA = a.term?.term_number || 0;
    const termNumB = b.term?.term_number || 0;
    return termNumB - termNumA;
  });

  const latestMembership = membershipsWithDetails[0];
  const totalTermsServed = memberships.length;

  // Get recent attendance for sidebar (last 10)
  const recentAttendance = allAttendanceRecords.slice(0, 10);
  const recentLegislation = authoredDocs.slice(0, 6);

  return (
    <div className='animate-in fade-in mx-auto max-w-6xl space-y-6 px-4 pb-20 duration-500 md:px-0'>
      {/* Breadcrumbs */}
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
            <BreadcrumbPage>{officialName}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Profile Header */}
      <header className='rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8'>
        <div className='flex flex-col items-center gap-6 md:flex-row'>
          <div
            className='bg-gradient-to-br from-primary-600 to-primary-700 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl text-3xl font-black text-white shadow-lg'
            aria-hidden='true'
          >
            {person.first_name[0]}
            {person.last_name[0]}
          </div>
          <div className='flex-1 text-center md:text-left'>
            <h1 className='text-2xl font-bold text-slate-900 md:text-3xl'>
              Hon. {officialName}
            </h1>
            <div className='mt-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between'>
              <div className='flex flex-wrap justify-center gap-2 md:justify-start'>
                {latestMembership?.role && (
                  <Badge variant='primary' className='text-xs'>
                    {latestMembership.role}
                  </Badge>
                )}
                {latestMembership?.term && (
                  <Badge variant='slate' className='text-xs'>
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
          <div className='flex items-center gap-4 border-l border-slate-100 pl-6'>
            <div className='text-center'>
              <p
                className={`text-2xl leading-none font-black ${overallAttendanceRate >= 90 ? 'text-emerald-600' : overallAttendanceRate >= 75 ? 'text-secondary-600' : 'text-red-600'}`}
              >
                {overallAttendanceRate}%
              </p>
              <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Attendance
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Stats Grid */}
      <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
        <div className='border-primary-600 flex items-center gap-3 rounded-xl border-b-4 bg-white p-4 shadow-sm'>
          <div className='bg-primary-50 text-primary-600 rounded-lg p-2'>
            <FileText className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-xl leading-none font-bold text-slate-900'>
              {ordCount}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Ordinances
            </span>
          </div>
        </div>
        <div className='border-secondary-600 flex items-center gap-3 rounded-xl border-b-4 bg-white p-4 shadow-sm'>
          <div className='bg-secondary-50 text-secondary-600 rounded-lg p-2'>
            <BookOpen className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-xl leading-none font-bold text-slate-900'>
              {resCount}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Resolutions
            </span>
          </div>
        </div>
        <div className='border-purple-600 flex items-center gap-3 rounded-xl border-b-4 bg-white p-4 shadow-sm'>
          <div className='bg-purple-50 text-purple-600 rounded-lg p-2'>
            <ScrollText className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-xl leading-none font-bold text-slate-900'>
              {eoCount}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Exec. Orders
            </span>
          </div>
        </div>
        <div className='border-slate-600 flex items-center gap-3 rounded-xl border-b-4 bg-white p-4 shadow-sm'>
          <div className='bg-slate-50 text-slate-600 rounded-lg p-2'>
            <Users className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-xl leading-none font-bold text-slate-900'>
              {totalTermsServed}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Terms
            </span>
          </div>
        </div>
      </div>

      {/* Service History */}
      <DetailSection title='Service History' icon={CalendarCheck}>
        <div className='space-y-4'>
          {membershipsWithDetails.map((membership, index) => {
            const isActive = index === 0;
            const sortedCommittees = [...(membership.committees || [])].sort(
              (a, b) => {
                const pA = ROLE_PRIORITY[a.role] ?? 99;
                const pB = ROLE_PRIORITY[b.role] ?? 99;
                return pA !== pB ? pA - pB : a.id.localeCompare(b.id);
              }
            );

            return (
              <div
                key={membership.term_id}
                className={`relative rounded-xl border bg-white p-5 shadow-sm transition-all hover:shadow-md ${
                  isActive ? 'border-primary-300 ring-2 ring-primary-100' : 'border-slate-200'
                }`}
              >
                {isActive && (
                  <Badge variant='primary' className='absolute -top-2 -right-2 text-xs'>
                    CURRENT
                  </Badge>
                )}
                <div className='flex flex-col gap-4 md:flex-row md:items-start md:justify-between'>
                  <div className='flex-1'>
                    <div className='flex flex-wrap items-center gap-3 mb-3'>
                      <h3 className='text-lg font-bold text-slate-900'>
                        {membership.term?.name || membership.term_id}
                      </h3>
                      <Badge variant={isActive ? 'primary' : 'slate'} className='text-xs'>
                        {membership.term?.year_range || ''}
                      </Badge>
                      <Badge variant='secondary' className='text-xs'>
                        {membership.role}
                        {membership.rank !== undefined && ` • Rank #${membership.rank}`}
                      </Badge>
                    </div>

                    {sortedCommittees.length > 0 && (
                      <div className='mb-3'>
                        <p className='mb-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                          Committees
                        </p>
                        <div className='flex flex-wrap gap-2'>
                          {sortedCommittees.map(c => {
                            const globalComm = committees.find(gc => gc.id === c.id);
                            const displayName = globalComm
                              ? globalComm.name
                              : toTitleCase(c.id.replace(/-/g, ' '));
                            const isLeader = c.role.includes('Chair');

                            return (
                              <Badge
                                key={c.id}
                                variant={isLeader ? 'warning' : 'slate'}
                                className='text-xs'
                              >
                                {isLeader && 'Chair: '}{displayName}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Term Stats */}
                    <div className='flex flex-wrap items-center gap-4 text-sm'>
                      <div className='flex items-center gap-1.5'>
                        <CalendarCheck className='h-4 w-4 text-slate-400' />
                        <span className={membership.attendanceRate >= 90 ? 'text-emerald-600 font-semibold' : 'text-slate-600'}>
                          {membership.attendanceRate}% attendance ({membership.presentCount}/{membership.totalCount})
                        </span>
                      </div>
                      <span className='text-slate-300'>|</span>
                      <span className='text-slate-600'>
                        Authored: {membership.termStats?.ordinances || 0} ord, {membership.termStats?.resolutions || 0} res
                        {membership.termStats?.executiveOrders ? `, ${membership.termStats.executiveOrders} EO` : ''}
                      </span>
                    </div>
                  </div>

                  {/* Link to term */}
                  {membership.term && (
                    <Link
                      to={`/legislation/term/${membership.term.id}`}
                      className='text-primary-600 hover:text-primary-700 shrink-0'
                      aria-label={`View details for ${membership.term.name}`}
                    >
                      <ChevronRight className='h-5 w-5' />
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </DetailSection>

      {/* Two-column layout for recent content */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-3'>
        {/* Recent Legislation */}
        <div className='lg:col-span-2'>
          <DetailSection
            title={
              <div className='flex items-center justify-between'>
                <span>Recent Legislation</span>
                <Link
                  to={`/legislation?search=${encodeURIComponent(officialName)}`}
                  className='text-primary-600 hover:text-primary-700 text-sm'
                >
                  View all
                </Link>
              </div>
            }
            icon={ScrollText}
          >
            <div className='divide-y divide-slate-100'>
              {recentLegislation.length > 0 ? recentLegislation.map(doc => {
                const termBadge = (doc as any).term_id ? terms.find(t => t.id === (doc as any).term_id) : null;

                return (
                  <Link
                    key={doc.id}
                    to={`/legislation/${doc.type}/${doc.id}`}
                    className='group block min-h-[44px] py-4 transition-colors hover:bg-slate-50'
                  >
                    <div className='mb-2 flex items-center gap-3'>
                      <Badge
                        variant={
                          doc.type === 'ordinance' ? 'primary' :
                          doc.type === 'executive_order' ? 'warning' : 'secondary'
                        }
                        className='text-xs'
                      >
                        {doc.type}
                      </Badge>
                      <span className='font-mono text-[10px] font-bold text-slate-400 uppercase'>
                        {doc.number}
                      </span>
                      <span className='font-mono text-[10px] font-bold text-slate-300'>
                        {doc.date_enacted}
                      </span>
                      {termBadge && (
                        <Badge variant='slate' className='text-[10px]'>
                          {termBadge.ordinal}
                        </Badge>
                      )}
                    </div>
                    <p className='group-hover:text-primary-600 line-clamp-2 text-sm leading-relaxed font-bold text-slate-800 transition-colors'>
                      {doc.title}
                    </p>
                  </Link>
                );
              }) : (
                <p className='py-8 text-center text-sm text-slate-400 italic'>
                  No legislation authored yet.
                </p>
              )}
            </div>
          </DetailSection>
        </div>

        {/* Attendance Log Sidebar */}
        <aside>
          <DetailSection title='Attendance Log' icon={CheckCircle2}>
            {recentAttendance.length > 0 ? (
              <div className='scrollbar-thin max-h-80 space-y-2 overflow-y-auto pr-2'>
                {recentAttendance.map(s => {
                  const isPresent = s.present.includes(person.id);

                  return (
                    <div
                      key={s.id}
                      className='flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-[11px]'
                    >
                      <div className='flex items-center gap-2'>
                        {isPresent ? (
                          <CheckCircle2
                            className='h-4 w-4 text-emerald-600 flex-shrink-0'
                            aria-label='Present'
                          />
                        ) : (
                          <XCircle
                            className='h-4 w-4 text-secondary-600 flex-shrink-0'
                            aria-label='Absent'
                          />
                        )}
                        <span className='font-bold text-slate-600'>{s.date}</span>
                      </div>
                      <Link
                        to={`/legislation/session/${s.id}`}
                        className='text-slate-400 hover:text-primary-600'
                        aria-label={`View session ${s.ordinal_number}`}
                      >
                        <ChevronRight className='h-4 w-4' />
                      </Link>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className='py-4 text-center text-sm text-slate-400 italic'>
                No attendance records found.
              </p>
            )}
          </DetailSection>
        </aside>
      </div>
    </div>
  );
}
