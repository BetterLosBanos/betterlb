import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import {
  ArrowRightIcon,
  BookOpenIcon,
  GavelIcon,
  UserCheckIcon,
  UsersIcon,
} from 'lucide-react';

// UI & Layout Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
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
import { Card, CardContent, CardHeader } from '@/components/ui/CardList';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

import { toTitleCase } from '@/lib/stringUtils';

// Data & Logic
import legislativeData from '@/data/directory/legislative.json';

interface CommitteeMember {
  name: string;
  role?: string;
}

interface Committee {
  committee: string;
  chairperson: string;
  members?: CommitteeMember[];
}

export default function MunicipalCommitteesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Data extraction
  const sbData = legislativeData.find(
    item => item.slug === '12th-sangguniang-bayan'
  );
  const committees = useMemo(
    () => (sbData?.permanent_committees || []) as Committee[],
    [sbData]
  );

  // 2. Comprehensive search logic
  const filteredCommittees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return committees.filter(
      (c: Committee) =>
        c.committee.toLowerCase().includes(q) ||
        c.chairperson?.toLowerCase().includes(q) ||
        c.members?.some(m => m.name.toLowerCase().includes(q))
    );
  }, [committees, searchTerm]);

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 pb-20 duration-500'>
      {/* --- BREADCRUMBS --- */}
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
            <BreadcrumbPage>Municipal Committees</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* --- HEADER --- */}
      <ModuleHeader
        title='Municipal Committees'
        description={`Active standing committees of the ${sbData?.chamber || 'Sangguniang Bayan'} for the current term.`}
      >
        <SearchInput
          value={searchTerm}
          onChangeValue={setSearchTerm}
          placeholder='Search committees or members...'
          className='md:w-80'
        />
      </ModuleHeader>

      {/* --- RESULTS GRID --- */}
      {filteredCommittees.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title='No Committees Found'
          message={`We couldn't find any committees matching &quot;${searchTerm}&quot;.`}
        />
      ) : (
        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
          {filteredCommittees.map((committee, index) => (
            <Card
              key={index}
              hover
              className='flex h-full flex-col border-slate-200 shadow-sm'
            >
              {/* Card Header with Secondary Orange Accent */}
              <CardHeader className='bg-secondary-50/50 border-secondary-100 flex min-h-[90px] items-center border-b transition-colors'>
                <div className='flex items-start gap-3'>
                  <div className='border-secondary-200 text-secondary-600 shrink-0 rounded-xl border bg-white p-2.5 shadow-sm'>
                    <BookOpenIcon className='h-4 w-4' />
                  </div>
                  <h3 className='group-hover:text-secondary-800 leading-snug font-extrabold text-slate-900 transition-colors'>
                    {toTitleCase(committee.committee)}
                  </h3>
                </div>
              </CardHeader>

              <CardContent className='flex-1 space-y-6 p-6'>
                {/* Chairperson Section (Normalized Name) */}
                <div>
                  <p className='text-secondary-600 mb-2 flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase'>
                    <UserCheckIcon className='h-3 w-3' /> Chairperson
                  </p>
                  <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-3 shadow-inner'>
                    <div
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-[10px] font-black text-slate-400'
                      aria-hidden='true'
                    >
                      {committee.chairperson?.[0] || 'C'}
                    </div>
                    <span className='text-sm font-bold text-slate-800'>
                      {toTitleCase(committee.chairperson)}
                    </span>
                  </div>
                </div>

                {/* Member List Section (Normalized Names) */}
                {committee.members && committee.members.length > 0 && (
                  <div>
                    <p className='mb-3 flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                      <UsersIcon className='h-3 w-3' /> Committee Members
                    </p>
                    <ul className='grid grid-cols-1 gap-1.5' role='list'>
                      {committee.members.map((member, i) => (
                        <li
                          key={i}
                          className='flex items-center gap-2 rounded-lg border border-transparent px-2 py-1.5 text-xs font-semibold text-slate-600 transition-all hover:border-slate-100 hover:bg-slate-50'
                        >
                          <span
                            className='h-1 w-1 rounded-full bg-slate-300'
                            aria-hidden='true'
                          />
                          <span className='flex-1'>
                            {toTitleCase(member.name)}
                          </span>
                          {member.role && (
                            <Badge
                              variant='slate'
                              className='origin-right scale-90 opacity-70'
                            >
                              {member.role}
                            </Badge>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* --- FOOTER CTA --- */}
      <div className='flex flex-col items-center justify-between gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm md:flex-row'>
        <div className='flex items-center gap-5'>
          <div className='bg-secondary-50 border-secondary-100 text-secondary-600 rounded-2xl border p-3 shadow-inner'>
            <GavelIcon className='h-6 w-6' />
          </div>
          <div>
            <h4 className='font-bold text-slate-900'>Legislative Mandate</h4>
            <p className='max-w-md text-sm leading-relaxed font-medium text-slate-500'>
              Committees are essential for the legislative process, reviewing
              proposed local laws before they are presented for final council
              approval.
            </p>
          </div>
        </div>
        <Link
          to='/government/elected-officials/12th-sangguniang-bayan'
          className='bg-secondary-600 hover:bg-secondary-700 shadow-secondary-900/10 flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border px-8 py-3 text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all md:w-auto'
        >
          View Full Council <ArrowRightIcon className='h-4 w-4' />
        </Link>
      </div>
    </div>
  );
}
