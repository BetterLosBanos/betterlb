import { Outlet } from 'react-router-dom'
import DepartmentsSidebar from './components/DepartmentsSidebar'

export default function DepartmentsPageLayout() {
  return (
    <div className="flex flex-col md:flex-row gap-6 h-full">
      {/* Sidebar */}
      <DepartmentsSidebar />

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  )
}
