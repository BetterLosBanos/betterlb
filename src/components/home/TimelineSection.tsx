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
    <section className='py-12 border-t border-slate-200 bg-slate-50'>
      <div className='container px-4 mx-auto'>
        {/* Header */}
        <div className='mb-12 text-center'>
          <h2 className='mb-4 text-2xl font-bold text-gray-900 md:text-3xl'>
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
                  className='relative pl-12 duration-300 group animate-in fade-in slide-in-from-left-4'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Dot Marker */}
                  <div className='flex absolute left-0 top-3 justify-center items-center w-8 h-8'>
                    <div className='w-3 h-3 bg-white rounded-full border-2 shadow-sm transition-all duration-300 border-primary-600 group-hover:bg-primary-600 group-hover:scale-125' />
                  </div>

                  <Card
                    hoverable
                    className='shadow-sm transition-all hover:border-primary-200 border-slate-200 hover:shadow-md'
                  >
                    <CardContent className='flex flex-col gap-4 items-start p-4 sm:flex-row sm:p-5'>
                      <span className='inline-flex justify-center items-center px-3 py-1 text-xs font-bold text-white rounded-lg shadow-sm bg-primary-600 shrink-0'>
                        {event.year}
                      </span>
                      <div>
                        <h3 className='mb-1 text-base font-bold leading-tight text-slate-900'>
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
                  className='duration-300 group animate-in fade-in slide-in-from-right-4'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <Card
                    hoverable
                    className='bg-white shadow-sm transition-all border-slate-200 hover:shadow-md'
                  >
                    <CardContent className='p-5'>
                      <div className='flex gap-3 items-center mb-3'>
                        <div className='flex justify-center items-center w-10 h-10 text-white rounded-xl shadow-sm bg-primary-600'>
                          <Icon className='w-5 h-5' />
                        </div>
                        <h4 className='text-sm font-bold leading-tight text-slate-900'>
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
          <div className='flex justify-center mt-8'>
            <button
              onClick={() => setShowAll(!showAll)}
              className='flex gap-2 items-center px-6 py-3 font-semibold rounded-lg transition-all duration-200 group text-primary-600 bg-primary-50 hover:bg-primary-100 hover:shadow-md'
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
