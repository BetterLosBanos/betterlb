import { ReactNode, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, X, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { ModuleHeader } from './PageLayouts';
import { cn } from '@/lib/utils';

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
      <div className='container py-6 mx-auto sm:px-4 md:py-8'>
        
        {/* HEADER LOGIC: Custom Node OR Default ModuleHeader */}
        {headerNode ? (
            <div className="mb-8">
                {headerNode}
            </div>
        ) : header ? (
            <div className="mb-6 md:mb-8">
                <ModuleHeader 
                    title={header.title} 
                    description={header.subtitle}
                >
                    {header.actions}
                </ModuleHeader>
            </div>
        ) : null}

        {/* Mobile Sidebar Toggle */}
        <div className='mb-4 md:hidden'>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className='flex justify-between items-center px-4 py-3 w-full font-bold bg-white rounded-xl border shadow-sm border-slate-200 text-slate-700 active:bg-slate-50'
          >
            <span className="text-sm tracking-widest uppercase">Menu</span>
            {mobileMenuOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
          </button>
        </div>

        <div className='flex relative flex-col md:flex-row'>
          
          {/* Desktop Expand Button */}
          <div 
            className={cn(
                "hidden md:block absolute left-0 top-[6rem] z-10 transition-all duration-500 ease-in-out",
                collapsible && isCollapsed ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-4 pointer-events-none"
            )}
          >
             <button
                onClick={() => setIsCollapsed(false)}
                className='p-2 bg-white rounded-lg border shadow-sm transition-colors hover:text-primary-600 hover:border-primary-200 border-slate-200 text-slate-400'
                title="Expand Menu"
            >
                <PanelLeftOpen className="w-5 h-5" />
            </button>
          </div>

          {/* Sidebar */}
          <aside
            className={cn(
                'shrink-0',
                mobileMenuOpen ? 'block' : 'hidden',
                'md:block md:self-start md:sticky md:top-[6rem]',
                'transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]',
                'overflow-hidden', 
                (collapsible && isCollapsed) 
                    ? 'md:w-0 md:opacity-0 md:mr-12' 
                    : 'md:w-64 lg:w-72 md:opacity-100 md:mr-8'
            )}
          >
            <div className="w-64 lg:w-72">
                {collapsible && (
                    <div className="hidden justify-end mb-2 md:flex">
                        <button 
                            onClick={() => setIsCollapsed(true)}
                            className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary-600 transition-colors"
                        >
                            Hide Menu <PanelLeftClose className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
                {sidebar}
            </div>
          </aside>

          {/* Main Content */}
          <main className='flex-1 min-w-0 transition-all duration-500 ease-in-out'>
            <div
              id='layout-content'
              className='rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-8 min-h-[50vh]'
            >
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}