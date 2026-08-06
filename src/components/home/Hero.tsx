import { FC, useId, useMemo, useState } from 'react';

import { Link, useNavigate } from 'react-router-dom';

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
  const [activeIndex, setActiveIndex] = useState(-1);
  const navigate = useNavigate();
  const listboxId = useId();
  const showResults = query.trim().length > 0;

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

  const visibleResults = results.slice(0, 5);

  const handleChangeValue = (value: string) => {
    setQuery(value);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    console.log('keydown fired:', e.key, {
      showResults,
      visibleResults,
      activeIndex,
    });
    if (!showResults || visibleResults.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex(i => (i + 1) % visibleResults.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex(
        i => (i - 1 + visibleResults.length) % visibleResults.length
      );
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      navigate(`services/${visibleResults[activeIndex].slug}`);
    }
  };

  const randomServices = useMemo(() => {
    const services = mergedServicesData as MergedService[];
    const servicesWithPlainNames = services.filter(s => s.plainLanguageName);
    const shuffled = [...servicesWithPlainNames].sort(
      () => Math.random() - 0.5
    );
    return shuffled.slice(0, 2);
  }, []);

  const quickAccessCards: QuickAccessCard[] = [
    {
      title: t('hero.financialReports'),
      description: t('hero.financialReportsDesc'),
      to: '/transparency/financial',
      icon: <DollarSignIcon className='w-6 h-6' />,
    },
    {
      title: t('hero.infrastructure'),
      description: t('hero.infrastructureDesc'),
      to: '/transparency/infrastructure',
      icon: <BuildingIcon className='w-6 h-6' />,
    },
    {
      title: t('hero.legislation'),
      description: t('hero.legislationDesc'),
      to: '/openlgu',
      icon: <GavelIcon className='w-6 h-6' />,
    },
    {
      title: t('hero.statistics'),
      description: t('hero.statisticsDesc'),
      to: '/statistics',
      icon: <BarChart3Icon className='w-6 h-6' />,
    },
  ];

  return (
    <div className='py-12 from-kapwa-brand-600 to-kapwa-brand-700 bg-linear-to-r text-kapwa-text-inverse md:py-24'>
      <div className='container px-4 mx-auto'>
        <div className='grid grid-cols-1 gap-8 items-center lg:grid-cols-2'>
          <div className='animate-fade-in'>
            <h1 className='mb-4 text-kapwa-text-inverse kapwa-heading-xl'>
              {t('hero.title')}
            </h1>
            <p className='mb-8 max-w-lg opacity-80 text-kapwa-text-inverse kapwa-body-md-default'>
              {t('hero.subtitle')}
            </p>

            <div className='mb-4'>
              <label htmlFor='hero-service-search' className='sr-only'>
                {t('hero.searchLabel')}
              </label>
              <SearchInput
                id='hero-service-search'
                role='combobox'
                aria-expanded={showResults}
                aria-controls={listboxId}
                aria-autocomplete='list'
                aria-label={t('hero.searchLabel')}
                value={query}
                onChangeValue={handleChangeValue}
                onKeyDown={handleKeyDown}
                aria-activedescendant={
                  activeIndex >= 0
                    ? `${listboxId}-opt-${visibleResults[activeIndex]?.slug}`
                    : undefined
                }
                placeholder={t('hero.searchPlaceholder')}
                className='bg-kapwa-bg-surface/80'
              />
            </div>

            <div
              id={listboxId}
              role='status'
              aria-live='polite'
              className='sr-only'
            >
              {showResults
                ? `${results.length} result${results.length === 1 ? '' : 's'}`
                : ''}
            </div>

            {showResults && results.length > 0 && (
              <ul
                role='listbox'
                aria-label='Matching services'
                className='overflow-y-auto max-h-80 rounded-lg shadow-md bg-kapwa-bg-surface/90 text-kapwa-text-strong'
              >
                {visibleResults.map((hit, index) => (
                  <li
                    key={hit.slug}
                    id={`${listboxId}-opt-${hit.slug}`}
                    role='option'
                    aria-selected={index === activeIndex}
                  >
                    <Link
                      to={`/services/${hit.slug}`}
                      className={`block p-3 border-b border-kapwa-border-weak hover:bg-kapwa-bg-hover focus-visible:bg-kapwa-bg-hover focus-visible:outline-none last:border-none ${
                        index === activeIndex ? 'bg-kapwa-bg-hover' : ''
                      }`}
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
                  </li>
                ))}
              </ul>
            )}

            {showResults && results.length === 0 && (
              <p
                role='status'
                className='px-4 py-3 text-sm rounded-lg bg-kapwa-bg-surface/90 text-kapwa-text-strong'
              >
                {t('hero.noResults')}
              </p>
            )}

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

          <div className='p-6 rounded-xl shadow-lg backdrop-blur-sm animate-slide-in bg-kapwa-bg-surface/10'>
            <h2 className='mb-4 text-kapwa-text-inverse kapwa-heading-lg'>
              {t('hero.quickAccess')}
            </h2>
            <div className='grid grid-cols-2 gap-4'>
              {quickAccessCards.map(card => (
                <Link
                  key={card.to}
                  to={card.to}
                  className='flex flex-col items-center p-4 text-center rounded-lg transition-all duration-200 bg-kapwa-bg-surface/10 hover:bg-kapwa-bg-surface/20 focus-visible:ring-2 focus-visible:ring-kapwa-text-inverse focus-visible:outline-none'
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
