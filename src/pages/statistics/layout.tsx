import { Outlet } from 'react-router-dom';

import { PageHeader, SectionBlock } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import StatisticsSidebar from './components/StatisticsSidebar';
import { lguLabels } from '@/lib/lguLabels';

export default function StatisticsLayout() {
  return (
    <div className='min-h-screen bg-kapwa-bg-surface'>
      <PageHeader
        variant='centered'
        title={`${lguLabels.adjective} Statistics`}
        description={`Data-driven insights into the population, economy, and performance of ${lguLabels.name}.`}
      />

      <SectionBlock>
        <SidebarLayout sidebar={<StatisticsSidebar />} collapsible={true}>
          <Outlet />
        </SidebarLayout>
      </SectionBlock>
    </div>
  );
}
