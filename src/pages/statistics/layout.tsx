import { Outlet } from 'react-router-dom';
import StatisticsSidebar from './components/StatisticsSidebar';
import { PageHero } from '@/components/layout/PageLayouts';

export default function StatisticsLayout() {
  return (
    <div className='bg-slate-50 min-h-screen'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <PageHero
          title='Municipal Statistics'
          description='Data-driven insights into the population, economy, and performance of Los Baños.'
        />

        <div className='flex flex-col lg:flex-row gap-8 items-start'>
          <aside className='w-full lg:w-64 shrink-0'>
            <StatisticsSidebar />
          </aside>

          <main className='flex-1 min-w-0 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 animate-in fade-in duration-500'>
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
