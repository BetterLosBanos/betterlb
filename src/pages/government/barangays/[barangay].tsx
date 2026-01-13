import { useParams } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  MailIcon,
  UserIcon,
  UsersIcon,
  ShieldCheckIcon,
  GraduationCapIcon,
} from 'lucide-react';
import { DetailSection } from '@/components/layout/PageLayouts';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
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
    <div className='space-y-6 duration-500 animate-in fade-in'>
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
      <header className='overflow-hidden relative p-8 text-white bg-gradient-to-br rounded-2xl shadow-xl from-slate-900 to-slate-800'>
        <div className='relative z-10 max-w-3xl'>
          <div className='flex gap-2 items-center mb-2'>
            <ShieldCheckIcon className='w-5 h-5 text-primary-400' />
            <span className='text-xs font-bold tracking-widest uppercase text-primary-400'>
              Official Barangay Profile
            </span>
          </div>
          <h1 className='mb-4 text-4xl font-extrabold'>
            {barangay.barangay_name}
          </h1>
          <div className='flex flex-wrap gap-y-2 gap-x-6 text-sm text-slate-300'>
            {barangay.address && (
              <span className='flex gap-2 items-center'>
                <MapPinIcon className='w-4 h-4 text-primary-400' />{' '}
                {barangay.address}
              </span>
            )}
          </div>
        </div>
        <UsersIcon className='absolute right-[-20px] bottom-[-20px] w-64 h-64 text-white/5 rotate-12' />
      </header>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
        {/* Main Column */}
        <div className='space-y-8 lg:col-span-2'>
          {/* Executive Leadership */}
          {punongBarangay && (
            <DetailSection title='Chief Executive' icon={UserIcon}>
              <div className='flex flex-col gap-6 items-center p-6 rounded-2xl border md:flex-row bg-primary-50/50 border-primary-100'>
                <CardAvatar
                  name={punongBarangay.name}
                  size='lg'
                  className='ring-4 ring-white shadow-lg'
                />
                <div className='text-center md:text-left'>
                  <h3 className='text-2xl font-bold text-gray-900'>
                    {punongBarangay.name}
                  </h3>
                  <p className='text-sm font-bold tracking-wider uppercase text-primary-700'>
                    Punong Barangay
                  </p>
                  <div className='flex flex-wrap gap-4 justify-center mt-4 text-sm text-gray-600 md:justify-start'>
                    {barangay.email && (
                      <span className='flex gap-1 items-center'>
                        <MailIcon className='w-4 h-4' /> {barangay.email}
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
                  className='flex gap-4 items-center p-4 rounded-xl border border-gray-100 transition-colors hover:bg-gray-50'
                >
                  <CardAvatar name={member.name} size='sm' />
                  <div>
                    <p className='font-bold leading-tight text-gray-900'>
                      {member.name}
                    </p>
                    <p className='text-[10px] text-gray-400 font-bold uppercase tracking-tighter'>
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
                  className='flex gap-4 items-center p-4 rounded-xl border border-indigo-50 bg-indigo-50/20'
                >
                  <div className='flex justify-center items-center w-10 h-10 text-sm font-bold text-indigo-700 bg-indigo-100 rounded-full'>
                    {sk.name[0]}
                  </div>
                  <div>
                    <p className='text-sm font-bold leading-tight text-gray-900'>
                      {sk.name}
                    </p>
                    <p className='text-[10px] text-indigo-500 font-bold uppercase'>
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
                  className='flex gap-3 items-center p-3 rounded-lg border border-gray-100 transition-all hover:bg-primary-50 hover:border-primary-200 group'
                >
                  <div className='p-2 text-gray-400 bg-gray-100 rounded-md transition-colors group-hover:bg-primary-100 group-hover:text-primary-600'>
                    <PhoneIcon className='w-4 h-4' />
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
                  className='flex gap-3 items-center p-3 text-white rounded-lg transition-colors bg-slate-800 hover:bg-slate-700' rel="noreferrer"
                >
                  <div className='p-2 rounded-md bg-slate-700'>
                    <GlobeIcon className='w-4 h-4' />
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
              <div className='pt-2 border-t border-gray-100'>
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
