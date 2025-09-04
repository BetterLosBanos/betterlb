import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { InstantSearch, Configure, useHits } from 'react-instantsearch';
import { instantMeiliSearch } from '@meilisearch/instant-meilisearch';
import 'instantsearch.css/themes/satellite.css';
import { exportMeilisearchData } from '../../lib/exportData';
import { 
  Filter, 
  ChevronLeft, 
  BarChart3, 
  Download,
  X,
  Table,
  Map,
  ArrowUpDown,
  Info,
  Search
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
  InfraYear?: string;
  Contractor?: string;
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

// Table Row component
const TableRow: React.FC<HitProps> = ({ hit }) => {
  return (
    <tr className="border-b border-gray-200 hover:bg-gray-50">
      <td className="px-4 py-3 text-sm">{hit.ProjectDescription || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.InfraYear || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.Region || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.Province || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.Municipality || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.TypeofWork || 'N/A'}</td>
      <td className="px-4 py-3 text-sm">{hit.Contractor || 'N/A'}</td>
      <td className="px-4 py-3 text-sm text-right">
        {hit.ContractCost ? `₱${Number(hit.ContractCost).toLocaleString()}` : 'N/A'}
      </td>
    </tr>
  );
};

// Custom Hits component for table view
const TableHits: React.FC = () => {
  const [sortField, setSortField] = useState<string>('ProjectDescription');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Use useHits hook from react-instantsearch to access hits data directly
  const { hits } = useHits();

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const SortHeader: React.FC<{ field: string; label: string }> = ({ field, label }) => (
    <th 
      className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center">
        {label}
        <ArrowUpDown className="w-3 h-3 ml-1" />
      </div>
    </th>
  );

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <SortHeader field="ProjectDescription" label="Project Description" />
            <SortHeader field="InfraYear" label="Year" />
            <SortHeader field="Region" label="Region" />
            <SortHeader field="Province" label="Province" />
            <SortHeader field="Municipality" label="Municipality" />
            <SortHeader field="TypeofWork" label="Type of Work" />
            <SortHeader field="Contractor" label="Contractor" />
            <SortHeader field="ContractCost" label="Contract Cost" />
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Render hits directly as table rows without extra wrapping elements */}
          {hits.map((hit) => (
            <TableRow 
              key={typeof hit.GlobalID === 'string' ? hit.GlobalID : hit.objectID} 
              hit={hit as unknown as FloodControlProject} 
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

const FloodControlProjectsTable: React.FC = () => {
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
  
  // State for search term
  const [searchTerm, setSearchTerm] = useState<string>('');
  
  // Loading state for export
  const [isExporting, setIsExporting] = useState<boolean>(false);
  
  // Handle filter change
  const handleFilterChange = (filterName: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value
    }));
  };
  
  // Build filter string for Meilisearch
  const buildFilterString = (): string => {
    // Start with an empty array - we'll add filters as needed
    const filterStrings: string[] = [];
    
    // Based on the error message, these are the only filterable attributes:
    // CompletionDateActual, DistrictEngineeringOffice, FundingYear, GlobalID, 
    // LegislativeDistrict, Municipality, Province, Region, StartDate, TypeofWork, type
    
    // Always filter by type - format it correctly
    filterStrings.push('type = "flood_control"');
    
    // InfraYear is not filterable, try using FundingYear instead if they represent the same data
    if (filters.InfraYear && filters.InfraYear.trim()) {
      filterStrings.push(`FundingYear = ${filters.InfraYear.trim()}`); 
    }
    
    if (filters.Region && filters.Region.trim()) {
      filterStrings.push(`Region = "${filters.Region.trim()}"`); 
    }
    
    if (filters.Province && filters.Province.trim()) {
      filterStrings.push(`Province = "${filters.Province.trim()}"`); 
    }
    
    if (filters.TypeofWork && filters.TypeofWork.trim()) {
      filterStrings.push(`TypeofWork = "${filters.TypeofWork.trim()}"`); 
    }
    
    if (filters.DistrictEngineeringOffice && filters.DistrictEngineeringOffice.trim()) {
      filterStrings.push(`DistrictEngineeringOffice = "${filters.DistrictEngineeringOffice.trim()}"`); 
    }
    
    if (filters.LegislativeDistrict && filters.LegislativeDistrict.trim()) {
      filterStrings.push(`LegislativeDistrict = "${filters.LegislativeDistrict.trim()}"`); 
    }
    
    return filterStrings.length > 0 ? filterStrings.join(' AND ') : '';
  };

  // Export data function
  const handleExportData = async () => {
    // Set loading state
    setIsExporting(true);
    
    // Build filter string based on selected filters
    const filterString = buildFilterString();
    // Get effective search term including year filter if present
    const effectiveSearchTerm = getEffectiveSearchTerm();
    
    try {
      await exportMeilisearchData({
        host: MEILISEARCH_HOST,
        port: MEILISEARCH_PORT,
        apiKey: MEILISEARCH_SEARCH_API_KEY,
        indexName: 'bettergov_flood_control',
        filters: filterString,
        searchTerm: effectiveSearchTerm,
        filename: 'flood-control-projects-table'
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

  // Update search term when it changes in the search box
  const handleSearchChange = (query: string) => {
    setSearchTerm(query);
  };
  
  // Get the effective search term (no need to include year filter now as it's handled by FundingYear filter)
  const getEffectiveSearchTerm = (): string => {
    // Simply return the searchTerm since we're handling InfraYear via FundingYear filter now
    return searchTerm;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Flood Control Projects Table | BetterGov.ph</title>
        <meta name="description" content="Explore flood control projects data in tabular format" />
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
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Search projects..."
                    value={searchTerm}
                    onChange={(e) => handleSearchChange(e.target.value)}
                  />
                </div>
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
              <h1 className="text-2xl font-bold text-gray-900">Flood Control Projects Table</h1>
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
                className="px-4 py-2 text-gray-600 hover:text-blue-600 font-medium flex items-center"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Visual
              </a>
              <a 
                href="/flood-control-projects/table" 
                className="px-4 py-2 border-b-2 border-blue-500 text-blue-600 font-medium flex items-center"
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

            {/* Table View */}
            <div className="bg-white rounded-lg shadow-md p-4 mb-6">
              <InstantSearch
                // @ts-expect-error - Meilisearch client is compatible with InstantSearch
                searchClient={searchClient.searchClient}
                indexName="bettergov_flood_control"
                initialUiState={{
                  bettergov_flood_control: {
                    query: getEffectiveSearchTerm(),
                  },
                }}
              >
                <Configure 
                  hitsPerPage={20} 
                  attributesToRetrieve={[
                    'ProjectDescription', 'Municipality', 'Province', 'Region', 
                    'ContractID', 'TypeofWork', 'ContractCost', 'GlobalID',
                    'InfraYear', 'Contractor', 'FundingYear'
                  ]}
                  filters={buildFilterString()}
                  query={getEffectiveSearchTerm()}
                />
                <TableHits />
              </InstantSearch>
            </div>

            {/* Data Source Information */}
            <div className="bg-white rounded-lg shadow-md p-4">
              <div className="flex items-center mb-4">
                <Info className="w-5 h-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-800">About This Data</h2>
              </div>
              <p className="text-gray-600 mb-4">
                This table displays flood control infrastructure projects across the Philippines. 
                Use the filters in the sidebar to narrow down specific projects, or use the search functionality 
                to find projects by keyword. You can sort the table by clicking on any column header.
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

export default FloodControlProjectsTable;
