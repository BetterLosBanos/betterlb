import { FC } from 'react';

import { ArrowRightIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { news } from '../../data/news';
import { formatDate, truncateText } from '../../lib/utils';
import { Card, CardContent, CardImage } from '../ui/Card';

const NewsSection: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='bg-gray-50 py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 flex items-center justify-between'>
          <h2 className='text-2xl font-bold text-gray-900 md:text-3xl'>
            {t('news.title')}
          </h2>
          <a
            href='/news'
            className='text-primary-600 hover:text-primary-700 flex items-center font-medium transition-colors'
          >
            View All
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </a>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
          {news.slice(0, 6).map(item => (
            <Card key={item.id} hoverable className='flex h-full flex-col'>
              <CardImage src={item.imageUrl} alt={item.title} />
              <CardContent className='flex flex-1 flex-col'>
                <div className='mb-2'>
                  <span className='bg-primary-100 text-primary-800 inline-block rounded-sm px-2 py-1 text-xs font-medium'>
                    {item.category.charAt(0).toUpperCase() +
                      item.category.slice(1)}
                  </span>
                  <span className='ml-2 text-sm text-gray-800'>
                    {formatDate(new Date(item.date))}
                  </span>
                </div>
                <h3 className='mb-2 text-lg font-semibold text-gray-900'>
                  {item.title}
                </h3>
                <p className='mb-4 flex-1 text-gray-800'>
                  {truncateText(item.excerpt, 100)}
                </p>
                <a
                  href={`/news/${item.id}`}
                  className='text-primary-600 hover:text-primary-700 mt-auto flex items-center font-medium transition-colors'
                >
                  Read More
                  <ArrowRightIcon className='ml-1 h-4 w-4' />
                </a>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;
