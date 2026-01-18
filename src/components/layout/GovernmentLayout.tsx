// src/components/layout/GovernmentLayout.tsx
import { ReactNode, useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { MenuIcon, XIcon } from 'lucide-react';

import { ModuleHeader } from './PageLayouts';

// Import the primitive

interface GovernmentLayoutProps {
  children: ReactNode;
  sidebar?: ReactNode;
  /**
   * Optional: Pass header props if you want the layout to handle the header.
   * Or leave undefined and let the child page render its own <ModuleHeader />.
   */
  headerProps?: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
  };
  className?: string;
}

export default function GovernmentLayout({
  children,
  sidebar,
  headerProps,
  className = '',
}: GovernmentLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    // Preserving your specific scroll timing logic
    if (location.state?.scrollToContent) {
      const getTimeoutByRoute = (pathname: string) => {
        if (pathname.includes('/legislative')) return 190;
        if (pathname.includes('/executive')) return 150;
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
    <div className={`min-h-screen md:bg-slate-50 ${className}`}>
      <div className='container mx-auto py-6 sm:px-4 md:py-8'>
        {/* Render the Header if props are provided */}
        {headerProps && (
          <div className='mb-6 md:mb-8'>
            <ModuleHeader
              title={headerProps.title}
              description={headerProps.subtitle}
            >
              {headerProps.actions}
            </ModuleHeader>
          </div>
        )}

        {/* Mobile Sidebar Toggle */}
        {sidebar && (
          <div className='mb-4 md:hidden'>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className='flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3 font-medium text-slate-900 shadow-sm'
            >
              <span>Menu</span>
              {sidebarOpen ? (
                <XIcon className='h-5 w-5 text-slate-600' />
              ) : (
                <MenuIcon className='h-5 w-5 text-slate-600' />
              )}
            </button>
          </div>
        )}

        <div className='flex flex-col md:flex-row md:gap-8'>
          {sidebar && (
            <aside
              className={`${
                sidebarOpen ? 'block' : 'hidden'
              } mb-6 shrink-0 md:sticky md:top-33 md:mb-0 md:block md:self-start`}
            >
              {sidebar}
            </aside>
          )}
          <main className='min-w-0 flex-1'>
            <div
              id='government-content'
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8'
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
