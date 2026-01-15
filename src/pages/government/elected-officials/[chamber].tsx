import { Link, useParams } from 'react-router-dom';

import { SiFacebook } from '@icons-pack/react-simple-icons';
import {
  ChevronRight,
  GavelIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  ShieldCheck,
  UsersIcon,
} from 'lucide-react';

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
import { EmptyState } from '@/components/ui/EmptyState';

import { toTitleCase } from '@/lib/stringUtils';

import legislativeData from '@/data/directory/legislative.json';

export default function LegislativeChamber() {
  const { chamber: slug } = useParams<{ chamber: string }>();
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
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
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

      <ModuleHeader
        title={data.chamber}
        description={`Official members and standing committees of the municipal council.`}
      />

      <div className='flex flex-col gap-8 xl:flex-row'>
        {/* LEFT: Main Content */}
        <div className='min-w-0 flex-1 space-y-8'>
          <DetailSection title='Council Members' icon={UsersIcon}>
            <div
              className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3'
              role='list'
            >
              {data.officials?.map(member => (
                <Card
                  key={member.name}
                  hover
                  className='flex flex-col border-slate-200 shadow-sm'
                >
                  <CardContent className='flex items-center gap-4 p-5'>
                    <CardAvatar
                      name={member.name}
                      size='md'
                      className='bg-primary-50 text-primary-800 border-primary-100 shrink-0 border font-bold'
                    />
                    <div className='min-w-0'>
                      <h4 className='truncate leading-tight font-bold text-slate-900'>
                        {toTitleCase(member.name)}
                      </h4>
                      <p className='text-primary-600 mt-1 text-[10px] font-bold tracking-widest uppercase'>
                        {member.role}
                      </p>
                    </div>
                  </CardContent>

                  {/* FOOTER: Contact & Social Logic */}
                  {(member.contact || member.website) && (
                    <div className='mt-auto flex items-center justify-between border-t border-slate-50 px-5 pt-3 pb-4'>
                      <div className='min-w-0 flex-1'>
                        {member.contact && member.contact !== '__' && (
                          <p className='flex items-center gap-1.5 text-[11px] font-bold tracking-tight text-slate-500 uppercase'>
                            <PhoneIcon className='h-3 w-3 text-slate-300' />{' '}
                            {member.contact}
                          </p>
                        )}
                      </div>

                      {/* SOCIAL/WEBSITE LINK: 44px touch target */}
                      {member.website && (
                        <a
                          href={member.website}
                          target='_blank'
                          rel='noreferrer'
                          title={`Visit ${toTitleCase(member.name)}'s official page`}
                          className='text-primary-600 hover:bg-primary-50 -m-2 flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg p-2 transition-all'
                        >
                          <SiFacebook className='h-4 w-4' />
                          <span className='sr-only'>Official Website</span>
                        </a>
                      )}
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </DetailSection>

          {data.permanent_committees && (
            <DetailSection title='Standing Committees' icon={GavelIcon}>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {data.permanent_committees.map(committee => (
                  <div
                    key={committee.committee}
                    className='hover:border-secondary-300 group rounded-2xl border border-slate-100 bg-white p-5 shadow-xs transition-all'
                  >
                    <h4 className='group-hover:text-secondary-700 mb-2 text-sm leading-snug font-bold text-slate-900 transition-colors'>
                      {committee.committee}
                    </h4>
                    <div className='flex items-center gap-2 border-t border-slate-50 pt-2'>
                      <span className='text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase'>
                        Chair:
                      </span>
                      <span className='truncate text-xs font-bold text-slate-700'>
                        {toTitleCase(committee.chairperson)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </DetailSection>
          )}
        </div>

        {/* RIGHT: Sidebar */}
        <aside className='w-full space-y-6 xl:w-80'>
          <DetailSection title='Contact Information' icon={ShieldCheck}>
            <div className='space-y-4'>
              {data.address && (
                <div className='flex items-start gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4'>
                  <MapPinIcon className='mt-1 h-4 w-4 shrink-0 text-slate-400' />
                  <div>
                    <p className='mb-1 text-[10px] leading-none font-bold tracking-widest text-slate-400 uppercase'>
                      Office Location
                    </p>
                    <p className='text-sm leading-snug font-bold text-slate-700'>
                      {data.address}
                    </p>
                  </div>
                </div>
              )}
              {data.website && (
                <a
                  href={
                    data.website.startsWith('http')
                      ? data.website
                      : `https://${data.website}`
                  }
                  target='_blank'
                  rel='noreferrer'
                  className='bg-primary-600 hover:bg-primary-700 shadow-primary-900/10 group flex min-h-[48px] w-full items-center justify-between rounded-xl p-4 font-bold text-white shadow-lg transition-all'
                >
                  <div className='flex items-center gap-3'>
                    <GlobeIcon className='h-4 w-4' />
                    <span className='text-sm tracking-tight'>
                      Visit Council Portal
                    </span>
                  </div>
                  <ChevronRight className='h-4 w-4 opacity-50 transition-transform group-hover:translate-x-1' />
                </a>
              )}
            </div>
          </DetailSection>

          {/* Records CTA: Secondary Orange Theme */}
          <div className='group relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl'>
            <div className='relative z-10 space-y-6'>
              <div className='space-y-2'>
                <Badge variant='secondary' dot>
                  Legislative Archive
                </Badge>
                <h3 className='text-xl font-bold'>Municipal Records</h3>
              </div>
              <p className='text-xs leading-relaxed text-slate-400'>
                Access the verified directory of local ordinances and
                resolutions passed by this 12th Sangguniang Bayan.
              </p>
              <Link
                to='/legislation'
                className='hover:bg-secondary-50 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-white py-3 text-sm font-bold text-slate-900 shadow-sm transition-all'
              >
                Browse Documents <ChevronRight className='h-4 w-4' />
              </Link>
            </div>
            <GavelIcon className='absolute right-[-10%] bottom-[-10%] h-40 w-40 -rotate-12 text-white/5 transition-transform group-hover:scale-110' />
          </div>
        </aside>
      </div>
    </div>
  );
}
