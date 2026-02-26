import { useMemo } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@bettergov/kapwa';
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
  personId?: string;
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
            className='border-l-kapwa-border-brand h-full border-l-4 shadow-sm'
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
            className='border-l-kapwa-border-accent-orange h-full border-l-4 shadow-sm'
          >
            <div className='grid grid-cols-1 gap-4'>
              {/* SB Card */}
              <Link
                to='/government/elected-officials/12th-sangguniang-bayan'
                className='group min-h-[44px]'
              >
                <Card hover className='border-kapwa-border-weak h-full'>
                  <CardContent className='flex items-center gap-5 p-5'>
                    <div className='bg-kapwa-bg-accent-orange-default text-kapwa-text-inverse flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-md'>
                      <Users className='h-7 w-7' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-strong text-lg leading-tight font-bold transition-colors'>
                        12th Sangguniang Bayan
                      </h3>
                      <p className='text-kapwa-text-disabled mt-1 text-xs font-medium'>
                        Council Members & Profiles
                      </p>
                    </div>
                    <ChevronRight className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-support h-5 w-5 transition-all group-hover:translate-x-1' />
                  </CardContent>
                </Card>
              </Link>

              {/* Committees Card */}
              <Link
                to='/government/elected-officials/municipal-committees'
                className='group min-h-[44px]'
              >
                <Card hover className='border-kapwa-border-weak h-full'>
                  <CardContent className='flex items-center gap-5 p-5'>
                    <div className='bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange border-kapwa-border-accent-orange flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border'>
                      <BookOpen className='h-7 w-7' />
                    </div>
                    <div className='flex-1'>
                      <h3 className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-strong text-lg leading-tight font-bold transition-colors'>
                        Municipal Committees
                      </h3>
                      <p className='text-kapwa-text-disabled mt-1 text-xs font-medium'>
                        {committeeCount} Standing Committees
                      </p>
                    </div>
                    <ChevronRight className='group-hover:text-kapwa-text-accent-orange text-kapwa-text-support h-5 w-5 transition-all group-hover:translate-x-1' />
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
          className='border-l-4 border-l-kapwa-border-strong shadow-sm'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {keyAdminStaff.map((official: ExecutiveOfficial) => (
              <Card
                key={official.slug}
                className='bg-kapwa-bg-surface border-kapwa-border-weak shadow-xs'
              >
                <CardContent className='flex items-start gap-3 p-4'>
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-disabled shrink-0 rounded-lg border p-2'>
                    <User2 className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h4 className='text-kapwa-text-strong text-sm leading-snug font-bold'>
                      {toTitleCase(official.name)}
                    </h4>
                    <p className='text-kapwa-text-brand mt-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                      {official.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Call to Action for Departments */}
          <div className='border-kapwa-border-weak mt-6 border-t pt-6 text-center'>
            <div className='bg-kapwa-bg-surface-raised flex flex-col items-center justify-between gap-4 rounded-xl p-6 md:flex-row'>
              <div className='text-left'>
                <h4 className='text-kapwa-text-strong font-bold'>
                  Looking for specific departments?
                </h4>
                <p className='text-kapwa-text-disabled text-sm'>
                  Find the Assessor, Treasurer, Engineer, and other department
                  heads in the directory.
                </p>
              </div>
              <Link to='/government/departments'>
                <Button
                  variant='outline'
                  size='sm'
                  className='text-[10px] font-bold tracking-widest uppercase'
                  rightIcon={<ArrowRight className='h-3 w-3' />}
                >
                  Go to Departments
                </Button>
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
      <Card
        hover
        className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
      >
        <CardContent className='flex flex-col space-y-6 p-6'>
          {/* Header Section */}
          <div className='flex items-start gap-5'>
            {/* Large Neutral Icon Box */}
            <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border shadow-sm'>
              <Icon className='h-8 w-8' />
            </div>

            <div className='min-w-0 flex-1 py-1'>
              <p className='text-kapwa-text-brand mb-1.5 text-[10px] leading-none font-bold tracking-widest uppercase'>
                {official.role}
              </p>
              <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-xl leading-tight font-extrabold transition-colors'>
                Hon. {toTitleCase(official.name)}
              </h3>
            </div>

            <div className='group-hover:bg-kapwa-bg-surface-brand group-hover:text-kapwa-text-brand bg-kapwa-bg-surface-raised text-kapwa-text-support shrink-0 rounded-lg p-2 transition-all'>
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
