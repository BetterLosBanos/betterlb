import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import {
  PageHero,
  ModuleHeader,
  DetailSection,
  type BreadcrumbItem,
} from '../PageLayouts';

describe('PageLayouts Components', () => {
  const renderWithRouter = (component: React.ReactElement) => {
    return render(<BrowserRouter>{component}</BrowserRouter>);
  };

  describe('PageHero', () => {
    it('renders title', () => {
      renderWithRouter(<PageHero title='Test Page Title' />);
      expect(screen.getByText('Test Page Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      renderWithRouter(
        <PageHero title='Test Title' description='Test Description' />
      );
      expect(screen.getByText('Test Description')).toBeInTheDocument();
    });

    it('renders without description', () => {
      renderWithRouter(<PageHero title='Test Title' />);
      expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders breadcrumb when provided', () => {
      const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Home', href: '/' },
        { label: 'Page', href: '/page' },
      ];

      renderWithRouter(
        <PageHero title='Test Title' breadcrumb={breadcrumbs} />
      );

      expect(screen.getByText('Home')).toBeInTheDocument();
      expect(screen.getByText('Page')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
      renderWithRouter(
        <PageHero title='Test Title'>
          <button>Action Button</button>
        </PageHero>
      );

      expect(screen.getByText('Action Button')).toBeInTheDocument();
    });

    it('renders metadata when provided', () => {
      renderWithRouter(
        <PageHero
          title='Test Title'
          metadata={<span>Last updated: Today</span>}
        />
      );

      expect(screen.getByText('Last updated: Today')).toBeInTheDocument();
    });
  });

  describe('ModuleHeader', () => {
    it('renders title', () => {
      render(<ModuleHeader title='Module Title' />);
      expect(screen.getByText('Module Title')).toBeInTheDocument();
    });

    it('renders description when provided', () => {
      render(
        <ModuleHeader title='Module Title' description='Module Description' />
      );
      expect(screen.getByText('Module Description')).toBeInTheDocument();
    });

    it('renders without description', () => {
      render(<ModuleHeader title='Module Title' />);
      expect(screen.getByText('Module Title')).toBeInTheDocument();
    });

    it('renders children when provided', () => {
      render(
        <ModuleHeader title='Module Title'>
          <button>Header Action</button>
        </ModuleHeader>
      );

      expect(screen.getByText('Header Action')).toBeInTheDocument();
    });
  });

  describe('DetailSection', () => {
    it('renders title and children', () => {
      render(
        <DetailSection title='Section Title'>
          <div>Section Content</div>
        </DetailSection>
      );

      expect(screen.getByText('Section Title')).toBeInTheDocument();
      expect(screen.getByText('Section Content')).toBeInTheDocument();
    });

    it('renders with only required props', () => {
      render(
        <DetailSection title='Minimal Section'>
          <div>Content</div>
        </DetailSection>
      );

      expect(screen.getByText('Minimal Section')).toBeInTheDocument();
    });

    it('renders with highlighted variant', () => {
      const { container } = render(
        <DetailSection title='Highlighted Section' variant='highlighted'>
          <div>Content</div>
        </DetailSection>
      );

      expect(screen.getByText('Highlighted Section')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('bg-kapwa-bg-surface-brand/30');
    });

    it('renders with compact variant', () => {
      const { container } = render(
        <DetailSection title='Compact Section' variant='compact'>
          <div>Content</div>
        </DetailSection>
      );

      expect(screen.getByText('Compact Section')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('rounded-lg');
    });

    it('renders with default variant when not specified', () => {
      const { container } = render(
        <DetailSection title='Default Section'>
          <div>Content</div>
        </DetailSection>
      );

      expect(screen.getByText('Default Section')).toBeInTheDocument();
      expect(container.firstChild).toHaveClass('rounded-2xl');
    });
  });
});
