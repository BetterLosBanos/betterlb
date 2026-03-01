// src/components/layout/DetailPageLayout.tsx
import { cn } from '@/lib/utils';
import type { DetailPageLayoutProps } from '@/types/components';

/**
 * DetailPageLayout component
 *
 * Standard layout for detail pages with hero section,
 * content sections, contact info, and related items.
 *
 * Follows T-079 Navigation Design System Spec.
 * All styling uses Kapwa semantic tokens.
 */
export function DetailPageLayout({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  title,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  description,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  breadcrumbs,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  metadata,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  heroActions,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  sections,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  contact,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  related,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  variant = 'default',
  className,
}: DetailPageLayoutProps) {
  return (
    <div
      className={cn(
        'animate-in fade-in space-y-8 pb-20 duration-500',
        className
      )}
    >
      {/* Hero section will be added in next task */}
      {/* Sections will be added in next task */}
      {/* Contact section will be added in next task */}
      {/* Related items will be added in next task */}
    </div>
  );
}

export default DetailPageLayout;
