import { ChevronRightIcon, HomeIcon } from 'lucide-react';
import {
  forwardRef,
  HTMLAttributes,
  ReactNode,
  AnchorHTMLAttributes,
  LiHTMLAttributes,
} from 'react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

interface BreadcrumbProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  className?: string;
}

interface BreadcrumbListProps extends HTMLAttributes<HTMLOListElement> {
  children: ReactNode;
  className?: string;
}

interface BreadcrumbItemProps extends LiHTMLAttributes<HTMLLIElement> {
  children: ReactNode;
  className?: string;
}

interface BreadcrumbLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  className?: string;
  children?: ReactNode;
}

interface BreadcrumbPageProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  className?: string;
}

interface BreadcrumbSeparatorProps extends HTMLAttributes<HTMLLIElement> {
  children?: ReactNode;
  className?: string;
}

const Breadcrumb = forwardRef<HTMLElement, BreadcrumbProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <nav
        ref={ref}
        aria-label='breadcrumb'
        className={cn('py-2', className)}
        {...props}
      >
        {children}
      </nav>
    );
  }
);
Breadcrumb.displayName = 'Breadcrumb';

const BreadcrumbList = forwardRef<HTMLOListElement, BreadcrumbListProps>(
  ({ className, children, ...props }, ref) => (
    <ol
      ref={ref}
      className={cn(
        'flex flex-wrap items-center gap-2 text-sm text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </ol>
  )
);
BreadcrumbList.displayName = 'BreadcrumbList';

const BreadcrumbItem = forwardRef<HTMLLIElement, BreadcrumbItemProps>(
  ({ className, children, ...props }, ref) => (
    <li
      ref={ref}
      className={cn('inline-flex items-center gap-2', className)}
      {...props}
    >
      {children}
    </li>
  )
);
BreadcrumbItem.displayName = 'BreadcrumbItem';

const BreadcrumbLink = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => (
    <Link
      ref={ref}
      to={href}
      className={cn(
        'transition-colors hover:text-gray-900 font-medium text-gray-500',
        className
      )}
      {...props}
    >
      {children}
    </Link>
  )
);
BreadcrumbLink.displayName = 'BreadcrumbLink';

const BreadcrumbPage = forwardRef<HTMLSpanElement, BreadcrumbPageProps>(
  ({ className, children, ...props }, ref) => (
    <span
      ref={ref}
      role='link'
      aria-disabled='true'
      aria-current='page'
      className={cn('font-bold text-gray-900', className)}
      {...props}
    >
      {children}
    </span>
  )
);
BreadcrumbPage.displayName = 'BreadcrumbPage';

const BreadcrumbSeparator = ({
  children,
  className,
  ...props
}: BreadcrumbSeparatorProps) => (
  <li
    role='presentation'
    aria-hidden='true'
    className={cn('text-gray-400', className)}
    {...props}
  >
    {children || <ChevronRightIcon className='h-3.5 w-3.5' />}
  </li>
);
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator';

const BreadcrumbHome = forwardRef<HTMLAnchorElement, BreadcrumbLinkProps>(
  ({ className, href, children, ...props }, ref) => (
    <Link
      ref={ref}
      to={href}
      className={cn(
        'flex items-center gap-1.5 transition-colors hover:text-gray-900 font-medium text-gray-500',
        className
      )}
      {...props}
    >
      <HomeIcon className='h-4 w-4' />
      {children}
    </Link>
  )
);
BreadcrumbHome.displayName = 'BreadcrumbHome';

export {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
};
