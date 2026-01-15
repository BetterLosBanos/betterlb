import { FC } from 'react';

import { useTranslation } from 'react-i18next';

import { Card, CardContent } from '../ui/Card';

const GovernmentSection: FC = () => {
  const { t } = useTranslation('common');

  const branches = [
    {
      id: 'executive',
      title: t('government.executiveTitle'),
      description: t('government.executiveDescription'),
      icon: (
        <svg
          className='text-primary-600 h-10 w-10'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M12 17.8L5.8 21 7 14.1 2 9.3l7-1L12 2l3 6.3 7 1-5 4.8 1.2 6.9-6.2-3.2z'></path>
        </svg>
      ),
      link: '/government/executive',
    },
    {
      id: 'legislative',
      title: t('government.legislativeTitle'),
      description: t('government.legislativeDescription'),
      icon: (
        <svg
          className='text-primary-600 h-10 w-10'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <rect x='2' y='7' width='20' height='14' rx='2' ry='2'></rect>
          <path d='M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16'></path>
        </svg>
      ),
      link: '/government/legislative',
    },
    {
      id: 'barangays',
      title: t('government.barangaysTitle'),
      description: t('government.barangaysDescription'),
      icon: (
        <svg
          className='text-primary-600 h-10 w-10'
          viewBox='0 0 24 24'
          fill='none'
          stroke='currentColor'
          strokeWidth='2'
          strokeLinecap='round'
          strokeLinejoin='round'
        >
          <path d='M3 12l9-8 9 8'></path>
          <path d='M5 10v10h14V10'></path>
          <path d='M9 20v-6h6v6'></path>
        </svg>
      ),
      link: '/government/barangays',
    },
  ];

  return (
    <section className='bg-white py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-3xl'>
            {t('government.title')}
          </h2>
          <p className='mx-auto max-w-2xl text-gray-800'>
            {t('government.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {branches.map(branch => (
            <Card key={branch.id} hoverable className='text-center'>
              <CardContent className='p-6'>
                <div className='mb-4 flex justify-center'>{branch.icon}</div>
                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  {branch.title}
                </h3>
                <p className='mb-4 text-gray-800'>{branch.description}</p>
                <a
                  href={branch.link}
                  className='text-primary-600 hover:text-primary-700 inline-flex items-center font-medium transition-colors'
                >
                  {t('government.learnMore')}
                  <svg
                    className='ml-1 h-4 w-4'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <line x1='5' y1='12' x2='19' y2='12'></line>
                    <polyline points='12 5 19 12 12 19'></polyline>
                  </svg>
                </a>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='mt-12 rounded-lg bg-gray-50 p-6'>
          <div className='items-center md:flex'>
            <div className='mb-6 md:mb-0 md:w-2/3 md:pr-8'>
              <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                {t('government.directoryTitle')}
              </h3>
              <p className='text-gray-800'>
                {t('government.directoryDescription')}
              </p>
            </div>
            <div className='flex justify-center md:w-1/3 md:justify-end'>
              <a
                href='/government/executive'
                className='bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 inline-flex items-center justify-center rounded-md px-6 py-3 font-medium text-white shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
              >
                {t('government.viewDirectory')}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default GovernmentSection;
