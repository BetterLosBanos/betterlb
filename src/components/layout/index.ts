/**
 * Layout Components
 *
 * Core layout components that structure the application's pages and overall architecture.
 * These components handle page structure, navigation, SEO, and responsive layout concerns.
 *
 * @module components/layout
 */

export { Footer } from './Footer';
export { Navbar } from './Navbar';
export { ScrollToTop } from './ScrollToTop';
export { SEO, type SEOProps } from './SEO';
export { SidebarLayout, type SidebarLayoutProps } from './SidebarLayout';

// PageLayouts components
export { PageHero, ModuleHeader, DetailSection } from './PageLayouts';

// Reusable Page Layout Components
export { IndexPageLayout } from './IndexPageLayout';
export type {
  IndexPageLayoutProps,
  BreadcrumbItem,
  FilterConfig,
} from './IndexPageLayout';

export { DetailPageLayout } from './DetailPageLayout';
export type { DetailPageLayoutProps } from './DetailPageLayout';

// Unified Layout Components
export {
  PageHeader,
  SectionBlock,
  SectionAlternator,
  StaggeredGrid,
  useBreadcrumbs,
  type SectionBlockProps,
  type PageHeaderProps,
  type StaggeredGridProps,
} from './UnifiedLayouts';
