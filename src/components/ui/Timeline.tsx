import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface TimelineItemProps {
  year: string;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Timeline({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("relative pl-8 space-y-8 md:pl-0", className)}>
      {/* Vertical Line */}
      <div 
        className="absolute top-2 bottom-2 left-[11px] md:left-1/2 w-0.5 bg-linear-to-b from-primary-600 via-primary-200 to-transparent -translate-x-1/2" 
        aria-hidden="true" 
      />
      {children}
    </div>
  );
}

export function TimelineItem({ year, title, children }: TimelineItemProps) {
  return (
    <div className="flex relative flex-col md:flex-row md:items-center group">
      
      {/* 1. Date/Year Bubble (Desktop: Alternates, Mobile: Left) */}
      <div className="mb-2 md:mb-0 md:w-1/2 md:pr-12 md:text-right md:group-even:order-last md:group-even:pl-12 md:group-even:text-left md:group-even:pr-0">
        <span className="inline-flex justify-center items-center px-3 py-1 text-xs font-bold text-white rounded-full ring-4 ring-white shadow-md bg-primary-600">
          {year}
        </span>
      </div>

      {/* 2. The Dot (Absolute Center) */}
      <div className="absolute left-[11px] top-0 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full border-2 border-primary-600 bg-white shadow-sm md:left-1/2 md:top-1/2 md:-translate-y-1/2 group-hover:scale-125 transition-transform duration-300">
        <div className="h-1.5 w-1.5 rounded-full bg-primary-600" />
      </div>

      {/* 3. The Content Card */}
      <div className="md:w-1/2 md:pl-12 md:group-even:pr-12 md:group-even:pl-0">
        <div className="relative p-5 bg-white rounded-2xl border shadow-sm transition-all border-slate-200 hover:border-primary-200 hover:shadow-md">
          {/* Mobile Arrow (Left) */}
          <div className="absolute top-4 -left-1.5 h-3 w-3 rotate-45 border-b border-l border-slate-200 bg-white md:hidden" />
          
          {/* Desktop Arrows */}
          <div className="hidden md:block absolute top-1/2 -left-1.5 h-3 w-3 -translate-y-1/2 rotate-45 border-b border-l border-slate-200 bg-white group-even:left-auto group-even:-right-1.5 group-even:rotate-225" />

          {title && <h3 className="mb-2 text-lg font-bold text-slate-900">{title}</h3>}
          <div className="text-sm leading-relaxed text-slate-600">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}