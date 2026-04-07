import { FC, useMemo, useState } from 'react';

import { Link } from 'react-router-dom';

import Fuse from 'fuse.js';
import {
  BarChart3Icon,
  BuildingIcon,
  DollarSignIcon,
  FileTextIcon,
  GavelIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import SearchInput from '@/components/ui/SearchInput';

import servicesData from '@/data/services/services.json';
import mergedServicesData from '@/data/citizens-charter/merged-services.json';

interface Service {
  slug: string;
  service?: string;
  office_name?: string;
  office?: string;
  description?: string;
  category?: { name: string; slug: string };
  subcategory?: { name: string; slug: string };
}

interface MergedService {
  slug: string;
  service: string;
  plainLanguageName?: string;
  officeSlug: string;
}

interface QuickAccessCard {
  title: string;
  description: string;
  to: string;
  icon: JSX.Element;
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

  // Random services from merged-services - using plain language titles
  const randomServices = useMemo(() => {
    const services = mergedServicesData as MergedService[];
    // Filter services that have plainLanguageName
    const servicesWithPlainNames = services.filter(s => s.plainLanguageName);
    // Shuffle and pick 2
    const shuffled = [...servicesWithPlainNames].sort(
      () => Math.random() - 0.5
    );
    return shuffled.slice(0, 2);
  }, []);

  // Quick access cards for key sections
  const quickAccessCards: QuickAccessCard[] = [
    {
      title: 'Financial Reports',
      description: 'Budget & income statements',
      to: '/transparency/financial',
      icon: <DollarSignIcon className='w-6 h-6' />,
    },
    {
      title: 'Infrastructure',
      description: 'Track municipal projects',
      to: '/transparency/infrastructure',
      icon: <BuildingIcon className='w-6 h-6' />,
    },
    {
      title: 'Legislation',
      description: 'Ordinances & resolutions',
      to: '/openlgu',
      icon: <GavelIcon className='w-6 h-6' />,
    },
    {
      title: 'Statistics',
      description: 'Population & demographics',
      to: '/statistics',
      icon: <BarChart3Icon className='w-6 h-6' />,
    },
  ];

  return (
    <div className='py-12 from-kapwa-brand-600 to-kapwa-brand-700 bg-linear-to-r text-kapwa-text-inverse md:py-24'>
      <div className='container px-4 mx-auto'>
        <div className='grid grid-cols-1 gap-8 items-center lg:grid-cols-2'>
          {/* Left section: title + search + quick categories */}
          <div className='animate-fade-in'>
            <h1 className='mb-4 text-kapwa-text-inverse kapwa-heading-xl'>
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

            {/* Random services - using plain language titles */}
            <div className='flex flex-wrap gap-2 mt-4'>
              {randomServices.map(service => (
                <Link key={service.slug} to={`/services/${service.slug}`}>
                  <Badge
                    variant='outline'
                    className='cursor-pointer border-white/20 text-kapwa-text-inverse hover:bg-kapwa-bg-surface/20'
                  >
                    <FileTextIcon className='w-4 h-4' />
                    <span className='ml-1'>
                      {service.plainLanguageName || service.service}
                    </span>
                  </Badge>
                </Link>
              ))}
            </div>
          </div>

          {/* Right section: quick access to key sections */}
          <div className='p-6 rounded-xl shadow-lg backdrop-blur-sm animate-slide-in bg-kapwa-bg-surface/10'>
            <h2 className='mb-4 text-kapwa-text-inverse kapwa-heading-lg'>
              {t('hero.quickAccess')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {quickAccessCards.map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className='flex flex-col items-center p-4 text-center rounded-lg transition-all duration-200 bg-kapwa-bg-surface/10 hover:bg-kapwa-bg-surface/20'
                >
                  <div className='p-3 mb-3 rounded-full bg-kapwa-brand-500'>
                    <div className='w-6 h-6 text-kapwa-text-inverse'>
                      {card.icon}
                    </div>
                  </div>
                  <span className='text-kapwa-text-inverse kapwa-body-md-strong'>
                    {card.title}
                  </span>
                  <span className='text-kapwa-text-inverse/70 kapwa-body-sm-default'>
                    {card.description}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
