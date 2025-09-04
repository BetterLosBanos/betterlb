import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { InstantSearch, SearchBox, Hits, Configure } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import 'instantsearch.css/themes/satellite.css';
import { exportMeilisearchData } from '../../lib/exportData';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Filter, 
  ChevronLeft, 
  BarChart3, 
  PieChart as PieChartIcon, 
  Info,
  Download,
  X,
  Users,
  Table,
  Map
} from 'lucide-react';
import Button from '../../components/ui/Button';
import { ScrollArea } from '../../components/ui/ScrollArea';

// Import lookup data
import infraYearData from '../../data/flood_control/lookups/InfraYear_with_counts.json';
import regionData from '../../data/flood_control/lookups/Region_with_counts.json';
import provinceData from '../../data/flood_control/lookups/Province_with_counts.json';
import deoData from '../../data/flood_control/lookups/DistrictEngineeringOffice_with_counts.json';
import legislativeDistrictData from '../../data/flood_control/lookups/LegislativeDistrict_with_counts.json';
import typeOfWorkData from '../../data/flood_control/lookups/TypeofWork_with_counts.json';
import contractorData from '../../data/flood_control/lookups/Contractor_with_counts.json';

// Define types for our data
interface DataItem {
  value: string;
  count: number;
}

// Meilisearch configuration
const MEILISEARCH_HOST = import.meta.env.VITE_MEILISEARCH_HOST || 'http://localhost';
const MEILISEARCH_PORT = import.meta.env.VITE_MEILISEARCH_PORT || '7700';
const MEILISEARCH_SEARCH_API_KEY = import.meta.env.VITE_MEILISEARCH_SEARCH_API_KEY || 'your_public_search_key_here';

// Create search client with proper type casting
const searchClient = instantMeiliSearch(
  `${MEILISEARCH_HOST}:${MEILISEARCH_PORT}`,
  MEILISEARCH_SEARCH_API_KEY,
  {
    primaryKey: 'GlobalID',
    keepZeroFacets: true,
  }
);

// Colors for charts
const COLORS = [
  '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', 
  '#82CA9D', '#8DD1E1', '#A4DE6C', '#D0ED57', '#FAAAA3'
];

// Define filter dropdown component props
interface FilterDropdownProps {
  name: string;
  options: DataItem[];
  value: string;
  onChange: (value: string) => void;
  searchable?: boolean;
}

// Define hit component for search results
interface FloodControlProject {
  ProjectDescription?: string;
  Municipality?: string;
  Region?: string;
  Province?: string;
  ContractID?: string;
  ProjectID?: string;
  ContractCost?: number;
  TypeofWork?: string;
  LegislativeDistrict?: string;
  DistrictEngineeringOffice?: string;
  slug?: string;
  // Add other specific properties as needed
}

interface HitProps {
  hit: FloodControlProject;
}

