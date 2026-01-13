import {
  useState,
  useMemo,
  useRef,
  useCallback,
  useEffect,
  ComponentType,
} from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  ArrowRightIcon,
  ClockIcon,
  SearchXIcon,
  FileTextIcon,
  BriefcaseIcon,
  DollarSignIcon,
  HammerIcon,
  UsersIcon,
  HeartIcon,
  LeafIcon,
  BookOpenIcon,
  ShieldIcon,
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/CardList';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import servicesData from '@/data/services/services.json';

// 1. Unified Icon Map

type IconComponent = ComponentType<{ className?: string }>;

const categoryIcons: Record<string, IconComponent> = {
  'certificates-vital-records': FileTextIcon,
  'business-licensing': BriefcaseIcon,
  'taxation-assessment': DollarSignIcon,
  'infrastructure-engineering': HammerIcon,
  'social-services': UsersIcon,
  'health-wellness': HeartIcon,
  'agriculture-livelihood': LeafIcon,
  'environment-waste': LeafIcon,
  'education-scholarship': BookOpenIcon,
  'public-safety': ShieldIcon,
};

const ITEMS_PER_PAGE = 12;

interface Service {
  service: string;
  slug: string;
  category: { name: string; slug: string };
  updatedAt?: string;
}

export function ServicesGrid() {
  // Pulling search and category state from the Layout context
  const { searchQuery, selectedCategorySlug } = useOutletContext<{
    searchQuery: string;
    selectedCategorySlug: string;
  }>();

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 2. Optimized Filtering Logic
  const filteredServices = useMemo(() => {
    let filtered = servicesData as Service[];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        s =>
          s.service.toLowerCase().includes(q) ||
          s.category.name.toLowerCase().includes(q)
      );
    }

    if (selectedCategorySlug !== 'all') {
      filtered = filtered.filter(s => s.category.slug === selectedCategorySlug);
    }

    return filtered;
  }, [searchQuery, selectedCategorySlug]);

  // Reset pagination when search or category changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategorySlug]);

  // 3. Infinite Scroll Pagination
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
      { rootMargin: '200px' }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [handleLoadMore]);

  // 4. Empty State Integration
  if (filteredServices.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title='No services found'
        message={`We couldn't find any services matching "${searchQuery}" in this category.`}
      />
    );
  }

  return (
    <div className='space-y-6'>
      {/* Result Count Badge */}
      <div className='flex justify-start'>
        <Badge variant='slate' className='bg-gray-100/50'>
          Showing {filteredServices.length} Services
        </Badge>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-6'>
        {paginatedServices.map(service => {
          const CategoryIcon =
            categoryIcons[service.category.slug] || FileTextIcon;

          return (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className='group'
            >
              <Card
                hover
                className='h-full border-gray-100 flex flex-col shadow-sm'
              >
                <CardContent className='p-6 flex flex-col h-full'>
                  {/* Top: Icon & Hover Checkmark */}
                  <div className='flex justify-between items-start mb-4'>
                    <div className='p-2.5 bg-primary-50 rounded-xl text-primary-600 border border-primary-100 shadow-sm'>
                      <CategoryIcon className='w-5 h-5' />
                    </div>

                    {/* NEW: Explicit Service Type Badge */}
                    <Badge variant={service.url ? 'success' : 'slate'} dot>
                      {service.url ? 'Online' : 'Walk-in'}
                    </Badge>
                  </div>

                  {/* Bottom: Verification Status Logic */}
                  <div className='mt-6 pt-4 border-t border-gray-50 flex items-center justify-between'>
                    <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest transition-colors'>
                      {service.updatedAt ? (
                        <>
                          <ClockIcon className='w-3 h-3 text-emerald-500' />
                          <span className='text-gray-400'>
                            Verified{' '}
                            {format(new Date(service.updatedAt), 'MMM yyyy')}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className='w-1.5 h-1.5 rounded-full bg-gray-300 shrink-0' />
                          <span className='text-gray-300 italic'>
                            Unverified
                          </span>
                        </>
                      )}
                    </div>

                    <span className='text-xs font-bold text-primary-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform'>
                      View <ArrowRightIcon className='w-3 h-3' />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* 5. Infinite Scroll Loader */}
      {filteredServices.length > paginatedServices.length && (
        <div ref={loadMoreRef} className='py-12 flex justify-center'>
          <div className='w-6 h-6 border-2 border-primary-600 border-t-transparent rounded-full animate-spin' />
        </div>
      )}
    </div>
  );
}
