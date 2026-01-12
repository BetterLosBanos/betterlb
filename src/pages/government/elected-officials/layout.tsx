import { Outlet } from 'react-router-dom';
import ElectedOfficialsSidebar from './components/ElectedOfficialsSidebar';
import GovernmentPageContainer from '../GovernmentPageContainer';

export default function ElectedOfficialsLayout() {
  return (
    <GovernmentPageContainer sidebar={<ElectedOfficialsSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
