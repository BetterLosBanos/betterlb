import { ReactNode, useEffect, useState } from 'react';

import { useLocation } from 'react-router-dom';

import { Menu, PanelLeftClose, PanelLeftOpen, X } from 'lucide-react';

import { cn } from '@/lib/utils';

import { ModuleHeader } from './PageLayouts';

interface SidebarLayoutProps {
  children: ReactNode;
  sidebar: ReactNode;
  header?: {
    title: string;
    subtitle?: string;
    actions?: ReactNode;
  };
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  className?: string;
}

export default function SidebarLayout({
  children,
  sidebar,
  header,
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

  // Scroll reset logic
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
        {header && (
          <div className='mb-6 md:mb-8'>
            <ModuleHeader title={header.title} description={header.subtitle}>
              {header.actions}
            </ModuleHeader>
          </div>
        )}

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

        {/* FLEX CONTAINER: Removed 'gap-8' to allow smooth margin animation */}
        <div className='relative flex flex-col md:flex-row'>
          <div
            className={cn(
              'absolute top-24 left-0 z-10 hidden transition-all duration-500 ease-in-out md:block',
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

          {/* --- SIDEBAR --- */}
          <aside
            className={cn(
              // Base
              'shrink-0',
              // Mobile: standard toggle
              mobileMenuOpen ? 'block' : 'hidden',
              // Desktop: Sticky positioning
              'md:sticky md:top-24 md:block md:self-start',
              // ANIMATION MAGIC:
              'transition-all duration-500 ease-in-out', // Smooth bezier curve
              'overflow-hidden', // Hides content as width shrinks

              // State Styles:
              // Collapsed: Width 0, Margin 0 (plus extra margin for the Expand Button space)
              // Expanded: Width 64/72, Margin Right 8 (32px)
              collapsible && isCollapsed
                ? 'md:mr-12 md:w-0 md:opacity-0' // mr-12 gives space for the absolute expand button
                : 'md:mr-8 md:w-64 md:opacity-100 lg:w-72'
            )}
          >
            {/* INNER WRAPPER: Fixed width prevents content from squashing during transition */}
            <div className='w-64 lg:w-72'>
              {/* Collapse Header */}
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

          {/* --- MAIN CONTENT --- */}
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
