import { HTMLAttributes, ReactNode, forwardRef } from 'react';

import { cn } from '../../lib/utils';

interface ScrollAreaProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
}

export const ScrollArea = forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'relative overflow-auto',
          // Custom scrollbar styling - consistent with scrollbar-thin
          '[&::-webkit-scrollbar]:w-1',
          '[&::-webkit-scrollbar-track]:bg-kapwa-bg-surface-raised',
          '[&::-webkit-scrollbar-track]:rounded-sm',
          '[&::-webkit-scrollbar-thumb]:bg-kapwa-border-weak',
          '[&::-webkit-scrollbar-thumb]:rounded-sm',
          '[&::-webkit-scrollbar-thumb]:hover:bg-kapwa-border-strong',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

ScrollArea.displayName = 'ScrollArea';
