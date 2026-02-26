import { Link, useParams } from 'react-router-dom';

import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GlobeIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';
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

import { toTitleCase } from '@/lib/stringUtils';
import { toTelUri } from '@/lib/utils';

import departmentsData from '@/data/directory/departments.json';
import mergedServicesData from '@/data/citizens-charter/merged-services.json';

export default function DepartmentDetail() {
  const { department: slug } = useParams();

  // 1. Data Lookup
  const dept = departmentsData.find(d => d.slug === slug);

  // Filter services from merged-services.json
  const associatedServices = mergedServicesData.filter(s => {
    const officeSlug = s.officeSlug;
    const slugs = Array.isArray(officeSlug)
      ? officeSlug
      : officeSlug
        ? [officeSlug]
        : [];
    return slugs.includes(slug || '');
  });

  if (!dept)
    return (
      <div
        className='text-kapwa-text-disabled p-20 text-center font-bold tracking-widest uppercase'
        role='alert'
      >
        Office Not Found
      </div>
    );

  const contactValue = Array.isArray(dept.trunkline)
    ? dept.trunkline[0]
    : dept.trunkline;

  return (
    <div className='animate-in fade-in space-y-6 pb-20 duration-500'>
      {/* Skip Link for Accessibility */}
      <a
        href='#main-content'
        className='focus:bg-kapwa-bg-surface focus:text-kapwa-text-strong focus:ring-kapwa-border-focus sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:ring-2'
      >
        Skip to main content
      </a>

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

      {/* --- COMPACT IDENTITY HEADER --- */}
      <header
        className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'
        role='banner'
        aria-label='Department information header'
      >
        {/* Top Row: Name + Badge */}
        <div className='mb-4 flex items-center justify-between gap-4'>
          <div className='flex items-center gap-3'>
            <Briefcase
              aria-hidden='true'
              className='text-kapwa-text-brand h-5 w-5'
            />
            <h1 className='kapwa-heading-lg text-kapwa-text-strong'>
              {toTitleCase(dept.office_name)}
            </h1>
          </div>
          <Badge variant='secondary' dot>
            Official Profile
          </Badge>
        </div>

        {/* Middle: Address */}
        {dept.address && (
          <p className='text-kapwa-text-support mb-4 text-sm'>
            {dept.address}, Los Baños, Laguna
          </p>
        )}

        {/* Bottom: Contact Row */}
        <div className='flex flex-col gap-4 text-sm md:flex-row md:gap-6'>
          {contactValue && (
            <a
              href={toTelUri(contactValue) || '#'}
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <PhoneIcon aria-hidden='true' className='h-4 w-4' />
              <span>{contactValue}</span>
            </a>
          )}
          {dept.website && (
            <a
              href={dept.website}
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <GlobeIcon aria-hidden='true' className='h-4 w-4' />
              <span>Website</span>
            </a>
          )}
          {dept.email && (
            <a
              href={`mailto:${dept.email}`}
              className='text-kapwa-text-support hover:text-kapwa-text-brand flex items-center gap-2 transition-colors'
            >
              <MailIcon aria-hidden='true' className='h-4 w-4' />
              <span>{dept.email}</span>
            </a>
          )}
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main id='main-content' className='space-y-6'>
        {/* Office Leadership */}
        {dept.department_head?.name && (
          <div
            className='space-y-2'
            role='group'
            aria-label='Office Leadership'
          >
            <p className='sr-only'>Office Leadership</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Office Leadership
            </p>
            <div className='bg-kapwa-bg-surface border-kapwa-border-weak rounded-xl border p-6 shadow-sm'>
              <div className='flex flex-col gap-4 md:flex-row md:items-center md:gap-6'>
                <div className='border-kapwa-border-brand text-kapwa-text-brand bg-kapwa-bg-surface flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2'>
                  <UserIcon className='h-8 w-8' />
                </div>
                <div className='flex-1'>
                  <h3 className='text-kapwa-text-strong text-xl font-bold'>
                    {dept.department_head.name}
                  </h3>
                  <Badge variant='secondary' className='mt-1'>
                    Department Head
                  </Badge>
                  {dept.department_head.email && (
                    <a
                      href={`mailto:${dept.department_head.email}`}
                      className='text-kapwa-text-brand mt-2 flex items-center gap-2 text-sm'
                    >
                      <MailIcon className='h-4 w-4' />
                      {dept.department_head.email}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Department Services */}
        {associatedServices.length > 0 && (
          <div
            className='space-y-2'
            role='group'
            aria-label='Department Services'
          >
            <p className='sr-only'>Department Services</p>
            <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
              Department Services
            </p>
            <div className='grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3'>
              {associatedServices.map(service => (
                <Link
                  key={service.slug}
                  to={`/services/${service.slug}`}
                  className='group block'
                >
                  <Card
                    hover
                    className='hover:border-kapwa-border-brand border-kapwa-border-weak h-full shadow-xs'
                  >
                    <CardContent className='flex h-full items-center justify-between gap-3 p-4'>
                      <div className='flex min-w-0 items-center gap-3'>
                        <div className='bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default border-kapwa-border-brand group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                          <CheckCircle2 className='h-5 w-5' />
                        </div>
                        <div className='min-w-0'>
                          <p className='text-kapwa-text-brand mb-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                            Service
                          </p>
                          <p className='group-hover:text-kapwa-text-brand-bold text-kapwa-text-support text-sm leading-tight font-bold transition-colors'>
                            {service.plainLanguageName || service.service}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className='group-hover:text-kapwa-text-brand text-kapwa-text-support h-4 w-4 shrink-0 transition-all group-hover:translate-x-1' />
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Office Mandate */}
        <div className='space-y-2' role='group' aria-label='Office Mandate'>
          <p className='sr-only'>Office Mandate</p>
          <p className='text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase'>
            Office Mandate
          </p>
          <Card variant='default' hover={false} className='bg-kapwa-bg-surface'>
            <CardContent className='p-6'>
              <p className='text-kapwa-text-support text-sm leading-relaxed'>
                The {toTitleCase(dept.office_name)} is a frontline office of the
                Municipal Government of Los Baños. It is responsible for
                executing administrative mandates and technical functions to
                ensure the delivery of high-quality public services within the
                Science and Nature City.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
