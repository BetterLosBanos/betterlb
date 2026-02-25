import { useMemo } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Briefcase,
  Gavel,
  Landmark,
  Mail,
  Phone,
  ShieldCheck,
  User2,
} from 'lucide-react';

// Shared Components
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
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

import executiveData from '@/data/directory/executive.json';

interface ExecutiveOfficial {
  slug: string;
  name: string;
  role: string;
  office?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isElected: boolean;
  personId?: string;
}

export default function ExecutiveBranchPage() {
  const data = executiveData as ExecutiveOfficial[];

  const electedLeaders = useMemo(() => data.filter(o => o.isElected), [data]);

  const supportStaff = useMemo(() => {
    return data.filter(o => {
      if (o.isElected) return false;
      const r = o.role.toLowerCase();
      return (
        r.includes('administrator') ||
        r.includes('secretary') ||
        r.includes('chief of staff') ||
        r.includes('legal officer')
      );
    });
  }, [data]);

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-8 duration-500'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href='/government/elected-officials'>
              Elected Officials
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Executive Branch</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Executive Branch'
        description='The administrative leadership of the Municipal Government.'
      />

      {/* --- SECTION 1: ELECTED LEADERSHIP --- */}
      <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
        {electedLeaders.map(leader => {
          const isMayor =
            leader.slug.includes('mayor') && !leader.slug.includes('vice');
          const Icon = isMayor ? Landmark : Gavel;

          const cardContent = (
            <DetailSection
              key={leader.slug}
              title={leader.office || 'Elected Official'}
              icon={Icon}
              className={
                isMayor
                  ? 'border-l-kapwa-border-brand border-l-4 shadow-sm'
                  : 'bg-kapwa-bg-surface/30'
              }
            >
              <div className='flex flex-col items-center space-y-4 py-4 text-center'>
                {/* Official Icon Seal */}
                <div className='relative'>
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm ${isMayor ? 'bg-kapwa-bg-surface border-kapwa-border-brand text-kapwa-text-brand' : 'bg-kapwa-bg-surface text-kapwa-text-disabled border-white'}`}
                  >
                    <Icon className='h-10 w-10' />
                  </div>
                  {isMayor && (
                    <div className='bg-kapwa-bg-brand-default text-kapwa-text-inverse absolute -right-1 -bottom-1 rounded-full border-2 border-white p-1.5 shadow-md'>
                      <ShieldCheck className='h-3.5 w-3.5' aria-hidden='true' />
                    </div>
                  )}
                </div>

                {/* Name & Role */}
                <div className='min-w-0 pb-2'>
                  <h2 className='text-kapwa-text-strong text-2xl leading-tight font-black'>
                    Hon. {toTitleCase(leader.name)}
                  </h2>
                  <Badge
                    variant={isMayor ? 'primary' : 'secondary'}
                    className='mt-2'
                  >
                    {leader.role}
                  </Badge>
                </div>

                {/* REFACTORED: Using Unified Contact Components */}
                {(leader.email || leader.phone) && (
                  <div className='border-kapwa-border-weak w-full border-t pt-4'>
                    <ContactContainer variant='stack' className='text-left'>
                      <ContactItem
                        icon={Mail}
                        label='Email Address'
                        value={leader.email}
                        // Makes it clickable if value exists
                        href={
                          leader.email ? `mailto:${leader.email}` : undefined
                        }
                      />
                      <ContactItem
                        icon={Phone}
                        label='Office Line'
                        value={leader.phone}
                      />
                    </ContactContainer>
                  </div>
                )}

                {/* View Profile Link */}
                {leader.personId && (
                  <div className='border-kapwa-border-weak w-full border-t pt-4'>
                    <Link
                      to={`/openlgu/person/${leader.personId}`}
                      className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold group flex items-center justify-center gap-2 text-sm font-bold transition-colors'
                    >
                      View Full Profile
                      <ArrowRight className='h-4 w-4 transition-transform group-hover:translate-x-1' />
                    </Link>
                  </div>
                )}
              </div>
            </DetailSection>
          );

          // Wrap in Link if personId exists
          return leader.personId ? (
            <Link
              key={leader.slug}
              to={`/openlgu/person/${leader.personId}`}
              className='group'
            >
              {cardContent}
            </Link>
          ) : (
            cardContent
          );
        })}
      </div>

      {/* --- SECTION 2: EXECUTIVE SUPPORT STAFF --- */}
      {supportStaff.length > 0 && (
        <div className='space-y-4 pt-4'>
          <div className='border-kapwa-border-weak flex items-center gap-2 border-b pb-2'>
            <Briefcase className='text-kapwa-text-disabled h-4 w-4' />
            <h3 className='text-kapwa-text-disabled text-sm font-bold tracking-widest uppercase'>
              Office of the Mayor
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {supportStaff.map(official => (
              <Card
                key={official.slug}
                hover
                className='group border-kapwa-border-weak flex h-full flex-col shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row */}
                  <div className='flex items-start gap-3'>
                    <div className='group-hover:border-kapwa-border-brand group-hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <User2 className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-base leading-tight font-bold transition-colors'>
                        {toTitleCase(official.name)}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        Appointed Official
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2'>
                    <Briefcase className='text-kapwa-text-disabled h-3.5 w-3.5' />
                    <span className='text-kapwa-text-on-disabled truncate text-[11px] font-bold'>
                      {official.role}
                    </span>
                  </div>

                  {/* Compact Footer (Keeping this dense for the grid list) */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-kapwa-border-weak pt-3'>
                    {official.phone ? (
                      <div className='text-kapwa-text-disabled flex items-center gap-1.5 text-[11px] font-medium'>
                        <Phone className='text-kapwa-text-brand h-3 w-3' />
                        <span>{official.phone}</span>
                      </div>
                    ) : (
                      <div className='text-kapwa-text-support text-[10px] italic'>
                        No contact
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* --- SECTION 3: BRIDGE --- */}
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 md:flex-row'>
        <div className='flex items-center gap-4'>
          <Briefcase className='text-kapwa-text-support h-8 w-8' />
          <div>
            <h4 className='text-kapwa-text-strong font-bold'>
              Looking for Department Heads?
            </h4>
            <p className='text-kapwa-text-disabled text-sm font-medium'>
              Municipal Treasurer, Assessor, Engineer, and other service heads
              are listed in the directory.
            </p>
          </div>
        </div>
        <Link
          to='/government/departments'
          className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold group border-kapwa-border-weak bg-kapwa-bg-surface flex min-h-[44px] items-center gap-2 rounded-xl border px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all'
        >
          Go to Departments{' '}
          <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
        </Link>
      </div>

      <footer className='pt-12 text-center'>
        <div className='border-kapwa-border-weak bg-kapwa-bg-surface inline-flex items-center gap-2 rounded-full border px-5 py-2.5 shadow-sm'>
          <ShieldCheck
            className='h-4 w-4 text-kapwa-text-success'
            aria-hidden='true'
          />
          <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            Verified Executive Registry
          </span>
        </div>
      </footer>
    </div>
  );
}
