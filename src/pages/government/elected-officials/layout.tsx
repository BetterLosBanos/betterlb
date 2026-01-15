import { Outlet } from 'react-router-dom';

import GovernmentPageContainer from '../GovernmentPageContainer';
import ElectedOfficialsSidebar from './components/ElectedOfficialsSidebar';

export default function ElectedOfficialsLayout() {
  return (
    <GovernmentPageContainer sidebar={<ElectedOfficialsSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
