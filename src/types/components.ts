// src/types/components.ts
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * Breadcrumb item for navigation
 */
export interface BreadcrumbItem {
  label: string;
  href: string;
}

/**
 * Content section within a detail page
 */
export interface DetailSection {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  variant?: 'default' | 'highlighted' | 'compact';
}

/**
 * Contact information display
 */
export interface DetailContactInfo {
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  hours?: string;
  custom?: Array<{
    label: string;
    value: string;
    icon?: LucideIcon;
  }>;
}

/**
 * Related items section
 */
export interface RelatedItem {
  title: string;
  href: string;
  description?: string;
  icon?: LucideIcon;
}

/**
 * Props for DetailPageLayout component
 */
export interface DetailPageLayoutProps {
  // === Hero Section ===
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: ReactNode; // Badges, tags, status indicators
  heroActions?: ReactNode; // Buttons, links in hero

  // === Content Sections ===
  sections: DetailSection[];

  // === Contact Information ===
  contact?: DetailContactInfo;

  // === Related Items ===
  related?: {
    title: string;
    items: RelatedItem[];
  };

  // === Styling ===
  variant?: 'default' | 'wide' | 'sidebar';
  className?: string;
}
