import { SearchX, ArrowLeft, LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title?: string;
  message?: string;
  actionHref?: string;
  icon?: LucideIcon; // Allows passing a custom icon like Building2 or Users
}

export function EmptyState({
  title = 'No results found',
  message = 'Try adjusting your search or filters.',
  actionHref,
  icon: Icon = SearchX, // Defaults to the search-x icon
}: EmptyStateProps) {
  return (
    <div className='flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-500'>
      <div className='p-4 bg-gray-50 rounded-full mb-4'>
        <Icon className='w-10 h-10 text-gray-300' />
      </div>
      <h3 className='text-xl font-bold text-gray-900 leading-tight'>{title}</h3>
      <p className='text-gray-500 mt-2 max-w-sm mx-auto text-sm leading-relaxed'>
        {message}
      </p>

      {actionHref && (
        <Link
          to={actionHref}
          className='mt-8 inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm transition-all'
        >
          <ArrowLeft className='w-4 h-4' /> Go Back
        </Link>
      )}
    </div>
  );
}
