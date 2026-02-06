export function CardSkeleton() {
  return (
    <div className='animate-pulse rounded-xl border border-gray-100 bg-white p-6'>
      <div className='mb-6 flex items-start justify-between'>
        <div className='h-12 w-12 rounded-lg bg-gray-200' />
        <div className='h-4 w-4 rounded-full bg-gray-200' />
      </div>
      <div className='mb-2 h-5 w-3/4 rounded bg-gray-200' />
      <div className='h-3 w-1/2 rounded bg-gray-100' />
    </div>
  );
}

export function DirectoryGridSkeleton() {
  return (
    <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

interface PageLoadingStateProps {
  message?: string;
}

export function PageLoadingState({
  message = 'Loading...',
}: PageLoadingStateProps) {
  return (
    <div className='flex items-center justify-center p-20'>
      <div className='flex items-center gap-3 text-slate-400'>
        <div className='border-primary-200 border-t-primary-600 h-5 w-5 animate-spin rounded-full border-2' />
        <span className='text-sm font-medium'>{message}</span>
      </div>
    </div>
  );
}
