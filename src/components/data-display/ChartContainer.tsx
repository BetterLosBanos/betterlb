import React, { ReactNode } from 'react';

import { CHART_THEME } from '@/constants/charts';
import { ResponsiveContainer, TooltipProps } from 'recharts';

import { cn } from '@/lib/utils';

// --- Types ---

type SimpleFormatter = (value: number) => string | number;

interface ChartTooltipProps extends TooltipProps<number, string> {
  formatter?: SimpleFormatter;
}

interface ChartContainerProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
  title: string;
}

// --- Components ---

/**
 * Unified Accessible Tooltip
 * Uses CHART_THEME for typography and colors.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatter,
}: ChartTooltipProps) {
  if (active && payload && payload.length) {
    // Sort descending: highest values at the top
    const sortedPayload = [...payload].sort(
      (a, b) => (Number(b.value) || 0) - (Number(a.value) || 0)
    );

    return (
      <div className='animate-in fade-in zoom-in-95 min-w-[220px] rounded-xl border border-slate-200 bg-white p-3 shadow-xl duration-200'>
        {/* Uses CHART_THEME.text for the label color */}
        <p
          style={{ color: CHART_THEME.text }}
          className='mb-2 border-b border-slate-50 pb-1 text-[10px] font-bold tracking-widest uppercase'
        >
          Year: {label}
        </p>

        <div className='scrollbar-thin max-h-[320px] space-y-1.5 overflow-y-auto pr-1'>
          {sortedPayload.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className='group flex items-center justify-between gap-6'
            >
              <div className='flex items-center gap-2'>
                <div
                  className='h-1.5 w-1.5 shrink-0 rounded-full shadow-xs'
                  style={{ backgroundColor: entry.color }}
                />
                <span
                  className={cn(
                    'max-w-[130px] truncate text-[11px] font-bold transition-colors',
                    // Use CHART_THEME.fontWeight for consistency
                    index === 0
                      ? 'text-primary-700'
                      : 'text-slate-600 group-hover:text-slate-900'
                  )}
                >
                  {entry.name}
                </span>
              </div>
              <span
                className='text-[11px] font-black text-slate-900 tabular-nums'
                style={{ fontWeight: CHART_THEME.fontWeight + 200 }} // Slightly bolder than axis
              >
                {formatter ? formatter(Number(entry.value)) : entry.value}
              </span>
            </div>
          ))}
        </div>

        <div className='mt-2 flex items-center justify-between border-t border-slate-50 pt-2 text-[9px] font-bold tracking-tight text-slate-300 uppercase'>
          <span>Ranked by Value</span>
          <div className='h-1 w-1 rounded-full bg-slate-200' />
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Unified Responsive Wrapper
 */
export function ChartContainer({
  children,
  height = 400,
  className,
  title,
}: ChartContainerProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-2 w-full rounded-3xl border border-slate-200 bg-white p-4 shadow-sm duration-700 md:p-6',
        className
      )}
      role='region'
      aria-label={`Statistical chart showing ${title}`}
    >
      {/* 
          Standardized Chart Inner Spacing 
          Driven by CHART_THEME.fontSize to ensure the container scales 
          proportionally with the text size.
      */}
      <div style={{ width: '100%', height, fontSize: CHART_THEME.fontSize }}>
        <ResponsiveContainer>
          {React.Children.only(children as React.ReactElement)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
