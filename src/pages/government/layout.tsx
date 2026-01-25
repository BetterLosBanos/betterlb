import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  Building2Icon,
  ChevronRight,
  HomeIcon,
  UsersIcon,
} from 'lucide-react';
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
      icon: HomeIcon,
      path: '/government/barangays',
      category: 'Local Units',
    },
  ];

  return (
    <div className='pb-20 mx-auto space-y-12 max-w-7xl duration-700 animate-in fade-in md:pb-32'>
      {/* 1. Unified Page Header */}
      <PageHero
        title='Government'
        description='Access information on elected leaders, municipal departments, and the 14 component barangays of Los Baños.'
      />

      {/* 2. Persistent Navigation (The Big 3) */}
      <div className='grid grid-cols-1 gap-4 mt-8 mb-12 md:grid-cols-3'>
        {branches.map(branch => {
          const isActive = currentPath.includes(branch.path);
          const Icon = branch.icon;

          return (
            <Link
              key={branch.path}
              to={branch.path}
              className={cn(
                'flex relative flex-col justify-between p-6 rounded-2xl border-2 transition-all duration-300 group min-h-[160px]',
                isActive
                  ? 'text-white shadow-xl bg-primary-600 border-primary-600 shadow-primary-900/20'
                  : 'bg-white shadow-sm hover:border-primary-400 border-slate-200 text-slate-900'
              )}
              state={{ scrollToContent: true }}
            >
              <div>
                <div className='flex justify-between items-center mb-4'>
                  <div
                    className={cn(
                      'rounded-xl p-2.5 shadow-sm transition-colors',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-50 text-primary-600 border-primary-100 border'
                    )}
                  >
                    <Icon className='w-5 h-5' />
                  </div>
                  <p
                    className={cn(
                      'text-[10px] font-bold tracking-[0.2em] uppercase',
                      isActive ? 'text-primary-100' : 'text-slate-400'
                    )}
                  >
                    {branch.category}
                  </p>
                </div>

                <h3
                  className={cn(
                    'text-xl font-extrabold tracking-tight leading-tight',
                    isActive ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {branch.title}
                </h3>
              </div>

              <div className='flex justify-between items-center mt-6'>
                <p
                  className={cn(
                    'pr-6 text-xs font-medium leading-relaxed line-clamp-2',
                    isActive ? 'text-primary-50' : 'text-slate-500'
                  )}
                >
                  {branch.description}
                </p>
                <ChevronRight
                  className={cn(
                    'w-5 h-5 transition-transform shrink-0 group-hover:translate-x-1',
                    isActive ? 'text-white' : 'text-slate-300'
                  )}
                />
              </div>
            </Link>
          );
        })}
      </div>

      {/* 3. The Content Area */}
      <div className='duration-500 animate-in fade-in slide-in-from-bottom-4'>
        <Outlet />
      </div>
    </div>
  );
}
