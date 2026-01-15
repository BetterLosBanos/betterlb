import { Link } from 'react-router-dom';
import {
  Gavel,
  ChevronRight,
  Landmark,
  BookOpen,
  Users,
  Mail,
  Phone,
  Briefcase,
  ArrowRight,
} from 'lucide-react';

// UI Components
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { Card, CardContent, CardAvatar } from '@/components/ui/CardList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import { Badge } from '@/components/ui/Badge';

// Data & Utils
import executiveData from '@/data/directory/executive.json';
import legislativeData from '@/data/directory/legislative.json';
import { toTitleCase } from '@/lib/stringUtils';

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
    <div className='pb-20 mx-auto space-y-8 max-w-4xl duration-500 animate-in fade-in md:px-0'>
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
          className='border-l-4 shadow-sm border-l-primary-600'
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
          className='border-l-4 shadow-sm border-l-secondary-600'
        >
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
            <Link
              to='/government/elected-officials/12th-sangguniang-bayan'
              className='group min-h-[44px]'
            >
              <Card hover className='h-full border-slate-100'>
                <CardContent className='flex gap-5 items-center p-6'>
                  <div className='flex justify-center items-center w-12 h-12 text-white rounded-2xl shadow-lg bg-secondary-600 shadow-secondary-900/10'>
                    <Users className='w-6 h-6' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold leading-tight transition-colors text-slate-900 group-hover:text-secondary-700'>
                      12th Sangguniang Bayan
                    </h3>
                    <p className='mt-1 text-xs font-medium text-slate-500'>
                      Council Members & Profiles
                    </p>
                  </div>
                  <ChevronRight className='w-5 h-5 transition-all text-slate-300 group-hover:text-secondary-600 group-hover:translate-x-1' />
                </CardContent>
              </Card>
            </Link>

            <Link
              to='/government/elected-officials/municipal-committees'
              className='group min-h-[44px]'
            >
              <Card hover className='h-full border-slate-100'>
                <CardContent className='flex gap-5 items-center p-6'>
                  <div className='flex justify-center items-center w-12 h-12 rounded-2xl border bg-secondary-50 text-secondary-600 border-secondary-100'>
                    <BookOpen className='w-6 h-6' />
                  </div>
                  <div className='flex-1'>
                    <h3 className='font-bold leading-tight transition-colors text-slate-900 group-hover:text-secondary-700'>
                      Municipal Committees
                    </h3>
                    <p className='mt-1 text-xs font-medium text-slate-500'>
                      {committeeCount} Standing Committees
                    </p>
                  </div>
                  <ChevronRight className='w-5 h-5 transition-all text-slate-300 group-hover:text-secondary-600 group-hover:translate-x-1' />
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
            className='border-l-4 shadow-sm border-l-slate-400'
          >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {managementTeam.map((official: ExecutiveOfficial) => (
                <Card
                  key={official.slug}
                  className='border-slate-100 bg-slate-50/30'
                >
                  <CardContent className='flex gap-4 items-center p-4'>
                    <CardAvatar
                      name={official.name}
                      size='sm'
                      className='font-bold bg-white border border-slate-200 text-slate-400 shadow-xs'
                    />
                    <div className='flex-1 min-w-0'>
                      <h4 className='text-sm font-bold leading-tight truncate text-slate-900'>
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
            <div className='pt-6 mt-8 text-center border-t border-slate-100'>
              <Link
                to='/government/departments'
                className='text-[10px] font-bold text-primary-600 uppercase tracking-widest hover:text-primary-700 flex items-center justify-center gap-1.5 transition-all group'
              >
                Browse all Government Departments
                <ArrowRight className='w-3 h-3 transition-transform group-hover:translate-x-1' />
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
      <Card hover className='flex flex-col h-full border-slate-100 shadow-xs'>
        <CardContent className='flex flex-col p-5 h-full'>
          <div className='flex gap-4 items-center mb-4'>
            <CardAvatar
              name={official.name}
              size='md'
              className='font-bold ring-2 ring-white shadow-sm bg-primary-50 text-primary-800'
            />
            <div className='flex-1 min-w-0'>
              <p className='text-[10px] font-bold text-primary-600 uppercase tracking-widest leading-none mb-1'>
                {official.role}
              </p>
              <h3 className='text-lg font-bold truncate transition-colors text-slate-900 group-hover:text-primary-700'>
                {toTitleCase(official.name)}
              </h3>
            </div>
            <div className='p-1.5 rounded-lg bg-slate-50 text-slate-300 group-hover:bg-primary-50 group-hover:text-primary-600 transition-all'>
              <ChevronRight className='w-4 h-4' />
            </div>
          </div>

          <div className='pt-4 mt-auto space-y-1.5 border-t border-slate-50'>
            {official.email && (
              <div className='flex items-center gap-2 text-[10px] font-medium text-slate-500'>
                <Mail className='w-3.5 h-3.5 text-primary-400' />
                <span className='truncate'>{official.email}</span>
              </div>
            )}
            {official.phone && (
              <div className='flex items-center gap-2 text-[10px] font-medium text-slate-500'>
                <Phone className='w-3.5 h-3.5 text-primary-400' />
                <span>{official.phone}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
