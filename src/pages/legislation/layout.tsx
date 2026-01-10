import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import { ComponentProps } from 'react';
import { useQueryState, parseAsStringEnum } from 'nuqs';
import useLegislation from '../../hooks/useLegislation';

const filterValues = [
  'all',
  'ordinance',
  'resolution',
  'executive_order',
] as const;

export type FilterType = (typeof filterValues)[number];

export default function LegislationLayout() {
  const [searchQuery, setSearchQuery] = useQueryState(
    'search',
    parseAsStringEnum(['']).withDefault('')
  );

  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);

  const [filterType, setFilterType] = useQueryState(
    'type',
    parseAsStringEnum([...filterValues])
      .withDefault('all')
      .withOptions({ clearOnDefault: true })
  );

  useEffect(() => {
    setSearchQueryLocal(searchQuery);
  }, [searchQuery]);

  const legislation = useLegislation();

  const getButtonProps = (type: FilterType): ComponentProps<typeof Button> => {
    const isActive = filterType === type;

    const customClass = isActive
      ? {
          ordinance:
            '!bg-blue-600 hover:!bg-blue-700 border-transparent text-white',
          resolution:
            '!bg-amber-500 hover:!bg-amber-600 border-transparent text-white',
          executive_order:
            '!bg-emerald-600 hover:!bg-emerald-700 border-transparent text-white',
          all: '!bg-zinc-900 hover:!bg-zinc-800 border-transparent text-white',
        }[type]
      : 'text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900';

    return {
      children: null,
      onClick: () => setFilterType(type),
      variant: isActive ? 'primary' : 'outline',
      size: 'sm',
      className: customClass,
    };
  };

  return (
    <div className='container mx-auto px-4 py-6 md:py-12'>
      <header className='text-center mb-10'>
        <h1 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
          Municipal Legislation
        </h1>
        <p className='text-gray-600 max-w-2xl mx-auto mb-8'>
          Browse local ordinances, resolutions, and executive orders.
        </p>

        <div className='max-w-xl mx-auto mb-8'>
          <SearchInput
            placeholder='Search for legislation...'
            value={searchQueryLocal}
            onChange={e => setSearchQueryLocal(e.target.value)}
            onSearch={query => setSearchQuery(query)}
          />
        </div>

        <div className='flex flex-wrap justify-center gap-2'>
          <Button {...getButtonProps('all')}>All Documents</Button>
          <Button {...getButtonProps('ordinance')}>Ordinances</Button>
          <Button {...getButtonProps('resolution')}>Resolutions</Button>
          <Button {...getButtonProps('executive_order')}>
            Executive Orders
          </Button>
        </div>
      </header>

      <main>
        <Outlet
          context={{
            searchQuery: searchQueryLocal,
            filterType,
            ...legislation,
          }}
        />
      </main>
    </div>
  );
}
