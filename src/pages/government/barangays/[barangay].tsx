import { useParams } from 'react-router-dom';

import {
  Briefcase,
  GlobeIcon,
  GraduationCapIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
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

import { toTitleCase } from '@/lib/stringUtils';

import barangaysData from '@/data/directory/barangays.json';

export default function BarangayDetail() {
  const { barangay: slug } = useParams();
  const barangay = barangaysData.find(b => b.slug === slug);

  if (!barangay)
    return <div className='p-20 text-center'>Barangay not found</div>;

  const punongBarangay = barangay.officials?.find(o =>
    o.role.includes('Punong Barangay')
  );
  const kagawads = barangay.officials?.filter(o =>
    o.role.includes('SB Member')
  );
  const skOfficials = barangay.officials?.filter(o => o.role.includes('SK'));
  const secretary = barangay.officials?.find(o => o.role.includes('Secretary'));
  const treasurer = barangay.officials?.find(o => o.role.includes('Treasurer'));

  const contactValue = barangay.trunkline?.[0];

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
            <BreadcrumbLink href='/government/barangays'>
              Barangays
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>
              {toTitleCase(barangay.barangay_name.replace('BARANGAY ', ''))}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- HERO HEADER --- */}
      <header className='relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white shadow-xl md:p-10'>
        <div className='relative z-10 max-w-3xl'>
          <div className='mb-3 flex items-center gap-2'>
            <Badge variant='secondary' dot>
              Official Barangay Profile
            </Badge>
          </div>
          <h1 className='mb-4 text-3xl font-extrabold tracking-tight md:text-5xl'>
            {toTitleCase(barangay.barangay_name)}
          </h1>
          <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm font-medium text-slate-300'>
            {barangay.address && (
              <span className='flex items-center gap-2'>
                <MapPinIcon className='text-secondary-400 h-4 w-4' />{' '}
                {barangay.address}
              </span>
            )}
          </div>
        </div>
        <UsersIcon className='absolute right-[-20px] bottom-[-40px] h-64 w-64 rotate-12 text-white/5' />
      </header>

      {/* --- CONTACT BAR (Full Width) --- */}
      <ContactContainer variant='grid' className='md:grid-cols-2'>
        <ContactItem
          icon={PhoneIcon}
          label='Trunkline / Contact'
          value={contactValue || 'No contact listed'}
          href={contactValue ? `tel:${contactValue}` : undefined}
        />
        <ContactItem
          icon={GlobeIcon}
          label='Official Facebook'
          value={barangay.website ? 'Visit Page' : 'Not available'}
          href={barangay.website}
          isExternal
        />
      </ContactContainer>

      {/* --- SECTION 1: CHIEF EXECUTIVE (Primary Blue) --- */}
      {punongBarangay && (
        <DetailSection
          title='Punong Barangay'
          icon={UserIcon}
          // Explicit Executive Styling
          className='border-l-primary-600 border-l-4'
        >
          <div className='bg-primary-50/50 border-primary-100 flex flex-col items-center gap-6 rounded-2xl border p-8 shadow-sm md:flex-row'>
            {/* Neutral Seal */}
            <div className='border-primary-100 text-primary-600 flex h-20 w-20 shrink-0 items-center justify-center rounded-full border-4 bg-white shadow-sm'>
              <UserIcon className='h-10 w-10' />
            </div>

            <div className='text-center md:text-left'>
              <h3 className='text-2xl font-black text-gray-900'>
                Hon. {toTitleCase(punongBarangay.name)}
              </h3>
              <Badge variant='primary' className='mt-2'>
                Chief Executive
              </Badge>
            </div>
          </div>
        </DetailSection>
      )}

      {/* --- SECTION 2: LEGISLATIVE BODIES (Secondary Orange) --- */}

      {/* Sangguniang Barangay */}
      <DetailSection
        title='Sangguniang Barangay'
        icon={UsersIcon}
        // Unified Legislative Styling (Orange)
        className='border-l-secondary-600 border-l-4'
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {kagawads?.map(member => (
            <Card
              key={member.name}
              hover
              className='border-secondary-100/50 hover:border-secondary-200 shadow-xs'
            >
              <CardContent className='flex items-center gap-3 p-4'>
                {/* Orange Icon Box */}
                <div className='bg-secondary-50 text-secondary-600 border-secondary-100 shrink-0 rounded-lg border p-2'>
                  <UsersIcon className='h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-secondary-500 mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
                    Barangay Kagawad
                  </p>
                  <p className='text-sm leading-tight font-bold text-slate-900'>
                    {toTitleCase(member.name)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DetailSection>

      {/* Sangguniang Kabataan */}
      <DetailSection
        title='Sangguniang Kabataan Council'
        icon={GraduationCapIcon}
        // Unified Legislative Styling (Orange)
        className='border-l-secondary-400 border-l-4'
      >
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3'>
          {skOfficials?.map(sk => (
            <Card
              key={sk.name}
              hover
              className='border-secondary-100/50 hover:border-secondary-200 shadow-xs'
            >
              <CardContent className='flex items-center gap-3 p-4'>
                {/* Orange Icon Box */}
                <div className='bg-secondary-50 text-secondary-600 border-secondary-100 shrink-0 rounded-lg border p-2'>
                  <GraduationCapIcon className='h-5 w-5' />
                </div>
                <div className='min-w-0'>
                  <p className='text-secondary-500 mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
                    {sk.role.replace('SK ', '')}
                  </p>
                  <p className='text-sm leading-tight font-bold text-slate-900'>
                    {toTitleCase(sk.name)}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </DetailSection>

      {/* --- SECTION 3: ADMINISTRATIVE (Secretary/Treasurer) --- */}
      <DetailSection title='Barangay Administration' icon={Briefcase}>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-2'>
          {/* Secretary */}
          <div className='flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm'>
              <Briefcase className='h-5 w-5' />
            </div>
            <div>
              <p className='text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
                Barangay Secretary
              </p>
              <p className='text-base font-bold text-slate-900'>
                {secretary ? toTitleCase(secretary.name) : 'Vacant / No Data'}
              </p>
            </div>
          </div>

          {/* Treasurer */}
          <div className='flex items-center gap-4 rounded-xl border border-slate-100 bg-slate-50 p-4'>
            <div className='flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-sm'>
              <Briefcase className='h-5 w-5' />
            </div>
            <div>
              <p className='text-[10px] font-bold tracking-wider text-slate-400 uppercase'>
                Barangay Treasurer
              </p>
              <p className='text-base font-bold text-slate-900'>
                {treasurer ? toTitleCase(treasurer.name) : 'Vacant / No Data'}
              </p>
            </div>
          </div>
        </div>
      </DetailSection>
    </div>
  );
}
