import { Outlet } from 'react-router-dom';

import {
  PageHeader,
  SectionAlternator,
  SectionBlock,
} from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import StatisticsSidebar from './components/StatisticsSidebar';

export default function StatisticsLayout() {
  return (
    <div className='bg-kapwa-bg-surface min-h-screen'>
      <PageHeader
        variant='centered'
        title='Municipal Statistics'
        description='Data-driven insights into the population, economy, and performance of Los Baños.'
      />

      <SectionAlternator>
        <SectionBlock>
          <SidebarLayout sidebar={<StatisticsSidebar />} collapsible={true}>
            <Outlet />
          </SidebarLayout>
        </SectionBlock>
      </SectionAlternator>
    </div>
  );
}
