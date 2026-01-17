import { useMemo, useState } from 'react';

import { BookOpenIcon, User2, UsersIcon } from 'lucide-react';

import { ModuleHeader } from '@/components/layout/PageLayouts';
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
import SearchInput from '@/components/ui/SearchInput';

import { toTitleCase } from '@/lib/stringUtils';

import legislativeData from '@/data/directory/legislative.json';

// Interfaces
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
  const sbData = legislativeData.find(
    item => item.slug === '12th-sangguniang-bayan'
  );
  const committees = useMemo(
    () => (sbData?.permanent_committees || []) as Committee[],
    [sbData]
  );
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

      <ModuleHeader
        title='Municipal Committees'
        description={`Active standing committees of the ${sbData?.chamber || 'Sangguniang Bayan'}.`}
      >
        <SearchInput
          value={searchTerm}
          onChangeValue={setSearchTerm}
          placeholder='Search committees...'
          className='md:w-72'
        />
      </ModuleHeader>

      {filteredCommittees.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title='No Committees Found'
          message={`We couldn't find any committees matching "${searchTerm}".`}
        />
      ) : (
        /* UNIFIED DENSITY GRID */
        <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filteredCommittees.map((committee, index) => (
            <Card
              key={index}
              hover
              className='flex h-full flex-col border-slate-200 shadow-xs'
            >
              <CardContent className='flex h-full flex-col space-y-4 p-4'>
                {/* Top Row: Icon & Title */}
                <div className='flex items-start gap-3'>
                  <div className='bg-secondary-50 text-secondary-600 border-secondary-100 shrink-0 rounded-lg border p-2 shadow-sm'>
                    <BookOpenIcon className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='text-base leading-tight font-bold text-slate-900'>
                      {toTitleCase(committee.committee)}
                    </h3>
                    <p className='mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                      Standing Committee
                    </p>
                  </div>
                </div>

                {/* Middle Row: Chairperson Highlight Box */}
                <div className='flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5'>
                  <div className='shrink-0 rounded-full border border-slate-200 bg-white p-1 text-slate-400 shadow-sm'>
                    <User2 className='h-3.5 w-3.5' />
                  </div>
                  <div className='min-w-0'>
                    <p className='mb-0.5 text-[9px] leading-none font-bold tracking-tighter text-slate-400 uppercase'>
                      Chairperson
                    </p>
                    <p className='truncate text-xs leading-tight font-bold text-slate-800'>
                      {toTitleCase(committee.chairperson)}
                    </p>
                  </div>
                </div>

                {/* Expanded Member List */}
                {committee.members && committee.members.length > 0 && (
                  <div className='border-t border-slate-50 pt-2'>
                    <div className='mb-2.5 flex items-center gap-1.5'>
                      <UsersIcon className='text-secondary-500 h-3 w-3' />
                      <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        Committee Members
                      </span>
                    </div>
                    <ul className='space-y-2' role='list'>
                      {committee.members.map((member, i) => (
                        <li
                          key={i}
                          className='flex items-start gap-2 px-1 text-xs font-semibold text-slate-600'
                        >
                          <span className='bg-secondary-300 mt-1.5 h-1 w-1 shrink-0 rounded-full' />
                          <span className='flex-1 leading-snug'>
                            {toTitleCase(member.name)}
                          </span>
                          {member.role && (
                            <Badge
                              variant='slate'
                              className='h-4 px-1.5 py-0 text-[9px]'
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
    </div>
  );
}
