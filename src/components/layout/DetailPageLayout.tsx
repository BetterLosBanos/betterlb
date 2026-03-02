import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  GlobeIcon,
  ClockIcon,
} from 'lucide-react';

import { PageHero, type BreadcrumbItem, DetailSection } from './PageLayouts';
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { Card, CardContent } from '@/components/ui/Card';

export interface DetailPageLayoutProps {
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: ReactNode;
  heroActions?: ReactNode;
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    content: ReactNode;
    variant?: 'default' | 'highlighted' | 'compact';
  }>;
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    hours?: string;
    custom?: Array<{
      label: string;
      value: string;
    }>;
  };
  related?: {
    title: string;
    items: Array<{
      title: string;
      href: string;
      description?: string;
    }>;
  };
  variant?: 'default' | 'wide' | 'sidebar';
  className?: string;
}

export function DetailPageLayout({
  title,
  description,
  breadcrumbs,
  metadata,
  heroActions,
  sections,
  contact,
  related,
  className = '',
}: DetailPageLayoutProps) {
  return (
    <div className={`bg-kapwa-bg-surface min-h-screen space-y-6 ${className}`}>
      {/* Hero Section */}
      <PageHero
        title={title}
        description={description}
        breadcrumb={breadcrumbs}
        metadata={metadata}
      >
        {heroActions && <div className='shrink-0'>{heroActions}</div>}
      </PageHero>

      {/* Contact Section */}
      {contact && (
        <DetailSection title='Contact Information'>
          <ContactContainer variant='stack'>
            {contact.email && (
              <ContactItem
                icon={MailIcon}
                label='Email'
                value={contact.email}
                href={`mailto:${contact.email}`}
              />
            )}
            {contact.phone && (
              <ContactItem
                icon={PhoneIcon}
                label='Phone'
                value={contact.phone}
                href={`tel:${contact.phone}`}
              />
            )}
            {contact.address && (
              <ContactItem
                icon={MapPinIcon}
                label='Address'
                value={contact.address}
              />
            )}
            {contact.website && (
              <ContactItem
                icon={GlobeIcon}
                label='Website'
                value={contact.website}
                href={contact.website}
                isExternal
              />
            )}
            {contact.hours && (
              <ContactItem
                icon={ClockIcon}
                label='Hours'
                value={contact.hours}
              />
            )}
            {contact.custom?.map((item, index) => (
              <ContactItem
                key={index}
                icon={MailIcon}
                label={item.label}
                value={item.value}
              />
            ))}
          </ContactContainer>
        </DetailSection>
      )}

      {/* Content Sections */}
      {sections.map(section => (
        <DetailSection
          key={section.id}
          title={section.title}
          description={section.description}
          variant={section.variant}
        >
          {section.content}
        </DetailSection>
      ))}

      {/* Related Items */}
      {related && related.items.length > 0 && (
        <DetailSection title={related.title}>
          <div className='grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {related.items.map(item => (
              <Link key={item.href} to={item.href} className='group block'>
                <Card hover>
                  <CardContent>
                    <h3 className='group-hover:text-kapwa-text-link text-kapwa-text-strong font-semibold transition-colors'>
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className='text-kapwa-text-default mt-2 text-sm'>
                        {item.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </DetailSection>
      )}
    </div>
  );
}
