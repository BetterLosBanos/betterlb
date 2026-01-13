import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2Icon, ArrowRight } from 'lucide-react';
import { ModuleHeader } from '@/components/layout/PageLayouts';
import { Card, CardHeader, CardContent } from '@/components/ui/CardList';
import departmentsData from '@/data/directory/departments.json';
import { formatGovName } from '@/lib/stringUtils';
import { officeIcons } from '@/lib/officeIcons'; // Reuse the icon map
import SearchInput from '@/components/ui/SearchInput';

export default function DepartmentsIndex() {
  const [search, setSearch] = useState('');

  const filtered = departmentsData
    .filter(d => d.office_name.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const nameA = a.office_name.replace(
        /DEPARTMENT OF |MUNICIPAL |LOCAL /g,
        ''
      );
      const nameB = b.office_name.replace(
        /DEPARTMENT OF |MUNICIPAL |LOCAL /g,
        ''
      );
      return nameA.localeCompare(nameB);
    });

  return (
    <div className='space-y-6'>
      <ModuleHeader
        title='Municipal Departments'
        description='Directory of official government offices and service providers.'
      >
        <SearchInput
          value={search}
          onChangeValue={setSearch}
          placeholder='Search offices...'
          className='md:w-80'
        />
      </ModuleHeader>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
        {filtered.map(dept => {
          const Icon = officeIcons[dept.slug] || Building2Icon;
          return (
            <Link key={dept.slug} to={dept.slug} className='group'>
              <Card hover className='flex flex-col h-full border-gray-100'>
                <CardHeader className='transition-colors bg-gray-50/30 group-hover:bg-primary-50/50'>
                  <div className='flex justify-between items-start'>
                    <div className='p-2 bg-white rounded-lg border border-gray-100 shadow-sm text-primary-600'>
                      <Icon className='w-5 h-5' />
                    </div>
                    <ArrowRight className='w-4 h-4 text-gray-300 transition-all group-hover:text-primary-500' />
                  </div>
                </CardHeader>
                <CardContent className='flex-1'>
                  <h3 className='font-bold leading-tight text-gray-900 group-hover:text-primary-700'>
                    {formatGovName(dept.office_name, 'department')}
                  </h3>
                  <p className='mt-1 text-xs tracking-tighter text-gray-400 uppercase'>
                    {dept.office_name}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
