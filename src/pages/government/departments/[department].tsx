import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  GlobeIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';

// UI Components
import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';

import { toTitleCase } from '@/lib/stringUtils';

// Logic & Data
import departmentsData from '@/data/directory/departments.json';
import servicesData from '@/data/services/services.json';

export default function DepartmentDetail() {
  const { department: slug } = useParams();

  // 1. Data Lookup
  const dept = departmentsData.find(d => d.slug === slug);

  const associatedServices = servicesData.filter(s => {
    // Robust check: handle arrays, strings, and missing officeSlugs
    const slugs = Array.isArray(s.officeSlug)
      ? s.officeSlug
      : s.officeSlug
        ? [s.officeSlug]
        : [];
    return slugs.includes(slug || '');
  });

  if (!dept)
    return (
      <div
        className='p-20 text-center font-bold tracking-widest text-slate-400 uppercase'
        role='alert'
      >
        Office Not Found
      </div>
    );

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
      {/* --- BREADCRUMBS --- */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/government/departments'>
              Departments
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{toTitleCase(dept.office_name)}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- HERO HEADER: Slate Theme --- */}
      <header className='relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12'>
        <div className='relative z-10 max-w-3xl'>
          <div className='mb-4 flex items-center gap-2'>
            <Badge variant='primary' dot>
              Official Municipal Office
            </Badge>
          </div>
          <h1 className='mb-4 text-3xl leading-tight font-extrabold tracking-tight md:text-5xl'>
            {toTitleCase(dept.office_name)}
          </h1>
          <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-400'>
            {dept.address && (
              <span className='flex items-center gap-2'>
                <MapPinIcon className='text-primary-400 h-4 w-4' />
                {dept.address}
              </span>
            )}
          </div>
        </div>
        <ClipboardList
          className='pointer-events-none absolute right-[-20px] bottom-[-20px] h-64 w-64 -rotate-12 text-white/5'
          aria-hidden='true'
        />
      </header>

      {/* --- CONTENT LAYOUT --- */}
      <div className='flex flex-col gap-8 xl:flex-row'>
        {/* MAIN COLUMN (LEFT) */}
        <div className='min-w-0 flex-1 space-y-8'>
          {/* Section: Associated Services */}
          {associatedServices.length > 0 && (
            <DetailSection title='Offered Services' icon={ClipboardList}>
              <div
                className='grid grid-cols-1 gap-4 md:grid-cols-2'
                role='list'
              >
                {associatedServices.map(service => (
                  <Link
                    key={service.slug}
                    to={`/services/${service.slug}`}
                    className='group hover:border-primary-200 flex min-h-[44px] items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 transition-all hover:shadow-md'
                  >
                    <div className='flex items-center gap-3'>
                      <div className='bg-primary-50 text-primary-600 group-hover:bg-primary-600 rounded-lg p-2 transition-colors group-hover:text-white'>
                        <CheckCircle2 className='h-4 w-4' />
                      </div>
                      <span className='group-hover:text-primary-800 text-sm font-bold text-slate-700 transition-colors'>
                        {service.service}
                      </span>
                    </div>
                    <ArrowRight className='group-hover:text-primary-600 h-4 w-4 text-slate-300 transition-all group-hover:translate-x-1' />
                  </Link>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Section: Office Leadership */}
          {dept.department_head && (
            <DetailSection title='Office Leadership' icon={UserIcon}>
              <div className='border-primary-100 bg-primary-50/30 flex flex-col items-center gap-6 rounded-2xl border p-6 md:flex-row md:items-start'>
                <div className='bg-primary-600 shadow-primary-900/20 flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-3xl font-extrabold text-white shadow-lg'>
                  {dept.department_head.name?.[0] || 'H'}
                </div>

                <div className='flex-1 text-center md:text-left'>
                  <h4 className='text-xl leading-tight font-extrabold text-slate-900'>
                    {dept.department_head.name || 'Head of Office'}
                  </h4>
                  <p className='text-primary-700 mt-1 text-xs font-bold tracking-widest uppercase'>
                    Department Head
                  </p>

                  {(dept.department_head.email ||
                    dept.department_head.contact) && (
                    <div className='mt-4 flex flex-wrap justify-center gap-4 md:justify-start'>
                      {dept.department_head.email && (
                        <span className='flex items-center gap-1.5 text-sm font-medium text-slate-500'>
                          <MailIcon className='text-primary-500 h-4 w-4' />
                          {dept.department_head.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </DetailSection>
          )}

          {/* Section: General Description */}
          <DetailSection title='General Information' icon={InfoIcon}>
            <p className='text-sm leading-relaxed text-slate-600 md:text-base'>
              The {toTitleCase(dept.office_name)} is a frontline office of the
              Municipal Government of Los Baños. It is responsible for executing
              administrative mandates and technical functions to ensure the
              delivery of high-quality public services within the Science and
              Nature City.
            </p>
          </DetailSection>
        </div>

        {/* SIDEBAR COLUMN (RIGHT) */}
        <aside className='w-full space-y-6 xl:w-80'>
          <DetailSection title='Quick Contact'>
            <div className='space-y-3'>
              {dept.trunkline && (
                <div className='flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4'>
                  <PhoneIcon className='mt-1 h-4 w-4 shrink-0 text-slate-400' />
                  <div>
                    <p className='mb-1 text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase'>
                      Trunkline
                    </p>
                    <p className='text-sm font-bold text-slate-700'>
                      {Array.isArray(dept.trunkline)
                        ? dept.trunkline[0]
                        : dept.trunkline}
                    </p>
                  </div>
                </div>
              )}

              {dept.website && (
                <a
                  href={dept.website}
                  target='_blank'
                  rel='noreferrer'
                  className='bg-primary-600 hover:bg-primary-700 shadow-primary-900/10 group flex min-h-[48px] w-full items-center justify-between rounded-xl p-4 text-white shadow-md transition-all'
                >
                  <div className='flex items-center gap-3'>
                    <GlobeIcon className='h-4 w-4' />
                    <span className='text-sm font-bold tracking-tight'>
                      Office Website
                    </span>
                  </div>
                  <ArrowRight className='h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1' />
                </a>
              )}

              {dept.email && (
                <a
                  href={`mailto:${dept.email}`}
                  className='flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 p-4 text-slate-600 transition-all hover:bg-slate-50'
                >
                  <MailIcon className='h-4 w-4' />
                  <span className='text-sm font-bold tracking-tight'>
                    Official Email
                  </span>
                </a>
              )}
            </div>
          </DetailSection>
        </aside>
      </div>
    </div>
  );
}
