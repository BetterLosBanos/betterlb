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
  InfoIcon,
  BookOpen,
  LinkIcon,
  LucideIcon,
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

// Strongly typed QuickInfo config
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
    return <div className='p-20 text-center'>Service not found</div>;

  const office = departmentsData.find(d => d.slug === service.officeSlug);
  const isTransaction = service.type === 'transaction';

  // Verification Logic
  const updatedAtDate = service.updatedAt ? new Date(service.updatedAt) : null;
  const isVerified = updatedAtDate !== null && isValid(updatedAtDate);

  // Map quickInfo entries safely
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

      {/* Header */}
      <header
        className={`relative p-8 md:p-12 rounded-3xl text-white overflow-hidden shadow-xl transition-colors duration-500 ${
          isTransaction ? 'bg-slate-900' : 'bg-indigo-950'
        }`}
      >
        <div className='relative z-10 max-w-3xl'>
          <div className='flex flex-wrap gap-2 items-center mb-6'>
            <Badge variant='primary'>{service.category.name}</Badge>
            <Badge variant={isTransaction ? 'success' : 'secondary'} dot>
              {isTransaction ? 'Transactional' : 'Resource'}
            </Badge>
            <Badge variant={isVerified ? 'success' : 'slate'}>
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

          {service.url && (
            <a
              href={service.url}
              target='_blank'
              rel='noreferrer'
              className='inline-flex gap-3 items-center px-8 py-4 font-bold text-white rounded-2xl shadow-lg transition-all bg-primary-600 hover:bg-primary-500 group'
            >
              {isTransaction ? 'Access Online Portal' : 'View Full Document'}
              <ExternalLink className='w-5 h-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1' />
            </a>
          )}
        </div>
        <ShieldCheck className='absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12' />
      </header>

      {/* Quick Info Grid */}
      {isTransaction && quickInfoArray.length > 0 && (
        <div className='grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6'>
          {quickInfoArray.map((info, idx) => (
            <div
              key={idx}
              className='flex flex-col items-center p-4 text-center bg-white rounded-2xl border border-gray-100 shadow-xs'
            >
              <div className='p-2 mb-2 bg-gray-50 rounded-xl text-primary-600'>
                <info.icon className='w-4 h-4' />
              </div>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 leading-none'>
                {info.label}
              </p>
              <p className='text-xs font-bold leading-tight text-gray-900'>
                {info.value}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className='flex flex-col gap-8 xl:flex-row'>
        <div className='flex-1 space-y-8 min-w-0'>
          {/* Steps */}
          {service.steps && service.steps.length > 0 && (
            <DetailSection
              title={isTransaction ? 'Process Steps' : 'Detailed Information'}
              icon={isTransaction ? ClipboardList : InfoIcon}
            >
              <div className='space-y-6'>
                {service.steps.map((step, idx) => (
                  <div key={idx} className='flex gap-4 group'>
                    <div
                      className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border transition-colors ${
                        isTransaction
                          ? 'bg-primary-50 text-primary-600 border-primary-100 group-hover:bg-primary-600 group-hover:text-white'
                          : 'text-indigo-600 bg-indigo-50 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white'
                      }`}
                    >
                      {idx + 1}
                    </div>
                    <p className='pt-1 text-sm leading-relaxed text-gray-700 md:text-base'>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Sources */}
          {service.sources && service.sources.length > 0 && (
            <DetailSection title='Sources & References' icon={BookOpen}>
              <ul className='grid grid-cols-1 gap-3'>
                {service.sources.map((source: Source, idx: number) => (
                  <li
                    key={idx}
                    className='flex gap-3 items-start p-4 rounded-xl border border-gray-100 transition-all hover:border-primary-100 hover:bg-primary-50/10 group'
                  >
                    <div className='p-2 text-gray-400 bg-gray-50 rounded-lg transition-colors group-hover:text-primary-600'>
                      <LinkIcon className='w-3.5 h-3.5' />
                    </div>
                    <div className='flex flex-col'>
                      <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1'>
                        Official Reference
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
                        <span className='text-sm font-bold text-gray-700'>
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

        {/* Sidebar */}
        <aside className='space-y-6 w-full xl:w-80'>
          <div
            className={`p-5 rounded-2xl border flex flex-col gap-3 ${
              isVerified
                ? 'border-emerald-100 bg-emerald-50/30'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className='flex justify-between items-center'>
              <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest'>
                Audit Status
              </p>
              {isVerified ? (
                <CheckCircle2Icon className='w-4 h-4 text-emerald-500' />
              ) : (
                <AlertCircle className='w-4 h-4 text-gray-300' />
              )}
            </div>
            <div className='flex gap-3 items-center'>
              <Clock
                className={`w-5 h-5 ${isVerified ? 'text-emerald-600' : 'text-gray-300'}`}
              />
              <div>
                <p
                  className={`text-sm font-bold ${isVerified ? 'text-emerald-900' : 'text-gray-500'}`}
                >
                  {isVerified ? 'Verified Data' : 'Unverified'}
                </p>
                <p className='text-[11px] text-gray-400'>
                  {isVerified
                    ? `Updated ${format(updatedAtDate!, 'MMM yyyy')}`
                    : 'Audit pending'}
                </p>
              </div>
            </div>
          </div>

          {office && (
            <DetailSection title='Responsible Office' icon={Building2}>
              <Link
                to={`/government/departments/${office.slug}`}
                className='block mb-4 group'
              >
                <h3 className='mb-2 font-bold leading-tight text-gray-900 transition-colors group-hover:text-primary-600'>
                  {office.office_name}
                </h3>
                <span className='text-[10px] font-bold text-primary-600 uppercase tracking-widest flex items-center gap-1 group-hover:gap-2 transition-all'>
                  View Profile <ArrowRight className='w-3 h-3' />
                </span>
              </Link>
            </DetailSection>
          )}
        </aside>
      </div>
    </div>
  );
}
