import { Outlet, useLocation } from 'react-router-dom';

import { PageHeader } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

import TransparencySidebar from './components/TransparencySidebar';

export default function TransparencyLayout() {
  const location = useLocation();
  const isIndexPage = location.pathname === '/transparency';

  return (
    <SidebarLayout
      sidebar={<TransparencySidebar />}
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // Unified header using PageHeader component
      headerNode={
        isIndexPage ? (
          <PageHeader
            variant='centered'
            title='Transparency Portal'
            description='A community-led initiative to make Los Baños public data accessible, readable, and verifiable for every citizen.'
          />
        ) : (
          <PageHeader
            variant='compact'
            title='Transparency Portal'
            description='Track municipal funds, infrastructure projects, and procurement records.'
            autoBreadcrumbs={true}
          />
        )
      }
    >
      <Outlet />
    </SidebarLayout>
  );
}
