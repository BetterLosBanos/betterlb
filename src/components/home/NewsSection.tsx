import { FC } from 'react';

import { ArrowRightIcon, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent, CardGrid } from '@/components/ui/Card';

import { news } from '../../data/news';
import { formatDate, truncateText } from '../../lib/utils';

const NewsSection: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='bg-kapwa-bg-surface py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-8 flex items-center justify-between'>
          <h2 className='text-kapwa-text-strong kapwa-heading-lg font-bold'>
            {t('news.title')}
          </h2>
          <a
            href='/news'
            className='text-kapwa-text-brand hover:text-kapwa-text-brand flex items-center font-medium transition-colors'
          >
            View All
            <ArrowRightIcon className='ml-1 h-4 w-4' />
          </a>
        </div>

        {/* Using documented CardGrid pattern */}
        <CardGrid columns={3}>
          {news.slice(0, 6).map(item => (
            <a
              key={item.id}
              href={`/news/${item.id}`}
              className='group flex h-full flex-col'
            >
              <Card hover className='flex h-full flex-col'>
                <CardContent className='flex flex-1 flex-col p-6'>
                  <div className='mb-3 flex flex-wrap items-center gap-2'>
                    <Badge variant='outline' className='w-fit'>
                      {item.category.charAt(0).toUpperCase() +
                        item.category.slice(1)}
                    </Badge>
                    <div className='flex items-center gap-1 text-kapwa-text-support text-xs'>
                      <Calendar className='h-3 w-3' />
                      {formatDate(new Date(item.date))}
                    </div>
                  </div>
                  <h3 className='text-kapwa-text-strong mb-2 text-lg font-semibold group-hover:text-kapwa-text-brand transition-colors'>
                    {item.title}
                  </h3>
                  <p className='text-kapwa-text-support mb-4 flex-1 text-sm'>
                    {truncateText(item.excerpt, 100)}
                  </p>
                  <span className='text-kapwa-text-link group-hover:text-kapwa-text-link-hover mt-auto flex items-center text-sm font-medium transition-colors'>
                    Read More
                    <ArrowRightIcon className='ml-1 h-4 w-4 transition-transform group-hover:translate-x-1' />
                  </span>
                </CardContent>
              </Card>
            </a>
          ))}
        </CardGrid>
      </div>
    </section>
  );
};

export default NewsSection;
