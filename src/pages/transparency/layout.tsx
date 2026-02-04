import { Outlet, useLocation } from 'react-router-dom';

import { ModuleHeader, PageHero } from '@/components/layout/PageLayouts';
import SidebarLayout from '@/components/layout/SidebarLayout';

import TransparencySidebar from './components/TransparencySidebar';

export default function TransparencyLayout() {
  const location = useLocation();
  const isIndexPage = location.pathname === '/transparency';

  return (
    <SidebarLayout
      sidebar={<TransparencySidebar />}
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      headerNode={
        isIndexPage ? (
          <PageHero
            title='Transparency Portal'
            description='A community-led initiative to make Los Baños public data accessible, readable, and verifiable for every citizen.'
          />
        ) : (
          <ModuleHeader
            title='Transparency Portal'
            description='Track municipal funds, infrastructure projects, and procurement records.'
          />
        )
      }
    >
      <Outlet />
    </SidebarLayout>
  );
}
