import { Outlet, useLocation } from 'react-router-dom';

import SidebarLayout from '@/components/layout/SidebarLayout';

// NEW IMPORT
import TransparencySidebar from './components/TransparencySidebar';

export default function TransparencyLayout() {
  const location = useLocation();
  // Collapse in child pages
  const isChildPage = location.pathname !== '/transparency';

  return (
    <SidebarLayout
      sidebar={<TransparencySidebar />}
      collapsible={true}
      defaultCollapsed={isChildPage}
    >
      <Outlet />
    </SidebarLayout>
  );
}
