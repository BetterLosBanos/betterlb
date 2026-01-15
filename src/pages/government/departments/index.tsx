import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, Building2Icon, Globe, Phone, User2 } from 'lucide-react';

// UI Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/CardList';
import SearchInput from '@/components/ui/SearchInput';

import { officeIcons } from '@/lib/officeIcons';
import { formatGovName, toTitleCase } from '@/lib/stringUtils';

// Logic & Data
import departmentsData from '@/data/directory/departments.json';

export default function DepartmentsIndex() {
  const [search, setSearch] = useState('');

  const filtered = departmentsData
    .filter(d => d.office_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const clean = (name: string) =>
        name.replace(/DEPARTMENT OF |MUNICIPAL |LOCAL /g, '');
      return clean(a.office_name).localeCompare(clean(b.office_name));
    });

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
      <ModuleHeader
        title='Municipal Departments'
        description={`${filtered.length} active offices.`}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search departments...'
          className='md:w-72'
        />
      </ModuleHeader>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filtered.map(dept => {
          const Icon = officeIcons[dept.slug] || Building2Icon;

          return (
            <Link
              key={dept.slug}
              to={dept.slug}
              className='group block h-full'
              aria-label={`View details for ${dept.office_name}`}
            >
              <Card
                hover
                className='flex h-full flex-col border-slate-200 shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row: Icon and Title Area */}
                  <div className='flex items-start gap-3'>
                    <div className='text-primary-600 group-hover:bg-primary-600 shrink-0 rounded-lg border border-slate-100 bg-slate-50 p-2 shadow-sm transition-colors group-hover:text-white'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-primary-700 truncate text-sm leading-tight font-bold text-slate-900 transition-colors md:text-base'>
                        {toTitleCase(
                          formatGovName(dept.office_name, 'department')
                        )}
                      </h3>
                      <p className='mt-0.5 truncate text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        {dept.office_name}
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-primary-500 mt-1 h-4 w-4 text-slate-200 transition-all' />
                  </div>

                  {/* Middle Row: Leadership (Condensed) */}
                  {dept.department_head?.name && (
                    <div className='flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2'>
                      <User2 className='h-3.5 w-3.5 text-slate-400' />
                      <span className='truncate text-[11px] font-bold text-slate-600'>
                        {toTitleCase(dept.department_head.name)}
                      </span>
                    </div>
                  )}

                  {/* Bottom Row: Contact & Website (Compact Footer) */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-3'>
                    {dept.trunkline ? (
                      <div className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'>
                        <Phone className='text-primary-400 h-3 w-3' />
                        <span>
                          {Array.isArray(dept.trunkline)
                            ? dept.trunkline[0]
                            : dept.trunkline}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className='flex items-center gap-2'>
                      {dept.website && (
                        <div
                          className='bg-primary-50 text-primary-600 rounded-md p-1.5'
                          title='Website Available'
                        >
                          <Globe className='h-3.5 w-3.5' />
                        </div>
                      )}
                      <span className='text-primary-600 text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
                        View Profile
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
