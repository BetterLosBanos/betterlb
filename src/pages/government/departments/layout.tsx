import { Outlet } from 'react-router-dom';

import GovernmentLayout from '@/components/layout/GovernmentLayout';

import DepartmentsSidebar from './components/DepartmentsSidebar';

export default function DepartmentsPageLayout() {
  return (
    <GovernmentLayout sidebar={<DepartmentsSidebar />}>
      <Outlet />
    </GovernmentLayout>
  );
}
