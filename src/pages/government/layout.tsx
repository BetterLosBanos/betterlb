import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  Building2Icon,
  ChevronRight,
  MapPinIcon,
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
      icon: MapPinIcon,
      path: '/government/barangays',
      category: 'Local Units',
    },
  ];

  return (
    <div className='animate-in fade-in mx-auto max-w-7xl space-y-12 pb-20 duration-700 md:pb-32'>
      {/* 1. Unified Page Header */}
      <PageHero
        title='Government'
        description='Access information on elected leaders, municipal departments, and the 14 component barangays of Los Baños.'
      />

      {/* 2. Persistent Navigation (The Big 3) */}
      <div className='mt-8 mb-12 grid grid-cols-1 gap-4 md:grid-cols-3'>
        {branches.map(branch => {
          const isActive = currentPath.includes(branch.path);
          const Icon = branch.icon;

          return (
            <Link
              key={branch.path}
              to={branch.path}
              className={cn(
                'group relative flex min-h-[160px] flex-col justify-between rounded-2xl border-2 p-6 transition-all duration-300',
                isActive
                  ? 'bg-primary-600 border-primary-600 shadow-primary-900/20 text-white shadow-xl'
                  : 'hover:border-primary-400 border-slate-200 bg-white text-slate-900 shadow-sm'
              )}
              state={{ scrollToContent: true }}
            >
              <div>
                <div className='mb-4 flex items-center justify-between'>
                  <div
                    className={cn(
                      'rounded-xl p-2.5 shadow-sm transition-colors',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'bg-primary-50 text-primary-600 border-primary-100 border'
                    )}
                  >
                    <Icon className='h-5 w-5' />
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
                    'text-xl leading-tight font-extrabold tracking-tight',
                    isActive ? 'text-white' : 'text-slate-900'
                  )}
                >
                  {branch.title}
                </h3>
              </div>

              <div className='mt-6 flex items-center justify-between'>
                <p
                  className={cn(
                    'line-clamp-2 pr-6 text-xs leading-relaxed font-medium',
                    isActive ? 'text-primary-50' : 'text-slate-500'
                  )}
                >
                  {branch.description}
                </p>
                <ChevronRight
                  className={cn(
                    'h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1',
                    isActive ? 'text-white' : 'text-slate-300'
                  )}
                />
              </div>
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
