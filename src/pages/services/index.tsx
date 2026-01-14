import { useState, useMemo, useRef, useCallback, useEffect } from 'react';
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
  LucideIcon,
} from 'lucide-react';
import { format, isValid } from 'date-fns';

import { Card, CardContent } from '@/components/ui/CardList';
import { Badge } from '@/components/ui/Badge';
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
    <div className='space-y-6 duration-500 animate-in fade-in'>
      <div className='flex justify-start'>
        <Badge variant='slate' className='bg-slate-50 border-slate-200'>
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
                  className='flex flex-col h-full shadow-sm border-slate-200'
                >
                  <CardContent className='flex flex-col p-6 h-full'>
                    {/* Icon & Online Tag */}
                    <div className='flex justify-between items-start mb-4'>
                      <div className='p-2.5 rounded-xl bg-primary-50 text-primary-600 border border-primary-100 shadow-xs'>
                        <CategoryIcon className='w-5 h-5' />
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
                      <h3 className='mb-1 font-bold leading-snug transition-colors text-slate-900 group-hover:text-primary-600'>
                        {service.service}
                      </h3>
                      <p className='text-[10px] font-bold text-slate-400 uppercase tracking-widest'>
                        {service.category.name}
                      </p>
                    </div>

                    {/* Verification Row */}
                    <div className='flex justify-between items-center pt-4 mt-6 border-t border-slate-50'>
                      <div className='flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest'>
                        {hasValidDate ? (
                          <>
                            <ClockIcon className='w-3 h-3 text-emerald-600' />
                            <span className='text-slate-500'>
                              {format(new Date(service.updatedAt!), 'MMM yyyy')}
                            </span>
                          </>
                        ) : (
                          <>
                            <span className='w-1.5 h-1.5 rounded-full bg-slate-300 shrink-0' />
                            <span className='italic font-bold text-slate-300'>
                              Unverified
                            </span>
                          </>
                        )}
                      </div>

                      <span className='flex gap-1 items-center text-xs font-bold transition-transform text-primary-600 group-hover:translate-x-1'>
                        View <ArrowRightIcon className='w-3 h-3' />
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
          <div className='w-6 h-6 rounded-full border-2 animate-spin border-primary-600 border-t-transparent' />
        </div>
      )}
    </div>
  );
}
