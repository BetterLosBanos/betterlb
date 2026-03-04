import { useState } from 'react';
import {
  Building2,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Layers,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { getAllOfficeDivisions } from '@/lib/services';

// Types
export type ServiceSource = 'citizens-charter' | 'community' | 'all';
export type ClassificationFilter = 'Simple' | 'Complex' | 'all';

interface FilterBarProps {
  selectedOfficeDivision: string;
  selectedSource: ServiceSource;
  selectedClassification: ClassificationFilter;
  onOfficeDivisionChange: (division: string) => void;
  onSourceChange: (source: ServiceSource) => void;
  onClassificationChange: (classification: ClassificationFilter) => void;
}

export default function FilterBar({
  selectedOfficeDivision,
  selectedSource,
  selectedClassification,
  onOfficeDivisionChange,
  onSourceChange,
  onClassificationChange,
}: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const officeDivisions = getAllOfficeDivisions();

  const hasActiveFilters =
    selectedOfficeDivision !== 'all' ||
    selectedSource !== 'all' ||
    selectedClassification !== 'all';

  return (
    <div
      className='border-kapwa-border-weak bg-kapwa-bg-surface rounded-2xl border shadow-sm'
      data-testid='filter-bar'
    >
      {/* Filter Bar Header */}
      <button
        type='button'
        onClick={() => setIsExpanded(!isExpanded)}
        className='flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-kapwa-bg-surface-raised sm:px-5'
        data-testid='filter-bar-toggle'
      >
        <div className='flex items-center gap-3'>
          <span className='text-kapwa-text-strong text-sm font-bold'>
            Filters
          </span>
          {hasActiveFilters && (
            <Badge variant='primary' className='text-xs'>
              Active
            </Badge>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className='text-kapwa-text-disabled h-4 w-4' />
        ) : (
          <ChevronDown className='text-kapwa-text-disabled h-4 w-4' />
        )}
      </button>

      {/* Expandable Filter Content */}
      {isExpanded && (
        <div className='border-kapwa-border-weak border-t px-4 py-4 sm:px-5'>
          <div className='flex flex-col gap-4 md:flex-row md:gap-6'>
            {/* Data Source Filter */}
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2'>
                <CheckCircle2 className='text-kapwa-text-disabled h-3.5 w-3.5' />
                <h4 className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                  Source
                </h4>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                <FilterPill
                  label='All'
                  selected={selectedSource === 'all'}
                  onClick={() => onSourceChange('all')}
                  data-testid='filter-source-all'
                />
                <FilterPill
                  label='Official'
                  selected={selectedSource === 'citizens-charter'}
                  onClick={() => onSourceChange('citizens-charter')}
                  data-testid='filter-source-official'
                />
                <FilterPill
                  label='Community'
                  selected={selectedSource === 'community'}
                  onClick={() => onSourceChange('community')}
                  data-testid='filter-source-community'
                />
              </div>
            </div>

            {/* Classification Filter */}
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2'>
                <Layers className='text-kapwa-text-disabled h-3.5 w-3.5' />
                <h4 className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                  Type
                </h4>
              </div>
              <div className='flex flex-wrap gap-1.5'>
                <FilterPill
                  label='All'
                  selected={selectedClassification === 'all'}
                  onClick={() => onClassificationChange('all')}
                  data-testid='filter-classification-all'
                />
                <FilterPill
                  label='Simple'
                  selected={selectedClassification === 'Simple'}
                  onClick={() => onClassificationChange('Simple')}
                  data-testid='filter-classification-simple'
                />
                <FilterPill
                  label='Complex'
                  selected={selectedClassification === 'Complex'}
                  onClick={() => onClassificationChange('Complex')}
                  data-testid='filter-classification-complex'
                />
              </div>
            </div>

            {/* Office Division Filter */}
            <div className='flex-1'>
              <div className='mb-2 flex items-center gap-2'>
                <Building2 className='text-kapwa-text-disabled h-3.5 w-3.5' />
                <h4 className='text-kapwa-text-disabled text-[10px] font-bold uppercase tracking-wider'>
                  Office
                </h4>
              </div>
              <select
                value={selectedOfficeDivision}
                onChange={e => onOfficeDivisionChange(e.target.value)}
                className='border-kapwa-border-weak bg-kapwa-bg-surface-raised text-kapwa-text-strong w-full rounded-lg border px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-kapwa-border-brand'
                data-testid='filter-office-select'
              >
                <option value='all'>All Offices</option>
                {officeDivisions.map(division => (
                  <option key={division} value={division}>
                    {division}
                  </option>
                ))}
              </select>
            </div>

            {/* Clear All Button */}
            {hasActiveFilters && (
              <div className='flex items-end'>
                <button
                  type='button'
                  onClick={() => {
                    onOfficeDivisionChange('all');
                    onSourceChange('all');
                    onClassificationChange('all');
                  }}
                  className='text-kapwa-text-brand hover:text-kapwa-text-accent-orange text-xs font-bold transition-colors'
                  data-testid='filter-clear-all'
                >
                  Clear All
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Filter Pill Component
interface FilterPillProps {
  label: string;
  selected: boolean;
  onClick: () => void;
  'data-testid'?: string;
}

function FilterPill({
  label,
  selected,
  onClick,
  'data-testid': testId,
}: FilterPillProps) {
  return (
    <button
      type='button'
      onClick={onClick}
      data-testid={testId}
      className={`transition-all ${
        selected
          ? 'border-kapwa-border-brand bg-kapwa-bg-brand-weak text-kapwa-text-brand'
          : 'border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-brand hover:bg-kapwa-bg-surface-raised'
      } rounded-md border px-3 py-1 text-xs font-bold`}
    >
      {label}
    </button>
  );
}
