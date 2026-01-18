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

          return (
            <DetailSection
              key={leader.slug}
              title={leader.office || 'Elected Official'}
              icon={Icon}
              className={
                isMayor
                  ? 'border-l-primary-600 border-l-4 shadow-sm'
                  : 'bg-slate-50/30'
              }
            >
              <div className='flex flex-col items-center space-y-4 py-4 text-center'>
                {/* Official Icon Seal */}
                <div className='relative'>
                  <div
                    className={`flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm ${isMayor ? 'bg-primary-50 border-primary-100 text-primary-600' : 'border-white bg-white text-slate-400'}`}
                  >
                    <Icon className='h-10 w-10' />
                  </div>
                  {isMayor && (
                    <div className='bg-primary-600 absolute -right-1 -bottom-1 rounded-full border-2 border-white p-1.5 text-white shadow-md'>
                      <ShieldCheck className='h-3.5 w-3.5' aria-hidden='true' />
                    </div>
                  )}
                </div>

                {/* Name & Role */}
                <div className='min-w-0 pb-2'>
                  <h2 className='text-2xl leading-tight font-black text-slate-900'>
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
                  <div className='w-full border-t border-slate-100 pt-4'>
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
              </div>
            </DetailSection>
          );
        })}
      </div>

      {/* --- SECTION 2: EXECUTIVE SUPPORT STAFF --- */}
      {supportStaff.length > 0 && (
        <div className='space-y-4 pt-4'>
          <div className='flex items-center gap-2 border-b border-slate-100 pb-2'>
            <Briefcase className='h-4 w-4 text-slate-500' />
            <h3 className='text-sm font-bold tracking-widest text-slate-500 uppercase'>
              Office of the Mayor
            </h3>
          </div>

          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
            {supportStaff.map(official => (
              <Card
                key={official.slug}
                hover
                className='group flex h-full flex-col border-slate-200 shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row */}
                  <div className='flex items-start gap-3'>
                    <div className='group-hover:border-primary-200 group-hover:text-primary-600 shrink-0 rounded-lg border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-colors'>
                      <User2 className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-primary-700 text-base leading-tight font-bold text-slate-900 transition-colors'>
                        {toTitleCase(official.name)}
                      </h3>
                      <p className='mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        Appointed Official
                      </p>
                    </div>
                  </div>

                  {/* Role Badge */}
                  <div className='flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2'>
                    <Briefcase className='h-3.5 w-3.5 text-slate-400' />
                    <span className='truncate text-[11px] font-bold text-slate-600'>
                      {official.role}
                    </span>
                  </div>

                  {/* Compact Footer (Keeping this dense for the grid list) */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-3'>
                    {official.phone ? (
                      <div className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'>
                        <Phone className='text-primary-400 h-3 w-3' />
                        <span>{official.phone}</span>
                      </div>
                    ) : (
                      <div className='text-[10px] text-slate-300 italic'>
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
      <div className='mt-4 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-6 md:flex-row'>
        <div className='flex items-center gap-4'>
          <Briefcase className='h-8 w-8 text-slate-300' />
          <div>
            <h4 className='font-bold text-slate-900'>
              Looking for Department Heads?
            </h4>
            <p className='text-sm font-medium text-slate-500'>
              Municipal Treasurer, Assessor, Engineer, and other service heads
              are listed in the directory.
            </p>
          </div>
        </div>
        <Link
          to='/government/departments'
          className='text-primary-600 hover:text-primary-800 group flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all'
        >
          Go to Departments{' '}
          <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
        </Link>
      </div>

      <footer className='pt-12 text-center'>
        <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm'>
          <ShieldCheck
            className='h-4 w-4 text-emerald-600'
            aria-hidden='true'
          />
          <span className='text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
            Verified Executive Registry
          </span>
        </div>
      </footer>
    </div>
  );
}
