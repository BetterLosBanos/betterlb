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
        className='flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 font-bold text-gray-900 shadow-sm'
      >
        <span className='flex items-center gap-2 text-sm tracking-wider uppercase'>
          <Menu className='text-primary-600 h-4 w-4' /> Page Navigation
        </span>
        {isOpen ? <X className='h-5 w-5' /> : <Menu className='h-5 w-5' />}
      </button>

      {isOpen && (
        <div className='animate-in fade-in fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm duration-200'>
          <div className='animate-in slide-in-from-right absolute top-0 right-0 h-full w-[280px] bg-white p-6 shadow-2xl duration-300'>
            <div className='mb-8 flex items-center justify-between'>
              <h2 className='text-xs font-bold tracking-widest text-gray-900 uppercase'>
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className='rounded-full bg-gray-100 p-2'
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
