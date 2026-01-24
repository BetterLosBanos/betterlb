import { useState } from 'react';

import {
  ChevronDown,
  Feather,
  Gavel,
  Leaf,
  LucideIcon,
  MapPin,
  Mountain,
  Scroll,
  Waves,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/Card';

import highlightsData from '@/data/about/highlights.json';
import historyData from '@/data/about/history.json';

const ICON_MAP: Record<string, LucideIcon> = {
  Waves,
  Feather,
  Scroll,
  Leaf,
  Gavel,
  Mountain,
  MapPin,
};

export default function TimelineSection() {
  const [showAll, setShowAll] = useState(false);
  const COLLAPSE_LIMIT = 5;

  const visibleHistory = showAll
    ? historyData
    : historyData.slice(0, COLLAPSE_LIMIT);
  const visibleHighlights = showAll
    ? highlightsData
    : highlightsData.slice(0, COLLAPSE_LIMIT);

  return (
    <section className='border-t border-slate-200 bg-slate-50 py-16'>
      <div className='container mx-auto max-w-6xl px-4'>
        {/* Header */}
        <div className='mb-10 text-center'>
          <h2 className='text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl'>
            History of Los Baños
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
          {/* --- LEFT: Timeline --- */}
          <div className='relative'>
            <div className='from-primary-600 absolute top-2 bottom-0 left-4 w-0.5 bg-linear-to-b via-gray-300 to-transparent' />
            <div className='space-y-6'>
              {visibleHistory.map((event, idx) => (
                <div
                  key={idx}
                  className='group animate-in fade-in slide-in-from-left-4 relative pl-12 duration-300'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Dot Marker */}
                  <div className='absolute top-3 left-0 flex h-8 w-8 items-center justify-center'>
                    <div className='border-primary-600 group-hover:bg-primary-600 h-3 w-3 rounded-full border-2 bg-white shadow-sm transition-all duration-300 group-hover:scale-125' />
                  </div>

                  <Card
                    hoverable
                    className='hover:border-primary-200 border-slate-200 shadow-sm transition-all hover:shadow-md'
                  >
                    <CardContent className='flex flex-col items-start gap-4 p-4 sm:flex-row sm:p-5'>
                      <span className='bg-primary-600 inline-flex shrink-0 items-center justify-center rounded-lg px-3 py-1 text-xs font-bold text-white shadow-sm'>
                        {event.year}
                      </span>
                      <div>
                        <h3 className='mb-1 text-base leading-tight font-bold text-slate-900'>
                          {event.title}
                        </h3>
                        <p className='text-xs leading-relaxed text-slate-600 sm:text-sm'>
                          {event.description}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>

          {/* --- RIGHT: Highlights --- */}
          <div className='hidden space-y-3 lg:block'>
            {visibleHighlights.map((item, idx) => {
              const Icon = ICON_MAP[item.icon] || Waves;
              return (
                <div
                  key={idx}
                  className='group animate-in fade-in slide-in-from-right-4 duration-300'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Card
                    hoverable
                    className='border-slate-200 bg-white shadow-sm transition-all hover:shadow-md'
                  >
                    <CardContent className='p-5'>
                      <div className='mb-3 flex items-center gap-3'>
                        <div className='bg-primary-600 flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm'>
                          <Icon className='h-5 w-5' />
                        </div>
                        <h4 className='text-sm leading-tight font-bold text-slate-900'>
                          {item.title}
                        </h4>
                      </div>
                      <p className='text-xs leading-relaxed text-slate-500'>
                        {item.description}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        </div>

        {/* Show More / Show Less */}
        {(historyData.length > COLLAPSE_LIMIT ||
          highlightsData.length > COLLAPSE_LIMIT) && (
          <div className='mt-8 flex justify-center'>
            <button
              onClick={() => setShowAll(!showAll)}
              className='group text-primary-600 bg-primary-50 hover:bg-primary-100 flex items-center gap-2 rounded-lg px-6 py-3 font-semibold transition-all duration-200 hover:shadow-md'
            >
              <span>{showAll ? 'Show Less' : 'Show More'}</span>
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
