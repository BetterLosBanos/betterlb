import { useOutletContext } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent } from '../../components/ui/CardList';
import { CheckCircle2Icon } from 'lucide-react';
import { format } from 'date-fns';

import servicesData from '../../data/services/services.json';

interface Service {
  service: string;
  slug: string;
  category: { name: string; slug: string };
  updatedAt?: string;
  [key: string]: unknown;
}

const allServices = servicesData as Service[];

const ITEMS_PER_PAGE = 16;

interface ServicesOutletContext {
  searchQuery: string;
  selectedCategorySlug: string;
}

export default function ServicesPage() {
  const { searchQuery, selectedCategorySlug } =
    useOutletContext<ServicesOutletContext>();

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const filteredServices = useMemo(() => {
    let filtered = allServices;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.service.toLowerCase().includes(query) ||
          s.category.name.toLowerCase().includes(query)
      );
    }

    if (selectedCategorySlug !== 'all') {
      filtered = filtered.filter(s => s.category.slug === selectedCategorySlug);
    }

    return filtered;
  }, [searchQuery, selectedCategorySlug]);

  const paginatedServices = filteredServices.slice(
    0,
    currentPage * ITEMS_PER_PAGE
  );

  const handleLoadMore = useCallback(() => {
    if (filteredServices.length > currentPage * ITEMS_PER_PAGE) {
      setCurrentPage(prev => prev + 1);
    }
  }, [filteredServices.length, currentPage]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting) handleLoadMore();
      },
      { root: null, rootMargin: '100px', threshold: 0.1 }
    );

    const current = loadMoreRef.current;
    if (current) observer.observe(current);
    return () => {
      if (current) observer.unobserve(current);
    };
  }, [handleLoadMore]);

  return (
    <div className='grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mt-6'>
      {paginatedServices.map((service, idx) => (
        <Link
          key={service.slug || idx}
          to={`/services/${service.slug}`}
          className='text-lg font-semibold text-gray-900 hover:text-primary-600 group'
        >
          <Card className='bg-white h-full'>
            <CardContent className='p-4 md:p-6'>
              <div className='flex items-start justify-between mb-4'>
                <div>
                  <div className='text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors'>
                    {service.service}
                  </div>

                  <div className='mt-2 flex flex-wrap gap-2'>
                    <span className='inline-block px-2 py-1 text-xs font-medium rounded-sm bg-primary-100 text-primary-800'>
                      {service.category.name}
                    </span>
                  </div>
                </div>

                <CheckCircle2Icon
                  className='h-5 w-5 text-success-500 flex-shrink-0'
                  aria-hidden='true'
                />
              </div>

              {/* Last Verified */}
              {service.updatedAt && (
                <div className='mt-4 text-xs text-gray-500'>
                  <time dateTime={service.updatedAt}>
                    Last verified:{' '}
                    {format(new Date(service.updatedAt), 'd MMM yyyy')}
                  </time>
                </div>
              )}
            </CardContent>
          </Card>
        </Link>
      ))}

      {filteredServices.length > ITEMS_PER_PAGE * currentPage && (
        <div
          ref={loadMoreRef}
          className='col-span-full mt-6 py-8'
          aria-hidden='true'
        />
      )}
    </div>
  );
}
