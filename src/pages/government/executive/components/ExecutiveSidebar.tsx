import { Link, useLocation } from 'react-router-dom'
import {
  Search,
  Building,
  UserCheck,
  MessageSquare,
  Briefcase,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import executiveData from '../../../../data/directory/executive.json'

interface Office {
  office: string
  address?: string
  trunkline?: string
  website?: string
  officials: any[]
  bureaus?: any[]
  attached_agency?: any[]
}

export default function ExecutiveSidebar() {
  const [searchTerm, setSearchTerm] = useState('')
  const location = useLocation()

  // Group offices by category
  const officeGroups = useMemo(() => {
    const offices = executiveData as Office[]

    const groups = {
      'office-of-the-president': {
        title: 'Office of the President',
        offices: offices.filter(
          (office) =>
            office.office.includes('OFFICE OF THE PRESIDENT')
        ),
      },
      'office-of-the-vice-president': {
        title: 'Office of the Vice President',
        offices: offices.filter(
          (office) => office.office.includes('OFFICE OF THE VICE PRESIDENT')
        ),
      },
      'presidential-communications-office': {
        title: 'Presidential Communications Offices',
        offices: offices.filter(
          (office) => office.office.toLowerCase().includes('communication')
        ),
      },
      'other-executive-offices': {
        title: 'Other Executive Offices',
        offices: offices.filter(
          (office) =>
            !office.office.includes('OFFICE OF THE PRESIDENT') &&
            !office.office.includes('OFFICE OF THE VICE PRESIDENT') &&
            !office.office.toLowerCase().includes('communication')
        ),
      },
    }

    return groups
  }, [])

  // Check if a path is active
  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <div className="sticky top-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search executive..."
            className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="border rounded-lg overflow-hidden bg-white">
          <div className="max-h-[calc(100vh-200px)] overflow-y-auto">
            <nav className="p-2 space-y-4 pt-4">
              <div>
                <h3 className="px-3 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                  Executive Categories
                </h3>
                <ul className="space-y-1">
                  <li>
                    <Link
                      to="/government/executive/office-of-the-president"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(
                          '/government/executive/office-of-the-president'
                        )
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Building className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>Office of the President</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/government/executive/office-of-the-vice-president"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(
                          '/government/executive/office-of-the-vice-president'
                        )
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <UserCheck className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>Office of the Vice President</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/government/executive/presidential-communications-office"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(
                          '/government/executive/presidential-communications-office'
                        )
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <MessageSquare className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>Presidential Communications Office</span>
                    </Link>
                  </li>
                  <li>
                    <Link
                      to="/government/executive/other-executive-offices"
                      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
                        isActive(
                          '/government/executive/other-executive-offices'
                        )
                          ? 'bg-primary-50 text-primary-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Briefcase className="h-4 w-4 mr-2 text-gray-400 flex-shrink-0" />
                      <span>Other Executive Offices</span>
                    </Link>
                  </li>
                </ul>
              </div>
            </nav>
          </div>
        </div>
      </div>
    </div>
  )
}
