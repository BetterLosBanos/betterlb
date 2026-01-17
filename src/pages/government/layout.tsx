import { Link, Outlet, useLocation } from 'react-router-dom';

import { Building2Icon, MapPinIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageHero } from '@/components/layout/PageLayouts';

import { cn } from '@/lib/utils';

export default function GovernmentRootLayout() {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation('common');

  const branches = [
    {
      title: t('government.electedofficialsTitle', 'Elected Officials'),
      description: t(
        'government.electedofficialsDescription',
        'Meet your Mayor, Vice Mayor, and Councilors.'
      ),
      icon: UsersIcon,
      path: '/government/elected-officials',
      category: 'Leadership',
    },
    {
      title: t('government.departmentsTitle', 'Departments'),
      description: t(
        'government.departmentsDescription',
        'Services and offices under the Executive branch.'
      ),
      icon: Building2Icon,
      path: '/government/departments',
      category: 'Administrative',
    },
    {
      title: t('government.barangaysTitle', 'Barangays'),
      description: t(
        'government.barangaysDescription',
        'The 14 local component units of Los Baños.'
      ),
      icon: MapPinIcon,
      path: '/government/barangays',
      category: 'Local Units',
    },
  ];

  return (
    <div className='container mx-auto max-w-7xl px-4 py-8 md:py-12'>
      {/* 1. Persistent Header */}
      <PageHero
        title='Government'
        description='Access information on elected leaders, municipal departments, and the 14 component barangays of Los Baños.'
      />

      {/* 2. Persistent Navigation (The Big 3) */}
      <div className='mt-8 mb-12 grid grid-cols-1 gap-4 md:grid-cols-3'>
        {branches.map(branch => {
          // Check if this branch is currently active
          const isActive = currentPath.includes(branch.path);
          const Icon = branch.icon;

          return (
            <Link
              key={branch.path}
              to={branch.path}
              className={cn(
                'group relative flex min-h-[140px] flex-col justify-between rounded-2xl border-2 p-5 transition-all duration-300',
                isActive
                  ? 'bg-primary-600 border-primary-600 shadow-primary-900/10 shadow-xl' // Active State
                  : 'hover:border-primary-300 border-slate-200 bg-white hover:shadow-md' // Inactive State
              )}
            >
              <div className='mb-3 flex items-start justify-between'>
                <div>
                  <h3
                    className={cn(
                      'mb-1 text-lg font-extrabold tracking-tight',
                      isActive ? 'text-white' : 'text-slate-900'
                    )}
                  >
                    {branch.title}
                  </h3>
                  <p
                    className={cn(
                      'text-[10px] font-bold tracking-widest uppercase',
                      isActive ? 'text-primary-100' : 'text-slate-400'
                    )}
                  >
                    {branch.category}
                  </p>
                </div>

                <div
                  className={cn(
                    'shrink-0 rounded-lg p-2',
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-50 text-slate-400'
                  )}
                >
                  <Icon className='h-5 w-5' />
                </div>
              </div>

              {/* RESTORED DESCRIPTION */}
              <p
                className={cn(
                  'line-clamp-2 text-xs leading-relaxed font-medium',
                  isActive ? 'text-primary-50' : 'text-slate-500'
                )}
              >
                {branch.description}
              </p>
            </Link>
          );
        })}
      </div>

      {/* 3. The Content Area */}
      <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
        <Outlet />
      </div>
    </div>
  );
}
