import { useState, useMemo } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
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
import type {
  Person,
  Term,
  DocumentItem,
  Session,
  Committee,
} from '../../lib/legislation';
import { getPersonName } from '../../lib/legislation';

interface ContextType {
  persons: Person[];
  term: Term | null; // Term can be null
  documents: DocumentItem[];
  sessions: Session[];
  committees: Committee[];
}

export default function TermDetail() {
  const { termId } = useParams<{ termId: string }>();
  const { persons, term, documents, sessions } =
    useOutletContext<ContextType>();
  const [visibleDocs, setVisibleDocs] = useState(10);

  // 1. Find Members (Sorted) - MOVED UP before early return
  const sortedMembers = useMemo(() => {
    // Safety check inside the hook
    if (!term || term.id !== termId) return [];

    const members = persons.filter(p =>
      p.memberships.some(m => m.term_id === term.id)
    );

    return members.sort((a, b) => {
      const memA = a.memberships.find(m => m.term_id === term.id);
      const memB = b.memberships.find(m => m.term_id === term.id);
      if (!memA || !memB) return 0;

      const isVMA = memA.role.includes('Vice Mayor');
      const isVMB = memB.role.includes('Vice Mayor');
      if (isVMA && !isVMB) return -1;
      if (!isVMA && isVMB) return 1;

      return (memA.rank || 99) - (memB.rank || 99);
    });
  }, [persons, term, termId]);

  // 2. Find Documents for this Term - MOVED UP before early return
  const termDocuments = useMemo(() => {
    // Safety check inside the hook
    if (!term || term.id !== termId) return [];

    return documents.filter(doc => {
      if (doc.session_id.startsWith(term.id)) return true;
      const session = sessions.find(s => s.id === doc.session_id);
      return session?.term_id === term.id;
    });
  }, [documents, sessions, term, termId]);

  // 3. Validate Term - MOVED DOWN (This is the "Render" guard)
  if (!term || term.id !== termId) {
    return (
      <div className='p-12 text-center text-gray-500'>
        <p>Term data not found.</p>
        <Link
          to='/legislation'
          className='text-blue-600 hover:underline mt-2 inline-block'
        >
          Back
        </Link>
      </div>
    );
  }

  // 4. Calculate Stats (Safe to do here because we returned early if term is null)
  const ordinanceCount = termDocuments.filter(
    d => d.type === 'ordinance'
  ).length;
  const resolutionCount = termDocuments.filter(
    d => d.type === 'resolution'
  ).length;

  return (
    <div className='max-w-5xl mx-auto space-y-10 mb-12'>
      {/* Header Card */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8'>
        <Link
          to='/legislation'
          className='group inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1' />
          Back to Legislation
        </Link>

        <div className='flex flex-col md:flex-row gap-8 justify-between items-start'>
          <div className='space-y-3'>
            <div className='inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide border border-blue-100'>
              <Landmark className='h-3.5 w-3.5' />
              {term.year_range}
            </div>
            <h1 className='text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight'>
              {term.name}
            </h1>
            <div className='flex items-center gap-2 text-gray-500 font-medium text-sm'>
              <Calendar className='h-4 w-4' />
              <span>
                {term.start_date} — {term.end_date}
              </span>
            </div>
          </div>

          <div className='bg-slate-50 rounded-xl p-5 border border-slate-100 min-w-[280px]'>
            <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-4'>
              Executive Leadership
            </h3>
            <div className='space-y-4'>
              <div className='flex gap-3'>
                <div className='w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm'>
                  <Crown className='h-4 w-4 text-amber-500' />
                </div>
                <div>
                  <p className='text-xs text-slate-500 uppercase font-semibold'>
                    Mayor
                  </p>
                  <p className='text-sm font-bold text-gray-900'>
                    {term.executive.mayor}
                  </p>
                </div>
              </div>
              <div className='flex gap-3'>
                <div className='w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 shadow-sm'>
                  <Gavel className='h-4 w-4 text-blue-500' />
                </div>
                <div>
                  <p className='text-xs text-slate-500 uppercase font-semibold'>
                    Vice Mayor
                  </p>
                  <p className='text-sm font-bold text-gray-900'>
                    {term.executive.vice_mayor}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
        {/* Left Column: Members */}
        <div className='lg:col-span-1 space-y-4'>
          <div className='flex items-center gap-2 px-1'>
            <Users className='h-5 w-5 text-gray-400' />
            <h2 className='text-lg font-bold text-gray-900'>
              Legislative Members
            </h2>
            <span className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold'>
              {sortedMembers.length}
            </span>
          </div>

          <div className='space-y-3'>
            {sortedMembers.map(person => {
              const membership = person.memberships.find(
                m => m.term_id === term.id
              );
              const isVM = membership?.role.includes('Vice Mayor');

              return (
                <Link
                  key={person.id}
                  to={`/legislation/person/${person.id}`}
                  className='group bg-white border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex items-center gap-3'
                >
                  <div
                    className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center text-xs font-bold border-2 ${
                      isVM
                        ? 'bg-blue-50 text-blue-600 border-blue-100'
                        : 'bg-slate-50 text-slate-500 border-white shadow-sm'
                    }`}
                  >
                    {person.first_name[0]}
                    {person.last_name[0]}
                  </div>
                  <div className='min-w-0'>
                    <p className='font-bold text-sm text-gray-900 group-hover:text-blue-700 truncate'>
                      Hon. {getPersonName(person)}
                    </p>
                    <p className='text-xs text-gray-500 truncate'>
                      {membership?.role}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Right Column: Legislative Output */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='flex items-center gap-2 px-1'>
            <ScrollText className='h-5 w-5 text-gray-400' />
            <h2 className='text-lg font-bold text-gray-900'>
              Legislative Output
            </h2>
            <span className='bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-bold'>
              {termDocuments.length}
            </span>
          </div>

          {/* Stats Cards */}
          <div className='grid grid-cols-2 gap-4'>
            <div className='bg-white border border-blue-100 p-4 rounded-xl shadow-sm flex items-center gap-4'>
              <div className='p-3 bg-blue-50 text-blue-600 rounded-lg'>
                <FileText className='h-6 w-6' />
              </div>
              <div>
                <span className='text-3xl font-bold text-gray-900 block leading-none'>
                  {ordinanceCount}
                </span>
                <span className='text-xs font-bold text-blue-500 uppercase tracking-wide mt-1 block'>
                  Ordinances
                </span>
              </div>
            </div>

            <div className='bg-white border border-amber-100 p-4 rounded-xl shadow-sm flex items-center gap-4'>
              <div className='p-3 bg-amber-50 text-amber-600 rounded-lg'>
                <BookOpen className='h-6 w-6' />
              </div>
              <div>
                <span className='text-3xl font-bold text-gray-900 block leading-none'>
                  {resolutionCount}
                </span>
                <span className='text-xs font-bold text-amber-500 uppercase tracking-wide mt-1 block'>
                  Resolutions
                </span>
              </div>
            </div>
          </div>

          {/* Document List */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            {termDocuments.length === 0 ? (
              <div className='p-12 text-center text-gray-400'>
                No documents found for this term.
              </div>
            ) : (
              <div className='divide-y divide-gray-100'>
                {termDocuments.slice(0, visibleDocs).map(doc => (
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

                {/* Load More Button */}
                {visibleDocs < termDocuments.length && (
                  <button
                    onClick={() => setVisibleDocs(prev => prev + 20)}
                    className='w-full py-3 text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors flex items-center justify-center gap-1'
                  >
                    Load More <ChevronDown className='h-4 w-4' />
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
