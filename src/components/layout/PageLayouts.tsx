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
      <h1 className='text-kapwa-text-strong mb-4 kapwa-heading font-bold tracking-tight'>
        {title}
      </h1>
      {description && (
        <p className='text-kapwa-text-on-disabled mx-auto max-w-2xl text-sm leading-relaxed md:text-base'>
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
    <div className='border-kapwa-border-weak mb-8 border-b pb-6'>
      <div className='flex flex-col justify-between gap-4 md:flex-row md:items-end'>
        <div className='max-w-2xl'>
          <h2 className='text-kapwa-text-strong kapwa-heading font-extrabold tracking-tight'>
            {title}
          </h2>
          {description && (
            <p className='text-kapwa-text-disabled mt-1 text-sm md:text-base'>
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
  title: ReactNode;
  icon?: IconComponent;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        'border-kapwa-border-weak bg-kapwa-bg-surface overflow-hidden rounded-2xl border shadow-sm',
        className
      )}
    >
      <div className='border-kapwa-border-weak bg-kapwa-bg-surface-raised/50 flex items-center gap-2 border-b px-6 py-4'>
        {Icon && <Icon className='text-kapwa-text-brand h-4 w-4' />}
        <div className='text-kapwa-text-disabled flex flex-1 items-center justify-between text-[10px] font-bold tracking-widest uppercase'>
          {title}
        </div>
      </div>
      <div className='p-6'>{children}</div>
    </section>
  );
}
