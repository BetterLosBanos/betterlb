import { Link } from 'react-router-dom';

import { ArrowLeft, LucideIcon, PlusCircle, SearchX } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionHref?: string;
  actionLabel?: string; // New prop to customize the button text
  icon?: LucideIcon;
}

export function EmptyState({
  title = 'No results found',
  message = 'Try adjusting your search or filters.',
  actionHref,
  actionLabel = 'Go Back', // Default value
  icon: Icon = SearchX,
}: EmptyStateProps) {
  // Adaptive Icon logic: Use Plus icon if it's a contribution, otherwise an Arrow
  const isContribution =
    actionLabel.toLowerCase().includes('suggest') ||
    actionLabel.toLowerCase().includes('add');

  return (
    <div className='animate-in fade-in zoom-in-95 flex flex-col items-center justify-center py-20 text-center duration-500'>
      {/* Icon Wrapper */}
      <div className='bg-kapwa-bg-surface-raised mb-kapwa-md rounded-full p-kapwa-md ring-8 ring-kapwa-bg-surface/50'>
        <Icon
          className='text-kapwa-text-support h-12 w-12'
          aria-hidden='true'
        />
      </div>

      {/* Text Content */}
      <h3 className='text-kapwa-text-strong kapwa-heading-lg leading-tight'>
        {title}
      </h3>
      <p className='text-kapwa-text-support mx-auto mt-kapwa-xs max-w-sm kapwa-body-sm-default leading-relaxed'>
        {message}
      </p>

      {/* Conditional Action Button */}
      {actionHref && (
        <Link
          to={actionHref}
          className='border-kapwa-border-weak bg-kapwa-bg-surface text-kapwa-text-support hover:border-kapwa-border-weak hover:bg-kapwa-bg-surface-raised mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:shadow-md'
        >
          {isContribution ? (
            <PlusCircle className='text-kapwa-text-brand h-4 w-4' />
          ) : (
            <ArrowLeft className='text-kapwa-text-disabled h-4 w-4' />
          )}
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
