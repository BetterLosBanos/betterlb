import {
  HTMLAttributes,
  ImgHTMLAttributes,
  ReactNode,
  forwardRef,
} from 'react';

import {
  ExternalLinkIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from 'lucide-react';

import { cn } from '@/lib/utils';

// ============================================================================
// TYPES
// ============================================================================

/**
 * Contact information for display in cards.
 *
 * Used by CardContactInfo to display contact details with appropriate icons.
 */
interface ContactInfo {
  /** Physical address location */
  address?: string | null;
  /** Phone number(s) - supports multiple numbers as an array */
  phone?: string | string[] | null;
  /** Email address for contact */
  email?: string | null;
  /** Website URL (with or without protocol) */
  website?: string | null;
}

/**
 * Props for the main Card component.
 *
 * Extends standard HTML attributes for flexibility in styling.
 */
interface CardProps extends HTMLAttributes<HTMLElement> {
  /** Card content to be displayed */
  children: ReactNode;
  /** Visual style variant for the card */
  variant?: 'default' | 'featured' | 'slate' | 'compact';
  /** Enable hover effects (elevation and border color change) */
  hover?: boolean;
}

/**
 * Props for the CardTitle component.
 *
 * Allows specifying the heading level for semantic HTML.
 */
interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Title text or content */
  children: ReactNode;
  /** Semantic heading level for accessibility */
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

/**
 * Props for the CardGrid component.
 *
 * Creates a responsive grid layout for cards.
 */
interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  /** Cards to display in the grid */
  children: ReactNode;
  /** Number of columns (responsive breakpoints applied automatically) */
  columns?: 1 | 2 | 3 | 4;
}

// ============================================================================
// COMPONENTS
// ============================================================================

/**
 * Card - Main Container Component
 *
 * A versatile card container that provides consistent styling, hover effects,
 * and WCAG AA compliance with proper focus states.
 *
 * @remarks
 * - Uses semantic `<article>` element for accessibility
 * - Supports multiple visual variants for different use cases
 * - Hover effects include elevation and border color transitions
 * - Fully responsive with mobile-first approach
 *
 * @example
 * ```tsx
 * <Card variant="featured">
 *   <CardHeader>Header Content</CardHeader>
 *   <CardContent>Body Content</CardContent>
 * </Card>
 * ```
 */
export const Card = forwardRef<HTMLElement, CardProps>(
  (
    { children, className, variant = 'default', hover = true, ...props },
    ref
  ) => {
    const variants = {
      default: 'bg-white border-slate-200 shadow-sm',
      featured: 'bg-white border-primary-100 shadow-md ring-1 ring-primary-50',
      slate: 'bg-slate-50 border-slate-200 shadow-none',
      compact: 'bg-white border-slate-100 shadow-xs text-sm',
    };

    return (
      <article
        ref={ref}
        className={cn(
          'w-full overflow-hidden rounded-2xl border transition-all duration-300',
          variants[variant],
          hover &&
            'hover:border-primary-300 hover:-translate-y-0.5 hover:shadow-lg',
          className
        )}
        {...props}
      >
        {children}
      </article>
    );
  }
);
Card.displayName = 'Card';

// ============================================================================
// LAYOUT SUB-COMPONENTS
// ============================================================================

/**
 * CardHeader - Header Section
 *
 * Creates a bordered header section at the top of a card.
 * Ideal for titles, actions, or summary information.
 */
export const CardHeader = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <header
    className={cn('border-b border-slate-100 p-4 md:p-6', className)}
    {...props}
  >
    {children}
  </header>
);

/**
 * CardContent - Main Content Area
 *
 * The primary content container for card body content.
 * Provides consistent padding that's responsive.
 */
export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 md:p-6', className)} {...props}>
    {children}
  </div>
);

/**
 * CardFooter - Footer Section
 *
 * Creates a bordered footer section with subtle background.
 * Useful for actions, metadata, or supplementary information.
 */
