import { ButtonHTMLAttributes, ReactNode } from 'react';

import { Button as KapwaButton } from '@bettergov/kapwa/button';

import { cn } from '@/lib/utils';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link' | 'success';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

// Apply improvements-analysis responsive height fixes
const sizes = {
  sm: 'text-sm px-3 py-1.5 h-8 md:h-9', // 32px → 36px on desktop
  md: 'text-base px-4 py-2 h-10 md:h-11', // 40px → 44px on desktop
  lg: 'text-lg px-6 py-3 h-12 md:h-14', // 48px → 56px on desktop
};

export const Button = ({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) => {
  // Map 'success' variant to Kapwa's primary with custom styling
  const isSuccess = variant === 'success';

  return (
    <KapwaButton
      variant={isSuccess ? 'primary' : variant}
      className={cn(
        isSuccess &&
          'bg-success-500 hover:bg-success-600 focus:ring-success-500',
        sizes[size],
        className
      )}
      {...props}
    />
  );
};
