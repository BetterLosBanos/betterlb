# Design System Contribution Guide

**Guide for contributing new components, patterns, and updates to the BetterLB design system**

---

## Table of Contents

1. [Overview](#overview)
2. [Contribution Workflow](#contribution-workflow)
3. [Design System Compliance](#design-system-compliance)
4. [Component Creation Workflow](#component-creation-workflow)
5. [Testing Standards](#testing-standards)
6. [Documentation Standards](#documentation-standards)
7. [Review Process](#review-process)
8. [Common Patterns](#common-patterns)

---

## Overview

The BetterLB design system is built on:
- **Kapwa Design System Fork** (@betterlb/kapwa) - Base components and semantic tokens
- **Local UI Components** (src/components/ui/) - BetterLB-specific components
- **Design Tokens** - Kapwa semantic tokens for consistent styling
- **Tailwind CSS v4** - Utility-first styling with CSS variables

### What Belongs Where?

**Contribute to Kapwa fork (@betterlb/kapwa) when:**
- Creating generic, reusable components (Button, Input, Label)
- Adding new design tokens (colors, spacing, typography)
- Updating base component patterns

**Contribute to local UI components (src/components/ui/) when:**
- Creating BetterLB-specific components (StatCard, Timeline, Ticker)
- Building domain-specific patterns (ServiceCard, DocumentTable)
- Integrating with BetterLB data structures

---

## Contribution Workflow

### Standard Workflow

```
1. Propose   → Discuss idea in issue or discussion
2. Specify  → Create component spec using template
3. Implement → Write component code following standards
4. Test      → Write unit, a11y, and visual tests
5. Document → Add JSDoc, usage examples, props table
6. PR        → Submit for design and code review
```

### 1. Propose

Before building, discuss your component idea:

**Where to Propose:**
- GitHub Issues: "Feature: [Component Name]"
- GitHub Discussions: Design system category

**What to Include:**
- Component purpose and use cases
- Visual design reference (Figma, screenshot, or description)
- Similar components (existing or external)
- Expected variants/props

**Example:**
```
Feature: ServiceCard component

Purpose: Display service information with consistent styling
Use cases: Services directory, service detail pages, related services
Similar components: Card (base), StatCard (local)
Variants: Default, featured, compact
```

### 2. Specify

Create a component specification:

**Template:** `docs/component-spec-template.md`

**Required Sections:**
- Component name and purpose
- Prop interface (TypeScript)
- Variant definitions
- Accessibility requirements
- Usage examples
- Test cases

**Output:** `docs/specs/[component-name]-spec.md`

### 3. Implement

**File Location:**
- Local components: `src/components/ui/[ComponentName].tsx`
- Kapwa components: `/mnt/games/github/kapwa/src/components/[ComponentName]/`

**Implementation Checklist:**
- [ ] Use TypeScript strict mode
- [ ] Follow Kapwa semantic token patterns
- [ ] Implement proper prop interfaces
- [ ] Handle edge cases (null, undefined, empty states)
- [ ] Add JSDoc comments
- [ ] Export from index (if needed)

### 4. Test

**Three Test Layers:**

**a) Unit Tests (Vitest)**
```bash
# Create test file
src/components/ui/[ComponentName].test.tsx

# Run tests
npm run test
```

**Test Coverage:**
- Renders with default props
- Renders with all variants
- Handles null/undefined props
- Triggers callbacks (onClick, onChange)
- Displays error states

**b) Accessibility Tests (axe-core)**
```bash
# Create E2E test with a11y tag
e2e/components/[component-name].spec.ts

# Run with accessibility
npm run test:e2e
```

**Accessibility Requirements:**
- WCAG 2.1 Level AA compliant
- Keyboard navigable (Tab, Enter, Escape, Arrow keys)
- Screen reader friendly (ARIA labels, roles)
- Color contrast ratio ≥ 4.5:1
- Focus indicators visible

**c) Visual Regression Tests (Playwright)**
```bash
# Add @visual tag to test case
test('@visual Component displays correctly', async ({ page }) => {
  // ...
});
```

### 5. Document

**Required Documentation:**

**a) JSDoc Comments**
```typescript
/**
 * ServiceCard displays service information with consistent styling.
 *
 * @example
 * <ServiceCard
 *   title="Business Permit"
 *   description="Apply for new or renewal business permits"
 *   href="/services/business-permit"
 *   variant="featured"
 * />
 *
 * @see [ServicePage](/docs/services) for usage examples
 */
export function ServiceCard({ /* ... */ }) {
  // ...
}
```

**b) Usage Examples**
```tsx
// Default variant
<ServiceCard title="..." description="..." href="..." />

// Featured variant
<ServiceCard title="..." description="..." href="..." variant="featured" />

// Compact variant
<ServiceCard title="..." description="..." href="..." variant="compact" />

// With icon
<ServiceCard title="..." description="..." href="..." icon={FileText} />
```

**c) Props Table**
```markdown
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| title | string | - | Service name (required) |
| description | string | - | Brief description (required) |
| href | string | - | Link destination (required) |
| variant | 'default' \| 'featured' \| 'compact' | 'default' | Visual style |
| icon | ComponentType | - | Optional icon component |
```

### 6. Pull Request

**PR Template:**
```markdown
## Component: [Component Name]

### Summary
Brief description of what this component does

### Specification
Link to: docs/specs/[component-name]-spec.md

### Changes
- [ ] Added component file: src/components/ui/[ComponentName].tsx
- [ ] Added unit tests: src/components/ui/[ComponentName].test.tsx
- [ ] Added E2E tests: e2e/components/[component-name].spec.ts
- [ ] Added documentation: JSDoc + usage examples
- [ ] Updated index.ts exports (if needed)

### Testing
- [ ] Unit tests pass (npm run test)
- [ ] E2E tests pass (npm run test:e2e)
- [ ] Accessibility tests pass (@a11y tag)
- [ ] Visual regression tests pass (@visual tag)
- [ ] ESLint passes (npm run lint)

### Screenshots
[Attach screenshots or video]

### Checklist
- [ ] Follows Kapwa semantic token patterns
- [ ] TypeScript strict mode compliant
- [ ] WCAG 2.1 Level AA accessible
- [ ] Documented with JSDoc and examples
- [ ] All tests passing
```

---

## Design System Compliance

### Kapwa Semantic Tokens

**Critical Rule: Tailwind v4 Prefixes**

Kapwa semantic classes MUST use Tailwind v4's CSS variable convention:

| Type | Pattern | Example |
|------|---------|---------|
| Text Colors | `text-` prefix required | `text-kapwa-text-strong` |
| Backgrounds | `bg-` prefix required | `bg-kapwa-bg-surface` |
| Borders | `border-` prefix required | `border-kapwa-border-weak` |
| Typography | No prefix | `kapwa-heading-md` |
| Spacing | No prefix | `p-kapwa-md`, `m-kapwa-lg` |

**Semantic vs Raw Colors:**

**Semantic tokens** (for status/feedback that conveys meaning):
```tsx
// ✅ Correct - Conveys success/error/warning
<div className="text-kapwa-text-success">Operation completed</div>
<div className="text-kapwa-text-danger">Error occurred</div>
<div className="text-kapwa-text-warning">Warning message</div>
```

**Raw colors** (for decoration, data visualization, non-semantic styling):
```tsx
// ✅ Correct - Visual decoration only
<div className="bg-kapwa-blue-50">Decorative background</div>
<div className="text-kapwa-orange-600">Brand accent</div>
```

**❌ Common Mistakes:**
```tsx
// ❌ Don't use semantic tokens for decoration
<div className="text-kapwa-text-success">Just green text (no meaning)</div>

// ❌ Don't use raw colors for status
<div className="text-kapwa-green-600">Success message (should be semantic)</div>
```

### TypeScript Strict Mode

**Required Settings:**
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true
  }
}
```

**Component Prop Interface:**
```typescript
// ✅ Correct - Explicit types
interface ServiceCardProps {
  title: string;
  description: string;
  href?: string; // Optional prop
  variant?: 'default' | 'featured' | 'compact';
}

