import { Outlet } from 'react-router-dom';

import { PageHero } from '@/components/layout/PageLayouts';

import StatisticsSidebar from './components/StatisticsSidebar';

export default function StatisticsLayout() {
  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <PageHero
          title='Municipal Statistics'
          description='Data-driven insights into the population, economy, and performance of Los Baños.'
        />

        <div className='flex flex-col items-start gap-8 lg:flex-row'>
          <aside className='w-full shrink-0 lg:w-64'>
            <StatisticsSidebar />
          </aside>

          <main className='animate-in fade-in min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm duration-500 md:p-8'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
