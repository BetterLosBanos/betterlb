import { useMemo, useState } from 'react';

import { CHART_THEME, standardAxisProps } from '@/constants/charts';
import { ArrowUp, BarChart3, Target, TrendingUp, Trophy } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import {
  ChartTooltip,
  ResponsiveChart,
} from '@/components/data-display/ChartContainer';
import { DetailSection } from '@/components/layout/PageLayouts';
import { PageHero } from '@/components/layout/PageLayouts';

import { cn } from '@/lib/utils';

import cmciData from '@/data/statistics/cmci.json';

const PILLAR_COLORS: Record<string, string> = {
  Overall: '#0066eb',
  'Economic Dynamism': '#cc3e00',
  'Government Efficiency': '#059669',
  Infrastructure: '#4f46e5',
  Resiliency: '#d97706',
  Innovation: '#64748b',
};

// 1. Define the shape of the trend data to avoid 'any'
interface TrendPoint {
  year: number;
  Overall: number | null;
  [key: string]: number | null; // For the 5 pillars
}

export default function CompetitivenessPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'pillars'>('trends');
  const [selectedPillar, setSelectedPillar] = useState(
    cmciData.pillars[0].name
  );

  const latestIdx = cmciData.meta.years.length - 1;
  const latestYear = cmciData.meta.years[latestIdx];

  // 2. Strictly Typed Trend Logic
  const trendData = useMemo<TrendPoint[]>(() => {
    return cmciData.meta.years
      .map((year, idx) => {
        const dp: TrendPoint = {
          year,
          Overall: cmciData.overall_score[idx] ?? null,
        };
        cmciData.pillars.forEach(p => {
          dp[p.name] = p.scores[idx] ?? null;
        });
        return dp;
      })
      .filter(d => d.Overall !== null);
  }, []);

  // 3. Find current pillar safely
  const currentPillar = useMemo(
    () => cmciData.pillars.find(p => p.name === selectedPillar),
    [selectedPillar]
  );

  return (
    <>
      {/* PageHero - documented pattern for layout headers */}
      <PageHero
        title='Competitiveness'
        description='National evaluation of municipal progress across pillars of governance and development.'
      >
        <div className='flex flex-wrap gap-2 justify-center'>
          <Badge variant='primary' dot>
            CMCI {latestYear}
          </Badge>
          <Badge variant='slate'>DTI Standards</Badge>
        </div>
      </PageHero>

      {/* KPI Cards - using new StatCard component */}
      <div className='grid grid-cols-1 gap-4 items-stretch md:grid-cols-3 mb-kapwa-lg'>
        <StatCard
          label='Overall Score'
          value={cmciData.overall_score[latestIdx].toFixed(2)}
          subtext='CMCI Index'
          variant='primary'
        />
        <StatCard
          label='Official Rank'
          value='33'
          subtext='1st Class Municipality'
          variant='secondary'
        >
          <div className='flex items-center gap-0.5 rounded-full border border-kapwa-border-success bg-kapwa-bg-success-weak px-2 py-0.5 text-kapwa-text-success'>
            <ArrowUp className='w-3 h-3 stroke-3' />
            <span className='text-[10px] font-black uppercase'>Up</span>
          </div>
        </StatCard>
        <StatCard
          label='Pillars Tracked'
          value={cmciData.pillars.length}
          subtext='DTI Standards'
          variant='slate'
          icon={Trophy}
        />
      </div>

      {/* Tab Switcher */}
      <nav className='mb-kapwa-lg bg-kapwa-bg-hover flex gap-1.5 rounded-2xl p-1.5'>
        {(['trends', 'pillars'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'min-h-[48px] flex-1 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
              activeTab === tab
                ? 'text-kapwa-text-brand-bold bg-kapwa-bg-surface shadow-md'
                : 'hover:text-kapwa-text-support text-kapwa-text-strong0'
            )}
          >
            {tab === 'trends' ? (
              <TrendingUp className='inline mr-1 w-4 h-4' />
            ) : (
              <BarChart3 className='inline mr-1 w-4 h-4' />
            )}
            {tab}
          </button>
        ))}
      </nav>

      {/* Trends Chart wrapped in DetailSection */}
      {activeTab === 'trends' ? (
        <DetailSection title='Pillar Trends' icon={TrendingUp}>
          <ResponsiveChart height={384}>
            <LineChart
              data={trendData}
              margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
            >
              <CartesianGrid
                vertical={false}
                stroke={CHART_THEME.grid}
                strokeDasharray='3 3'
              />
              <XAxis dataKey='year' {...standardAxisProps} dy={10} />
              <YAxis {...standardAxisProps} />
              <Tooltip content={<ChartTooltip />} />
              <Legend
                verticalAlign='top'
                iconType='circle'
                wrapperStyle={{
                  paddingBottom: '20px',
                  fontSize: '10px',
                  fontWeight: 'bold',
                  textTransform: 'uppercase',
                }}
              />
              <Line
                type='monotone'
                dataKey='Overall'
                stroke={PILLAR_COLORS.Overall}
                strokeWidth={4}
                dot={{ r: 4 }}
                activeDot={{ r: 8 }}
              />
              {cmciData.pillars.map(p => (
                <Line
                  key={p.name}
                  type='monotone'
                  dataKey={p.name}
                  stroke={PILLAR_COLORS[p.name]}
                  strokeWidth={2}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveChart>
        </DetailSection>
      ) : (
        <div className='grid grid-cols-1 gap-8 lg:grid-cols-12'>
          <div className='space-y-3 lg:col-span-5'>
            {cmciData.pillars.map(p => (
              <button
                key={p.name}
                onClick={() => setSelectedPillar(p.name)}
                className={cn(
                  'flex min-h-[56px] w-full items-center justify-between rounded-2xl border p-4 text-left transition-all',
                  selectedPillar === p.name
                    ? 'bg-kapwa-bg-surface border-kapwa-border-brand shadow-sm'
                    : 'border-kapwa-border-weak bg-kapwa-bg-surface'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    selectedPillar === p.name
                      ? 'text-kapwa-text-brand-bold'
                      : 'text-kapwa-text-support'
                  )}
                >
                  {p.name}
                </span>
                <Badge variant='slate'>
                  {p.scores[latestIdx]?.toFixed(2) || '0.00'}
                </Badge>
              </button>
            ))}
          </div>
          <div className='lg:col-span-7'>
            <DetailSection
              title={`${selectedPillar} Indicators`}
              icon={Target}
              className='bg-kapwa-bg-surface/30'
            >
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {currentPillar?.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className='border-kapwa-border-weak bg-kapwa-bg-surface flex min-h-[100px] flex-col justify-between rounded-xl border p-4 shadow-xs'
                  >
                    <span className='text-kapwa-text-disabled text-[10px] leading-tight font-bold tracking-widest uppercase'>
                      {ind.name}
                    </span>
                    <span className='mt-2 text-xl font-black text-kapwa-text-strong'>
                      {ind.values[latestIdx]?.toFixed(4) || '0.0000'}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className='pt-10 space-y-4 text-center border-t border-kapwa-border-weak'>
        <div className='flex justify-center items-center mx-auto w-6 h-6 rounded-full bg-kapwa-bg-success-weak text-kapwa-text-success'>
          <svg
            className='w-4 h-4'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
            />
          </svg>
        </div>
        <div className='space-y-1'>
          <p className='text-kapwa-text-strong text-[10px] font-bold tracking-widest uppercase'>
            Verified Data Audit
          </p>
          <p className='text-kapwa-text-disabled text-[10px] font-bold tracking-widest uppercase'>
            Source:{' '}
            <a
              href='https://cmci.dti.gov.ph/data-portal.php'
              target='_blank'
              rel='noreferrer'
              className='underline hover:text-kapwa-text-brand'
            >
              {cmciData.meta.source}
            </a>
          </p>
        </div>
      </footer>
    </>
  );
}
