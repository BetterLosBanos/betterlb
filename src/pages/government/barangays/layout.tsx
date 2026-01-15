import { Outlet } from 'react-router-dom';

import GovernmentPageContainer from '../GovernmentPageContainer';
import BarangaysSidebar from './components/BarangaysSidebar';

export default function BarangaysPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<BarangaysSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
