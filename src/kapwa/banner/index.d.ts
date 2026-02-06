import { default as React } from 'react';

export type BannerType = 'info' | 'warning' | 'error' | 'success' | 'default';
export interface BannerProps {
  title?: string;
  description: string;
  type?: BannerType;
  icon?: boolean;
  cta?:
    | {
        label: string;
        onClick: () => void;
        href?: string;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
        size?: 'sm' | 'md' | 'lg';
      }
    | Array<{
        label: string;
        onClick: () => void;
        href?: string;
        variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'link';
        size?: 'sm' | 'md' | 'lg';
      }>;
  className?: string;
  onDismiss?: () => void;
  titleSize?: 'sm' | 'md' | 'lg';
}
declare const Banner: React.FC<BannerProps>;
export { Banner };
