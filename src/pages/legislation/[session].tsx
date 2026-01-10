import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Gavel,
} from 'lucide-react';
import type { Session, Person, DocumentItem } from '../../lib/legislation';
import { getPersonName } from '../../lib/legislation';

interface ContextType {
  sessions: Session[];
  persons: Person[];
  documents: DocumentItem[];
}

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, persons, documents } = useOutletContext<ContextType>();

  // 1. Find Session
  const session = sessions.find(s => s.id === sessionId);

  if (!session) {
    return (
      <div className='p-12 text-center text-gray-500'>Session not found</div>
    );
  }

  // 2. Resolve Attendees
  const presentMembers = session.present
    .map(id => persons.find(p => p.id === id))
    .filter(Boolean) as Person[];
  const absentMembers = session.absent
    .map(id => persons.find(p => p.id === id))
    .filter(Boolean) as Person[];

  // 3. Find Related Documents Enacted in this Session
  const relatedDocs = documents.filter(d => d.session_id === session.id);

  return (
    <div className='max-w-5xl mx-auto space-y-6'>
      {/* Header */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8'>
        <Link
          to='/legislation'
          className='group inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1' />
          Back to Legislation
        </Link>

        <div className='flex flex-col md:flex-row md:items-start md:justify-between gap-4'>
          <div>
            <div className='flex items-center gap-2 mb-2'>
              <span
                className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${
                  session.type === 'Regular'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {session.type} Session
              </span>
              <span className='text-xs font-mono text-gray-400'>
                ID: {session.id}
              </span>
            </div>
            <h1 className='text-3xl font-extrabold text-gray-900'>
              {session.ordinal_number} {session.type} Session
            </h1>
          </div>

          <div className='flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100'>
            <Calendar className='h-5 w-5 text-gray-400' />
            <div className='flex flex-col'>
              <span className='text-[10px] font-bold uppercase text-gray-400 leading-none'>
                Date Held
              </span>
              <span className='font-mono text-sm font-medium text-gray-900'>
                {session.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: Attendance */}
        <div className='lg:col-span-1 space-y-6'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <div className='bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2'>
              <Users className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-bold text-gray-700 uppercase'>
                Attendance
              </h2>
            </div>

            <div className='p-4 space-y-6'>
              {/* Present */}
              <div>
                <h3 className='text-xs font-bold text-green-700 uppercase mb-3 flex items-center gap-1.5'>
                  <CheckCircle2 className='h-3.5 w-3.5' /> Present (
                  {presentMembers.length})
                </h3>
                <ul className='space-y-2'>
                  {presentMembers.map(person => (
                    <li key={person.id}>
                      <Link
                        to={`/legislation/person/${person.id}`}
                        className='text-sm text-gray-700 flex items-center gap-2 hover:text-blue-600 hover:underline'
                      >
                        <div className='w-1.5 h-1.5 rounded-full bg-green-400'></div>
                        {getPersonName(person)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Absent */}
              {absentMembers.length > 0 && (
                <div className='pt-4 border-t border-gray-100'>
                  <h3 className='text-xs font-bold text-red-700 uppercase mb-3 flex items-center gap-1.5'>
                    <XCircle className='h-3.5 w-3.5' /> Absent (
                    {absentMembers.length})
                  </h3>
                  <ul className='space-y-2'>
                    {absentMembers.map(person => (
                      <li
                        key={person.id}
                        className='text-sm text-gray-500 flex items-center gap-2'
                      >
                        <div className='w-1.5 h-1.5 rounded-full bg-red-300'></div>
                        {getPersonName(person)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Legislation */}
        <div className='lg:col-span-2'>
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-full'>
            <div className='bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center gap-2'>
              <Gavel className='h-4 w-4 text-gray-500' />
              <h2 className='text-sm font-bold text-gray-700 uppercase'>
                Legislation Enacted
              </h2>
              <span className='ml-auto bg-white px-2 py-0.5 rounded-full text-xs font-medium border border-gray-200'>
                {relatedDocs.length}
              </span>
            </div>

            {relatedDocs.length === 0 ? (
              <div className='p-12 text-center text-gray-400'>
                No documents found for this session.
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {relatedDocs.map(doc => (
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
                        {doc.type.replace('_', ' ')}
                      </span>
                      <span className='text-xs font-mono text-gray-400'>
                        {doc.number}
                      </span>
                    </div>
                    <h3 className='text-sm font-semibold text-gray-900 group-hover:text-blue-600'>
                      {doc.title}
                    </h3>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
