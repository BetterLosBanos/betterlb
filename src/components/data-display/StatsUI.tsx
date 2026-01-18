import { ReactNode } from 'react';

import { LucideIcon, ShieldCheck } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';

import { cn } from '@/lib/utils';

export function StatsHero({
  title,
  description,
  badge,
  icon: Icon,
}: {
  title: string;
  description: string;
  badge: string;
  icon: LucideIcon;
}) {
  return (
    <div className='relative overflow-hidden rounded-3xl bg-slate-900 p-8 text-white shadow-xl md:p-12'>
      <div className='relative z-10 space-y-4'>
        <div className='flex items-center gap-2'>
          <Badge variant='primary' dot>
            {badge}
          </Badge>
          <Badge
            variant='slate'
            className='border-white/10 bg-white/10 text-slate-300'
          >
            Official Data
          </Badge>
        </div>
        <h1 className='text-3xl font-extrabold tracking-tight md:text-5xl'>
          {title}
        </h1>
        {/* FIXED: Escaped quotes for accessibility and ESLint compliance */}
        <p className='max-w-xl text-base leading-relaxed text-slate-400 italic'>
          &quot;{description}&quot;
        </p>
      </div>
      <Icon
        className='absolute right-[-20px] bottom-[-20px] h-64 w-64 -rotate-12 text-white/5 opacity-50'
        aria-hidden='true'
      />
    </div>
  );
}

// 2. Unified KPI Card
export function StatsKPICard({
  label,
  value,
  subtext,
  variant = 'slate',
  children,
}: {
  label: string;
  value: string | number;
  subtext: string;
  variant?: 'primary' | 'secondary' | 'slate';
  children?: ReactNode;
}) {
  const variants = {
    primary: 'border-b-primary-600',
    secondary: 'border-b-secondary-600',
    slate: 'border-b-slate-900',
  };

  return (
    <div
      className={cn(
        'space-y-2 rounded-2xl border border-b-4 border-slate-200 bg-white p-6 shadow-sm',
        variants[variant]
      )}
    >
      <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
        {label}
      </p>
      <div className='text-3xl font-black text-slate-900'>{value}</div>
      <div className='flex items-center gap-2'>
        <p className='text-xs font-medium text-slate-400'>{subtext}</p>
        {children}
      </div>
    </div>
  );
}

// 3. Unified Stats Footer
export function StatsFooter({
  source,
  sourceUrl,
}: {
  source: string;
  sourceUrl?: string;
}) {
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
