import { useMemo, useState } from 'react';

import {
  ArrowDown,
  ArrowUp,
  ArrowUpRight,
  Award,
  BarChart3,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/Badge';

import { cn } from '@/lib/utils';

// Data Import
import cmciData from '@/data/statistics/cmci.json';

// Pillar Color Mapping for the Multi-line Chart
const PILLAR_COLORS: Record<string, string> = {
  Overall: '#0066eb', // Primary Blue
  'Economic Dynamism': '#cc3e00', // Secondary Orange
  'Government Efficiency': '#059669', // Emerald
  Infrastructure: '#4f46e5', // Indigo
  Resiliency: '#d97706', // Amber
  Innovation: '#64748b', // Slate
};

export default function CompetitivenessPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'pillars'>('trends');
  const [selectedPillarName, setSelectedPillarName] = useState(
    cmciData.pillars[0].name
  );

  const latestIdx = cmciData.meta.years.length - 1;
  const prevIdx = latestIdx - 1;
  const latestYear = cmciData.meta.years[latestIdx];

  // 1. Overall KPI Calculations
  const latestScore = cmciData.overall_score[latestIdx];
  const prevScore = cmciData.overall_score[prevIdx] ?? latestScore;
  const scoreDiff =
    prevScore === 0 ? 0 : ((latestScore - prevScore) / prevScore) * 100;

  // 2. Multi-line Trend Data (Overall + 5 Pillars)
  const trendData = useMemo(() => {
    return cmciData.meta.years
      .map((year, idx) => {
        const dataPoint: Record<string, number | null> = { year };
        // Add Overall Score
        dataPoint['Overall'] =
          cmciData.overall_score[idx] === 0
            ? null
            : cmciData.overall_score[idx];
        // Add each pillar's score
        cmciData.pillars.forEach(pillar => {
          dataPoint[pillar.name] =
            pillar.scores[idx] === 0 ? null : pillar.scores[idx];
        });
        return dataPoint;
      })
      .filter(d => d.Overall !== null);
  }, []);

  // 3. Pillar Summary with YoY Trends
  const pillarPerformance = useMemo(() => {
    return cmciData.pillars.map(p => {
      const current = p.scores[latestIdx] ?? 0;
      const previous = p.scores[prevIdx] ?? current;
      const diff = current - previous;
      const pct = previous === 0 ? 0 : (diff / previous) * 100;

      return {
        name: p.name,
        score: current,
        changePct: pct,
        trend: diff > 0 ? 'up' : diff < 0 ? 'down' : 'stable',
        indicators: p.indicators,
      };
    });
  }, [latestIdx, prevIdx]);

  const activePillar = pillarPerformance.find(
    p => p.name === selectedPillarName
  );

  if (!cmciData.meta.years.length) {
    return (
      <div className='p-12 text-center text-slate-500'>No data available.</div>
    );
  }

  return (
    <div className='space-y-8'>
      {/* Hero Header */}
      <div className='relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white'>
        <div className='relative z-10 space-y-2'>
          <Badge variant='primary' dot>
            CMCI Index {latestYear}
          </Badge>
          <h2 className='text-3xl font-extrabold tracking-tight'>
            Competitiveness
          </h2>
          <p className='max-w-xl text-sm text-slate-400'>
            National evaluation of the municipality&apos;s progress across
            pillars of governance, resiliency, and innovation.
          </p>
        </div>
        <Award className='absolute right-[-20px] bottom-[-20px] h-48 w-48 -rotate-12 text-white/5' />
      </div>

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='border-primary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Overall Score
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {latestScore.toFixed(2)}
          </div>
          <div className='flex items-center gap-1 text-xs font-bold text-emerald-600'>
            {scoreDiff > 0 ? (
              <ArrowUpRight className='h-3 w-3' />
            ) : (
              <ArrowDown className='h-3 w-3' />
            )}
            <span>
              {scoreDiff > 0 ? '+' : ''}
              {Math.abs(scoreDiff).toFixed(1)}% vs previous year
            </span>
          </div>
        </div>

        <div className='border-secondary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Official Rank
          </p>
          <div className='flex items-center gap-1 text-3xl font-black text-slate-900'>
            33
            <ArrowUp className='h-4 w-4 text-emerald-600' />
          </div>
          <p className='text-xs font-medium text-slate-400'>
            1st Class Municipality
          </p>
        </div>

        <div className='space-y-2 rounded-2xl border-b-4 border-slate-900 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Pillars Tracked
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {cmciData.pillars.length}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            DTI Standard Index
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className='flex gap-1 rounded-xl bg-slate-100 p-1'>
        {(['trends', 'pillars'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`min-h-[44px] flex-1 rounded-lg py-2 text-xs font-bold tracking-widest uppercase transition-all ${
              activeTab === tab
                ? 'text-primary-700 bg-white shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'trends' ? (
              <TrendingUp className='mr-2 inline h-3 w-3' />
            ) : (
              <BarChart3 className='mr-2 inline h-3 w-3' />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* Chart Section */}
      <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
        {activeTab === 'trends' ? (
          <div className='h-[400px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <LineChart
                data={trendData}
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  vertical={false}
                  stroke='#e2e8f0'
                />
                <XAxis
                  dataKey='year'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Legend
                  verticalAlign='top'
                  iconType='circle'
                  wrapperStyle={{
                    paddingBottom: '20px',
                    fontSize: '10px',
                    fontWeight: 'bold',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                  }}
                />

                {/* Render Overall Line first (Thickest) */}
                <Line
                  type='monotone'
                  dataKey='Overall'
                  stroke={PILLAR_COLORS['Overall']}
                  strokeWidth={4}
                  dot={{ fill: PILLAR_COLORS['Overall'], r: 4 }}
                  activeDot={{ r: 6 }}
                />

                {/* Dynamically render all pillar lines */}
                {cmciData.pillars.map(p => (
                  <Line
                    key={p.name}
                    type='monotone'
                    dataKey={p.name}
                    stroke={PILLAR_COLORS[p.name] || '#cbd5e1'}
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray={p.name === 'Innovation' ? '5 5' : '0'}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 lg:grid-cols-12'>
            {/* Left: Pillar Selection */}
            <div className='space-y-3 lg:col-span-5'>
              <h3 className='mb-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                Pillar Performance Summary
              </h3>
              {pillarPerformance.map(pillar => (
                <button
                  key={pillar.name}
                  onClick={() => setSelectedPillarName(pillar.name)}
                  className={cn(
                    'group flex min-h-[56px] w-full items-center justify-between rounded-2xl border p-4 text-left transition-all',
                    selectedPillarName === pillar.name
                      ? 'bg-primary-50 border-primary-200 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  )}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={cn(
                        'rounded-xl p-2 transition-colors',
                        selectedPillarName === pillar.name
                          ? 'bg-primary-600 text-white'
                          : 'bg-slate-50 text-slate-400'
                      )}
                    >
                      <Target className='h-4 w-4' />
                    </div>
                    <div>
                      <p
                        className={cn(
                          'text-sm font-bold',
                          selectedPillarName === pillar.name
                            ? 'text-primary-900'
                            : 'text-slate-700'
                        )}
                      >
                        {pillar.name}
                      </p>
                      <p className='mt-0.5 text-[10px] font-bold text-slate-400 uppercase'>
                        Score: {pillar.score.toFixed(2)}
                      </p>
                    </div>
                  </div>
                  <div
                    className={cn(
                      'flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-black',
                      pillar.trend === 'up'
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-orange-50 text-orange-700'
                    )}
                  >
                    {pillar.trend === 'up' ? (
                      <ArrowUp className='h-3 w-3' />
                    ) : (
                      <ArrowDown className='h-3 w-3' />
                    )}
                    {Math.abs(pillar.changePct).toFixed(1)}%
                  </div>
                </button>
              ))}
            </div>

            {/* Right: Indicators Breakdown */}
            <div className='lg:col-span-7'>
              <h3 className='mb-4 text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                {selectedPillarName} - Indicators
              </h3>
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {activePillar?.indicators.map((indicator, idx) => {
                  const current = indicator.values[latestIdx] ?? 0;
                  const prev = indicator.values[prevIdx] ?? current;
                  const diff = current - prev;
                  const pct = prev === 0 ? 0 : (diff / prev) * 100;

                  return (
                    <div
                      key={idx}
                      className='flex flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs'
                    >
                      <span className='mb-3 text-[10px] leading-tight font-bold tracking-widest text-slate-400 uppercase'>
                        {indicator.name}
                      </span>
                      <div className='flex items-end justify-between'>
                        <span className='text-xl font-black text-slate-900'>
                          {current.toFixed(4)}
                        </span>
                        <div
                          className={cn(
                            'flex items-center gap-0.5 rounded border px-1.5 py-0.5 text-[9px] font-black',
                            diff > 0
                              ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                              : 'border-orange-100 bg-orange-50 text-orange-700'
                          )}
                        >
                          {diff > 0 ? (
                            <ArrowUp className='h-2.5 w-2.5' />
                          ) : (
                            <ArrowDown className='h-2.5 w-2.5' />
                          )}
                          {Math.abs(pct).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <p className='text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
        Source:{' '}
        <a
          href='https://cmci.dti.gov.ph/data-portal.php'
          target='_blank'
          rel='noopener noreferrer'
          className='hover:text-primary-600 underline'
        >
          DTI Data Portal
        </a>
      </p>
    </div>
  );
}
