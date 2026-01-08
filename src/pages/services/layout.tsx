import ServicesSidebar from './components/ServicesSidebar';
import { useState, useEffect } from 'react';
import { Outlet, useSearchParams } from 'react-router-dom'; // ✅ Import useSearchParams
import SearchInput from '../../components/ui/SearchInput';
import { useQueryState } from 'nuqs';

export default function ServicesLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(initialCategory);

  // Sync URL when Sidebar changes category
  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug);
    setSearchParams({ category: slug }); // Update URL
  };

  // Sync State when URL changes (e.g. Back button or Link click)
  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategorySlug) {
      setSelectedCategorySlug(categoryFromUrl);
    }
  }, [searchParams, selectedCategorySlug]);

  // Search state (Existing code)
  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);

  useEffect(() => {
    setSearchQueryLocal(searchQuery);
  }, [searchQuery]);

  return (
    <div className='container mx-auto px-4 py-6 md:py-12'>
      <header className='text-center mb-8 md:mb-12'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4 tracking-tight'>
          Local Government Services
        </h1>
        <p className='text-base md:text-lg text-gray-600 max-w-2xl mx-auto'>
          Access official municipal services, permits, and documents quickly.
        </p>

        <div className='max-w-xl mx-auto mt-8'>
          <SearchInput
            placeholder='Search for services (e.g., Business Permit)...'
            value={searchQueryLocal}
            onChange={e => setSearchQueryLocal(e.target.value)}
            onSearch={query => setSearchQuery(query)}
          />
        </div>
      </header>

      <div className='flex flex-col md:flex-row md:gap-8 items-start'>
        <div className='w-full md:w-64 flex-shrink-0'>
          <ServicesSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedCategorySlug={selectedCategorySlug}
            handleCategoryChange={handleCategoryChange}
          />
        </div>

        <main className='flex-1 min-w-0'>
          <Outlet
            context={{
              searchQuery: searchQueryLocal,
              selectedCategorySlug,
            }}
          />
        </main>
      </div>
    </div>
  );
}
