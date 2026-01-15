import { Link } from 'react-router-dom';

import {
  ArrowRight,
  BookOpen,
  Briefcase,
  ChevronRight,
  Gavel,
  Landmark,
  Mail,
  Phone,
  Users,
} from 'lucide-react';

// UI Components
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { Card, CardAvatar, CardContent } from '@/components/ui/CardList';

import { toTitleCase } from '@/lib/stringUtils';

// Data & Utils
import executiveData from '@/data/directory/executive.json';
import legislativeData from '@/data/directory/legislative.json';

// 1. Define the Interface to match your NEW flat JSON structure
interface ExecutiveOfficial {
  slug: string;
  name: string;
  role: string;
  office: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isElected: boolean;
}

interface OfficialCardProps {
  href: string;
  official: ExecutiveOfficial;
}

export default function ElectedOfficialsIndex() {
  const allExecutive = executiveData as ExecutiveOfficial[];

  // 2. Data Extraction using the flat structure
  const mayor = allExecutive.find(o => o.slug === 'office-of-the-mayor');
  const viceMayor = allExecutive.find(
    o => o.slug === 'office-of-the-vice-mayor'
  );
  const managementTeam = allExecutive.filter(o => !o.isElected);

  const sbChamber = legislativeData.find(
    o => o.slug === '12th-sangguniang-bayan'
  );
  const committeeCount = sbChamber?.permanent_committees?.length || 0;

  return (
    <div className='animate-in fade-in mx-auto max-w-4xl space-y-8 pb-20 duration-500 md:px-0'>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbHome href='/' />
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Elected Officials</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <ModuleHeader
        title='Municipal Leadership'
        description='Meet the elected leaders and appointed management of the Science and Nature City.'
      />

      <div className='space-y-12'>
        {/* --- SECTION 1: EXECUTIVE LEADERSHIP --- */}
        <DetailSection
          title='Executive Leadership'
          icon={Landmark}
          className='border-l-primary-600 border-l-4 shadow-sm'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            {mayor && (
              <OfficialCard
                href='/government/elected-officials/executive-branch'
                official={mayor}
              />
            )}
            {viceMayor && (
              <OfficialCard
                href='/government/elected-officials/executive-branch'
                official={viceMayor}
              />
            )}
          </div>
        </DetailSection>

        {/* --- SECTION 2: LEGISLATIVE BRANCH --- */}
        <DetailSection
          title='Legislative Branch'
          icon={Gavel}
          className='border-l-secondary-600 border-l-4 shadow-sm'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Link
              to='/government/elected-officials/12th-sangguniang-bayan'
              className='group min-h-[44px]'
            >
              <Card hover className='h-full border-slate-100'>
                <CardContent className='flex items-center gap-5 p-6'>
                  <div className='bg-secondary-600 shadow-secondary-900/10 flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-lg'>
                    <Users className='h-6 w-6' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='group-hover:text-secondary-700 leading-tight font-bold text-slate-900 transition-colors'>
                      12th Sangguniang Bayan
                    </h3>
                    <p className='mt-1 text-xs font-medium text-slate-500'>
                      Council Members & Profiles
                    </p>
                  </div>
                  <ChevronRight className='group-hover:text-secondary-600 h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1' />
                </CardContent>
              </Card>
            </Link>

            <Link
              to='/government/elected-officials/municipal-committees'
              className='group min-h-[44px]'
            >
              <Card hover className='h-full border-slate-100'>
                <CardContent className='flex items-center gap-5 p-6'>
                  <div className='bg-secondary-50 text-secondary-600 border-secondary-100 flex h-12 w-12 items-center justify-center rounded-2xl border'>
                    <BookOpen className='h-6 w-6' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='group-hover:text-secondary-700 leading-tight font-bold text-slate-900 transition-colors'>
                      Municipal Committees
                    </h3>
                    <p className='mt-1 text-xs font-medium text-slate-500'>
                      {committeeCount} Standing Committees
                    </p>
                  </div>
                  <ChevronRight className='group-hover:text-secondary-600 h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1' />
                </CardContent>
              </Card>
            </Link>
          </div>
        </DetailSection>

        {/* --- SECTION 3: MUNICIPAL MANAGEMENT --- */}
        {managementTeam.length > 0 && (
          <DetailSection
            title='Municipal Management'
            icon={Briefcase}
            className='border-l-4 border-l-slate-400 shadow-sm'
          >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {managementTeam.map((official: ExecutiveOfficial) => (
                <Card
                  key={official.slug}
                  className='border-slate-100 bg-slate-50/30'
                >
                  <CardContent className='flex items-center gap-4 p-4'>
                    <CardAvatar
                      name={official.name}
                      size='sm'
                      className='border border-slate-200 bg-white font-bold text-slate-400 shadow-xs'
                    />
                    <div className='min-w-0 flex-1'>
                      <h4 className='truncate text-sm leading-tight font-bold text-slate-900'>
                        {toTitleCase(official.name)}
                      </h4>
                      <Badge variant='slate' className='mt-1'>
                        {official.role}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className='mt-8 border-t border-slate-100 pt-6 text-center'>
              <Link
                to='/government/departments'
                className='text-primary-600 hover:text-primary-700 group flex items-center justify-center gap-1.5 text-[10px] font-bold tracking-widest uppercase transition-all'
              >
                Browse all Government Departments
                <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
              </Link>
            </div>
          </DetailSection>
        )}
      </div>
    </div>
  );
}

function OfficialCard({ href, official }: OfficialCardProps) {
  return (
    <Link to={href} className='group min-h-[48px]'>
      <Card hover className='flex h-full flex-col border-slate-100 shadow-xs'>
        <CardContent className='flex h-full flex-col p-5'>
          <div className='mb-4 flex items-center gap-4'>
            <CardAvatar
              name={official.name}
              size='md'
              className='bg-primary-50 text-primary-800 font-bold shadow-sm ring-2 ring-white'
            />
            <div className='min-w-0 flex-1'>
              <p className='text-primary-600 mb-1 text-[10px] leading-none font-bold tracking-widest uppercase'>
                {official.role}
              </p>
              <h3 className='group-hover:text-primary-700 truncate text-lg font-bold text-slate-900 transition-colors'>
                {toTitleCase(official.name)}
              </h3>
            </div>
            <div className='group-hover:bg-primary-50 group-hover:text-primary-600 rounded-lg bg-slate-50 p-1.5 text-slate-300 transition-all'>
              <ChevronRight className='h-4 w-4' />
            </div>
          </div>

          <div className='mt-auto space-y-1.5 border-t border-slate-50 pt-4'>
            {official.email && (
              <div className='flex items-center gap-2 text-[10px] font-medium text-slate-500'>
                <Mail className='text-primary-400 h-3.5 w-3.5' />
                <span className='truncate'>{official.email}</span>
              </div>
            )}
            {official.phone && (
              <div className='flex items-center gap-2 text-[10px] font-medium text-slate-500'>
                <Phone className='text-primary-400 h-3.5 w-3.5' />
                <span>{official.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
