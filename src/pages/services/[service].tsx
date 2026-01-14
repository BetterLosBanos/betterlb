import { useParams, Link } from 'react-router-dom';
import { format, isValid } from 'date-fns';
import {
  CheckCircle2Icon,
  ExternalLink,
  Clock,
  Banknote,
  Users,
  Calendar,
  FileText,
  CalendarCheck,
  ClipboardList,
  Building2,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  BookOpen,
  LinkIcon,
  LucideIcon,
  Edit3,
  HeartHandshake,
} from 'lucide-react';

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

import servicesData from '@/data/services/services.json';
import departmentsData from '@/data/directory/departments.json';
import type { Service, Source, QuickInfo } from '@/types/servicesTypes';
import { toTitleCase } from '@/lib/stringUtils';

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
      <div className='p-20 font-bold tracking-widest text-center uppercase text-slate-500'>
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
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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

      {/* --- REFINED HEADER --- */}
      <header
        className={`relative p-8 md:p-12 rounded-3xl text-white overflow-hidden shadow-xl transition-colors duration-500 ${
          isTransaction ? 'bg-slate-900' : 'bg-primary-900'
        }`}
      >
        <div className='relative z-10 max-w-3xl'>
          <div className='flex flex-wrap gap-2 items-center mb-6'>
            <Badge variant='primary'>{service.category.name}</Badge>
            <Badge variant={isTransaction ? 'success' : 'secondary'} dot>
              {isTransaction ? 'Transactional' : 'Resource'}
            </Badge>
            <Badge variant={isVerified ? 'success' : 'slate'} dot={!isVerified}>
              {isVerified ? 'Verified' : 'Unverified'}
            </Badge>
          </div>

          <h1 className='mb-6 text-3xl font-extrabold tracking-tight leading-tight md:text-5xl'>
            {service.service}
          </h1>

          {service.description && (
            <p className='mb-8 max-w-2xl text-lg italic leading-relaxed text-slate-300'>
              &quot;{service.description}&quot;
            </p>
          )}

          {/* SINGLE PRIMARY ACTION */}
          {service.url && (
            <a
              href={service.url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex gap-3 items-center px-8 py-4 font-bold text-white rounded-2xl shadow-lg transition-all bg-primary-600 hover:bg-primary-500 group min-h-[48px]'
            >
              {isTransaction ? 'Access Online Portal' : 'View Full Document'}
              <ExternalLink className='w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
            </a>
          )}
        </div>
        <ShieldCheck
          className='absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12'
          aria-hidden='true'
        />
      </header>

      {/* --- CONTENT AREA --- */}
      <div className='flex flex-col gap-8 xl:flex-row'>
        <div className='flex-1 space-y-8 min-w-0'>
          {/* Quick Info Grid - Moved here to keep Hero Header cleaner */}
          {isTransaction && quickInfoArray.length > 0 && (
            <div className='grid grid-cols-2 gap-3 md:grid-cols-3'>
              {quickInfoArray.map((info, idx) => (
                <div
                  key={idx}
                  className='flex gap-3 items-start p-4 bg-white rounded-2xl border border-slate-100 shadow-xs'
                >
                  <div className='p-2 rounded-lg bg-slate-50 text-primary-600 shrink-0'>
                    <info.icon className='w-4 h-4' />
                  </div>
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                      {info.label}
                    </p>
                    <p className='text-xs font-bold text-slate-900'>
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
                  <div key={idx} className='flex gap-4 group'>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors ${
                        isTransaction
                          ? 'bg-primary-50 text-primary-600 border-primary-100'
                          : 'text-secondary-600 bg-secondary-50 border-secondary-100'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className='pt-1 text-sm leading-relaxed text-slate-700 md:text-base'>
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
                    className='flex gap-3 items-start p-4 rounded-xl border transition-all border-slate-100 hover:border-primary-100 group bg-slate-50/50'
                  >
                    <div className='p-2 bg-white rounded-lg shadow-sm text-slate-400 group-hover:text-primary-600'>
                      <LinkIcon className='w-3.5 h-3.5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1'>
                        Reference
                      </p>
                      {source.url ? (
                        <a
                          href={source.url}
                          target='_blank'
                          rel='noreferrer'
                          className='text-sm font-bold text-primary-600 hover:underline inline-flex items-center gap-1.5'
                        >
                          {source.name} <ExternalLink className='w-3 h-3' />
                        </a>
                      ) : (
                        <span className='text-sm font-bold text-slate-700'>
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
        <aside className='space-y-6 w-full xl:w-80'>
          {/* Data Integrity Card */}
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 transition-colors ${isVerified ? 'border-emerald-100 bg-emerald-50/30' : 'bg-slate-50 border-slate-200'}`}
          >
            <div className='flex justify-between items-center'>
              <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                Data Integrity
              </p>
              {isVerified ? (
                <CheckCircle2Icon className='w-4 h-4 text-emerald-500' />
              ) : (
                <AlertCircle className='w-4 h-4 text-slate-300' />
              )}
            </div>
            <div className='flex gap-3 items-center'>
              <Clock
                className={`w-5 h-5 ${isVerified ? 'text-emerald-600' : 'text-slate-300'}`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${isVerified ? 'text-emerald-900' : 'text-slate-500'}`}
                >
                  {isVerified ? 'Verified Information' : 'Unverified Data'}
                </p>
                <p className='text-[11px] text-slate-400 font-medium'>
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
                    className={idx > 0 ? 'pt-5 border-t border-slate-100' : ''}
                  >
                    <Link
                      to={`/government/departments/${off.slug}`}
                      className='block group'
                    >
                      <h3 className='font-bold leading-tight transition-colors text-slate-900 group-hover:text-primary-600'>
                        {toTitleCase(off.office_name)}
                      </h3>
                      <span className='text-[10px] font-bold text-primary-600 uppercase tracking-widest flex items-center gap-1 mt-2'>
                        View Profile{' '}
                        <ArrowRight className='w-3 h-3 transition-transform group-hover:translate-x-1' />
                      </span>
                    </Link>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* SUGGEST AN EDIT - NEW PLACEMENT & STYLE */}
          <div className='p-6 space-y-4 bg-white rounded-2xl border shadow-sm border-slate-200'>
            <div className='flex gap-3 items-center'>
              <div className='p-2 rounded-lg bg-secondary-50 text-secondary-600'>
                <HeartHandshake className='w-5 h-5' />
              </div>
              <h4 className='text-sm font-bold leading-tight text-slate-900'>
                Help improve this data
              </h4>
            </div>
            <p className='text-xs leading-relaxed text-slate-500'>
              Find an error or outdated info? Our community helps keep this
              portal accurate.
            </p>
            <Link
              to={`/contribute?edit=${service.slug}`}
              className='flex items-center justify-center w-full gap-2 px-4 py-2.5 text-xs font-bold transition-all border-2 border-slate-100 rounded-xl text-slate-600 hover:bg-slate-50 hover:border-slate-200 min-h-[44px] group'
            >
              <Edit3 className='w-3.5 h-3.5 text-slate-400 group-hover:text-secondary-600 transition-colors' />
              Suggest an Edit
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
