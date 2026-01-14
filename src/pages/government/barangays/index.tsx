import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, ArrowRight, Phone, User2 } from 'lucide-react';

// UI Components
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardContent } from '@/components/ui/CardList';
import SearchInput from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';

// Logic & Data
import barangaysData from '@/data/directory/barangays.json';
import { toTitleCase } from '@/lib/stringUtils';

export default function BarangaysIndex() {
  const [search, setSearch] = useState('');

  // 1. Filter and sort logic
  const filtered = barangaysData
    .filter(b => b.barangay_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name));

  return (
    <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
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
              className='block h-full group'
              aria-label={`View profile of Barangay ${brgy.barangay_name}`}
            >
              <Card
                hover
                className='flex flex-col h-full border-slate-200 shadow-xs'
              >
                <CardContent className='flex flex-col p-4 space-y-4 h-full'>
                  {/* Top Row: Icon and Title */}
                  <div className='flex gap-3 items-start'>
                    <div className='p-2 rounded-lg border shadow-sm transition-colors bg-primary-50 text-primary-600 border-primary-100 shrink-0 group-hover:bg-primary-600 group-hover:text-white'>
                      <MapPinIcon className='w-5 h-5' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='text-base font-bold leading-tight transition-colors text-slate-900 group-hover:text-primary-700'>
                        {toTitleCase(
                          brgy.barangay_name.replace('BARANGAY ', '')
                        )}
                      </h3>
                      <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-0.5'>
                        Official Barangay Profile
                      </p>
                    </div>
                    <ArrowRight className='mt-1 w-4 h-4 transition-all text-slate-200 group-hover:text-primary-500' />
                  </div>

                  {/* Middle Row: Punong Barangay (Condensed Leader Section) */}
                  <div className='flex gap-3 items-center px-3 py-2 rounded-xl border bg-slate-50/50 border-slate-100'>
                    <div
                      className='flex justify-center items-center w-8 h-8 bg-white rounded-full border border-slate-200 text-slate-400 shrink-0 shadow-xs'
                      aria-hidden='true'
                    >
                      <User2 className='w-4 h-4' />
                    </div>
                    <div className='min-w-0'>
                      <p className='text-[9px] font-bold text-slate-400 uppercase tracking-tighter leading-none mb-0.5'>
                        Punong Barangay
                      </p>
                      <p className='text-[11px] font-bold text-slate-700 truncate leading-tight'>
                        {punong ? toTitleCase(punong.name) : 'Awaiting Data'}
                      </p>
                    </div>
                  </div>

                  {/* Bottom Row: Trunkline & Action */}
                  <div className='flex gap-4 justify-between items-center pt-3 mt-auto border-t border-slate-50'>
                    {brgy.trunkline && brgy.trunkline.length > 0 ? (
                      <div className='flex items-center gap-1.5 text-[11px] font-medium text-slate-500'>
                        <Phone className='w-3 h-3 text-primary-400' />
                        <span>{brgy.trunkline[0]}</span>
                      </div>
                    ) : (
                      <div className='text-[10px] text-slate-300 italic'>
                        No contact listed
                      </div>
                    )}

                    <span className='text-[10px] font-black text-primary-600 uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity'>
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
          className='bg-slate-50 border-slate-200 text-slate-400'
        >
          Source: Official LGU Los Baños Directory 2024
        </Badge>
      </footer>
    </div>
  );
}
