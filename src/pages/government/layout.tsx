import { Link, Outlet, useLocation } from 'react-router-dom';

import { Building2Icon, ChevronRight, HomeIcon, UsersIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { PageHeader, SectionBlock } from '@/components/layout';

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
    <div className='animate-in fade-in duration-700'>
      {/* Unified Page Header */}
      <PageHeader
        variant='centered'
        title='Government'
        description='Access information on elected leaders, municipal departments, and the 14 component barangays of Los Baños.'
      />

      <SectionBlock className='pb-kapwa-xs md:pb-kapwa-sm'>
        <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
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
                    ? 'bg-kapwa-bg-brand-default border-kapwa-border-brand shadow-lg text-kapwa-text-inverse'
                    : 'hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong shadow-sm hover:shadow-md'
                )}
                state={{ scrollToContent: true }}
              >
                <div>
                  <div className='mb-4 flex items-center justify-between'>
                    <div
                      className={cn(
                        'rounded-xl p-2.5 shadow-sm transition-colors',
                        isActive
                          ? 'bg-kapwa-bg-surface/20 text-kapwa-text-inverse'
                          : 'bg-kapwa-bg-surface-brand-weak text-kapwa-text-brand border-kapwa-border-brand'
                      )}
                    >
                      <Icon className='h-5 w-5' />
                    </div>
                    <p
                      className={cn(
                        'text-[10px] font-bold tracking-[0.2em] uppercase',
                        isActive
                          ? 'text-kapwa-text-inverse'
                          : 'text-kapwa-text-disabled'
                      )}
                    >
                      {branch.category}
                    </p>
                  </div>

                  <h3
                    className={cn(
                      'text-xl leading-tight font-extrabold tracking-tight',
                      isActive
                        ? 'text-kapwa-text-inverse'
                        : 'text-kapwa-text-strong'
                    )}
                  >
                    {branch.title}
                  </h3>
                </div>

                <div className='mt-6 flex items-center justify-between'>
                  <p
                    className={cn(
                      'line-clamp-2 pr-6 text-xs leading-relaxed font-medium',
                      isActive
                        ? 'text-kapwa-text-inverse'
                        : 'text-kapwa-text-support'
                    )}
                  >
                    {branch.description}
                  </p>
                  <ChevronRight
                    className={cn(
                      'h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1',
                      isActive
                        ? 'text-kapwa-text-inverse'
                        : 'text-kapwa-text-support'
                    )}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </SectionBlock>

      {/* Content Area */}
      <SectionBlock>
        <div className='animate-in fade-in slide-in-from-bottom-4 duration-500'>
          <Outlet />
        </div>
      </SectionBlock>
    </div>
  );
}
