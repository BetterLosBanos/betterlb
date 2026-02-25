import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { useOutletContext } from 'react-router-dom';

import { SearchXIcon } from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { CardGrid } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { filterServices } from '@/lib/services';

import ServiceCard from './components/ServiceCard';
import FilterBar from './components/FilterBar';
import type { ServicesOutletContext } from './layout';

const ITEMS_PER_PAGE = 12;

export default function ServicesPage() {
  const {
    searchQuery,
    selectedCategorySlug,
    selectedOfficeDivision,
    selectedSource,
    selectedClassification,
    setOfficeDivision,
    setSource,
    setClassification,
  } = useOutletContext<ServicesOutletContext>();

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 1. Filtering logic with new filters
  const filteredServices = useMemo(() => {
    return filterServices({
      category: selectedCategorySlug,
      officeDivision: selectedOfficeDivision,
      source: selectedSource,
      classification:
        selectedClassification !== 'all' ? selectedClassification : undefined,
      search: searchQuery || undefined,
    });
  }, [
    searchQuery,
    selectedCategorySlug,
    selectedOfficeDivision,
    selectedSource,
    selectedClassification,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [
    searchQuery,
    selectedCategorySlug,
    selectedOfficeDivision,
    selectedSource,
    selectedClassification,
  ]);

  // 2. Pagination & Infinite Scroll logic
  const handleLoadMore = useCallback(() => {
    if (filteredServices.length > currentPage * ITEMS_PER_PAGE) {
      setCurrentPage(prev => prev + 1);
    }
  }, [filteredServices.length, currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // 3. EMPTY STATE
  if (filteredServices.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title='No services found'
        message={
          "We couldn't find any services matching your filters. Try adjusting your search or filters."
        }
        actionHref='/contribute'
        actionLabel='Suggest New Service'
      />
    );
  }

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      {/* Filter Bar */}
      <FilterBar
        selectedOfficeDivision={selectedOfficeDivision}
        selectedSource={selectedSource}
        selectedClassification={selectedClassification}
        onOfficeDivisionChange={setOfficeDivision}
        onSourceChange={setSource}
        onClassificationChange={setClassification}
      />

      {/* Results Badge */}
      <div className='flex items-center justify-between'>
        <Badge
          variant='slate'
          className='bg-kapwa-bg-surface-raised border-kapwa-border-weak'
        >
          {filteredServices.length} Results
        </Badge>

        {/* Active Filters Display */}
        {(selectedOfficeDivision !== 'all' ||
          selectedSource !== 'all' ||
          selectedClassification !== 'all') && (
          <div className='flex flex-wrap gap-2'>
            {selectedOfficeDivision !== 'all' && (
              <Badge variant='primary' className='gap-1'>
                {selectedOfficeDivision}
                <button
                  type='button'
                  onClick={() => setOfficeDivision('all')}
                  className='hover:text-kapwa-text-inverse ml-1'
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedSource !== 'all' && (
              <Badge variant='primary' className='gap-1'>
                {selectedSource === 'citizens-charter'
                  ? 'Official'
                  : 'Community'}
                <button
                  type='button'
                  onClick={() => setSource('all')}
                  className='hover:text-kapwa-text-inverse ml-1'
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedClassification !== 'all' && (
              <Badge variant='primary' className='gap-1'>
                {selectedClassification}
                <button
                  type='button'
                  onClick={() => setClassification('all')}
                  className='hover:text-kapwa-text-inverse ml-1'
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Services Grid - Using CardGrid for consistency */}
      <CardGrid columns={filteredServices.length > 12 ? 3 : 2}>
        {filteredServices
          .slice(0, currentPage * ITEMS_PER_PAGE)
          .map(service => (
            <ServiceCard key={service.slug} service={service} />
          ))}

        {/* Infinite Scroll Loader */}
        {filteredServices.length > currentPage * ITEMS_PER_PAGE && (
          <div
            ref={loadMoreRef}
            className='flex justify-center py-12 col-span-full'
          >
            <div className='border-kapwa-border-brand h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
          </div>
        )}
      </CardGrid>
    </div>
  );
}
