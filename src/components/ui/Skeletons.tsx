export function CardSkeleton() {
  return (
    <div className='border-kapwa-border-weak bg-kapwa-bg-surface animate-pulse rounded-xl border p-6'>
      <div className='mb-6 flex items-start justify-between'>
        <div className='bg-kapwa-bg-active h-12 w-12 rounded-lg' />
        <div className='bg-kapwa-bg-active h-4 w-4 rounded-full' />
      </div>
      <div className='bg-kapwa-bg-active mb-2 h-5 w-3/4 rounded' />
      <div className='bg-kapwa-bg-hover h-3 w-1/2 rounded' />
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
      <div className='text-kapwa-text-disabled flex items-center gap-3'>
        <div className='border-primary-200 border-t-primary-600 h-5 w-5 animate-spin rounded-full border-2' />
        <span className='text-sm font-medium'>{message}</span>
      </div>
    </div>
  );
}
