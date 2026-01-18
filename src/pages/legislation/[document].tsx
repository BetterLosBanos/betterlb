import { Link, useOutletContext, useParams } from 'react-router-dom';

import {
  Activity,
  Calendar,
  Download,
  FileText,
  Gavel,
  Hash,
  Landmark,
  ShieldCheck,
  Users,
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

import { getPersonName } from '@/lib/legislation';

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
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-6 duration-500'>
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
        className={`rounded-2xl border border-l-[8px] border-slate-200 bg-white p-6 shadow-sm md:p-10 ${isOrdinance ? 'border-l-primary-600' : 'border-l-secondary-600'}`}
        aria-labelledby='doc-title'
      >
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <Badge variant={isOrdinance ? 'primary' : 'warning'}>
              {doc.type}
            </Badge>
            <span className='flex items-center gap-1.5 rounded border border-slate-200 bg-slate-100 px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest text-slate-600 uppercase'>
              <Hash className='h-3 w-3' /> {doc.number}
            </span>
          </div>
          <h1
            id='doc-title'
            className='text-xl leading-relaxed font-extrabold text-slate-900 md:text-2xl'
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
                  className='hover:border-primary-600 hover:bg-primary-50 inline-flex min-h-[44px] items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 transition-all'
                >
                  <div
                    className='flex h-6 w-6 items-center justify-center rounded-full bg-slate-200 text-[10px] font-bold text-slate-600'
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

          <div className='flex flex-col items-center justify-between gap-6 rounded-2xl border border-slate-200 bg-slate-50 p-6 sm:flex-row'>
            <div className='flex items-center gap-4'>
              <div
                className={`rounded-xl bg-white p-3 shadow-sm ${isOrdinance ? 'text-primary-600' : 'text-secondary-600'}`}
              >
                <FileText className='h-8 w-8' />
              </div>
              <div className='text-center sm:text-left'>
                <p className='font-bold text-slate-900'>Official Document</p>
                <p className='mt-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                  Portable Document Format
                </p>
              </div>
            </div>
            <a
              href={doc.link}
              target='_blank'
              rel='noreferrer'
              className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-md transition-all sm:w-auto ${isOrdinance ? 'bg-primary-600 hover:bg-primary-700' : 'bg-secondary-600 hover:bg-secondary-700'}`}
            >
              <Download className='h-4 w-4' /> Download PDF
            </a>
          </div>
        </div>

        <aside className='space-y-6'>
          <DetailSection title='Legislative Context'>
            <dl className='space-y-6'>
              {/* Restored: Term Link */}
              <div>
                <dt className='mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                  <Landmark className='h-3.5 w-3.5' /> Legislative Term
                </dt>
                <dd>
                  <Link
                    to={term ? `/legislation/term/${term.id}` : '#'}
                    className='group hover:border-primary-300 block min-h-[44px] rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-white'
                  >
                    <span className='group-hover:text-primary-600 block text-sm leading-tight font-bold text-slate-700'>
                      {term?.name || '12th Sangguniang Bayan'}
                    </span>
                    <span className='mt-1 block font-mono text-[10px] text-slate-400'>
                      {term?.year_range || '2022-2025'}
                    </span>
                  </Link>
                </dd>
              </div>

              {/* Restored: Session Link */}
              <div className='border-t border-slate-100 pt-4'>
                <dt className='mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                  <Gavel className='h-3.5 w-3.5' /> Approved During
                </dt>
                <dd>
                  {session ? (
                    <Link
                      to={`/legislation/session/${session.id}`}
                      className='group hover:border-primary-300 block min-h-[44px] rounded-xl border border-slate-100 bg-slate-50/50 p-3 transition-all hover:bg-white'
                    >
                      <span className='group-hover:text-primary-600 block text-sm leading-tight font-bold text-slate-700'>
                        {session.ordinal_number} {session.type} Session
                      </span>
                      <span className='mt-1 block font-mono text-[10px] text-slate-400'>
                        Held on {session.date}
                      </span>
                    </Link>
                  ) : (
                    <span className='text-sm font-bold text-slate-400 italic'>
                      No session data linked
                    </span>
                  )}
                </dd>
              </div>

              <div className='border-t border-slate-100 pt-4'>
                <dt className='mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                  <Calendar className='h-3.5 w-3.5' /> Enacted Date
                </dt>
                <dd className='pl-5.5 text-sm font-bold text-slate-700'>
                  {doc.date_enacted}
                </dd>
              </div>

              <div className='border-t border-slate-100 pt-4'>
                <dt className='mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                  <Activity className='h-3.5 w-3.5' /> Status
                </dt>
                <dd className='mt-1 pl-5.5'>
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
          <div className='bg-primary-50 border-primary-100 rounded-xl border p-4'>
            <div className='flex gap-3'>
              <ShieldCheck className='text-primary-600 h-5 w-5 shrink-0' />
              <p className='text-primary-700 text-[11px] leading-relaxed'>
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
