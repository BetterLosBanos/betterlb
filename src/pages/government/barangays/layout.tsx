import { Outlet } from 'react-router-dom';
import BarangaysSidebar from './components/BarangaysSidebar';
import GovernmentPageContainer from '../GovernmentPageContainer';

export default function BarangaysPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<BarangaysSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
