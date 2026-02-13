import { FC } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRightIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Button from '@/components/ui/Button';

const JoinUsBanner: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='relative overflow-hidden bg-linear-to-br from-gray-700 via-gray-800 to-gray-900 py-16 text-white'>
      <div className='absolute inset-0 bg-linear-to-t from-black/30 to-transparent'></div>

      {/* Decorative elements */}
      <div className='absolute top-4 left-10 opacity-20'>
        <ZapIcon className='h-16 w-16 text-yellow-300' />
      </div>
      <div className='absolute right-10 bottom-4 opacity-20'>
        <UsersIcon className='h-20 w-20 text-yellow-300' />
      </div>

      <div className='relative z-10 container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 flex justify-center'>
            <div className='rounded-full border border-yellow-300/40 bg-yellow-300/20 p-4 backdrop-blur-sm'>
              <UsersIcon className='h-8 w-8 text-yellow-200' />
            </div>
          </div>

          <h2 className='mb-4 text-3xl leading-tight font-bold md:text-5xl'>
            {t('joinUs.bannerTitle').split('#CivicTech')[0]}
            <span className='text-yellow-200'>#CivicTech</span>
            {t('joinUs.bannerTitle').split('#CivicTech')[1]}
          </h2>

          <p className='mx-auto mb-8 max-w-3xl text-lg leading-relaxed text-orange-100 md:text-xl'>
            {t('joinUs.bannerSubtitle')}
            <strong className='text-yellow-200'>
              {' '}
              {t('joinUs.bannerHighlight')}
            </strong>
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link to='/join-us'>
              <Button
                className='transform bg-white text-gray-900 shadow-lg hover:scale-105 hover:bg-gray-100'
                size='lg'
                leftIcon={<UsersIcon className='h-5 w-5' />}
                rightIcon={<ArrowRightIcon className='h-5 w-5' />}
              >
                {t('joinUs.joinMovement')}
              </Button>
            </Link>

            <div className='font-medium text-orange-100'>{t('joinUs.or')}</div>

            <Button
              href='https://discord.gg/mHtThpN8bT'
              target='_blank'
              rel='noreferrer'
              className='border-white text-white hover:bg-white hover:text-gray-900'
              size='lg'
              variant='outline'
            >
              {t('joinUs.joinDiscord')}
            </Button>
          </div>

          <div className='mt-8 border-t border-white/20 pt-6'>
            <p className='text-sm text-orange-200'>{t('joinUs.features')}</p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsBanner;
