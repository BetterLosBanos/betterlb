import { Outlet } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

import ElectedOfficialsSidebar from './components/ElectedOfficialsSidebar';

export default function ElectedOfficialsLayout() {
  return (
    <SidebarLayout sidebar={<ElectedOfficialsSidebar />}>
      <Outlet />
    </SidebarLayout>
  );
}
