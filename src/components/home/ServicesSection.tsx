import { FC } from 'react';

import { Link } from 'react-router-dom';

import * as LucideIcons from 'lucide-react';
import { useTranslation } from 'react-i18next';

import serviceCategories from '../../data/service_categories.json';
import { Card, CardContent } from '../ui/Card';

interface Category {
  name: string;
  slug: string;
  description: string;
}

const ServicesSection: FC = () => {
  const { t } = useTranslation('common');

  const getIcon = (categoryName: string) => {
    const iconMap: { [key: string]: keyof typeof LucideIcons } = {
      'Certificates & Vital Records': 'ScrollText',
      'Business & Licensing': 'Store',
      'Taxation & Assessment': 'Landmark',
      'Infrastructure & Engineering': 'HardHat',
      'Social Services': 'HeartHandshake',
      'Health & Wellness': 'Stethoscope',
      'Agriculture & Livelihood': 'Sprout',
      'Environment & Waste': 'Leaf',
      'Education & Scholarship': 'GraduationCap',
      'Public Safety': 'ShieldCheck',
    };

    // Fallback to FileText if icon not found
    const iconName = iconMap[categoryName] || 'FileText';
    const Icon = LucideIcons[iconName] as React.ElementType;

    return Icon ? <Icon className='h-6 w-6' /> : null;
  };

  // Cast JSON data to new Interface
  const categories = serviceCategories.categories as Category[];

  // Show only first 8-12 categories (depending on your grid preference)
  const displayedCategories = categories.slice(0, 8);

  return (
    <section className='bg-kapwa-bg-surface py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='text-kapwa-text-strong mb-4 text-2xl font-bold md:text-3xl'>
            {t('services.governmentServices')}
          </h2>
          <p className='text-kapwa-text-support mx-auto max-w-2xl'>
            {t('services.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
          {displayedCategories.map(category => (
            <Link
              key={category.slug}
              to={`/services?category=${category.slug}`}
              className='group h-full'
            >
              <Card
                className='border-kapwa-border-focus h-full border-t-4 transition-all hover:-translate-y-1'
              >
                <CardContent className='flex h-full flex-col p-6'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='bg-kapwa-bg-surface text-kapwa-text-brand group-hover:bg-kapwa-bg-brand-default group-hover:text-kapwa-text-inverse rounded-lg p-3 transition-colors'>
                      {getIcon(category.name)}
                    </div>
                  </div>

                  <h3 className='group-hover:text-kapwa-text-brand text-kapwa-text-strong mb-2 text-lg font-bold'>
                    {category.name}
                  </h3>

                  <p className='text-kapwa-text-on-disabled mb-6 line-clamp-3 grow text-sm'>
                    {category.description}
                  </p>

                  <div className='text-kapwa-text-link flex items-center text-sm font-medium group-hover:underline group-hover:text-kapwa-text-link-hover'>
                    View Services
                    <LucideIcons.ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className='mt-10 text-center'>
          <Link
            to='/services?category=all'
            className='bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover focus:ring-kapwa-border-brand text-kapwa-text-inverse inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
          >
            {t('services.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
