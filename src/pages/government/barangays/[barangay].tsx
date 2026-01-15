import { useParams } from 'react-router-dom';

import {
  GlobeIcon,
  GraduationCapIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheckIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/Breadcrumb';
import { CardAvatar } from '@/components/ui/CardList';

import barangaysData from '@/data/directory/barangays.json';

export default function BarangayDetail() {
  const { barangay: slug } = useParams();
  const barangay = barangaysData.find(b => b.slug === slug);

  if (!barangay)
    return <div className='p-20 text-center'>Barangay not found</div>;

  // Grouping officials
  const punongBarangay = barangay.officials?.find(o =>
    o.role.includes('Punong Barangay')
  );
  const kagawads = barangay.officials?.filter(o =>
    o.role.includes('SB Member')
  );
  const skOfficials = barangay.officials?.filter(o => o.role.includes('SK'));
  const secretary = barangay.officials?.find(o => o.role.includes('Secretary'));
  const treasurer = barangay.officials?.find(o => o.role.includes('Treasurer'));

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      {/* Breadcrumbs Integration */}
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
              {barangay.barangay_name.replace('BARANGAY ', '')}
            </BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Hero Header */}
      <header className='relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-8 text-white shadow-xl'>
        <div className='relative z-10 max-w-3xl'>
          <div className='mb-2 flex items-center gap-2'>
            <ShieldCheckIcon className='text-primary-400 h-5 w-5' />
            <span className='text-primary-400 text-xs font-bold tracking-widest uppercase'>
              Official Barangay Profile
            </span>
          </div>
          <h1 className='mb-4 text-4xl font-extrabold'>
            {barangay.barangay_name}
          </h1>
          <div className='flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-300'>
            {barangay.address && (
              <span className='flex items-center gap-2'>
                <MapPinIcon className='text-primary-400 h-4 w-4' />{' '}
                {barangay.address}
              </span>
            )}
          </div>
        </div>
        <UsersIcon className='absolute right-[-20px] bottom-[-20px] h-64 w-64 rotate-12 text-white/5' />
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Column */}
        <div className='space-y-8 lg:col-span-2'>
          {/* Executive Leadership */}
          {punongBarangay && (
            <DetailSection title='Chief Executive' icon={UserIcon}>
              <div className='bg-primary-50/50 border-primary-100 flex flex-col items-center gap-6 rounded-2xl border p-6 md:flex-row'>
                <CardAvatar
                  name={punongBarangay.name}
                  size='lg'
                  className='shadow-lg ring-4 ring-white'
                />
                <div className='text-center md:text-left'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    {punongBarangay.name}
                  </h3>
                  <p className='text-primary-700 text-sm font-bold tracking-wider uppercase'>
                    Punong Barangay
                  </p>
                  <div className='mt-4 flex flex-wrap justify-center gap-4 text-sm text-gray-600 md:justify-start'>
                    {barangay.email && (
                      <span className='flex items-center gap-1'>
                        <MailIcon className='h-4 w-4' /> {barangay.email}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </DetailSection>
          )}

          {/* Sangguniang Barangay */}
          <DetailSection title='Sangguniang Barangay Members' icon={UsersIcon}>
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {kagawads?.map(member => (
                <div
                  key={member.name}
                  className='flex items-center gap-4 rounded-xl border border-gray-100 p-4 transition-colors hover:bg-gray-50'
                >
                  <CardAvatar name={member.name} size='sm' />
                  <div>
                    <p className='leading-tight font-bold text-gray-900'>
                      {member.name}
                    </p>
                    <p className='text-[10px] font-bold tracking-tighter text-gray-400 uppercase'>
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>

          {/* SK Council */}
          <DetailSection
            title='Sangguniang Kabataan'
            icon={GraduationCapIcon}
            className='border-indigo-100'
          >
            <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
              {skOfficials?.map(sk => (
                <div
                  key={sk.name}
                  className='flex items-center gap-4 rounded-xl border border-indigo-50 bg-indigo-50/20 p-4'
                >
                  <div className='flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700'>
                    {sk.name[0]}
                  </div>
                  <div>
                    <p className='text-sm leading-tight font-bold text-gray-900'>
                      {sk.name}
                    </p>
                    <p className='text-[10px] font-bold text-indigo-500 uppercase'>
                      {sk.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </DetailSection>
        </div>

        {/* Sidebar Column */}
        <aside className='space-y-6'>
          <DetailSection title='Barangay Hall Contact'>
            <div className='space-y-3'>
              {barangay.trunkline?.map((line, i) => (
                <a
                  key={i}
                  href={`tel:${line}`}
                  className='hover:bg-primary-50 hover:border-primary-200 group flex items-center gap-3 rounded-lg border border-gray-100 p-3 transition-all'
                >
                  <div className='group-hover:bg-primary-100 group-hover:text-primary-600 rounded-md bg-gray-100 p-2 text-gray-400 transition-colors'>
                    <PhoneIcon className='h-4 w-4' />
                  </div>
                  <span className='text-sm font-medium text-gray-700'>
                    {line}
                  </span>
                </a>
              ))}

              {barangay.website && (
                <a
                  href={barangay.website}
                  target='_blank'
                  className='flex items-center gap-3 rounded-lg bg-slate-800 p-3 text-white transition-colors hover:bg-slate-700'
                  rel='noreferrer'
                >
                  <div className='rounded-md bg-slate-700 p-2'>
                    <GlobeIcon className='h-4 w-4' />
                  </div>
                  <span className='text-sm font-medium'>Official Facebook</span>
                </a>
              )}
            </div>
          </DetailSection>

          {/* Appointed Officials */}
          <DetailSection title='Administrative' className='bg-gray-50/50'>
            <div className='space-y-4'>
              <div>
                <p className='text-[10px] font-bold text-gray-400 uppercase'>
                  Secretary
                </p>
                <p className='text-sm font-semibold text-gray-900'>
                  {secretary?.name || '---'}
                </p>
              </div>
              <div className='border-t border-gray-100 pt-2'>
                <p className='text-[10px] font-bold text-gray-400 uppercase'>
                  Treasurer
                </p>
                <p className='text-sm font-semibold text-gray-900'>
                  {treasurer?.name || '---'}
                </p>
              </div>
            </div>
          </DetailSection>
        </aside>
      </div>
    </div>
  );
}