// ❌ Wrong - Implicit any
function ServiceCard({ title, description, variant }) {
  // ...
}
```

### Tailwind CSS v4

**CSS Variable Syntax:**
```css
/* ✅ Correct - Tailwind v4 syntax */
text-(--color-kapwa-text-strong)
bg-(--color-kapwa-bg-surface)
border-(--color-kapwa-border-weak)

/* ❌ Wrong - Old syntax */
text-kapwa-text-strong
bg-kapwa-bg-surface
```

**Component Styling Pattern:**
```tsx
export function MyComponent() {
  return (
    <div className="
      bg-kapwa-bg-surface
      border border-kapwa-border-weak
      p-kapwa-lg
      rounded-kapwa-md
    ">
      <h3 className="kapwa-heading-md text-kapwa-text-strong">
        Title
      </h3>
      <p className="kapwa-body-md text-kapwa-text-support">
        Description
      </p>
    </div>
  );
}
```

---

## Component Creation Workflow

### Step-by-Step Example: ServiceCard

**1. Create Spec** (`docs/specs/service-card-spec.md`)
```markdown
# ServiceCard Component Specification

## Purpose
Display service information with consistent styling across the application.

## Props Interface
```typescript
interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  variant?: 'default' | 'featured' | 'compact';
  icon?: React.ComponentType<{ className?: string }>;
}
```

