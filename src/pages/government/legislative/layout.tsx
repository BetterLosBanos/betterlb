import { Outlet } from 'react-router-dom'
import LegislativeSidebar from './components/LegislativeSidebar'

export default function LegislativePageLayout() {
  return (
    <div className="container py-6 md:py-10">
      <div className="flex flex-col md:flex-row gap-6">
        <LegislativeSidebar />
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
