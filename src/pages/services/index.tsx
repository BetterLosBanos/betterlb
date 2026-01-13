import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
  CheckCircle2Icon,
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
  LucideIcon,
} from 'lucide-react';
import { format } from 'date-fns';

import { Card, CardContent } from '@/components/ui/CardList';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import servicesData from '@/data/services/services.json';

// 1. Icon mapping to match the sidebar for visual consistency
const categoryIcons: Record<string, LucideIcon> = {
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

export default function ServicesPage() {
  const { searchQuery, selectedCategorySlug } = useOutletContext<{
    searchQuery: string;
    selectedCategorySlug: string;
  }>();

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 2. Filtering Logic
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

  // 3. Infinite Scroll / Pagination
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

  // 4. Empty State
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
    <div className='space-y-6 duration-500 animate-in fade-in'>
      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
        {paginatedServices.map(service => {
          const CategoryIcon =
            categoryIcons[service.category.slug] || FileTextIcon;

          return (
            <Link
              key={service.slug}
              to={`/services/${service.slug}`}
              className='group'
            >
              <Card hover className='flex flex-col h-full border-gray-100'>
                <CardContent className='flex flex-col p-6 h-full'>
                  {/* Top: Category & Status */}
                  <div className='flex justify-between items-start mb-4'>
                    <div className='p-2 rounded-lg bg-primary-50 text-primary-600'>
                      <CategoryIcon className='w-5 h-5' />
                    </div>
                    <CheckCircle2Icon className='w-4 h-4 text-emerald-500 opacity-0 transition-opacity group-hover:opacity-100' />
                  </div>

                  {/* Middle: Title & Category Label */}
                  <div className='flex-1'>
                    <h3 className='mb-2 font-bold leading-tight text-gray-900 group-hover:text-primary-700'>
                      {service.service}
                    </h3>
                    <Badge variant='slate'>{service.category.name}</Badge>
                  </div>

                  {/* Bottom: Meta Info */}
                  <div className='flex justify-between items-center pt-4 mt-6 border-t border-gray-50'>
                    {/* Verification Status */}
                    <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest'>
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
                          <span className='italic font-medium text-gray-300'>
                            Unverified
                          </span>
                        </>
                      )}
                    </div>

                    {/* Action Link */}
                    <span className='flex gap-1 items-center text-xs font-bold transition-transform text-primary-600 group-hover:translate-x-1'>
                      View Service <ArrowRightIcon className='w-3 h-3' />
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Loading Trigger for Infinite Scroll */}
      {filteredServices.length > paginatedServices.length && (
        <div ref={loadMoreRef} className='flex justify-center py-10'>
          <div className='w-6 h-6 rounded-full border-2 animate-spin border-primary-600 border-t-transparent' />
        </div>
      )}
    </div>
  );
}
