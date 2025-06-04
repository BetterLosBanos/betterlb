import React, { useState, useEffect, useCallback } from 'react'
import {
  Search,
  MapPin,
  Loader2,
  Users,
  Building2,
  Landmark,
  FileText,
} from 'lucide-react'
import {
  ComposableMap,
  Geographies,
  Geography,
  ZoomableGroup,
} from 'react-simple-maps'
import Button from '../../../components/ui/Button'
import { ScrollArea } from '../../../components/ui/ScrollArea'
import philippinesRegions from '../../../data/philippines-regions.json'

interface RegionData {
  id: string
  name: string
  description?: string
  population?: string
  capital?: string
  area?: string
  provinces?: string[]
  wikipedia?: string
  loading?: boolean
}

interface MapGeography {
  properties: {
    NAME_1?: string // Region name
    NAME_2?: string // Province name
    NAME_3?: string // Municipality name
    ADM1_EN?: string
    ADM2_EN?: string
    ADM3_EN?: string
    REGION?: string
    capital?: string
    population?: string
    provinces?: string[]
  }
}

// Wikipedia data cache
const wikipediaCache = new Map<string, any>()

const PhilippinesMap: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<RegionData | null>(null)
  const [hoveredRegion, setHoveredRegion] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [mapData, setMapData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mapLevel, setMapLevel] = useState<
    'regions' | 'provinces' | 'municipalities'
  >('regions')
  const [zoomLevel, setZoomLevel] = useState(1)

  // Fetch GeoJSON data
  useEffect(() => {
    const fetchMapData = async () => {
      try {
        setLoading(true)

        // Use local GeoJSON data
        setMapData(philippinesRegions)
      } catch (err) {
        console.error('Error loading map data:', err)
        setError('Failed to load map data.')
      } finally {
        setLoading(false)
      }
    }

    fetchMapData()
  }, [mapLevel])

  // Fetch Wikipedia data
  const fetchWikipediaData = useCallback(async (regionName: string) => {
    if (wikipediaCache.has(regionName)) {
      return wikipediaCache.get(regionName)
    }

    try {
      const response = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          regionName + ', Philippines'
        )}`
      )

      if (!response.ok) {
        throw new Error('Wikipedia data not found')
      }

      const data = await response.json()
      wikipediaCache.set(regionName, data)
      return data
    } catch (err) {
      console.error('Error fetching Wikipedia data:', err)
      return null
    }
  }, [])

  // Handle region click
  const handleRegionClick = useCallback(
    async (geography: MapGeography) => {
      const regionName =
        geography.properties.NAME_1 ||
        geography.properties.ADM1_EN ||
        geography.properties.REGION ||
        'Unknown Region'

      const regionData: RegionData = {
        id: regionName,
        name: regionName,
        capital: geography.properties.capital,
        population: geography.properties.population,
        provinces: geography.properties.provinces,
        loading: true,
      }

      setSelectedRegion(regionData)

      // Fetch Wikipedia data
      const wikiData = await fetchWikipediaData(regionName)

      setSelectedRegion((prev) => ({
        ...prev!,
        description: wikiData?.extract || 'No description available.',
        wikipedia: wikiData?.content_urls?.desktop?.page,
        loading: false,
      }))
    },
    [fetchWikipediaData]
  )

  // Filter regions based on search
  const filteredFeatures = mapData?.features?.filter((feature: any) => {
    if (!searchQuery) return true
    const name =
      feature.properties.NAME_1 ||
      feature.properties.ADM1_EN ||
      feature.properties.REGION ||
      ''
    return name.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const handleZoomIn = () => {
    setZoomLevel((prev) => Math.min(prev * 1.5, 4))
  }

  const handleZoomOut = () => {
    setZoomLevel((prev) => Math.max(prev / 1.5, 0.5))
  }

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Map Section */}
      <div className="flex-1 relative">
        {/* Search Bar */}
        <div className="absolute top-4 left-4 right-4 z-10 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
            <input
              type="text"
              placeholder="Search regions, provinces, or cities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Map Level Controls */}
        <div className="absolute top-20 left-4 z-10 flex gap-2">
          <Button
            variant={mapLevel === 'regions' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMapLevel('regions')}
          >
            Regions
          </Button>
          <Button
            variant={mapLevel === 'provinces' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMapLevel('provinces')}
          >
            Provinces
          </Button>
          <Button
            variant={mapLevel === 'municipalities' ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setMapLevel('municipalities')}
          >
            Cities/Municipalities
          </Button>
        </div>

        {/* Zoom Controls */}
        <div className="absolute top-20 right-4 z-10 flex gap-2">
          <Button variant="primary" size="sm" onClick={handleZoomIn}>
            +
          </Button>
          <Button variant="primary" size="sm" onClick={handleZoomOut}>
            -
          </Button>
        </div>

        {/* Map Container */}
        <div className="h-full w-full flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
              <p className="text-gray-600">Loading map data...</p>
            </div>
          ) : (
            <ComposableMap
              projection="geoMercator"
              projectionConfig={{
                center: [122, 12],
                scale: 3500,
                // rotation: [0, 0, 0],
              }}
              style={{
                width: '100%',
                height: '100%',
              }}
            >
              <ZoomableGroup center={[122, 12]} zoom={zoomLevel}>
                <Geographies geography={mapData}>
                  {({ geographies }) =>
                    geographies.map((geo) => {
                      const regionName =
                        geo.properties.NAME_1 ||
                        geo.properties.ADM1_EN ||
                        geo.properties.REGION ||
                        ''
                      const isHovered = hoveredRegion === regionName
                      const isSelected = selectedRegion?.id === regionName
                      const isFiltered = filteredFeatures?.some(
                        (f: any) => f.properties === geo.properties
                      )

                      return (
                        <Geography
                          key={geo.rsmKey}
                          geography={geo}
                          onMouseEnter={() => setHoveredRegion(regionName)}
                          onMouseLeave={() => setHoveredRegion(null)}
                          onClick={() => handleRegionClick(geo)}
                          style={{
                            default: {
                              fill: isSelected
                                ? '#7C3AED'
                                : isFiltered === false
                                ? '#E5E7EB'
                                : '#F3F4F6',
                              stroke: '#D1D5DB',
                              strokeWidth: 0.5,
                              outline: 'none',
                              transition: 'all 250ms',
                            },
                            hover: {
                              fill: isSelected ? '#7C3AED' : '#DDD6FE',
                              stroke: '#7C3AED',
                              strokeWidth: 2,
                              outline: 'none',
                              cursor: 'pointer',
                            },
                            pressed: {
                              fill: '#7C3AED',
                              outline: 'none',
                            },
                          }}
                        />
                      )
                    })
                  }
                </Geographies>
              </ZoomableGroup>
            </ComposableMap>
          )}
        </div>

        {/* Hover Tooltip */}
        {hoveredRegion && (
          <div className="absolute bottom-4 left-4 bg-white px-4 py-2 rounded-lg shadow-lg">
            <p className="text-sm font-medium text-gray-800">{hoveredRegion}</p>
            <p className="text-xs text-gray-500">Click for details</p>
          </div>
        )}
      </div>

      {/* Details Panel */}
      <div
        className={`absolute right-0 top-0 h-full w-96 bg-white shadow-xl transition-transform duration-300 ${
          selectedRegion ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {selectedRegion && (
          <div className="h-full flex flex-col">
            {/* Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">
                    {selectedRegion.name}
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Philippine Region
                  </p>
                </div>
                <button
                  onClick={() => setSelectedRegion(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <ScrollArea className="flex-1">
              <div className="p-6 space-y-6">
                {selectedRegion.loading ? (
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                  </div>
                ) : (
                  <>
                    {/* Description */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Overview
                      </h3>
                      <p className="text-gray-600 leading-relaxed">
                        {selectedRegion.description}
                      </p>
                    </div>

                    {/* Quick Facts */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Quick Facts
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-start gap-3">
                          <Building2 className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Capital
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedRegion.capital || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Users className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Population
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedRegion.population || 'N/A'}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Area
                            </p>
                            <p className="text-sm text-gray-600">
                              {selectedRegion.area || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Government Structure */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Government Structure
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <Landmark className="h-5 w-5 text-purple-600 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              Regional Government
                            </p>
                            <p className="text-sm text-gray-600">
                              Administrative region under the Philippine
                              government
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Provinces */}
                    {selectedRegion.provinces &&
                      selectedRegion.provinces.length > 0 && (
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-3">
                            Provinces
                          </h3>
                          <div className="flex flex-wrap gap-2">
                            {selectedRegion.provinces.map((province, index) => (
                              <span
                                key={index}
                                className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
                              >
                                {province}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* External Links */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">
                        Learn More
                      </h3>
                      <div className="space-y-2">
                        {selectedRegion.wikipedia && (
                          <a
                            href={selectedRegion.wikipedia}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-purple-600 hover:text-purple-700"
                          >
                            <FileText className="h-4 w-4" />
                            <span className="text-sm">Wikipedia Article</span>
                          </a>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>
    </div>
  )
}

export default PhilippinesMap
