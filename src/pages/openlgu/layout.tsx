import { Outlet, useLocation } from 'react-router-dom';

import { parseAsStringEnum, useQueryState } from 'nuqs';

import { PageHeader } from '@/components/layout';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import SearchInput from '@/components/ui/SearchInput';

import useOpenLGU from '@/hooks/useOpenLGU';

import OpenLGUSidebar from './components/OpenLGUSidebar';

const filterValues = [
  'all',
  'ordinance',
  'resolution',
  'executive_order',
] as const;

export type FilterType = (typeof filterValues)[number];

export default function OpenLGULayout() {
  const location = useLocation();

  // Logic: Collapse sidebar if reading a specific document
  const isIndexPage =
    location.pathname === '/openlgu' || location.pathname === '/openlgu/';

  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });

  const [filterType, setFilterType] = useQueryState(
    'type',
    parseAsStringEnum([...filterValues])
      .withDefault('all')
      .withOptions({ clearOnDefault: true })
  );

  // New: Author multi-select filter (comma-separated IDs in URL)
  const [authorIds, setAuthorIds] = useQueryState('authors', {
    defaultValue: [] as string[],
    parse: value => (value ? value.split(',').filter(Boolean) : []),
    serialize: values => values.join(','),
  });

  // New: Year single-select filter
  const [year, setYear] = useQueryState('year', {
    defaultValue: '',
  });

  const legislation = useOpenLGU();

  return (
    <SidebarLayout
      collapsible={true}
      defaultCollapsed={!isIndexPage}
      // Unified header using PageHeader component
      headerNode={
        isIndexPage ? (
          <PageHeader
            variant='hero'
            title='OpenLGU Portal'
            description='Browse official local ordinances, resolutions, and executive orders of Los Baños.'
            actions={
              <SearchInput
                placeholder='Search by title, number, or author...'
                value={searchQuery}
                onChangeValue={setSearchQuery}
                size='md'
              />
            }
          />
        ) : (
          <PageHeader
            variant='compact'
            title='OpenLGU Document'
            description='Official record from the Sangguniang Bayan.'
            autoBreadcrumbs={true}
            actions={
              <SearchInput
                placeholder='Search by title, number, or author...'
                value={searchQuery}
                onChangeValue={setSearchQuery}
                size='sm'
              />
            }
          />
        )
      }
      // SIDEBAR
      sidebar={
        <OpenLGUSidebar
          filterType={filterType}
          setFilterType={setFilterType}
          terms={legislation.terms}
          persons={legislation.persons}
          term={legislation.term}
          documents={legislation.documents}
        />
      }
    >
      <Outlet
        context={{
          searchQuery,
          setSearchQuery,
          filterType,
          setFilterType,
          authorIds,
          setAuthorIds,
          year,
          setYear,
          ...legislation,
        }}
      />
    </SidebarLayout>
  );
}
