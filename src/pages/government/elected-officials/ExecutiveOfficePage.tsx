import { useMemo, useState } from 'react';
import { Building2, Phone, Mail, Globe, MapPin } from 'lucide-react';

import SEO from '@/components/SEO';
import { ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import {
  Card,
  CardAvatar,
  CardContent,
  CardTitle,
  CardDescription,
  CardList,
} from '@/components/ui/CardList';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbHome,
} from '@/components/ui/Breadcrumb';
import SearchInput from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';

import executiveData from '@/data/directory/executive.json';
import { getExecutiveSEOData } from '@/utils/seo-data';

interface ExecutiveOfficePageProps {
  officeType: 'OFFICE OF THE MAYOR' | 'OFFICE OF THE VICE MAYOR';
}

interface ExecutivePerson {
  name: string;
  role: string;
  email?: string;
}

interface ExecutiveOffice {
  slug: string;
  office: string;
  address?: string;
  trunkline?: string;
  website?: string;
  officials: ExecutivePerson[];
}

export default function ExecutiveOfficePage({
  officeType,
}: ExecutiveOfficePageProps) {
  const [searchTerm, setSearchTerm] = useState('');

  const officeData = executiveData.find(
    office => office.office === officeType
  ) as ExecutiveOffice | undefined;
  const seoData = getExecutiveSEOData(officeData?.office);

  const filteredOfficials = useMemo(() => {
    if (!officeData?.officials) return [];
    if (!searchTerm) return officeData.officials;

    const query = searchTerm.toLowerCase();
    return officeData.officials.filter(
      official =>
        official.name.toLowerCase().includes(query) ||
        official.role.toLowerCase().includes(query)
    );
  }, [officeData, searchTerm]);

  if (!officeData)
    return (
      <EmptyState
        title='Office Not Found'
        actionHref='/government/elected-officials'
      />
    );

  const isMayorOffice =
    officeType.includes('MAYOR') && !officeType.includes('VICE');
  const roleToMatch = isMayorOffice ? 'Mayor' : 'Vice Mayor';

  return (
    <>
      <SEO {...seoData} />

      <div className='mx-auto space-y-6 max-w-7xl duration-500 animate-in fade-in'>
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbHome href='/' />
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href='/government/elected-officials'>
                Elected Officials
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>
                {isMayorOffice ? 'Mayor' : 'Vice Mayor'}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <ModuleHeader
          title={officeData.office}
          description={`Official directory and personnel of the ${isMayorOffice ? 'Chief Executive' : 'Presiding Officer'}.`}
        >
          <SearchInput
            value={searchTerm}
            onChangeValue={setSearchTerm}
            placeholder='Search personnel...'
            className='md:w-72'
          />
        </ModuleHeader>

        <div className='grid grid-cols-1 gap-8 lg:grid-cols-3'>
          {/* LEFT: Officials */}
          <div className='space-y-8 lg:col-span-2'>
            {filteredOfficials.length === 0 ? (
              <EmptyState message={`No results matching "${searchTerm}"`} />
            ) : (
              <CardList>
                {filteredOfficials
                  .filter(o => o.role.includes(roleToMatch))
                  .map((head, idx) => (
                    <Card
                      key={idx}
                      variant='featured'
                      className='bg-primary-50/30 border-primary-100'
                    >
                      <CardContent className='flex flex-col items-center p-8 text-center'>
                        <CardAvatar
                          name={head.name}
                          size='lg'
                          className='mb-4 ring-4 ring-white shadow-lg'
                        />
                        <CardTitle
                          level='h2'
                          className='text-2xl text-gray-900'
                        >
                          {head.name}
                        </CardTitle>
                        <CardDescription className='font-bold tracking-wider uppercase text-primary-700'>
                          {head.role}
                        </CardDescription>

                        <div className='flex flex-wrap gap-4 justify-center mt-6 text-sm'>
                          {officeData.trunkline && (
                            <span className='flex gap-2 items-center text-gray-600'>
                              <Phone className='w-4 h-4 text-primary-500' />{' '}
                              {officeData.trunkline}
                            </span>
                          )}
                          {head.email && (
                            <span className='flex gap-2 items-center text-gray-600'>
                              <Mail className='w-4 h-4 text-primary-500' />{' '}
                              {head.email}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </CardList>
            )}
          </div>

          {/* RIGHT: Office Contact */}
          <aside className='space-y-6'>
            <DetailSection title='Office Contact' icon={Building2}>
              <div className='space-y-4'>
                {officeData.address && (
                  <div className='flex gap-3 items-start'>
                    <MapPin className='mt-1 w-4 h-4 text-gray-400 shrink-0' />
                    <div>
                      <p className='text-[10px] font-bold text-gray-400 uppercase leading-none mb-1'>
                        Location
                      </p>
                      <p className='text-sm font-medium leading-snug text-gray-700'>
                        {officeData.address}
                      </p>
                    </div>
                  </div>
                )}
                {officeData.trunkline && (
                  <div className='flex gap-3 items-start'>
                    <Phone className='mt-1 w-4 h-4 text-gray-400 shrink-0' />
                    <div>
                      <p className='text-[10px] font-bold text-gray-400 uppercase leading-none mb-1'>
                        Trunkline
                      </p>
                      <p className='text-sm font-medium text-gray-700'>
                        {officeData.trunkline}
                      </p>
                    </div>
                  </div>
                )}
                {officeData.website && (
                  <a
                    href={officeData.website}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='flex justify-between items-center p-3 w-full text-white rounded-xl transition-colors bg-primary-600 hover:bg-primary-700'
                  >
                    <span className='text-sm font-bold'>Official Website</span>
                    <Globe className='w-4 h-4' />
                  </a>
                )}
              </div>
            </DetailSection>
          </aside>
        </div>
      </div>
    </>
  );
}
