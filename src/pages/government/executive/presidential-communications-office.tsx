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

export default function PresidentialCommunicationsOfficePage() {
  const [searchTerm, setSearchTerm] = useState('')

  // Find all communications-related offices
  const communicationsOffices = useMemo(() => {
    return (executiveData as Office[]).filter((office) =>
      office.office.toLowerCase().includes('communication')
    )
  }, [])

  // Filter offices based on search term
  const filteredOffices = useMemo(() => {
    if (!searchTerm) return communicationsOffices

    return communicationsOffices.filter(
      (office) =>
        office.office.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (office.officials &&
          office.officials.some((official) => {
            if ('name' in official) {
              return (
                official.name
                  .toLowerCase()
                  .includes(searchTerm.toLowerCase()) ||
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
          }))
    )
  }, [communicationsOffices, searchTerm])

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Presidential Communications Offices
          </h1>
          <p className="text-gray-500 mt-1">
            {filteredOffices.length} communications-related offices
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
        <div className="space-y-8">
          {filteredOffices.map((office, index) => (
            <div
              key={index}
              className="bg-white rounded-lg border overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-5">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  {office.office}
                </h2>

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

                {/* Display key officials */}
                <div className="mt-4">
                  {/* Acting Secretary card */}
                  {office.officials &&
                    office.officials.find(
                      (official) =>
                        'name' in official &&
                        (official.role.includes('Secretary') ||
                          official.role.includes('Acting Secretary'))
                    ) && (
                      <div className="bg-white rounded-lg border overflow-hidden shadow-md mb-6">
                        <div className="p-5">
                          {office.officials
                            .filter(
                              (official) =>
                                'name' in official &&
                                (official.role.includes('Secretary') ||
                                  official.role.includes('Acting Secretary'))
                            )
                            .map((official, index) => {
                              if (!('name' in official)) return null
                              return (
                                <div
                                  key={index}
                                  className="flex flex-col items-center text-center"
                                >
                                  <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                    <span className="text-3xl font-bold text-gray-400">
                                      {official.name.charAt(0)}
                                    </span>
                                  </div>
                                  <h3 className="text-xl font-bold text-gray-900">
                                    {official.name}
                                  </h3>
                                  <p className="text-primary-600 font-medium">
                                    {official.role}
                                  </p>
                                  {official.contact && (
                                    <div className="flex items-center mt-2">
                                      <Phone className="h-4 w-4 text-gray-400 mr-1" />
                                      <span className="text-sm text-gray-600">
                                        {official.contact}
                                      </span>
                                    </div>
                                  )}
                                  {official.email && (
                                    <div className="flex items-center mt-1">
                                      <Mail className="h-4 w-4 text-gray-400 mr-1" />
                                      <a
                                        href={`mailto:${official.email}`}
                                        className="text-sm text-primary-600 hover:underline"
                                      >
                                        {official.email}
                                      </a>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                        </div>
                      </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Office divisions */}

                  {office.officials &&
                    office.officials
                      .filter((item) => 'office_division' in item)
                      .map((division, idx) => {
                        if (!('office_division' in division)) return null
                        return (
                          <div key={idx} className="border rounded-md p-3">
                            <h5 className="font-medium text-gray-900 mb-2 pb-1 border-b">
                              {division.office_division}
                            </h5>

                            <div className="space-y-3">
                              {division.personnel.map((person, personIdx) => (
                                <div
                                  key={personIdx}
                                  className="border-b border-gray-100 pb-2 last:border-0"
                                >
                                  <p className="font-medium text-gray-800 text-sm">
                                    {person.name}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    {person.role}
                                  </p>

                                  <div className="mt-1 space-y-1">
                                    {person.contact && (
                                      <div className="flex items-center">
                                        <Phone className="h-3 w-3 text-gray-400 mr-1" />
                                        <span className="text-xs text-gray-600">
                                          {person.contact}
                                        </span>
                                      </div>
                                    )}

                                    {person.email && (
                                      <div className="flex items-center">
                                        <Mail className="h-3 w-3 text-gray-400 mr-1" />
                                        <a
                                          href={`mailto:${person.email}`}
                                          className="text-xs text-primary-600 hover:underline"
                                        >
                                          {person.email}
                                        </a>
                                      </div>
                                    )}

                                    {person.other_office && (
                                      <div className="mt-1">
                                        <span className="text-xs text-gray-500 italic">
                                          {person.other_office}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )
                      })}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
