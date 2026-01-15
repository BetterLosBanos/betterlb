import { useMemo } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRight,
  Briefcase,
  Gavel,
  Globe,
  Landmark,
  Mail,
  Phone,
  ShieldCheck,
} from 'lucide-react';

// UI & Layouts
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
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
import { Card, CardAvatar, CardContent } from '@/components/ui/CardList';

import { toTitleCase } from '@/lib/stringUtils';

// Logic & Data
import executiveData from '@/data/directory/executive.json';

// Strict typing for the flattened JSON structure
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

  // Separate logic: Elected (Mayor/VM) vs Management (Appointed)
  const electedLeaders = useMemo(() => data.filter(o => o.isElected), [data]);
  const managementTeam = useMemo(() => data.filter(o => !o.isElected), [data]);

  return (
    <div className='animate-in fade-in mx-auto max-w-5xl space-y-8 px-4 pb-20 duration-500 md:px-0'>
      {/* --- BREADCRUMBS --- */}
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
        description='The administrative leadership of the Municipal Government responsible for public policy and service implementation.'
      />

      {/* --- SECTION 1: ELECTED LEADERSHIP --- */}
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2'>
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
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='relative'>
                  <CardAvatar
                    name={leader.name}
                    size='lg'
                    className={`shadow-lg ring-4 ${isMayor ? 'ring-primary-50' : 'ring-white'}`}
                  />
                  {isMayor && (
                    <div className='bg-primary-600 absolute -right-1 -bottom-1 rounded-full border-2 border-white p-1.5 text-white shadow-md'>
                      <ShieldCheck className='h-3 w-3' aria-hidden='true' />
                    </div>
                  )}
                </div>

                <div className='min-w-0'>
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

                {/* Contact Row: High Contrast & Large Touch Targets */}
                <div className='w-full space-y-2 border-t border-slate-100 pt-4 text-[11px] font-bold tracking-widest text-slate-500 uppercase'>
                  {leader.email && (
                    <div className='flex items-center justify-center gap-2'>
                      <Mail
                        className='text-primary-500 h-3.5 w-3.5'
                        aria-hidden='true'
                      />
                      <span className='truncate'>{leader.email}</span>
                    </div>
                  )}
                  {leader.phone && (
                    <div className='flex items-center justify-center gap-2'>
                      <Phone
                        className='text-primary-500 h-3.5 w-3.5'
                        aria-hidden='true'
                      />
                      <span>{leader.phone}</span>
                    </div>
                  )}
                  {leader.website && (
                    <a
                      href={leader.website}
                      target='_blank'
                      rel='noreferrer'
                      className='text-primary-600 hover:text-primary-800 mt-1 inline-flex min-h-[32px] items-center gap-1.5 transition-all hover:underline'
                    >
                      <Globe className='h-3.5 w-3.5' /> Official Facebook
                    </a>
                  )}
                </div>
              </div>
            </DetailSection>
          );
        })}
      </div>

      {/* --- SECTION 2: MUNICIPAL MANAGEMENT (APPOINTED) --- */}
      {managementTeam.length > 0 && (
        <DetailSection
          title='Municipal Management'
          icon={Briefcase}
          className='border-l-4 border-l-slate-400'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
            {managementTeam.map(official => (
              <Card
                key={official.slug}
                className='border-slate-100 bg-white shadow-xs'
              >
                <CardContent className='flex h-full flex-col p-5'>
                  <div className='mb-4 flex items-center gap-4'>
                    <div
                      className='flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-lg font-black text-slate-400'
                      aria-hidden='true'
                    >
                      {official.name[0]}
                    </div>
                    <div className='min-w-0'>
                      <h4 className='truncate text-base leading-tight font-bold text-slate-900'>
                        {toTitleCase(official.name)}
                      </h4>
                      <p className='text-primary-600 mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        {official.role}
                      </p>
                    </div>
                  </div>

                  {/* RESTORED: Contact details for Management Officials */}
                  <div className='mt-auto space-y-1.5 border-t border-slate-50 pt-3'>
                    {official.email && (
                      <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        <Mail
                          className='h-3 w-3 text-slate-300'
                          aria-hidden='true'
                        />
                        <span className='truncate'>{official.email}</span>
                      </div>
                    )}
                    {official.phone && (
                      <div className='flex items-center gap-2 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        <Phone
                          className='h-3 w-3 text-slate-300'
                          aria-hidden='true'
                        />
                        <span>{official.phone}</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Directory Bridge Button */}
          <div className='mt-8 flex flex-col items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 md:flex-row'>
            <p className='text-center text-xs font-medium text-slate-500 italic md:text-left'>
              For technical inquiries, contact the specific administrative
              offices directly.
            </p>
            <Link
              to='/government/departments'
              className='text-primary-600 hover:text-primary-800 group flex min-h-[44px] items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all'
            >
              View All Departments{' '}
              <ArrowRight className='h-3.5 w-3.5 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </DetailSection>
      )}

      {/* --- FOOTER: ACCESSIBILITY TRUST --- */}
      <footer className='pt-12 text-center'>
        <div className='inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-5 py-2.5 shadow-sm'>
          <ShieldCheck
            className='h-4 w-4 text-emerald-600'
            aria-hidden='true'
          />
          <span className='text-[10px] font-bold tracking-widest text-slate-500 uppercase'>
            Verified Executive Registry • Municipality of Los Baños
          </span>
        </div>
      </footer>
    </div>
  );
}
