import { useState, useMemo } from 'react';
import { SearchIcon, BookOpenIcon, UsersIcon } from 'lucide-react';
import legislativeData from '../../../data/directory/legislative.json';
import { Card, CardHeader, CardContent } from '../../../components/ui/CardList';

interface Committee {
  committee: string;
  chairperson: string;
  members?: Array<{ name: string; role?: string }>;
}

export default function SenateCommitteesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Get Senate data
  const senateData = legislativeData.find((item: { chamber: string }) =>
    item.chamber.includes('Sangguniang Bayan')
  );

  // Extract committees
  const committees = useMemo(
    () => senateData?.permanent_committees || [],
    [senateData]
  );

  // Filter committees based on search term
  const filteredCommittees = useMemo(() => {
    return committees.filter((committee: Committee) => {
      const q = searchTerm.toLowerCase();

      return (
        committee.committee.toLowerCase().includes(q) ||
        committee.chairperson?.name.toLowerCase().includes(q) ||
        committee.members?.some(m => m.name.toLowerCase().includes(q))
      );
    });
  }, [committees, searchTerm]);

  return (
    <div className='@container space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Municipal Committees
          </h1>
          <p className='text-gray-800 mt-2'>{committees.length} committees</p>
        </div>

        <div className='relative w-full md:w-72'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='search'
            placeholder='Search committees or chairpersons...'
            className='pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredCommittees.length === 0 ? (
        <div className='p-8 text-center bg-white rounded-lg border'>
          <div className='mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4'>
            <BookOpenIcon className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            No committees found
          </h3>
          <p className='text-gray-800'>Try adjusting your search term.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 @lg:grid-cols-2 @3xl:grid-cols-3 gap-6'>
          {filteredCommittees.map((committee: Committee, index) => (
            <Card key={index} hover={true} className='h-full flex flex-col'>
              <CardHeader className='flex-none'>
                <h3 className='font-semibold text-base text-gray-900 leading-snug line-clamp-2 min-h-[2.5rem]'>
                  {committee.committee}
                </h3>
              </CardHeader>
              <CardContent className='flex-1 space-y-4'>
                {/* Chair */}
                {committee.chairperson && (
                  <div className='flex items-start gap-2 text-sm'>
                    <UsersIcon className='h-4 w-4 text-gray-400 mt-0.5' />
                    <div>
                      <span className='text-xs font-medium text-gray-500 uppercase'>
                        Chairperson
                      </span>
                      <div className='font-medium text-gray-900'>
                        {committee.chairperson}
                      </div>
                    </div>
                  </div>
                )}
                {/* Members */}
                {committee.members && committee.members.length > 0 && (
                  <div>
                    <span className='text-xs font-medium text-gray-500 uppercase'>
                      Members
                    </span>
                    <ul className='mt-1 space-y-1'>
                      {committee.members.map((member, i) => (
                        <li key={i} className='text-sm text-gray-800'>
                          {member.name}
                          {member.role && (
                            <span className='text-gray-500 text-xs ml-1'>
                              ({member.role})
                            </span>
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
