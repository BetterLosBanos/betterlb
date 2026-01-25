import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '../ui/Card';
import { UsersIcon, Building2Icon, HomeIcon } from 'lucide-react';

const GovernmentSection: FC = () => {
  const { t } = useTranslation('common');

  const branches = [
    {
      id: 'executive',
      title: t('government.electedofficialsTitle', 'Elected Officials'),
      description: t(
        'government.electedofficialsDescription',
        'Meet your Mayor, Vice Mayor, and Councilors.'
      ),
      icon: <UsersIcon className='w-10 h-10 text-primary-600' />,
      link: '/government/elected-officials',
    },
    {
      id: 'legislative',
      title: t('government.departmentsTitle', 'Departments'),
      description: t(
        'government.departmentsDescription',
        'Services and offices under the Executive branch.'
      ),
      icon: <Building2Icon className='w-10 h-10 text-primary-600' />,
      link: '/government/departments',
    },
    {
      id: 'barangays',
      title: t('government.barangaysTitle', 'Barangays'),
      description: t(
        'government.barangaysDescription',
        'The 14 local component units of Los Baños.'
      ),
      icon: <HomeIcon className='w-10 h-10 text-primary-600' />,
      link: '/government/barangays',
    },
  ];

  return (
    <section className='py-12 bg-white'>
      <div className='container px-4 mx-auto'>
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
                <div className='flex justify-center mb-4'>{branch.icon}</div>
                <h3 className='mb-2 text-xl font-semibold text-gray-900'>
                  {branch.title}
                </h3>
                <p className='mb-4 text-gray-800'>{branch.description}</p>
                <a
                  href={branch.link}
                  className='inline-flex items-center font-medium transition-colors text-primary-600 hover:text-primary-700'
                >
                  {t('government.learnMore')}
                  <svg
                    className='ml-1 w-4 h-4'
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

        <div className='p-6 mt-12 bg-gray-50 rounded-lg'>
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
                href='/government/'
                className='inline-flex justify-center items-center px-6 py-3 font-medium text-white rounded-md transition-colors bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 shadow-xs focus:ring-2 focus:ring-offset-2 focus:outline-hidden'
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
