import {
  Link,
  useOutletContext,
  useParams,
  useSearchParams,
} from 'react-router-dom';

/* eslint-disable @typescript-eslint/no-explicit-any */
// Type assertions for extended document properties

import {
  Activity,
  Calendar,
  Download,
  FileText,
  Gavel,
  Hash,
  Landmark,
  Users,
} from 'lucide-react';

import FlagForReviewButton from '@/components/admin/FlagForReviewButton';
import { DetailSection, useBreadcrumbs } from '@/components/layout';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { PageLoadingState } from '@/components/ui';
import { Badge } from '@/components/ui/Badge';

import { getDocTypeBadgeVariant, getPersonName } from '@/lib/openlgu';

import type { LegislationContext, Person } from '@/types/legislationTypes';

export default function LegislationDocument() {
  const { document: urlId } = useParams();
  const { documents, persons, sessions, terms, isLoading } =
    useOutletContext<LegislationContext>();
  const [searchParams] = useSearchParams();

  // Auto-generate breadcrumbs using the hook
  const breadcrumbs = useBreadcrumbs();

  // Build back link with preserved query params
  const queryParams = searchParams.toString();
  const backLink = `/openlgu${queryParams ? `?${queryParams}` : ''}`;

  const doc = documents?.find(d => d.id === urlId);

  if (isLoading) {
    return <PageLoadingState message='Loading document...' />;
  }

  if (!doc)
    return (
      <div className='p-20 text-center' role='alert'>
        <h2 className='text-kapwa-text-strong text-xl font-bold'>
          Document not found
        </h2>
        <Link to={backLink} className='text-kapwa-text-brand hover:underline'>
          Return to Archive
        </Link>
      </div>
    );

  const authors = doc.author_ids
    .map((id: string) => persons.find(p => p.id === id))
    .filter((p): p is Person => Boolean(p));

  // For executive orders, show the mayor as author if no authors listed
  let displayAuthors = authors;
  if (
    doc.type === 'executive_order' &&
    authors.length === 0 &&
    (doc as any).mayor_id
  ) {
    const mayor = persons.find(p => p.id === (doc as any).mayor_id);
    if (mayor) {
      displayAuthors = [mayor];
    }
  }

  const session = doc.session_id
    ? sessions.find(s => s.id === doc.session_id)
    : null;
  const term = terms?.find((t: any) => t.id === (doc as any).term_id);

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-6 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return (
              <div key={crumb.href} className='flex items-center gap-2'>
                {index === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbHome href={crumb.href} />
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{doc.number}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Accessible Header: Dark Text on Light Background with 8px Semantic Border */}
      <header
        className={`border-kapwa-border-weak bg-kapwa-bg-surface rounded-2xl border border-l-8 p-6 shadow-sm md:p-10 ${doc.type === 'ordinance' ? 'border-l-kapwa-border-brand' : doc.type === 'executive_order' ? 'border-l-kapwa-border-warning' : 'border-l-kapwa-border-accent-orange'}`}
        aria-labelledby='doc-title'
      >
        <div className='space-y-4'>
          <div className='flex flex-wrap items-center gap-3'>
            <Badge variant={getDocTypeBadgeVariant(doc.type)}>{doc.type}</Badge>
            <span className='border-kapwa-border-weak bg-kapwa-bg-hover text-kapwa-text-support flex items-center gap-1.5 rounded border px-2.5 py-1 font-mono text-[10px] font-bold tracking-widest uppercase'>
              <Hash className='h-3 w-3' /> {doc.number}
            </span>
          </div>
          <h1
            id='doc-title'
            className='text-kapwa-text-strong text-xl leading-relaxed font-extrabold md:text-2xl'
          >
            {doc.title}
          </h1>
        </div>
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        <div className='space-y-8 lg:col-span-2'>
          <DetailSection title='Authored By' icon={Users}>
            <div className='flex flex-wrap gap-2' role='list'>
              {displayAuthors.length > 0 ? (
                displayAuthors.map(author => (
                  <Link
                    key={author.id}
                    to={`/openlgu/person/${author.id}`}
                    className='hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-brand border-kapwa-border-weak bg-kapwa-bg-surface inline-flex min-h-[44px] items-center gap-3 rounded-full border px-4 py-2 transition-all'
                  >
                    <div
                      className='bg-kapwa-bg-active text-kapwa-text-support flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold'
                      aria-hidden='true'
                    >
                      {author.first_name[0]}
                      {author.last_name[0]}
                    </div>
                    <span className='text-kapwa-text-support text-xs font-bold'>
                      {getPersonName(author)}
                    </span>
                  </Link>
                ))
              ) : (
                <span className='text-kapwa-text-disabled text-sm font-bold italic'>
                  Office of the Mayor
                </span>
              )}
            </div>
          </DetailSection>

          <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex flex-col items-center justify-between gap-6 rounded-2xl border p-6 sm:flex-row'>
            <div className='flex items-center gap-4'>
              <div
                className={`bg-kapwa-bg-surface rounded-xl p-3 shadow-sm ${doc.type === 'ordinance' ? 'text-kapwa-text-brand' : doc.type === 'executive_order' ? 'text-kapwa-yellow-700' : 'text-kapwa-text-accent-orange'}`}
              >
                <FileText className='h-8 w-8' />
              </div>
              <div className='text-center sm:text-left'>
                <p className='text-kapwa-text-strong font-bold'>
                  Official Document
                </p>
                <p className='text-kapwa-text-disabled mt-1 text-[10px] font-bold tracking-widest uppercase'>
                  Portable Document Format
                </p>
              </div>
            </div>
            <a
              href={doc.link}
              target='_blank'
              rel='noreferrer'
              className={`flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl px-8 py-3 text-sm font-bold text-white shadow-md transition-all sm:w-auto ${doc.type === 'ordinance' ? 'bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover' : doc.type === 'executive_order' ? 'bg-kapwa-bg-warning-default hover:bg-kapwa-bg-warning-hover' : 'bg-kapwa-bg-accent-orange-default hover:bg-kapwa-bg-accent-orange-hover'}`}
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
                <dt className='text-kapwa-text-disabled mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                  <Landmark className='h-3.5 w-3.5' /> Legislative Term
                </dt>
                <dd>
                  <Link
                    to={term ? `/openlgu/term/${term.id}` : '#'}
                    className='group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 hover:bg-kapwa-bg-surface block min-h-[44px] rounded-xl border p-3 transition-all'
                  >
                    <span className='group-hover:text-kapwa-text-brand text-kapwa-text-support block text-sm leading-tight font-bold'>
                      {term?.name || '12th Sangguniang Bayan'}
                    </span>
                    <span className='text-kapwa-text-disabled mt-1 block font-mono text-[10px]'>
                      {term?.year_range || '2022-2025'}
                    </span>
                  </Link>
                </dd>
              </div>

              {/* Restored: Session Link */}
              <div className='border-kapwa-border-weak border-t pt-4'>
                <dt className='text-kapwa-text-disabled mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                  <Gavel className='h-3.5 w-3.5' /> Approved During
                </dt>
                <dd>
                  {session ? (
                    <Link
                      to={`/openlgu/session/${session.id}`}
                      className='group hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 hover:bg-kapwa-bg-surface block min-h-[44px] rounded-xl border p-3 transition-all'
                    >
                      <span className='group-hover:text-kapwa-text-brand text-kapwa-text-support block text-sm leading-tight font-bold'>
                        {session.ordinal_number} {session.type} Session
                      </span>
                      <span className='text-kapwa-text-disabled mt-1 block font-mono text-[10px]'>
                        Held on {session.date}
                      </span>
                    </Link>
                  ) : (
                    <span className='text-kapwa-text-disabled text-sm font-bold italic'>
                      No session data linked
                    </span>
                  )}
                </dd>
              </div>

              <div className='border-kapwa-border-weak border-t pt-4'>
                <dt className='text-kapwa-text-disabled mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
                  <Calendar className='h-3.5 w-3.5' /> Enacted Date
                </dt>
                <dd className='text-kapwa-text-support pl-5.5 text-sm font-bold'>
                  {doc.date_enacted}
                </dd>
              </div>

              <div className='border-kapwa-border-weak border-t pt-4'>
                <dt className='text-kapwa-text-disabled mb-2 flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase'>
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

          {/* Flag for Review */}
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised rounded-xl border p-4'>
            <p className='text-kapwa-text-support mb-3 text-xs leading-relaxed'>
              Notice an error with this document? Flag it for review by the
              admin team.
            </p>
            <FlagForReviewButton
              itemType='document'
              itemId={doc.id}
              itemTitle={`${doc.type} ${doc.number}`}
              variant='compact'
            />
          </div>
        </aside>
      </div>
    </div>
  );
}