// Filter dropdown component with search capability
const FilterDropdown: React.FC<FilterDropdownProps> = ({ 
  name, 
  options, 
  value, 
  onChange,
  searchable = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredOptions = searchable && searchTerm 
    ? options.filter(option => 
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  return (
    <div className="relative">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate">
          {value ? value : `Select ${name}`}
        </span>
        <ChevronLeft className={`w-4 h-4 ml-2 transform ${isOpen ? 'rotate-90' : '-rotate-90'}`} />
      </button>
      
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200">
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border border-gray-300 rounded-md"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          )}
          
          <ScrollArea className="max-h-60">
            <div className="py-1">
              <button
                type="button"
                className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${!value ? 'bg-blue-50 text-blue-600' : ''}`}
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
              >
                All
              </button>
              
              {filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 ${value === option.value ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={() => {
                    onChange(option.value);
                    setIsOpen(false);
                  }}
                >
                  <div className="flex justify-between items-center">
                    <span className="truncate">{option.value}</span>
                    <span className="text-gray-500 text-xs">{option.count}</span>
                  </div>
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

// Hit component for search results
const Hit: React.FC<HitProps> = ({ hit }) => {
  return (
    <div className="p-4 border-b border-gray-200 hover:bg-gray-50">
      <h3 className="text-lg font-semibold text-blue-600">
        {hit.ProjectDescription || 'Flood Control Project'}
      </h3>
      <div className="grid grid-cols-2 gap-2 mt-2 text-sm">
        <div>
          <span className="font-medium">Location:</span>{' '}
          {hit.Municipality && <span>{hit.Municipality}, </span>}
          {hit.Province && <span>{hit.Province}, </span>}
          <span>{hit.Region}</span>
        </div>
        <div>
          <span className="font-medium">Contract ID:</span> {hit.ContractID}
        </div>
        <div>
          <span className="font-medium">Type of Work:</span> {hit.TypeofWork}
        </div>
        <div>
          <span className="font-medium">Contract Cost:</span>{' '}
          {hit.ContractCost ? `₱${Number(hit.ContractCost).toLocaleString()}` : 'N/A'}
        </div>
      </div>
    </div>
  );
};

const FloodControlProjects: React.FC = () => {
  // State for filters
  const [filters, setFilters] = useState({
    InfraYear: '',
    Region: '',
    Province: '',
    TypeofWork: '',
    DistrictEngineeringOffice: '',
    LegislativeDistrict: ''
  });
  
  // State for sidebar visibility on mobile
  const [showSidebar, setShowSidebar] = useState<boolean>(true);
  
  // No longer need active visualization state since we're showing all visualizations

  // Prepare data for visualizations
  const yearData = infraYearData.InfraYear
    .sort((a, b) => a.value.localeCompare(b.value))
    .map(item => ({
      name: item.value,
      Projects: item.count
    }));

  const regionChartData = regionData.Region
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      name: item.value,
      Projects: item.count
    }));

  const typeWorkPieData = typeOfWorkData.TypeofWork
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
    
  const contractorChartData = contractorData.Contractor
    .sort((a, b) => b.count - a.count)
    .slice(0, 10)
    .map(item => ({
      name: item.value.length > 30 ? item.value.substring(0, 30) + '...' : item.value,
      Projects: item.count,
      fullName: item.value
    }));

  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };

  // Search state for export
  const [searchTerm, setSearchTerm] = useState('');
  
  // Loading state for export
  const [isExporting, setIsExporting] = useState(false);

  // Export data function
  const handleExportData = async () => {
    // Set loading state
    setIsExporting(true);
    
    // Build filter string based on selected filters
    const filterStrings: string[] = ['type:flood_control'];
    
    if (filters.InfraYear) {
      filterStrings.push(`InfraYear = "${filters.InfraYear}"`);
    }
    
    if (filters.Region) {
      filterStrings.push(`Region = "${filters.Region}"`);
    }
    
    if (filters.Province) {
      filterStrings.push(`Province = "${filters.Province}"`);
    }
    
    if (filters.TypeofWork) {
      filterStrings.push(`TypeofWork = "${filters.TypeofWork}"`);
    }
    
    if (filters.DistrictEngineeringOffice) {
      filterStrings.push(`DistrictEngineeringOffice = "${filters.DistrictEngineeringOffice}"`);
    }
    
    if (filters.LegislativeDistrict) {
      filterStrings.push(`LegislativeDistrict = "${filters.LegislativeDistrict}"`);
    }
    
    const filterString = filterStrings.join(' AND ');
    
    try {
      await exportMeilisearchData({
        host: MEILISEARCH_HOST,
        port: MEILISEARCH_PORT,
        apiKey: MEILISEARCH_SEARCH_API_KEY,
        indexName: 'bettergov_flood_control',
        filters: filterString,
        searchTerm,
        filename: 'flood-control-projects-visual'
      });
      // Show success message
      alert('Data exported successfully!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('Failed to export data. Please try again.');
    } finally {
      // Reset loading state
      setIsExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Flood Control Projects | BetterGov.ph</title>
        <meta name="description" content="Explore flood control projects across the Philippines" />
      </Helmet>

      {/* Main layout with sidebar and content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar for filters - collapsible on mobile */}
          <div className={`md:w-64 flex-shrink-0 transition-all duration-300 ${showSidebar ? 'block' : 'hidden md:block'}`}>
            <div className="bg-white rounded-lg shadow-md p-4 sticky top-20">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Filter className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Filters</h2>
                </div>
                <button 
                  className="md:hidden text-gray-500 hover:text-gray-700"
                  onClick={() => setShowSidebar(false)}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Infrastructure Year</label>
                  <FilterDropdown 
                    name="Year" 
                    options={infraYearData.InfraYear} 
                    value={filters.InfraYear} 
                    onChange={(value) => handleFilterChange('InfraYear', value)} 
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                  <FilterDropdown 
                    name="Region" 
                    options={regionData.Region} 
                    value={filters.Region} 
                    onChange={(value) => handleFilterChange('Region', value)} 
                    searchable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Province</label>
                  <FilterDropdown 
                    name="Province" 
                    options={provinceData.Province} 
                    value={filters.Province} 
                    onChange={(value) => handleFilterChange('Province', value)} 
                    searchable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type of Work</label>
                  <FilterDropdown 
                    name="Type of Work" 
                    options={typeOfWorkData.TypeofWork} 
                    value={filters.TypeofWork} 
                    onChange={(value) => handleFilterChange('TypeofWork', value)} 
                    searchable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">District Engineering Office</label>
                  <FilterDropdown 
                    name="DEO" 
                    options={deoData.DistrictEngineeringOffice} 
                    value={filters.DistrictEngineeringOffice} 
                    onChange={(value) => handleFilterChange('DistrictEngineeringOffice', value)} 
                    searchable
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Legislative District</label>
                  <FilterDropdown 
                    name="Legislative District" 
                    options={legislativeDistrictData.LegislativeDistrict} 
                    value={filters.LegislativeDistrict} 
                    onChange={(value) => handleFilterChange('LegislativeDistrict', value)} 
                    searchable
                  />
                </div>
              </div>
              
              {/* Search box in sidebar */}
              <div className="mt-6 border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Search Projects</h3>
                <InstantSearch
                  // @ts-expect-error - Meilisearch client is compatible with InstantSearch
                  searchClient={searchClient.searchClient}
                  indexName="bettergov_flood_control"
                  initialUiState={{
                    bettergov_flood_control: {
                      query: '',
                    },
                  }}
                  onStateChange={(state) => {
                    const query = state.uiState?.bettergov_flood_control?.query || '';
                    setSearchTerm(query);
                  }}
                >
                  <Configure 
                    hitsPerPage={5} 
                    attributesToHighlight={['ProjectDescription', 'Municipality', 'Province', 'Region']}
                    attributesToRetrieve={[
                      'ProjectDescription', 'Municipality', 'Province', 'Region', 
                      'ContractID', 'TypeofWork', 'ContractCost', 'GlobalID'
                    ]}
                    filters="type:flood_control"
                  />
                  <SearchBox
                    placeholder="Search projects..."
                    classNames={{
                      root: 'mb-2',
                      form: 'relative',
                      input: 'w-full p-2 pl-8 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none',
                      submit: 'absolute top-0 left-0 h-full px-2 text-gray-500',
                      reset: 'absolute top-0 right-0 h-full px-2 text-gray-400',
                    }}
                  />
                </InstantSearch>
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1">
            {/* Mobile toggle for sidebar */}
            <div className="md:hidden mb-4">
              <Button 
                variant="outline"
                onClick={() => setShowSidebar(true)}
                leftIcon={<Filter className="w-4 h-4" />}
              >
                Show Filters
              </Button>
            </div>
            
            {/* Page header */}
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900">Flood Control Projects Dashboard</h1>
              <Button 
                variant="outline" 
                leftIcon={isExporting ? null : <Download className="w-4 h-4" />}
                onClick={handleExportData}
                disabled={isExporting}
              >
                {isExporting ? 'Exporting...' : 'Export Data'}
              </Button>
            </div>
            
            {/* View Tabs */}
            <div className="flex border-b border-gray-200 mb-6">
              <a 
                href="/flood-control-projects" 
                className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Visual
              </a>
              <a 
                href="/flood-control-projects/table" 
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium flex items-center"
              >
                <Table className="w-4 h-4 mr-2" />
                Table
              </a>
              <a 
                href="/flood-control-projects/map" 
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium flex items-center"
              >
                <Map className="w-4 h-4 mr-2" />
                Map
              </a>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Projects</h3>
                <p className="text-2xl font-bold text-blue-600">9,855</p>
                <p className="text-xs text-gray-500 mt-1">Across all regions</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Most Active Year</h3>
                <p className="text-2xl font-bold text-green-600">2023</p>
                <p className="text-xs text-gray-500 mt-1">3,466 projects</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Top Region</h3>
                <p className="text-2xl font-bold text-purple-600">{regionChartData[0]?.name || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">{regionChartData[0]?.Projects || 0} projects</p>
              </div>
              
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Common Work Type</h3>
                <p className="text-2xl font-bold text-orange-600">{typeWorkPieData[0]?.value.split(' ').slice(0, 2).join(' ') || 'N/A'}</p>
                <p className="text-xs text-gray-500 mt-1">{typeWorkPieData[0]?.count || 0} projects</p>
              </div>
            </div>

            {/* Visualizations Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Projects by Year - Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                  <BarChart3 className="w-5 h-5 text-blue-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Projects by Year</h2>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={yearData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                      <YAxis tick={{ fontSize: 9 }} />
                      <Tooltip />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Projects" fill="#0088FE" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Top Regions - Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="w-5 h-5 text-purple-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Top Regions</h2>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={regionChartData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="Projects"
                        nameKey="name"
                        label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {regionChartData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} projects`, name]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Types of Work - Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                  <PieChartIcon className="w-5 h-5 text-green-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Types of Work</h2>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={typeWorkPieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        nameKey="value"
                        label={({percent}) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {typeWorkPieData.map((_, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name) => [`${value} projects`, name]} />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              {/* Top Contractors - Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex items-center mb-4">
                  <Users className="w-5 h-5 text-orange-600 mr-2" />
                  <h2 className="text-lg font-semibold text-gray-800">Top Contractors</h2>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={contractorChartData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" tick={{ fontSize: 9 }} />
                      <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 9 }} />
                      <Tooltip 
                        formatter={(value, name) => [`${value} projects`, name]}
                        labelFormatter={(label) => {
                          const item = contractorChartData.find(item => item.name === label);
                          return item ? item.fullName : label;
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: 10 }} />
                      <Bar dataKey="Projects" fill="#FF8042" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Search Results */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Search Results</h2>
              <InstantSearch
                // @ts-expect-error - Meilisearch client is compatible with InstantSearch
                searchClient={searchClient.searchClient}
                indexName="bettergov_flood_control"
              >
                <Configure 
                  hitsPerPage={5} 
                  attributesToHighlight={['ProjectDescription', 'Municipality', 'Province', 'Region']}
                  attributesToRetrieve={[
                    'ProjectDescription', 'Municipality', 'Province', 'Region', 
                    'ContractID', 'TypeofWork', 'ContractCost', 'GlobalID'
                  ]}
                  filters="type:flood_control"
                />
                <div className="border rounded-lg overflow-hidden">
                  <Hits
                    hitComponent={Hit}
                    classNames={{
                      list: 'divide-y divide-gray-200',
                      item: 'w-full',
                    }}
                  />
                </div>
              </InstantSearch>
            </div>

            {/* Data Source Information */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">About This Data</h2>
              </div>
              <p className="text-gray-600 mb-4">
                This dashboard visualizes flood control infrastructure projects across the Philippines. 
                The data includes information about project locations, types, implementing offices, and more.
                Use the filters in the sidebar to explore specific aspects of the data or use the search functionality 
                to find specific projects.
              </p>
              <p className="text-sm text-gray-500">
                Source: Department of Public Works and Highways (DPWH) Flood Control Information System
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FloodControlProjects;
