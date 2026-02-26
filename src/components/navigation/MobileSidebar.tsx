// src/components/ui/MobileSidebar.tsx
import { useState } from 'react';

import { Menu, X } from 'lucide-react';

export function MobileSidebarTrigger({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className='mb-4 md:hidden'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-strong flex w-full items-center justify-between rounded-xl border px-4 py-3 font-bold shadow-sm'
      >
        <span className='flex items-center gap-2 text-sm tracking-wider uppercase'>
          <Menu className='text-kapwa-text-brand h-4 w-4' /> Page Navigation
        </span>
        {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {isOpen && (
        <div className='animate-in fade-in bg-kapwa-bg-surface-bold/60 fixed inset-0 z-50 backdrop-blur-sm duration-200'>
          <div className='animate-in slide-in-from-right bg-kapwa-bg-surface absolute top-0 right-0 h-full w-[280px] p-6 shadow-2xl duration-300'>
            <div className='mb-8 flex items-center justify-between'>
              <h2 className='text-kapwa-text-strong text-xs font-bold tracking-widest uppercase'>
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className='bg-kapwa-bg-hover rounded-full p-2'
              >
                <X className='h-4 w-4' />
              </button>
            </div>
            {/* When a user clicks a link in the sidebar, we want it to close */}
            <div onClick={() => setIsOpen(false)}>{children}</div>
          </div>
        </div>
      )}
    </div>
  );
}
