import { FC } from 'react';

import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';

import Button from '../ui/Button';

const PromotionBanner: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='bg-accent-500 py-12 text-white'>
      <div className='container mx-auto px-4'>
        <div className='items-center justify-between md:flex'>
          <div>
            <h2 className='mb-2 text-2xl font-bold md:text-3xl'>
              {t('promotion.philsysTitle')}
            </h2>
            <p className='mb-6 max-w-xl text-white/90 md:mb-0'>
              {t('promotion.philsysDescription')}
            </p>
          </div>
          <div>
            <Link to='https://philsys.gov.ph/registration-process'>
              <Button
                className='text-accent-600 cursor-pointer bg-white px-8 py-3 text-lg shadow-lg hover:bg-gray-100'
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
