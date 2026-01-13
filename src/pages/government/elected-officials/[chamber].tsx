import { useParams, Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  UsersIcon,
  GavelIcon,
  ChevronRight,
} from 'lucide-react';

import legislativeData from '@/data/directory/legislative.json';
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { Card, CardContent, CardAvatar } from '@/components/ui/CardList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import { EmptyState } from '@/components/ui/EmptyState';

export default function LegislativeChamber() {
  const { chamber: slug } = useParams();
  const data = legislativeData.find(item => item.slug === slug);

  if (!data) {
    return (
      <EmptyState
        title='Chamber Not Found'
        message='The legislative body you are looking for is unavailable.'
        actionHref='/government/elected-officials'
      />
    );
  }

  return (
    <div className='max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500'>
      {/* 1. Responsive Breadcrumbs (Hide on very small mobile) */}
      <div className='hidden sm:block'>
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
              <BreadcrumbPage>{data.chamber}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      {/* 2. Responsive Header: Text scales down for mid-size windows */}
      <ModuleHeader
        title={data.chamber}
        description='Official members and standing committees of the municipal council.'
      />

      {/* 3. Main Layout: Stacks on 'lg' (1024px) to prevent squeezing on half-screens */}
      <div className='flex flex-col xl:flex-row gap-8'>
        {/* LEFT: Main Content (Takes full width until 1280px) */}
        <div className='flex-1 min-w-0 space-y-8'>
          {/* Council Members Grid: Uses auto-fit for better spacing */}
          <DetailSection title='Council Members' icon={UsersIcon}>
            <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4'>
              {data.officials?.map(member => (
                <Card
                  key={member.name}
                  hover
                  className='border-gray-100 flex flex-col'
                >
                  <CardContent className='flex items-center gap-4 p-4'>
                    <CardAvatar
                      name={member.name}
                      size='md'
                      className='shrink-0 bg-primary-50 text-primary-700 font-bold'
                    />
                    <div className='min-w-0'>
                      <h4 className='font-bold text-gray-900 leading-tight truncate'>
                        {member.name}
                      </h4>
                      <p className='text-[10px] text-primary-600 font-bold uppercase tracking-wider mt-1'>
                        {member.role}
                      </p>
                    </div>
                  </CardContent>
                  {member.contact && member.contact !== '__' && (
                    <div className='px-4 pb-4 mt-auto'>
                      <p className='text-xs text-gray-400 flex items-center gap-1.5'>
                        <PhoneIcon className='w-3 h-3' /> {member.contact}
                      </p>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </DetailSection>

          {/* Committees: 1 column on narrow, 2 on wide */}
          {data.permanent_committees && (
            <DetailSection title='Standing Committees' icon={GavelIcon}>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {data.permanent_committees.map(committee => (
                  <div
                    key={committee.committee}
                    className='p-4 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-white hover:shadow-sm transition-all'
                  >
                    <h4 className='font-bold text-gray-900 text-sm mb-1 leading-snug'>
                      {committee.committee}
                    </h4>
                    <p className='text-[11px] text-gray-500'>
                      Chair:{' '}
                      <span className='font-semibold text-gray-700'>
                        {committee.chairperson || committee.name}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT: Sidebar (Moves to bottom on half-screen windows) */}
        <aside className='w-full xl:w-80 space-y-6'>
          <DetailSection title='Contact & Office'>
            <div className='grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-1 gap-4'>
              {data.address && (
                <div className='flex items-start gap-3 p-3 rounded-lg bg-gray-50/50'>
                  <MapPinIcon className='w-4 h-4 text-gray-400 shrink-0 mt-1' />
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase leading-none mb-1'>
                      Location
                    </p>
                    <p className='text-sm font-medium text-gray-700 leading-snug'>
                      {data.address}
                    </p>
                  </div>
                </div>
              )}
              {data.trunkline && (
                <div className='flex items-start gap-3 p-3 rounded-lg bg-gray-50/50'>
                  <PhoneIcon className='w-4 h-4 text-gray-400 shrink-0 mt-1' />
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase leading-none mb-1'>
                      Phone
                    </p>
                    <p className='text-sm font-medium text-gray-700'>
                      {data.trunkline}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {data.website && (
              <a
                href={data.website}
                target='_blank'
                rel='noreferrer'
                className='mt-4 flex items-center justify-between p-3 rounded-lg bg-primary-600 text-white hover:bg-primary-700 transition-colors'
              >
                <div className='flex items-center gap-2'>
                  <GlobeIcon className='w-4 h-4' />
                  <span className='text-sm font-bold'>Official Website</span>
                </div>
                <ChevronRight className='w-4 h-4 opacity-50' />
              </a>
            )}
          </DetailSection>

          {/* Action Card */}
          <div className='p-6 rounded-2xl bg-slate-900 text-white shadow-xl relative overflow-hidden group'>
            <div className='relative z-10'>
              <h3 className='font-bold text-lg mb-2'>Legislative Records</h3>
              <p className='text-xs text-slate-400 mb-6'>
                Review official ordinances and resolutions passed by this
                council.
              </p>
              <Link
                to='/legislation'
                className='w-full flex items-center justify-center gap-2 bg-white text-slate-900 py-2.5 rounded-xl text-xs font-bold hover:bg-primary-50 transition-all'
              >
                Browse Documents <ChevronRight className='w-3 h-3' />
              </Link>
            </div>
            <GavelIcon className='absolute right-[-10%] bottom-[-10%] w-32 h-32 text-white/5 -rotate-12 transition-transform group-hover:scale-110' />
          </div>
        </aside>
      </div>
    </div>
  );
}
