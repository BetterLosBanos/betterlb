import { FC } from 'react';

import { Link } from 'react-router-dom';

import { ArrowRightIcon, UsersIcon, ZapIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const JoinUsStrip: FC = () => {
  const { t } = useTranslation('common');

  return (
    <div className='relative overflow-hidden bg-linear-to-r from-orange-500 via-red-500 to-pink-500 py-3 text-white'>
      <div className='absolute inset-0 bg-black/10'></div>

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
              <div className='rounded-full bg-yellow-300/30 p-1.5'>
                <UsersIcon className='h-4 w-4 text-yellow-200' />
              </div>
              <span className='text-sm font-bold'>
                {t('joinUs.stripTitle')}
              </span>
            </div>
            <span className='hidden text-sm text-orange-100 md:inline'>
              {t('joinUs.stripSubtitle')}
            </span>
          </div>

          <div className='flex items-center gap-3'>
            <Link
              to='/join-us'
              className='inline-flex transform items-center gap-2 rounded-full bg-yellow-300 px-4 py-1.5 text-sm font-semibold whitespace-nowrap text-gray-900 transition-all hover:scale-105 hover:bg-yellow-200'
            >
              {t('joinUs.joinNow')}
              <ArrowRightIcon className='h-3 w-3' />
            </Link>
            <a
              href='https://discord.gg/mHtThpN8bT'
              target='_blank'
              rel='noreferrer'
              className='text-xs text-yellow-200 underline transition-colors hover:text-yellow-100'
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
