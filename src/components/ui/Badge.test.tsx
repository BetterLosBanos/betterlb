import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import { Badge } from './Badge';

describe('Badge Component', () => {
  describe('Rendering', () => {
    it('renders children correctly', () => {
      render(<Badge>Test Badge</Badge>);
      expect(screen.getByText('Test Badge')).toBeInTheDocument();
    });

    it('renders with default variant', () => {
      const { container } = render(<Badge>Default</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-brand-weak');
    });

    it('renders with custom className', () => {
      const { container } = render(
        <Badge className='custom-class'>Test</Badge>
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('custom-class');
    });

    it('passes through HTML attributes', () => {
      const { container } = render(
        <Badge data-testid='test-badge' aria-label='Test Label'>
          Test
        </Badge>
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveAttribute('data-testid', 'test-badge');
      expect(badge).toHaveAttribute('aria-label', 'Test Label');
    });
  });

  describe('Variants', () => {
    it('applies primary variant classes', () => {
      const { container } = render(<Badge variant='primary'>Primary</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-brand-weak');
      expect(badge).toHaveClass('text-kapwa-text-brand');
      expect(badge).toHaveClass('border-kapwa-border-brand');
    });

    it('applies secondary variant classes', () => {
      const { container } = render(
        <Badge variant='secondary'>Secondary</Badge>
      );
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-accent-orange-weak');
      expect(badge).toHaveClass('text-kapwa-text-accent-orange');
    });

    it('applies success variant classes', () => {
      const { container } = render(<Badge variant='success'>Success</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-success-weak');
      expect(badge).toHaveClass('text-kapwa-text-success');
      expect(badge).toHaveClass('border-kapwa-border-success');
    });

    it('applies warning variant classes', () => {
      const { container } = render(<Badge variant='warning'>Warning</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-warning-weak');
      expect(badge).toHaveClass('text-kapwa-text-warning');
      expect(badge).toHaveClass('border-kapwa-border-warning');
    });

    it('applies error variant classes', () => {
      const { container } = render(<Badge variant='error'>Error</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-danger-weak');
      expect(badge).toHaveClass('text-kapwa-text-danger');
      expect(badge).toHaveClass('border-kapwa-border-danger');
    });

    it('applies slate variant classes', () => {
      const { container } = render(<Badge variant='slate'>Slate</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-bg-surface-raised');
      expect(badge).toHaveClass('text-kapwa-text-support');
      expect(badge).toHaveClass('border-kapwa-border-weak');
    });

    it('applies outline variant classes', () => {
      const { container } = render(<Badge variant='outline'>Outline</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-transparent');
      expect(badge).toHaveClass('text-kapwa-text-support');
      expect(badge).toHaveClass('border-kapwa-border-weak');
    });

    it('applies yellow variant classes', () => {
      const { container } = render(<Badge variant='yellow'>Yellow</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('bg-kapwa-yellow-50');
      expect(badge).toHaveClass('text-kapwa-yellow-700');
      expect(badge).toHaveClass('border-kapwa-yellow-600');
    });
  });

  describe('Dot Indicator', () => {
    it('does not render dot when dot prop is false', () => {
      const { container } = render(<Badge dot={false}>Test</Badge>);
      const dot = container.querySelector('.rounded-full');
      expect(dot).not.toBeInTheDocument();
    });

    it('renders dot when dot prop is true', () => {
      const { container } = render(<Badge dot>Test</Badge>);
      const dot = container.querySelector('.rounded-full');
      expect(dot).toBeInTheDocument();
      expect(dot).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies correct dot color for primary variant', () => {
      const { container } = render(
        <Badge dot variant='primary'>
          Test
        </Badge>
      );
      const dot = container.querySelector('.rounded-full');
      expect(dot).toHaveClass('bg-kapwa-bg-brand-default');
    });

    it('applies correct dot color for success variant', () => {
      const { container } = render(
        <Badge dot variant='success'>
          Test
        </Badge>
      );
      const dot = container.querySelector('.rounded-full');
      expect(dot).toHaveClass('bg-kapwa-bg-success-default');
    });

    it('applies correct dot color for error variant', () => {
      const { container } = render(
        <Badge dot variant='error'>
          Test
        </Badge>
      );
      const dot = container.querySelector('.rounded-full');
      expect(dot).toHaveClass('bg-kapwa-bg-danger-default');
    });
  });

  describe('Accessibility', () => {
    it('has inline-flex display for proper layout', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('inline-flex');
    });

    it('has items-center for proper alignment', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('items-center');
    });

    it('has gap for spacing between dot and text', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('gap-1.5');
    });

    it('has rounded-md corners', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('rounded-md');
    });

    it('has border for visual definition', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('border');
    });

    it('has proper text sizing', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('text-[10px]');
    });

    it('has uppercase text for consistency', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('uppercase');
    });

    it('has tracking-widest for readability', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('tracking-widest');
    });
  });

  describe('Styling Classes', () => {
    it('has px-2 py-0.5 padding', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('px-2');
      expect(badge).toHaveClass('py-0.5');
    });

    it('has font-bold weight', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('font-bold');
    });

    it('has transition-all for animations', () => {
      const { container } = render(<Badge>Test</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toHaveClass('transition-all');
    });
  });

  describe('Edge Cases', () => {
    it('renders empty string as children', () => {
      const { container } = render(<Badge>{''}</Badge>);
      const badge = container.querySelector('span');
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent('');
    });

    it('renders special characters in children', () => {
      render(<Badge>Special & Characters</Badge>);
      expect(screen.getByText('Special & Characters')).toBeInTheDocument();
    });

    it('renders long text without overflow issues', () => {
      const longText =
        'This is a very long badge text that should not overflow';
      render(<Badge>{longText}</Badge>);
      expect(screen.getByText(longText)).toBeInTheDocument();
    });

    it('renders numbers as children', () => {
      render(<Badge>{123}</Badge>);
      expect(screen.getByText('123')).toBeInTheDocument();
    });
  });

  describe('Composability', () => {
    it('can be used with other elements', () => {
      render(
        <div>
          <Badge>Parent</Badge>
        </div>
      );
      expect(screen.getByText('Parent')).toBeInTheDocument();
    });

    it('can render multiple badges', () => {
      render(
        <>
          <Badge variant='primary'>First</Badge>
          <Badge variant='success'>Second</Badge>
          <Badge variant='error'>Third</Badge>
        </>
      );
      expect(screen.getByText('First')).toBeInTheDocument();
      expect(screen.getByText('Second')).toBeInTheDocument();
      expect(screen.getByText('Third')).toBeInTheDocument();
    });
  });
});
