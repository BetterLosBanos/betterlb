import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IndexPageLayout } from '../IndexPageLayout';

describe('IndexPageLayout', () => {
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

  it('renders search input', () => {
    const mockSearch = {
      value: '',
      onChange: () => {},
      placeholder: 'Search...',
    };

    render(
      <IndexPageLayout title='Test' search={mockSearch}>
        <div>Content</div>
      </IndexPageLayout>
    );

    expect(screen.getByPlaceholderText('Search...')).toBeInTheDocument();
  });

  it('renders results count', () => {
    render(
      <IndexPageLayout title='Test' resultsCount={42} resultsLabel='items'>
        <div>Content</div>
      </IndexPageLayout>
    );

    expect(screen.getByText(/42 items/)).toBeInTheDocument();
  });

  it('renders empty state when no children', () => {
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
});
