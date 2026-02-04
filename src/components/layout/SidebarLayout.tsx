import { ReactNode, useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ModuleHeader } from './PageLayouts';

interface SidebarLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  // Option A: Standard Config
  header?: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
  };
  // Option B: Custom Component (Overrides Option A)
  headerNode?: ReactNode;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export default function SidebarLayout({
  children,
  sidebar,
  header,
  headerNode, // New prop
  collapsible = false,
  defaultCollapsed = false,
  className = '',
}: SidebarLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const location = useLocation();

  useEffect(() => {
    setIsCollapsed(defaultCollapsed);
  }, [defaultCollapsed, location.pathname]);

  // Scroll reset
  useEffect(() => {
    if (location.state?.scrollToContent) {
      setTimeout(() => {
        const contentElement = document.getElementById('layout-content');
        if (contentElement) {
          const yScrollOffset = -140;
          const y = contentElement.offsetTop + yScrollOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location]);

  return (
    <div className={`min-h-screen md:bg-slate-50 ${className}`}>
      <div className='container mx-auto py-6 sm:px-4 md:py-8'>
        {/* HEADER LOGIC: Custom Node OR Default ModuleHeader */}
        {headerNode ? (
          <div className='mb-8'>{headerNode}</div>
        ) : header ? (
          <div className='mb-6 md:mb-8'>
            <ModuleHeader title={header.title} description={header.subtitle}>
              {header.actions}
            </ModuleHeader>
          </div>
        ) : null}

        {/* Mobile Sidebar Toggle */}
        <div className='mb-4 md:hidden'>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-700 shadow-sm active:bg-slate-50'
          >
            <span className='text-sm tracking-widest uppercase'>Menu</span>
            {mobileMenuOpen ? (
              <X className='h-5 w-5' />
            ) : (
              <Menu className='h-5 w-5' />
            )}
          </button>
        </div>

        <div className='relative flex flex-col md:flex-row'>
          {/* Desktop Expand Button */}
          <div
            className={cn(
              'absolute top-[6rem] left-0 z-10 hidden transition-all duration-500 ease-in-out md:block',
              collapsible && isCollapsed
                ? 'translate-x-0 opacity-100'
                : 'pointer-events-none -translate-x-4 opacity-0'
            )}
          >
            <button
              onClick={() => setIsCollapsed(false)}
              className='hover:text-primary-600 hover:border-primary-200 rounded-lg border border-slate-200 bg-white p-2 text-slate-400 shadow-sm transition-colors'
              title='Expand Menu'
            >
              <PanelLeftOpen className='h-5 w-5' />
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={cn(
              'shrink-0',
              mobileMenuOpen ? 'block' : 'hidden',
              'md:sticky md:top-[6rem] md:block md:self-start',
              'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
              'overflow-hidden',
              collapsible && isCollapsed
                ? 'md:mr-12 md:w-0 md:opacity-0'
                : 'md:mr-8 md:w-64 md:opacity-100 lg:w-72'
            )}
          >
            <div className='w-64 lg:w-72'>
              {collapsible && (
                <div className='mb-2 hidden justify-end md:flex'>
                  <button
                    onClick={() => setIsCollapsed(true)}
                    className='hover:text-primary-600 flex items-center gap-1 text-[10px] font-bold tracking-widest text-slate-400 uppercase transition-colors'
                  >
                    Hide Menu <PanelLeftClose className='h-3.5 w-3.5' />
                  </button>
                </div>
              )}
              {sidebar}
            </div>
          </aside>

          {/* Main Content */}
          <main className='min-w-0 flex-1 transition-all duration-500 ease-in-out'>
            <div
              id='layout-content'
              className='min-h-[50vh] rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8'
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
