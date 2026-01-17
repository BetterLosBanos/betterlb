import { Outlet } from 'react-router-dom';

import GovernmentLayout from '@/components/layout/GovernmentLayout';

import BarangaysSidebar from './components/BarangaysSidebar';

export default function BarangaysPageLayout() {
  return (
    <GovernmentLayout sidebar={<BarangaysSidebar />}>
      <Outlet />
    </GovernmentLayout>
  );
}
