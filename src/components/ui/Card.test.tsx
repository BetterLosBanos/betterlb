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

    it('applies custom className', () => {
      const { container } = render(
        <Card className='custom-class'>Content</Card>
      );
      const card = container.querySelector('article');
      expect(card).toHaveClass('custom-class');
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
  });

  describe('CardDivider', () => {
    it('renders as hr element', () => {
      const { container } = render(<CardDivider />);
      const divider = container.querySelector('hr');
      expect(divider).toBeInTheDocument();
    });
  });
});
