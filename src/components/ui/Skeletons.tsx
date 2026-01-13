export function CardSkeleton() {
  return (
    <div className='bg-white rounded-xl border border-gray-100 p-6 animate-pulse'>
      <div className='flex justify-between items-start mb-6'>
        <div className='w-12 h-12 bg-gray-200 rounded-lg' />
        <div className='w-4 h-4 bg-gray-200 rounded-full' />
      </div>
      <div className='h-5 bg-gray-200 rounded w-3/4 mb-2' />
      <div className='h-3 bg-gray-100 rounded w-1/2' />
    </div>
  );
}

export function DirectoryGridSkeleton() {
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
      {[...Array(6)].map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
