import { useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import { BookOpenIcon, ChevronLeft, User2, UsersIcon } from 'lucide-react';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import SearchInput from '@/components/ui/SearchInput';

import { toTitleCase } from '@/lib/stringUtils';

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

  const sbData = legislativeData.find(
    item => item.slug === '12th-sangguniang-bayan'
  );

  const committees = useMemo(
    () => (sbData?.permanent_committees ?? []) as Committee[],
    [sbData]
  );

  const filteredCommittees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    if (!q) return committees;
    return committees.filter(
      c =>
        c.committee.toLowerCase().includes(q) ||
        c.chairperson?.toLowerCase().includes(q) ||
        c.members?.some(m => m.name.toLowerCase().includes(q))
    );
  }, [committees, searchTerm]);

  return (
    <>
      <PageHero
        title='Standing Committees'
        description={`Active committees of the ${sbData?.chamber ?? 'Sangguniang Bayan'}.`}
        breadcrumb={[
          { label: 'Government', href: '/government' },
          { label: 'Elected Officials', href: '/government/elected-officials' },
          {
            label: 'Committees',
            href: '/government/elected-officials/committees',
          },
        ]}
        heroActions={
          <SearchInput
            value={searchTerm}
            onChangeValue={setSearchTerm}
            placeholder='Search committees...'
            className='md:w-72'
          />
        }
      />

      {/* Back link */}
      <div className='flex items-center gap-1.5'>
        <Link
          to='/government/elected-officials'
          className='text-kapwa-text-brand hover:text-kapwa-text-brand-bold flex items-center gap-1 text-[11px] font-bold tracking-widest uppercase transition-colors'
        >
          <ChevronLeft className='h-3.5 w-3.5' />
          All Officials
        </Link>
      </div>

      {filteredCommittees.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title='No Committees Found'
          message={`We couldn't find any committees matching "${searchTerm}".`}
        />
      ) : (
        <div className='grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-3'>
          {filteredCommittees.map((committee, index) => (
            <Card
              key={index}
              hover
              className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
            >
              <CardContent className='flex h-full flex-col space-y-4 p-4'>
                {/* Top Row: Icon & Title */}
                <div className='flex items-start gap-3'>
                  <div className='bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange border-kapwa-border-weak shrink-0 rounded-lg border p-2 shadow-sm'>
                    <BookOpenIcon className='h-5 w-5' />
                  </div>
                  <div className='min-w-0 flex-1'>
                    <h3 className='text-kapwa-text-strong text-base font-bold leading-tight'>
                      {toTitleCase(committee.committee)}
                    </h3>
                    <p className='text-kapwa-text-disabled mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                      Standing Committee
                    </p>
                  </div>
                </div>

                {/* Chairperson Highlight Box */}
                <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2.5'>
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                    <User2 className='h-3.5 w-3.5' />
                  </div>
                  <div className='min-w-0'>
                    <p className='text-kapwa-text-disabled mb-0.5 text-[9px] font-bold tracking-tighter uppercase'>
                      Chairperson
                    </p>
                    <p className='text-kapwa-text-strong truncate text-xs font-bold leading-tight'>
                      {toTitleCase(committee.chairperson)}
                    </p>
                  </div>
                </div>

                {/* Member List */}
                {committee.members && committee.members.length > 0 && (
                  <div className='border-kapwa-border-weak border-t pt-2'>
                    <div className='mb-2.5 flex items-center gap-1.5'>
                      <UsersIcon className='text-kapwa-text-accent-orange h-3 w-3' />
                      <p className='text-kapwa-text-disabled text-[9px] font-bold tracking-widest uppercase'>
                        Members ({committee.members.length})
                      </p>
                    </div>
                    <div className='space-y-1.5'>
                      {committee.members.map((member, i) => (
                        <div
                          key={i}
                          className='flex items-center justify-between gap-2'
                        >
                          <p className='text-kapwa-text-support truncate text-[11px] font-medium'>
                            {toTitleCase(member.name)}
                          </p>
                          {member.role && (
                            <span className='text-kapwa-text-disabled bg-kapwa-bg-surface-raised shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold uppercase'>
                              {member.role}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Summary footer */}
      {filteredCommittees.length > 0 && (
        <p className='text-kapwa-text-disabled text-center text-xs'>
          Showing {filteredCommittees.length} of {committees.length} committees
        </p>
      )}
    </>
  );
}
