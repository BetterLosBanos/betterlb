import { FC, useState, useMemo } from 'react';
import Fuse from 'fuse.js';
import { Helmet } from 'react-helmet-async';
import servicesData from '@/data/services/services.json';

interface ServiceCategory {
  name: string;
  slug: string;
}

type ServiceType = 'transaction' | 'information';

interface Service {
  service: string;
  slug: string;
  type: ServiceType;
  description?: string;
  url?: string;
  officeSlug: string;
  category: ServiceCategory;
}

interface HitProps {
  hit: Service;
}

const Hit: FC<HitProps> = ({ hit }) => {
  const link = hit.url || `/services/${hit.slug}`;

  return (
    <article className='p-4 border-b border-gray-200 hit-item hover:bg-gray-50'>
      <a
        href={link}
        target='_blank'
        rel='noopener noreferrer'
        className='block'
      >
        <h2 className='text-lg font-semibold text-blue-600 hover:underline'>
          {hit.service}
        </h2>
        {hit.description && (
          <p className='mt-1 text-sm text-gray-800'>{hit.description}</p>
        )}
        <div className='mt-1 text-xs text-gray-800'>
          {hit.category && <span>{hit.category.name}</span>}
          <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-sm ml-2'>
            {hit.type}
          </span>
        </div>
        {hit.url && (
          <p className='mt-1 text-xs text-blue-500 truncate'>{hit.url}</p>
        )}
      </a>
    </article>
  );
};

const SearchPage: FC = () => {
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<ServiceType | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  const fuse = useMemo(() => {
    return new Fuse(servicesData as Service[], {
      keys: ['service', 'description', 'category.name'],
      threshold: 0.3,
    });
  }, []);

  const filteredResults = useMemo(() => {
    let results: Service[] = query
      ? fuse.search(query).map(r => r.item)
      : (servicesData as Service[]);

    if (typeFilter) results = results.filter(s => s.type === typeFilter);
    if (categoryFilter)
      results = results.filter(s => s.category.name === categoryFilter);

    return results;
  }, [query, typeFilter, categoryFilter, fuse]);

  const categories = Array.from(
    new Set((servicesData as Service[]).map(s => s.category.name))
  );

  return (
    <div className='container px-4 py-8 mx-auto'>
      <Helmet>
        <title>Search - Better Government Portal</title>
        <meta
          name='description'
          content='Search for government services and resources'
        />
      </Helmet>

      <h1 className='mb-6 text-3xl font-bold'>Search</h1>

      <div className='mb-6'>
        <input
          type='text'
          placeholder='Search for government services, offices, and resources...'
          value={query}
          onChange={e => setQuery(e.target.value)}
          className='p-4 w-full text-lg rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-hidden'
        />
      </div>

      <div className='grid grid-cols-1 gap-8 lg:grid-cols-4'>
        <div className='lg:col-span-1'>
          <div className='p-4 mb-6 bg-white rounded-lg shadow-sm'>
            <h3 className='mb-4 text-lg font-semibold'>Filter By</h3>

            <div className='mb-6'>
              <h4 className='mb-3 font-medium'>Type</h4>
              <select
                value={typeFilter}
                onChange={e =>
                  setTypeFilter(e.target.value as ServiceType | '')
                }
                className='p-2 w-full rounded border border-gray-300'
              >
                <option value=''>All</option>
                <option value='transaction'>Transaction</option>
                <option value='information'>Information</option>
              </select>
            </div>

            <div>
              <h4 className='mb-3 font-medium'>Category</h4>
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className='p-2 w-full rounded border border-gray-300'
              >
                <option value=''>All</option>
                {categories.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className='lg:col-span-3'>
          <div className='overflow-hidden bg-white rounded-lg shadow-sm'>
            {filteredResults.length === 0 ? (
              <p className='p-4 text-gray-700'>No results found.</p>
            ) : (
              filteredResults.map(hit => <Hit key={hit.slug} hit={hit} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
