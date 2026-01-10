import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Briefcase,
  ScrollText,
  CalendarCheck,
  CheckCircle2,
  XCircle,
  FileText, // Icon for ordinances
  BookOpen, // Icon for resolutions
} from 'lucide-react';
import type {
  Person,
  DocumentItem,
  Committee,
  Session,
} from '../../lib/legislation';
import { getPersonName } from '../../lib/legislation';

interface ContextType {
  persons: Person[];
  documents: DocumentItem[];
  committees: Committee[];
  sessions: Session[];
}

const ROLE_PRIORITY: Record<string, number> = {
  Chairperson: 1,
  'Vice Chairperson': 2,
  'Vice Chair': 2,
  Member: 3,
};

export default function PersonDetail() {
  const { personId } = useParams<{ personId: string }>();
  const { persons, documents, committees, sessions } =
    useOutletContext<ContextType>();

  // 1. Find Person
  const person = persons.find(p => p.id === personId);

  if (!person) {
    return (
      <div className='p-12 text-center text-gray-500'>Official not found</div>
    );
  }

  // 2. Legislation Logic
  const authoredDocs = documents.filter(d => d.author_ids.includes(person.id));

  // --- NEW: Calculate counts per category ---
  const ordinanceCount = authoredDocs.filter(
    d => d.type === 'ordinance'
  ).length;
  const resolutionCount = authoredDocs.filter(
    d => d.type === 'resolution'
  ).length;
  // ------------------------------------------

  // 3. Committee Logic
  const currentMembership = person.memberships[person.memberships.length - 1];
  const sortedCommittees = currentMembership
    ? [...currentMembership.committees].sort((a, b) => {
        const priorityA = ROLE_PRIORITY[a.role] ?? 99;
        const priorityB = ROLE_PRIORITY[b.role] ?? 99;
        if (priorityA !== priorityB) return priorityA - priorityB;
        return a.id.localeCompare(b.id);
      })
    : [];

  // 4. Attendance Logic
  const attendanceRecords = sessions.filter(
    session =>
      session.present.includes(person.id) || session.absent.includes(person.id)
  );

  const presentCount = attendanceRecords.filter(s =>
    s.present.includes(person.id)
  ).length;
  const totalSessions = attendanceRecords.length;
  const attendanceRate =
    totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;
  const rateColor =
    attendanceRate >= 90
      ? 'text-green-600'
      : attendanceRate >= 75
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Header Profile Card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8'>
        <Link
          to='/legislation'
          className='group inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1' />
          Back to Legislation
        </Link>

        <div className='flex flex-col md:flex-row gap-6 items-start'>
          <div className='w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center border-2 border-white shadow-md'>
            <span className='text-2xl font-bold text-slate-400'>
              {person.first_name[0]}
              {person.last_name[0]}
            </span>
          </div>

          <div className='flex-1'>
            <h1 className='text-3xl font-extrabold text-gray-900 mb-2'>
              Hon. {getPersonName(person)}
            </h1>
            <div className='flex flex-wrap gap-2'>
              {person.roles.map(role => (
                <span
                  key={role}
                  className='px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wide'
                >
                  {role}
                </span>
              ))}
            </div>
          </div>

          <div className='bg-slate-50 rounded-lg p-3 border border-slate-100 flex flex-col items-center min-w-[100px]'>
            <span className={`text-2xl font-bold ${rateColor}`}>
              {attendanceRate}%
            </span>
            <span className='text-[10px] uppercase font-bold text-gray-400 tracking-wide'>
              Attendance
            </span>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: Committees */}
        <div className='lg:col-span-1 space-y-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2'>
              <Briefcase className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-bold text-gray-700 uppercase'>
                Committees
              </h2>
            </div>
            <div className='p-4'>
              {sortedCommittees.length > 0 ? (
                <ul className='space-y-4'>
                  {sortedCommittees.map(c => {
                    const committeeName =
                      committees.find(x => x.id === c.id)?.name ||
                      c.id.replace(/-/g, ' ');
                    let roleColorClass = 'text-gray-400';
                    if (c.role.includes('Chairperson'))
                      roleColorClass = 'text-blue-600 font-bold';
                    if (c.role.includes('Vice'))
                      roleColorClass = 'text-amber-600 font-semibold';

                    return (
                      <li key={c.id}>
                        <div className='flex flex-col'>
                          <span
                            className={`text-xs uppercase tracking-wider mb-0.5 ${roleColorClass}`}
                          >
                            {c.role}
                          </span>
                          <span className='text-sm font-medium text-gray-900 capitalize leading-tight'>
                            {committeeName}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className='text-sm text-gray-400 italic'>No memberships.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Legislation AND Attendance */}
        <div className='lg:col-span-2 space-y-6'>
          {/* 1. Authored Legislation */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2'>
              <ScrollText className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-bold text-gray-700 uppercase'>
                Authored Legislation
              </h2>
              <span className='ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200'>
                Total: {authoredDocs.length}
              </span>
            </div>

            {authoredDocs.length === 0 ? (
              <div className='p-8 text-center text-gray-400'>
                No legislation found.
              </div>
            ) : (
              <div>
                {/* --- STATS SUMMARY --- */}
                <div className='grid grid-cols-2 gap-4 p-4 bg-gray-50/50 border-b border-gray-100'>
                  {/* Ordinance Stats */}
                  <div className='bg-white border border-blue-100 p-3 rounded-lg flex items-center gap-3 shadow-sm'>
                    <div className='p-2 bg-blue-50 text-blue-600 rounded-md'>
                      <FileText className='h-5 w-5' />
                    </div>
                    <div>
                      <span className='text-2xl font-bold text-gray-900 leading-none block'>
                        {ordinanceCount}
                      </span>
                      <span className='text-[10px] font-bold text-blue-500 uppercase tracking-wide'>
                        Ordinances
                      </span>
                    </div>
                  </div>

                  {/* Resolution Stats */}
                  <div className='bg-white border border-amber-100 p-3 rounded-lg flex items-center gap-3 shadow-sm'>
                    <div className='p-2 bg-amber-50 text-amber-600 rounded-md'>
                      <BookOpen className='h-5 w-5' />
                    </div>
                    <div>
                      <span className='text-2xl font-bold text-gray-900 leading-none block'>
                        {resolutionCount}
                      </span>
                      <span className='text-[10px] font-bold text-amber-500 uppercase tracking-wide'>
                        Resolutions
                      </span>
                    </div>
                  </div>
                </div>
                {/* ------------------- */}

                <div className='divide-y divide-gray-100 max-h-[400px] overflow-y-auto'>
                  {authoredDocs.map(doc => (
                    <Link
                      key={doc.id}
                      to={`/legislation/${doc.type}/${doc.id}`}
                      className='block p-4 hover:bg-gray-50 transition-colors group'
                    >
                      <div className='flex items-start justify-between mb-1'>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                            doc.type === 'ordinance'
                              ? 'bg-blue-100 text-blue-800'
                              : doc.type === 'resolution'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {doc.type.replace(/_/g, ' ')}
                        </span>
                        <span className='text-xs font-mono text-gray-400'>
                          {doc.date_enacted}
                        </span>
                      </div>
                      <h3 className='text-sm font-semibold text-gray-900 group-hover:text-blue-600 line-clamp-2'>
                        {doc.title}
                      </h3>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Attendance Records */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between'>
              <div className='flex items-center gap-2'>
                <CalendarCheck className='h-4 w-4 text-gray-500' />
                <h2 className='text-sm font-bold text-gray-700 uppercase'>
                  Attendance Record
                </h2>
              </div>
              <div className='flex gap-3 text-xs font-medium'>
                <span className='text-green-700 flex items-center gap-1'>
                  <CheckCircle2 className='h-3 w-3' /> {presentCount} Present
                </span>
                <span className='text-red-700 flex items-center gap-1'>
                  <XCircle className='h-3 w-3' /> {totalSessions - presentCount}{' '}
                  Absent
                </span>
              </div>
            </div>

            <div className='divide-y divide-gray-100 max-h-[400px] overflow-y-auto'>
              {attendanceRecords.length > 0 ? (
                attendanceRecords.map(session => {
                  const isPresent = session.present.includes(person.id);
                  return (
                    <Link
                      key={session.id}
                      to={`/legislation/session/${session.id}`}
                      className='flex items-center justify-between p-4 hover:bg-gray-50 transition-colors'
                    >
                      <div>
                        <p className='text-sm font-semibold text-gray-900'>
                          {session.ordinal_number} {session.type} Session
                        </p>
                        <p className='text-xs text-gray-500 font-mono mt-0.5'>
                          {session.date}
                        </p>
                      </div>

                      {isPresent ? (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100'>
                          <CheckCircle2 className='h-3.5 w-3.5' /> Present
                        </span>
                      ) : (
                        <span className='inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100'>
                          <XCircle className='h-3.5 w-3.5' /> Absent
                        </span>
                      )}
                    </Link>
                  );
                })
              ) : (
                <div className='p-8 text-center text-gray-400'>
                  No attendance records found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
