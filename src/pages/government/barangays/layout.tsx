import { Outlet, useLocation } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import BarangaysSidebar from './components/BarangaysSidebar';

export default function BarangaysPageLayout() {
  const location = useLocation();

  // Logic: Collapse if not on the index
  const isDeepPage = location.pathname !== '/government/barangays';

  return (
    <SidebarLayout
      sidebar={<BarangaysSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
