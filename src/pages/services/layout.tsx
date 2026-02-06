import { useEffect, useState } from 'react';

import { Outlet, useLocation, useSearchParams } from 'react-router-dom';

import { useQueryState } from 'nuqs';

import { ModuleHeader, PageHero } from '@/components/layout/PageLayouts';
import SidebarLayout from '@/components/layout/SidebarLayout';
// Import both
import SearchInput from '@/components/ui/SearchInput';

import ServicesSidebar from './components/ServicesSidebar';

export default function ServicesLayout() {
  const location = useLocation();
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
    <SidebarLayout
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // CUSTOM HEADER LOGIC:
      // If Index Page: Show the Big Center Hero + Search
      // If Detail Page: Show a smaller ModuleHeader
      headerNode={
        isIndexPage ? (
          <PageHero
            title='Local Government Services'
            description='Explore official municipal services, permits, and documents. Choose a category to filter or search below.'
          >
            <div className='animate-in fade-in slide-in-from-top-2 mx-auto max-w-xl duration-1000'>
              <SearchInput
                placeholder='Search for services (e.g., Business Permit)...'
                value={searchQuery}
                onChangeValue={setSearchQuery}
                size='md'
              />
            </div>
          </PageHero>
        ) : (
          <ModuleHeader
            title='Service Directory'
            description='Browse requirements and procedures.'
          />
        )
      }
      sidebar={
        <ServicesSidebar
          selectedCategorySlug={selectedCategorySlug}
          handleCategoryChange={handleCategoryChange}
        />
      }
    >
      <Outlet
        context={{
          searchQuery,
          selectedCategorySlug,
        }}
      />
    </SidebarLayout>
  );
}
