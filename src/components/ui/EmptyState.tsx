import { SearchX, ArrowLeft, LucideIcon, PlusCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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
    <div className='flex flex-col justify-center items-center py-20 text-center duration-500 animate-in fade-in zoom-in-95'>
      {/* Icon Wrapper */}
      <div className='p-4 mb-4 rounded-full ring-8 bg-slate-50 ring-slate-50/50'>
        <Icon className='w-12 h-12 text-slate-300' aria-hidden='true' />
      </div>

      {/* Text Content */}
      <h3 className='text-xl font-bold leading-tight text-slate-900'>
        {title}
      </h3>
      <p className='mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-500'>
        {message}
      </p>

      {/* Conditional Action Button */}
      {actionHref && (
        <Link
          to={actionHref}
          className='mt-8 inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md transition-all min-h-[48px]'
        >
          {isContribution ? (
            <PlusCircle className='w-4 h-4 text-primary-600' />
          ) : (
            <ArrowLeft className='w-4 h-4 text-slate-400' />
          )}
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
