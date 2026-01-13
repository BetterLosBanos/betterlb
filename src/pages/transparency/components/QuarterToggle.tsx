import { PieChart, Calendar } from 'lucide-react';

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
    <div className='bg-slate-100 p-1 rounded-lg inline-flex relative'>
      {options.map(option => {
        const isActive = selected === option;
        return (
          <button
            key={option}
            onClick={() => onChange(option)}
            className={`
              relative z-10 px-3 py-1 text-xs font-medium rounded-md transition-all duration-200
              ${isActive ? 'text-slate-900' : 'text-slate-500 hover:text-slate-700'}
            `}
          >
            {labels ? labels[option] : option}

            {/* The "Slide" Background Effect */}
            {isActive && (
              <span className='absolute inset-0 bg-white rounded-md shadow-sm border border-slate-200 -z-10 animate-in fade-in zoom-in-95 duration-200' />
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
    <div className='flex flex-col gap-3 items-end md:items-center'>
      {/* Top Row: Year and View Mode Toggles */}
      <div className='flex flex-wrap gap-3 items-center'>
        {/* Year Toggle */}
        <div className='flex items-center gap-2'>
          <Calendar className='w-4 h-4 text-slate-400' />
          <SlideToggle
            options={years}
            selected={selectedYear}
            onChange={onYearChange}
          />
        </div>

        {/* View Mode Toggle */}
        <div className='flex items-center gap-2'>
          <PieChart className='w-4 h-4 text-slate-400' />
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
        <div className='flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200'>
          <span className='text-xs font-semibold text-slate-400 uppercase tracking-wider mr-1'>
            Period
          </span>
          <div className='flex bg-slate-50 p-1 rounded-lg border border-slate-100'>
            {ALL_QUARTERS.map(q => {
              const isAvailable = quarters.includes(q);
              const isSelected = q === selectedQuarter;

              return (
                <button
                  key={q}
                  disabled={!isAvailable}
                  onClick={() => onQuarterChange(q)}
                  className={`
                    relative px-4 py-1.5 text-xs font-medium rounded-md transition-all duration-200
                    ${
                      !isAvailable
                        ? 'text-slate-300 cursor-not-allowed bg-transparent' // Greyed out
                        : isSelected
                          ? 'text-white bg-slate-900 shadow-sm' // Active & Dark
                          : 'text-slate-600 hover:bg-white hover:shadow-sm' // Available & Hover
                    }
                  `}
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
