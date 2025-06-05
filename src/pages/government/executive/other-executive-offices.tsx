import { useState, useMemo } from 'react'
import { Search, ExternalLink, MapPin, Phone, Mail } from 'lucide-react'
import executiveData from '../../../data/directory/executive.json'

interface Personnel {
  name: string
  role: string
  contact?: string
  email?: string
  other_office?: string
}

interface OfficeDivision {
  office_division: string
  personnel: Personnel[]
}

interface Official {
  name: string
  role: string
  email?: string
  contact?: string
}

interface Office {
  office: string
  address?: string
  trunkline?: string
  website?: string
  officials: (Official | OfficeDivision)[]
  bureaus?: any[]
  attached_agency?: any[]
}

export default function OtherExecutiveOfficesPage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter other executive offices
  const otherOffices = useMemo(() => {
    return (executiveData as Office[]).filter(
      (office) =>
        !office.office.includes('OFFICE OF THE PRESIDENT') &&
        !office.office.includes('OFFICE OF THE VICE PRESIDENT') &&
        !office.office.toLowerCase().includes('communication')
    )
  }, [])

  // Filter offices based on search term
  const filteredOffices = useMemo(() => {
    if (!searchTerm) return otherOffices

    return otherOffices.filter(
      (office) =>
        office.office.toLowerCase().includes(searchTerm.toLowerCase()) ||
        office.officials.some((official) => {
          if ('name' in official) {
            return (
              official.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              official.role.toLowerCase().includes(searchTerm.toLowerCase())
            )
          } else if ('office_division' in official) {
            return (
              official.office_division
                .toLowerCase()
                .includes(searchTerm.toLowerCase()) ||
              official.personnel.some(
                (person) =>
                  person.name
                    .toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                  person.role.toLowerCase().includes(searchTerm.toLowerCase())
              )
            )
          }
          return false
        })
    )
  }, [otherOffices, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Other Executive Offices
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredOffices.length} executive offices
          </p>
        </div>

        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search offices or officials..."
            className="pl-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredOffices.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No offices found
          </h3>
          <p className="text-gray-500">Try adjusting your search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredOffices.map((office, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <div className="border-b pb-3 mb-4">
                  <h3 className="font-bold text-gray-900 text-xl">
                    {office.office}
                  </h3>
                </div>

                <div className="space-y-2 text-sm mb-4">
                  {office.address && (
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-600">{office.address}</span>
                    </div>
                  )}

                  {office.trunkline && (
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <span className="text-gray-600">{office.trunkline}</span>
                    </div>
                  )}

                  {office.website && (
                    <div className="flex items-start">
                      <ExternalLink className="h-4 w-4 text-gray-400 mr-2 mt-0.5" />
                      <a
                        href={
                          office.website.startsWith('http')
                            ? office.website
                            : `https://${office.website.split(' ')[0]}`
                        }
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:underline"
                      >
                        {office.website.split(' ')[0]}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
