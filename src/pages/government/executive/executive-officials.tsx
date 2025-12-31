import { SearchIcon } from 'lucide-react';
import { useMemo, useState } from 'react';
import SEO from '../../../components/SEO';
import {
  Card,
  CardAvatar,
  CardContactInfo,
  CardContent,
  CardDescription,
  // CardDivider,
  // CardGrid,
  CardList,
  CardTitle,
} from '../../../components/ui/CardList';
import executiveData from '../../../data/directory/executive.json';
import { getExecutiveSEOData } from '../../../utils/seo-data';

const officeData = executiveData.find(
  office => office.office === 'EXECUTIVE OFFICIALS'
);

export default function ExecutiveOfficialsPage() {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter officials based on search term
  const filteredOfficials = useMemo(() => {
    if (!officeData?.officials) return [];

    if (!searchTerm) return officeData.officials;

    return officeData.officials.filter(
      official =>
        official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        official.role.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const seoData = getExecutiveSEOData(officeData?.office);

  if (!officeData) {
    return (
      <>
        <SEO {...seoData} />
        <div className='p-8 text-center bg-white rounded-lg border'>
          <h3 className='text-lg font-medium text-gray-900 mb-1'>
            Office data not found
          </h3>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO {...seoData} />
      <div className='@container space-y-6'>
        <div className='flex flex-col md:flex-row md:items-center md:justify-between gap-4'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900 mb-2'>
              {officeData.office}
            </h1>
            {officeData.officials && (
              <p className='text-gray-800'>
                {officeData.officials.length} officials and divisions
              </p>
            )}
          </div>

          <div className='relative w-full md:w-64'>
            <SearchIcon className='absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400' />
            <input
              type='search'
              placeholder='Search officials...'
              className='pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <Card>
          <CardContent>
            <CardContactInfo
              contact={{
                address: officeData.address,
                phone: officeData.trunkline,
                website: officeData.website,
              }}
            />
          </CardContent>
        </Card>

        {filteredOfficials.length === 0 ? (
          <div className='p-8 text-center bg-white rounded-lg border'>
            <div className='mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4'>
              <SearchIcon className='h-6 w-6 text-gray-400' />
            </div>
            <h3 className='text-lg font-medium text-gray-900 mb-1'>
              No officials found
            </h3>
            <p className='text-gray-800'>Try adjusting your search term.</p>
          </div>
        ) : (
          <CardList>
            {filteredOfficials.map((official, index) => (
              <Card key={index} variant='featured'>
                <CardContent>
                  <div className='flex flex-col items-center text-center'>
                    <CardAvatar
                      name={official.name}
                      size='lg'
                      className='mb-4'
                    />
                    <CardTitle level='h2' className='text-xl'>
                      {official.name}
                    </CardTitle>
                    <CardDescription className='text-primary-600 font-medium text-base'>
                      {official.role}
                    </CardDescription>
                    <div className='mt-3'>
                      <CardContactInfo
                        contact={{
                          email: official.email,
                        }}
                        compact
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardList>
        )}
      </div>
    </>
  );
}
