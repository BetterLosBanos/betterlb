import { ComponentType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * 1. PageHero: Used in Layout files (centered, large)
 * Matches the "Portal" header style of BetterGov.ph
 */

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export function PageHero({
  title,
  description,
  children,
  breadcrumb,
  metadata,
}: {
  title: string;
  description?: string;
  children?: ReactNode;
  breadcrumb?: BreadcrumbItem[];
  metadata?: ReactNode;
}) {
  return (
    <header className='animate-in fade-in flex flex-col justify-center py-8 text-center duration-700 md:py-12'>
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className='mb-4' aria-label='Breadcrumb'>
          <ol className='flex items-center justify-center gap-2 text-sm'>
            {breadcrumb.map((crumb, index) => (
              <li key={crumb.href} className='flex items-center gap-2'>
                {index > 0 && (
                  <span className='text-kapwa-text-weak' aria-hidden='true'>
                    /
                  </span>
                )}
                <a
                  href={crumb.href}
                  className={`${
                    index === breadcrumb.length - 1
                      ? 'text-kapwa-text-strong font-medium'
                      : 'text-kapwa-text-weak hover:text-kapwa-text-link'
                  }`}
                  aria-current={
                    index === breadcrumb.length - 1 ? 'page' : undefined
                  }
                >
                  {crumb.label}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}
      <h1 className='text-kapwa-text-strong mb-4 kapwa-heading-xl font-bold tracking-tight'>
        {title}
      </h1>
      {description && (
        <p className='text-kapwa-text-on-disabled mx-auto max-w-2xl text-sm leading-relaxed md:text-base'>
          {description}
        </p>
      )}
      {metadata && (
        <div className='mt-4 flex items-center justify-center gap-3'>
          {metadata}
        </div>
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
          <h2 className='text-kapwa-text-strong kapwa-heading-lg font-extrabold tracking-tight'>
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
  variant = 'default',
}: {
  title: ReactNode;
  icon?: IconComponent;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'highlighted' | 'compact';
}) {
  const variants = {
    default:
      'bg-kapwa-bg-surface border-kapwa-border-weak border shadow-sm rounded-2xl',
    highlighted:
      'bg-kapwa-bg-surface-brand/30 border-kapwa-border-brand border-2 shadow-md rounded-2xl',
    compact: 'bg-kapwa-bg-surface border-kapwa-border-weak border rounded-lg',
  };

  const headerVariants = {
    default: 'bg-kapwa-bg-surface-raised/50 border-kapwa-border-weak',
    highlighted: 'bg-kapwa-bg-surface-brand/50 border-kapwa-border-brand',
    compact: 'bg-kapwa-bg-surface-raised/30 border-kapwa-border-weak',
  };

  return (
    <section className={cn(variants[variant], 'overflow-hidden', className)}>
      <div
        className={cn(
          headerVariants[variant],
          'flex items-center gap-2 border-b px-6 py-4'
        )}
      >
        {Icon && <Icon className='text-kapwa-text-brand h-4 w-4' />}
        <div className='text-kapwa-text-disabled flex flex-1 items-center justify-between text-[10px] font-bold tracking-widest uppercase'>
          {title}
        </div>
      </div>
      <div className='p-6'>{children}</div>
    </section>
  );
}
