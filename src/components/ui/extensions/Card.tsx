import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import {
  Card as KapwaCard,
  CardContent as KapwaCardContent,
  CardFooter as KapwaCardFooter,
  CardHeader as KapwaCardHeader,
  CardImage as KapwaCardImage,
} from '@bettergov/kapwa/card';
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

interface ContactInfo {
  address?: string | null;
  phone?: string | string[] | null;
  email?: string | null;
  website?: string | null;
}

interface CardProps extends HTMLAttributes<HTMLDivElement> {
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

// ============================================================================
// EXTENDED CARD COMPONENT
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    { children, className, variant = 'default', hover = true, ...props },
    ref
  ) => {
    const variants = {
      default: 'border-slate-200 shadow-sm',
      featured: 'border-primary-100 shadow-md ring-1 ring-primary-50',
      slate: 'bg-slate-50 border-slate-200 shadow-none',
      compact: 'border-slate-100 text-sm',
    };

    return (
      <KapwaCard
        ref={ref}
        className={cn(
          variants[variant],
          hover && 'hover:-translate-y-1 hover:shadow-md',
          className
        )}
        hoverable={hover}
        {...props}
      >
        {children}
      </KapwaCard>
    );
  }
);
Card.displayName = 'Card';

export const CardHeader = KapwaCardHeader;
export const CardContent = KapwaCardContent;
export const CardFooter = KapwaCardFooter;
export const CardImage = KapwaCardImage;

// ============================================================================
// BETTERLB-ONLY EXTENSIONS
// ============================================================================

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
