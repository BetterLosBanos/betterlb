import { Outlet } from 'react-router-dom';

import GovernmentLayout from '@/components/layout/GovernmentLayout';

import ElectedOfficialsSidebar from './components/ElectedOfficialsSidebar';

export default function ElectedOfficialsLayout() {
  return (
    <GovernmentLayout sidebar={<ElectedOfficialsSidebar />}>
      <Outlet />
    </GovernmentLayout>
  );
}
