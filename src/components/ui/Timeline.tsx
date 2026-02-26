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
        className='from-kapwa-bg-brand-default via-kapwa-bg-brand-weak absolute top-2 bottom-2 left-[11px] w-0.5 -translate-x-1/2 bg-linear-to-b to-transparent md:left-1/2'
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
        <span className='bg-kapwa-bg-brand-default text-kapwa-text-inverse inline-flex items-center justify-center rounded-full px-3 py-1 kapwa-body-xs-strong shadow-md ring-4 ring-kapwa-bg-surface'>
          {year}
        </span>
      </div>

      {/* 2. The Dot (Absolute Center) */}
      <div className='border-kapwa-border-brand bg-kapwa-bg-surface absolute top-0 left-[11px] flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 shadow-sm transition-transform duration-300 group-hover:scale-125 md:top-1/2 md:left-1/2 md:-translate-y-1/2'>
        <div className='bg-kapwa-bg-brand-default h-1.5 w-1.5 rounded-full' />
      </div>

      {/* 3. The Content Card */}
      <div className='md:w-1/2 md:pl-12 md:group-even:pr-12 md:group-even:pl-0'>
        <div className='hover:border-kapwa-border-brand border-kapwa-border-weak bg-kapwa-bg-surface relative rounded-2xl border p-5 shadow-sm transition-all hover:shadow-md'>
          {/* Mobile Arrow (Left) */}
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface absolute top-4 -left-1.5 h-3 w-3 rotate-45 border-b border-l md:hidden' />

          {/* Desktop Arrows */}
          <div className='border-kapwa-border-weak bg-kapwa-bg-surface absolute top-1/2 -left-1.5 hidden h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l group-even:-right-1.5 group-even:left-auto group-even:rotate-225 md:block' />

          {title && (
            <h3 className='text-kapwa-text-strong mb-2 kapwa-heading-md'>
              {title}
            </h3>
          )}
          <div className='text-kapwa-text-support kapwa-body-sm-default leading-relaxed'>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
