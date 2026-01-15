import { Calendar, PieChart } from 'lucide-react';

interface QuarterToggleProps {
  quarters: string[];
  years: string[];
  viewMode: 'year' | 'quarter';
  selectedYear: string;
  selectedQuarter: string;
  onYearChange: (year: string) => void;
  onViewModeChange: (mode: 'year' | 'quarter') => void;
  onQuarterChange: (quarter: string) => void;
}

const ALL_QUARTERS = ['Q1', 'Q2', 'Q3', 'Q4'];

// --- Reusable Slide Toggle Component ---
const SlideToggle = <T extends string>({
  options,
  selected,
  onChange,
  labels, // Optional map for display labels
}: {
  options: T[];
  selected: T;
  onChange: (val: T) => void;
  labels?: Record<T, string>;
}) => {
  return (
    <div className='relative inline-flex rounded-lg bg-slate-100 p-1'>
      {options.map(option => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`relative z-10 rounded-md px-3 py-1 text-xs font-medium transition-all duration-200 ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'} `}
          >
            {labels ? labels[option] : option}

            {/* The "Slide" Background Effect */}
            {isActive && (
              <span className='animate-in fade-in zoom-in-95 absolute inset-0 -z-10 rounded-md border border-slate-200 bg-white shadow-sm duration-200' />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default function QuarterToggle({
  quarters,
  years,
  viewMode,
  selectedYear,
  selectedQuarter,
  onYearChange,
  onViewModeChange,
  onQuarterChange,
}: QuarterToggleProps) {
  return (
    <div className='flex flex-col items-end gap-3 md:items-center'>
      {/* Top Row: Year and View Mode Toggles */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Year Toggle */}
        <div className='flex items-center gap-2'>
          <Calendar className='h-4 w-4 text-slate-400' />
          <SlideToggle
            options={years}
            selected={selectedYear}
            onChange={onYearChange}
          />
        </div>

        {/* View Mode Toggle */}
        <div className='flex items-center gap-2'>
          <PieChart className='h-4 w-4 text-slate-400' />
          <SlideToggle
            options={['quarter', 'year']}
            selected={viewMode}
            onChange={onViewModeChange}
            labels={{ quarter: 'Quarterly', year: 'Annual' }}
          />
        </div>
      </div>

      {/* Bottom Row: Quarter Buttons (Only in Quarter View) */}
      {viewMode === 'quarter' && (
        <div className='animate-in fade-in slide-in-from-top-1 flex items-center gap-2 duration-200'>
          <span className='mr-1 text-xs font-semibold tracking-wider text-slate-400 uppercase'>
            Period
          </span>
          <div className='flex rounded-lg border border-slate-100 bg-slate-50 p-1'>
            {ALL_QUARTERS.map(q => {
              const isAvailable = quarters.includes(q);
              const isSelected = q === selectedQuarter;

              return (
                <button
                  key={q}
                  disabled={!isAvailable}
                  onClick={() => onQuarterChange(q)}
                  className={`relative rounded-md px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                    !isAvailable
                      ? 'cursor-not-allowed bg-transparent text-slate-300' // Greyed out
                      : isSelected
                        ? 'bg-slate-900 text-white shadow-sm' // Active & Dark
                        : 'text-slate-600 hover:bg-white hover:shadow-sm' // Available & Hover
                  } `}
                >
                  {q}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
