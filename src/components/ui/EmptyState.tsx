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
      <div className='kapwa-bg-surface-raised mb-4 rounded-full p-4 ring-8 ring-slate-50/50'>
        <Icon className='h-12 w-12 text-slate-300' aria-hidden='true' />
      </div>

      {/* Text Content */}
      <h3 className='kapwa-text-strong text-xl leading-tight font-bold'>
        {title}
      </h3>
      <p className='kapwa-text-disabled mx-auto mt-2 max-w-sm text-sm leading-relaxed'>
        {message}
      </p>

      {/* Conditional Action Button */}
      {actionHref && (
        <Link
          to={actionHref}
          className='kapwa-border-weak kapwa-bg-surface kapwa-text-support hover:kapwa-border-weak hover:kapwa-bg-surface-raised mt-8 inline-flex min-h-[48px] items-center gap-2 rounded-xl border px-6 py-3 text-sm font-bold transition-all hover:shadow-md'
        >
          {isContribution ? (
            <PlusCircle className='text-primary-600 h-4 w-4' />
          ) : (
            <ArrowLeft className='kapwa-text-disabled h-4 w-4' />
          )}
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
