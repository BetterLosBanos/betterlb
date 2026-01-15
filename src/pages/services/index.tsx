import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Link, useOutletContext } from 'react-router-dom';

import { format, isValid } from 'date-fns';
import {
  ArrowRightIcon,
  BookOpenIcon,
  BriefcaseIcon,
  ClockIcon,
  DollarSignIcon,
  FileTextIcon,
  HammerIcon,
  HeartIcon,
  LeafIcon,
  LucideIcon,
  SearchXIcon,
  ShieldIcon,
  UsersIcon,
} from 'lucide-react';

import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/CardList';
import { EmptyState } from '@/components/ui/EmptyState';

import servicesData from '@/data/services/services.json';

// --- Types ---
interface Service {
  service: string;
  slug: string;
  url?: string;
  category: { name: string; slug: string };
  updatedAt?: string | null;
}

interface ServicesOutletContext {
  searchQuery: string;
  selectedCategorySlug: string;
}

// --- Icons ---
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

export default function ServicesPage() {
  const { searchQuery, selectedCategorySlug } =
    useOutletContext<ServicesOutletContext>();

  const [currentPage, setCurrentPage] = useState(1);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  // 1. Filtering logic
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

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategorySlug]);

  // 2. Pagination & Infinite Scroll logic
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

  // 3. EMPTY STATE: Specific button label for contributions
  if (filteredServices.length === 0) {
    return (
      <EmptyState
        icon={SearchXIcon}
        title='No services found'
        message={`We couldn't find any services matching "${searchQuery}". Help the portal by suggesting a new service.`}
        actionHref='/contribute'
        // Ensure your EmptyState component accepts an 'actionLabel' prop
        actionLabel='Suggest New Service'
      />
    );
  }

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      <div className='flex justify-start'>
        <Badge variant='slate' className='border-slate-200 bg-slate-50'>
          {filteredServices.length} Results
        </Badge>
      </div>

      <div className='grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3'>
        {filteredServices
          .slice(0, currentPage * ITEMS_PER_PAGE)
          .map(service => {
            const CategoryIcon =
              categoryIcons[service.category.slug] || FileTextIcon;
            const hasValidDate =
              service.updatedAt && isValid(new Date(service.updatedAt));

            return (
              <Link
                key={service.slug}
                to={`/services/${service.slug}`}
                className='group min-h-[200px]'
                aria-label={`View details for ${service.service}`}
              >
                <Card
                  hover
                  className='flex h-full flex-col border-slate-200 shadow-sm'
                >
                  <CardContent className='flex h-full flex-col p-6'>
                    {/* Icon & Online Tag */}
                    <div className='mb-4 flex items-start justify-between'>
                      <div className='bg-primary-50 text-primary-600 border-primary-100 rounded-xl border p-2.5 shadow-xs'>
                        <CategoryIcon className='h-5 w-5' />
                      </div>
                      <Badge
                        variant={service.url ? 'success' : 'secondary'}
                        dot
                      >
                        {service.url ? 'Online' : 'Walk-in'}
                      </Badge>
                    </div>

                    {/* Title & Category Label */}
                    <div className='flex-1'>
                      <h3 className='group-hover:text-primary-600 mb-1 leading-snug font-bold text-slate-900 transition-colors'>
                        {service.service}
                      </h3>
                      <p className='text-[10px] font-bold tracking-widest text-slate-400 uppercase'>
                        {service.category.name}
                      </p>
                    </div>

                    {/* Verification Row */}
                    <div className='mt-6 flex items-center justify-between border-t border-slate-50 pt-4'>
                      <div className='flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase'>
                        {hasValidDate ? (
                          <>
                            <ClockIcon className='h-3 w-3 text-emerald-600' />
                            <span className='text-slate-500'>
                              {format(new Date(service.updatedAt!), 'MMM yyyy')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className='h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300' />
                            <span className='font-bold text-slate-300 italic'>
                              Unverified
                            </span>
                          </>
                        )}
                      </div>

                      <span className='text-primary-600 flex items-center gap-1 text-xs font-bold transition-transform group-hover:translate-x-1'>
                        View <ArrowRightIcon className='h-3 w-3' />
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
      </div>

      {/* Infinite Scroll Loader */}
      {filteredServices.length > currentPage * ITEMS_PER_PAGE && (
        <div ref={loadMoreRef} className='flex justify-center py-12'>
          <div className='border-primary-600 h-6 w-6 animate-spin rounded-full border-2 border-t-transparent' />
        </div>
      )}
    </div>
  );
}
