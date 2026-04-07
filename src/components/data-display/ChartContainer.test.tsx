import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

import {
  ChartTooltip,
  ChartContainer,
  ResponsiveChart,
} from './ChartContainer';

// Mock Recharts ResponsiveContainer for testing
vi.mock('recharts', async () => {
  const actual = await vi.importActual<typeof import('recharts')>('recharts');
  return {
    ...actual,
    ResponsiveContainer: ({
      children,
      width,
      height,
    }: {
      children: React.ReactNode;
      width?: number | string;
      height?: number | string;
    }) => <div style={{ width, height }}>{children}</div>,
  };
});

describe('ChartTooltip Component', () => {
  describe('Rendering', () => {
    it('renders nothing when active is false', () => {
      const { container } = render(
        <ChartTooltip active={false} payload={[]} label={2020} />
      );
      expect(container.firstChild).toBe(null);
    });

    it('renders nothing when payload is empty', () => {
      const { container } = render(
        <ChartTooltip active={true} payload={[]} label={2020} />
      );
      expect(container.firstChild).toBe(null);
    });

    it('renders tooltip when active with payload', () => {
      const { container } = render(
        <ChartTooltip
          active={true}
          payload={[
            { name: 'Series A', value: 100, color: '#0066eb' },
            { name: 'Series B', value: 50, color: '#cc3e00' },
          ]}
          label={2020}
        />
      );
      expect(container.firstChild).not.toBe(null);
      expect(screen.getByText('Year: 2020')).toBeInTheDocument();
    });

    it('sorts payload by value descending', () => {
      const { container } = render(
        <ChartTooltip
          active={true}
          payload={[
            { name: 'Low', value: 10, color: '#059669' },
            { name: 'High', value: 100, color: '#0066eb' },
            { name: 'Medium', value: 50, color: '#cc3e00' },
          ]}
          label={2020}
        />
      );
      // Use more specific selector to only match entry rows, not footer
      const entries = container.querySelectorAll('.group.justify-between');
      expect(entries[0]).toHaveTextContent('High');
      expect(entries[1]).toHaveTextContent('Medium');
      expect(entries[2]).toHaveTextContent('Low');
    });
  });

  describe('Content Display', () => {
    it('displays label correctly', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Test', value: 10, color: '#0066eb' }]}
          label='2024'
        />
      );
      expect(screen.getByText('Year: 2024')).toBeInTheDocument();
    });

    it('displays series names', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[
            { name: 'Population', value: 1000, color: '#0066eb' },
            { name: 'Growth', value: 5, color: '#cc3e00' },
          ]}
          label={2020}
        />
      );
      expect(screen.getByText('Population')).toBeInTheDocument();
      expect(screen.getByText('Growth')).toBeInTheDocument();
    });

    it('displays series values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Test', value: 123.45, color: '#0066eb' }]}
          label={2020}
        />
      );
      expect(screen.getByText('123.45')).toBeInTheDocument();
    });

    it('applies custom formatter to values', () => {
      const formatter = (value: number) => `${value}%`;
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Growth', value: 5.5, color: '#0066eb' }]}
          label={2020}
          formatter={formatter}
        />
      );
      expect(screen.getByText('5.5%')).toBeInTheDocument();
    });

    it('displays color indicators', () => {
      const { container } = render(
        <ChartTooltip
          active={true}
          payload={[
            { name: 'Series A', value: 100, color: '#0066eb' },
            { name: 'Series B', value: 50, color: '#cc3e00' },
          ]}
          label={2020}
        />
      );
      // There are 2 payload indicator dots + 1 footer dot = 3 total
      const dots = container.querySelectorAll('.rounded-full');
      expect(dots.length).toBe(3);
      // First two dots are the payload indicators
      expect(dots[0]).toHaveStyle({ backgroundColor: '#0066eb' });
      expect(dots[1]).toHaveStyle({ backgroundColor: '#cc3e00' });
    });
  });

  describe('Accessibility', () => {
    it('truncates long labels', () => {
      const longLabel =
        'This is a very long series name that should be truncated';
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: longLabel, value: 10, color: '#0066eb' }]}
          label={2020}
        />
      );
      const truncatedElement = screen.getByText(longLabel).closest('span');
      expect(truncatedElement).toHaveClass('max-w-[130px]');
      expect(truncatedElement).toHaveClass('truncate');
    });
  });

  describe('Edge Cases', () => {
    it('handles zero values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Zero', value: 0, color: '#0066eb' }]}
          label={2020}
        />
      );
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('handles negative values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Negative', value: -50, color: '#cc3e00' }]}
          label={2020}
        />
      );
      expect(screen.getByText('-50')).toBeInTheDocument();
    });

    it('handles null values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Null', value: null, color: '#059669' }]}
          label={2020}
        />
      );
      // Find the Null entry, then check its value column (second span in group)
      const nullEntry = screen.getByText('Null').closest('.group');
      const valueSpan = nullEntry?.querySelector('span.tabular-nums');
      // null values render as empty string
      expect(valueSpan?.textContent).toBe('');
    });

    it('handles undefined values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Undefined', value: undefined, color: '#059669' }]}
          label={2020}
        />
      );
      // Find the Undefined entry, then check its value column (second span in group)
      const undefinedEntry = screen.getByText('Undefined').closest('.group');
      const valueSpan = undefinedEntry?.querySelector('span.tabular-nums');
      // undefined values render as empty string
      expect(valueSpan?.textContent).toBe('');
    });

    it('handles very large numbers', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Large', value: 999999999, color: '#0066eb' }]}
          label={2020}
        />
      );
      expect(screen.getByText('999999999')).toBeInTheDocument();
    });

    it('handles decimal values', () => {
      render(
        <ChartTooltip
          active={true}
          payload={[{ name: 'Decimal', value: 3.14159, color: '#0066eb' }]}
          label={2020}
        />
      );
      expect(screen.getByText('3.14159')).toBeInTheDocument();
    });

    it('handles many data points', () => {
      const payload = Array.from({ length: 20 }, (_, i) => ({
        name: `Series ${i}`,
        value: Math.random() * 100,
        color: '#0066eb',
      }));
      const { container } = render(
        <ChartTooltip active={true} payload={payload} label={2020} />
      );
      // Should render scrollbar when content is too long
      const scrollableArea = container.querySelector('.overflow-y-auto');
      expect(scrollableArea).toBeInTheDocument();
    });
  });
});

