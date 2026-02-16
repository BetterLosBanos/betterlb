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
      icon: <FileTextIcon className='kapwa-text-inverse h-6 w-6' />,
    },
    {
      name: 'Business & Licensing',
      slug: 'business-licensing',
      label: 'Business',
      icon: <BriefcaseIcon className='kapwa-text-inverse h-6 w-6' />,
    },
    {
      name: 'Education & Learning',
      slug: 'education-learning',
      label: 'Education',
      icon: <BookOpenIcon className='kapwa-text-inverse h-6 w-6' />,
    },
    {
      name: 'Health & Nutrition',
      slug: 'health-nutrition',
      label: 'Health',
      icon: <HeartIcon className='kapwa-text-inverse h-6 w-6' />,
    },
  ];

  return (
    // ✅ FIXED: Blue gradient background with Kapwa colors
    <div className='from-kapwa-brand-600 to-kapwa-brand-700 kapwa-text-inverse bg-gradient-to-r py-12 md:py-24'>
      <div className='container mx-auto px-4'>
        <div className='grid grid-cols-1 items-center gap-8 lg:grid-cols-2'>
          {/* Left section: title + search + popular */}
          <div className='animate-fade-in'>
            {/* ✅ KEEPING ORIGINAL SIZES: text-3xl, md:text-4xl, lg:text-5xl */}
            <h1 className='kapwa-text-inverse mb-4 text-3xl leading-tight font-bold md:text-4xl lg:text-5xl'>
              {t('hero.title')}
            </h1>
            {/* ✅ KEEPING ORIGINAL SIZE: text-lg, using Kapwa color */}
            <p className='kapwa-text-inverse mb-8 max-w-lg text-lg opacity-80'>
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
              <div className='kapwa-bg-surface/90 kapwa-text-strong max-h-80 overflow-y-auto rounded-lg shadow-md'>
                {results.slice(0, 5).map(hit => (
                  <Link
                    key={hit.slug}
                    to={`/services/${hit.slug}`}
                    className='hover:kapwa-bg-hover block border-b p-3 last:border-none'
                  >
                    <strong>
                      {hit.service || hit.office_name || hit.office}
                    </strong>
                    {hit.description && (
                      <p className='kapwa-text-support text-sm'>
                        {hit.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {/* Popular services */}
            <div className='mt-4 flex flex-wrap gap-2'>
              {popularServices.map(service => (
                <Link
                  key={service.label}
                  className='kapwa-text-inverse rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-sm hover:bg-white/20'
                  to={service.href}
                >
                  {service.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Right section: quick access */}
          <div className='animate-slide-in rounded-xl bg-white/10 p-6 shadow-lg backdrop-blur-sm'>
            {/* ✅ KEEPING ORIGINAL SIZE: text-2xl */}
            <h2 className='kapwa-text-inverse mb-4 text-2xl font-semibold'>
              {t('services.title')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {quickCategories.map(cat => (
                <Link
                  key={cat.slug}
                  to={`/services?category=${encodeURIComponent(cat.slug)}`}
                  className='flex flex-col items-center rounded-lg bg-white/10 p-4 text-center transition-all duration-200 hover:bg-white/20'
                >
                  {/* ✅ FIXED: Icon background with Kapwa brand color */}
                  <div className='kapwa-bg-brand-500 mb-3 rounded-full p-3'>
                    {cat.icon}
                  </div>
                  <span className='kapwa-text-inverse font-medium'>
                    {cat.label}
                  </span>
                </Link>
              ))}
            </div>
            <div className='mt-4 flex'>
              <Link
                className='kapwa-text-inverse w-full rounded-lg bg-white/10 p-4 text-center transition-all duration-500 hover:bg-white/20'
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
