import { Link, useOutletContext, useParams } from 'react-router-dom';

import {
  BookOpen,
  Briefcase,
  CalendarCheck,
  CheckCircle2,
  FileText,
  ScrollText,
  XCircle,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

// Use the library types as the source of truth to ensure compatibility with helpers
import type {
  Committee,
  DocumentItem,
  Person,
  Session,
} from '@/lib/legislation';
import { getPersonName } from '@/lib/legislation';
import { toTitleCase } from '@/lib/stringUtils';

// Define the exact shape of the context provided by the Legislation Layout
interface LegislationContext {
  documents: DocumentItem[];
  persons: Person[];
  sessions: Session[];
  committees: Committee[];
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
  const { persons, documents, committees, sessions } =
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

  // 2. Data Logic without 'any'
  const officialName = getPersonName(person);
  const authoredDocs = documents.filter((d: DocumentItem) =>
    d.author_ids.includes(person.id)
  );
  const ordCount = authoredDocs.filter(d => d.type === 'ordinance').length;
  const resCount = authoredDocs.filter(d => d.type === 'resolution').length;

  const attendanceRecords = sessions.filter(
    (s: Session) =>
      s.present.includes(person.id) || s.absent.includes(person.id)
  );
  const presentCount = attendanceRecords.filter(s =>
    s.present.includes(person.id)
  ).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;

  const currentMembership = person.memberships[person.memberships.length - 1];
  const sortedCommittees = [...(currentMembership?.committees || [])].sort(
    (a, b) => {
      const pA = ROLE_PRIORITY[a.role] ?? 99;
      const pB = ROLE_PRIORITY[b.role] ?? 99;
      return pA !== pB ? pA - pB : a.id.localeCompare(b.id);
    }
  );

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-6 px-4 pb-20 duration-500 md:px-0'>
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
      <header className='flex flex-col items-center gap-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row'>
        <div
          className='bg-primary-600 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-2xl font-black text-white'
          aria-hidden='true'
        >
          {person.first_name[0]}
          {person.last_name[0]}
        </div>
        <div className='flex-1 text-center md:text-left'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Hon. {officialName}
          </h1>
          <div className='mt-2 flex flex-wrap justify-center gap-2 md:justify-start'>
            {person.roles.map(role => (
              <Badge key={role} variant='slate'>
                {role}
              </Badge>
            ))}
          </div>
        </div>
        <div
          className='flex items-center gap-4 border-l border-slate-100 pl-6'
          aria-label={`Attendance rate: ${attendanceRate}%`}
        >
          <div className='text-center'>
            <p
              className={`text-2xl leading-none font-black ${attendanceRate >= 90 ? 'text-emerald-600' : 'text-secondary-600'}`}
            >
              {attendanceRate}%
            </p>
            <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Attendance
            </p>
          </div>
        </div>
      </header>

      {/* High Contrast Stats Grid (Blue & Orange) */}
      <div className='grid grid-cols-2 gap-4'>
        <div className='border-primary-600 flex items-center gap-4 rounded-2xl border-b-4 bg-white p-5 shadow-sm'>
          <div className='bg-primary-50 text-primary-600 rounded-lg p-2'>
            <FileText className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-2xl leading-none font-bold text-slate-900'>
              {ordCount}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Ordinances
            </span>
          </div>
        </div>
        <div className='border-secondary-600 flex items-center gap-4 rounded-2xl border-b-4 bg-white p-5 shadow-sm'>
          <div className='bg-secondary-50 text-secondary-600 rounded-lg p-2'>
            <BookOpen className='h-5 w-5' aria-hidden='true' />
          </div>
          <div>
            <span className='block text-2xl leading-none font-bold text-slate-900'>
              {resCount}
            </span>
            <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Resolutions
            </span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
        <aside className='space-y-6'>
          <DetailSection title='Committees' icon={Briefcase}>
            <ul className='space-y-4'>
              {sortedCommittees.map(c => {
                const globalComm = committees.find(gc => gc.id === c.id);
                const displayName = globalComm
                  ? globalComm.name
                  : toTitleCase(c.id.replace(/-/g, ' '));
                const isLeader = c.role.includes('Chair');

                return (
                  <li
                    key={c.id}
                    className='border-b border-slate-50 pb-3 last:border-0'
                  >
                    <p
                      className={`mb-1 text-[10px] font-bold tracking-widest uppercase ${isLeader ? 'text-secondary-600' : 'text-slate-400'}`}
                    >
                      {c.role}
                    </p>
                    <p className='text-sm leading-tight font-bold text-slate-700'>
                      {displayName}
                    </p>
                  </li>
                );
              })}
            </ul>
          </DetailSection>

          <DetailSection title='Attendance Log' icon={CalendarCheck}>
            <div
              className='scrollbar-thin max-h-64 space-y-2 overflow-y-auto pr-2'
              tabIndex={0}
            >
              {attendanceRecords.map(s => (
                <div
                  key={s.id}
                  className='flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-[11px]'
                >
                  <span className='font-bold text-slate-600'>{s.date}</span>
                  {s.present.includes(person.id) ? (
                    <CheckCircle2
                      className='h-4 w-4 text-emerald-600'
                      aria-label='Present'
                    />
                  ) : (
                    <XCircle
                      className='text-secondary-600 h-4 w-4'
                      aria-label='Absent'
                    />
                  )}
                </div>
              ))}
            </div>
          </DetailSection>
        </aside>

        <div className='md:col-span-2'>
          <DetailSection title='Authored Legislation' icon={ScrollText}>
            <div className='divide-y divide-slate-100'>
              {authoredDocs.slice(0, 8).map(doc => (
                <Link
                  key={doc.id}
                  to={`/legislation/${doc.type}/${doc.id}`}
                  className='group block min-h-[44px] py-4 transition-colors hover:bg-slate-50'
                  aria-label={`View details for ${doc.type} ${doc.number}: ${doc.title}`}
                >
                  <div className='mb-2 flex items-center gap-3'>
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
                  <p className='group-hover:text-primary-600 line-clamp-2 text-sm leading-relaxed font-bold text-slate-800 transition-colors'>
                    {doc.title}
                  </p>
                </Link>
              ))}
              {authoredDocs.length > 8 && (
                <p className='border-t border-slate-50 pt-6 text-center text-xs text-slate-400 italic'>
                  Showing latest 8 of {authoredDocs.length} documents.
                </p>
              )}
            </div>
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
