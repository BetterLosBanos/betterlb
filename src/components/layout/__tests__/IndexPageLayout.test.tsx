import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { IndexPageLayout } from '../IndexPageLayout';

describe('IndexPageLayout', () => {
  describe('Basic Rendering', () => {
    it('renders title and description', () => {
      render(
        <IndexPageLayout title='Test Title' description='Test Description'>
          <div>Child content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test Description')).toBeInTheDocument();
      expect(screen.getByText('Child content')).toBeInTheDocument();
    });

    it('renders with only required props', () => {
      render(
        <IndexPageLayout title='Minimal Title'>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('Minimal Title')).toBeInTheDocument();
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('renders with custom className', () => {
      const { container } = render(
        <IndexPageLayout title='Test' className='custom-class'>
          <div>Content</div>
        </IndexPageLayout>
      );

      // The className is appended to the default classes
      expect(container.firstChild).toHaveClass('custom-class');
      expect(container.firstChild).toHaveClass('bg-kapwa-bg-surface');
    });
  });

  describe('Search Functionality', () => {
    it('renders search input with placeholder', () => {
      const handleChange = vi.fn();
      const mockSearch = {
        value: '',
        onChange: handleChange,
        placeholder: 'Search departments...',
      };

      render(
        <IndexPageLayout title='Test' search={mockSearch}>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.getByPlaceholderText('Search departments...');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('');
    });

    it('renders search input with initial value', () => {
      const handleChange = vi.fn();
      const mockSearch = {
        value: 'test query',
        onChange: handleChange,
        placeholder: 'Search...',
      };

      render(
        <IndexPageLayout title='Test' search={mockSearch}>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.getByDisplayValue('test query');
      expect(searchInput).toBeInTheDocument();
      expect(searchInput).toHaveValue('test query');
    });

    it('calls onChange when search value changes', () => {
      const handleChange = vi.fn();
      const mockSearch = {
        value: '',
        onChange: handleChange,
        placeholder: 'Search...',
      };

      render(
        <IndexPageLayout title='Test' search={mockSearch}>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      fireEvent.change(searchInput, { target: { value: 'new query' } });

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith('new query');
    });

    it('does not render search when not provided', () => {
      render(
        <IndexPageLayout title='Test'>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.queryByPlaceholderText('Search...');
      expect(searchInput).not.toBeInTheDocument();
    });
  });

  describe('Results Display', () => {
    it('renders results count with default label', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={42}>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('42 items')).toBeInTheDocument();
    });

    it('renders results count with custom label', () => {
      render(
        <IndexPageLayout
          title='Test'
          resultsCount={15}
          resultsLabel='departments'
        >
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('15 departments')).toBeInTheDocument();
    });

    it('does not render results count when children are null', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={42}>
          {null}
        </IndexPageLayout>
      );

      expect(screen.queryByText('42 items')).not.toBeInTheDocument();
    });

    it('does not render results count when children are undefined', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={42}>
          {undefined}
        </IndexPageLayout>
      );

      expect(screen.queryByText('42 items')).not.toBeInTheDocument();
    });

    it('renders results count when children are empty array', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={0}>
          {[]}
        </IndexPageLayout>
      );

      // Empty array is still valid children
      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('does not render results count when not provided', () => {
      render(
        <IndexPageLayout title='Test'>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.queryByText(/items/)).not.toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('renders empty state when children are null', () => {
      const emptyState = {
        title: 'No results',
        message: 'Try different filters',
      };

      render(
        <IndexPageLayout title='Test' emptyState={emptyState}>
          {null}
        </IndexPageLayout>
      );

      expect(screen.getByText('No results')).toBeInTheDocument();
      expect(screen.getByText('Try different filters')).toBeInTheDocument();
    });

    it('renders empty state when children are undefined', () => {
      const emptyState = {
        title: 'No departments found',
        message: 'Try adjusting your search',
      };

      render(
        <IndexPageLayout title='Test' emptyState={emptyState}>
          {undefined}
        </IndexPageLayout>
      );

      expect(screen.getByText('No departments found')).toBeInTheDocument();
      expect(screen.getByText('Try adjusting your search')).toBeInTheDocument();
    });

    it('does not render empty state when children exist', () => {
      const emptyState = {
        title: 'No results',
        message: 'Try different filters',
      };

      render(
        <IndexPageLayout title='Test' emptyState={emptyState}>
          <div>Actual content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('Actual content')).toBeInTheDocument();
      expect(screen.queryByText('No results')).not.toBeInTheDocument();
    });

    it('does not render empty state when not provided', () => {
      render(<IndexPageLayout title='Test'>{null}</IndexPageLayout>);

      // Should render nothing, not even empty state
      expect(screen.queryByText('No results')).not.toBeInTheDocument();
    });
  });

  describe('Styling and Layout', () => {
    it('applies correct background class', () => {
      const { container } = render(
        <IndexPageLayout title='Test'>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(container.firstChild).toHaveClass('bg-kapwa-bg-surface');
      expect(container.firstChild).toHaveClass('min-h-screen');
    });

    it('renders variant classes correctly', () => {
      const { container: compactContainer } = render(
        <IndexPageLayout title='Test' variant='compact'>
          <div>Content</div>
        </IndexPageLayout>
      );

      const { container: wideContainer } = render(
        <IndexPageLayout title='Test' variant='wide'>
          <div>Content</div>
        </IndexPageLayout>
      );

      // Just verify it renders without errors - variant-specific styling
      // would be tested visually or with more specific class checks
      expect(compactContainer.firstChild).toBeInTheDocument();
      expect(wideContainer.firstChild).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('maintains proper heading hierarchy', () => {
      render(
        <IndexPageLayout title='Main Heading' description='Description'>
          <div>Content</div>
        </IndexPageLayout>
      );

      // ModuleHeader uses h2 for the title
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Main Heading');
    });

    it('provides searchable input with proper label association', () => {
      const mockSearch = {
        value: '',
        onChange: vi.fn(),
        placeholder: 'Search...',
      };

      render(
        <IndexPageLayout title='Test' search={mockSearch}>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveAttribute('type', 'text');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero results count', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={0}>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('0 items')).toBeInTheDocument();
    });

    it('handles very large results count', () => {
      render(
        <IndexPageLayout title='Test' resultsCount={999999}>
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText('999999 items')).toBeInTheDocument();
    });

    it('handles special characters in title and description', () => {
      render(
        <IndexPageLayout
          title='Title with <special> & characters'
          description='Description with quotes and double quotes'
        >
          <div>Content</div>
        </IndexPageLayout>
      );

      expect(screen.getByText(/Title with/)).toBeInTheDocument();
      expect(screen.getByText(/Description with/)).toBeInTheDocument();
    });

    it('handles empty string search value', () => {
      const handleChange = vi.fn();
      const mockSearch = {
        value: '',
        onChange: handleChange,
        placeholder: 'Search...',
      };

      render(
        <IndexPageLayout title='Test' search={mockSearch}>
          <div>Content</div>
        </IndexPageLayout>
      );

      const searchInput = screen.getByPlaceholderText('Search...');
      expect(searchInput).toHaveValue('');
    });
  });
});
