import { Outlet } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import DepartmentsSidebar from './components/DepartmentsSidebar';

export default function DepartmentsPageLayout() {
  return (
    <SidebarLayout sidebar={<DepartmentsSidebar />}>
      <Outlet />
    </SidebarLayout>
  );
}
