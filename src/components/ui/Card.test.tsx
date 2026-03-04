import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  CardTitle,
  CardDescription,
  CardImage,
  CardAvatar,
  CardContactInfo,
  CardGrid,
  CardList,
  CardDivider,
} from './Card';

describe('Card Component', () => {
  describe('Main Card Component', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <span>Card Content</span>
        </Card>
      );
      expect(screen.getByText('Card Content')).toBeInTheDocument();
    });

    it('renders as article element for semantics', () => {
      const { container } = render(
        <Card>
          <span>Content</span>
        </Card>
      );
      const card = container.querySelector('article');
      expect(card).toBeInTheDocument();
    });

    it('applies default variant classes', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('bg-kapwa-bg-surface');
      expect(card).toHaveClass('border-kapwa-border-weak');
      expect(card).toHaveClass('shadow-sm');
    });

    it('applies featured variant classes', () => {
      const { container } = render(<Card variant='featured'>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('border-kapwa-border-brand');
      expect(card).toHaveClass('shadow-md');
      expect(card).toHaveClass('ring-1');
    });

    it('applies slate variant classes', () => {
      const { container } = render(<Card variant='slate'>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('shadow-none');
    });

    it('applies compact variant classes', () => {
      const { container } = render(<Card variant='compact'>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('shadow-xs');
      expect(card).toHaveClass('text-sm');
    });

    it('applies hover effects when hover is true', () => {
      const { container } = render(<Card hover>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('hover:border-kapwa-border-brand');
      expect(card).toHaveClass('hover:-translate-y-0.5');
      expect(card).toHaveClass('hover:shadow-lg');
    });

    it('does not apply hover effects when hover is false', () => {
      const { container } = render(<Card hover={false}>Content</Card>);
      const card = container.querySelector('article');
      expect(card).not.toHaveClass('hover:border-kapwa-border-brand');
    });

    it('applies custom className', () => {
      const { container } = render(
        <Card className='custom-class'>Content</Card>
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('custom-class');
    });

    it('has rounded-2xl corners', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('rounded-2xl');
    });

    it('has border styling', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('border');
    });

    it('has overflow-hidden', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('overflow-hidden');
    });

    it('has transition classes', () => {
      const { container } = render(<Card>Content</Card>);
      const card = container.querySelector('article');
      expect(card).toHaveClass('transition-all');
      expect(card).toHaveClass('duration-300');
    });
  });

  describe('CardHeader', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardHeader>Header Content</CardHeader>
        </Card>
      );
      expect(screen.getByText('Header Content')).toBeInTheDocument();
    });

    it('renders as header element', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = container.querySelector('header');
      expect(header).toBeInTheDocument();
    });

    it('has border-bottom styling', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = container.querySelector('header');
      expect(header).toHaveClass('border-b');
      expect(header).toHaveClass('border-kapwa-border-weak');
    });

    it('has responsive padding', () => {
      const { container } = render(
        <Card>
          <CardHeader>Header</CardHeader>
        </Card>
      );
      const header = container.querySelector('header');
      expect(header).toHaveClass('p-4');
      expect(header).toHaveClass('md:p-6');
    });
  });

  describe('CardContent', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('has responsive padding', () => {
      const { container } = render(
        <Card>
          <CardContent>Content</CardContent>
        </Card>
      );
      const content = container.querySelector('div');
      expect(content).toHaveClass('p-4');
      expect(content).toHaveClass('md:p-6');
    });
  });

  describe('CardFooter', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      expect(screen.getByText('Footer')).toBeInTheDocument();
    });

    it('renders as footer element', () => {
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = container.querySelector('footer');
      expect(footer).toBeInTheDocument();
    });

    it('has border-top styling', () => {
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('border-t');
      expect(footer).toHaveClass('border-kapwa-border-weak');
    });

    it('has subtle background', () => {
      const { container } = render(
        <Card>
          <CardFooter>Footer</CardFooter>
        </Card>
      );
      const footer = container.querySelector('footer');
      expect(footer).toHaveClass('bg-kapwa-bg-surface/50');
    });
  });

  describe('CardTitle', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      expect(screen.getByText('Title')).toBeInTheDocument();
    });

    it('renders as h3 by default', () => {
      const { container } = render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h3');
      expect(title).toBeInTheDocument();
    });

    it('renders with custom heading level', () => {
      const { container } = render(
        <Card>
          <CardTitle level='h1'>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h1');
      expect(title).toBeInTheDocument();
    });

    it('applies correct text size for h1', () => {
      const { container } = render(
        <Card>
          <CardTitle level='h1'>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h1');
      expect(title).toHaveClass('text-3xl');
    });

    it('applies correct text size for h2', () => {
      const { container } = render(
        <Card>
          <CardTitle level='h2'>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h2');
      expect(title).toHaveClass('text-2xl');
    });

    it('has strong text color', () => {
      const { container } = render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h3');
      expect(title).toHaveClass('text-kapwa-text-strong');
    });

    it('has tracking-tight', () => {
      const { container } = render(
        <Card>
          <CardTitle>Title</CardTitle>
        </Card>
      );
      const title = container.querySelector('h3');
      expect(title).toHaveClass('tracking-tight');
    });
  });

  describe('CardDescription', () => {
    it('renders children correctly', () => {
      render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      expect(screen.getByText('Description')).toBeInTheDocument();
    });

    it('renders as paragraph element', () => {
      const { container } = render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const desc = container.querySelector('p');
      expect(desc).toBeInTheDocument();
    });

    it('has muted text color', () => {
      const { container } = render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const desc = container.querySelector('p');
      expect(desc).toHaveClass('text-kapwa-text-support');
    });

    it('has margin top', () => {
      const { container } = render(
        <Card>
          <CardDescription>Description</CardDescription>
        </Card>
      );
      const desc = container.querySelector('p');
      expect(desc).toHaveClass('mt-2');
    });
  });

  describe('CardAvatar', () => {
    it('renders first character of name', () => {
      render(<CardAvatar name='John Doe' />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });

    it('renders single character name', () => {
      render(<CardAvatar name='A' />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('has aria-hidden attribute', () => {
      const { container } = render(<CardAvatar name='Test' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveAttribute('aria-hidden', 'true');
    });

    it('applies small size classes', () => {
      const { container } = render(<CardAvatar name='Test' size='sm' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('w-10');
      expect(avatar).toHaveClass('h-10');
    });

    it('applies medium size classes', () => {
      const { container } = render(<CardAvatar name='Test' size='md' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('w-12');
      expect(avatar).toHaveClass('h-12');
      expect(avatar).toHaveClass('md:w-16');
      expect(avatar).toHaveClass('md:h-16');
    });

    it('applies large size classes', () => {
      const { container } = render(<CardAvatar name='Test' size='lg' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('w-20');
      expect(avatar).toHaveClass('h-20');
    });

    it('has rounded-2xl corners', () => {
      const { container } = render(<CardAvatar name='Test' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('rounded-2xl');
    });

    it('has uppercase text', () => {
      const { container } = render(<CardAvatar name='test' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('uppercase');
    });

    it('has font-bold weight', () => {
      const { container } = render(<CardAvatar name='Test' />);
      const avatar = container.querySelector('div');
      expect(avatar).toHaveClass('font-black');
    });
  });

  describe('CardImage', () => {
    it('renders image element', () => {
      const { container } = render(<CardImage src='/test.jpg' alt='Test' />);
      const img = container.querySelector('img');
      expect(img).toBeInTheDocument();
      expect(img).toHaveAttribute('src', '/test.jpg');
    });

    it('has lazy loading', () => {
      const { container } = render(<CardImage src='/test.jpg' alt='Test' />);
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('loading', 'lazy');
    });

    it('has default alt text', () => {
      const { container } = render(<CardImage src='/test.jpg' />);
      const img = container.querySelector('img');
      expect(img).toHaveAttribute('alt', 'Card visualization');
    });

    it('has object-cover class', () => {
      const { container } = render(<CardImage src='/test.jpg' alt='Test' />);
      const img = container.querySelector('img');
      expect(img).toHaveClass('object-cover');
    });

    it('has fixed height container', () => {
      const { container } = render(<CardImage src='/test.jpg' alt='Test' />);
      const containerDiv = container.querySelector('.h-48');
      expect(containerDiv).toBeInTheDocument();
    });
  });

  describe('CardContactInfo', () => {
    it('renders address when provided', () => {
      render(
        <Card>
          <CardContactInfo contact={{ address: 'Test Address' }} />
        </Card>
      );
      expect(screen.getByText('Test Address')).toBeInTheDocument();
    });

    it('renders phone when provided', () => {
      render(
        <Card>
          <CardContactInfo contact={{ phone: '(049) 123-4567' }} />
        </Card>
      );
      expect(screen.getByText('(049) 123-4567')).toBeInTheDocument();
    });

    it('renders email link when provided', () => {
      render(
        <Card>
          <CardContactInfo contact={{ email: 'test@example.com' }} />
        </Card>
      );
      const link = screen.getByText('test@example.com');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'mailto:test@example.com');
    });

    it('renders website link when provided', () => {
      render(
        <Card>
          <CardContactInfo contact={{ website: 'example.com' }} />
        </Card>
      );
      const link = screen.getByText('Official Website');
      expect(link).toBeInTheDocument();
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('adds https to website without protocol', () => {
      render(
        <Card>
          <CardContactInfo contact={{ website: 'example.com' }} />
        </Card>
      );
      const link = screen.getByText('Official Website');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('does not modify website with existing protocol', () => {
      render(
        <Card>
          <CardContactInfo contact={{ website: 'https://example.com' }} />
        </Card>
      );
      const link = screen.getByText('Official Website');
      expect(link).toHaveAttribute('href', 'https://example.com');
    });

    it('renders multiple phone numbers', () => {
      render(
        <Card>
          <CardContactInfo
            contact={{ phone: ['(049) 123-4567', '(049) 765-4321'] }}
          />
        </Card>
      );
      expect(screen.getByText('(049) 123-4567')).toBeInTheDocument();
    });

    it('renders as address element', () => {
      const { container } = render(
        <Card>
          <CardContactInfo contact={{ address: 'Test' }} />
        </Card>
      );
      const address = container.querySelector('address');
      expect(address).toBeInTheDocument();
    });

    it('has not-italic class', () => {
      const { container } = render(
        <Card>
          <CardContactInfo contact={{ address: 'Test' }} />
        </Card>
      );
      const address = container.querySelector('address');
      expect(address).toHaveClass('not-italic');
    });

    it('website link opens in new tab', () => {
      render(
        <Card>
          <CardContactInfo contact={{ website: 'example.com' }} />
        </Card>
      );
      const link = screen.getByText('Official Website');
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noreferrer');
    });
  });

  describe('CardGrid', () => {
    it('renders children correctly', () => {
      render(
        <CardGrid>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
        </CardGrid>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });

    it('has list role', () => {
      render(
        <CardGrid>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = screen.getByRole('list');
      expect(grid).toBeInTheDocument();
    });

    it('applies 1 column layout', () => {
      const { container } = render(
        <CardGrid columns={1}>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = container.querySelector('div');
      expect(grid).toHaveClass('grid-cols-1');
    });

    it('applies 2 column layout', () => {
      const { container } = render(
        <CardGrid columns={2}>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = container.querySelector('div');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
    });

    it('applies 3 column layout by default', () => {
      const { container } = render(
        <CardGrid>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = container.querySelector('div');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-3');
    });

    it('applies 4 column layout', () => {
      const { container } = render(
        <CardGrid columns={4}>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = container.querySelector('div');
      expect(grid).toHaveClass('grid-cols-1');
      expect(grid).toHaveClass('md:grid-cols-2');
      expect(grid).toHaveClass('lg:grid-cols-4');
    });

    it('has gap-6 spacing', () => {
      const { container } = render(
        <CardGrid>
          <Card>Card</Card>
        </CardGrid>
      );
      const grid = container.querySelector('div');
      expect(grid).toHaveClass('gap-6');
    });
  });

  describe('CardList', () => {
    it('renders children correctly', () => {
      render(
        <CardList>
          <Card>Card 1</Card>
          <Card>Card 2</Card>
        </CardList>
      );
      expect(screen.getByText('Card 1')).toBeInTheDocument();
      expect(screen.getByText('Card 2')).toBeInTheDocument();
    });

    it('has list role', () => {
      const { container } = render(
        <CardList>
          <Card>Card</Card>
        </CardList>
      );
      const list = container.querySelector('[role="list"]');
      expect(list).toBeInTheDocument();
    });

    it('has space-y-4 spacing', () => {
      const { container } = render(
        <CardList>
          <Card>Card</Card>
        </CardList>
      );
      const list = container.querySelector('div');
      expect(list).toHaveClass('space-y-4');
    });
  });

  describe('CardDivider', () => {
    it('renders as hr element', () => {
      const { container } = render(<CardDivider />);
      const divider = container.querySelector('hr');
      expect(divider).toBeInTheDocument();
    });

    it('has border styling', () => {
      const { container } = render(<CardDivider />);
      const divider = container.querySelector('hr');
      expect(divider).toHaveClass('border-kapwa-border-weak');
    });
  });
});
