import { Outlet, useLocation } from 'react-router-dom';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import useLegislation from '../../hooks/useLegislation';
import SearchInput from '../../components/ui/SearchInput';
import { PageHero } from '@/components/layout/PageLayouts';
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
  const isIndexPage =
    location.pathname === '/legislation' ||
    location.pathname === '/legislation/';

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
    <div className='container mx-auto px-4 md:px-0'>
      {/* 1. Unified Centered Header */}
      <PageHero
        title='Municipal Legislation'
        description={
          isIndexPage
            ? 'Browse official local ordinances, resolutions, and executive orders of Los Baños.'
            : undefined
        }
      >
        {isIndexPage && (
          <div className='max-w-xl mx-auto'>
            <SearchInput
              placeholder='Search by title, number, or author...'
              value={searchQuery}
              onChangeValue={setSearchQuery}
              size='md'
            />
          </div>
        )}
      </PageHero>

      <div className='flex flex-col md:flex-row md:gap-8 items-start pb-12'>
        {/* 2. Unified Sidebar */}
        <div className='w-full md:w-64 flex-shrink-0'>
          <LegislationSidebar
            filterType={filterType}
            setFilterType={setFilterType}
          />
        </div>

        {/* 3. Main Content Area */}
        <main className='flex-1 min-w-0'>
          <Outlet
            context={{
              searchQuery,
              filterType,
              ...legislation,
            }}
          />
        </main>
      </div>
    </div>
  );
}