describe('ChartContainer Component', () => {
  const mockChart = (
    <LineChart data={[{ year: 2020, value: 100 }]}>
      <Line dataKey='value' />
    </LineChart>
  );

  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<ChartContainer title='Test Chart'>{mockChart}</ChartContainer>);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('requires a single child', () => {
      // This should work with a single child
      const { container } = render(
        <ChartContainer title='Test'>{mockChart}</ChartContainer>
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('applies title as aria-label', () => {
      render(
        <ChartContainer title='Population Growth Chart'>
          {mockChart}
        </ChartContainer>
      );
      const chart = screen.getByRole('region');
      expect(chart).toHaveAttribute(
        'aria-label',
        'Statistical chart showing Population Growth Chart'
      );
    });

    it('has role="region" for accessibility', () => {
      render(<ChartContainer title='Test Chart'>{mockChart}</ChartContainer>);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });
  });

  describe('Styling', () => {
    it('applies custom className', () => {
      const { container } = render(
        <ChartContainer title='Test' className='custom-class'>
          {mockChart}
        </ChartContainer>
      );
      const card = container.firstChild as HTMLElement;
      expect(card).toHaveClass('custom-class');
    });
  });

  describe('Dimensions', () => {
    it('uses default height when not specified', () => {
      render(<ChartContainer title='Test'>{mockChart}</ChartContainer>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('uses custom height when provided', () => {
      render(
        <ChartContainer title='Test' height={500}>
          {mockChart}
        </ChartContainer>
      );
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '500px' });
    });

    it('supports string height values', () => {
      render(
        <ChartContainer title='Test' height='100%'>
          {mockChart}
        </ChartContainer>
      );
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '100%' });
    });

    it('sets font size from CHART_THEME', () => {
      render(<ChartContainer title='Test'>{mockChart}</ChartContainer>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ fontSize: '10px' });
    });

    it('sets width to 100%', () => {
      render(<ChartContainer title='Test'>{mockChart}</ChartContainer>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ width: '100%' });
    });
  });

  describe('Edge Cases', () => {
    it('renders with empty title', () => {
      render(<ChartContainer title=''>{mockChart}</ChartContainer>);
      expect(screen.getByRole('region')).toBeInTheDocument();
    });

    it('renders with special characters in title', () => {
      render(
        <ChartContainer title='Chart: FY 2024-2025 (Q1)'>
          {mockChart}
        </ChartContainer>
      );
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        'Statistical chart showing Chart: FY 2024-2025 (Q1)'
      );
    });

    it('handles very long titles', () => {
      const longTitle =
        'This is a very long chart title that describes detailed metrics';
      render(<ChartContainer title={longTitle}>{mockChart}</ChartContainer>);
      expect(screen.getByRole('region')).toHaveAttribute(
        'aria-label',
        `Statistical chart showing ${longTitle}`
      );
    });

    it('handles height of 0', () => {
      render(
        <ChartContainer title='Test' height={0}>
          {mockChart}
        </ChartContainer>
      );
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '0px' });
    });
  });
});