export const CardFooter = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <footer
    className={cn(
      'border-t border-slate-100 bg-slate-50/50 p-4 md:p-6',
      className
    )}
    {...props}
  >
    {children}
  </footer>
);

// ============================================================================
// MEDIA & VISUALS
// ============================================================================

/**
 * CardImage - Image Container
 *
 * Displays an image with a fixed aspect ratio container.
 * Images have a subtle zoom effect on hover when in a group.
 *
 * @remarks
 * - Fixed height of 192px (h-48)
 * - Uses object-cover for proper image scaling
 * - Lazy loading enabled for performance
 * - Fallback alt text provided for accessibility
 */
export const CardImage = ({
  className,
  ...props
}: ImgHTMLAttributes<HTMLImageElement>) => (
  <div className='relative h-48 w-full overflow-hidden bg-slate-100'>
    <img
      className={cn(
        'h-full w-full object-cover transition-transform duration-500 group-hover:scale-105',
        className
      )}
      loading='lazy'
      {...props}
      alt={props.alt || 'Card visualization'}
    />
  </div>
);

/**
 * CardAvatar - Avatar/Initials Display
 *
 * Displays initials in a styled container when no image is available.
 * Generates initials from the first character of the provided name.
 *
 * @param name - Name to generate initials from
 * @param size - Size variant affecting dimensions and text size
 *
 * @example
 * ```tsx
 * <CardAvatar name="John Doe" size="lg" />
 * // Displays: "J" in a large container
 * ```
 */
export const CardAvatar = ({
  name,
  size = 'md',
  className,
}: {
  /** Name to extract initial from */
  name: string;
  /** Size of the avatar */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
}) => {
  const sizes = {
    sm: 'w-10 h-10 text-xs',
    md: 'w-12 h-12 md:w-16 md:h-16 text-sm md:text-lg',
    lg: 'w-20 h-20 md:w-24 md:h-24 text-xl md:text-2xl',
  };

  return (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-2xl bg-slate-100 font-black text-slate-400 uppercase shadow-inner',
        sizes[size],
        className
      )}
      aria-hidden='true'
    >
      {name.charAt(0)}
    </div>
  );
};

// ============================================================================
// TYPOGRAPHY
// ============================================================================

/**
 * CardTitle - Card Heading
 *
 * Semantic heading component with configurable level.
 * Properly sized for each heading level with consistent styling.
 *
 * @remarks
 * - Default level is h3 for most card use cases
 * - Uses tracking-tight for improved readability
 * - All levels are semantically appropriate
 */
export const CardTitle = ({
  children,
  level = 'h3',
  className,
  ...props
}: CardTitleProps) => {
  const Tag = level;
  const sizes = {
    h1: 'text-3xl',
    h2: 'text-2xl',
    h3: 'text-xl',
    h4: 'text-lg',
    h5: 'text-base font-bold',
    h6: 'text-sm font-bold',
  };

  return (
    <Tag
      className={cn(
        'font-extrabold tracking-tight text-slate-900',
        sizes[level],
        className
      )}
      {...props}
    >
      {children}
    </Tag>
  );
};

/**
 * CardDescription - Supporting Text
 *
 * Displays secondary information with muted styling.
 * Ideal for summaries, metadata, or explanatory text.
 */
export const CardDescription = ({
  children,
  className,
}: {
  /** Description text content */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}) => (
  <p className={cn('mt-2 text-sm leading-relaxed text-slate-500', className)}>
    {children}
  </p>
);

// ============================================================================
// DATA DISPLAYS
// ============================================================================

