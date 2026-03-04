import { FC } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRightIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JoinUsStrip: FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className='text-kapwa-text-inverse relative overflow-hidden bg-linear-to-r from-kapwa-accent-orange-default via-kapwa-accent-red-default to-kapwa-accent-pink-default py-3'>
      <div className='bg-kapwa-bg-surface-bold/10 absolute inset-0'></div>

      {/* Animated background elements */}
      <div className='absolute top-0 left-0 h-full w-full opacity-20'>
        <div className='flex h-full animate-pulse items-center justify-around'>
          <ZapIcon className='h-4 w-4' />
          <UsersIcon className='h-4 w-4' />
          <ZapIcon className='h-4 w-4' />
          <UsersIcon className='h-4 w-4' />
          <ZapIcon className='h-4 w-4' />
        </div>
      </div>

      <div className='relative z-10 container mx-auto px-4'>
        <div className='flex flex-col items-center justify-between gap-2 sm:flex-row'>
          <div className='flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <div className='rounded-full bg-kapwa-bg-warning-weak p-1.5'>
                <UsersIcon className='h-4 w-4 text-kapwa-text-inverse' />
              </div>
              <span className='kapwa-label-md'>{t('joinUs.stripTitle')}</span>
            </div>
            <span className='hidden kapwa-body-md-default text-kapwa-text-inverse md:inline'>
              {t('joinUs.stripSubtitle')}
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              to='/join-us'
              className='text-kapwa-text-strong inline-flex transform items-center gap-2 rounded-full bg-kapwa-bg-warning-default px-4 py-1.5 kapwa-label-md whitespace-nowrap transition-all hover:scale-105 hover:bg-kapwa-bg-warning-hover'
            >
              {t('joinUs.joinNow')}
              <ArrowRightIcon className='h-3 w-3' />
            </Link>
            <a
              href='https://discord.gg/mHtThpN8bT'
              target='_blank'
              rel='noreferrer'
              className='kapwa-body-sm-default text-kapwa-text-inverse underline transition-colors hover:text-kapwa-text-inverse-strong'
            >
              {t('joinUs.discord')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinUsStrip;
