import { Link, useOutletContext, useParams } from 'react-router-dom';

import type {
  DocumentItem,
  LegislationContext,
  Person,
  Session,
} from '@/types';
import { Calendar, CheckCircle2, Gavel, Users, XCircle } from 'lucide-react';

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

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, persons, documents } =
    useOutletContext<LegislationContext>();

  const session = sessions.find((s: Session) => s.id === sessionId);
  if (!session)
    return (
      <div className='p-20 text-center' role='alert'>
        Session not found
      </div>
    );

  const presentMembers = session.present
    .map(id => persons.find((p: Person) => p.id === id))
    .filter((p): p is Person => Boolean(p));

  const absentMembers = session.absent
    .map(id => persons.find((p: Person) => p.id === id))
    .filter((p): p is Person => Boolean(p));

  const relatedDocs = documents.filter(
    (d: DocumentItem) => d.session_id === session.id
  );

  const isRegular = session.type === 'Regular';

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
          <BreadcrumbItem>
            <BreadcrumbPage>{session.ordinal_number} Session</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={`rounded-2xl border border-l-[8px] border-slate-200 bg-white p-6 shadow-sm md:p-10 ${isRegular ? 'border-l-primary-600' : 'border-l-secondary-600'}`}
      >
        <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Badge variant={isRegular ? 'primary' : 'secondary'} dot>
                {session.type} Session
              </Badge>
              <span className='font-mono text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                ID: {session.id}
              </span>
            </div>
            <h1 className='text-2xl font-extrabold text-slate-900 md:text-3xl'>
              {session.ordinal_number} {session.type} Session
            </h1>
          </div>
          <div className='flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4'>
            <Calendar className='text-primary-600 h-5 w-5' />
            <div>
              <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Date Held
              </p>
              <p className='text-sm font-bold text-slate-700'>{session.date}</p>
            </div>
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <aside className='space-y-6'>
          <DetailSection title='Attendance' icon={Users}>
            <div className='space-y-6'>
              <div>
                <h3 className='mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-emerald-600 uppercase'>
                  <CheckCircle2 className='h-3.5 w-3.5' /> Present (
                  {presentMembers.length})
                </h3>
                <ul className='space-y-2'>
                  {presentMembers.map((p: Person) => (
                    <li key={p.id}>
                      <Link
                        to={`/legislation/person/${p.id}`}
                        className='hover:text-primary-600 block py-1 text-sm font-medium text-slate-600 transition-colors'
                      >
                        {getPersonName(p)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {absentMembers.length > 0 && (
                <div className='border-t border-slate-100 pt-4'>
                  <h3 className='text-secondary-600 mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                    <XCircle className='h-3.5 w-3.5' /> Absent (
                    {absentMembers.length})
                  </h3>
                  <ul className='space-y-2'>
                    {absentMembers.map((p: Person) => (
                      <li
                        key={p.id}
                        className='block py-1 text-sm font-medium text-slate-400'
                      >
                        {getPersonName(p)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </DetailSection>
        </aside>

        <div className='lg:col-span-2'>
          <DetailSection title='Legislation Enacted' icon={Gavel}>
            {relatedDocs.length === 0 ? (
              <p className='py-12 text-center text-sm text-slate-400 italic'>
                No documents enacted during this session.
              </p>
            ) : (
              <div className='divide-y divide-slate-100'>
                {relatedDocs.map((doc: DocumentItem) => (
                  <Link
                    key={doc.id}
                    to={`/legislation/${doc.type}/${doc.id}`}
                    className='group -mx-2 block min-h-[44px] rounded-lg px-2 py-4 transition-all hover:bg-slate-50'
                  >
                    <div className='mb-1 flex items-center gap-3'>
                      <Badge
                        variant={
                          doc.type === 'ordinance' ? 'primary' : 'secondary'
                        }
                      >
                        {doc.type}
                      </Badge>
                      <span className='font-mono text-[10px] font-bold text-slate-400 uppercase'>
                        {doc.number}
                      </span>
                    </div>
                    <p className='group-hover:text-primary-600 text-sm leading-relaxed font-bold text-slate-800'>
                      {doc.title}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </DetailSection>
        </div>
      </div>
    </div>
  );
}