describe('ResponsiveChart Component', () => {
  const mockChart = (
    <LineChart data={[{ year: 2020, value: 100 }]}>
      <Line dataKey='value' />
    </LineChart>
  );

  describe('Rendering', () => {
    it('renders children without card styling', () => {
      render(<ResponsiveChart height={300}>{mockChart}</ResponsiveChart>);
      expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
    });

    it('does not add card container', () => {
      const { container } = render(
        <ResponsiveChart height={300}>{mockChart}</ResponsiveChart>
      );
      const card = container.querySelector('.rounded-3xl');
      expect(card).not.toBeInTheDocument();
    });

    it('applies custom className when provided', () => {
      const { container } = render(
        <ResponsiveChart height={300} className='custom-chart'>
          {mockChart}
        </ResponsiveChart>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-chart');
    });
  });

  describe('Dimensions', () => {
    it('uses default height when not specified', () => {
      render(<ResponsiveChart>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '400px' });
    });

    it('uses custom height when provided', () => {
      render(<ResponsiveChart height={500}>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '500px' });
    });

    it('sets width to 100%', () => {
      render(<ResponsiveChart height={300}>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ width: '100%' });
    });

    it('sets font size from CHART_THEME', () => {
      render(<ResponsiveChart height={300}>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ fontSize: '10px' });
    });
  });

  describe('Edge Cases', () => {
    it('handles height of 0', () => {
      render(<ResponsiveChart height={0}>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '0px' });
    });

    it('handles very large heights', () => {
      render(<ResponsiveChart height={2000}>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      expect(container).toHaveStyle({ height: '2000px' });
    });

    it('handles percentage height values', () => {
      render(<ResponsiveChart height='50vh'>{mockChart}</ResponsiveChart>);
      const container = screen.getByTestId('responsive-container');
      // jsdom converts vh to pixels, so we check that height is set
      const height = container.style.height;
      expect(height).toBeTruthy();
      expect(height).toMatch(/^\d+(\.\d+)?(px|vh)$/);
    });
  });
});

describe('Chart Components Integration', () => {
  it('ChartContainer wraps chart in accessible region', () => {
    render(
      <ChartContainer title='Integration Test'>
        <LineChart data={[{ year: 2020, value: 100 }]}>
          <CartesianGrid stroke='#f1f5f9' />
          <XAxis dataKey='year' />
          <YAxis />
          <Tooltip content={<ChartTooltip />} />
          <Line type='monotone' dataKey='value' stroke='#0066eb' />
        </LineChart>
      </ChartContainer>
    );
    expect(screen.getByRole('region')).toHaveAttribute(
      'aria-label',
      'Statistical chart showing Integration Test'
    );
  });

  it('ResponsiveChart renders chart without card wrapper', () => {
    render(
      <ResponsiveChart height={300}>
        <LineChart data={[{ year: 2020, value: 100 }]}>
          <Line dataKey='value' />
        </LineChart>
      </ResponsiveChart>
    );
    expect(screen.getByTestId('responsive-container')).toBeInTheDocument();
  });
});
