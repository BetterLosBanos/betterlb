import { useMemo } from 'react';

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
  User2,
  Users,
} from 'lucide-react';

// Shared Components
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';

import { toTitleCase } from '@/lib/stringUtils';

import executiveData from '@/data/directory/executive.json';
import legislativeData from '@/data/directory/legislative.json';

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
  icon: typeof Landmark; // Lucide Icon type
}

export default function ElectedOfficialsIndex() {
  const allExecutive = executiveData as ExecutiveOfficial[];

  const mayor = allExecutive.find(o => o.slug === 'office-of-the-mayor');
  const viceMayor = allExecutive.find(
    o => o.slug === 'office-of-the-vice-mayor'
  );

  // Filter Management to only Key Admin Staff
  const keyAdminStaff = useMemo(() => {
    return allExecutive.filter(o => {
      if (o.isElected) return false;
      const r = o.role.toLowerCase();
      return (
        r.includes('administrator') ||
        r.includes('secretary to the') ||
        r.includes('legal officer')
      );
    });
  }, [allExecutive]);

  const sbChamber = legislativeData.find(
    o => o.slug === '12th-sangguniang-bayan'
  );
  const committeeCount = sbChamber?.permanent_committees?.length || 0;

  return (
    <div className='animate-in fade-in space-y-8 pb-20 duration-500'>
      <ModuleHeader
        title='Municipal Leadership'
        description='Meet the elected leaders and appointed management of the Science and Nature City.'
      />

      <div className='grid grid-cols-1 gap-8 xl:grid-cols-2'>
        {/* --- LEFT COLUMN: EXECUTIVE --- */}
        <div className='space-y-8'>
          <DetailSection
            title='Executive Branch'
            icon={Landmark}
            className='border-l-primary-600 h-full border-l-4 shadow-sm'
          >
            <div className='grid grid-cols-1 gap-6'>
              {mayor && (
                <OfficialCard
                  href='/government/elected-officials/executive-branch'
                  official={mayor}
                  icon={Landmark}
                />
              )}
              {viceMayor && (
                <OfficialCard
                  href='/government/elected-officials/executive-branch'
                  official={viceMayor}
                  icon={Gavel}
                />
              )}
            </div>
          </DetailSection>
        </div>

        {/* --- RIGHT COLUMN: LEGISLATIVE --- */}
        <div className='space-y-8'>
          <DetailSection
            title='Legislative Branch'
            icon={Gavel}
            className='border-l-secondary-600 h-full border-l-4 shadow-sm'
          >
            <div className='grid grid-cols-1 gap-4'>
              {/* SB Card */}
              <Link
                to='/government/elected-officials/12th-sangguniang-bayan'
                className='group min-h-[44px]'
              >
                <Card hover className='h-full border-slate-100'>
                  <CardContent className='flex items-center gap-5 p-5'>
                    <div className='bg-secondary-600 shadow-secondary-900/10 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-md'>
                      <Users className='h-7 w-7' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='group-hover:text-secondary-700 text-lg leading-tight font-bold text-slate-900 transition-colors'>
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

              {/* Committees Card */}
              <Link
                to='/government/elected-officials/municipal-committees'
                className='group min-h-[44px]'
              >
                <Card hover className='h-full border-slate-100'>
                  <CardContent className='flex items-center gap-5 p-5'>
                    <div className='bg-secondary-50 text-secondary-600 border-secondary-100 flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border'>
                      <BookOpen className='h-7 w-7' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='group-hover:text-secondary-700 text-lg leading-tight font-bold text-slate-900 transition-colors'>
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
        </div>
      </div>

      {/* --- SECTION 3: KEY MANAGEMENT --- */}
      {keyAdminStaff.length > 0 && (
        <DetailSection
          title='Office of the Mayor: Key Staff'
          icon={Briefcase}
          className='border-l-4 border-l-slate-400 shadow-sm'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {keyAdminStaff.map((official: ExecutiveOfficial) => (
              <Card
                key={official.slug}
                className='border-slate-100 bg-white shadow-xs'
              >
                <CardContent className='flex items-start gap-3 p-4'>
                  <div className='shrink-0 rounded-lg border border-slate-200 bg-slate-50 p-2 text-slate-400'>
                    <User2 className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='text-sm leading-snug font-bold text-slate-900'>
                      {toTitleCase(official.name)}
                    </h4>
                    <p className='text-primary-600 mt-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                      {official.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action for Departments */}
          <div className='mt-6 border-t border-slate-100 pt-6 text-center'>
            <div className='flex flex-col items-center justify-between gap-4 rounded-xl bg-slate-50 p-6 md:flex-row'>
              <div className='text-left'>
                <h4 className='font-bold text-slate-900'>
                  Looking for specific departments?
                </h4>
                <p className='text-sm text-slate-500'>
                  Find the Assessor, Treasurer, Engineer, and other department
                  heads in the directory.
                </p>
              </div>
              <Link
                to='/government/departments'
                className='text-primary-600 hover:text-primary-700 group inline-flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-5 py-3 text-[10px] font-bold tracking-widest uppercase shadow-sm transition-all hover:shadow-md'
              >
                Go to Departments
                <ArrowRight className='h-3 w-3 transition-transform group-hover:translate-x-1' />
              </Link>
            </div>
          </div>
        </DetailSection>
      )}
    </div>
  );
}

// Updated OfficialCard: Hero Style with Big Contact Info
function OfficialCard({ href, official, icon: Icon }: OfficialCardProps) {
  return (
    <Link to={href} className='group block'>
      <Card hover className='flex h-full flex-col border-slate-100 shadow-xs'>
        <CardContent className='flex flex-col space-y-6 p-6'>
          {/* Header Section */}
          <div className='flex items-start gap-5'>
            {/* Large Neutral Icon Box */}
            <div className='bg-primary-50 text-primary-600 border-primary-100 flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border shadow-sm'>
              <Icon className='h-8 w-8' />
            </div>

            <div className='min-w-0 flex-1 py-1'>
              <p className='text-primary-600 mb-1.5 text-[10px] leading-none font-bold tracking-widest uppercase'>
                {official.role}
              </p>
              <h3 className='group-hover:text-primary-700 text-xl leading-tight font-extrabold text-slate-900 transition-colors'>
                Hon. {toTitleCase(official.name)}
              </h3>
            </div>

            <div className='group-hover:bg-primary-50 group-hover:text-primary-600 shrink-0 rounded-lg bg-slate-50 p-2 text-slate-300 transition-all'>
              <ChevronRight className='h-5 w-5' />
            </div>
          </div>

          {/* Expanded Contact Info using Components */}
          {(official.email || official.phone) && (
            <div className='w-full'>
              <ContactContainer variant='stack'>
                <ContactItem
                  icon={Mail}
                  label='Email Address'
                  value={official.email}
                />
                <ContactItem
                  icon={Phone}
                  label='Office Line'
                  value={official.phone}
                />
              </ContactContainer>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
