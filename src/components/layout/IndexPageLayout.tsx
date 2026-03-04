import type { ReactNode } from 'react';
import { ModuleHeader } from './PageLayouts';
import SearchInput from '@/components/ui/SearchInput';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export interface BreadcrumbItem {
  label: string;
  href: string;
}

export interface FilterConfig {
  id: string;
  type: 'search' | 'select' | 'multiselect' | 'toggle' | 'tab' | 'date-range';
  label?: string;
  placeholder?: string;
  value: string | boolean | string[];
  onChange: (value: string | boolean | string[]) => void;
  options?: Array<{
    value: string;
    label: string;
    count?: number;
    disabled?: boolean;
  }>;
}

interface IndexPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  };
  filters?: FilterConfig[];
  actions?: ReactNode;
  resultsCount?: number;
  resultsLabel?: string;
  children: ReactNode;
  pagination?: {
    type: 'infinite' | 'traditional';
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
  };
  emptyState?: {
    title: string;
    message: string;
  };
  variant?: 'default' | 'compact' | 'wide';
  className?: string;
}

export function IndexPageLayout({
  title,
  description,
  search,
  resultsCount,
  resultsLabel = 'items',
  children,
  emptyState,
  className = '',
}: IndexPageLayoutProps) {
  const hasNoResults = children === null || children === undefined;

  return (
    <div className={`bg-kapwa-bg-surface min-h-screen ${className}`}>
      <ModuleHeader title={title} description={description}>
        {search && (
          <SearchInput
            value={search.value}
            onChangeValue={search.onChange}
            placeholder={search.placeholder}
            className={search.className}
          />
        )}
      </ModuleHeader>

      {resultsCount !== undefined && !hasNoResults && (
        <div className='mb-4'>
          <Badge variant='secondary'>
            {resultsCount} {resultsLabel}
          </Badge>
        </div>
      )}

      {hasNoResults && emptyState ? (
        <EmptyState title={emptyState.title} message={emptyState.message} />
      ) : (
        <>{children}</>
      )}
    </div>
  );
}
