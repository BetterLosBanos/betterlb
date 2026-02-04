import { X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SelectPicker from '@/components/ui/SelectPicker';

import type { FilterType } from '../layout';

interface DocumentFiltersProps {
  filterType: FilterType;
  setFilterType: (type: FilterType) => void;
  authorIds: string[];
  setAuthorIds: (ids: string[]) => void;
  year: string;
  setYear: (year: string) => void;
  authorOptions: Array<{ label: string; value: string }>;
  yearOptions: Array<{ label: string; value: string }>;
}

const typeOptions: Array<{ label: string; value: FilterType }> = [
  { label: 'All Documents', value: 'all' },
  { label: 'Ordinances', value: 'ordinance' },
  { label: 'Resolutions', value: 'resolution' },
  { label: 'Executive Orders', value: 'executive_order' },
];

export default function DocumentFilters({
  filterType,
  setFilterType,
  authorIds,
  setAuthorIds,
  year,
  setYear,
  authorOptions,
  yearOptions,
}: DocumentFiltersProps) {
  const hasActiveFilters =
    filterType !== 'all' || authorIds.length > 0 || year !== '';

  const handleClearAll = () => {
    setFilterType('all');
    setAuthorIds([]);
    setYear('');
  };

  return (
    <div className='space-y-4'>
      <div className='flex flex-wrap items-center gap-3'>
        {/* Type Filter - Single Select */}
        <div className='min-w-[180px] flex-1 sm:flex-none'>
          <SelectPicker
            options={typeOptions}
            selectedValues={[filterType]}
            onSelect={selected => setFilterType(selected[0]?.value || 'all')}
            placeholder='Type'
            size='md'
            searchable={false}
            clearable={true}
          />
        </div>

        {/* Author Filter - Multi Select */}
        <div className='min-w-[240px] flex-1 sm:flex-none'>
          <SelectPicker
            options={authorOptions}
            selectedValues={authorIds}
            onSelect={selected => setAuthorIds(selected.map(s => s.value))}
            placeholder='Authors'
            size='md'
            searchable={true}
            clearable={true}
          />
        </div>

        {/* Year Filter - Single Select */}
        <div className='min-w-[140px] flex-1 sm:flex-none'>
          <SelectPicker
            options={yearOptions}
            selectedValues={year ? [year] : []}
            onSelect={selected => setYear(selected[0]?.value || '')}
            placeholder='Year'
            size='md'
            searchable={true}
            clearable={true}
          />
        </div>

        {/* Clear All Button */}
        {hasActiveFilters && (
          <Button
            variant='ghost'
            size='md'
            onClick={handleClearAll}
            leftIcon={<X className='h-4 w-4' />}
          >
            Clear all
          </Button>
        )}
      </div>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className='flex flex-wrap gap-2'>
          {filterType !== 'all' && (
            <Badge
              variant='primary'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setFilterType('all')}
            >
              Type: {typeOptions.find(o => o.value === filterType)?.label}
            </Badge>
          )}
          {authorIds.length > 0 && (
            <Badge
              variant='secondary'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setAuthorIds([])}
            >
              {authorIds.length} Author{authorIds.length > 1 ? 's' : ''}
            </Badge>
          )}
          {year && (
            <Badge
              variant='slate'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setYear('')}
            >
              Year: {year}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
