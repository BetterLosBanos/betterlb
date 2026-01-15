import { useState } from 'react';

import {
  ArrowUpRight,
  PieChart as PieChartIcon,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { Badge } from '@/components/ui/Badge';

import populationData from '@/data/statistics/population.json';

export default function PopulationPage() {
  const [activeTab, setActiveTab] = useState<'trends' | 'distribution'>(
    'trends'
  );

  // Data extraction
  const history = populationData.municipality.history;
  const latestPop = history[history.length - 1].population;
  const growthRate = populationData.municipality.growthRates.find(
    r => r.period === '2020-2024'
  )?.rate;
  const barangayPop = populationData.barangays
    .map(b => ({
      name: b.name,
      population: b.history[b.history.length - 1].population,
    }))
    .sort((a, b) => b.population - a.population);

  const formatNumber = (num: number) =>
    new Intl.NumberFormat('en-US').format(num);

  return (
    <div className='space-y-8'>
      {/* 1. Statistics Hero Header */}
      <div className='relative overflow-hidden rounded-2xl bg-slate-900 p-8 text-white'>
        <div className='relative z-10 space-y-2'>
          <Badge variant='primary' dot>
            Census Data{' '}
            {
              populationData.municipality.history[
                populationData.municipality.history.length - 1
              ].year
            }
          </Badge>
          <h2 className='text-3xl font-extrabold tracking-tight'>
            Population Profile
          </h2>
          <p className='max-w-xl text-sm text-slate-400'>
            Analysis of demographic trends and distribution across the
            municipality.
          </p>
        </div>
        <Users className='absolute right-[-20px] bottom-[-20px] h-48 w-48 -rotate-12 text-white/5' />
      </div>

      {/* 2. KPI Cards - Blue & Orange Theme */}
      <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
        <div className='border-primary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Total Population
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatNumber(latestPop)}
          </div>
          <div className='flex items-center gap-1 text-xs font-bold text-emerald-600'>
            <ArrowUpRight className='h-3 w-3' />{' '}
            <span>+{growthRate}% growth</span>
          </div>
        </div>
        <div className='border-secondary-600 space-y-2 rounded-2xl border-b-4 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Growth Rate
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {growthRate}%
          </div>
          <p className='text-xs font-medium text-slate-400'>
            Average Annual Rate (2020-2024)
          </p>
        </div>
        <div className='space-y-2 rounded-2xl border-b-4 border-slate-900 bg-white p-6 shadow-sm'>
          <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
            Total Barangays
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {populationData.barangays.length}
          </div>
          <p className='text-xs font-medium text-slate-400'>
            Official Administrative Units
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs (High Contrast) */}
      <div className='flex gap-1 rounded-xl bg-slate-100 p-1'>
        {(['trends', 'distribution'] as const).map(tab => (
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
              <PieChartIcon className='mr-2 inline h-3 w-3' />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Chart Section */}
      <div className='rounded-2xl border border-slate-100 bg-slate-50 p-6'>
        <div className='h-[400px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            {activeTab === 'trends' ? (
              <LineChart data={history}>
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
                  tickFormatter={val => `${val / 1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
                  }}
                />
                <Line
                  type='monotone'
                  dataKey='population'
                  stroke='#0066eb'
                  strokeWidth={4}
                  dot={{ fill: '#0066eb', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            ) : (
              <BarChart
                data={barangayPop}
                layout='vertical'
                margin={{ left: 40 }}
              >
                <CartesianGrid
                  strokeDasharray='3 3'
                  horizontal={false}
                  stroke='#e2e8f0'
                />
                <XAxis type='number' hide />
                <YAxis
                  dataKey='name'
                  type='category'
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fontWeight: 700 }}
                  width={100}
                />
                <Tooltip />
                <Bar
                  dataKey='population'
                  fill='#0066eb'
                  radius={[0, 4, 4, 0]}
                  barSize={20}
                >
                  {barangayPop.map((_, index) => (
                    <Cell
                      key={index}
                      fill={index < 3 ? '#0066eb' : '#cbd5e1'}
                    />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <p className='text-center text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
        Source: {populationData.meta.source} (
        {populationData.meta.location.municipality})
      </p>
    </div>
  );
}
