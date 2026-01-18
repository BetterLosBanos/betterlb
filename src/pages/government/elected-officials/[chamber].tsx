import { Link, useParams } from 'react-router-dom';

import { SiFacebook } from '@icons-pack/react-simple-icons';
import {
  ChevronRight,
  GavelIcon,
  GlobeIcon,
  MapPinIcon,
  PhoneIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { DetailSection, ModuleHeader } from '@/components/layout/PageLayouts';
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

  const websiteUrl = data.website
    ? data.website.startsWith('http')
      ? data.website
      : `https://${data.website}`
    : undefined;

  return (
    <div className='animate-in fade-in mx-auto w-full space-y-8 pb-20 duration-500'>
      {/* Breadcrumb & Header remain the same... */}
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

      {(data.address || data.website) && (
        <ContactContainer variant='grid' className='md:grid-cols-2'>
          <ContactItem
            icon={MapPinIcon}
            label='Office Location'
            value={data.address}
          />
          <ContactItem
            icon={GlobeIcon}
            label='Official Portal'
            value='Visit Website'
            href={websiteUrl}
            isExternal
          />
        </ContactContainer>
      )}

      {/* --- 2. COUNCIL MEMBERS --- */}
      <DetailSection title='Council Members' icon={UsersIcon}>
        <div
          className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3'
          role='list'
        >
          {data.officials?.map(member => (
            <Card
              key={member.name}
              hover
              className='flex flex-col border-slate-200 shadow-sm'
            >
              <CardContent className='p-4 md:p-5'>
                {/* 
                   NEW LAYOUT: Flex container with Icon 
                   Uses items-start for correct alignment if text wraps
                */}
                <div className='flex items-start gap-3'>
                  {/* Compact Icon Container (~36px) */}
                  <div className='bg-primary-50 text-primary-600 border-primary-100/50 mt-0.5 shrink-0 rounded-lg border p-2'>
                    <UserIcon className='h-4 w-4' />
                  </div>

                  <div className='min-w-0'>
                    <p className='text-primary-600 mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
                      {member.role}
                    </p>
                    <h4 className='wrap-break-words text-base leading-tight font-bold text-slate-900'>
                      {toTitleCase(member.name)}
                    </h4>
                  </div>
                </div>
              </CardContent>

              {/* Footer remains the same */}
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

      {/* Committees & CTA remain the same... */}
      {data.permanent_committees && (
        <DetailSection title='Standing Committees' icon={GavelIcon}>
          <div className='grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3'>
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

      {/* CTA Banner */}
      <div className='group relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12'>
        <div className='relative z-10 flex flex-col items-start justify-between gap-8 md:flex-row md:items-center'>
          <div className='max-w-2xl space-y-4'>
            <div className='flex items-center gap-3'>
              <Badge variant='secondary' dot>
                Legislative Archive
              </Badge>
              <span className='text-xs font-bold tracking-widest text-slate-400 uppercase'>
                Public Records
              </span>
            </div>
            <h3 className='text-2xl font-extrabold tracking-tight md:text-3xl'>
              Municipal Ordinances & Resolutions
            </h3>
            <p className='text-base leading-relaxed text-slate-400'>
              Access the verified directory of local laws, ordinances, and
              resolutions passed by the {data.chamber}.
            </p>
          </div>

          <Link
            to='/legislation'
            className='hover:bg-secondary-50 flex min-h-[56px] w-full shrink-0 items-center justify-center gap-3 rounded-xl bg-white px-8 text-sm font-bold text-slate-900 shadow-lg transition-all md:w-auto'
          >
            Browse Documents <ChevronRight className='h-4 w-4' />
          </Link>
        </div>

        <GavelIcon className='absolute right-[-5%] bottom-[-20%] h-64 w-64 -rotate-12 text-white/5 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0' />
      </div>
    </div>
  );
}
