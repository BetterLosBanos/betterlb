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

// --- Types ---

interface ContactInfo {
  address?: string | null;
  phone?: string | string[] | null;
  email?: string | null;
  website?: string | null;
}

interface CardProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  variant?: 'default' | 'featured' | 'slate' | 'compact';
  hover?: boolean;
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  level?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

interface CardGridProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  columns?: 1 | 2 | 3 | 4;
}

// --- Components ---

/**
 * 1. The Main Card Container
 * Complies with WCAG AA by providing clear boundaries and focus states.
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

/**
 * 2. Layout Sub-components
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

export const CardContent = ({
  children,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('p-4 md:p-6', className)} {...props}>
    {children}
  </div>
);

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

/**
 * 3. Media & Visuals
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

export const CardAvatar = ({
  name,
  size = 'md',
  className,
}: {
  name: string;
  size?: 'sm' | 'md' | 'lg';
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

/**
 * 4. Typography
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

export const CardDescription = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <p className={cn('mt-2 text-sm leading-relaxed text-slate-500', className)}>
    {children}
  </p>
);

/**
 * 5. Data Displays (Contact & Grouping)
 */
export const CardContactInfo = ({
  contact,
  compact = false,
}: {
  contact: ContactInfo;
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
          />
          <span className='leading-snug'>{contact.address}</span>
        </div>
      )}
      {contact.phone && (
        <div className='flex items-start gap-2'>
          <PhoneIcon
            className={cn('mt-0.5 shrink-0 text-slate-400', iconSize)}
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

export const CardList = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={cn('space-y-4', className)} role='list'>
    {children}
  </div>
);

export const CardDivider = ({ className }: { className?: string }) => (
  <hr className={cn('border-slate-100', className)} />
);
