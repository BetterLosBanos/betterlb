import { useState } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRight, MapPinIcon, Phone, User2 } from 'lucide-react';

// UI Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/CardList';
import SearchInput from '@/components/ui/SearchInput';

import { toTitleCase } from '@/lib/stringUtils';

// Logic & Data
import barangaysData from '@/data/directory/barangays.json';

export default function BarangaysIndex() {
  const [search, setSearch] = useState('');

  // 1. Filter and sort logic
  const filtered = barangaysData
    .filter(b => b.barangay_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name));

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-6 duration-500'>
      <ModuleHeader
        title='Local Barangays'
        description={`${filtered.length} component barangays of the Municipality of Los Baños.`}
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search by name (e.g. Mayondon)...'
          className='md:w-72'
        />
      </ModuleHeader>

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
                className='flex h-full flex-col border-slate-200 shadow-xs'
              >
                <CardContent className='flex h-full flex-col space-y-4 p-4'>
                  {/* Top Row: Icon and Title */}
                  <div className='flex items-start gap-3'>
                    <div className='bg-primary-50 text-primary-600 border-primary-100 group-hover:bg-primary-600 shrink-0 rounded-lg border p-2 shadow-sm transition-colors group-hover:text-white'>
                      <MapPinIcon className='h-5 w-5' />
                    </div>
                    <div className='min-w-0 flex-1'>
                      <h3 className='group-hover:text-primary-700 text-base leading-tight font-bold text-slate-900 transition-colors'>
                        {toTitleCase(
                          brgy.barangay_name.replace('BARANGAY ', '')
                        )}
                      </h3>
                      <p className='mt-0.5 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        Official Barangay Profile
                      </p>
                    </div>
                    <ArrowRight className='group-hover:text-primary-500 mt-1 h-4 w-4 text-slate-200 transition-all' />
                  </div>

                  {/* Middle Row: Punong Barangay (Condensed Leader Section) */}
                  <div className='flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2'>
                    <div
                      className='flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-400 shadow-xs'
                      aria-hidden='true'
                    >
                      <User2 className='h-4 w-4' />
                    </div>
                    <div className='min-w-0'>
                      <p className='mb-0.5 text-[9px] leading-none font-bold tracking-tighter text-slate-400 uppercase'>
                        Punong Barangay
                      </p>
                      <p className='truncate text-[11px] leading-tight font-bold text-slate-700'>
                        {punong ? toTitleCase(punong.name) : 'Awaiting Data'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Trunkline & Action */}
                  <div className='mt-auto flex items-center justify-between gap-4 border-t border-slate-50 pt-3'>
                    {brgy.trunkline && brgy.trunkline.length > 0 ? (
                      <div className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'>
                        <Phone className='text-primary-400 h-3 w-3' />
                        <span>{brgy.trunkline[0]}</span>
                      </div>
                    ) : (
                      <div className='text-[10px] text-slate-300 italic'>
                        No contact listed
                      </div>
                    )}

                    <span className='text-primary-600 text-[10px] font-black tracking-tighter uppercase opacity-0 transition-opacity group-hover:opacity-100'>
                      View Profile
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Footer Accessibility Note */}
      <footer className='pt-8 text-center'>
        <Badge
          variant='slate'
          className='border-slate-200 bg-slate-50 text-slate-400'
        >
          Source: Official LGU Los Baños Directory 2024
        </Badge>
      </footer>
    </div>
  );
}