## Variants
- **Default**: Standard card with title, description, link
- **Featured**: Larger, with icon and emphasized styling
- **Compact**: Smaller, for dense layouts

## Accessibility
- Keyboard accessible (Tab, Enter)
- ARIA labels for screen readers
- Focus indicators visible

## Test Cases
- Renders with all props
- Handles missing icon
- Links work correctly
- Keyboard navigable
```

**2. Implement Component** (`src/components/ui/ServiceCard.tsx`)
```tsx
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

export interface ServiceCardProps {
  title: string;
  description: string;
  href: string;
  variant?: 'default' | 'featured' | 'compact';
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * ServiceCard displays service information with consistent styling.
 *
 * @example
 * <ServiceCard
 *   title="Business Permit"
 *   description="Apply for new or renewal business permits"
 *   href="/services/business-permit"
 *   variant="featured"
 * />
 */
export function ServiceCard({
  title,
  description,
  href,
  variant = 'default',
  icon: Icon,
}: ServiceCardProps) {
  const sizeClasses = {
    default: 'p-kapwa-md',
    featured: 'p-kapwa-lg',
    compact: 'p-kapwa-sm',
  };

  return (
    <Link
      to={href}
      className={`
        group
        bg-kapwa-bg-surface
        border border-kapwa-border-weak
        rounded-kapwa-lg
        ${sizeClasses[variant]}
        hover:border-kapwa-border-focus
        hover:shadow-md
        transition-all
        duration-300
      `}
    >
      {Icon && (
        <div className="mb-kapwa-sm text-kapwa-text-brand">
          <Icon className="h-8 w-8" />
        </div>
      )}

      <h3 className="kapwa-heading-md text-kapwa-text-strong mb-kapwa-xs">
        {title}
      </h3>

      <p className="kapwa-body-md text-kapwa-text-support mb-kapwa-sm">
        {description}
      </p>

      <ArrowRight className="h-4 w-4 text-kapwa-text-link group-hover:translate-x-1 transition-transform" />
    </Link>
  );
}
```

**3. Write Tests** (`src/components/ui/ServiceCard.test.tsx`)
```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ServiceCard } from './ServiceCard';
import { MemoryRouter } from 'react-router-dom';

describe('ServiceCard', () => {
  it('renders with default props', () => {
    render(
      <MemoryRouter>
        <ServiceCard
          title="Test Service"
          description="Test description"
          href="/test"
        />
      </MemoryRouter>
    );

    expect(screen.getByText('Test Service')).toBeInTheDocument();
    expect(screen.getByText('Test description')).toBeInTheDocument();
  });

  it('renders with featured variant', () => {
    render(
      <MemoryRouter>
        <ServiceCard
          title="Test Service"
          description="Test description"
          href="/test"
          variant="featured"
        />
      </MemoryRouter>
    );

    const card = screen.getByRole('link');
    expect(card).toHaveClass('p-kapwa-lg');
  });

  it('renders with icon', () => {
    const MockIcon = () => <svg data-testid="mock-icon" />;

    render(
      <MemoryRouter>
        <ServiceCard
          title="Test Service"
          description="Test description"
          href="/test"
          icon={MockIcon}
        />
      </MemoryRouter>
    );

    expect(screen.getByTestId('mock-icon')).toBeInTheDocument();
  });
});
```

**4. Write E2E Tests** (`e2e/components/service-card.spec.ts`)
```tsx
import { test, expect } from '@playwright/test';

