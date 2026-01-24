import { Link, useParams } from 'react-router-dom';

import { SiFacebook } from '@icons-pack/react-simple-icons';
import {
  BookOpenIcon,
  ChevronRight,
  GavelIcon,
  GlobeIcon,
  MapPinIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

// CORRECTED IMPORT PATH
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

// --- Types ---
interface Committee {
  committee: string;
  chairperson: string;
}

interface Official {
  name: string;
  role: string;
  website?: string;
  contact?: string;
}

interface ChamberData {
  slug: string;
  chamber: string;
  address?: string;
  website?: string;
  officials: Official[];
  permanent_committees?: Committee[];
}

export default function LegislativeChamber() {
  const { chamber: slug } = useParams<{ chamber: string }>();

  const data = legislativeData.find(item => item.slug === slug) as
    | ChamberData
    | undefined;

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

  const getChairedCommittees = (memberName: string) => {
    return (
      data.permanent_committees?.filter(
        c => c.chairperson?.toLowerCase() === memberName.toLowerCase()
      ) || []
    );
  };

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-8 pb-20 duration-500'>
      {/* --- Breadcrumbs --- */}
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

      {/* --- Header --- */}
      <ModuleHeader
        title={data.chamber}
        description={`Official members and legislative officers of the municipal council.`}
      />

      {/* --- Contact Info --- */}
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

      {/* --- COUNCIL MEMBERS GRID --- */}
      <DetailSection title='Council Members' icon={UsersIcon}>
        <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {data.officials?.map(member => {
            const chaired = getChairedCommittees(member.name);

            return (
              <Card
                key={member.name}
                hover
                className='group flex h-full flex-col border-slate-200 shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Row 1: Icon, Role, Name */}
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary-50 text-primary-600 border-primary-100 group-hover:bg-primary-600 shrink-0 rounded-lg border p-2 shadow-sm transition-colors group-hover:text-white'>
                      <UserIcon className='h-5 w-5' />
                    </div>

                    <div className='min-w-0 flex-1'>
                      <p className='text-primary-600 mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        {member.role}
                      </p>
                      <h4 className='text-base leading-tight font-bold text-slate-900'>
                        {toTitleCase(member.name)}
                      </h4>
                    </div>
                  </div>

                  {/* Row 2: Committee Highlight Box */}
                  {chaired.length > 0 ? (
                    <div className='flex flex-col gap-2 rounded-xl border border-slate-100 bg-slate-50/50 p-3'>
                      {/* Section Label */}
                      <div className='mb-1 flex items-center gap-2'>
                        <BookOpenIcon className='h-3 w-3 text-slate-400' />
                        <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                          Committee Chair
                        </span>
                      </div>

                      {/* List Items with visual separation */}
                      <ul className='flex flex-col gap-2'>
                        {chaired.map(c => (
                          <li
                            key={c.committee}
                            className='flex items-start gap-2 rounded-lg border border-slate-100 bg-white px-2.5 py-2 shadow-sm'
                          >
                            {/* Small decorative dot/line */}
                            <div className='bg-secondary-600 mt-0.5 h-8 w-1 shrink-0 rounded-full opacity-80' />

                            <span className='text-xs leading-snug font-bold wrap-break-word text-slate-800'>
                              {toTitleCase(c.committee)}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <div className='flex-1' />
                  )}

                  {/* Row 3: Footer / Socials (Fixed Contrast) */}
                  {member.website && (
                    <div className='mt-auto flex items-center justify-between border-t border-slate-50 pt-3'>
                      {/* Darker text for readability */}
                      <span className='text-[10px] font-medium tracking-wide text-slate-400 uppercase'>
                        Social Profile
                      </span>
                      <a
                        href={member.website}
                        target='_blank'
                        rel='noreferrer'
                        className='group/link hover:border-primary-200 hover:text-primary-700 flex items-center gap-2 rounded-lg border border-slate-100 bg-white px-3 py-1.5 shadow-sm transition-all'
                      >
                        <span className='text-[10px] font-bold tracking-wider uppercase'>
                          Visit Page
                        </span>
                        <SiFacebook className='h-3.5 w-3.5' />
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DetailSection>

      {/* --- CTA Banner --- */}
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
