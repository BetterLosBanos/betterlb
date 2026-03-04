import { HTMLAttributes, ReactNode } from 'react';

import { ArrowDownRight, ArrowUpRight, LucideIcon } from 'lucide-react';

import { Card, CardContent } from './Card';

import { cn } from '@/lib/utils';

/**
 * Props for the StatCard component.
 *
 * Extends Card for displaying statistical data with trend indicators.
 */
export interface StatCardProps extends HTMLAttributes<HTMLElement> {
  /** Label for the statistic (e.g., "Total Population") */
  label: string;
  /** Value to display (string or number) */
  value: string | number;
  /** Supporting text below the value */
  subtext?: string;
  /** Trend indicator with percentage change */
  trend?: {
    value: number; // percentage
    positive: boolean;
  };
  /** Variant prop reserved for future use (not currently applied to styling) */
  variant?: 'primary' | 'secondary' | 'slate';
  /** Optional icon to display */
  icon?: LucideIcon;
  /** Optional icon background styling */
  iconBg?: string;
  /** Optional custom content (e.g., badges) */
  children?: ReactNode;
  /** Enable hover effect */
  hover?: boolean;
}

/**
 * StatCard - Data Display Card
 *
 * A specialized card component for displaying statistical KPIs with trend indicators.
 * Extends the standard Card component with data visualization features.
 *
 * @remarks
 * - Uses brand color hover effect on border
 * - variant prop reserved for future extensibility
 */
export function StatCard(props: StatCardProps) {
  const {
    label,
    value,
    subtext,
    trend,
    icon: Icon,
    iconBg,
    children,
    hover = true,
    className,
    // variant is reserved for future use, extracted to avoid unused warning
  } = props;
  const trendColor = trend?.positive
    ? 'text-kapwa-text-success'
    : 'text-kapwa-text-danger';
  const TrendIcon = trend?.positive ? ArrowUpRight : ArrowDownRight;

  return (
    <Card
      variant='default'
      hover={hover}
      className={cn('overflow-hidden', className)}
    >
      <CardContent
        className={cn(
          'flex h-full flex-col items-start justify-between gap-2 sm:flex-row sm:items-center'
        )}
      >
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='text-kapwa-text-disabled truncate text-[10px] font-bold tracking-widest uppercase'>
            {label}
          </p>
          <div className='text-kapwa-text-strong flex items-center gap-2 text-3xl font-black'>
            <span className='truncate'>
              {typeof value === 'number' ? value.toLocaleString() : value}
            </span>
            <span
              className={cn(
                'inline-flex items-center text-lg font-semibold',
                trend ? trendColor : 'invisible'
              )}
            >
              <span role='presentation'>
                <TrendIcon className='h-4 w-4' />
              </span>
              <span className='ml-0.5'>
                {trend ? Math.abs(trend.value) : 0}%
              </span>
            </span>
          </div>
          {subtext && (
            <span className='text-kapwa-text-disabled truncate text-xs font-medium'>
              {subtext}
            </span>
          )}
        </div>
        {(Icon || children) && (
          <div
            className={cn(
              'flex shrink-0 items-center justify-center rounded-xl p-2',
              iconBg || 'bg-kapwa-bg-surface-raised text-kapwa-text-strong',
              children ? 'h-auto' : 'h-10 w-10'
            )}
          >
            <span role='presentation'>
              {Icon ? <Icon className='h-6 w-6' /> : children}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Props for the StatGrid component.
 */
export interface StatGridProps {
  /** Array of stat card props */
  stats: Omit<StatCardProps, 'className'>[];
  /** Number of columns in the grid */
  columns?: 2 | 3 | 4;
}

/**
 * StatGrid - Responsive Grid for StatCards
 *
 * Creates a responsive grid layout for multiple StatCard components.
 *
 * @example
 * ```tsx
 * <StatGrid
 *   columns={3}
 *   stats={[
 *     { label: 'Population', value: 123456, variant: 'primary' },
 *     { label: 'Growth', value: '2.5%', variant: 'secondary' },
 *     { label: 'Barangays', value: 18, variant: 'slate' },
 *   ]}
 * />
 * ```
 */
export function StatGrid({ stats, columns = 4 }: StatGridProps) {
  const gridCols = {
    2: 'lg:grid-cols-2',
    3: 'lg:grid-cols-3',
    4: 'lg:grid-cols-4',
  };

  return (
    <div
      className={cn('grid grid-cols-1 gap-4 sm:grid-cols-2', gridCols[columns])}
    >
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
}
