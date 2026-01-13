import { useState, useMemo } from 'react';
import {
  BookOpenIcon,
  UsersIcon,
  GavelIcon,
  UserCheckIcon,
  ArrowRightIcon,
  Link,
} from 'lucide-react';
import legislativeData from '@/data/directory/legislative.json';
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

interface Committee {
  committee: string;
  chairperson: string;
  members?: Array<{ name: string; role?: string }>;
}

export default function MunicipalCommitteesPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Get the Sangguniang Bayan data
  const sbData = legislativeData.find(
    item => item.slug === '12th-sangguniang-bayan'
  );

  const committees = useMemo(
    () => sbData?.permanent_committees || [],
    [sbData]
  );

  // 2. Filter logic (Checks committee name, chair, and members)
  const filteredCommittees = useMemo(() => {
    const q = searchTerm.toLowerCase();
    return committees.filter((c: Committee) => {
      return (
        c.committee.toLowerCase().includes(q) ||
        c.chairperson?.toLowerCase().includes(q) ||
        c.members?.some(m => m.name.toLowerCase().includes(q))
      );
    });
  }, [committees, searchTerm]);

  return (
    <div className='max-w-7xl mx-auto space-y-6 animate-in fade-in duration-500'>
      {/* Breadcrumbs */}
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

      {/* Header with Optimized Search */}
      <ModuleHeader
        title='Municipal Committees'
        description={`Standing committees of the ${sbData?.chindigo || 'Council'} responsible for legislative review.`}
      >
        <SearchInput
          value={searchTerm}
          onChangeValue={setSearchTerm}
          placeholder='Search committees or members...'
          className='md:w-80'
        />
      </ModuleHeader>

      {/* Results Section */}
      {filteredCommittees.length === 0 ? (
        <EmptyState
          icon={BookOpenIcon}
          title='No Committees Found'
          message={`We couldn't find any results for "${searchTerm}".`}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6'>
          {filteredCommittees.map((committee, index) => (
            <Card
              key={index}
              hover
              className='border-indigo-100 flex flex-col h-full'
            >
              {/* Card Header: Committee Title */}
              <CardHeader className='bg-indigo-50/50 min-h-[80px] flex items-center'>
                <div className='flex gap-3 items-start'>
                  <div className='p-2 bg-white rounded-lg border border-indigo-200 text-indigo-600 shadow-sm shrink-0'>
                    <BookOpenIcon className='w-4 h-4' />
                  </div>
                  <h3 className='font-bold text-gray-900 leading-snug'>
                    {committee.committee}
                  </h3>
                </div>
              </CardHeader>

              <CardContent className='flex-1 space-y-5 p-6'>
                {/* Highlighted Chairperson */}
                <div>
                  <p className='text-[10px] font-bold text-indigo-600 uppercase tracking-widest mb-2 flex items-center gap-1.5'>
                    <UserCheckIcon className='w-3 h-3' /> Chairperson
                  </p>
                  <div className='p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-center gap-3'>
                    <div className='w-8 h-8 rounded-full bg-white flex items-center justify-center text-[10px] font-bold text-gray-400 border border-gray-200'>
                      {committee.chairperson?.[0]}
                    </div>
                    <span className='text-sm font-bold text-gray-900'>
                      {committee.chairperson}
                    </span>
                  </div>
                </div>

                {/* List of Members */}
                {committee.members && committee.members.length > 0 && (
                  <div>
                    <p className='text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-1.5'>
                      <UsersIcon className='w-3 h-3' /> Committee Members
                    </p>
                    <ul className='grid grid-cols-1 gap-1'>
                      {committee.members.map((member, i) => (
                        <li
                          key={i}
                          className='text-xs text-gray-600 flex items-center gap-2 py-1 px-2 rounded-md hover:bg-gray-50 transition-colors'
                        >
                          <span className='w-1 h-1 rounded-full bg-gray-300' />
                          <span className='font-medium'>{member.name}</span>
                          {member.role && (
                            <span className='text-[10px] text-gray-400 italic'>
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

      {/* Contextual Footer */}
      <div className='mt-12 p-6 rounded-2xl bg-gray-50 border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <div className='p-3 bg-white rounded-full border border-gray-200 text-indigo-600'>
            <GavelIcon className='w-6 h-6' />
          </div>
          <div>
            <h4 className='font-bold text-gray-900'>Legislative Process</h4>
            <p className='text-sm text-gray-500'>
              Committees hold public hearings to deliberate on proposed local
              laws.
            </p>
          </div>
        </div>
        <Link
          to='/government/elected-officials/12th-sangguniang-bayan'
          className='inline-flex items-center gap-2 px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm'
        >
          View Full Council <ArrowRightIcon className='w-4 h-4' />
        </Link>
      </div>
    </div>
  );
}
