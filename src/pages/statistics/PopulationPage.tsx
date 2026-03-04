import { useMemo, useState } from 'react';

import { CHART_THEME, standardAxisProps } from '@/constants/charts';
import { Info, LineChart as LineIcon, TrendingUp, Users } from 'lucide-react';
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
    <>
      {/* PageHero - documented pattern for layout headers */}
      <PageHero
        title='Population Profile'
        description='Detailed demographic analysis tracking growth from the municipal level down to individual barangays.'
      >
        <div className='flex flex-wrap gap-2 justify-center'>
          <Badge variant='primary' dot>
            Census {latestMuni.year}
          </Badge>
          <Badge variant='slate'>{barangays.length} Barangays</Badge>
        </div>
      </PageHero>

      {/* KPI Cards - using new StatCard component */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3 mb-kapwa-lg'>
        <StatCard
          label='Total Population'
          value={latestMuni.population.toLocaleString()}
          subtext='Actual Resident Count'
          variant='primary'
          trend={{ value: growth || 0, positive: true }}
        />
        <StatCard
          label='Growth Rate'
          value={`${growth}%`}
          subtext='Annual (2020-2024)'
          variant='secondary'
        />
        <StatCard
          label='Admin Units'
          value={barangays.length}
          subtext='Official Barangays'
          variant='slate'
          icon={Users}
        />
      </div>

      {/* Unified Tab Switcher */}
      <div className='mb-kapwa-lg bg-kapwa-bg-hover flex gap-1.5 rounded-2xl p-1.5'>
        <button
          onClick={() => setActiveTab('municipality')}
          className={cn(
            'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
            activeTab === 'municipality'
              ? 'text-kapwa-text-brand-bold bg-kapwa-bg-surface shadow-md'
              : 'hover:text-kapwa-text-support text-kapwa-text-strong0'
          )}
        >
          <TrendingUp className='w-4 h-4' /> Municipal Growth
        </button>
        <button
          onClick={() => setActiveTab('barangays')}
          className={cn(
            'flex min-h-[48px] flex-1 items-center justify-center gap-2 rounded-xl py-3 text-xs font-bold tracking-widest uppercase transition-all',
            activeTab === 'barangays'
              ? 'text-kapwa-text-brand-bold bg-kapwa-bg-surface shadow-md'
              : 'hover:text-kapwa-text-support text-kapwa-text-strong0'
          )}
        >
          <LineIcon className='w-4 h-4' /> Barangay Comparison
        </button>
      </div>

      {/* Chart wrapped in DetailSection - documented pattern */}
      <DetailSection
        title={
          activeTab === 'municipality'
            ? 'Total Municipal Growth'
            : 'Barangay Trends'
        }
        icon={TrendingUp}
      >
        <ResponsiveChart height={activeTab === 'barangays' ? 550 : 400}>
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
                stroke='var(--color-kapwa-blue-600)'
                strokeWidth={5}
                dot={{
                  fill: 'var(--color-kapwa-blue-600)',
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
        </ResponsiveChart>
      </DetailSection>

      {/* Info box using DetailSection for consistency */}
      <DetailSection title='How to read this data' icon={Info}>
        <p className='text-xs italic leading-relaxed text-kapwa-text-disabled'>
          {activeTab === 'municipality'
            ? 'The municipal growth chart tracks long-term population expansion from 1960 to current estimates.'
            : 'The comparison chart allows you to track which barangays are experiencing the fastest urban growth relative to their 2010 baseline.'}
        </p>
      </DetailSection>

      {/* Footer using documented footer pattern */}
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
            Source: {meta.source}
          </p>
        </div>
      </footer>
    </>
  );
}
