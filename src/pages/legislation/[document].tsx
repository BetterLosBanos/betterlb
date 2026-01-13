import { useParams, useOutletContext, Link } from 'react-router-dom';
import {
  FileText,
  Download,
  Users,
  Hash,
  Calendar,
  Activity,
  Landmark,
  Gavel,
  ShieldCheck,
} from 'lucide-react';
import { getPersonName } from '@/lib/legislation';
import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';
import type { LegislationContext, Person } from '@/types/legislationTypes';

export default function LegislationDocument() {
  const { document: urlId } = useParams();
  const { documents, persons, sessions, term } =
    useOutletContext<LegislationContext>();

  const doc = documents?.find(d => d.id === urlId);
  if (!doc)
    return (
      <div className='p-20 text-center' role='alert'>
        <h2 className='text-xl font-bold text-slate-900'>Document not found</h2>
        <Link to='/legislation' className='text-primary-600 hover:underline'>
          Return to Archive
        </Link>
      </div>
    );

  const authors = doc.author_ids
    .map((id: string) => persons.find(p => p.id === id))
    .filter((p): p is Person => Boolean(p));
  const session = sessions.find(s => s.id === doc.session_id);

  const isOrdinance = doc.type === 'ordinance';

  return (
    <div className='mx-auto space-y-6 max-w-5xl duration-500 animate-in fade-in'>
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
          <BreadcrumbPage>{doc.number}</BreadcrumbPage>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Accessible Header: Dark Text on Light Background with 8px Semantic Border */}
      <header
        className={`p-6 md:p-10 rounded-2xl border bg-white shadow-sm border-slate-200 border-l-[8px] ${isOrdinance ? 'border-l-primary-600' : 'border-l-secondary-600'}`}
        aria-labelledby='doc-title'
      >
        <div className='space-y-4'>
          <div className='flex flex-wrap gap-3 items-center'>
            <Badge variant={isOrdinance ? 'primary' : 'warning'}>
              {doc.type}
            </Badge>
            <span className='flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 text-[10px] font-mono font-bold text-slate-600 uppercase tracking-widest border border-slate-200'>
              <Hash className='w-3 h-3' /> {doc.number}
            </span>
          </div>
          <h1
            id='doc-title'
            className='text-xl font-extrabold leading-relaxed md:text-2xl text-slate-900'
          >
            {doc.title}
          </h1>
        </div>
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='space-y-8 lg:col-span-2'>
          <DetailSection title='Authored By' icon={Users}>
            <div className='flex flex-wrap gap-2' role='list'>
              {authors.map(author => (
                <Link
                  key={author.id}
                  to={`/legislation/person/${author.id}`}
                  className='inline-flex items-center gap-3 bg-white border border-slate-200 rounded-full py-2 px-4 hover:border-primary-600 hover:bg-primary-50 transition-all min-h-[44px]'
                >
                  <div
                    className='w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600'
                    aria-hidden='true'
                  >
                    {author.first_name[0]}
                    {author.last_name[0]}
                  </div>
                  <span className='text-xs font-bold text-slate-700'>
                    {getPersonName(author)}
                  </span>
                </Link>
              ))}
            </div>
          </DetailSection>

          <div className='flex flex-col gap-6 justify-between items-center p-6 rounded-2xl border bg-slate-50 border-slate-200 sm:flex-row'>
            <div className='flex gap-4 items-center'>
              <div
                className={`p-3 rounded-xl shadow-sm bg-white ${isOrdinance ? 'text-primary-600' : 'text-secondary-600'}`}
              >
                <FileText className='w-8 h-8' />
              </div>
              <div className='text-center sm:text-left'>
                <p className='font-bold text-slate-900'>Official Document</p>
                <p className='text-[10px] text-slate-400 uppercase font-bold tracking-widest mt-1'>
                  Portable Document Format
                </p>
              </div>
            </div>
            <a
              href={doc.link}
              target='_blank'
              rel='noreferrer'
              className={`w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 min-h-[48px] text-white ${isOrdinance ? 'bg-primary-600 hover:bg-primary-700' : 'bg-secondary-600 hover:bg-secondary-700'}`}
            >
              <Download className='w-4 h-4' /> Download PDF
            </a>
          </div>
        </div>

        <aside className='space-y-6'>
          <DetailSection title='Legislative Context'>
            <dl className='space-y-6'>
              {/* Restored: Term Link */}
              <div>
                <dt className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Landmark className='h-3.5 w-3.5' /> Legislative Term
                </dt>
                <dd>
                  <Link
                    to={term ? `/legislation/term/${term.id}` : '#'}
                    className='group block p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary-300 hover:bg-white transition-all min-h-[44px]'
                  >
                    <span className='block text-sm font-bold leading-tight text-slate-700 group-hover:text-primary-600'>
                      {term?.name || '12th Sangguniang Bayan'}
                    </span>
                    <span className='text-[10px] text-slate-400 font-mono mt-1 block'>
                      {term?.year_range || '2022-2025'}
                    </span>
                  </Link>
                </dd>
              </div>

              {/* Restored: Session Link */}
              <div className='pt-4 border-t border-slate-100'>
                <dt className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Gavel className='h-3.5 w-3.5' /> Approved During
                </dt>
                <dd>
                  {session ? (
                    <Link
                      to={`/legislation/session/${session.id}`}
                      className='group block p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:border-primary-300 hover:bg-white transition-all min-h-[44px]'
                    >
                      <span className='block text-sm font-bold leading-tight text-slate-700 group-hover:text-primary-600'>
                        {session.ordinal_number} {session.type} Session
                      </span>
                      <span className='text-[10px] text-slate-400 font-mono mt-1 block'>
                        Held on {session.date}
                      </span>
                    </Link>
                  ) : (
                    <span className='text-sm italic font-bold text-slate-400'>
                      No session data linked
                    </span>
                  )}
                </dd>
              </div>

              <div className='pt-4 border-t border-slate-100'>
                <dt className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Calendar className='h-3.5 w-3.5' /> Enacted Date
                </dt>
                <dd className='text-sm font-bold text-slate-700 pl-5.5'>
                  {doc.date_enacted}
                </dd>
              </div>

              <div className='pt-4 border-t border-slate-100'>
                <dt className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2'>
                  <Activity className='h-3.5 w-3.5' /> Status
                </dt>
                <dd className='pl-5.5 mt-1'>
                  <Badge
                    variant={doc.status === 'active' ? 'success' : 'slate'}
                    dot
                  >
                    {doc.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </DetailSection>

          {/* Accessibility Trust Block */}
          <div className='p-4 rounded-xl border bg-primary-50 border-primary-100'>
            <div className='flex gap-3'>
              <ShieldCheck className='w-5 h-5 text-primary-600 shrink-0' />
              <p className='text-[11px] text-primary-700 leading-relaxed'>
                This document is an official digital mirror of the municipal
                archives. For certified physical copies, please visit the
                Sangguniang Bayan Office.
              </p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
