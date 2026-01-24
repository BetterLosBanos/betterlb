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
    <section className='bg-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-3xl'>
            {t('services.governmentServices')}
          </h2>
          <p className='mx-auto max-w-2xl text-gray-800'>
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
                hoverable
                className='border-primary-500 h-full border-t-4 transition-all hover:-translate-y-1'
              >
                <CardContent className='flex h-full flex-col p-6'>
                  <div className='mb-4 flex items-start justify-between'>
                    <div className='bg-primary-50 text-primary-600 group-hover:bg-primary-600 rounded-lg p-3 transition-colors group-hover:text-white'>
                      {getIcon(category.name)}
                    </div>
                  </div>

                  <h3 className='group-hover:text-primary-700 mb-2 text-lg font-bold text-gray-900'>
                    {category.name}
                  </h3>

                  <p className='mb-6 line-clamp-3 grow text-sm text-gray-600'>
                    {category.description}
                  </p>

                  <div className='text-primary-600 flex items-center text-sm font-medium group-hover:underline'>
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
            className='bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 inline-flex items-center justify-center rounded-lg px-6 py-3 font-medium text-white shadow-sm transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
          >
            {t('services.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
