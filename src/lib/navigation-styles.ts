/**
 * Navigation page style utilities
 *
 * Centralized style utilities for navigation pages based on the
 * Navigation Design System Specification (T-079).
 *
 * All utilities use Kapwa semantic tokens for consistency.
 *
 * @see docs/navigation-design-system-spec.md
 * @see docs/plans/2026-03-01-color-background-consolidation-plan.md
 */

/**
 * Background color utilities for navigation pages
 *
 * Provides semantic background tokens for different contexts:
 * - page: Default page background
 * - hero: Hero header background (index pages)
 * - section: Sub-section backgrounds
 * - sidebar: Sidebar container background
 * - active: Active navigation item background
 * - hover: Interactive hover state background
 */
export const navigationBackgrounds = {
  /** Default page background for all navigation pages */
  page: 'bg-kapwa-bg-surface',

  /** Hero header background for index pages */
  hero: 'bg-kapwa-bg-surface-bold',

  /** Section header background for sub-sections */
  section: 'bg-kapwa-bg-hover-weak',

  /** Sidebar container background */
  sidebar: 'bg-kapwa-bg-surface',

  /** Active navigation item background */
  active: 'bg-kapwa-bg-selected',

  /** Hover state for interactive elements */
  hover: 'hover:bg-kapwa-bg-hover',
} as const;

/**
 * Text color utilities for navigation pages
 *
 * Provides semantic text tokens for different hierarchy levels:
 * - strong: Primary text, headings
 * - default: Body text, standard content
 * - weak: Muted text, secondary information
 * - inverse: Text on bold backgrounds
 */
export const navigationText = {
  /** Primary text for headings and important content */
  strong: 'text-kapwa-text-strong',

  /** Default body text */
  default: 'text-kapwa-text-default',

  /** Muted text for secondary information */
  weak: 'text-kapwa-text-weak',

  /** Inverse text for use on bold backgrounds */
  inverse: 'text-kapwa-text-inverse',
} as const;

/**
 * Border color utilities for navigation pages
 *
 * Provides semantic border tokens for different hierarchy levels:
 * - weak: Subtle borders, dividers
 * - default: Standard borders
 * - strong: Emphasized borders
 */
export const navigationBorders = {
  /** Weak borders for subtle dividers */
  weak: 'border-kapwa-border-weak',

  /** Default borders */
  default: 'border-kapwa-border-default',

  /** Strong borders for emphasis */
  strong: 'border-kapwa-border-strong',
} as const;

/**
 * Spacing utilities for navigation pages
 *
 * Provides consistent spacing values based on Kapwa spacing scale:
 * - page: Page-level padding (large)
 * - section: Section-level padding (medium)
 * - compact: Compact padding for tight layouts (small)
 */
export const navigationSpacing = {
  /** Large padding for page-level spacing */
  page: 'p-kapwa-lg',

  /** Medium padding for section-level spacing */
  section: 'p-kapwa-md',

  /** Small padding for compact layouts */
  compact: 'p-kapwa-sm',
} as const;

/**
 * Combined page wrapper styles
 *
 * Provides complete style sets for common navigation page patterns.
 *
 * @example
 * ```tsx
 * // Index page with hero header
 * <div className={`${navigationStyles.indexPage}`}>
 *   <SidebarLayout>
 *     <PageHero />
 *   </SidebarLayout>
 * </div>
 *
 * // Detail page
 * <div className={`${navigationStyles.detailPage}`}>
 *   <SidebarLayout>
 *     <ModuleHeader />
 *   </SidebarLayout>
 * </div>
 * ```
 */
export const navigationStyles = {
  /** Complete style set for index pages */
  indexPage: `${navigationBackgrounds.page} min-h-screen`,

  /** Complete style set for detail pages */
  detailPage: `${navigationBackgrounds.page} min-h-screen`,
} as const;

/**
 * Type definitions for navigation style utilities
 */
export type NavigationBackground = keyof typeof navigationBackgrounds;
export type NavigationText = keyof typeof navigationText;
export type NavigationBorder = keyof typeof navigationBorders;
export type NavigationSpacing = keyof typeof navigationSpacing;
export type NavigationStyle = keyof typeof navigationStyles;
