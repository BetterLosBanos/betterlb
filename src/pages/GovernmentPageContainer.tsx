import { ReactNode, useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { MenuIcon, XIcon } from 'lucide-react';

interface GovernmentPageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}

export function GovernmentPageHeader({
  title,
  subtitle,
  actions,
  className = '',
}: GovernmentPageHeaderProps) {
  return (
    <div
      className={`mb-6 flex flex-col gap-4 md:mb-8 md:flex-row md:items-center md:justify-between ${className}`}
    >
      <div>
        <h1 className='mb-2 text-2xl font-bold text-gray-900 md:text-3xl'>
          {title}
        </h1>
        {subtitle && (
          <p className='text-sm text-gray-800 md:text-base'>{subtitle}</p>
        )}
      </div>
      {actions && <div className='shrink-0'>{actions}</div>}
    </div>
  );
}

interface GovernmentIndexPageContainerProps {
  children: ReactNode;
  sidebar?: ReactNode;
  className?: string;
}

export default function GovernmentIndexPageContainer({
  children,
  sidebar,
  className = '',
}: GovernmentIndexPageContainerProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToContent) {
      //contents different loading times
      const getTimeoutByRoute = (pathname: string) => {
        if (pathname.includes('/legislative')) return 190;
        if (pathname.includes('/executive')) return 150;
        // if (pathname.includes('/constitutional')) return 120;
        // if (pathname.includes('/diplomatic')) return 190;
        return 100;
      };

      const timeout = getTimeoutByRoute(location.pathname);

      setTimeout(() => {
        const contentElement = document.getElementById('government-content');
        if (contentElement) {
          const yScrollOffset = -140;
          const y = contentElement.offsetTop + yScrollOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, timeout);
    }
  }, [location]);

  return (
    <div className={`min-h-screen md:bg-gray-50 ${className}`}>
      <div className='container mx-auto py-6 sm:px-4 md:py-8'>
        {/* Mobile Sidebar Toggle */}
        {sidebar && (
          <div className='mb-4 md:hidden'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='flex w-full items-center justify-between rounded-lg border bg-white px-4 py-3 font-medium text-gray-900 shadow-xs'
            >
              <span>Menu</span>
              {sidebarOpen ? (
                <XIcon className='h-5 w-5 text-gray-800' />
              ) : (
                <MenuIcon className='h-5 w-5 text-gray-800' />
              )}
            </button>
          </div>
        )}
        <div className='flex flex-col md:flex-row md:gap-8'>
          {sidebar && (
            <aside
              className={`${
                sidebarOpen ? 'block' : 'hidden'
              } mb-6 shrink-0 md:sticky md:top-[8.25rem] md:mb-0 md:block md:self-start`}
            >
              {sidebar}
            </aside>
          )}
          <main className='min-w-0 flex-1'>
            <div
              id='government-content'
              className='rounded-lg border bg-white p-4 shadow-xs md:p-8'
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
