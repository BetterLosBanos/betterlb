import { useState } from 'react';
import {
  TrendingUp,
  PieChart as PieChartIcon,
  ArrowUpRight,
  Users,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
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
      <div className='p-8 rounded-2xl bg-slate-900 text-white relative overflow-hidden'>
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
          <p className='text-slate-400 text-sm max-w-xl'>
            Analysis of demographic trends and distribution across the
            municipality.
          </p>
        </div>
        <Users className='absolute right-[-20px] bottom-[-20px] w-48 h-48 text-white/5 -rotate-12' />
      </div>

      {/* 2. KPI Cards - Blue & Orange Theme */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <div className='bg-white border-b-4 border-primary-600 p-6 rounded-2xl shadow-sm space-y-2'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Total Population
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {formatNumber(latestPop)}
          </div>
          <div className='flex items-center gap-1 text-emerald-600 font-bold text-xs'>
            <ArrowUpRight className='w-3 h-3' />{' '}
            <span>+{growthRate}% growth</span>
          </div>
        </div>
        <div className='bg-white border-b-4 border-secondary-600 p-6 rounded-2xl shadow-sm space-y-2'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Growth Rate
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {growthRate}%
          </div>
          <p className='text-xs text-slate-400 font-medium'>
            Average Annual Rate (2020-2024)
          </p>
        </div>
        <div className='bg-white border-b-4 border-slate-900 p-6 rounded-2xl shadow-sm space-y-2'>
          <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
            Total Barangays
          </p>
          <div className='text-3xl font-black text-slate-900'>
            {populationData.barangays.length}
          </div>
          <p className='text-xs text-slate-400 font-medium'>
            Official Administrative Units
          </p>
        </div>
      </div>

      {/* 3. Navigation Tabs (High Contrast) */}
      <div className='flex p-1 bg-slate-100 rounded-xl gap-1'>
        {(['trends', 'distribution'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all min-h-[44px] ${
              activeTab === tab
                ? 'bg-white text-primary-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab === 'trends' ? (
              <TrendingUp className='w-3 h-3 inline mr-2' />
            ) : (
              <PieChartIcon className='w-3 h-3 inline mr-2' />
            )}
            {tab}
          </button>
        ))}
      </div>

      {/* 4. Chart Section */}
      <div className='bg-slate-50 border border-slate-100 rounded-2xl p-6'>
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

      <p className='text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
        Source: {populationData.meta.source} (
        {populationData.meta.location.municipality})
      </p>
    </div>
  );
}
