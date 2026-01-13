import { useState, useEffect } from 'react';
import { Outlet, useSearchParams, useLocation } from 'react-router-dom';
import { useQueryState } from 'nuqs';
import ServicesSidebar from './components/ServicesSidebar';
import SearchInput from '@/components/ui/SearchInput';
import { PageHero } from '@/components/layout/PageLayouts';

export default function ServicesLayout() {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const isIndexPage =
    location.pathname === '/services' || location.pathname === '/services/';

  const initialCategory = searchParams.get('category') || 'all';
  const [selectedCategorySlug, setSelectedCategorySlug] =
    useState(initialCategory);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategorySlug(slug);
    setSearchParams({ category: slug });
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl && categoryFromUrl !== selectedCategorySlug) {
      setSelectedCategorySlug(categoryFromUrl);
    }
  }, [searchParams, selectedCategorySlug]);

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  return (
    <div className='container mx-auto px-4 md:px-0'>
      {/* --- MATCHED LAYOUT HEADER --- */}
      <PageHero
        title='Local Government Services'
        description={
          isIndexPage
            ? 'Explore official municipal services, permits, and documents. Choose a category to filter or search below.'
            : undefined
        }
      >
        {/* The Search Bar is passed as a child, so it appears centered beneath the title */}
        {isIndexPage && (
          <div className='max-w-xl mx-auto animate-in fade-in slide-in-from-top-2 duration-1000'>
            <SearchInput
              placeholder='Search for services (e.g., Business Permit)...'
              value={searchQuery}
              onChangeValue={setSearchQuery}
              size='md'
            />
          </div>
        )}
      </PageHero>

      {/* --- SIDEBAR + CONTENT AREA --- */}
      <div className='flex flex-col md:flex-row md:gap-8 items-start pb-12'>
        {/* Sidebar */}
        <div className='w-full md:w-64 flex-shrink-0'>
          <ServicesSidebar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            selectedCategorySlug={selectedCategorySlug}
            handleCategoryChange={handleCategoryChange}
          />
        </div>

        {/* Content Area */}
        <main className='flex-1 min-w-0'>
          <Outlet
            context={{
              searchQuery,
              selectedCategorySlug,
            }}
          />
        </main>
      </div>
    </div>
  );
}
