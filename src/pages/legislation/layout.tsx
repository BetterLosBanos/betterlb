import { Outlet, useLocation } from 'react-router-dom';
import { parseAsStringEnum, useQueryState } from 'nuqs';

import SidebarLayout from '@/components/layout/SidebarLayout';
import { PageHero, ModuleHeader } from '@/components/layout/PageLayouts';
import SearchInput from '@/components/ui/SearchInput';
import useLegislation from '@/hooks/useLegislation';
import LegislationSidebar from './components/LegislationSidebar';

const filterValues = [
  'all',
  'ordinance',
  'resolution',
  'executive_order',
] as const;

export type FilterType = (typeof filterValues)[number];

export default function LegislationLayout() {
  const location = useLocation();
  
  // Logic: Collapse sidebar if reading a specific document
  const isIndexPage = location.pathname === '/legislation' || location.pathname === '/legislation/';

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  const [filterType, setFilterType] = useQueryState(
    'type',
    parseAsStringEnum([...filterValues])
      .withDefault('all')
      .withOptions({ clearOnDefault: true })
  );

  const legislation = useLegislation();

  return (
    <SidebarLayout
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      
      // HEADER LOGIC
      headerNode={
        isIndexPage ? (
          <PageHero
            title='Municipal Legislation'
            description='Browse official local ordinances, resolutions, and executive orders of Los Baños.'
          >
            <div className='mx-auto max-w-xl duration-1000 animate-in fade-in slide-in-from-top-2'>
                <SearchInput
                  placeholder='Search by title, number, or author...'
                  value={searchQuery}
                  onChangeValue={setSearchQuery}
                  size='md'
                />
            </div>
          </PageHero>
        ) : (
           <ModuleHeader 
              title="Legislative Document" 
              description="Official record from the Sangguniang Bayan." 
           />
        )
      }

      // SIDEBAR
      sidebar={
        <LegislationSidebar
            filterType={filterType}
            setFilterType={setFilterType}
        />
      }
    >
      <Outlet
        context={{
          searchQuery,
          filterType,
          ...legislation,
        }}
      />
    </SidebarLayout>
  );
}