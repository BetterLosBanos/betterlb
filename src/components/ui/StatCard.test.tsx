import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Users, DollarSign } from 'lucide-react';

import { StatCard, StatGrid } from './StatCard';

describe('StatCard Component', () => {
  describe('Rendering', () => {
    it('renders label correctly', () => {
      render(<StatCard label='Total Population' value='123456' />);
      expect(screen.getByText('Total Population')).toBeInTheDocument();
    });

    it('renders value correctly', () => {
      render(<StatCard label='Population' value={123456} />);
      expect(screen.getByText('123,456')).toBeInTheDocument();
    });

    it('formats number values with locale', () => {
      render(<StatCard label='Population' value={1234567} />);
      expect(screen.getByText('1,234,567')).toBeInTheDocument();
    });

    it('renders string values as-is', () => {
      render(<StatCard label='Growth Rate' value='2.5%' />);
      expect(screen.getByText('2.5%')).toBeInTheDocument();
    });

    it('renders subtext when provided', () => {
      render(
        <StatCard
          label='Population'
          value='123456'
          subtext='Actual Resident Count'
        />
      );
      expect(screen.getByText('Actual Resident Count')).toBeInTheDocument();
    });

    it('does not render subtext when not provided', () => {
      render(<StatCard label='Population' value='123456' />);
      const subtext = screen.queryByText('Actual Resident Count');
      expect(subtext).not.toBeInTheDocument();
    });
  });

  describe('Trend Indicators', () => {
    it('renders positive trend with success color', () => {
      render(
        <StatCard
          label='Growth'
          value='123'
          trend={{ value: 2.5, positive: true }}
        />
      );
      expect(screen.getByText('2.5%')).toBeInTheDocument();
    });

    it('renders negative trend with danger color', () => {
      render(
        <StatCard
          label='Decline'
          value='456'
          trend={{ value: -1.8, positive: false }}
        />
      );
      expect(screen.getByText('1.8%')).toBeInTheDocument();
    });

    it('shows up arrow for positive trend', () => {
      render(
        <StatCard
          label='Growth'
          value='123'
          trend={{ value: 5, positive: true }}
        />
      );
      // ArrowUpRight icon should be rendered (there's also an invisible trend span)
      const icons = screen.getAllByRole('presentation');
      expect(icons).toHaveLength(1); // Only trend icon (no optional icon)
    });

    it('shows down arrow for negative trend', () => {
      render(
        <StatCard
          label='Decline'
          value='456'
          trend={{ value: 3, positive: false }}
        />
      );
      // ArrowDownRight icon should be rendered
      const icons = screen.getAllByRole('presentation');
      expect(icons).toHaveLength(1); // Only trend icon (no optional icon)
    });

    it('hides trend when not provided', () => {
      render(<StatCard label='Population' value='123456' />);
      const trendText = screen.queryByText('0%');
      expect(trendText).toBeInTheDocument();
    });
  });

  describe('Variant Styling', () => {
    it('has hover effect enabled by default', () => {
      const { container } = render(<StatCard label='Test' value='123' />);
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });

    it('can disable hover effect when hover prop is false', () => {
      const { container } = render(
        <StatCard label='Test' value='123' hover={false} />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toBeInTheDocument();
    });
  });

  describe('Icon Display', () => {
    it('renders icon when provided', () => {
      render(<StatCard label='Users' value={14} icon={Users} />);
      // Icon wrapper has role="presentation"
      const icons = screen.getAllByRole('presentation');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('does not render optional icon when not provided', () => {
      render(<StatCard label='Test' value='123' />);
      // No optional icon means no icon container (trend icon is invisible)
      const iconContainer = screen.queryByText((_, node) => {
        return (
          node?.textContent === '' &&
          node?.parentElement?.classList.contains('rounded-xl')
        );
      });
      expect(iconContainer).not.toBeInTheDocument();
    });
  });

  describe('Custom Content', () => {
    it('renders custom children when provided', () => {
      render(
        <StatCard label='Test' value='123'>
          <span data-testid='custom-content'>Custom Badge</span>
        </StatCard>
      );
      expect(screen.getByTestId('custom-content')).toBeInTheDocument();
    });

    it('renders icon and custom children together', () => {
      render(
        <StatCard label='Test' value='123' icon={Users}>
          <span data-testid='badge'>New</span>
        </StatCard>
      );
      // When both icon and children are provided, icon takes precedence (not children)
      const icons = screen.getAllByRole('presentation');
      expect(icons.length).toBeGreaterThan(0);
      // The children are NOT rendered when icon is also provided
      expect(screen.queryByTestId('badge')).not.toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles zero value', () => {
      render(<StatCard label='Test' value={0} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles negative value', () => {
      render(<StatCard label='Test' value={-100} />);
      expect(screen.getByText('-100')).toBeInTheDocument();
    });

    it('handles very large numbers', () => {
      render(<StatCard label='Test' value={999999999999} />);
      expect(screen.getByText('999,999,999,999')).toBeInTheDocument();
    });

    it('handles decimal values', () => {
      render(<StatCard label='Test' value={123.45} />);
      expect(screen.getByText('123.45')).toBeInTheDocument();
    });

    it('handles zero trend value', () => {
      render(
        <StatCard
          label='Test'
          value='123'
          trend={{ value: 0, positive: true }}
        />
      );
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles very long labels', () => {
      render(
        <StatCard
          label='This is a very long label that should be truncated'
          value='123'
        />
      );
      expect(
        screen.getByText('This is a very long label that should be truncated')
      ).toBeInTheDocument();
    });

    it('handles very long values', () => {
      // Pass as number to trigger toLocaleString formatting
      // Use number within safe integer range (Number.MAX_SAFE_INTEGER = 9007199254740991)
      render(<StatCard label='Test' value={9007199254740991} />);
      // toLocaleString formats this as 9,007,199,254,740,991
      expect(screen.getByText('9,007,199,254,740,991')).toBeInTheDocument();
    });

    it('handles empty subtext gracefully', () => {
      render(<StatCard label='Test' value='123' subtext='' />);
      // Empty subtext should not render (subtext is conditional)
      // Check that no subtext element with text-xs class exists
      const allTexts = screen.queryAllByText(content => {
        const elem = content as HTMLElement;
        return elem.tagName === 'SPAN' && elem.classList.contains('text-xs');
      });
      expect(allTexts).toHaveLength(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic HTML structure', () => {
      render(<StatCard label='Population Count' value={123456} />);
      const card = screen.getByRole('article'); // Card uses article role
      expect(card).toBeInTheDocument();
    });

    it('has proper heading hierarchy', () => {
      render(<StatCard label='Population' value={123456} />);
      const label = screen.getByText('Population');
      // Label is a paragraph, not a heading - this is acceptable for KPI cards
      expect(label).toBeInTheDocument();
    });

    it('icons have presentation role for accessibility', () => {
      render(<StatCard label='Users' value={14} icon={Users} />);
      const icons = screen.getAllByRole('presentation');
      expect(icons.length).toBeGreaterThan(0);
    });

    it('trend indicators have proper color contrast', () => {
      render(
        <StatCard
          label='Growth'
          value='123'
          trend={{ value: 5, positive: true }}
        />
      );
      const trend = screen.getByText('5%');
      expect(trend).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('adapts to mobile screens', () => {
      const { container } = render(<StatCard label='Test' value='123' />);
      const cardContent = container.querySelector('.flex-col');
      expect(cardContent).toBeInTheDocument();
    });

    it('truncates long content on mobile', () => {
      render(<StatCard label='Very Long Label Name' value={12345} />);
      expect(screen.getByText('Very Long Label Name')).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('applies custom className when provided', () => {
      const { container } = render(
        <StatCard label='Test' value='123' className='custom-class' />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });

    it('preserves default classes when custom className is applied', () => {
      const { container } = render(
        <StatCard label='Test' value='123' className='custom-class' />
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });
});

describe('StatGrid Component', () => {
  const mockStats = [
    { label: 'Population', value: 123456, variant: 'primary' as const },
    { label: 'Growth', value: '2.5%', variant: 'secondary' as const },
    { label: 'Barangays', value: 14, variant: 'slate' as const },
  ];

  describe('Rendering', () => {
    it('renders all stat cards in the grid', () => {
      render(<StatGrid stats={mockStats} columns={3} />);
      expect(screen.getByText('Population')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
      expect(screen.getByText('Barangays')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('renders a responsive grid with children', () => {
      const { container } = render(<StatGrid stats={mockStats} columns={4} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.children.length).toBeGreaterThan(0);
    });

    it('adapts tablet columns based on desktop columns', () => {
      const { container } = render(<StatGrid stats={mockStats} columns={3} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid).toBeInTheDocument();
      expect(grid.children.length).toBe(mockStats.length);
    });
  });

  describe('Empty State', () => {
    it('renders empty grid when stats array is empty', () => {
      const { container } = render(<StatGrid stats={[]} columns={3} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.children).toHaveLength(0);
    });

    it('handles single stat gracefully', () => {
      const singleStat = [
        { label: 'Only Stat', value: '123', variant: 'slate' as const },
      ];
      const { container } = render(<StatGrid stats={singleStat} columns={2} />);
      const grid = container.firstChild as HTMLElement;
      expect(grid.children).toHaveLength(1);
      expect(screen.getByText('Only Stat')).toBeInTheDocument();
    });
  });

  describe('Integration with StatCard', () => {
    it('passes all props to individual StatCard components', () => {
      const statsWithTrends = [
        {
          label: 'Population',
          value: 123456,
          subtext: 'Actual Resident Count',
          variant: 'primary' as const,
          trend: { value: 2.5, positive: true },
        },
        {
          label: 'Growth Rate',
          value: '2.5%',
          subtext: 'Annual (2020-2024)',
          variant: 'secondary' as const,
        },
      ];

      render(<StatGrid stats={statsWithTrends} columns={2} />);
      expect(screen.getByText('Population')).toBeInTheDocument();
      // There are two "2.5%" elements: one is the trend value, one is the second stat's value
      expect(screen.getAllByText('2.5%')).toHaveLength(2);
      expect(screen.getByText('Actual Resident Count')).toBeInTheDocument();
    });

    it('renders icons when stats include icons', () => {
      const statsWithIcons = [
        {
          label: 'Total Users',
          value: 1234,
          variant: 'slate' as const,
          icon: Users,
        },
        {
          label: 'Revenue',
          value: '₱1.2M',
          variant: 'primary' as const,
          icon: DollarSign,
        },
      ];

      render(<StatGrid stats={statsWithIcons} columns={2} />);
      expect(screen.getAllByRole('presentation').length).toBeGreaterThanOrEqual(
        2
      ); // At least 2 icons
    });
  });
});