test.describe('ServiceCard', () => {
  test('@visual displays default variant', async ({ page }) => {
    await page.goto('/components/service-card');
    const card = page.getByRole('link', { name: 'Business Permit' });

    await expect(card).toHaveScreenshot();
  });

  test('@a11y is accessible', async ({ page }) => {
    await page.goto('/components/service-card');

    // Check ARIA attributes
    const card = page.getByRole('link', { name: /business permit/i });
    await expect(card).toHaveAttribute('href');

    // Check keyboard navigation
    await page.keyboard.press('Tab');
    await expect(card).toBeFocused();
  });
});
```

**5. Create Documentation Page** (`src/pages/components/service-card.tsx`)
```tsx
import { ServiceCard } from '@/components/ui/ServiceCard';
import { FileText } from 'lucide-react';

export default function ServiceCardDocs() {
  return (
    <div>
      <h1>ServiceCard Component</h1>

      <h2>Usage</h2>
      <ServiceCard
        title="Business Permit"
        description="Apply for new or renewal business permits"
        href="/services/business-permit"
        icon={FileText}
      />

      <h2>Props</h2>
      {/* Props table */}
    </div>
  );
}
```

---

## Testing Standards

### Unit Tests (Vitest)

**Coverage Requirements:**
- Statements: ≥ 80%
- Branches: ≥ 75%
- Functions: ≥ 80%
- Lines: ≥ 80%

**Test File Location:**
```
src/components/ui/
├── ServiceCard.tsx
├── ServiceCard.test.tsx
└── index.ts
```

**Running Tests:**
```bash
# All tests
npm run test

# Watch mode
npm run test -- --watch

# Coverage
npm run test:coverage
```

### Accessibility Tests (Playwright + axe-core)

**Test File Location:**
```
e2e/components/
└── service-card.spec.ts
```

**Required a11y Tests:**
```tsx
test('@a11y passes axe-core scan', async ({ page }) => {
  await page.goto('/components/service-card');
  await expect(page).toHaveNoAccessibilityViolations();
});

test('@a11y keyboard navigable', async ({ page }) => {
  await page.goto('/components/service-card');

  // Tab through interactive elements
  await page.keyboard.press('Tab');
  const focused = page.locator(':focus');
  await expect(focused).toBeVisible();

  // Activate with Enter
  await page.keyboard.press('Enter');
  // Verify action
});
```

**Running a11y Tests:**
```bash
# All E2E tests
npm run test:e2e

# Only a11y tests
npm run test:e2e -- @a11y
```

### Visual Regression Tests (Playwright)

**Screenshot Requirements:**
- Default state
- All variants
- Hover/focus states
- Error/loading states
- Responsive breakpoints (mobile, tablet, desktop)

**Visual Test Pattern:**
```tsx
test('@visual default variant', async ({ page }) => {
  await page.goto('/components/service-card');
  const card = page.getByRole('link', { name: 'Business Permit' });
  await expect(card).toHaveScreenshot();
});

test('@visual featured variant', async ({ page }) => {
  await page.goto('/components/service-card?variant=featured');
  const card = page.getByRole('link', { name: 'Business Permit' });
  await expect(card).toHaveScreenshot();
});
```

**Running Visual Tests:**
```bash
# Update screenshots
npm run test:e2e -- @visual

# Compare against baseline
npm run test:e2e
```

---

## Documentation Standards

### JSDoc Comments

**Required for:**
- All exported components
- Public functions
- Complex prop interfaces

**JSDoc Template:**
```typescript
/**
 * Brief one-line description.
 *
 * Longer description if needed. Explain what the component does,
 * when to use it, and any important considerations.
 *
 * @example
 * // Usage example
 * <Component prop="value" />
 *
 * @see [Link to related docs](/path/to/docs)
 *
 * @param props - Component props
 */
export function Component(props: ComponentProps) {
  // ...
}
```

### Usage Examples

**Provide Examples For:**
- Default usage
- All variants
- Common combinations
- Edge cases (loading, error, empty states)

**Example Format:**
```tsx
// Default usage
<ServiceCard
  title="Business Permit"
  description="Apply for permits"
  href="/services/business-permit"
/>

// With icon
<ServiceCard
  title="Business Permit"
  description="Apply for permits"
  href="/services/business-permit"
  icon={FileText}
/>

// Featured variant
<ServiceCard
  title="Business Permit"
  description="Apply for permits"
  href="/services/business-permit"
  variant="featured"
