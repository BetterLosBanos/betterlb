import { Outlet, useLocation } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import DepartmentsSidebar from './components/DepartmentsSidebar';

export default function DepartmentsPageLayout() {
  const location = useLocation();

  // Logic: Collapse if not on the index
  const isDeepPage = location.pathname !== '/government/departments';

  return (
    <SidebarLayout
      sidebar={<DepartmentsSidebar />}
      collapsible={true}
      defaultCollapsed={isDeepPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
