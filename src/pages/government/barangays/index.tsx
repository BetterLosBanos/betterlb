import { useState, useMemo } from 'react';
import {
  SearchIcon,
  // MapPinIcon,
  PhoneIcon,
  MailIcon,
  ExternalLinkIcon,
  Building2Icon,
  UsersIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
// import SEO from '../../../components/SEO';
import { Card, CardHeader, CardContent } from '../../../components/ui/CardList';
import barangaysData from '../../../data/directory/barangays.json';
// import { getBarangaysSEOData } from '../../../utils/seo-data';

interface Official {
  name: string;
  role: string;
}

interface Barangay {
  slug: string;
  barangay_name: string;
  address?: string;
  trunkline?: string;
  website?: string;
  email?: string;
  officials?: Official[];
}

export default function BarangaysIndex() {
  const [searchTerm, setSearchTerm] = useState('');
  const barangays = barangaysData as Barangay[];

  const filteredBarangays = useMemo(() => {
    if (!searchTerm) return barangays;
    return barangays.filter(b => {
      const punong = b.officials?.find(o => o.role.includes('Punong Barangay'));
      const nameMatch = b.barangay_name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const punongMatch = punong?.name
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      return nameMatch || punongMatch;
    });
  }, [barangays, searchTerm]);

  // const seoData = getBarangaysSEOData();

  return (
    <div className='@container space-y-6'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
        <div>
          <h1 className='text-3xl font-bold text-gray-900'>
            Government Barangays
          </h1>
          <p className='text-gray-800 mt-2'>
            {filteredBarangays.length} barangays
          </p>
        </div>

        <div className='relative w-full md:w-72'>
          <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
          <input
            type='search'
            placeholder='Search barangays or Punong Barangay...'
            className='pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredBarangays.length === 0 ? (
        <div className='p-8 text-center bg-white rounded-lg border'>
          <div className='mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4'>
            <Building2Icon className='h-6 w-6 text-gray-400' />
          </div>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            No barangays found
          </h3>
          <p className='text-gray-800'>Try adjusting your search term.</p>
        </div>
      ) : (
        <div className='grid grid-cols-1 @lg:grid-cols-2 @2xl:grid-cols-3 gap-6'>
          {filteredBarangays
            .sort((a, b) => a.barangay_name.localeCompare(b.barangay_name))
            .map((barangay, index) => {
              const punong = barangay.officials?.find(o =>
                o.role.includes('Punong Barangay')
              );

              return (
                <Link
                  key={index}
                  to={`/government/barangays/${encodeURIComponent(barangay.slug)}`}
                  className='block'
                >
                  <Card hover={true} className='h-full flex flex-col'>
                    <CardHeader>
                      <div className='flex items-center justify-between gap-2'>
                        <div className='flex flex-col'>
                          <h3 className='font-bold text-lg text-gray-900'>
                            {barangay.barangay_name}
                          </h3>
                        </div>
                        <div className='rounded-full bg-gray-100 p-2 shrink-0'>
                          <Building2Icon className='h-5 w-5 text-gray-800' />
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className='flex flex-col h-full grow space-y-2'>
                      <div className='flex items-start gap-2 text-sm'>
                        <UsersIcon className='h-4 w-4 text-gray-400 mt-0.5' />
                        <div>
                          <span className='text-xs font-medium text-gray-500 uppercase'>
                            Punong Barangay
                          </span>
                          <div className='font-medium text-gray-900'>
                            {punong.name}
                          </div>
                        </div>
                      </div>
                      {/* {barangay.address && (
                        <div className='flex items-start'>
                          <MapPinIcon className='h-4 w-4 text-gray-400 mr-2 mt-0.5 shrink-0' />
                          <span className='text-sm text-gray-800 line-clamp-2'>
                            {barangay.address}
                          </span>
                        </div>
                      )} */}
                      {barangay.trunkline && (
                        <div className='flex items-center'>
                          <PhoneIcon className='h-4 w-4 text-gray-400 mr-2 shrink-0' />
                          <span className='text-sm text-gray-800'>
                            {barangay.trunkline}
                          </span>
                        </div>
                      )}
                      {barangay.website && (
                        <div className='flex items-center'>
                          <ExternalLinkIcon className='h-4 w-4 text-gray-400 mr-2 shrink-0' />
                          <span className='text-sm text-primary-600 truncate'>
                            {barangay.website}
                          </span>
                        </div>
                      )}
                      {barangay.email && (
                        <div className='flex items-center'>
                          <MailIcon className='h-4 w-4 text-gray-400 mr-2 shrink-0' />
                          <span className='text-sm text-gray-800 truncate'>
                            {barangay.email}
                          </span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
        </div>
      )}
    </div>
  );
}
