import { ReactNode } from 'react';
import { SidebarLayout } from '@/components/layout/SidebarLayout';
import { navigationStyles } from '@/lib/navigation-styles';

/**
 * Props for NavigationPageWrapper component
 */
interface NavigationPageWrapperProps {
  /** Child elements to render within the page wrapper */
  children: ReactNode;

  /** Page variant determines background style */
  variant?: 'index' | 'detail';

  /** Additional CSS classes to apply */
  className?: string;

  /** Optional ID for the wrapper element */
  id?: string;
}

/**
 * NavigationPageWrapper component
 *
 * Standard wrapper for all navigation pages ensuring consistent
 * background, layout, and styling based on the Navigation Design
 * System Specification (T-079).
 *
 * This component:
 * - Applies consistent `bg-kapwa-bg-surface` background
 * - Wraps content in SidebarLayout for navigation
 * - Supports index and detail page variants
 * - Provides type-safe variant selection
 *
 * @example
 * ```tsx
 * // Index page with hero header
 * <NavigationPageWrapper variant="index">
 *   <PageHero title="Services" />
 *   {/* Content *\/}
 * </NavigationPageWrapper>
 *
 * // Detail page
 * <NavigationPageWrapper variant="detail">
 *   <ModuleHeader title="Service Detail" />
 *   {/* Content *\/}
 * </NavigationPageWrapper>
 * ```
 *
 * @see docs/navigation-design-system-spec.md
 * @see docs/plans/2026-03-01-color-background-consolidation-plan.md
 */
export function NavigationPageWrapper({
  children,
  variant = 'detail',
  className = '',
  id,
}: NavigationPageWrapperProps) {
  // Use navigationStyles utility for consistent styling
  const baseStyle =
    variant === 'index'
      ? navigationStyles.indexPage
      : navigationStyles.detailPage;

  return (
    <div className={`${baseStyle} ${className}`} id={id}>
      <SidebarLayout>{children}</SidebarLayout>
    </div>
  );
}

/**
 * Default export for convenience
 */
export default NavigationPageWrapper;
