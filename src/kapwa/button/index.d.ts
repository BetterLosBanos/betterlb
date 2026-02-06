import { default as React } from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}
declare const Button: ({
  children,
  className,
  variant,
  size,
  fullWidth,
  isLoading,
  leftIcon,
  rightIcon,
  disabled,
  ...props
}: ButtonProps) => import('react/jsx-runtime').JSX.Element;
export { Button };
