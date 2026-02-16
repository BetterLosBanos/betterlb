import { Outlet } from 'react-router-dom';

import { PageHero } from '@/components/layout/PageLayouts';
import SidebarLayout from '@/components/layout/SidebarLayout';

import StatisticsSidebar from './components/StatisticsSidebar';

export default function StatisticsLayout() {
  return (
    <div className='bg-kapwa-bg-surface-raised min-h-screen'>
      <div className='container mx-auto px-4 py-8 md:py-12'>
        <PageHero
          title='Municipal Statistics'
          description='Data-driven insights into the population, economy, and performance of Los Baños.'
        />

        <SidebarLayout sidebar={<StatisticsSidebar />} collapsible={true}>
          <Outlet />
        </SidebarLayout>
      </div>
    </div>
  );
}
