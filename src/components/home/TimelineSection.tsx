import { useState } from 'react';

import { Button } from '@bettergov/kapwa/button';
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

import { config } from '@/lib/lguConfig';

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
    <section className='border-kapwa-border-weak border-t py-12 bg-kapwa-bg-surface-raised'>
      <div className='container px-4 mx-auto'>
        {/* Header - restored */}
        <div className='mb-12 text-center'>
          <h2 className='text-2xl font-bold md:text-3xl text-kapwa-text-strong'>
            History of {config.lgu.name}
          </h2>
        </div>

        <div className='grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]'>
          {/* --- LEFT: Timeline --- */}
          <div className='relative'>
            <div className='border-l-2 border-kapwa-border-brand absolute top-2 bottom-0 left-4 w-0.5' />
            <div className='space-y-6'>
              {visibleHistory.map((event, idx) => (
                <div
                  key={idx}
                  className='relative pl-12 duration-300 group animate-in fade-in slide-in-from-left-4'
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Dot Marker */}
                  <div className='flex absolute left-0 top-3 justify-center items-center w-8 h-8'>
                    <div className='w-3 h-3 rounded-full border-2 shadow-sm transition-all duration-300 border-kapwa-border-brand group-hover:bg-kapwa-bg-brand-default bg-kapwa-bg-surface group-hover:scale-125' />
                  </div>

                  <Card className='shadow-sm transition-all hover:border-kapwa-border-brand border-kapwa-border-weak hover:shadow-md'>
                    <CardContent className='flex flex-col gap-4 items-start p-4 sm:flex-row sm:p-5'>
                      <span className='inline-flex justify-center items-center px-3 py-1 text-xs font-bold rounded-lg shadow-sm bg-kapwa-bg-brand-default text-kapwa-text-inverse shrink-0'>
                        {event.year}
                      </span>
                      <div>
                        <h3 className='mb-1 text-base font-bold leading-tight text-kapwa-text-strong'>
                          {event.title}
                        </h3>
                        <p className='text-xs leading-relaxed text-kapwa-text-support sm:text-sm'>
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
                    hover
                    className='shadow-sm transition-all bg-kapwa-bg-surface border-kapwa-border-weak hover:shadow-md'
                  >
                    <CardContent className='p-5'>
                      <div className='flex gap-3 items-center mb-3'>
                        <div className='flex justify-center items-center w-10 h-10 rounded-xl shadow-sm bg-kapwa-bg-brand-default text-kapwa-text-inverse'>
                          <Icon className='w-5 h-5' />
                        </div>
                        <h4 className='text-sm font-bold leading-tight text-kapwa-text-strong'>
                          {item.title}
                        </h4>
                      </div>
                      <p className='text-xs leading-relaxed text-kapwa-text-disabled'>
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
            <Button
              variant='primary'
              onClick={() => setShowAll(!showAll)}
              className='bg-kapwa-bg-surface text-kapwa-text-brand hover:bg-kapwa-bg-surface-brand'
              rightIcon={
                <ChevronDown
                  className={`h-4 w-4 transition-transform duration-300 ${showAll ? 'rotate-180' : ''}`}
                />
              }
            >
              {showAll ? 'Show Less' : 'Show More'}
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
