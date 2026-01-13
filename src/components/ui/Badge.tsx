import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

// Unified Variants aligned with Municipal Branding
type BadgeVariant =
  | 'primary' // Municipal Blue (Executive / Ordinances)
  | 'secondary' // Brand Orange (Resolutions / Contrast)
  | 'success' // Emerald (Active / Verified)
  | 'warning' // Amber (Pending / Notice)
  | 'error' // Rose (Closed / Cancelled)
  | 'slate' // Neutral (Admin / Metadata)
  | 'outline'; // Border only

interface BadgeProps {
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
}: BadgeProps) {
  // High-contrast color mapping (WCAG 2.1 Level AA Compliant)
  const variants = {
    primary: 'bg-blue-50 text-blue-800 border-blue-200',
    secondary: 'bg-orange-50 text-orange-800 border-orange-200',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border-amber-200',
    error: 'bg-rose-50 text-rose-800 border-rose-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-600 border-slate-300',
  };

  const dotColors = {
    primary: 'bg-blue-600',
    secondary: 'bg-orange-600',
    success: 'bg-emerald-600',
    warning: 'bg-amber-600',
    error: 'bg-rose-600',
    slate: 'bg-slate-500',
    outline: 'bg-slate-400',
  };

  return (
    <span
      className={cn(
        // text-[10px] with font-bold ensures legibility while remaining compact
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md border text-[10px] font-bold uppercase tracking-widest transition-all',
        variants[variant],
        className
      )}
    >
      {dot && (
        <span
          className={cn(
            'w-1.5 h-1.5 rounded-full shrink-0',
            dotColors[variant]
          )}
          aria-hidden='true'
        />
      )}
      {children}
    </span>
  );
}
