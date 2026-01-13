import { useParams, useOutletContext, Link } from 'react-router-dom';
import { Calendar, Users, CheckCircle2, XCircle, Gavel } from 'lucide-react';
import { getPersonName } from '@/lib/legislation';
import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import type {
  LegislationContext,
  Person,
  DocumentItem,
  Session,
} from '@/types';

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
          <BreadcrumbItem>
            <BreadcrumbPage>{session.ordinal_number} Session</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={`p-6 md:p-10 rounded-2xl border bg-white shadow-sm border-slate-200 border-l-[8px] ${isRegular ? 'border-l-primary-600' : 'border-l-secondary-600'}`}
      >
        <div className='flex flex-col gap-6 justify-between md:flex-row md:items-center'>
          <div className='space-y-4'>
            <div className='flex gap-3 items-center'>
              <Badge variant={isRegular ? 'primary' : 'secondary'} dot>
                {session.type} Session
              </Badge>
              <span className='text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest'>
                ID: {session.id}
              </span>
            </div>
            <h1 className='text-2xl font-extrabold md:text-3xl text-slate-900'>
              {session.ordinal_number} {session.type} Session
            </h1>
          </div>
          <div className='flex gap-4 items-center p-4 rounded-xl border bg-slate-50 border-slate-100'>
            <Calendar className='w-5 h-5 text-primary-600' />
            <div>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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
                <h3 className='text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-3 flex items-center gap-2'>
                  <CheckCircle2 className='w-3.5 h-3.5' /> Present (
                  {presentMembers.length})
                </h3>
                <ul className='space-y-2'>
                  {presentMembers.map((p: Person) => (
                    <li key={p.id}>
                      <Link
                        to={`/legislation/person/${p.id}`}
                        className='block py-1 text-sm font-medium transition-colors text-slate-600 hover:text-primary-600'
                      >
                        {getPersonName(p)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              {absentMembers.length > 0 && (
                <div className='pt-4 border-t border-slate-100'>
                  <h3 className='text-[10px] font-bold text-secondary-600 uppercase tracking-widest mb-3 flex items-center gap-2'>
                    <XCircle className='w-3.5 h-3.5' /> Absent (
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
              <p className='py-12 text-sm italic text-center text-slate-400'>
                No documents enacted during this session.
              </p>
            ) : (
              <div className='divide-y divide-slate-100'>
                {relatedDocs.map((doc: DocumentItem) => (
                  <Link
                    key={doc.id}
                    to={`/legislation/${doc.type}/${doc.id}`}
                    className='group block py-4 hover:bg-slate-50 transition-all rounded-lg px-2 -mx-2 min-h-[44px]'
                  >
                    <div className='flex gap-3 items-center mb-1'>
                      <Badge
                        variant={
                          doc.type === 'ordinance' ? 'primary' : 'secondary'
                        }
                      >
                        {doc.type}
                      </Badge>
                      <span className='text-[10px] font-mono font-bold text-slate-400 uppercase'>
                        {doc.number}
                      </span>
                    </div>
                    <p className='text-sm font-bold leading-relaxed text-slate-800 group-hover:text-primary-600'>
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
