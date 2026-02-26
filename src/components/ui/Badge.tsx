import { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

// Unified Variants aligned with Municipal Branding
type BadgeVariant =
  | 'primary' // Municipal Blue (Executive / Ordinances)
  | 'secondary' // Brand Orange (Resolutions / Contrast)
  | 'yellow' // Yellow (Executive Orders)
  | 'success' // Emerald (Active / Verified)
  | 'warning' // Amber (Pending / Notice)
  | 'error' // Rose (Closed / Cancelled)
  | 'slate' // Neutral (Admin / Metadata)
  | 'outline'; // Border only

interface BadgeProps extends Omit<
  HTMLAttributes<HTMLSpanElement>,
  'className'
> {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean; // Accessibility: Adds a visual shape indicator alongside color
}

export function Badge({
  children,
  variant = 'primary',
  className,
  dot = false,
  ...props
}: BadgeProps) {
  // High-contrast color mapping using Kapwa semantic tokens (WCAG 2.1 Level AA Compliant)
  const variants = {
    primary:
      'bg-kapwa-bg-brand-weak text-kapwa-text-brand border-kapwa-border-brand',
    secondary:
      'bg-kapwa-bg-accent-orange-weak text-kapwa-text-accent-orange border-kapwa-border-warning',
    yellow: 'bg-kapwa-yellow-50 text-kapwa-yellow-700 border-kapwa-yellow-600',
    success:
      'bg-kapwa-bg-success-weak text-kapwa-text-success border-kapwa-border-success',
    warning:
      'bg-kapwa-bg-warning-weak text-kapwa-text-warning border-kapwa-border-warning',
    error:
      'bg-kapwa-bg-danger-weak text-kapwa-text-danger border-kapwa-border-danger',
    slate:
      'bg-kapwa-bg-surface-raised text-kapwa-text-support border-kapwa-border-weak',
    outline: 'bg-transparent text-kapwa-text-support border-kapwa-border-weak',
  };

  const dotColors = {
    primary: 'bg-kapwa-bg-brand-default',
    secondary: 'bg-kapwa-bg-accent-orange-default',
    yellow: 'bg-kapwa-yellow-600',
    success: 'bg-kapwa-bg-success-default',
    warning: 'bg-kapwa-bg-warning-default',
    error: 'bg-kapwa-bg-danger-default',
    slate: 'bg-kapwa-bg-surface-raised',
    outline: 'bg-kapwa-bg-surface-raised',
  };

  return (
    <span
      {...props}
      className={cn(
        // text-[10px] with font-bold ensures legibility while remaining compact
        'inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[10px] font-bold tracking-widest uppercase transition-all',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'h-1.5 w-1.5 shrink-0 rounded-full',
            dotColors[variant]
          )}
          aria-hidden='true'
        />
      )}
      {children}
    </span>
  );
}
