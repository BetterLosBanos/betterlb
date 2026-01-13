// StatisticsIndex.tsx
import { Outlet } from 'react-router-dom';

export default function StatisticsIndex() {
  // This page acts as a default landing for /statistics
  // The actual content is controlled by the router
  return (
    <div className='space-y-6'>
      <Outlet />{' '}
      {/* Will render PopulationPage, CompetitivenessPage, or MunicipalIncomePage based on route */}
    </div>
  );
}
