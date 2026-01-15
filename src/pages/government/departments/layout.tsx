import { Outlet } from 'react-router-dom';

import GovernmentPageContainer from '../GovernmentPageContainer';
import DepartmentsSidebar from './components/DepartmentsSidebar';

export default function DepartmentsPageLayout() {
  return (
    <GovernmentPageContainer sidebar={<DepartmentsSidebar />}>
      <Outlet />
    </GovernmentPageContainer>
  );
}
