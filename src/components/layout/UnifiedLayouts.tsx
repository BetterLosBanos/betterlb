import {
  ComponentType,
  ReactNode,
  createContext,
  useContext,
  useState,
  useMemo,
  useLayoutEffect,
  useCallback,
} from 'react';

import { HomeIcon } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { cn } from '@/lib/utils';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '../navigation/Breadcrumb';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Breadcrumb item configuration.
 */
interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Navigation path */
  href: string;
}

/**
 * Props for the SectionBlock component.
 */
export interface SectionBlockProps {
  /** Section content */
  children: ReactNode;
  /** Background variant for visual rhythm */
  variant?: 'default' | 'raised' | 'brand';
  /** Optional section title */
  title?: string;
  /** Optional icon component for the title */
  icon?: ComponentType<{ className?: string }>;
  /** Optional action element (link, button, etc.) */
  action?: ReactNode;
  /** Animation delay in ms for staggered reveals */
  stagger?: number;
  /** Additional CSS classes */
  className?: string;
  /** HTML id for accessibility */
  id?: string;
}

/**
 * Props for the PageHeader component.
 */
export interface PageHeaderProps {
  /** Header title */
  title: string;
  /** Optional description text */
  description?: string;
  /** Header variant */
  variant?: 'hero' | 'centered' | 'compact';
  /** Optional action buttons/inputs */
  actions?: ReactNode;
  /** Optional custom breadcrumb element */
  breadcrumbs?: ReactNode;
  /** Optional status badges */
  badges?: ReactNode;
  /** Auto-generate breadcrumbs from route */
  autoBreadcrumbs?: boolean;
  /** Custom breadcrumb configuration */
  breadcrumbConfig?: Record<string, string>;
  /** Additional CSS classes */
  className?: string;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Default breadcrumb label overrides for common routes.
 */
const DEFAULT_BREADCRUMB_CONFIG: Record<string, string> = {
  '/government/elected-officials': 'Elected Officials',
  '/government/departments': 'Departments & Offices',
  '/government/barangays': 'Barangays',
  '/services': 'Services',
  '/openlgu': 'OpenLGU Portal',
  '/transparency': 'Transparency',
  '/statistics': 'Statistics',
  '/about': 'About',
  '/accessibility': 'Accessibility',
};

/**
 * Format a slug into a readable label.
 */
function formatLabel(slug: string): string {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// ============================================================================
// HOOK: Auto-generate breadcrumbs from route
// ============================================================================

/**
 * Hook that auto-generates breadcrumbs from the current route.
 *
 * @param config - Optional custom label overrides
 * @returns Array of breadcrumb items
 *
 * @example
 * ```tsx
 * const breadcrumbs = useBreadcrumbs();
 * // Returns: [
 * //   { label: 'Home', href: '/' },
 * //   { label: 'Services', href: '/services' },
 * //   { label: 'Business Permits', href: '/services/business-permits' },
 * // ]
 * ```
 */
/* eslint-disable-next-line react-refresh/only-export-components */
export function useBreadcrumbs(
  config: Record<string, string> = {}
): BreadcrumbItem[] {
  const location = useLocation();
  const mergedConfig = { ...DEFAULT_BREADCRUMB_CONFIG, ...config };

  return [
    { label: 'Home', href: '/' },
    ...location.pathname
      .split('/')
      .filter(Boolean)
      .map((segment, index, segments) => {
        const href = `/${segments.slice(0, index + 1).join('/')}`;
        const label = mergedConfig[href] || formatLabel(segment);
        return { label, href };
      }),
  ];
}

// ============================================================================
// CONTEXT: Section background alternation
// ============================================================================

interface SectionContextValue {
  index: number;
  increment: () => void;
}

const SectionContext = createContext<SectionContextValue>({
  index: 0,
  increment: () => {},
});

/**
 * Provider component that enables automatic background alternation.
 * Wrap multiple SectionBlock components in this to get alternating backgrounds.
 */
export function SectionAlternator({
  children,
  startIndex = 0,
}: {
  children: ReactNode;
  startIndex?: number;
}) {
  const [index, setIndex] = useState(startIndex);

  const increment = useCallback(() => {
    setIndex(prev => prev + 1);
  }, []);

  return (
    <SectionContext.Provider value={{ index, increment }}>
      {children}
    </SectionContext.Provider>
  );
}

// ============================================================================
// COMPONENT: SectionBlock
// ============================================================================

/**
 * SectionBlock - Reusable section wrapper with alternating backgrounds
 *
 * Provides consistent section styling with automatic background alternation
 * when used within SectionAlternator. Supports optional headers with icons
 * and action links.
 *
 * @example
 * ```tsx
 * <SectionBlock variant="raised" title="Featured Services" icon={StarIcon}>
 *   <CardGrid columns={3}>
 *     {services.map(s => <ServiceCard key={s.id} service={s} />)}
 *   </CardGrid>
 * </SectionBlock>
 *
 * // With auto-alternating backgrounds
 * <SectionAlternator>
 *   <SectionBlock title="Section 1">...</SectionBlock>
 *   <SectionBlock title="Section 2">...</SectionBlock>
 * </SectionAlternator>
 * ```
 */
export function SectionBlock({
  children,
  variant: explicitVariant,
  title,
  icon: Icon,
  action,
  stagger = 0,
  className,
  id,
}: SectionBlockProps) {
  const { index, increment } = useContext(SectionContext);

  // Auto-alternate if no explicit variant and wrapped in SectionAlternator
  const variant =
    explicitVariant ||
    (['default', 'raised', 'brand'][index % 3] as SectionBlockProps['variant']);

  // Increment after render (using useLayoutEffect to run before paint)
  useLayoutEffect(() => {
    if (!explicitVariant) {
      increment();
    }
  }, [explicitVariant, increment]);

  const variants = {
    default: 'bg-kapwa-bg-surface',
    raised: 'bg-kapwa-bg-surface-raised/30',
    brand: 'bg-kapwa-bg-surface-brand/50',
  };

  return (
    <section
      id={id}
      className={cn(
        'py-12 md:py-16',
        variants[variant],
        'duration-700 animate-in fade-in',
        className
      )}
      style={{ animationDelay: `${stagger}ms` }}
    >
      <div className='container px-4 mx-auto'>
        {(title || Icon || action) && (
          <div
            className={cn(
              'mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between',
              stagger > 0 &&
                'animate-in fade-in slide-in-from-bottom-4 duration-500'
            )}
            style={{ animationDelay: `${stagger + 100}ms` }}
          >
            <div className='flex gap-3 items-center'>
              {Icon && (
                <div className='bg-kapwa-bg-surface rounded-xl p-2.5 shadow-sm ring-1 ring-kapwa-border-weak'>
                  <Icon className='w-5 h-5 text-kapwa-text-brand' />
                </div>
              )}
              {title && (
                <h2 className='font-extrabold tracking-tight text-kapwa-text-strong kapwa-heading-lg'>
                  {title}
                </h2>
              )}
            </div>
            {action && (
              <div
                className={cn(
                  'shrink-0',
                  stagger > 0 &&
                    'animate-in fade-in slide-in-from-bottom-4 duration-500'
                )}
                style={{ animationDelay: `${stagger + 200}ms` }}
              >
                {action}
              </div>
            )}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}

// ============================================================================
// COMPONENT: PageHeader
// ============================================================================

/**
 * PageHeader - Unified header system with multiple variants
 *
 * Replaces conditional header logic across layouts with a consistent API.
 * Supports centered hero, compact with actions, and breadcrumbs.
 *
 * @example
 * ```tsx
 * // Centered variant (section pages)
 * <PageHeader
 *   variant="centered"
 *   title="Government Services"
 *   description="Access all municipal services"
 *   badges={<Badge variant="primary">18 Departments</Badge>}
 * />
 *
 * // Compact variant (index pages)
 * <PageHeader
 *   variant="compact"
 *   title="Services"
 *   description="Browse all available services"
 *   actions={
 *     <SearchInput
 *       value={search}
 *       onChange={(e) => setSearch(e.target.value)}
 *       placeholder="Search services..."
 *     />
 *   }
 * />
 *
 * // With auto breadcrumbs
 * <PageHeader
 *   variant="compact"
 *   title={service.name}
 *   autoBreadcrumbs={true}
 * />
 * ```
 */
export function PageHeader({
  title,
  description,
  variant = 'centered',
  actions,
  breadcrumbs,
  badges,
  autoBreadcrumbs = false,
  breadcrumbConfig,
  className,
}: PageHeaderProps) {
  // Always call the hook to follow React Hooks rules
  // Only use the result when autoBreadcrumbs is true
  const generatedBreadcrumbs = useBreadcrumbs(breadcrumbConfig);

  const breadcrumbContent = useMemo(() => {
    if (breadcrumbs) return breadcrumbs;
    if (!autoBreadcrumbs) return null;

    return (
      <Breadcrumb className='mb-4'>
        <BreadcrumbList>
          {generatedBreadcrumbs.map((crumb, index) => {
            const isLast = index === generatedBreadcrumbs.length - 1;
            return (
              <div key={crumb.href} className='flex gap-2 items-center'>
                {index === 0 ? (
                  <BreadcrumbItem>
                    <BreadcrumbLink href={crumb.href}>
                      <HomeIcon className='w-4 h-4' />
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                ) : (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {isLast ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </>
                )}
              </div>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    );
  }, [generatedBreadcrumbs, autoBreadcrumbs, breadcrumbs]);

  if (variant === 'hero') {
    return (
      <header
        className={cn(
          'py-12 bg-linear-to-b from-kapwa-bg-surface-raised to-kapwa-bg-surface md:py-16',
          'duration-700 animate-in fade-in',
          className
        )}
      >
        <div className='container px-4 mx-auto'>
          <div className='flex flex-col items-center text-center'>
            <h1 className='mb-4 font-bold tracking-tight text-kapwa-text-strong kapwa-heading-xl'>
              {title}
            </h1>
            {description && (
              <p className='mx-auto max-w-2xl text-sm leading-relaxed text-kapwa-text-disabled md:text-base'>
                {description}
              </p>
            )}
            {badges && <div className='mt-4'>{badges}</div>}
            {actions && <div className='mt-8 w-full max-w-xl'>{actions}</div>}
          </div>
        </div>
      </header>
    );
  }

  if (variant === 'centered') {
    return (
      <header
        className={cn(
          'py-8 md:py-12',
          'duration-700 animate-in fade-in',
          className
        )}
      >
        <div className='container px-4 mx-auto'>
          <div className='flex flex-col items-center text-center'>
            {breadcrumbContent}
            <h1 className='mb-4 font-bold tracking-tight text-kapwa-text-strong kapwa-heading-xl'>
              {title}
            </h1>
            {description && (
              <p className='mx-auto max-w-2xl text-sm leading-relaxed text-kapwa-text-disabled md:text-base'>
                {description}
              </p>
            )}
            {badges && <div className='mt-4'>{badges}</div>}
          </div>
        </div>
      </header>
    );
  }

  // Compact variant - left-aligned with actions
  return (
    <header
      className={cn(
        'py-6 border-b border-kapwa-border-weak md:py-8',
        'duration-700 animate-in fade-in',
        className
      )}
    >
      <div className='container px-4 mx-auto'>
        {breadcrumbContent}
        <div className='flex flex-col gap-4 justify-between md:flex-row md:items-start'>
          <div className='max-w-2xl'>
            <h1 className='font-extrabold tracking-tight text-kapwa-text-strong kapwa-heading-xl'>
              {title}
            </h1>
            {description && (
              <p className='mt-1 text-sm text-kapwa-text-disabled md:text-base'>
                {description}
              </p>
            )}
            {badges && <div className='mt-3'>{badges}</div>}
          </div>
          {actions && (
            <div className='w-full shrink-0 md:w-auto md:max-w-md'>
              {actions}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// ============================================================================
// COMPONENT: StaggeredGrid
// ============================================================================

/**
 * Props for the StaggeredGrid component.
 */
export interface StaggeredGridProps {
  /** Grid children (typically cards) */
  children: ReactNode;
  /** Number of columns */
  columns?: 1 | 2 | 3 | 4;
  /** Base animation delay in ms */
  baseDelay?: number;
  /** Delay increment between items in ms */
  delayStep?: number;
  /** Additional CSS classes */
  className?: string;
}

/**
 * StaggeredGrid - Card grid with automatic stagger animations
 *
 * Wraps CardGrid with automatic animation delays for each child.
 * Creates a cascading reveal effect on page load.
 *
 * @example
 * ```tsx
 * <StaggeredGrid columns={3} baseDelay={100} delayStep={75}>
 *   {services.map(s => <ServiceCard key={s.id} service={s} />)}
 * </StaggeredGrid>
 * ```
 */
export function StaggeredGrid({
  children,
  columns = 3,
  baseDelay = 0,
  delayStep = 75,
  className,
}: StaggeredGridProps) {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-6', cols[columns], className)} role='list'>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <div
              key={(child as { key?: ReactNode }).key || index}
              className='duration-500 animate-in fade-in slide-in-from-bottom-4'
              style={{ animationDelay: `${baseDelay + index * delayStep}ms` }}
            >
              {child}
            </div>
          ))
        : children}
    </div>
  );
}
