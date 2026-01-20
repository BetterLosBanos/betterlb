import { Outlet } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import BarangaysSidebar from './components/BarangaysSidebar';

export default function BarangaysPageLayout() {
  return (
    <SidebarLayout sidebar={<BarangaysSidebar />}>
      <Outlet />
    </SidebarLayout>
  );
}
