import { FC } from 'react';

import { Link } from 'react-router-dom';

import { Button } from '@bettergov/kapwa/button';
import { ArrowRightIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JoinUsBanner: FC = () => {
  const { t } = useTranslation('common');

  return (
    <section className='text-kapwa-text-inverse relative overflow-hidden bg-linear-to-br from-kapwa-neutral-800 via-kapwa-neutral-900 to-black py-16'>
      <div className='absolute inset-0 bg-linear-to-t from-black/30 to-transparent'></div>

      {/* Decorative elements */}
      <div className='absolute top-4 left-10 opacity-20'>
        <ZapIcon className='h-16 w-16 text-kapwa-text-warning' />
      </div>
      <div className='absolute right-10 bottom-4 opacity-20'>
        <UsersIcon className='h-20 w-20 text-kapwa-text-warning' />
      </div>

      <div className='relative z-10 container mx-auto px-4'>
        <div className='mx-auto max-w-4xl text-center'>
          <div className='mb-6 flex justify-center'>
            <div className='rounded-full border border-kapwa-text-warning/40 bg-kapwa-bg-warning-weak p-4 backdrop-blur-sm'>
              <UsersIcon className='h-8 w-8 text-kapwa-text-inverse' />
            </div>
          </div>

          <h2 className='mb-4 kapwa-heading-md text-3xl leading-tight font-bold md:text-5xl'>
            {t('joinUs.bannerTitle').split('#CivicTech')[0]}
            <span className='text-kapwa-text-inverse'>#CivicTech</span>
            {t('joinUs.bannerTitle').split('#CivicTech')[1]}
          </h2>

          <p className='mx-auto mb-8 max-w-3xl kapwa-body-lg-default leading-relaxed text-kapwa-text-inverse md:text-xl'>
            {t('joinUs.bannerSubtitle')}
            <strong className='text-kapwa-text-inverse'>
              {' '}
              {t('joinUs.bannerHighlight')}
            </strong>
          </p>

          <div className='flex flex-col items-center justify-center gap-4 sm:flex-row'>
            <Link to='/join-us'>
              <Button
                className='bg-kapwa-bg-surface text-kapwa-text-strong hover:bg-kapwa-bg-hover transform shadow-lg hover:scale-105'
                size='lg'
                leftIcon={<UsersIcon className='h-5 w-5' />}
                rightIcon={<ArrowRightIcon className='h-5 w-5' />}
              >
                {t('joinUs.joinMovement')}
              </Button>
            </Link>

            <div className='kapwa-label-md text-kapwa-text-inverse'>
              {t('joinUs.or')}
            </div>

            <Button
              href='https://discord.gg/mHtThpN8bT'
              target='_blank'
              rel='noreferrer'
              className='text-kapwa-text-inverse hover:bg-kapwa-bg-surface hover:text-kapwa-text-strong border-kapwa-border-inverse'
              size='lg'
              variant='outline'
            >
              {t('joinUs.joinDiscord')}
            </Button>
          </div>

          <div className='mt-8 border-t border-kapwa-border-inverse/20 pt-6'>
            <p className='kapwa-body-md-default text-kapwa-text-inverse'>
              {t('joinUs.features')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default JoinUsBanner;
