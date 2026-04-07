import { useMemo } from 'react';

import { Link } from 'react-router-dom';

import { SiFacebook } from '@icons-pack/react-simple-icons';
import { Button } from '@bettergov/kapwa/button';
import {
  ArrowRight,
  BookOpenIcon,
  Briefcase,
  Gavel,
  GlobeIcon,
  Landmark,
  MapPinIcon,
  ShieldCheck,
  UserIcon,
  UsersIcon,
} from 'lucide-react';

import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { DetailSection, PageHero } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { toTitleCase } from '@/lib/stringUtils';

import executiveData from '@/data/directory/executive.json';
import legislativeData from '@/data/directory/legislative.json';

// --- Types ---
interface ExecutiveOfficial {
  slug: string;
  name: string;
  role: string;
  office?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  isElected: boolean;
  personId?: string;
}

interface Committee {
  committee: string;
  chairperson: string;
}

interface CouncilMember {
  name: string;
  role: string;
  contact?: string;
  website?: string;
  personId?: string;
}

// --- Sub-components ---

function ElectedLeaderCard({ leader }: { leader: ExecutiveOfficial }) {
  const isMayor =
    leader.slug.includes('mayor') && !leader.slug.includes('vice');
  const Icon = isMayor ? Landmark : Gavel;

  const card = (
    <Card hover={!!leader.personId} className='group h-full'>
      <CardContent className='flex h-full flex-col items-center space-y-4 py-6 text-center'>
        <div className='relative'>
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full border-4 shadow-sm ${
              isMayor
                ? 'bg-kapwa-bg-surface border-kapwa-border-brand text-kapwa-text-brand'
                : 'bg-kapwa-bg-surface text-kapwa-text-disabled border-kapwa-bg-accent-orange-default'
            }`}
          >
            <Icon className='h-10 w-10' />
          </div>
          {isMayor && (
            <div className='bg-kapwa-bg-brand-default text-kapwa-text-inverse absolute -right-1 -bottom-1 rounded-full border-2 border-white p-1.5 shadow-md'>
              <ShieldCheck className='h-3.5 w-3.5' />
            </div>
          )}
        </div>

        <div className='min-w-0 flex-1'>
          <p className='text-kapwa-text-brand text-[10px] font-bold tracking-widest uppercase mb-1'>
            {leader.office || 'Elected Official'}
          </p>
          <h2 className='text-kapwa-text-strong text-2xl leading-tight font-black'>
            Hon. {toTitleCase(leader.name)}
          </h2>
          <Badge variant={isMayor ? 'primary' : 'secondary'} className='mt-2'>
            {leader.role}
          </Badge>
        </div>

        {(leader.email || leader.phone) && (
          <div className='border-kapwa-border-weak w-full border-t pt-4'>
            <ContactContainer variant='stack' className='text-left'>
              <ContactItem
                icon={Briefcase}
                label='Email Address'
                value={leader.email}
                href={leader.email ? `mailto:${leader.email}` : undefined}
              />
              <ContactItem
                icon={Briefcase}
                label='Office Line'
                value={leader.phone}
              />
            </ContactContainer>
          </div>
        )}

        {leader.personId && (
          <div className='border-kapwa-border-weak w-full border-t pt-4'>
            <span className='text-kapwa-text-brand text-sm font-bold'>
              View Full Profile →
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return leader.personId ? (
    <Link
      to={`/openlgu/person/${leader.personId}`}
      className='group block h-full'
    >
      {card}
    </Link>
  ) : (
    card
  );
}

function CouncilMemberCard({
  member,
  chairedCommittees,
}: {
  member: CouncilMember;
  chairedCommittees: Committee[];
}) {
  const card = (
    <Card
      hover={!!member.personId}
      className={`group flex h-full flex-col shadow-xs ${
        member.personId
          ? 'border-kapwa-border-weak cursor-pointer'
          : 'border-kapwa-border-weak'
      }`}
    >
      <CardContent className='flex h-full flex-col space-y-4 p-4'>
        {/* Row 1: Icon, Role, Name */}
        <div className='flex items-start gap-3'>
          <div className='border-kapwa-border-brand bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
            <UserIcon className='h-5 w-5' />
          </div>
          <div className='min-w-0 flex-1'>
            <p className='text-kapwa-text-brand mb-0.5 text-[10px] font-bold tracking-widest uppercase'>
              {member.role}
            </p>
            <h4 className='text-kapwa-text-strong text-base font-bold leading-tight'>
              {toTitleCase(member.name)}
            </h4>
            {member.personId && (
              <p className='text-kapwa-text-brand mt-1 text-[10px] font-medium tracking-wide uppercase'>
                View Profile
              </p>
            )}
          </div>
        </div>

        {/* Row 2: Committee Chair box */}
        {chairedCommittees.length > 0 ? (
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex flex-col gap-2 rounded-xl border p-3'>
            <div className='mb-1 flex items-center gap-2'>
              <BookOpenIcon className='text-kapwa-text-disabled h-3 w-3' />
              <span className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
                Committee Chair
              </span>
            </div>
            <ul className='flex flex-col gap-2'>
              {chairedCommittees.map(c => (
                <li
                  key={c.committee}
                  className='border-kapwa-border-weak bg-kapwa-bg-surface flex items-start gap-2 rounded-lg border px-2.5 py-2 shadow-sm'
                >
                  <div className='bg-kapwa-orange-600 mt-0.5 h-8 w-1 shrink-0 rounded-full opacity-80' />
                  <span className='text-kapwa-text-strong wrap-break-word text-xs font-bold leading-snug'>
                    {toTitleCase(c.committee)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className='flex-1' />
        )}

        {/* Row 3: Social footer */}
        {member.website && (
          <div className='border-kapwa-border-weak mt-auto flex items-center justify-between border-t pt-3'>
            <span className='text-kapwa-text-disabled text-[10px] font-medium tracking-wide uppercase'>
              Social Profile
            </span>
            <a
              href={member.website}
              target='_blank'
              rel='noreferrer'
              onClick={e => member.personId && e.stopPropagation()}
              className='hover:border-kapwa-border-brand hover:text-kapwa-text-brand border-kapwa-border-weak bg-kapwa-bg-surface flex items-center gap-2 rounded-lg border px-3 py-1.5 shadow-sm transition-all'
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

  return member.personId ? (
    <Link to={`/openlgu/person/${member.personId}`} className='block group'>
      {card}
    </Link>
  ) : (
    card
  );
}

// --- Page ---

export default function ElectedOfficialsPage() {
  const allExecutive = executiveData as ExecutiveOfficial[];

  const electedLeaders = useMemo(
    () => allExecutive.filter(o => o.isElected),
    [allExecutive]
  );

  const sbData = legislativeData.find(
    item => item.slug === '12th-sangguniang-bayan'
  );

  const getChairedCommittees = (memberName: string): Committee[] =>
    (sbData?.permanent_committees ?? []).filter(
      c => c.chairperson?.toLowerCase() === memberName.toLowerCase()
    ) as Committee[];

  const websiteUrl = sbData?.website
    ? sbData.website.startsWith('http')
      ? sbData.website
      : `https://${sbData.website}`
    : undefined;

  return (
    <div className='space-y-8'>
      <PageHero
        title='Elected Officials'
        description='The elected leaders and legislative body of the Municipal Government.'
        breadcrumb={[
          { label: 'Government', href: '/government' },
          { label: 'Elected Officials', href: '/government/elected-officials' },
        ]}
      />

      {/* ── SECTION 1: EXECUTIVE BRANCH ── */}
      <DetailSection
        title='Executive Branch'
        icon={Landmark}
        className='shadow-sm'
      >
        <div className='grid grid-cols-1 gap-6 lg:grid-cols-2'>
          {electedLeaders.map(leader => (
            <ElectedLeaderCard key={leader.slug} leader={leader} />
          ))}
        </div>
      </DetailSection>

      {/* ── SECTION 2: OFFICE OF THE MAYOR STAFF ── */}
      {/* {supportStaff.length > 0 && (
        <DetailSection
          title='Office of the Mayor'
          icon={Briefcase}
          className='shadow-sm'
        >
          <div className='grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
            {supportStaff.map(official => (
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
        </DetailSection>
      )} */}

      {/* ── SECTION 3: LEGISLATIVE BRANCH ── */}
      {sbData && (
        <DetailSection
          title={sbData.chamber}
          icon={UsersIcon}
          className='shadow-sm'
        >
          {/* Chamber contact info */}
          {(sbData.address || sbData.website) && (
            <div className='mb-6'>
              <ContactContainer variant='grid' className='md:grid-cols-2'>
                {sbData.address && (
                  <ContactItem
                    icon={MapPinIcon}
                    label='Office Location'
                    value={sbData.address}
                  />
                )}
                {websiteUrl && (
                  <ContactItem
                    icon={GlobeIcon}
                    label='Official Portal'
                    value='Visit Website'
                    href={websiteUrl}
                    isExternal
                  />
                )}
              </ContactContainer>
            </div>
          )}

          {/* Council members grid */}
          <div className='grid grid-cols-1 gap-4 items-stretch md:grid-cols-2 xl:grid-cols-3'>
            {(sbData.officials as CouncilMember[]).map(member => (
              <CouncilMemberCard
                key={member.name}
                member={member}
                chairedCommittees={getChairedCommittees(member.name)}
              />
            ))}
          </div>

          {/* Link to committees */}
          <div className='border-kapwa-border-weak mt-6 flex flex-col items-center justify-between gap-4 border-t pt-6 sm:flex-row'>
            <div className='flex items-center gap-3'>
              <BookOpenIcon className='text-kapwa-text-disabled h-5 w-5 shrink-0' />
              <div>
                <p className='text-kapwa-text-strong text-sm font-bold'>
                  Standing Committees
                </p>
                <p className='text-kapwa-text-disabled text-xs'>
                  {sbData.permanent_committees?.length ?? 0} active committees
                  with full member listings
                </p>
              </div>
            </div>
            <Link to='/government/elected-officials/committees'>
              <Button
                variant='outline'
                size='sm'
                className='text-[10px] font-bold tracking-widest uppercase'
                rightIcon={<ArrowRight className='h-3 w-3' />}
              >
                View Committees
              </Button>
            </Link>
          </div>
        </DetailSection>
      )}

      {/* ── SECTION 4: DEPARTMENTS BRIDGE ── */}
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised flex flex-col items-center justify-between gap-4 rounded-2xl border p-6 md:flex-row'>
        <div className='flex items-center gap-4'>
          <Briefcase className='text-kapwa-text-support h-8 w-8 shrink-0' />
          <div>
            <h4 className='text-kapwa-text-strong font-bold'>
              Looking for Department Heads?
            </h4>
            <p className='text-kapwa-text-disabled text-sm'>
              Municipal Treasurer, Assessor, Engineer, and other service heads
              are listed in the directory.
            </p>
          </div>
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
  );
}
