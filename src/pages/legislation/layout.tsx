import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import SearchInput from '../../components/ui/SearchInput';
import Button from '../../components/ui/Button';
import { ComponentProps } from 'react';
import { useQueryState } from 'nuqs';
import useLegislation from '../../hooks/useLegislation';

export type FilterType = 'all' | 'ordinance' | 'resolution' | 'executive_order';

export default function LegislationLayout() {
  const [searchQuery, setSearchQuery] = useQueryState('search', {
    defaultValue: '',
  });
  const [searchQueryLocal, setSearchQueryLocal] = useState(searchQuery);
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    setSearchQueryLocal(searchQuery);
  }, [searchQuery]);

  const legislation = useLegislation();

  // Helper to get button props
  const getButtonProps = (type: FilterType): ComponentProps<typeof Button> => {
    const isActive = filterType === type;

    // 1. Define base styling
    let customClass = '';

    // 2. Add color overrides only if active
    if (isActive) {
      switch (type) {
        case 'ordinance':
          customClass =
            '!bg-blue-600 hover:!bg-blue-700 border-transparent text-white';
          break;
        case 'resolution':
          customClass =
            '!bg-amber-500 hover:!bg-amber-600 border-transparent text-white';
          break;
        case 'executive_order':
          customClass =
            '!bg-emerald-600 hover:!bg-emerald-700 border-transparent text-white';
          break;
        default:
          customClass =
            '!bg-zinc-900 hover:!bg-zinc-800 border-transparent text-white';
      }
    } else {
      customClass =
        'text-zinc-600 border-zinc-200 hover:bg-zinc-50 hover:text-zinc-900';
    }

    return {
      children: null, // Placeholder to satisfy type, overwritten by actual children below
      onClick: () => setFilterType(type),
      // 3. Explicitly cast the variant so TypeScript knows it's valid
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
          {/* We spread the props, then define children explicitly */}
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
