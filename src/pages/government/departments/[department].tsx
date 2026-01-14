import { useParams, Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  MailIcon,
  InfoIcon,
  UserIcon,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
} from 'lucide-react';

// UI Components
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

// Logic & Data
import departmentsData from '@/data/directory/departments.json';
import servicesData from '@/data/services/services.json';
import { toTitleCase } from '@/lib/stringUtils';

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
        className='p-20 font-bold tracking-widest text-center uppercase text-slate-400'
        role='alert'
      >
        Office Not Found
      </div>
    );

  return (
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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
      <header className='overflow-hidden relative p-8 text-white rounded-3xl shadow-xl md:p-12 bg-slate-900'>
        <div className='relative z-10 max-w-3xl'>
          <div className='flex gap-2 items-center mb-4'>
            <Badge variant='primary' dot>
              Official Municipal Office
            </Badge>
          </div>
          <h1 className='mb-4 text-3xl font-extrabold tracking-tight leading-tight md:text-5xl'>
            {toTitleCase(dept.office_name)}
          </h1>
          <div className='flex flex-wrap gap-y-2 gap-x-6 text-sm font-medium text-slate-400'>
            {dept.address && (
              <span className='flex gap-2 items-center'>
                <MapPinIcon className='w-4 h-4 text-primary-400' />
                {dept.address}
              </span>
            )}
          </div>
        </div>
        <ClipboardList
          className='absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 -rotate-12 pointer-events-none'
          aria-hidden='true'
        />
      </header>

      {/* --- CONTENT LAYOUT --- */}
      <div className='flex flex-col gap-8 xl:flex-row'>
        {/* MAIN COLUMN (LEFT) */}
        <div className='flex-1 space-y-8 min-w-0'>
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
                    className='flex justify-between items-center p-4 bg-white rounded-2xl border border-slate-100 transition-all group hover:border-primary-200 hover:shadow-md min-h-[44px]'
                  >
                    <div className='flex gap-3 items-center'>
                      <div className='p-2 rounded-lg transition-colors bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white'>
                        <CheckCircle2 className='w-4 h-4' />
                      </div>
                      <span className='text-sm font-bold transition-colors text-slate-700 group-hover:text-primary-800'>
                        {service.service}
                      </span>
                    </div>
                    <ArrowRight className='w-4 h-4 transition-all text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1' />
                  </Link>
                ))}
              </div>
            </DetailSection>
          )}

          {/* Section: Office Leadership */}
          {dept.department_head && (
            <DetailSection title='Office Leadership' icon={UserIcon}>
              <div className='flex flex-col gap-6 items-center p-6 rounded-2xl border md:flex-row md:items-start border-primary-100 bg-primary-50/30'>
                <div className='flex justify-center items-center w-20 h-20 text-3xl font-extrabold text-white rounded-2xl shadow-lg bg-primary-600 shadow-primary-900/20 shrink-0'>
                  {dept.department_head.name?.[0] || 'H'}
                </div>

                <div className='flex-1 text-center md:text-left'>
                  <h4 className='text-xl font-extrabold leading-tight text-slate-900'>
                    {dept.department_head.name || 'Head of Office'}
                  </h4>
                  <p className='mt-1 text-xs font-bold tracking-widest uppercase text-primary-700'>
                    Department Head
                  </p>

                  {(dept.department_head.email ||
                    dept.department_head.contact) && (
                    <div className='flex flex-wrap gap-4 justify-center mt-4 md:justify-start'>
                      {dept.department_head.email && (
                        <span className='flex items-center gap-1.5 text-sm text-slate-500 font-medium'>
                          <MailIcon className='w-4 h-4 text-primary-500' />
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
        <aside className='space-y-6 w-full xl:w-80'>
          <DetailSection title='Quick Contact'>
            <div className='space-y-3'>
              {dept.trunkline && (
                <div className='flex gap-3 items-start p-4 rounded-xl border bg-slate-50 border-slate-100'>
                  <PhoneIcon className='mt-1 w-4 h-4 text-slate-400 shrink-0' />
                  <div>
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 leading-none'>
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
                  className='flex justify-between items-center p-4 w-full text-white rounded-xl shadow-md transition-all bg-primary-600 hover:bg-primary-700 shadow-primary-900/10 group min-h-[48px]'
                >
                  <div className='flex gap-3 items-center'>
                    <GlobeIcon className='w-4 h-4' />
                    <span className='text-sm font-bold tracking-tight'>
                      Office Website
                    </span>
                  </div>
                  <ArrowRight className='w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1' />
                </a>
              )}

              {dept.email && (
                <a
                  href={`mailto:${dept.email}`}
                  className='flex gap-3 items-center p-4 text-slate-600 rounded-xl border border-slate-200 transition-all hover:bg-slate-50 min-h-[48px]'
                >
                  <MailIcon className='w-4 h-4' />
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
