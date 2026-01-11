import { PieChart, Calendar } from 'lucide-react';
import Button from '@/components/ui/Button';

interface QuarterToggleProps {
  quarters: string[]; // ['Q1', 'Q2', 'Q3', 'Q4']
  years: string[];
  viewMode: 'year' | 'quarter';
  selectedYear: string;
  selectedQuarter: string;
  onYearChange: (year: string) => void;
  onViewModeChange: (mode: 'year' | 'quarter') => void;
  onQuarterChange: (quarter: string) => void;
}

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
    <div className='flex flex-col gap-3'>
      {/* FY buttons + View mode */}
      <div className='flex flex-wrap gap-2 items-center overflow-x-auto'>
        <Calendar className='w-5 h-5 text-gray-600 flex-shrink-0' />

        {years.map(y => (
          <Button
            key={y}
            variant={y === selectedYear ? 'primary' : 'outline'}
            size='sm'
            onClick={() => onYearChange(y)}
          >
            FY {y}
          </Button>
        ))}

        <PieChart className='w-5 h-5 text-gray-600 flex-shrink-0 ml-4' />

        {(['quarter', 'year'] as const).map(mode => (
          <Button
            key={mode}
            variant={viewMode === mode ? 'primary' : 'outline'}
            size='sm'
            onClick={() => onViewModeChange(mode)}
          >
            {mode === 'quarter' ? 'Quarter' : 'Year'}
          </Button>
        ))}
      </div>

      {/* Quarter buttons (only if quarter view) */}
      {viewMode === 'quarter' && (
        <div className='flex gap-2 overflow-x-auto'>
          {quarters.map(q => (
            <Button
              key={q}
              variant={q === selectedQuarter ? 'primary' : 'outline'}
              size='sm'
              onClick={() => onQuarterChange(q)}
            >
              {q} {/* Q1-Q4 */}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
