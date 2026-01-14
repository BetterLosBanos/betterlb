import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Phone,
  Globe,
  Landmark,
  Gavel,
  ShieldCheck,
  ArrowRight,
  Briefcase,
} from 'lucide-react';

// UI & Layouts
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { Card, CardAvatar, CardContent } from '@/components/ui/CardList';
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
import executiveData from '@/data/directory/executive.json';
import { toTitleCase } from '@/lib/stringUtils';

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
    <div className='px-4 pb-20 mx-auto space-y-8 max-w-5xl duration-500 animate-in fade-in md:px-0'>
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
                  ? 'border-l-4 shadow-sm border-l-primary-600'
                  : 'bg-slate-50/30'
              }
            >
              <div className='flex flex-col items-center space-y-4 text-center'>
                <div className='relative'>
                  <CardAvatar
                    name={leader.name}
                    size='lg'
                    className={`ring-4 shadow-lg ${isMayor ? 'ring-primary-50' : 'ring-white'}`}
                  />
                  {isMayor && (
                    <div className='absolute -right-1 -bottom-1 p-1.5 text-white rounded-full border-2 border-white shadow-md bg-primary-600'>
                      <ShieldCheck className='w-3 h-3' aria-hidden='true' />
                    </div>
                  )}
                </div>

                <div className='min-w-0'>
                  <h2 className='text-2xl font-black leading-tight text-slate-900'>
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
                <div className='pt-4 w-full border-t border-slate-100 space-y-2 text-[11px] font-bold uppercase tracking-widest text-slate-500'>
                  {leader.email && (
                    <div className='flex gap-2 justify-center items-center'>
                      <Mail
                        className='w-3.5 h-3.5 text-primary-500'
                        aria-hidden='true'
                      />
                      <span className='truncate'>{leader.email}</span>
                    </div>
                  )}
                  {leader.phone && (
                    <div className='flex gap-2 justify-center items-center'>
                      <Phone
                        className='w-3.5 h-3.5 text-primary-500'
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
                      className='inline-flex items-center gap-1.5 text-primary-600 hover:text-primary-800 hover:underline mt-1 transition-all min-h-[32px]'
                    >
                      <Globe className='w-3.5 h-3.5' /> Official Facebook
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
                className='bg-white border-slate-100 shadow-xs'
              >
                <CardContent className='flex flex-col p-5 h-full'>
                  <div className='flex gap-4 items-center mb-4'>
                    <div
                      className='flex justify-center items-center w-12 h-12 text-lg font-black rounded-xl border bg-slate-50 text-slate-400 border-slate-100 shrink-0'
                      aria-hidden='true'
                    >
                      {official.name[0]}
                    </div>
                    <div className='min-w-0'>
                      <h4 className='text-base font-bold leading-tight truncate text-slate-900'>
                        {toTitleCase(official.name)}
                      </h4>
                      <p className='text-[10px] font-bold text-primary-600 uppercase tracking-widest mt-0.5'>
                        {official.role}
                      </p>
                    </div>
                  </div>

                  {/* RESTORED: Contact details for Management Officials */}
                  <div className='mt-auto pt-3 border-t border-slate-50 space-y-1.5'>
                    {official.email && (
                      <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        <Mail
                          className='w-3 h-3 text-slate-300'
                          aria-hidden='true'
                        />
                        <span className='truncate'>{official.email}</span>
                      </div>
                    )}
                    {official.phone && (
                      <div className='flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        <Phone
                          className='w-3 h-3 text-slate-300'
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
          <div className='flex flex-col gap-4 justify-between items-center p-5 mt-8 rounded-2xl border md:flex-row bg-slate-50/50 border-slate-200'>
            <p className='text-xs italic font-medium text-center text-slate-500 md:text-left'>
              For technical inquiries, contact the specific administrative
              offices directly.
            </p>
            <Link
              to='/government/departments'
              className='flex gap-2 items-center text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-800 transition-all group bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm min-h-[44px]'
            >
              View All Departments{' '}
              <ArrowRight className='w-3.5 h-3.5 transition-transform group-hover:translate-x-1' />
            </Link>
          </div>
        </DetailSection>
      )}

      {/* --- FOOTER: ACCESSIBILITY TRUST --- */}
      <footer className='pt-12 text-center'>
        <div className='inline-flex gap-2 items-center px-5 py-2.5 bg-white rounded-full border shadow-sm border-slate-200'>
          <ShieldCheck
            className='w-4 h-4 text-emerald-600'
            aria-hidden='true'
          />
          <span className='text-[10px] font-bold text-slate-500 uppercase tracking-widest'>
            Verified Executive Registry • Municipality of Los Baños
          </span>
        </div>
      </footer>
    </div>
  );
}
