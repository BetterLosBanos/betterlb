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
    <header className='py-8 md:py-12 text-center flex flex-col justify-center animate-in fade-in duration-700'>
      <h1 className='text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-4'>
        {title}
      </h1>
      {description && (
        <p className='text-sm md:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed'>
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
      <div className='flex flex-col md:flex-row md:items-end justify-between gap-4'>
        <div className='max-w-2xl'>
          <h2 className='text-2xl font-extrabold text-slate-900 tracking-tight'>
            {title}
          </h2>
          {description && (
            <p className='mt-1 text-slate-500 text-sm md:text-base'>
              {description}
            </p>
          )}
        </div>
        {children && (
          <div className='shrink-0 w-full md:w-auto'>{children}</div>
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
        'bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden',
        className
      )}
    >
      <div className='px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-2'>
        {Icon && <Icon className='w-4 h-4 text-primary-600' />}
        <h3 className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
          {title}
        </h3>
      </div>
      <div className='p-6'>{children}</div>
    </section>
  );
}
