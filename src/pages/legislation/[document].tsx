import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  FileText,
  Download,
  Users,
  Hash,
  Landmark, // Icon for Term
  Activity,
  Gavel,
} from 'lucide-react';
import type {
  DocumentItem,
  Person,
  Session,
  Term,
} from '../../lib/legislation';
import { getPersonName } from '../../lib/legislation';

interface ContextType {
  documents: DocumentItem[];
  persons: Person[];
  sessions: Session[];
  term: Term; // 1. Add Term to context
}

const getBadgeStyles = (type: string) => {
  switch (type) {
    case 'ordinance':
      return 'bg-blue-100 text-blue-800 ring-1 ring-inset ring-blue-700/10';
    case 'resolution':
      return 'bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-700/10';
    case 'executive_order':
      return 'bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-700/10';
    default:
      return 'bg-gray-100 text-gray-800 ring-1 ring-inset ring-gray-600/10';
  }
};

export default function LegislationDocument() {
  const { document: urlId } = useParams<{ type: string; document: string }>();
  // 2. Destructure term from context
  const { documents, persons, sessions, term } =
    useOutletContext<ContextType>();

  // --- Document Lookup ---
  let doc = documents?.find(d => d.id === urlId);
  if (!doc && urlId && documents) {
    const normalize = (str: string) => str.replace(/[-_]/g, '').toLowerCase();
    doc = documents.find(d => normalize(d.id) === normalize(urlId));
  }

  // --- Loading / Not Found States ---
  if (!documents || documents.length === 0)
    return <div className='p-12 text-center text-gray-500'>Loading...</div>;
  if (!doc) return <div className='p-12 text-center'>Document not found</div>;

  // --- Data Resolution ---
  const authors = doc.author_ids
    .map(authorId => persons.find(p => p.id === authorId))
    .filter(Boolean) as Person[];

  const session = sessions.find(s => s.id === doc!.session_id);

  const sessionName = session
    ? `${session.ordinal_number} ${session.type} Session`
    : doc.session_id;

  return (
    <div className='max-w-4xl mx-auto bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
      {/* Header */}
      <div className='bg-gray-50/50 p-6 md:p-8 border-b border-gray-200'>
        <Link
          to='/legislation'
          className='group inline-flex items-center text-sm text-gray-500 hover:text-blue-600 mb-6 transition-colors'
        >
          <ArrowLeft className='h-4 w-4 mr-1 transition-transform group-hover:-translate-x-1' />
          Back to Legislation
        </Link>

        <div className='flex flex-wrap items-center gap-3 mb-4'>
          <span
            className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide ${getBadgeStyles(doc.type)}`}
          >
            {doc.type.replace(/_/g, ' ')}
          </span>
          <div className='flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-mono bg-white border border-gray-200 text-gray-600 shadow-sm'>
            <Hash className='h-3 w-3 text-gray-400' />
            {doc.number}
          </div>
        </div>

        <h1 className='text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight'>
          {doc.title}
        </h1>
      </div>

      <div className='p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-8'>
        {/* Left Column */}
        <div className='md:col-span-2 space-y-8'>
          <div>
            <div className='flex items-center gap-2 mb-4'>
              <Users className='h-4 w-4 text-gray-400' />
              <h3 className='text-xs font-bold text-gray-500 uppercase tracking-wider'>
                Authors / Sponsors
              </h3>
            </div>
            <div className='flex flex-wrap gap-3'>
              {authors.length > 0 ? (
                authors.map(author => (
                  <Link
                    key={author.id}
                    to={`/legislation/person/${author.id}`}
                    className='group inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full pl-1 pr-4 py-1 shadow-sm hover:border-blue-300 hover:shadow-md transition-all'
                  >
                    <div className='w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-bold text-gray-600 border border-gray-100 group-hover:bg-blue-50 group-hover:text-blue-600'>
                      {author.first_name?.[0]}
                      {author.last_name?.[0]}
                    </div>
                    <span className='text-sm font-medium text-gray-700 group-hover:text-blue-700'>
                      {getPersonName(author)}
                    </span>
                  </Link>
                ))
              ) : (
                <span className='text-sm text-gray-400 italic'>
                  No specific authors
                </span>
              )}
            </div>
          </div>

          <div className='p-5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
            <div className='flex items-start gap-4'>
              <div className='p-3 bg-white rounded-lg border border-slate-100 shadow-sm text-red-500'>
                <FileText className='h-8 w-8' />
              </div>
              <div>
                <p className='font-semibold text-gray-900'>
                  Full Text Document
                </p>
                <p className='text-sm text-gray-500 mt-0.5'>
                  Portable Document Format (PDF)
                </p>
              </div>
            </div>
            <a
              href={doc.link}
              target='_blank'
              rel='noreferrer'
              className='inline-flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 font-medium text-sm shadow-sm'
            >
              <Download className='h-4 w-4' /> Download PDF
            </a>
          </div>
        </div>

        {/* Right Column: Metadata */}
        <div className='bg-gray-50/80 p-6 rounded-xl border border-gray-100 h-fit'>
          <h3 className='text-xs font-bold text-gray-400 uppercase tracking-wider mb-5'>
            Legislative Context
          </h3>

          <dl className='space-y-5'>
            {/* 3. Legislative Term Display */}
            {term && (
              <div>
                <dt className='text-xs text-gray-500 flex items-center gap-2 mb-1'>
                  <Landmark className='h-3.5 w-3.5' /> Legislative Term
                </dt>
                <dd className='pl-5.5'>
                  <Link
                    to={`/legislation/term/${term.id}`}
                    className='font-medium text-gray-900 hover:text-blue-600 hover:underline block leading-tight transition-colors'
                  >
                    {term.ordinal} Sangguniang Bayan
                  </Link>
                  <span className='text-xs text-gray-500 font-mono block mt-0.5'>
                    {term.year_range}
                  </span>
                </dd>
              </div>
            )}

            {/* Session Display */}
            <div className={term ? 'pt-4 border-t border-gray-200/50' : ''}>
              <dt className='text-xs text-gray-500 flex items-center gap-2 mb-1'>
                <Gavel className='h-3.5 w-3.5' /> Approved During
              </dt>
              <dd className='pl-5.5'>
                {session ? (
                  <Link
                    to={`/legislation/session/${session.id}`}
                    className='font-medium text-blue-600 hover:text-blue-800 hover:underline block transition-colors'
                  >
                    {sessionName}
                  </Link>
                ) : (
                  <span className='font-medium text-gray-900 block'>
                    {sessionName}
                  </span>
                )}
                {session && (
                  <span className='text-xs text-gray-500 font-mono block mt-0.5'>
                    {session.date}
                  </span>
                )}
              </dd>
            </div>

            <div className='pt-4 border-t border-gray-200/50'>
              <dt className='text-xs text-gray-500 flex items-center gap-2 mb-1'>
                <Calendar className='h-3.5 w-3.5' /> Date Enacted
              </dt>
              <dd className='font-mono text-sm font-medium text-gray-900 pl-5.5'>
                {doc.date_enacted}
              </dd>
            </div>

            <div className='pt-4 border-t border-gray-200/50'>
              <dt className='text-xs text-gray-500 flex items-center gap-2 mb-1'>
                <Activity className='h-3.5 w-3.5' /> Status
              </dt>
              <dd className='pl-5.5 mt-1.5'>
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                    doc.status === 'active'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-gray-100 text-gray-600 border-gray-200'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${doc.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`}
                  ></span>
                  {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                </span>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
