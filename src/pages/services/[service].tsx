import { Link, useParams } from 'react-router-dom';

import { format, isValid } from 'date-fns';
import {
  AlertCircle,
  ArrowRight,
  Banknote,
  BookOpen,
  Building2,
  Calendar,
  CalendarCheck,
  CheckCircle2Icon,
  ClipboardList,
  Clock,
  Edit3,
  ExternalLink,
  FileText,
  HeartHandshake,
  LinkIcon,
  LucideIcon,
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

import { toTitleCase } from '@/lib/stringUtils';

import departmentsData from '@/data/directory/departments.json';
import servicesData from '@/data/services/services.json';

import type { QuickInfo, Service, Source } from '@/types/servicesTypes';

const QUICK_INFO_CONFIG: Record<
  keyof QuickInfo,
  { label: string; icon: LucideIcon }
> = {
  processingTime: { label: 'Processing Time', icon: Clock },
  fee: { label: 'Fee', icon: Banknote },
  whoCanApply: { label: 'Who Can Apply', icon: Users },
  appointmentType: { label: 'Appointment Type', icon: Calendar },
  validity: { label: 'Validity Period', icon: CalendarCheck },
  documents: { label: 'Documents Required', icon: FileText },
};

export default function ServiceDetail() {
  const { service: serviceSlug } = useParams<{ service: string }>();
  if (!serviceSlug) return null;

  const service = (servicesData as Service[]).find(
    s => s.slug === decodeURIComponent(serviceSlug)
  );
  if (!service)
    return (
      <div className='text-kapwa-text-disabled p-20 text-center font-bold tracking-widest uppercase'>
        Service not found
      </div>
    );

  const officeSlugs = Array.isArray(service.officeSlug)
    ? service.officeSlug
    : [service.officeSlug].filter(Boolean);

  const involvedOffices = departmentsData.filter(d =>
    officeSlugs.includes(d.slug)
  );
  const isTransaction = service.type === 'transaction';
  const updatedAtDate = service.updatedAt ? new Date(service.updatedAt) : null;
  const isVerified = updatedAtDate !== null && isValid(updatedAtDate);

  const quickInfoArray = service.quickInfo
    ? (Object.entries(service.quickInfo) as [keyof QuickInfo, string][]).map(
        ([key, value]) => ({
          label: QUICK_INFO_CONFIG[key]?.label || key,
          icon: QUICK_INFO_CONFIG[key]?.icon || FileText,
          value,
        })
      )
    : [];

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/services'>Services</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{service.service}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* HEADER */}
      <header
        className={`relative overflow-hidden rounded-3xl p-8 text-white shadow-xl transition-colors duration-500 md:p-12 ${
          isTransaction ? 'bg-kapwa-bg-surface-bold' : 'bg-kapwa-bg-brand-bold'
        }`}
      >
        <div className='relative z-10 max-w-3xl'>
          <div className='mb-6 flex flex-wrap items-center gap-2'>
            <Badge variant='primary'>{service.category.name}</Badge>
            <Badge variant={isTransaction ? 'success' : 'secondary'} dot>
              {isTransaction ? 'Transactional' : 'Resource'}
            </Badge>
            <Badge variant={isVerified ? 'success' : 'slate'} dot={!isVerified}>
              {isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>

          <h1 className='mb-6 text-3xl leading-tight font-extrabold tracking-tight md:text-5xl'>
            {service.service}
          </h1>

          {service.description && (
            <p className='text-kapwa-text-support mb-8 max-w-2xl text-lg leading-relaxed italic'>
              &quot;{service.description}&quot;
            </p>
          )}

          {/* SINGLE PRIMARY ACTION */}
          {service.url && (
            <a
              href={service.url}
              target='_blank'
              rel='noreferrer'
              className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-weak group text-kapwa-text-inverse inline-flex min-h-[48px] items-center gap-3 rounded-2xl px-8 py-4 font-bold shadow-lg transition-all'
            >
              {isTransaction ? 'Access Online Portal' : 'View Full Document'}
              <ExternalLink className='h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
            </a>
          )}
        </div>
        <ShieldCheck
          className='text-kapwa-text-inverse/5 absolute right-[-20px] bottom-[-20px] h-64 w-64 -rotate-12'
          aria-hidden='true'
        />
      </header>

      {/* --- CONTENT AREA --- */}
      <div className='flex flex-col gap-8 xl:flex-row'>
        <div className='min-w-0 flex-1 space-y-8'>
          {/* Quick Info Grid - Moved here to keep Hero Header cleaner */}
          {isTransaction && quickInfoArray.length > 0 && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              {quickInfoArray.map((info, idx) => (
                <div
                  key={idx}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-3 rounded-2xl border p-4 shadow-xs'
                >
                  <div className='text-kapwa-text-brand bg-kapwa-bg-surface-raised shrink-0 rounded-lg p-2'>
                    <info.icon className='h-4 w-4' />
                  </div>
                  <div>
                    <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                      {info.label}
                    </p>
                    <p className='text-kapwa-text-strong text-xs font-bold'>
                      {info.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {service.steps && service.steps.length > 0 && (
            <DetailSection
              title={isTransaction ? 'Process Steps' : 'Information Details'}
              icon={ClipboardList}
            >
              <div className='space-y-6'>
                {service.steps.map((step, idx) => (
                  <div key={idx} className='group flex gap-4'>
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border text-sm font-bold transition-colors ${
                        isTransaction
                          ? 'bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand'
                          : 'text-kapwa-text-accent-orange bg-kapwa-bg-accent-orange-weak border-kapwa-border-weak'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className='text-kapwa-text-support pt-1 text-sm leading-relaxed md:text-base'>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Sources and References */}
          {service.sources && service.sources.length > 0 && (
            <DetailSection title='Sources & References' icon={BookOpen}>
              <ul className='grid grid-cols-1 gap-3' role='list'>
                {service.sources.map((source: Source, idx: number) => (
                  <li
                    key={idx}
                    className='hover:border-kapwa-border-brand group border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-start gap-3 rounded-xl border p-4 transition-all'
                  >
                    <div className='group-hover:text-kapwa-text-brand bg-kapwa-bg-surface text-kapwa-text-disabled rounded-lg p-2 shadow-sm'>
                      <LinkIcon className='h-3.5 w-3.5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-kapwa-text-disabled mb-1 text-[10px] font-bold tracking-widest uppercase'>
                        Reference
                      </p>
                      {source.url ? (
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-kapwa-text-brand inline-flex items-center gap-1.5 text-sm font-bold hover:underline'
                        >
                          {source.name} <ExternalLink className='h-3 w-3' />
                        </a>
                      ) : (
                        <span className='text-kapwa-text-support text-sm font-bold'>
                          {source.name}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </DetailSection>
          )}
        </div>

        {/* --- SIDEBAR --- */}
        <aside className='w-full space-y-6 xl:w-80'>
          {/* Data Integrity Card */}
          <div
            className={`flex flex-col gap-3 rounded-2xl border p-5 transition-colors ${isVerified ? 'border-kapwa-border-success bg-kapwa-bg-success-weak/30' : 'border-kapwa-border-weak bg-kapwa-bg-surface'}`}
          >
            <div className='flex items-center justify-between'>
              <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Data Integrity
              </p>
              {isVerified ? (
                <CheckCircle2Icon className='h-4 w-4 text-kapwa-text-success' />
              ) : (
                <AlertCircle className='text-kapwa-text-support h-4 w-4' />
              )}
            </div>
            <div className='flex items-center gap-3'>
              <Clock
                className={`h-5 w-5 ${isVerified ? 'text-kapwa-text-success' : 'text-kapwa-text-support'}`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${isVerified ? 'text-kapwa-text-strong' : 'text-kapwa-text-strong0'}`}
                >
                  {isVerified ? 'Verified Information' : 'Unverified Data'}
                </p>
                <p className='text-kapwa-text-disabled text-[11px] font-medium'>
                  {isVerified
                    ? `Last Audit: ${format(updatedAtDate!, 'MMMM yyyy')}`
                    : 'Awaiting official verification'}
                </p>
              </div>
            </div>
          </div>

          {/* Involved Offices */}
          {involvedOffices.length > 0 && (
            <DetailSection title='Responsible Offices' icon={Building2}>
              <div className='space-y-6'>
                {involvedOffices.map((off, idx) => (
                  <div
                    key={off.slug}
                    className={
                      idx > 0 ? 'border-t border-kapwa-border-weak pt-5' : ''
                    }
                  >
                    <Link
                      to={`/government/departments/${off.slug}`}
                      className='group block'
                    >
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong leading-tight font-bold transition-colors'>
                        {toTitleCase(off.office_name)}
                      </h3>
                      <span className='text-kapwa-text-brand mt-2 flex items-center gap-1 text-[10px] font-bold tracking-widest uppercase'>
                        View Profile{' '}
                        <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* SUGGEST AN EDIT - NEW PLACEMENT & STYLE */}
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface space-y-4 rounded-2xl border p-6 shadow-sm'>
            <div className='flex items-center gap-3'>
              <div className='bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange rounded-lg p-2'>
                <HeartHandshake className='h-5 w-5' />
              </div>
              <h4 className='text-kapwa-text-strong text-sm leading-tight font-bold'>
                Help improve this data
              </h4>
            </div>
            <p className='text-kapwa-text-disabled text-xs leading-relaxed'>
              Find an error or outdated info? Our community helps keep this
              portal accurate.
            </p>
            <Link
              to={`/contribute?edit=${service.slug}`}
              className='group border-kapwa-border-weak text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised flex min-h-[44px] w-full items-center justify-center gap-2 rounded-xl border-2 px-4 py-2.5 text-xs font-bold transition-all'
            >
              <Edit3 className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-disabled h-3.5 w-3.5 transition-colors' />
              Suggest an Edit
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
