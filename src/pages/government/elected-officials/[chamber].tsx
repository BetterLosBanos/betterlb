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
  personId?: string;
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
    <div className='pb-20 mx-auto space-y-8 max-w-7xl duration-500 animate-in fade-in'>
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
        <div className='grid grid-cols-1 gap-4 items-start md:grid-cols-2 xl:grid-cols-3'>
          {data.officials?.map(member => {
            const chaired = getChairedCommittees(member.name);

            const cardContent = (
              <Card
                key={member.name}
                hover={!!member.personId}
                className={`group flex h-full flex-col shadow-xs ${member.personId ? 'border-kapwa-border-weak cursor-pointer' : 'border-kapwa-border-weak'}`}
              >
                <CardContent className='flex flex-col p-4 space-y-4 h-full'>
                  {/* Row 1: Icon, Role, Name */}
                  <div className='flex gap-3 items-start'>
                    <div className='p-2 rounded-lg border shadow-sm transition-colors bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0'>
                      <UserIcon className='w-5 h-5' />
                    </div>

                    <div className='flex-1 min-w-0'>
                      <p className='text-kapwa-text-brand mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        {member.role}
                      </p>
                      <h4 className='text-base font-bold leading-tight text-kapwa-text-strong'>
                        {toTitleCase(member.name)}
                      </h4>
                      {member.personId && (
                        <p className='text-kapwa-text-brand mt-1 text-[10px] font-medium tracking-wide uppercase'>
                          View Profile
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Row 2: Committee Highlight Box */}
                  {chaired.length > 0 ? (
                    <div className='flex flex-col gap-2 p-3 rounded-xl border border-kapwa-border-weak bg-kapwa-bg-surface-raised/50'>
                      {/* Section Label */}
                      <div className='flex gap-2 items-center mb-1'>
                        <BookOpenIcon className='w-3 h-3 text-kapwa-text-disabled' />
                        <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                          Committee Chair
                        </span>
                      </div>

                      {/* List Items with visual separation */}
                      <ul className='flex flex-col gap-2'>
                        {chaired.map(c => (
                          <li
                            key={c.committee}
                            className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-2 rounded-lg border px-2.5 py-2 shadow-sm'
                          >
                            {/* Small decorative dot/line */}
                            <div className='bg-kapwa-orange-600 mt-0.5 h-8 w-1 shrink-0 rounded-full opacity-80' />

                            <span className='text-xs font-bold leading-snug text-kapwa-text-strong wrap-break-word'>
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
                    <div className='flex justify-between items-center pt-3 mt-auto border-t border-kapwa-border-weak'>
                      {/* Darker text for readability */}
                      <span className='text-kapwa-text-disabled text-[10px] font-medium tracking-wide uppercase'>
                        Social Profile
                      </span>
                      <a
                        href={member.website}
                        target='_blank'
                        rel='noreferrer'
                        onClick={e => member.personId && e.stopPropagation()}
                        className='group/link hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm transition-all'
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

            // Wrap in Link if personId exists
            return member.personId ? (
              <Link
                key={member.name}
                to={`/openlgu/person/${member.personId}`}
                className='block group'
              >
                {cardContent}
              </Link>
            ) : (
              cardContent
            );
          })}
        </div>
      </DetailSection>

      {/* --- CTA Banner --- */}
      <div className='overflow-hidden relative p-8 rounded-3xl shadow-xl group text-kapwa-text-inverse bg-kapwa-bg-surface-bold md:p-12'>
        <div className='flex relative z-10 flex-col gap-8 justify-between items-start md:flex-row md:items-center'>
          <div className='space-y-4 max-w-2xl'>
            <div className='flex gap-3 items-center'>
              <Badge variant='secondary' dot>
                Legislative Archive
              </Badge>
              <span className='text-xs font-bold tracking-widest uppercase text-kapwa-text-disabled'>
                Public Records
              </span>
            </div>
            <h3 className='text-2xl font-extrabold tracking-tight md:text-3xl'>
              Municipal Ordinances & Resolutions
            </h3>
            <p className='text-base leading-relaxed text-kapwa-text-disabled'>
              Access the verified directory of local laws, ordinances, and
              resolutions passed by the {data.chamber}.
            </p>
          </div>

          <Link
            to='/legislation'
            className='hover:bg-kapwa-orange-50 bg-kapwa-bg-surface text-kapwa-text-strong flex min-h-[56px] w-full shrink-0 items-center justify-center gap-3 rounded-xl px-8 text-sm font-bold shadow-lg transition-all md:w-auto'
          >
            Browse Documents <ChevronRight className='w-4 h-4' />
          </Link>
        </div>

        <GavelIcon className='text-kapwa-text-inverse/5 absolute right-[-5%] bottom-[-20%] h-64 w-64 -rotate-12 transition-transform duration-700 group-hover:scale-110 group-hover:rotate-0' />
      </div>
    </div>
  );
}
