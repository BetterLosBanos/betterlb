import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ClipboardList,
  GlobeIcon,
  InfoIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';

// Shared Components
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
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
import { Card, CardContent } from '@/components/ui/Card';

// Standard Card

import { toTitleCase } from '@/lib/stringUtils';

import departmentsData from '@/data/directory/departments.json';
import servicesData from '@/data/services/services.json';

export default function DepartmentDetail() {
  const { department: slug } = useParams();

  // 1. Data Lookup
  const dept = departmentsData.find(d => d.slug === slug);

  // Robustly filter services for this department
  const associatedServices = servicesData.filter(s => {
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

  const contactValue = Array.isArray(dept.trunkline)
    ? dept.trunkline[0]
    : dept.trunkline;

  return (
    <div className='animate-in fade-in space-y-8 pb-20 duration-500'>
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

      {/* --- HERO HEADER --- */}
      <header className='relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl md:p-10'>
        <div className='relative z-10 max-w-3xl'>
          <div className='mb-3 flex items-center gap-2'>
            <Badge variant='primary' dot>
              Official Municipal Office
            </Badge>
          </div>
          <h1 className='mb-4 text-3xl font-extrabold tracking-tight md:text-5xl'>
            {toTitleCase(dept.office_name)}
          </h1>
          <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-300'>
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

      {/* --- CONTACT BAR (Full Width) --- */}
      <ContactContainer variant='grid' className='md:grid-cols-3'>
        <ContactItem
          icon={PhoneIcon}
          label='Trunkline'
          value={contactValue || 'No contact listed'}
        />
        <ContactItem
          icon={GlobeIcon}
          label='Office Website'
          value={dept.website ? 'Visit Portal' : 'Not available'}
          href={dept.website}
          isExternal
        />
        <ContactItem
          icon={MailIcon}
          label='Official Email'
          value={dept.email || 'No email listed'}
          href={dept.email ? `mailto:${dept.email}` : undefined}
        />
      </ContactContainer>

      {/* --- SECTION 1: OFFICE LEADERSHIP --- */}
      {dept.department_head && (
        <DetailSection title='Office Leadership' icon={UserIcon}>
          <div className='bg-primary-50/50 border-primary-100 flex flex-col items-center gap-6 rounded-2xl border p-8 shadow-sm md:flex-row'>
            {/* Neutral Seal */}
            <div className='border-primary-100 text-primary-600 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 bg-white shadow-sm'>
              <Briefcase className='h-10 w-10' />
            </div>

            <div className='flex-1 text-center md:text-left'>
              <h3 className='text-2xl font-black text-gray-900'>
                {dept.department_head.name || 'Head of Office'}
              </h3>
              <Badge variant='primary' className='mt-2'>
                Department Head
              </Badge>

              {/* Optional Direct Contact for Head */}
              {dept.department_head.email && (
                <div className='border-primary-100/50 mt-4 flex justify-center gap-4 border-t pt-4 text-sm text-slate-600 md:justify-start'>
                  <span className='flex items-center gap-1.5 font-medium'>
                    <MailIcon className='text-primary-500 h-4 w-4' />
                    {dept.department_head.email}
                  </span>
                </div>
              )}
            </div>
          </div>
        </DetailSection>
      )}

      {/* --- SECTION 2: ASSOCIATED SERVICES (Grid) --- */}
      {associatedServices.length > 0 && (
        <DetailSection
          title='Department Services'
          icon={ClipboardList}
          // Add a subtle border highlight to indicate functionality
          className='border-l-4 border-l-slate-400'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
            {associatedServices.map(service => (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className='group block'
              >
                <Card
                  hover
                  className='hover:border-primary-200 h-full border-slate-200 shadow-xs'
                >
                  <CardContent className='flex h-full items-center justify-between gap-3 p-4'>
                    <div className='flex min-w-0 items-center gap-3'>
                      <div className='bg-primary-50 text-primary-600 group-hover:bg-primary-600 border-primary-100 shrink-0 rounded-lg border p-2 shadow-sm transition-colors group-hover:text-white'>
                        <CheckCircle2 className='h-5 w-5' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-primary-600 mb-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                          Public Service
                        </p>
                        <p className='group-hover:text-primary-800 text-sm leading-tight font-bold text-slate-700 transition-colors'>
                          {service.service}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className='group-hover:text-primary-600 h-4 w-4 shrink-0 text-slate-300 transition-all group-hover:translate-x-1' />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </DetailSection>
      )}

      {/* --- SECTION 3: GENERAL MANDATE --- */}
      <DetailSection title='Office Mandate' icon={InfoIcon}>
        <div className='rounded-xl border border-slate-100 bg-slate-50 p-6'>
          <p className='text-sm leading-relaxed text-slate-600 md:text-base'>
            The {toTitleCase(dept.office_name)} is a frontline office of the
            Municipal Government of Los Baños. It is responsible for executing
            administrative mandates and technical functions to ensure the
            delivery of high-quality public services within the Science and
            Nature City.
          </p>
        </div>
      </DetailSection>
    </div>
  );
}
