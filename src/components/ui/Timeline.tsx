import { ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface TimelineItemProps {
  year: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Timeline({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('relative space-y-8 pl-8 md:pl-0', className)}>
      {/* Vertical Line */}
      <div
        className='from-primary-600 via-primary-200 absolute top-2 bottom-2 left-[11px] w-0.5 -translate-x-1/2 bg-linear-to-b to-transparent md:left-1/2'
        aria-hidden='true'
      />
      {children}
    </div>
  );
}

export function TimelineItem({ year, title, children }: TimelineItemProps) {
  return (
    <div className='group relative flex flex-col md:flex-row md:items-center'>
      {/* 1. Date/Year Bubble (Desktop: Alternates, Mobile: Left) */}
      <div className='mb-2 md:mb-0 md:w-1/2 md:pr-12 md:text-right md:group-even:order-last md:group-even:pr-0 md:group-even:pl-12 md:group-even:text-left'>
        <span className='bg-primary-600 inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-bold text-white shadow-md ring-4 ring-white'>
          {year}
        </span>
      </div>

      {/* 2. The Dot (Absolute Center) */}
      <div className='border-primary-600 absolute top-0 left-[11px] flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 bg-white shadow-sm transition-transform duration-300 group-hover:scale-125 md:top-1/2 md:left-1/2 md:-translate-y-1/2'>
        <div className='bg-primary-600 h-1.5 w-1.5 rounded-full' />
      </div>

      {/* 3. The Content Card */}
      <div className='md:w-1/2 md:pl-12 md:group-even:pr-12 md:group-even:pl-0'>
        <div className='hover:border-primary-200 relative rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:shadow-md'>
          {/* Mobile Arrow (Left) */}
          <div className='absolute top-4 -left-1.5 h-3 w-3 rotate-45 border-b border-l border-slate-200 bg-white md:hidden' />

          {/* Desktop Arrows */}
          <div className='absolute top-1/2 -left-1.5 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-slate-200 bg-white group-even:-right-1.5 group-even:left-auto group-even:rotate-225 md:block' />

          {title && (
            <h3 className='mb-2 text-lg font-bold text-slate-900'>{title}</h3>
          )}
          <div className='text-sm leading-relaxed text-slate-600'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
