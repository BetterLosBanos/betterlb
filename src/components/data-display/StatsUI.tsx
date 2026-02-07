import { ReactNode } from 'react';

import {
  ArrowDownRight,
  ArrowUpRight,
  LucideIcon,
  ShieldCheck,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';

import { formatPesoAdaptive } from '@/lib/format';
import { cn } from '@/lib/utils';

// YoY calculation (simplified version of budgetUtils.calculateYoY)
const calculateYoY = (current: number, previous?: number) => {
  if (previous === undefined || previous === 0) return null;
  const diff = current - previous;
  const pct = (diff / previous) * 100;
  return { diff, pct };
};

// Stats Hero / Header
interface StatsHeroProps {
  title: string;
  description: string;
  badges?: string | { label: string; variant?: 'primary' | 'slate' }[];
  icon?: LucideIcon;
}

export function StatsHero({
  title,
  description,
  badges = [],
  icon: Icon,
}: StatsHeroProps) {
  // Normalize badges to always be an array
  const badgeArray =
    typeof badges === 'string'
      ? [{ label: badges, variant: 'primary' as const }]
      : badges;

  return (
    <div className='relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12'>
      <div className='relative z-10 space-y-4'>
        <div className='flex flex-wrap gap-2'>
          {badgeArray.map((b, i) => (
            <Badge key={i} variant={b.variant || 'primary'} dot={i === 0}>
              {b.label}
            </Badge>
          ))}
        </div>
        <h1 className='text-3xl font-extrabold tracking-tight md:text-5xl'>
          {title}
        </h1>
        <p className='max-w-xl text-base leading-relaxed text-slate-400 italic'>
          &quot;{description}&quot;
        </p>
      </div>
      {Icon && (
        <Icon
          className='absolute right-[-20px] bottom-[-20px] h-64 w-64 -rotate-12 text-white/5 opacity-50'
          aria-hidden={true}
        />
      )}
    </div>
  );
}

// Stats Card
interface StatsCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  variant?: 'primary' | 'secondary' | 'slate';
  icon?: LucideIcon;
  iconBg?: string;
  children?: ReactNode;
  alreadyInMillions?: boolean; // flag for pre-scaled data
  prevValue?: number; // for YoY calculation
  showTrend?: boolean; // force show/hide trend indicator
  hover?: boolean; // enable hover effect
}

export function StatsCard({
  label,
  value,
  subtext,
  variant = 'slate',
  icon: Icon,
  iconBg,
  children,
  alreadyInMillions = false,
  prevValue,
  showTrend = true,
  hover = false,
}: StatsCardProps) {
  const variantClasses = {
    primary: 'border-b-primary-600',
    secondary: 'border-b-secondary-600',
    slate: 'border-b-slate-900',
  };

  // Calculate YoY trend if prevValue is provided
  const yoy =
    prevValue !== undefined && typeof value === 'number'
      ? calculateYoY(value, prevValue)
      : null;
  const isPositive = yoy ? yoy.diff >= 0 : true;
  const trendColor = isPositive ? 'text-emerald-600' : 'text-rose-600';
  const TrendIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  // Determine if value should be formatted as currency
  // Check if it's a large number (>= 1000) or if label/subtext contains currency indicators
  const shouldFormatAsCurrency =
    typeof value === 'number' &&
    (value >= 1000 ||
      label.toLowerCase().includes('budget') ||
      label.toLowerCase().includes('income') ||
      label.toLowerCase().includes('revenue') ||
      label.toLowerCase().includes('allocation') ||
      label.toLowerCase().includes('expenditure') ||
      label.toLowerCase().includes('balance') ||
      subtext?.toLowerCase().includes('php'));

  const numericValue =
    typeof value === 'number'
      ? alreadyInMillions
        ? value * 1_000_000
        : value
      : null;

  const displayValue =
    typeof value === 'number'
      ? shouldFormatAsCurrency
        ? formatPesoAdaptive(numericValue!).fullString
        : numericValue!.toLocaleString()
      : value;

  return (
    <Card variant='default' hover={hover} className='overflow-hidden'>
      <CardContent
        className={cn(
          'flex flex-col items-start justify-between gap-2 border-b-4 sm:flex-row sm:items-center',
          variantClasses[variant]
        )}
      >
        <div className='flex min-w-0 flex-1 flex-col gap-1'>
          <p className='truncate text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            {label}
          </p>
          <div className='truncate text-3xl font-black wrap-break-word text-slate-900 sm:text-2xl md:text-2xl'>
            {displayValue}
            {yoy && showTrend && (
              <span
                className={`ml-2 inline-flex items-center text-lg font-semibold ${trendColor}`}
              >
                <TrendIcon className='h-4 w-4' />
                <span className='ml-0.5'>{Math.abs(yoy.pct).toFixed(1)}%</span>
              </span>
            )}
          </div>
          {subtext && (
            <span className='truncate text-xs font-medium text-slate-400'>
              {subtext}
            </span>
          )}
          {children && <div className='mt-1'>{children}</div>}
        </div>
        {Icon && (
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl p-2',
              iconBg || 'bg-slate-100 text-slate-900'
            )}
          >
            <Icon className='h-6 w-6' />
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Stats Footer
interface StatsFooterProps {
  source: string;
  sourceUrl?: string;
}

export function StatsFooter({ source, sourceUrl }: StatsFooterProps) {
  return (
    <footer className='space-y-4 border-t border-slate-100 pt-10 text-center'>
      <ShieldCheck className='mx-auto h-6 w-6 text-emerald-600' />
      <div className='space-y-1'>
        <p className='text-[10px] font-bold tracking-widest text-slate-900 uppercase'>
          Verified Data Audit
        </p>
        <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
          Source:{' '}
          {sourceUrl ? (
            <a
              href={sourceUrl}
              target='_blank'
              rel='noreferrer'
              className='hover:text-primary-600 underline'
            >
              {source}
            </a>
          ) : (
            source
          )}
        </p>
      </div>
    </footer>
  );
}

// Stats Grid
interface StatsGridProps {
  stats: {
    label: string;
    value: string | number;
    subtext?: string;
    icon?: LucideIcon;
    iconBg?: string;
    variant?: 'primary' | 'secondary' | 'slate';
    children?: ReactNode;
    alreadyInMillions?: boolean;
    prevValue?: number;
    showTrend?: boolean;
    hover?: boolean;
  }[];
  columns?: 2 | 3 | 4;
  alreadyInMillions?: boolean; // Apply to all cards
  showTrend?: boolean; // Apply to all cards
  hover?: boolean; // Apply to all cards
}

export function StatsGrid({
  stats,
  columns = 4,
  alreadyInMillions = false,
  showTrend: globalShowTrend,
  hover: globalHover,
}: StatsGridProps) {
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
        <StatsCard
          key={i}
          label={s.label}
          value={s.value}
          subtext={s.subtext}
          icon={s.icon}
          iconBg={s.iconBg}
          variant={s.variant}
          alreadyInMillions={s.alreadyInMillions ?? alreadyInMillions}
          prevValue={s.prevValue}
          showTrend={s.showTrend ?? globalShowTrend ?? true}
          hover={s.hover ?? globalHover ?? false}
        >
          {s.children}
        </StatsCard>
      ))}
    </div>
  );
}
