import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, MapPinIcon, Phone, User2 } from 'lucide-react';

import { PageHero } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/Card';
import SearchInput from '@/components/ui/SearchInput';

import { toTitleCase } from '@/lib/stringUtils';

import barangaysData from '@/data/directory/barangays.json';

export default function BarangaysIndex() {
  const [search, setSearch] = useState('');

  const filtered = barangaysData
    .filter(b => b.barangay_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name));

  return (
    <>
      <PageHero
        title='Local Barangays'
        description={`${filtered.length} component barangays of the Municipality of Los Baños.`}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearchTerm => setSearch(setSearchTerm)}
          placeholder='Search by name (e.g. Mayondon)...'
          className='md:w-72'
        />
      </PageHero>

      <div className='grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3'>
        {filtered.map(brgy => {
          const punong = brgy.officials?.find(o =>
            o.role.includes('Punong Barangay')
          );

          return (
            <Link
              key={brgy.slug}
              to={brgy.slug}
              className='group block h-full'
              aria-label={`View profile of Barangay ${brgy.barangay_name}`}
            >
              <Card
                hover
                className='border-kapwa-border-weak flex h-full flex-col shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row: Icon and Title */}
                  <div className='flex items-start gap-3'>
                    {/* Consistent Icon Styling (Primary) */}
                    <div className='bg-kapwa-bg-surface text-kapwa-text-brand border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse shrink-0 rounded-lg border p-2 shadow-sm transition-colors'>
                      <MapPinIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong text-base leading-tight font-bold transition-colors'>
                        {toTitleCase(
                          brgy.barangay_name.replace('BARANGAY ', '')
                        )}
                      </h3>
                      <p className='text-kapwa-text-disabled mt-0.5 text-[10px] font-bold tracking-widest uppercase'>
                        Official Barangay Profile
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-kapwa-text-link text-kapwa-text-support mt-1 h-4 w-4 transition-all' />
                  </div>

                  {/* Middle Row: Punong Barangay (Standardized Highlight Box) */}
                  <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 rounded-xl border px-3 py-2'>
                    <div className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-disabled shrink-0 rounded-full border p-1 shadow-sm'>
                      <User2 className='h-3.5 w-3.5' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-kapwa-text-disabled mb-0.5 text-[9px] leading-none font-bold tracking-tighter uppercase'>
                        Punong Barangay
                      </p>
                      <p className='text-kapwa-text-support truncate text-xs leading-tight font-bold'>
                        {punong ? toTitleCase(punong.name) : 'Awaiting Data'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Trunkline & Action */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-kapwa-border-weak pt-3'>
                    {brgy.trunkline && brgy.trunkline.length > 0 ? (
                      <div className='text-kapwa-text-disabled flex items-center gap-1.5 text-[11px] font-medium'>
                        <Phone className='text-kapwa-text-brand h-3 w-3' />
                        <span>{brgy.trunkline[0]}</span>
                      </div>
                    ) : (
                      <div className='text-kapwa-text-support text-[10px] italic'>
                        No contact listed
                      </div>
                    )}

                    <span className='text-kapwa-text-brand text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
                      View Profile
                    </span>
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
