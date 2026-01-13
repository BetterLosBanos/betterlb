import { ReactNode } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import {
  Building2Icon,
  UsersIcon, // Icon for Elected Officials
  MapPinIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';
import { PageHero } from '@/components/layout/PageLayouts';

interface GovernmentLayoutProps {
  title: string;
  description?: string;
  children?: ReactNode;
}

export default function GovernmentLayout({ children }: GovernmentLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation('common');

  // Modified Branches Array: Merged Executive & Legislative
  const branches = [
    {
      title: t('government.electedofficialsTitle'),
      description: t('government.electedofficialsDescription'),
      icon: <UsersIcon className='h-4 w-4' />,
      path: '/government/elected-officials',
    },
    {
      title: t('government.departmentsTitle'),
      description: t('government.departmentsDescription'),
      icon: <Building2Icon className='h-4 w-4' />,
      path: '/government/departments',
    },
    {
      title: t('government.barangaysTitle'),
      description: t('government.barangaysDescription'),
      icon: <MapPinIcon className='h-4 w-4' />,
      path: '/government/barangays',
    },
  ];

  const isMainPage =
    currentPath === '/government' || currentPath === '/government/';

  return (
    <div className='container mx-auto px-4 md:px-0'>
      <PageHero
        title='Municipal Government of Los Baños Directory'
        description='Explore the different branches and agencies of the Municipal government'
      />
      {/* Tabs */}
      <div className='mb-8 md:mb-12 overflow-x-auto'>
        <div className='inline-grid grid-cols-1 md:grid-cols-3 gap-3 min-w-full md:min-w-0 px-4 py-2'>
          {branches.map(branch => {
            const isActive = currentPath.includes(branch.path);
            return (
              <Link
                key={branch.path}
                to={branch.path}
                className={cn(
                  'group flex flex-col p-3 md:p-4 rounded-md shadow-sm ring-1 ring-neutral-300',
                  'hover:bg-primary-500/95',
                  isActive && 'text-neutral-50  bg-primary-500'
                )}
                state={{ scrollToContent: true }}
              >
                <div className='flex items-center gap-1 mb-1 group-hover:text-neutral-200'>
                  <div className='mr-2 text-xs md:text-sm'>{branch.icon}</div>
                  {branch.title}
                </div>
                <div
                  className={cn(
                    'text-neutral-500 group-hover:text-neutral-200 text-xs md:text-sm',
                    isActive && 'text-neutral-200'
                  )}
                >
                  {branch.description}
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {!isMainPage && (
        <div className='px-4 md:px-0 pb-12'>{children || <Outlet />}</div>
      )}
    </div>
  );
}
