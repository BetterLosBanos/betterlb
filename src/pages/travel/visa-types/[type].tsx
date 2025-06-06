import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  ExternalLink,
  FileText,
  AlertCircle,
  Globe,
} from 'lucide-react'
import visaData from '../../../data/visa/philippines_visa_types.json'
import { VisaType } from '../../../types/visa'
import Button from '../../../components/ui/Button'

interface VisaTypeDetailParams {
  type: string
}

const VisaTypeDetail: React.FC = () => {
  const { type } = useParams<VisaTypeDetailParams>()
  const [visa, setVisa] = useState<VisaType | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    
    try {
      // Flatten all visa types from all categories to find the requested visa
      const allVisaTypes = visaData.categories.flatMap(category => category.visaTypes)
      
      // Find the visa by ID
      const foundVisa = allVisaTypes.find(v => v.id === type)
      
      if (foundVisa) {
        setVisa(foundVisa)
        setError(null)
      } else {
        setError(`Visa type "${type}" not found`)
      }
    } catch (err) {
      setError('Failed to load visa information')
      console.error('Error loading visa data:', err)
    } finally {
      setLoading(false)
    }
  }, [type])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading visa information...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto max-w-4xl px-4">
          <Link
            to="/travel/visa-types"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Visa Types
          </Link>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h2 className="text-xl font-semibold">Error</h2>
            </div>
            <p className="text-gray-700">{error}</p>
            <Link
              to="/travel/visa-types"
              className="mt-6 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Return to Visa Types
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!visa) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto max-w-4xl px-4">
        <Link
          to="/travel/visa-types"
          className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Visa Types
        </Link>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">
              {visa.name}
            </h1>
            <p className="text-lg text-gray-600 mb-6">{visa.description}</p>

            {/* Official Information */}
            {visa.url && (
              <div className="mb-8">
                <Button
                  variant="outline"
                  size="sm"
                  as="a"
                  href={visa.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center"
                >
                  <Globe className="h-4 w-4 mr-2" />
                  Official Information
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </div>
            )}

            {/* Minimum Requirements */}
            {visa.minimumRequirements && visa.minimumRequirements.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Minimum Requirements
                </h2>
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <ul className="list-disc pl-5 text-gray-700 space-y-2">
                    {visa.minimumRequirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Visa Subtypes */}
            {visa.subtypes && visa.subtypes.length > 0 && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">
                  Visa Subtypes
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {visa.subtypes.map((subtype, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 border border-gray-200"
                    >
                      <h3 className="font-medium text-lg text-gray-800">
                        {subtype.name}
                      </h3>
                      <p className="text-gray-600 text-sm mb-3">
                        {subtype.description}
                      </p>

                      {Array.isArray(subtype.requirements) ? (
                        <>
                          <h4 className="text-sm font-medium text-gray-700 mt-2">
                            Requirements:
                          </h4>
                          <ul className="list-disc pl-5 text-sm text-gray-600">
                            {subtype.requirements.map((req, index) => (
                              <li key={index}>{req}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <>
                          {subtype.requirements.businessOwners && (
                            <>
                              <h4 className="text-sm font-medium text-gray-700 mt-2">
                                For Business Owners:
                              </h4>
                              <ul className="list-disc pl-5 text-sm text-gray-600">
                                {subtype.requirements.businessOwners.map(
                                  (req, index) => (
                                    <li key={index}>{req}</li>
                                  )
                                )}
                              </ul>
                            </>
                          )}

                          {subtype.requirements.employees && (
                            <>
                              <h4 className="text-sm font-medium text-gray-700 mt-2">
                                For Employees:
                              </h4>
                              <ul className="list-disc pl-5 text-sm text-gray-600">
                                {subtype.requirements.employees.map(
                                  (req, index) => (
                                    <li key={index}>{req}</li>
                                  )
                                )}
                              </ul>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-blue-50 border-t border-blue-200 p-4">
            <div className="flex items-start">
              <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div>
                <h3 className="font-medium text-blue-800">Important Notice</h3>
                <p className="text-sm text-blue-700 mt-1">
                  This information is provided for reference only. For the most
                  accurate and up-to-date visa requirements, please consult the
                  official{' '}
                  <a
                    href="https://immigration.gov.ph/visas/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Philippine Bureau of Immigration
                  </a>{' '}
                  or{' '}
                  <a
                    href="https://dfa.gov.ph/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-blue-900"
                  >
                    Department of Foreign Affairs
                  </a>{' '}
                  website.
                </p>
                <p className="text-sm text-blue-700 mt-2">
                  Last updated: {visaData.sourceInfo.lastUpdated}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default VisaTypeDetail
