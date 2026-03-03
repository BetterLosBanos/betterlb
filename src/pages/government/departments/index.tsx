import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, Building2Icon, Globe, Phone, User2 } from 'lucide-react';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import SearchInput from '@/components/ui/SearchInput';

import { officeIcons } from '@/lib/officeIcons';
import { formatGovName, toTitleCase } from '@/lib/stringUtils';
import { toTelUri } from '@/lib/utils';

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
    <>
      <PageHero
        title='Municipal Departments'
        description={`${filtered.length} active offices.`}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search departments...'
          className='md:w-72'
        />
      </PageHero>

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
                className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row: Icon and Title */}
                  <div className='flex items-start gap-3'>
                    <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <Icon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong truncate text-sm leading-tight font-bold transition-colors md:text-base'>
                        {toTitleCase(
                          formatGovName(dept.office_name, 'department')
                        )}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 truncate text-[10px] font-bold tracking-widest uppercase'>
                        {dept.office_name}
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-kapwa-text-link text-kapwa-text-support mt-1 h-4 w-4 transition-all' />
                  </div>

                  {/* Middle Row: Leadership (Standardized Highlight Box) */}
                  {dept.department_head?.name ? (
                    <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2'>
                      <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                        <User2 className='h-3.5 w-3.5' />
                      </div>
                      <div className='min-w-0'>
                        <p className='text-kapwa-text-disabled mb-0.5 text-[9px] leading-none font-bold tracking-tighter uppercase'>
                          Department Head
                        </p>
                        <p className='text-kapwa-text-support truncate text-xs leading-tight font-bold'>
                          {toTitleCase(dept.department_head.name)}
                        </p>
                      </div>
                    </div>
                  ) : (
                    // Spacer if no head listed to keep cards aligned
                    <div className='h-[46px]' aria-hidden='true' />
                  )}

                  {/* Bottom Row: Contact & Website */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-kapwa-border-weak pt-3'>
                    {dept.trunkline ? (
                      <a
                        href={
                          toTelUri(
                            Array.isArray(dept.trunkline)
                              ? dept.trunkline[0]
                              : dept.trunkline
                          ) || '#'
                        }
                        className='text-kapwa-text-disabled flex items-center gap-1.5 text-[11px] font-medium hover:text-kapwa-text-brand transition-colors'
                      >
                        <Phone className='text-kapwa-text-brand h-3 w-3' />
                        <span>
                          {Array.isArray(dept.trunkline)
                            ? dept.trunkline[0]
                            : dept.trunkline}
                        </span>
                      </a>
                    ) : (
                      <div className='text-kapwa-text-support text-[10px] italic'>
                        No contact
                      </div>
                    )}

                    <div className='flex items-center gap-2'>
                      {dept.website && (
                        <div
                          className='bg-kapwa-bg-surface text-kapwa-text-brand rounded-md p-1.5'
                          title='Website Available'
                        >
                          <Globe className='h-3.5 w-3.5' />
                        </div>
                      )}
                      <span className='text-kapwa-text-brand text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
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
    </>
  );
}
