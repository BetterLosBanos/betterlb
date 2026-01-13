import { FC, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Fuse from 'fuse.js';
import servicesData from '@/data/services/services.json';
import SearchInput from '@/components/ui/SearchInput';

interface Service {
  slug: string;
  service?: string;
  office_name?: string;
  office?: string;
  description?: string;
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
}

interface QuickCategory {
  name: string;
  slug: string;
  label: string;
}

const Hero: FC = () => {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');

  // Fuse.js setup
  const fuse = useMemo(() => {
    return new Fuse(servicesData as Service[], {
      keys: [
        'service',
        'office_name',
        'office',
        'description',
        'category.name',
        'subcategory.name',
      ],
      threshold: 0.3,
    });
  }, []);

  const results = useMemo(() => {
    if (!query) return [];
    return fuse.search(query).map(r => r.item);
  }, [query, fuse]);

  // Popular services (manually picked)
  const popularServices = [
    {
      label: t('hero.nationalId'),
      href: `/services?category=${encodeURIComponent('certificates-civil-registry')}&subcategory=${encodeURIComponent('community-tax-certificate')}`,
    },
    {
      label: t('hero.birthCertificate'),
      href: `/services?category=${encodeURIComponent('certificates-civil-registry')}&subcategory=${encodeURIComponent('birth-certificate-registration')}`,
    },
    {
      label: t('hero.businessRegistration'),
      href: `/services?category=${encodeURIComponent('business-licensing')}&subcategory=${encodeURIComponent('business-permit-new')}`,
    },
  ];

  // Quick access categories
  const quickCategories: QuickCategory[] = [
    {
      name: 'Certificates & Civil Registry',
      slug: 'certificates-civil-registry',
      label: 'Citizenship & ID',
    },
    {
      name: 'Business & Licensing',
      slug: 'business-licensing',
      label: 'Business',
    },
    {
      name: 'Education & Learning',
      slug: 'education-learning',
      label: 'Education',
    },
    { name: 'Health & Nutrition', slug: 'health-nutrition', label: 'Health' },
  ];

  return (
    <div className='py-12 text-white bg-linear-to-r from-primary-600 to-primary-700 md:py-24'>
      <div className='container px-4 mx-auto'>
        <div className='grid grid-cols-1 gap-8 items-center lg:grid-cols-2'>
          {/* Left section: title + search + popular */}
          <div className='animate-fade-in'>
            <h1 className='mb-4 text-3xl font-bold leading-tight md:text-4xl lg:text-5xl'>
              {t('hero.title')}
            </h1>
            <p className='mb-8 max-w-lg text-lg text-blue-200'>
              {t('hero.subtitle')}
            </p>

            {/* Search input */}
            <div className='mb-4'>
              <SearchInput
                value={query}
                onChangeValue={setQuery}
                placeholder={'Search services...'}
                className='bg-white/80'
              />
            </div>

            {/* Top 5 search results */}
            {query && results.length > 0 && (
              <div className='overflow-y-auto max-h-80 text-gray-900 rounded-lg shadow-md bg-white/90'>
                {results.slice(0, 5).map(hit => (
                  <Link
                    key={hit.slug}
                    to={`/services/${hit.slug}`}
                    className='block p-3 border-b last:border-none hover:bg-gray-100'
                  >
                    <strong>
                      {hit.service || hit.office_name || hit.office}
                    </strong>
                    {hit.description && (
                      <p className='text-sm text-gray-700'>{hit.description}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Popular services */}
            <div className='flex flex-wrap gap-2 mt-4'>
              {popularServices.map(service => (
                <Link
                  key={service.label}
                  className='px-4 py-2 text-sm text-white rounded-xl bg-white/10 border-white/20 hover:bg-white/20'
                  to={service.href}
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right section: quick access */}
          <div className='p-6 rounded-xl shadow-lg backdrop-blur-sm bg-white/10 animate-slide-in'>
            <h2 className='mb-4 text-2xl font-semibold'>
              {t('services.title')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {quickCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/services?category=${encodeURIComponent(cat.slug)}`}
                  className='flex flex-col items-center p-4 text-center rounded-lg transition-all duration-200 bg-white/10 hover:bg-white/20'
                >
                  <div className='p-3 mb-3 rounded-full bg-primary-500'>
                    {/* TODO: Replace with actual SVG per category */}
                    <svg
                      className='w-6 h-6 text-white'
                      viewBox='0 0 24 24'
                      fill='none'
                      stroke='currentColor'
                      strokeWidth='2'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    >
                      <path d='M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2'></path>
                      <circle cx='12' cy='7' r='4'></circle>
                    </svg>
                  </div>
                  <span className='font-medium'>{cat.label}</span>
                </Link>
              ))}
            </div>

            <div className='flex mt-4'>
              <Link
                className='p-4 w-full text-center text-white rounded-lg transition-all duration-500 bg-white/10 hover:bg-white/20'
                to='/services'
              >
                {t('services.viewAll')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
