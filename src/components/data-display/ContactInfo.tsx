import { ReactNode } from 'react';

import { ExternalLink, LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

// --- Types ---

interface ContactItemProps {
  icon: LucideIcon;
  label: string;
  value?: string | string[] | null;
  href?: string;
  isExternal?: boolean;
  className?: string;
}

// --- Components ---

/**
 * Unified Contact Item
 * Standardizes how we display Address, Phone, Email, and Social links.
 * Complies with WCAG AA (44px touch targets).
 */
export function ContactItem({
  icon: Icon,
  label,
  value,
  href,
  isExternal,
  className,
}: ContactItemProps) {
  // Logic: Handle null, undefined, or empty arrays from JSON data
  if (!value || (Array.isArray(value) && value.length === 0)) return null;

  // Auto-detect external links if not explicitly provided
  const external = isExternal ?? (href?.startsWith('http') || false);

  const content = (
    <div
      className={cn(
        'bg-kapwa-bg-surface flex items-start gap-3 rounded-xl border border-kapwa-border-weak p-3 transition-all',
        'group hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-brand/30',
        className
      )}
    >
      {/* Icon Wrapper */}
      <div
        className='group-hover:bg-kapwa-bg-surface-brand group-hover:text-kapwa-text-brand bg-kapwa-bg-surface-raised text-kapwa-text-disabled shrink-0 rounded-lg p-2 transition-colors'
        aria-hidden='true'
      >
        <Icon className='h-4 w-4' />
      </div>

      {/* Text Area */}
      <div className='min-w-0 flex-1'>
        <p className='text-kapwa-text-disabled mb-1 text-[10px] leading-none font-bold tracking-widest uppercase'>
          {label}
        </p>
        <div className='text-kapwa-text-support group-hover:text-kapwa-text-strong truncate text-sm font-bold transition-colors'>
          {Array.isArray(value) ? value[0] : value}
        </div>
      </div>

      {/* External Visual Indicator */}
      {external && href && (
        <ExternalLink
          className='group-hover:text-kapwa-text-brand-600 text-kapwa-text-support ml-auto h-3 w-3 transition-colors'
          aria-hidden='true'
        />
      )}
    </div>
  );

  // If href is present, wrap in a Link or Anchor for accessibility
  if (href) {
    return (
      <a
        href={href}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer' : undefined}
        className='focus:ring-kapwa-border-brand block min-h-[44px] rounded-xl focus:ring-2 focus:outline-none'
        aria-label={`${label}: ${Array.isArray(value) ? value[0] : value}`}
      >
        {content}
      </a>
    );
  }

  return content;
}

/**
 * Unified Layout Container for Contact Items
 */
export function ContactContainer({
  children,
  variant = 'stack',
  className,
}: {
  children: ReactNode;
  variant?: 'stack' | 'grid';
  className?: string;
}) {
  const layouts = {
    stack: 'flex flex-col gap-3',
    grid: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
  };

  return <div className={cn(layouts[variant], className)}>{children}</div>;
}
