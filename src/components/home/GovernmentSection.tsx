import { FC } from 'react';

import { useNavigate } from 'react-router-dom';

import { Button } from '@bettergov/kapwa';
import { Building2Icon, HomeIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { config } from '@/lib/lguConfig';

import { Card, CardContent } from '../ui/Card';

const GovernmentSection: FC = () => {
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const branches = [
    {
      id: 'executive',
      title: t('government.electedofficialsTitle'),
      description: t(
        'government.electedofficialsDescription',
        'Meet your Mayor, Vice Mayor, and Councilors.'
      ),
      icon: <UsersIcon className='text-kapwa-text-brand h-10 w-10' />,
      link: '/government/elected-officials',
    },
    {
      id: 'legislative',
      title: t('government.departmentsTitle'),
      description: t(
        'government.departmentsDescription',
        'Services and offices under the Executive branch.'
      ),
      icon: <Building2Icon className='text-kapwa-text-brand h-10 w-10' />,
      link: '/government/departments',
    },
    {
      id: 'barangays',
      title: t('government.barangaysTitle'),
      description: t('government.barangaysDescription'),
      icon: <HomeIcon className='text-kapwa-text-brand h-10 w-10' />,
      link: '/government/barangays',
    },
  ];

  return (
    <section className='bg-kapwa-bg-surface py-12'>
      <div className='container mx-auto px-4'>
        <div className='mb-12 text-center'>
          <h2 className='text-kapwa-text-strong mb-4 text-2xl font-bold md:text-3xl'>
            {t('government.title')}
          </h2>
          <p className='text-kapwa-text-support mx-auto max-w-2xl'>
            {t('government.description')}
          </p>
        </div>

        <div className='grid grid-cols-1 gap-6 md:grid-cols-3'>
          {branches.map(branch => (
            <Card key={branch.id} hoverable className='text-center'>
              <CardContent className='p-6'>
                <div className='mb-4 flex justify-center'>{branch.icon}</div>
                <h3 className='text-kapwa-text-strong mb-2 text-xl font-semibold'>
                  {branch.title}
                </h3>
                <p className='text-kapwa-text-support mb-4'>{branch.description}</p>
                <Button
                  onClick={() => navigate(branch.link)}
                  variant='link'
                  size='sm'
                  rightIcon={
                    <svg
                      className='h-4 w-4'
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
                  }
                >
                  {t('government.learnMore')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className='bg-kapwa-bg-surface-raised mt-12 rounded-lg p-6'>
          <div className='items-center md:flex'>
            <div className='mb-6 md:mb-0 md:w-2/3 md:pr-8'>
              <h3 className='text-kapwa-text-strong mb-2 text-xl font-semibold'>
                {t('government.directoryTitle')}
              </h3>
              <p className='text-kapwa-text-strong'>
                {t('government.directoryDescription')}
              </p>
            </div>
            <div className='flex justify-center md:w-1/3 md:justify-end'>
              <a
                href='/government/'
                className='bg-kapwa-bg-brand-weak0 hover:bg-kapwa-bg-brand-default focus:ring-kapwa-border-brand text-kapwa-text-inverse inline-flex items-center justify-center rounded-md px-6 py-3 font-medium shadow-xs transition-colors focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
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
