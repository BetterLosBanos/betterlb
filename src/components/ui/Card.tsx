import { HTMLAttributes, ImgHTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
}

const Card = ({
  children,
  className,
  hoverable = false,
  ...props
}: CardProps) => {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-lg border border-gray-200 bg-white shadow-xs',
        hoverable &&
          'transition-all duration-300 hover:-translate-y-1 hover:shadow-md',
        className
      )}
      role='article'
      aria-label='Service card'
      {...props}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const CardHeader = ({ children, className, ...props }: CardHeaderProps) => {
  return (
    <div
      className={cn('border-b border-gray-200 p-4 md:p-6', className)}
      role='heading'
      aria-level={2}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const CardContent = ({ children, className, ...props }: CardContentProps) => {
  return (
    <div
      className={cn('p-4 md:p-6', className)}
      role='region'
      aria-label='Service details'
      {...props}
    >
      {children}
    </div>
  );
};

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

const CardFooter = ({ children, className, ...props }: CardFooterProps) => {
  return (
    <div
      className={cn(
        'border-t border-gray-200 bg-gray-50 p-4 md:p-6',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

interface CardImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  className?: string;
}

const CardImage = ({ className, ...props }: CardImageProps) => {
  return (
    <div className='relative h-48 w-full overflow-hidden'>
      <img
        className={cn('h-full w-full object-cover', className)}
        {...props}
        alt={props.alt || 'Card image'}
      />
    </div>
  );
};

export { Card, CardHeader, CardContent, CardFooter, CardImage };
