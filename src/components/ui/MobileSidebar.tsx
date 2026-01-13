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
    <div className='md:hidden mb-4'>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className='flex items-center justify-between w-full px-4 py-3 bg-white rounded-xl border border-gray-200 shadow-sm text-gray-900 font-bold'
      >
        <span className='flex items-center gap-2 text-sm uppercase tracking-wider'>
          <Menu className='w-4 h-4 text-primary-600' /> Page Navigation
        </span>
        {isOpen ? <X className='w-5 h-5' /> : <Menu className='w-5 h-5' />}
      </button>

      {isOpen && (
        <div className='fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200'>
          <div className='absolute right-0 top-0 h-full w-[280px] bg-white p-6 shadow-2xl animate-in slide-in-from-right duration-300'>
            <div className='flex justify-between items-center mb-8'>
              <h2 className='font-bold text-gray-900 uppercase tracking-widest text-xs'>
                Menu
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className='p-2 bg-gray-100 rounded-full'
              >
                <X className='w-4 h-4' />
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
