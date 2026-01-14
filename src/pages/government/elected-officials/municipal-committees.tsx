import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  UsersIcon,
  GavelIcon,
  UserCheckIcon,
  ArrowRightIcon,
} from 'lucide-react';

// UI & Layout Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardHeader, CardContent } from '@/components/ui/CardList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import SearchInput from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { Badge } from '@/components/ui/Badge';

// Data & Logic
import legislativeData from '@/data/directory/legislative.json';
import { toTitleCase } from '@/lib/stringUtils';

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
    <div className='pb-20 mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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
              className='flex flex-col h-full shadow-sm border-slate-200'
            >
              {/* Card Header with Secondary Orange Accent */}
              <CardHeader className='flex items-center transition-colors bg-secondary-50/50 min-h-[90px] border-b border-secondary-100'>
                <div className='flex gap-3 items-start'>
                  <div className='p-2.5 bg-white rounded-xl border border-secondary-200 text-secondary-600 shadow-sm shrink-0'>
                    <BookOpenIcon className='w-4 h-4' />
                  </div>
                  <h3 className='font-extrabold leading-snug transition-colors text-slate-900 group-hover:text-secondary-800'>
                    {toTitleCase(committee.committee)}
                  </h3>
                </div>
              </CardHeader>

              <CardContent className='flex-1 p-6 space-y-6'>
                {/* Chairperson Section (Normalized Name) */}
                <div>
                  <p className='text-[10px] font-bold text-secondary-600 uppercase tracking-widest mb-2 flex items-center gap-1.5'>
                    <UserCheckIcon className='w-3 h-3' /> Chairperson
                  </p>
                  <div className='flex gap-3 items-center p-3 rounded-xl border shadow-inner bg-slate-50 border-slate-100'>
                    <div
                      className='flex justify-center items-center w-8 h-8 text-[10px] font-black bg-white rounded-full border text-slate-400 border-slate-200 shrink-0'
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
                    <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5'>
                      <UsersIcon className='w-3 h-3' /> Committee Members
                    </p>
                    <ul className='grid grid-cols-1 gap-1.5' role='list'>
                      {committee.members.map((member, i) => (
                        <li
                          key={i}
                          className='flex gap-2 items-center px-2 py-1.5 text-xs font-semibold rounded-lg hover:bg-slate-50 text-slate-600 transition-all border border-transparent hover:border-slate-100'
                        >
                          <span
                            className='w-1 h-1 rounded-full bg-slate-300'
                            aria-hidden='true'
                          />
                          <span className='flex-1'>
                            {toTitleCase(member.name)}
                          </span>
                          {member.role && (
                            <Badge
                              variant='slate'
                              className='opacity-70 origin-right scale-90'
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
      <div className='flex flex-col gap-6 justify-between items-center p-8 bg-white rounded-3xl border shadow-sm border-slate-200 md:flex-row'>
        <div className='flex gap-5 items-center'>
          <div className='p-3 rounded-2xl border shadow-inner bg-secondary-50 border-secondary-100 text-secondary-600'>
            <GavelIcon className='w-6 h-6' />
          </div>
          <div>
            <h4 className='font-bold text-slate-900'>Legislative Mandate</h4>
            <p className='max-w-md text-sm font-medium leading-relaxed text-slate-500'>
              Committees are essential for the legislative process, reviewing
              proposed local laws before they are presented for final council
              approval.
            </p>
          </div>
        </div>
        <Link
          to='/government/elected-officials/12th-sangguniang-bayan'
          className='flex gap-2 justify-center items-center px-8 py-3 text-xs font-black uppercase tracking-widest rounded-xl border transition-all text-white bg-secondary-600 hover:bg-secondary-700 shadow-lg shadow-secondary-900/10 min-h-[48px] w-full md:w-auto'
        >
          View Full Council <ArrowRightIcon className='w-4 h-4' />
        </Link>
      </div>
    </div>
  );
}
