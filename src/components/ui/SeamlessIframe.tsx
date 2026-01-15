import { useState } from 'react';

import { ExternalLink, Loader2, RefreshCcw } from 'lucide-react';

import { cn } from '@/lib/utils';

interface SeamlessIframeProps {
  src: string;
  title: string;
  height?: string;
}

export function SeamlessIframe({
  src,
  title,
  height = '75vh',
}: SeamlessIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0); // For refreshing

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  return (
    <div className='flex w-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-sm'>
      {/* 1. Iframe Toolbar (Accessibility & Control) */}
      <div className='flex items-center justify-between border-b border-slate-100 bg-white px-4 py-2'>
        <div className='flex items-center gap-2'>
          <div
            className={cn(
              'h-2 w-2 rounded-full',
              isLoading ? 'animate-pulse bg-amber-400' : 'bg-emerald-500'
            )}
          />
          <span className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            {title}
          </span>
        </div>
        <div className='flex items-center gap-1'>
          <button
            onClick={handleRefresh}
            className='hover:text-primary-600 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50'
            title='Refresh data'
          >
            <RefreshCcw
              className={cn('h-3.5 w-3.5', isLoading && 'animate-spin')}
            />
          </button>
          <a
            href={src}
            target='_blank'
            rel='noreferrer'
            className='hover:text-primary-600 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-50'
            title='Open in new window'
          >
            <ExternalLink className='h-3.5 w-3.5' />
          </a>
        </div>
      </div>

      {/* 2. Iframe Container */}
      <div className='relative w-full' style={{ height }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className='animate-in fade-in absolute inset-0 z-10 flex flex-col items-center justify-center bg-slate-50'>
            <Loader2 className='text-primary-600 mb-2 h-8 w-8 animate-spin' />
            <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
              Synchronizing Records...
            </p>
          </div>
        )}

        <iframe
          key={iframeKey}
          src={src}
          title={title}
          onLoad={() => setIsLoading(false)}
          className={cn(
            'h-full w-full border-0 transition-opacity duration-700',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          allowFullScreen
          loading='lazy'
        />
      </div>
    </div>
  );
}
