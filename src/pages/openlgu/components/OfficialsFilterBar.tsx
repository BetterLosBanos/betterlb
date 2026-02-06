import { X } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import SelectPicker from '@/components/ui/SelectPicker';

import type { Term } from '@/lib/openlgu';

interface OfficialsFilterBarProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  termFilter: string;
  setTermFilter: (id: string) => void;
  terms: Term[];
}

const roleOptions = [
  { label: 'All Roles', value: '' },
  { label: 'Mayor', value: 'mayor' },
  { label: 'Vice Mayor', value: 'vice_mayor' },
  { label: 'Councilor', value: 'councilor' },
];

export default function OfficialsFilterBar({
  searchQuery,
  setSearchQuery,
  roleFilter,
  setRoleFilter,
  termFilter,
  setTermFilter,
  terms,
}: OfficialsFilterBarProps) {
  const termOptions = [
    { label: 'All Terms', value: '' },
    ...terms
      .sort((a, b) => b.term_number - a.term_number)
      .map(term => ({
        label: term.year_range,
        value: term.id,
      })),
  ];

  const hasActiveFilters =
    searchQuery !== '' || roleFilter !== '' || termFilter !== '';

  const handleClearAll = () => {
    setSearchQuery('');
    setRoleFilter('');
    setTermFilter('');
  };

  return (
    <div className='space-y-4'>
      {/* Search Input */}
      <div className='relative'>
        <input
          type='text'
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder='Search officials by name...'
          className='focus:border-primary-500 focus:ring-primary-500/20 w-full rounded-lg border border-slate-300 bg-white px-4 py-2.5 pl-10 text-sm focus:ring-2 focus:outline-none'
        />
        <svg
          className='absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400'
          fill='none'
          stroke='currentColor'
          viewBox='0 0 24 24'
        >
          <path
            strokeLinecap='round'
            strokeLinejoin='round'
            strokeWidth={2}
            d='M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z'
          />
        </svg>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className='absolute top-1/2 right-3 -translate-y-1/2 text-slate-400 hover:text-slate-600'
            aria-label='Clear search'
          >
            <X className='h-4 w-4' />
          </button>
        )}
      </div>

      {/* Role and Term Filters */}
      <div className='flex flex-wrap items-center gap-3'>
        {/* Role Filter - Single Select */}
        <div className='min-w-[180px] flex-1 sm:flex-none'>
          <SelectPicker
            options={roleOptions}
            selectedValues={roleFilter ? [roleFilter] : []}
            onSelect={selected => setRoleFilter(selected[0]?.value || '')}
            placeholder='Role'
            size='md'
            searchable={false}
            clearable={true}
          />
        </div>

        {/* Term Filter - Single Select */}
        <div className='min-w-[180px] flex-1 sm:flex-none'>
          <SelectPicker
            options={termOptions}
            selectedValues={termFilter ? [termFilter] : []}
            onSelect={selected => setTermFilter(selected[0]?.value || '')}
            placeholder='Term'
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
          {searchQuery && (
            <Badge
              variant='primary'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setSearchQuery('')}
            >
              Search: &quot;{searchQuery}&quot;
            </Badge>
          )}
          {roleFilter && (
            <Badge
              variant='secondary'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setRoleFilter('')}
            >
              Role: {roleOptions.find(o => o.value === roleFilter)?.label}
            </Badge>
          )}
          {termFilter && (
            <Badge
              variant='slate'
              className='cursor-pointer hover:opacity-80'
              onClick={() => setTermFilter('')}
            >
              Term: {terms.find(t => t.id === termFilter)?.ordinal}
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
