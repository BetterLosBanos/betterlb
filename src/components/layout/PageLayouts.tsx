import { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * 1. PageHero: Used in Layout files (centered, large)
 * Matches the "Portal" header style of BetterGov.ph
 */
export function PageHero({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <header className='animate-in fade-in flex flex-col justify-center py-8 text-center duration-700 md:py-12'>
      <h1 className='mb-4 text-3xl font-bold tracking-tight text-slate-900 md:text-4xl'>
        {title}
      </h1>
      {description && (
        <p className='mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 md:text-base'>
          {description}
        </p>
      )}
      {children && <div className='mt-8'>{children}</div>}
    </header>
  );
}

/**
 * 2. ModuleHeader: Used in Index/List pages (left-aligned, compact)
 * Standardizes the title and search bar layout.
 */
export function ModuleHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
}) {
  return (
    <div className='mb-8 border-b border-slate-100 pb-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
        <div className='max-w-2xl'>
          <h2 className='text-2xl font-extrabold tracking-tight text-slate-900'>
            {title}
          </h2>
          {description && (
            <p className='mt-1 text-sm text-slate-500 md:text-base'>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className='w-full shrink-0 md:w-auto'>{children}</div>
        )}
      </div>
    </div>
  );
}

/**
 * 3. DetailSection: Standard container for content blocks
 * Uses the BetterGov style: slate-50 header with uppercase label.
 */

type IconComponent = ComponentType<{ className?: string }>;

export function DetailSection({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string;
  icon?: IconComponent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm',
        className
      )}
    >
      <div className='flex items-center gap-2 border-b border-slate-100 bg-slate-50/50 px-6 py-4'>
        {Icon && <Icon className='text-primary-600 h-4 w-4' />}
        <h3 className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
          {title}
        </h3>
      </div>
      <div className='p-6'>{children}</div>
    </section>
  );
}
