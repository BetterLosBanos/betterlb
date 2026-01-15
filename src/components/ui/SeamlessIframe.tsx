import { useState } from 'react';
import { Loader2, ExternalLink, RefreshCcw } from 'lucide-react';
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
    <div className='flex overflow-hidden flex-col w-full rounded-2xl border shadow-sm border-slate-200 bg-slate-50'>
      {/* 1. Iframe Toolbar (Accessibility & Control) */}
      <div className='flex justify-between items-center px-4 py-2 bg-white border-b border-slate-100'>
        <div className='flex gap-2 items-center'>
          <div
            className={cn(
              'w-2 h-2 rounded-full',
              isLoading ? 'bg-amber-400 animate-pulse' : 'bg-emerald-500'
            )}
          />
          <span className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            {title}
          </span>
        </div>
        <div className='flex gap-1 items-center'>
          <button
            onClick={handleRefresh}
            className='p-2 rounded-lg transition-colors text-slate-400 hover:text-primary-600 hover:bg-slate-50'
            title='Refresh data'
          >
            <RefreshCcw
              className={cn('w-3.5 h-3.5', isLoading && 'animate-spin')}
            />
          </button>
          <a
            href={src}
            target='_blank'
            rel='noreferrer'
            className='p-2 rounded-lg transition-colors text-slate-400 hover:text-primary-600 hover:bg-slate-50'
            title='Open in new window'
          >
            <ExternalLink className='w-3.5 h-3.5' />
          </a>
        </div>
      </div>

      {/* 2. Iframe Container */}
      <div className='relative w-full' style={{ height }}>
        {/* Loading Overlay */}
        {isLoading && (
          <div className='flex absolute inset-0 z-10 flex-col justify-center items-center bg-slate-50 animate-in fade-in'>
            <Loader2 className='mb-2 w-8 h-8 animate-spin text-primary-600' />
            <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
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
            'w-full h-full border-0 transition-opacity duration-700',
            isLoading ? 'opacity-0' : 'opacity-100'
          )}
          allowFullScreen
          loading='lazy'
        />
      </div>
    </div>
  );
}
