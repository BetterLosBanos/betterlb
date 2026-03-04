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
      <div className='animate-in fade-in zoom-in-95 border-kapwa-border-weak bg-kapwa-bg-surface min-w-[220px] rounded-xl border p-3 shadow-xl duration-200'>
        {/* Uses CHART_THEME.text for the label color */}
        <p
          style={{ color: CHART_THEME.text }}
          className='mb-2 border-b border-kapwa-border-weak pb-1 text-[10px] font-bold tracking-widest uppercase'
        >
          Year: {label}
        </p>

        <div className='scrollbar-thin max-h-[320px] space-y-1.5 overflow-y-auto pr-1'>
          {sortedPayload.map((entry, index) => (
            <div
              key={`${entry.name}-${index}`}
              className='flex gap-6 justify-between items-center group'
            >
              <div className='flex gap-2 items-center'>
                <div
                  className='h-1.5 w-1.5 shrink-0 rounded-full shadow-xs'
                  style={{ backgroundColor: entry.color }}
                />
                <span
                  className={cn(
                    'max-w-[130px] truncate text-[11px] font-bold transition-colors',
                    // Use CHART_THEME.fontWeight for consistency
                    index === 0
                      ? 'text-kapwa-text-brand-bold'
                      : 'group-hover:text-kapwa-text-strong text-kapwa-text-support'
                  )}
                >
                  {entry.name}
                </span>
              </div>
              <span
                className='text-kapwa-text-strong text-[11px] font-black tabular-nums'
                style={{ fontWeight: CHART_THEME.fontWeight + 200 }} // Slightly bolder than axis
              >
                {formatter ? formatter(Number(entry.value)) : entry.value}
              </span>
            </div>
          ))}
        </div>

        <div className='text-kapwa-text-support mt-2 flex items-center justify-between border-t border-kapwa-border-weak pt-2 text-[9px] font-bold tracking-tight uppercase'>
          <span>Ranked by Value</span>
          <div className='w-1 h-1 rounded-full bg-kapwa-bg-active' />
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
        'p-4 w-full rounded-3xl border shadow-sm duration-700 animate-in fade-in slide-in-from-bottom-2 border-kapwa-border-weak bg-kapwa-bg-surface md:p-6',
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
      <div
        data-testid='responsive-container'
        style={{ width: '100%', height, fontSize: CHART_THEME.fontSize }}
      >
        <ResponsiveContainer>
          {React.Children.only(children as React.ReactElement)}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

interface ResponsiveChartProps {
  children: ReactNode;
  height?: number | string;
  className?: string;
}

/**
 * Lightweight responsive wrapper — no card styling, just ResponsiveContainer.
 * Use this when the chart lives inside an existing styled container (e.g. DetailSection).
 */
export function ResponsiveChart({
  children,
  height = 400,
  className,
}: ResponsiveChartProps) {
  return (
    <div
      data-testid='responsive-container'
      style={{ width: '100%', height, fontSize: CHART_THEME.fontSize }}
      className={className}
    >
      <ResponsiveContainer width='100%' height='100%'>
        {React.Children.only(children as React.ReactElement)}
      </ResponsiveContainer>
    </div>
  );
}
