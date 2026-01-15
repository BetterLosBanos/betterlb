import { useMemo, useState } from 'react';

import { CHART_THEME, standardAxisProps } from '@/constants/charts';
import {
  ArrowUpRight,
  Info,
  LineChart as LineIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { ChartContainer, ChartTooltip } from '@/components/ui/ChartContainer';
import { StatsFooter, StatsHero, StatsKPICard } from '@/components/ui/StatsUI';

import { cn } from '@/lib/utils';

// Data Import
import populationData from '@/data/statistics/population.json';

// 14 Highly Distinct Colors (Top 3 mapped to Brand Primaries)
const BRGY_COLORS = [
  '#0066eb', // 1. Municipal Blue (Mayondon)
  '#cc3e00', // 2. Brand Orange (San Antonio)
  '#059669', // 3. Emerald Green (Batong Malake)
  '#7c3aed', // 4. Vivid Purple
  '#dc2626', // 5. Strong Red
  '#0891b2', // 6. Cyan/Teal
  '#db2777', // 7. Pink/Rose
  '#1e40af', // 8. Navy
  '#b45309', // 9. Amber/Brown
  '#4f46e5', // 10. Indigo
  '#0d9488', // 11. Dark Teal
  '#9333ea', // 12. Violet
  '#475569', // 13. Slate
  '#be123c', // 14. Crimson
];

// 1. DEFINED INTERFACES: Removes 'any' completely
interface BarangayPopulationPoint {
  year: number;
  [key: string]: number | null; // Allows dynamic barangay names as keys
}

export default function PopulationPage() {
  const [activeTab, setActiveTab] = useState<'municipality' | 'barangays'>(
    'municipality'
  );
  const { municipality, barangays, meta } = populationData;

  const latestMuni = municipality.history[municipality.history.length - 1];
  const growth = municipality.growthRates.find(
    r => r.period === '2020-2024'
  )?.rate;
  const sortedBarangaysForLine = useMemo(() => {
    return [...populationData.barangays].sort((a, b) => {
      const latestA = a.history[a.history.length - 1].population;
      const latestB = b.history[b.history.length - 1].population;
      return latestB - latestA;
    });
  }, []);

  // 1. PIVOT DATA: Combine all barangay histories into one array for the Multi-line chart
  const comparativeData = useMemo<BarangayPopulationPoint[]>(() => {
    const years = [2010, 2015, 2020, 2024];
    return years.map(year => {
      // Initialize with year, then type-safely add barangay counts
      const point: BarangayPopulationPoint = { year };
      barangays.forEach(b => {
        point[b.name] =
          b.history.find(h => h.year === year)?.population || null;
      });
      return point;
    });
  }, [barangays]);

  return (
    <div className='animate-in fade-in space-y-8 pb-20 duration-500'>
      <StatsHero
        title='Population Profile'
        description='Detailed demographic analysis tracking growth from the municipal level down to individual barangays.'
        badge={`Census ${latestMuni.year}`}
        icon={Users}
      />

      {/* KPI Cards */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <StatsKPICard
          label='Total Population'
          value={latestMuni.population.toLocaleString()}
          subtext='Actual Resident Count'
          variant='primary'
        >
          <div className='flex items-center gap-1 text-xs font-bold text-emerald-600'>
            <ArrowUpRight className='h-3 w-3' /> +{growth}%
          </div>
        </StatsKPICard>
        <StatsKPICard
          label='Growth Rate'
          value={`${growth}%`}
          subtext='Annual (2020-2024)'
          variant='secondary'
        />
        <StatsKPICard
          label='Admin Units'
          value={barangays.length}
          subtext='Official Barangays'
          variant='slate'
        />
      </div>

      {/* Unified Tab Switcher */}
      <div className='flex gap-1.5 rounded-2xl bg-slate-100 p-1.5'>
        <button
          onClick={() => setActiveTab('municipality')}
          className={cn(
            'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
            activeTab === 'municipality'
              ? 'text-primary-700 bg-white shadow-md'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <TrendingUp className='h-4 w-4' /> Municipal Growth
        </button>
        <button
          onClick={() => setActiveTab('barangays')}
          className={cn(
            'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
            activeTab === 'barangays'
              ? 'text-primary-700 bg-white shadow-md'
              : 'text-slate-500 hover:text-slate-700'
          )}
        >
          <LineIcon className='h-4 w-4' /> Barangay Comparison
        </button>
      </div>

      {/* Unified Chart Logic */}
      <ChartContainer
        title={
          activeTab === 'municipality'
            ? 'Total Municipal Growth'
            : 'Barangay Trends'
        }
        height={activeTab === 'barangays' ? 550 : 400} // Increase height for the complex legend
      >
        {activeTab === 'municipality' ? (
          <LineChart
            data={municipality.history}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={CHART_THEME.grid}
              strokeDasharray='3 3'
            />
            <XAxis dataKey='year' {...standardAxisProps} dy={10} />
            <YAxis
              {...standardAxisProps}
              tickFormatter={val => `${val / 1000}k`}
            />
            <Tooltip
              content={<ChartTooltip formatter={v => v.toLocaleString()} />}
            />
            <Line
              type='monotone'
              dataKey='population'
              name='Total Residents'
              stroke='var(--color-primary-600)'
              strokeWidth={5}
              dot={{
                fill: 'var(--color-primary-600)',
                r: 4,
                strokeWidth: 2,
                stroke: '#fff',
              }}
              activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }}
            />
          </LineChart>
        ) : (
          <LineChart
            data={comparativeData}
            margin={{ top: 10, right: 10, left: 0, bottom: 20 }}
          >
            <CartesianGrid
              vertical={false}
              stroke={CHART_THEME.grid}
              strokeDasharray='3 3'
            />
            <XAxis dataKey='year' {...standardAxisProps} dy={10} />
            <YAxis {...standardAxisProps} />
            <Tooltip
              content={<ChartTooltip formatter={v => v.toLocaleString()} />}
            />
            <Legend
              verticalAlign='top'
              iconType='circle'
              wrapperStyle={{
                paddingBottom: '30px',
                fontSize: '10px',
                fontWeight: 'bold',
                textTransform: 'uppercase',
                letterSpacing: '1px',
              }}
            />
            {sortedBarangaysForLine.map((b, i) => {
              const isTop3 = i < 3;

              return (
                <Line
                  key={b.id}
                  type='monotone'
                  dataKey={b.name}
                  // 0 = Blue, 1 = Orange, 2 = Emerald
                  stroke={BRGY_COLORS[i % BRGY_COLORS.length]}
                  // Make the top 3 lines bolder (Accessibility: emphasis)
                  strokeWidth={isTop3 ? 4 : 2}
                  // Only show dots on top 3 to reduce visual clutter on 14 lines
                  dot={
                    isTop3 ? { r: 4, strokeWidth: 2, stroke: '#555' } : false
                  }
                  activeDot={{ r: 8, strokeWidth: 4, stroke: '#fff' }}
                />
              );
            })}
          </LineChart>
        )}
      </ChartContainer>

      <div className='flex gap-4 rounded-2xl border border-slate-100 bg-slate-50 p-6 shadow-inner'>
        <Info className='text-primary-600 mt-0.5 h-5 w-5 shrink-0' />
        <div className='space-y-2'>
          <p className='text-xs font-bold tracking-widest text-slate-900 uppercase'>
            How to read this data
          </p>
          <p className='text-xs leading-relaxed text-slate-500 italic'>
            {activeTab === 'municipality'
              ? 'The municipal growth chart tracks long-term population expansion from 1960 to current estimates.'
              : 'The comparison chart allows you to track which barangays are experiencing the fastest urban growth relative to their 2010 baseline.'}
          </p>
        </div>
      </div>

      <StatsFooter source={meta.source} />
    </div>
  );
}
