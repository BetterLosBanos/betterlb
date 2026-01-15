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

import { DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';
import { ChartContainer, ChartTooltip } from '@/components/ui/ChartContainer';
import { StatsFooter, StatsHero, StatsKPICard } from '@/components/ui/StatsUI';

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
          Overall: cmciData.overall_score[idx] || null,
        };
        cmciData.pillars.forEach(p => {
          dp[p.name] = p.scores[idx] || null;
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
    <div className='animate-in fade-in space-y-8 duration-500'>
      <StatsHero
        title='Competitiveness'
        description='National evaluation of municipal progress across pillars of governance and development.'
        badge={`CMCI ${latestYear}`}
        icon={Trophy}
      />

      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatsKPICard
          label='Overall Score'
          value={cmciData.overall_score[latestIdx].toFixed(2)}
          subtext='CMCI Index'
          variant='primary'
        />
        <StatsKPICard
          label='Official Rank'
          value='33'
          subtext='1st Class Municipality'
          variant='secondary'
        >
          <div className='flex items-center gap-0.5 rounded-full border border-emerald-100 bg-emerald-50 px-2 py-0.5 text-emerald-600'>
            <ArrowUp className='h-3 w-3 stroke-[3]' />
            <span className='text-[10px] font-black uppercase'>Up</span>
          </div>
        </StatsKPICard>
        <StatsKPICard
          label='Pillars Tracked'
          value={cmciData.pillars.length}
          subtext='DTI Standards'
          variant='slate'
        />
      </div>

      <nav className='flex gap-1.5 rounded-2xl bg-slate-100 p-1.5'>
        {(['trends', 'pillars'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'min-h-[48px] flex-1 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
              activeTab === tab
                ? 'text-primary-700 bg-white shadow-md'
                : 'text-slate-500 hover:text-slate-700'
            )}
          >
            {tab === 'trends' ? (
              <TrendingUp className='mr-1 inline h-4 w-4' />
            ) : (
              <BarChart3 className='mr-1 inline h-4 w-4' />
            )}
            {tab}
          </button>
        ))}
      </nav>

      {activeTab === 'trends' ? (
        <ChartContainer title='Pillar Trends'>
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
        </ChartContainer>
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
                    ? 'bg-primary-50 border-primary-200 shadow-sm'
                    : 'border-slate-200 bg-white'
                )}
              >
                <span
                  className={cn(
                    'text-sm font-bold',
                    selectedPillar === p.name
                      ? 'text-primary-900'
                      : 'text-slate-700'
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
              className='bg-slate-50/30'
            >
              <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
                {currentPillar?.indicators.map((ind, idx) => (
                  <div
                    key={idx}
                    className='flex min-h-[100px] flex-col justify-between rounded-xl border border-slate-100 bg-white p-4 shadow-xs'
                  >
                    <span className='text-[10px] leading-tight font-bold tracking-widest text-slate-500 uppercase'>
                      {ind.name}
                    </span>
                    <span className='mt-2 text-xl font-black text-slate-900'>
                      {ind.values[latestIdx]?.toFixed(4) || '0.0000'}
                    </span>
                  </div>
                ))}
              </div>
            </DetailSection>
          </div>
        </div>
      )}
      <StatsFooter
        source={cmciData.meta.source}
        sourceUrl='https://cmci.dti.gov.ph/data-portal.php'
      />
    </div>
  );
}
