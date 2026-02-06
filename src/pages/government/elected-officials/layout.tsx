import { Outlet, useLocation } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import ElectedOfficialsSidebar from './components/ElectedOfficialsSidebar';

export default function ElectedOfficialsLayout() {
  const location = useLocation();

  // Logic: Collapse if not on the main index
  const isDeepPage = location.pathname !== '/government/elected-officials';

  return (
    <SidebarLayout
      sidebar={<ElectedOfficialsSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
