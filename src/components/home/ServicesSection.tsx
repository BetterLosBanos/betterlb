import { FC } from 'react';
import * as LucideIcons from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import serviceCategories from '../../data/service_categories.json';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    <section className='py-12 bg-white'>
      <div className='container mx-auto px-4'>
        <div className='text-center mb-12'>
          <h2 className='text-2xl md:text-3xl font-bold text-gray-900 mb-4'>
            {t('services.governmentServices')}
          </h2>
          <p className='text-gray-800 max-w-2xl mx-auto'>
            {t('services.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'>
          {displayedCategories.map(category => (
            <Link
              key={category.slug}
              to={`/services?category=${category.slug}`}
              className='group h-full'
            >
              <Card
                hoverable
                className='h-full border-t-4 border-primary-500 transition-all hover:-translate-y-1'
              >
                <CardContent className='flex flex-col h-full p-6'>
                  <div className='flex items-start justify-between mb-4'>
                    <div className='bg-primary-50 text-primary-600 p-3 rounded-lg group-hover:bg-primary-600 group-hover:text-white transition-colors'>
                      {getIcon(category.name)}
                    </div>
                  </div>

                  <h3 className='text-lg font-bold mb-2 text-gray-900 group-hover:text-primary-700'>
                    {category.name}
                  </h3>

                  <p className='text-sm text-gray-600 line-clamp-3 mb-6 flex-grow'>
                    {category.description}
                  </p>

                  <div className='text-primary-600 font-medium text-sm flex items-center group-hover:underline'>
                    View Services
                    <LucideIcons.ArrowRight className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className='text-center mt-10'>
          <Link
            to='/services?category=all'
            className='inline-flex items-center justify-center rounded-lg font-medium transition-colors px-6 py-3 bg-primary-600 text-white hover:bg-primary-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 shadow-sm'
          >
            {t('services.viewAll')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
