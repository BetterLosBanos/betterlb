import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  Briefcase,
  ScrollText,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText,
  BookOpen,
} from 'lucide-react';
import { getPersonName } from '@/lib/legislation';
import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import type { LegislationContext } from '@/types/legislationTypes';

const ROLE_PRIORITY: Record<string, number> = {
  Chairperson: 1,
  'Vice Chairperson': 2,
  'Vice Chair': 2,
  Member: 3,
};

export default function PersonDetail() {
  const { personId } = useParams();
  const { persons, documents, sessions } =
    useOutletContext<LegislationContext>();

  const person = persons.find(p => p.id === personId);
  if (!person)
    return (
      <div className='p-12 text-center' role='alert'>
        Official not found
      </div>
    );

  const authoredDocs = documents.filter(d => d.author_ids.includes(person.id));
  const ordCount = authoredDocs.filter(d => d.type === 'ordinance').length;
  const resCount = authoredDocs.filter(d => d.type === 'resolution').length;

  const attendanceRecords = sessions.filter(
    s => s.present.includes(person.id) || s.absent.includes(person.id)
  );
  const presentCount = attendanceRecords.filter(s =>
    s.present.includes(person.id)
  ).length;
  const attendanceRate =
    attendanceRecords.length > 0
      ? Math.round((presentCount / attendanceRecords.length) * 100)
      : 0;

  const sortedCommittees = [...(person.memberships[0]?.committees || [])].sort(
    (a, b) => {
      const pA = ROLE_PRIORITY[a.role] ?? 99;
      const pB = ROLE_PRIORITY[b.role] ?? 99;
      return pA !== pB ? pA - pB : a.id.localeCompare(b.id);
    }
  );

  return (
    <div className='mx-auto space-y-6 max-w-5xl duration-500 animate-in fade-in'>
      {/* Profile Header */}
      <header className='flex flex-col gap-6 items-center p-6 bg-white rounded-2xl border shadow-sm border-slate-200 md:flex-row'>
        <div
          className='flex justify-center items-center w-20 h-20 text-2xl font-black text-white rounded-2xl bg-primary-600 shrink-0'
          aria-hidden='true'
        >
          {person.first_name[0]}
          {person.last_name[0]}
        </div>
        <div className='flex-1 text-center md:text-left'>
          <h1 className='text-2xl font-bold text-slate-900'>
            Hon. {getPersonName(person)}
          </h1>
          <div className='flex flex-wrap gap-2 justify-center mt-2 md:justify-start'>
            {person.roles.map((role: string) => (
              <Badge key={role} variant='slate'>
                {role}
              </Badge>
            ))}
          </div>
        </div>
        <div
          className='flex gap-4 items-center pl-6 border-l border-slate-100'
          aria-label={`Attendance rate: ${attendanceRate}%`}
        >
          <div className='text-center'>
            <p
              className={`text-2xl font-black leading-none ${attendanceRate >= 90 ? 'text-emerald-600' : 'text-secondary-600'}`}
            >
              {attendanceRate}%
            </p>
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1'>
              Attendance
            </p>
          </div>
        </div>
      </header>

      {/* High Contrast Stats Grid */}
      <div
        className='grid grid-cols-2 gap-4'
        role='region'
        aria-label='Legislation counts'
      >
        <div className='flex gap-4 items-center p-5 bg-white rounded-2xl border-b-4 shadow-sm border-primary-600'>
          <div className='p-2 rounded-lg bg-primary-50 text-primary-600'>
            <FileText className='w-5 h-5' />
          </div>
          <div>
            <span className='block text-2xl font-bold leading-none text-slate-900'>
              {ordCount}
            </span>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
              Ordinances
            </span>
          </div>
        </div>
        <div className='flex gap-4 items-center p-5 bg-white rounded-2xl border-b-4 shadow-sm border-secondary-600'>
          <div className='p-2 rounded-lg bg-secondary-50 text-secondary-600'>
            <BookOpen className='w-5 h-5' />
          </div>
          <div>
            <span className='block text-2xl font-bold leading-none text-slate-900'>
              {resCount}
            </span>
            <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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
                const isLeader = c.role.includes('Chair');
                return (
                  <li
                    key={c.id}
                    className='pb-3 border-b border-slate-50 last:border-0'
                  >
                    <p
                      className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${isLeader ? 'text-secondary-600' : 'text-slate-400'}`}
                    >
                      {c.role}
                    </p>
                    <p className='text-sm font-bold leading-tight text-slate-700'>
                      {c.id.replace(/-/g, ' ')}
                    </p>
                  </li>
                );
              })}
            </ul>
          </DetailSection>

          <DetailSection title='Attendance Log' icon={CalendarCheck}>
            <div
              className='overflow-y-auto pr-2 space-y-2 max-h-64 scrollbar-thin'
              tabIndex={0}
            >
              {attendanceRecords.map(s => (
                <div
                  key={s.id}
                  className='flex items-center justify-between text-[11px] p-2.5 rounded-lg bg-slate-50 border border-slate-100'
                >
                  <span className='font-bold text-slate-600'>{s.date}</span>
                  {s.present.includes(person.id) ? (
                    <CheckCircle2
                      className='w-4 h-4 text-emerald-600'
                      aria-label='Present'
                    />
                  ) : (
                    <XCircle
                      className='w-4 h-4 text-secondary-600'
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
                  className='block py-4 hover:bg-slate-50 transition-colors group min-h-[44px]'
                  aria-label={`View details for ${doc.type} ${doc.number}: ${doc.title}`}
                >
                  <div className='flex gap-3 items-center mb-2'>
                    <Badge
                      variant={doc.type === 'ordinance' ? 'primary' : 'warning'}
                    >
                      {doc.type}
                    </Badge>
                    <span className='text-[10px] font-mono font-bold text-slate-400 uppercase'>
                      {doc.date_enacted}
                    </span>
                  </div>
                  <p className='text-sm font-bold leading-relaxed transition-colors text-slate-800 group-hover:text-primary-600 line-clamp-2'>
                    {doc.title}
                  </p>
                </Link>
              ))}
              {authoredDocs.length > 8 && (
                <p className='pt-6 text-xs italic text-center border-t text-slate-400 border-slate-50'>
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
