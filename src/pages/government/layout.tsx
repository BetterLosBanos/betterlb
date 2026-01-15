import { Link, Outlet, useLocation } from 'react-router-dom';

import {
  Building2Icon,
  ChevronRight,
  MapPinIcon,
  UsersIcon,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

// UI Components
import { PageHero } from '@/components/layout/PageLayouts';

import { cn } from '@/lib/utils';

// Removed 'children' from props to satisfy ESLint
interface GovernmentLayoutProps {
  title: string;
  description?: string;
}

export default function GovernmentLayout({ title }: GovernmentLayoutProps) {
  const location = useLocation();
  const currentPath = location.pathname;
  const { t } = useTranslation('common');

  const branches = [
    {
      title: t('government.electedofficialsTitle'),
      description: t('government.electedofficialsDescription'),
      icon: UsersIcon,
      path: '/government/elected-officials',
      category: 'Leadership',
    },
    {
      title: t('government.departmentsTitle'),
      description: t('government.departmentsDescription'),
      icon: Building2Icon,
      path: '/government/departments',
      category: 'Administrative',
    },
    {
      title: t('government.barangaysTitle'),
      description: t('government.barangaysDescription'),
      icon: MapPinIcon,
      path: '/government/barangays',
      category: 'Local Units',
    },
  ];

  const isMainPage =
    currentPath === '/government' || currentPath === '/government/';

  return (
    <div className='pb-20 mx-auto space-y-12 max-w-7xl duration-700 animate-in fade-in md:pb-32'>
      {/* 1. Unified Page Header */}
      <PageHero
        title={title} // Uses the title passed from the route
        description='Access information on elected leaders, municipal departments, and the 14 component barangays of Los Baños.'
      />

      {/* 2. Branch Navigation Grid */}
      <div className='px-4 md:px-0'>
        <div
          className='grid grid-cols-1 gap-4 md:grid-cols-3'
          role='navigation'
          aria-label='Government sections'
        >
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
      </div>

      {/* 3. Sub-route rendering (The Content) */}
      {!isMainPage && (
        <div className='px-4 duration-500 animate-in slide-in-from-bottom-2 md:px-0'>
          {/* Outlet handles the rendering of child components automatically */}
          <Outlet />
        </div>
      )}
    </div>
  );
}