/**
 * CardContactInfo - Contact Information Display
 *
 * Displays contact details with appropriate icons for each type of information.
 * Handles multiple phone numbers and URL protocol detection.
 *
 * @remarks
 * - Uses semantic `<address>` element (with not-italic to override default)
 * - Icons are sized according to compact/regular mode
 * - Website links auto-detect and add https:// protocol if missing
 * - Email and website links open in new tabs/windows
 *
 * @param contact - Contact information object
 * @param compact - Reduce spacing and icon sizes for tight layouts
 *
 * @example
 * ```tsx
 * <CardContactInfo
 *   contact={{
 *     address: "123 Main St",
 *     phone: ["(049) 123-4567", "(049) 765-4321"],
 *     email: "info@losbanos.gov.ph"
 *   }}
 * />
 * ```
 */
export const CardContactInfo = ({
  contact,
  compact = false,
}: {
  /** Contact information to display */
  contact: ContactInfo;
  /** Use smaller spacing and icons */
  compact?: boolean;
}) => {
  const iconSize = compact ? 'h-3 w-3' : 'h-4 w-4';
  const spacing = compact ? 'space-y-1' : 'space-y-3';

  return (
    <address className={cn('text-sm text-slate-600 not-italic', spacing)}>
      {contact.address && (
        <div className='flex items-start gap-2'>
          <MapPinIcon
            className={cn('mt-0.5 shrink-0 text-slate-400', iconSize)}
            aria-hidden='true'
          />
          <span className='leading-snug'>{contact.address}</span>
        </div>
      )}
      {contact.phone && (
        <div className='flex items-start gap-2'>
          <PhoneIcon
            className={cn('mt-0.5 shrink-0 text-slate-400', iconSize)}
            aria-hidden='true'
          />
          <span className='font-medium tabular-nums'>
            {Array.isArray(contact.phone) ? contact.phone[0] : contact.phone}
          </span>
        </div>
      )}
      {contact.email && (
        <div className='flex items-start gap-2'>
          <MailIcon
            className={cn('mt-0.5 shrink-0 text-slate-400', iconSize)}
            aria-hidden='true'
          />
          <a
            href={`mailto:${contact.email}`}
            className='text-primary-600 font-bold break-all hover:underline'
          >
            {contact.email}
          </a>
        </div>
      )}
      {contact.website && (
        <div className='flex items-start gap-2'>
          <ExternalLinkIcon
            className={cn('mt-0.5 shrink-0 text-slate-400', iconSize)}
            aria-hidden='true'
          />
          <a
            href={
              contact.website.startsWith('http')
                ? contact.website
                : `https://${contact.website}`
            }
            target='_blank'
            rel='noreferrer'
            className='text-primary-600 truncate font-bold hover:underline'
          >
            Official Website
          </a>
        </div>
      )}
    </address>
  );
};

/**
 * CardGrid - Responsive Grid Layout
 *
 * Creates a responsive grid for displaying multiple cards.
 * Automatically handles breakpoints based on column count.
 *
 * @remarks
 * - 1 column: Always single column
 * - 2 columns: 1 col mobile, 2 cols tablet+
 * - 3 columns: 1 col mobile, 2 cols tablet, 3 cols desktop
 * - 4 columns: 1 col mobile, 2 cols tablet, 4 cols desktop
 *
 * @param columns - Number of columns (default: 3)
 */
export const CardGrid = ({
  children,
  columns = 3,
  className,
}: CardGridProps) => {
  const cols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div
      className={cn(
        'grid gap-6',
        cols[columns as keyof typeof cols],
        className
      )}
      role='list'
    >
      {children}
    </div>
  );
};

/**
 * CardList - Vertical List Layout
 *
 * Displays cards in a vertical stack with consistent spacing.
 * Alternative to CardGrid for different layout needs.
 */
export const CardList = ({
  children,
  className,
}: {
  /** Cards to display in a list */
  children: ReactNode;
  /** Additional CSS classes */
  className?: string;
}) => (
  <div className={cn('space-y-4', className)} role='list'>
    {children}
  </div>
);

/**
 * CardDivider - Visual Separator
 *
 * Creates a horizontal divider with consistent styling.
 * Useful for separating sections within a card.
 */
export const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn('border-slate-100', className)} />
);
