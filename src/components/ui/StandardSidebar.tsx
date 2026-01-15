import { ReactNode } from 'react';

interface StandardSidebarProps {
  children: ReactNode;
}

export default function StandardSidebar({ children }: StandardSidebarProps) {
  return (
    <div className='top-32 w-full shrink-0 md:sticky md:w-64'>
      <div className='space-y-4 md:sticky md:top-6'>
        <div className='overflow-hidden rounded-lg border border-r-2 border-r-gray-300 bg-white shadow-xs'>
          <div className='scrollbar-thin max-h-[60vh] overflow-y-auto px-2 py-4 md:max-h-[calc(100vh-200px)]'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
