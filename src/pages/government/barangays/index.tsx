import { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPinIcon, UsersIcon, ArrowRight } from 'lucide-react';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardHeader, CardContent } from '@/components/ui/CardList';
import barangaysData from '@/data/directory/barangays.json';
import SearchInput from '@/components/ui/SearchInput';

export default function BarangaysIndex() {
  const [search, setSearch] = useState('');

  const filtered = barangaysData
    .filter(b => b.barangay_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name));

  return (
    <div className='space-y-6'>
      <ModuleHeader
        title='Local Barangays'
        description='Direct access to the 14 component barangays of Los Baños.'
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search barangays...'
          className='md:w-80'
        />
      </ModuleHeader>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {filtered.map(brgy => {
          const punong = brgy.officials?.find(o =>
            o.role.includes('Punong Barangay')
          );
          return (
            <Link key={brgy.slug} to={brgy.slug} className='group'>
              <Card hover className='h-full border-gray-100 flex flex-col'>
                <CardHeader className='bg-primary-50/30 group-hover:bg-primary-500 transition-colors group'>
                  <div className='flex justify-between items-start'>
                    <h3 className='font-bold text-primary-900 group-hover:text-white transition-colors'>
                      {brgy.barangay_name.replace('BARANGAY ', '')}
                    </h3>
                    <MapPinIcon className='w-4 h-4 text-primary-400 group-hover:text-white/50' />
                  </div>
                </CardHeader>
                <CardContent className='space-y-4 pt-6'>
                  <div className='flex items-center gap-3'>
                    <div className='w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400'>
                      <UsersIcon className='w-5 h-5' />
                    </div>
                    <div>
                      <p className='text-[10px] font-bold text-gray-600 uppercase leading-none mb-1'>
                        Punong Barangay
                      </p>
                      <p className='text-sm font-semibold text-gray-900'>
                        {punong?.name || 'Unassigned'}
                      </p>
                    </div>
                  </div>
                  <div className='pt-2 flex justify-end'>
                    <span className='text-xs font-bold text-primary-600 group-hover:underline flex items-center gap-1'>
                      View Profile <ArrowRight className='w-3 h-3' />
                    </span>
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
