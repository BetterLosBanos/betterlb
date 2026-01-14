import { useParams, Link } from 'react-router-dom';
import {
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  UsersIcon,
  GavelIcon,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { SiFacebook } from '@icons-pack/react-simple-icons';
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
import { toTitleCase } from '@/lib/stringUtils';
import { Badge } from '@/components/ui/Badge';

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
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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
        <div className='flex-1 space-y-8 min-w-0'>
          <DetailSection title='Council Members' icon={UsersIcon}>
            <div
              className='grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3'
              role='list'
            >
              {data.officials?.map(member => (
                <Card
                  key={member.name}
                  hover
                  className='flex flex-col shadow-sm border-slate-200'
                >
                  <CardContent className='flex gap-4 items-center p-5'>
                    <CardAvatar
                      name={member.name}
                      size='md'
                      className='font-bold border bg-primary-50 text-primary-800 shrink-0 border-primary-100'
                    />
                    <div className='min-w-0'>
                      <h4 className='font-bold leading-tight truncate text-slate-900'>
                        {toTitleCase(member.name)}
                      </h4>
                      <p className='text-[10px] font-bold tracking-widest uppercase text-primary-600 mt-1'>
                        {member.role}
                      </p>
                    </div>
                  </CardContent>

                  {/* FOOTER: Contact & Social Logic */}
                  {(member.contact || member.website) && (
                    <div className='flex justify-between items-center px-5 pt-3 pb-4 mt-auto border-t border-slate-50'>
                      <div className='flex-1 min-w-0'>
                        {member.contact && member.contact !== '__' && (
                          <p className='flex gap-1.5 items-center text-[11px] text-slate-500 font-bold uppercase tracking-tight'>
                            <PhoneIcon className='w-3 h-3 text-slate-300' />{' '}
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
                          className='flex items-center justify-center p-2 -m-2 rounded-lg text-primary-600 hover:bg-primary-50 transition-all min-w-[44px] min-h-[44px]'
                        >
                          <SiFacebook className='w-4 h-4' />
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
                    className='p-5 bg-white rounded-2xl border transition-all border-slate-100 hover:border-secondary-300 group shadow-xs'
                  >
                    <h4 className='mb-2 text-sm font-bold leading-snug transition-colors text-slate-900 group-hover:text-secondary-700'>
                      {committee.committee}
                    </h4>
                    <div className='flex gap-2 items-center pt-2 border-t border-slate-50'>
                      <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none'>
                        Chair:
                      </span>
                      <span className='text-xs font-bold truncate text-slate-700'>
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
        <aside className='space-y-6 w-full xl:w-80'>
          <DetailSection title='Contact Information' icon={ShieldCheck}>
            <div className='space-y-4'>
              {data.address && (
                <div className='flex gap-3 items-start p-4 rounded-xl border bg-slate-50 border-slate-100'>
                  <MapPinIcon className='mt-1 w-4 h-4 shrink-0 text-slate-400' />
                  <div>
                    <p className='mb-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase leading-none'>
                      Office Location
                    </p>
                    <p className='text-sm font-bold leading-snug text-slate-700'>
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
                  className='flex justify-between items-center p-4 w-full font-bold text-white rounded-xl shadow-lg transition-all bg-primary-600 hover:bg-primary-700 shadow-primary-900/10 group min-h-[48px]'
                >
                  <div className='flex gap-3 items-center'>
                    <GlobeIcon className='w-4 h-4' />
                    <span className='text-sm tracking-tight'>
                      Visit Council Portal
                    </span>
                  </div>
                  <ChevronRight className='w-4 h-4 opacity-50 transition-transform group-hover:translate-x-1' />
                </a>
              )}
            </div>
          </DetailSection>

          {/* Records CTA: Secondary Orange Theme */}
          <div className='overflow-hidden relative p-8 text-white rounded-3xl shadow-xl bg-slate-900 group'>
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
                className='flex gap-2 justify-center items-center py-3 w-full text-sm font-bold text-slate-900 bg-white rounded-xl transition-all hover:bg-secondary-50 min-h-[48px] shadow-sm'
              >
                Browse Documents <ChevronRight className='w-4 h-4' />
              </Link>
            </div>
            <GavelIcon className='absolute right-[-10%] bottom-[-10%] w-40 h-40 text-white/5 -rotate-12 transition-transform group-hover:scale-110' />
          </div>
        </aside>
      </div>
    </div>
  );
}
