import * as ScrollArea from '@radix-ui/react-scroll-area';
import serviceCategories from '../../../data/service_categories.json';
import { scrollToTop } from '@/lib/scrollUtils';

interface ServicesSidebarProps {
  selectedCategorySlug: string;
  handleCategoryChange: (slug: string) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

interface ServiceCategory {
  name: string;
  slug: string;
}

export default function ServicesSidebar({
  selectedCategorySlug,
  handleCategoryChange,
  sidebarOpen,
  setSidebarOpen,
}: ServicesSidebarProps) {
  return (
    <div
      id='categories-sidebar'
      className={`${
        sidebarOpen ? 'block' : 'hidden'
      } md:block w-full mb-6 md:mb-0`}
      role='navigation'
      aria-label='Service categories'
    >
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-[8.25rem]'>
        <h2 className='font-semibold text-gray-900 mb-4 text-lg'>Categories</h2>
        <ScrollArea.Root className='h-[calc(60vh)] md:max-h-[calc(100vh-250px)]'>
          <ScrollArea.Viewport className='h-full w-full'>
            <div className='space-y-1 pr-3' role='list'>
              {/* All Services Button */}
              <div role='listitem'>
                <button
                  onClick={() => {
                    scrollToTop();
                    handleCategoryChange('all');
                    setSidebarOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                    selectedCategorySlug === 'all'
                      ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                  }`}
                  aria-current={
                    selectedCategorySlug === 'all' ? 'true' : undefined
                  }
                >
                  All Services
                </button>
              </div>

              {/* Category List */}
              {(serviceCategories.categories as ServiceCategory[]).map(
                category => (
                  <div key={category.slug} role='listitem'>
                    <button
                      onClick={() => {
                        scrollToTop();
                        handleCategoryChange(category.slug);
                        setSidebarOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-md text-sm transition-all ${
                        selectedCategorySlug === category.slug
                          ? 'bg-primary-50 text-primary-700 font-semibold border-l-2 border-primary-600'
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 border-l-2 border-transparent'
                      }`}
                      aria-current={
                        selectedCategorySlug === category.slug
                          ? 'true'
                          : undefined
                      }
                    >
                      {/* Handle both old "category" key and new "name" key just in case */}
                      {category.name || category.category}
                    </button>
                  </div>
                )
              )}
            </div>
          </ScrollArea.Viewport>
          <ScrollArea.Scrollbar
            className='flex select-none touch-none p-0.5 bg-gray-100 transition-colors hover:bg-gray-200 rounded-full w-2'
            orientation='vertical'
          >
            <ScrollArea.Thumb className='flex-1 bg-gray-300 rounded-full relative' />
          </ScrollArea.Scrollbar>
        </ScrollArea.Root>
      </div>
    </div>
  );
}
