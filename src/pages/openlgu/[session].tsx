import { Link, useOutletContext, useParams } from 'react-router-dom';

import type {
  DocumentItem,
  LegislationContext,
  Person,
  Session,
} from '@/types';
import {
  Calendar,
  CheckCircle2,
  Gavel,
  ScrollText,
  Users,
  XCircle,
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
import { EmptyState, PageLoadingState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

import { getDocTypeBadgeVariant, getPersonName } from '@/lib/openlgu';

export default function SessionDetail() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { sessions, persons, documents, isLoading } =
    useOutletContext<LegislationContext>();

  const session = sessions.find((s: Session) => s.id === sessionId);

  if (isLoading) {
    return <PageLoadingState message='Loading session...' />;
  }

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
    (d: DocumentItem) => d.session_id && d.session_id === session.id
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
            <BreadcrumbLink href='/openlgu'>OpenLGU</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{session.ordinal_number} Session</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <header
        className={`border-kapwa-border-weak bg-kapwa-bg-surface rounded-2xl border border-l-8 p-6 shadow-sm md:p-10 ${isRegular ? 'border-l-kapwa-border-brand' : 'border-l-kapwa-border-accent-orange'}`}
      >
        <div className='flex flex-col justify-between gap-6 md:flex-row md:items-center'>
          <div className='space-y-4'>
            <div className='flex items-center gap-3'>
              <Badge variant={isRegular ? 'primary' : 'secondary'} dot>
                {session.type} Session
              </Badge>
              <span className='text-kapwa-text-disabled font-mono text-[10px] font-bold tracking-widest uppercase'>
                ID: {session.id}
              </span>
            </div>
            <h1 className='text-kapwa-text-strong kapwa-heading-xl font-extrabold'>
              {session.ordinal_number} {session.type} Session
            </h1>
          </div>
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex items-center gap-4 rounded-xl border p-4'>
            <Calendar className='text-kapwa-text-brand h-5 w-5' />
            <div>
              <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Date Held
              </p>
              <p className='text-kapwa-text-support text-sm font-bold'>
                {session.date}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <aside className='space-y-6'>
          <DetailSection title='Attendance' icon={Users}>
            {presentMembers.length === 0 && absentMembers.length === 0 ? (
              <EmptyState
                title='No Attendance Records'
                message='No attendance data is available for this session.'
                icon={Users}
              />
            ) : (
              <div className='space-y-6'>
                <div>
                  <h3 className='mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest text-kapwa-text-success uppercase'>
                    <CheckCircle2 className='h-3.5 w-3.5' /> Present (
                    {presentMembers.length})
                  </h3>
                  <ul className='space-y-2'>
                    {presentMembers.map((p: Person) => (
                      <li key={p.id}>
                        <Link
                          to={`/openlgu/person/${p.id}`}
                          className='hover:text-kapwa-text-brand text-kapwa-text-support block py-1 text-sm font-medium transition-colors'
                        >
                          {getPersonName(p)}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {absentMembers.length > 0 && (
                  <div className='border-kapwa-border-weak border-t pt-4'>
                    <h3 className='text-kapwa-text-accent-orange mb-3 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                      <XCircle className='h-3.5 w-3.5' /> Absent (
                      {absentMembers.length})
                    </h3>
                    <ul className='space-y-2'>
                      {absentMembers.map((p: Person) => (
                        <li
                          key={p.id}
                          className='text-kapwa-text-disabled block py-1 text-sm font-medium'
                        >
                          {getPersonName(p)}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </DetailSection>
        </aside>

        <div className='lg:col-span-2'>
          <DetailSection title='Legislation Enacted' icon={Gavel}>
            {relatedDocs.length === 0 ? (
              <EmptyState
                title='No Documents Enacted'
                message='No documents were enacted during this session.'
                icon={ScrollText}
              />
            ) : (
              <div className='divide-y divide-slate-100'>
                {relatedDocs.map((doc: DocumentItem) => (
                  <Link
                    key={doc.id}
                    to={`/openlgu/documents/${doc.id}`}
                    className='group hover:bg-kapwa-bg-surface-raised -mx-2 block min-h-[44px] rounded-lg px-2 py-4 transition-all'
                  >
                    <div className='mb-1 flex items-center gap-3'>
                      <Badge variant={getDocTypeBadgeVariant(doc.type)}>
                        {doc.type}
                      </Badge>
                      <span className='text-kapwa-text-disabled font-mono text-[10px] font-bold uppercase'>
                        {doc.number}
                      </span>
                    </div>
                    <p className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-sm leading-relaxed font-bold'>
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
