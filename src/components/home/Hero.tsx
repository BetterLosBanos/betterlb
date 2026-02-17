import { FC, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import Fuse from 'fuse.js';
import {
  BookOpenIcon,
  BriefcaseIcon,
  FileTextIcon,
  HeartIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import SearchInput from '@/components/ui/SearchInput';

import servicesData from '@/data/services/services.json';

interface Service {
  slug: string;
  service?: string;
  office_name?: string;
  office?: string;
  description?: string;
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
}

const Hero: FC = () => {
  const { t } = useTranslation('common');
  const [query, setQuery] = useState('');

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

  const popularServices = useMemo(() => {
    if (!servicesData || servicesData.length === 0) return [];
    const shuffled = [...servicesData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3).map(service => ({
      label: service.service || 'Service',
      href: `/services?category=${encodeURIComponent(service.category?.slug || '')}&subcategory=${encodeURIComponent(service.slug)}`,
    }));
  }, []);

  interface QuickCategory {
    name: string;
    slug: string;
    label: string;
    icon: JSX.Element;
  }

  const quickCategories: QuickCategory[] = [
    {
      name: 'Certificates & Civil Registry',
      slug: 'certificates-civil-registry',
      label: 'Citizenship & ID',
      icon: <FileTextIcon className='w-6 h-6 text-kapwa-text-inverse' />,
    },
    {
      name: 'Business & Licensing',
      slug: 'business-licensing',
      label: 'Business',
      icon: <BriefcaseIcon className='w-6 h-6 text-kapwa-text-inverse' />,
    },
    {
      name: 'Education & Learning',
      slug: 'education-learning',
      label: 'Education',
      icon: <BookOpenIcon className='w-6 h-6 text-kapwa-text-inverse' />,
    },
    {
      name: 'Health & Nutrition',
      slug: 'health-nutrition',
      label: 'Health',
      icon: <HeartIcon className='w-6 h-6 text-kapwa-text-inverse' />,
    },
  ];

  return (
    <div className='py-12 from-kapwa-brand-600 to-kapwa-brand-700 bg-linear-to-r text-kapwa-text-inverse md:py-24'>
      <div className='container px-4 mx-auto'>
        <div className='grid grid-cols-1 gap-8 items-center lg:grid-cols-2'>
          {/* Left section: title + search + popular */}
          <div className='animate-fade-in'>
            <h1 className='mb-4 text-kapwa-text-inverse kapwa-heading-md md:kapwa-heading-lg lg:kapwa-heading-xl'>
              {t('hero.title')}
            </h1>
            <p className='mb-8 max-w-lg opacity-80 text-kapwa-text-inverse kapwa-body-md-default'>
              {t('hero.subtitle')}
            </p>

            {/* Search input */}
            <div className='mb-4'>
              <SearchInput
                value={query}
                onChangeValue={setQuery}
                placeholder={'Search services...'}
                className='bg-kapwa-bg-surface/80'
              />
            </div>

            {/* Top 5 search results */}
            {query && results.length > 0 && (
              <div className='overflow-y-auto max-h-80 rounded-lg shadow-md bg-kapwa-bg-surface/90 text-kapwa-text-strong'>
                {results.slice(0, 5).map(hit => (
                  <Link
                    key={hit.slug}
                    to={`/services/${hit.slug}`}
                    className='block p-3 border-b hover:bg-kapwa-bg-hover last:border-none'
                  >
                    <strong>
                      {hit.service || hit.office_name || hit.office}
                    </strong>
                    {hit.description && (
                      <p className='text-kapwa-text-support kapwa-body-sm-default'>
                        {hit.description}
                      </p>
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
                  className='px-4 py-2 rounded-xl border text-kapwa-text-inverse kapwa-body-sm-strong bg-kapwa-bg-surface/10 hover:bg-kapwa-bg-surface/20 border-white/20'
                  to={service.href}
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right section: quick access */}
          <div className='p-6 rounded-xl shadow-lg backdrop-blur-sm animate-slide-in bg-kapwa-bg-surface/10'>
            <h2 className='mb-4 text-kapwa-text-inverse kapwa-heading-lg'>
              {t('services.title')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {quickCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/services?category=${encodeURIComponent(cat.slug)}`}
                  className='flex flex-col items-center p-4 text-center rounded-lg transition-all duration-200 bg-kapwa-bg-surface/10 hover:bg-kapwa-bg-surface/20'
                >
                  {/* Icon background with Kapwa brand color */}
                  <div className='p-3 mb-3 rounded-full bg-kapwa-brand-500'>
                    {cat.icon}
                  </div>
                  <span className='text-kapwa-text-inverse kapwa-body-md-strong'>
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className='flex mt-4'>
              <Link
                className='p-4 w-full text-center rounded-lg transition-all duration-500 text-kapwa-text-inverse kapwa-body-md-strong bg-kapwa-bg-surface/10 hover:bg-kapwa-bg-surface/20'
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