/>
```

### Props Table

**Markdown Table Format:**
```markdown
| Prop | Type | Default | Required | Description |
|------|------|---------|----------|-------------|
| title | string | - | Yes | Service name |
| description | string | - | Yes | Brief description |
| href | string | - | Yes | Link destination |
| variant | 'default' \| 'featured' \| 'compact' | 'default' | No | Visual style variant |
| icon | ComponentType | - | No | Optional icon component |
```

---

## Review Process

### Design Review

**Before Implementation:**
1. Create component spec (`docs/specs/[name]-spec.md`)
2. Discuss in GitHub Issue or Discussion
3. Get approval from maintainers

**Review Criteria:**
- Component purpose is clear
- Fits within design system
- Variants are well-defined
- Accessibility considered
- Not duplicating existing components

### Code Review

**During PR Review:**

**Automated Checks:**
- [ ] TypeScript compilation passes (`npx tsc --noEmit`)
- [ ] ESLint passes with zero warnings (`npm run lint`)
- [ ] Unit tests pass (`npm run test`)
- [ ] E2E tests pass (`npm run test:e2e`)
- [ ] Accessibility tests pass (`@a11y` tag)
- [ ] Visual regression tests pass (`@visual` tag)

**Manual Review:**
- [ ] Kapwa semantic tokens used correctly
- [ ] TypeScript strict mode compliant
- [ ] Prop interfaces well-defined
- [ ] Edge cases handled
- [ ] JSDoc comments complete
- [ ] Usage examples provided
- [ ] Tests cover all variants
- [ ] No console errors or warnings

**Approval Criteria:**
- At least one maintainer approval
- All automated checks passing
- No outstanding review comments
- Documentation complete

---

## Common Patterns

### Component with Variants

```tsx
interface ComponentProps {
  variant?: 'default' | 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function Component({ variant = 'default', size = 'md' }: ComponentProps) {
  const variantClasses = {
    default: 'bg-kapwa-bg-surface border-kapwa-border-weak',
    primary: 'bg-kapwa-blue-600 text-kapwa-text-inverse',
    secondary: 'bg-kapwa-orange-600 text-kapwa-text-inverse',
  };

  const sizeClasses = {
    sm: 'p-kapwa-sm kapwa-body-sm',
    md: 'p-kapwa-md kapwa-body-md',
    lg: 'p-kapwa-lg kapwa-body-lg',
  };

  return (
    <div className={`${variantClasses[variant]} ${sizeClasses[size]}`}>
      {/* ... */}
    </div>
  );
}
```

### Component with Forward Ref

```tsx
import { forwardRef } from 'react';

export interface ComponentProps {
  // ...props
}

export const Component = forwardRef<HTMLDivElement, ComponentProps>(
  (props, ref) => {
    return <div ref={ref} {/* ... */} />;
  }
);

Component.displayName = 'Component';
```

### Component with Children

```tsx
interface ComponentProps {
  children: React.ReactNode;
  // ...other props
}

export function Component({ children }: ComponentProps) {
  return (
    <div className="bg-kapwa-bg-surface p-kapwa-md">
      {children}
    </div>
  );
}
```

### Accessible Button Component

```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'danger';
  loading?: boolean;
}

export function Button({
  variant = 'default',
  loading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      aria-busy={loading}
      className={/* ... */}
      {...props}
    >
      {loading ? <Spinner /> : children}
    </button>
  );
}
```

---

## Resources

**Documentation:**
- [BetterLB Design System Guide](/docs/BetterLB-Design-System-Guide.md)
- [Kapwa Semantic Guide](/KAPWA_SEMANTIC_GUIDE.md)
- [Component Spec Template](/docs/component-spec-template.md)
- [ARCHITECTURE.md](/ARCHITECTURE.md)

**Tools:**
- [Vitest Documentation](https://vitest.dev/)
- [Playwright Documentation](https://playwright.dev/)
- [axe-core Documentation](https://www.deque.com/axe/)
- [Tailwind CSS v4](https://tailwindcss.com/docs)

**Community:**
- GitHub Issues: [betterlb/issues](https://github.com/BetterLosBanos/betterlb/issues)
- GitHub Discussions: [betterlb/discussions](https://github.com/BetterLosBanos/betterlb/discussions)

---

**Last Updated:** 2026-02-27
**Maintained By:** BetterLB Development Team
