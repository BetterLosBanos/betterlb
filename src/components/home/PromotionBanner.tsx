import { FC } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@bettergov/kapwa/button';
import { useTranslation } from 'react-i18next';

const PromotionBanner: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='bg-kapwa-bg-accent-yellow-weak text-kapwa-text-inverse py-12'>
      <div className='container mx-auto px-4'>
        <div className='items-center justify-between md:flex'>
          <div>
            <h2 className='mb-2 kapwa-heading-lg font-bold'>
              {t('promotion.philsysTitle')}
            </h2>
            <p className='text-kapwa-text-inverse/90 mb-6 max-w-xl md:mb-0'>
              {t('promotion.philsysDescription')}
            </p>
          </div>
          <div>
            <Link to='https://philsys.gov.ph/registration-process'>
              <Button
                className='text-kapwa-text-accent-yellow bg-kapwa-bg-surface hover:bg-kapwa-bg-hover cursor-pointer px-8 py-3 text-lg shadow-lg'
                size='lg'
              >
                {t('promotion.registerNow')}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default PromotionBanner;
