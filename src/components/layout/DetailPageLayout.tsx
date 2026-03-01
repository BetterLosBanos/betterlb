// src/components/layout/DetailPageLayout.tsx
import { React } from 'react';
import { cn } from '@/lib/utils';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { PageHero, DetailSection } from './PageLayouts';
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
  title,
  description,
  breadcrumbs,
  metadata,
  heroActions,
  sections,
  contact,
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
      {/* === HERO SECTION === */}
      <PageHero title={title} description={description}>
        {breadcrumbs && (
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbHome href='/' />
              </BreadcrumbItem>
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={`${crumb.href}-${index}`}>
                  <BreadcrumbSeparator />
                  {index === breadcrumbs.length - 1 ? (
                    <BreadcrumbItem>
                      <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                    </BreadcrumbItem>
                  ) : (
                    <BreadcrumbItem>
                      <BreadcrumbLink href={crumb.href}>
                        {crumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  )}
                </React.Fragment>
              ))}
            </BreadcrumbList>
          </Breadcrumb>
        )}

        <div className='flex items-center justify-between gap-4 mt-6'>
          <div className='flex items-center gap-3'>{metadata}</div>
          {heroActions && <div className='shrink-0'>{heroActions}</div>}
        </div>
      </PageHero>

      {/* === CONTENT SECTIONS === */}
      <div className='space-y-8'>
        {sections.map(section => (
          <DetailSection
            key={section.id}
            title={section.title}
            description={section.description}
            className={
              section.variant === 'highlighted'
                ? 'border-l-4 border-l-kapwa-border-brand'
                : section.variant === 'compact'
                  ? 'py-4'
                  : ''
            }
          >
            {section.content}
          </DetailSection>
        ))}
      </div>

      {/* === CONTACT INFORMATION === */}
      {contact && (
        <DetailSection
          title='Contact Information'
          className='border-l-4 border-l-kapwa-border-brand'
        >
          <div>Contact section to be implemented in next task</div>
        </DetailSection>
      )}

      {/* === RELATED ITEMS === */}
      {related && related.items.length > 0 && (
        <DetailSection
          title={related.title}
          className='border-l-4 border-l-kapwa-border-accent'
        >
          <div>Related items to be implemented in next task</div>
        </DetailSection>
      )}
    </div>
  );
}

export default DetailPageLayout;
