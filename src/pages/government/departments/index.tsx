import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2Icon, ArrowRight, Phone, Globe, User2 } from 'lucide-react';

// UI Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/CardList';
import SearchInput from '@/components/ui/SearchInput';

// Logic & Data
import departmentsData from '@/data/directory/departments.json';
import { formatGovName, toTitleCase } from '@/lib/stringUtils';
import { officeIcons } from '@/lib/officeIcons';

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
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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
              className='block h-full group'
              aria-label={`View details for ${dept.office_name}`}
            >
              <Card
                hover
                className='flex flex-col h-full border-slate-200 shadow-xs'
              >
                <CardContent className='flex flex-col p-4 space-y-4 h-full'>
                  {/* Top Row: Icon and Title Area */}
                  <div className='flex gap-3 items-start'>
                    <div className='p-2 rounded-lg border shadow-sm transition-colors bg-slate-50 text-primary-600 border-slate-100 shrink-0 group-hover:bg-primary-600 group-hover:text-white'>
                      <Icon className='w-5 h-5' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-sm font-bold leading-tight truncate transition-colors md:text-base text-slate-900 group-hover:text-primary-700'>
                        {toTitleCase(
                          formatGovName(dept.office_name, 'department')
                        )}
                      </h3>
                      <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase truncate mt-0.5'>
                        {dept.office_name}
                      </p>
                    </div>
                    <ArrowRight className='mt-1 w-4 h-4 transition-all text-slate-200 group-hover:text-primary-500' />
                  </div>

                  {/* Middle Row: Leadership (Condensed) */}
                  {dept.department_head?.name && (
                    <div className='flex gap-2 items-center px-3 py-2 rounded-xl border bg-slate-50/50 border-slate-100'>
                      <User2 className='w-3.5 h-3.5 text-slate-400' />
                      <span className='text-[11px] font-bold text-slate-600 truncate'>
                        {toTitleCase(dept.department_head.name)}
                      </span>
                    </div>
                  )}

                  {/* Bottom Row: Contact & Website (Compact Footer) */}
                  <div className='flex gap-4 justify-between items-center pt-3 mt-auto border-t border-slate-50'>
                    {dept.trunkline ? (
                      <div className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'>
                        <Phone className='w-3 h-3 text-primary-400' />
                        <span>
                          {Array.isArray(dept.trunkline)
                            ? dept.trunkline[0]
                            : dept.trunkline}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}

                    <div className='flex gap-2 items-center'>
                      {dept.website && (
                        <div
                          className='p-1.5 rounded-md bg-primary-50 text-primary-600'
                          title='Website Available'
                        >
                          <Globe className='w-3.5 h-3.5' />
                        </div>
                      )}
                      <span className='text-[10px] font-black text-primary-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity'>
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
