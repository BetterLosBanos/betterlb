# BetterLB Design System Guide

> **Comprehensive guide for designing and building pages in the BetterLB municipal portal**

---

## Table of Contents

1. [Introduction & Principles](#1-introduction--principles)
2. [Design Tokens & Visual Language](#2-design-tokens--visual-language)
3. [Component Library](#3-component-library)
4. [Layout Components](#4-layout-components)
5. [Page Layout Patterns](#5-page-layout-patterns)
6. [Navigation Patterns](#6-navigation-patterns)
7. [Grid & Spacing System](#7-grid--spacing-system)
8. [Typography System](#8-typography-system)
9. [Icon Usage](#9-icon-usage)
10. [Interactive States](#10-interactive-states)
11. [Accessibility Standards](#11-accessibility-standards)
12. [Responsive Design](#12-responsive-design)
13. [Animation & Motion](#13-animation--motion)
14. [Common Patterns](#14-common-patterns)
15. [Page Type Guidelines](#15-page-type-guidelines)
16. [Examples & References](#16-examples--references)

---

## 1. Introduction & Principles

### Design Philosophy

**BetterLB Design Identity:** Functional, Efficient, Modern, Usable

The design system prioritizes:
- **Clarity over decoration** - Information should be immediately accessible
- **Efficiency of use** - Minimize clicks and scrolling to reach information
- **Modern expectations** - Current web standards while maintaining government-appropriate dignity
- **Universal usability** - WCAG 2.1 Level AA compliance as a baseline

### Target Audiences

1. **Citizens** - Residents seeking services, information, and updates
2. **Businesses** - Looking for permits, regulations, and economic opportunities
3. **Visitors** - Tourists and researchers exploring Los Baños
4. **Government Staff** - Administrators managing content and services

### Brand Voice & Tone

- **Professional yet approachable** - Government authority without bureaucracy
- **Clear and direct** - Avoid jargon, use plain language
- **Helpful** - Guide users to their goals efficiently
- **Transparent** - Make information easily accessible

---

## 2. Design Tokens & Visual Language

BetterLB uses the **Kapwa Design System** (`@betterlb/kapwa`) for design tokens. This provides a consistent visual language across the application.

### Semantic Token Philosophy

**IMPORTANT:** Use semantic tokens ONLY for their actual semantic purpose.

- **Semantic tokens** (`text-kapwa-text-success`, `text-kapwa-text-danger`, `text-kapwa-text-warning`) are for status/feedback that conveys meaning
- **Raw colors** (`bg-kapwa-green-50`, `text-kapwa-blue-600`) are for decorative, data visualization, or non-semantic styling

**Rule of thumb:** If the color conveys success/error/warning/info → use semantic. If it's just visual decoration or data → use raw colors.

### Critical Rule: Tailwind v4 Prefixes

Kapwa semantic classes MUST use Tailwind v4's CSS variable convention:

| Type | Pattern | Example |
|------|---------|---------|
| Text Colors | `text-` prefix required | `text-kapwa-text-strong` |
| Backgrounds | `bg-` prefix required | `bg-kapwa-bg-surface` |
| Borders | `border-` prefix required | `border-kapwa-border-weak` |
| Typography | No prefix | `kapwa-heading-md` |
| Spacing | No prefix | `p-kapwa-md`, `m-kapwa-lg` |

### Text Colors

```tsx
// Primary text - headlines, important content
<h1 className="text-kapwa-text-strong">Main Heading</h1>

// Secondary text - body, descriptions
<p className="text-kapwa-text-support">Supporting information</p>

// Disabled/inactive text
<span className="text-kapwa-text-disabled">Disabled option</span>

// Inverse text (on dark backgrounds)
<div className="bg-kapwa-bg-surface-bold">
  <p className="text-kapwa-text-inverse">White text on dark</p>
</div>

// Links
<a className="text-kapwa-text-link hover:text-kapwa-text-link-hover">Click here</a>

// Brand accent
<span className="text-kapwa-text-brand">Brand colored</span>

// Status colors
<p className="text-kapwa-text-success">Operation successful!</p>
<p className="text-kapwa-text-danger">Error occurred</p>
<p className="text-kapwa-text-warning">Please be careful</p>
<p className="text-kapwa-text-info">For your information</p>
```

### Background Colors

```tsx
// Base white surface
<div className="bg-kapwa-bg-surface">Default background</div>

// Slightly raised surface (cards, panels)
<div className="bg-kapwa-bg-surface-raised">Card background</div>

// Brand-tinted surface
<div className="bg-kapwa-bg-surface-brand">Brand section</div>

// Dark/bold surface (use inverse text)
<div className="bg-kapwa-bg-surface-bold">
  <p className="text-kapwa-text-inverse">White text on dark</p>
</div>

// Interactive states
<button className="bg-kapwa-bg-surface hover:bg-kapwa-bg-hover">
  Hover me
</button>

// Brand backgrounds (buttons, CTAs)
<button className="bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover">
  Primary Action
</button>

// Status backgrounds - USE RAW COLORS, not semantic backgrounds
<div className="bg-kapwa-green-50 border border-kapwa-green-200">
  <p className="text-kapwa-text-success">Success message!</p>
</div>
<div className="bg-kapwa-red-50 border border-kapwa-red-200">
  <p className="text-kapwa-text-danger">Error message!</p>
</div>
<div className="bg-kapwa-orange-50 border border-kapwa-orange-200">
  <p className="text-kapwa-text-warning">Warning message!</p>
</div>
```

### Border Colors

```tsx
// Subtle border (most common)
<div className="border border-kapwa-border-weak">Default border</div>

// Strong border (emphasis)
<div className="border border-kapwa-border-strong">Emphasized border</div>

// Focus border
<input className="border border-kapwa-border-weak focus:border-kapwa-border-focus" />

// Brand border
<div className="border border-kapwa-border-brand">Brand bordered</div>

// Status borders - USE RAW COLORS
<div className="border border-kapwa-green-300">Success</div>
<div className="border border-kapwa-red-300">Error</div>
<div className="border border-kapwa-orange-300">Warning</div>
```

### Typography

```tsx
// Headings (responsive pattern)
<h1 className="kapwa-heading-md md:kapwa-heading-lg lg:kapwa-heading-xl">
  Responsive Title
</h1>

// Body text with variants
<p className="kapwa-body-md-default">Default body (1rem)</p>
<p className="kapwa-body-md-strong">Default bold (1rem, 700)</p>

// Labels
<label className="kapwa-label-md">Default label (1rem, 700)</label>

// Links
<a className="kapwa-link-md">Default link (1rem, underlined)</a>
```

### Spacing

Use Kapwa spacing utilities with `kapwa-` prefix:

| Class | Size | Pixels |
|-------|------|--------|
| `p-kapwa-3xs` | 0.125rem | 2px |
| `p-kapwa-2xs` | 0.25rem | 4px |
| `p-kapwa-xs` | 0.5rem | 8px |
| `p-kapwa-sm` | 0.75rem | 12px |
| `p-kapwa-md` | 1rem | 16px |
| `p-kapwa-lg` | 1.5rem | 24px |
| `p-kapwa-xl` | 2rem | 32px |
| `p-kapwa-2xl` | 2.5rem | 40px |
| `p-kapwa-3xl` | 3rem | 48px |

```tsx
// Padding
<div className="p-kapwa-md">Medium padding (16px)</div>
<div className="px-kapwa-lg py-kapwa-sm">Horizontal 24px, Vertical 12px</div>

// Gap
<div className="flex gap-kapwa-md">16px gap between children</div>
```

### Common Mistakes to Avoid

```tsx
// ❌ DON'T: Forget text- prefix for text colors
<div className="kapwa-text-strong">Wrong</div>

// ✅ DO: Always use text- prefix for text colors
<div className="text-kapwa-text-strong">Correct</div>

// ❌ DON'T: Forget bg- prefix for backgrounds
<div className="kapwa-bg-surface">Wrong</div>

// ✅ DO: Always use bg- prefix for backgrounds
<div className="bg-kapwa-bg-surface">Correct</div>

// ❌ DON'T: Forget border- prefix for borders
<div className="border kapwa-border-weak">Wrong</div>

// ✅ DO: Always use border- prefix for borders
<div className="border border-kapwa-border-weak">Correct</div>

// ❌ DON'T: Use non-existent semantic backgrounds
<div className="bg-kapwa-bg-danger-weak text-kapwa-text-danger">Error</div>

// ✅ DO: Use raw colors for backgrounds, semantic for text
<div className="bg-kapwa-red-50 text-kapwa-text-danger">Error</div>
```

### Complete Kapwa Color Reference

#### Raw Color Scales (Use for decorative/non-semantic styling)

| Scale | Tokens (50-950) | Use For |
|-------|-----------------|---------|
| `kapwa-brand-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Brand colors, primary actions |
| `kapwa-red-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Errors, destructive actions, data viz |
| `kapwa-green-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Success states, positive trends, data viz |
| `kapwa-yellow-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Warnings, highlights, data viz |
| `kapwa-orange-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Warnings, secondary brand, data viz |
| `kapwa-purple-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Decorative, data visualization |
| `kapwa-blue-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Info, links, data visualization |
| `kapwa-gray-*` | 50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950 | Neutral borders, dividers |
| `kapwa-neutral-*` | 50, 100, 200, 300 | Neutral backgrounds, text |

#### Semantic Text Colors (ONLY for actual semantic meaning)

| Token | Maps To | Use For |
|-------|---------|---------|
| `text-kapwa-text-strong` | Gray/950 | Primary text, headings |
| `text-kapwa-text-support` | Gray/700 | Body text, descriptions |
| `text-kapwa-text-disabled` | Gray/500 | Disabled text, labels |
| `text-kapwa-text-on-disabled` | Gray/600 | Labels on disabled elements |
| `text-kapwa-text-inverse` | Neutral/50 | Text on dark backgrounds |
| `text-kapwa-text-inverse-subtle` | Gray/400 | Subtle text on dark backgrounds |
| `text-kapwa-text-link` | Blue/500 | Links |
| `text-kapwa-text-link-hover` | Blue/600 | Link hover state |
| `text-kapwa-text-link-visited` | Blue/700 | Visited links |
| `text-kapwa-text-brand` | Brand/600 | Brand accents |
| `text-kapwa-text-brand-bold` | Brand/950 | Strong brand emphasis |
| `text-kapwa-text-success` | Green/600 | **SUCCESS states only** |
| `text-kapwa-text-danger` | Red/600 | **ERROR/FAILURE states only** |
| `text-kapwa-text-warning` | Orange/600 | **WARNING states only** |
| `text-kapwa-text-info` | Blue/600 | **INFO states only** |

#### Semantic Background Colors

| Token | Maps To | Use For |
|-------|---------|---------|
| `bg-kapwa-bg-surface` | Neutral/50 | Default white surface |
| `bg-kapwa-bg-surface-raised` | Gray/50 | Card backgrounds |
| `bg-kapwa-bg-surface-brand` | Brand/100 | Brand-tinted sections |
| `bg-kapwa-bg-surface-bold` | Gray/950 | Dark/footer backgrounds |
| `bg-kapwa-bg-surface-adaptive` | Neutral/100 | Theme-aware backgrounds |
| `bg-kapwa-bg-surface-brand-active` | Brand/50 | Active brand sections |
| `bg-kapwa-bg-hover` | Neutral/200 | Hover state |
| `bg-kapwa-bg-active` | Neutral/300 | Active/pressed state |
| `bg-kapwa-bg-disabled` | Neutral/300 | Disabled backgrounds |
| `bg-kapwa-bg-focus` | Yellow/500 | Focus indicators |
| `bg-kapwa-bg-overlay` | Custom | Modal overlay |
| `bg-kapwa-bg-brand-default` | Brand/600 | Primary buttons |
| `bg-kapwa-bg-brand-hover` | Brand/700 | Button hover |
| `bg-kapwa-bg-brand-active` | Brand/800 | Button active |
| `bg-kapwa-bg-brand-weak` | Brand/50 | Subtle brand backgrounds |

**IMPORTANT:** There are NO semantic backgrounds for success/danger/warning/info. Use raw color scales (e.g., `bg-kapwa-green-50`, `bg-kapwa-red-50`) for colored backgrounds.

---

## 3. Component Library

BetterLB uses components from two sources:
1. **Local components** in `src/components/ui/`
2. **Shared components** from `@betterlb/ui` package

### Import Pattern

```tsx
// Import shared components
import { Button, Card, Badge, Banner } from '@betterlb/ui';

// Import local components
import { Input, Ticker } from '@/components/ui';
```

### Card Component

**Location:** `src/components/ui/Card.tsx`

The Card component is the most versatile layout element. Use it for displaying discrete items with consistent presentation.

#### Variants

```tsx
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from '@/components/ui/Card';

// Default Card
<Card variant="default">
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>

// Featured Card (brand accent)
<Card variant="featured">
  <CardContent>Featured content</CardContent>
</Card>

// Slate Card (subtle, no shadow)
<Card variant="slate">
  <CardContent>Subtle content</CardContent>
</Card>

// Compact Card (smaller, tight spacing)
<Card variant="compact">
  <CardContent>Compact content</CardContent>
</Card>
```

#### When to Use Each Variant

- **`default`** - Most cards, standard presentation with hover effects
- **`featured`** - Highlighted items, important content, calls-to-action
- **`slate`** - Less emphasized content, informational cards
- **`compact`** - Dense information displays, tables, lists

#### Card Sub-components

```tsx
<Card>
  <CardHeader>
    <CardTitle level="h3">Title</CardTitle>
  </CardHeader>
  <CardContent>
    Main content area with responsive padding
  </CardContent>
  <CardFooter>
    Footer content with subtle background
  </CardFooter>
</Card>
```

#### Card with Contact Info

```tsx
import { CardContactInfo } from '@/components/ui/Card';

<Card>
  <CardContent>
    <CardContactInfo
      contact={{
        address: "123 Main St, Los Baños",
        phone: ["(049) 123-4567", "(049) 765-4321"],
        email: "info@losbanos.gov.ph",
        website: "losbanos.gov.ph"
      }}
    />
  </CardContent>
</Card>
```

#### Card Grid Layout

```tsx
import { CardGrid } from '@/components/ui/Card';

<CardGrid columns={3}>
  <Card>Card 1</Card>
  <Card>Card 2</Card>
  <Card>Card 3</Card>
</CardGrid>

// Responsive columns:
// 1 col: Always single column
// 2 cols: 1 col mobile, 2 cols tablet+
// 3 cols: 1 col mobile, 2 cols tablet, 3 cols desktop
// 4 cols: 1 col mobile, 2 cols tablet, 4 cols desktop
```

### StatCard Component

**Location:** `src/components/ui/StatCard.tsx`

StatCard is a specialized card component for displaying statistical KPIs with trend indicators. It extends the standard Card component with data visualization features.

#### Basic Usage

```tsx
import { StatCard, StatGrid } from '@/components/ui/StatCard';

// Single stat card with trend indicator
<StatCard
  label="Total Population"
  value={123456}
  subtext="Actual Resident Count"
  variant="primary"
  trend={{ value: 2.5, positive: true }}
/>

// Multiple stats using StatGrid
<StatGrid
  columns={3}
  stats={[
    {
      label: "Population",
      value: 123456,
      subtext "Residents",
      variant: "primary",
      trend: { value: 2.5, positive: true }
    },
    {
      label: "Growth Rate",
      value: "2.5%",
      subtext: "Annual Rate",
      variant: "secondary"
    },
    {
      label: "Barangays",
      value: 18,
      variant: "slate",
      icon: Users
    }
  ]}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `label` | `string` | - | Label for the statistic |
| `value` | `string \| number` | - | Value to display |
| `subtext` | `string` | - | Supporting text below value |
| `trend` | `{ value: number, positive: boolean }` | - | Trend indicator with percentage |
| `variant` | `'primary' \| 'secondary' \| 'slate'` | `'slate'` | Bottom border color |
| `icon` | `LucideIcon` | - | Optional icon to display |
| `hover` | `boolean` | `false` | Enable hover effect |

#### When to Use

- **Statistics pages** - Population, competitiveness, municipal income KPIs
- **Dashboard displays** - Any data visualization requiring trend indicators
- **Comparative metrics** - When showing growth/decline patterns

#### Variants

- **`primary`** - Key metrics, main KPIs (blue bottom border)
- **`secondary`** - Secondary metrics, comparisons (orange bottom border)
- **`slate`** - Neutral metrics, administrative data (gray bottom border)

### Badge Component

**Location:** `src/components/ui/Badge.tsx`

Badges provide status indicators and categorical labels.

#### Variants

```tsx
import { Badge } from '@/components/ui/Badge';

<Badge variant="primary">Municipal Blue</Badge>
<Badge variant="secondary">Brand Orange</Badge>
<Badge variant="yellow">Executive Orders</Badge>
<Badge variant="success">Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Closed</Badge>
<Badge variant="slate">Neutral</Badge>
<Badge variant="outline">Border Only</Badge>
```

#### Badge with Dot Indicator

```tsx
// Accessibility: Adds visual shape indicator alongside color
<Badge variant="success" dot>Active</Badge>
```

#### Document Type Badge Helper

For OpenLGU legislative documents, use the `getDocTypeBadgeVariant()` helper to automatically get the correct badge variant based on document type.

```tsx
import { getDocTypeBadgeVariant } from '@/lib/openlgu';

// Returns appropriate variant for document type
<Badge variant={getDocTypeBadgeVariant(doc.type)}>
  {doc.type}
</Badge>

// Mapping:
// - "ordinance"     → "primary" (Blue)
// - "resolution"    → "secondary" (Orange)
// - "executive_order" → "yellow" (Yellow)
// - (unknown)       → "slate" (Gray)
```

**Usage locations:**
- Document cards in index/list pages
- Document detail pages
- Filter badges showing active document type selection

#### When to Use Each Variant

- **`primary`** - Executive/official items, ordinances
- **`secondary`** - Resolutions, contrast items
- **`yellow`** - Executive Orders (legislative)
- **`success`** - Active, verified, completed status
- **`warning`** - Pending, notice, caution
- **`error`** - Closed, cancelled, failed
- **`slate`** - Admin, metadata, neutral
- **`outline`** - Border-only, minimal emphasis

### Document Type Color Scheme

For OpenLGU legislative documents, use the following color scheme to maintain visual consistency across the site.

| Document Type | Color Scheme | Kapwa Raw Tokens |
|---------------|--------------|------------------|
| **Ordinances** | Primary Brand (Blue) | `border-kapwa-brand-600`<br>`bg-kapwa-brand-50`<br>`text-kapwa-brand-700` |
| **Resolutions** | Accent 1 (Orange) | `border-kapwa-orange-600`<br>`bg-kapwa-orange-50`<br>`text-kapwa-orange-700` |
| **Executive Orders** | Accent 2 (Yellow/Gold) | `border-kapwa-yellow-600`<br>`bg-kapwa-yellow-50`<br>`text-kapwa-yellow-700` |

**Accessibility Note:** Text uses `-700` shades for adequate contrast against light backgrounds (WCAG AA compliant).

#### Implementation Example

```tsx
// Ordinances - Primary Brand (Blue)
<div className="border-kapwa-brand-600 bg-kapwa-brand-50 flex items-center gap-3 rounded-lg border p-3">
  <FileText className="text-kapwa-brand-700 h-5 w-5 shrink-0" />
  <div className="flex-1">
    <span className="text-kapwa-brand-700 text-lg font-black">{ordCount}</span>
    <span className="text-kapwa-brand-700 ml-2 text-xs font-bold uppercase">Ordinances</span>
  </div>
</div>

// Resolutions - Accent 1 (Orange)
<div className="border-kapwa-orange-600 bg-kapwa-orange-50 flex items-center gap-3 rounded-lg border p-3">
  <BookOpen className="text-kapwa-orange-700 h-5 w-5 shrink-0" />
  <div className="flex-1">
    <span className="text-kapwa-orange-700 text-lg font-black">{resCount}</span>
    <span className="text-kapwa-orange-700 ml-2 text-xs font-bold uppercase">Resolutions</span>
  </div>
</div>

// Executive Orders - Accent 2 (Yellow/Gold)
<div className="border-kapwa-yellow-600 bg-kapwa-yellow-50 flex items-center gap-3 rounded-lg border p-3">
  <ScrollText className="text-kapwa-yellow-700 h-5 w-5 shrink-0" />
  <div className="flex-1">
    <span className="text-kapwa-yellow-700 text-lg font-black">{eoCount}</span>
    <span className="text-kapwa-yellow-700 ml-2 text-xs font-bold uppercase">Exec. Orders</span>
  </div>
</div>
```

#### Site-Wide Color Palette Usage

The document type colors extend to other UI elements for consistency:

**Primary Brand (Blue):**
- Ordinances
- Primary CTAs
- Key metrics (StatCard `primary` variant)

**Accent 1 - Orange:**
- Resolutions
- Secondary items
- Warning/attention states
- Comparison metrics (StatCard `secondary` variant)

**Accent 2 - Yellow/Gold:**
- Executive Orders
- Administrative items
- Highlighted content (seal-authentic color)

**Status Colors (for their specific purposes only):**
- Success (green) - only for actual success states
- Danger (red) - only for errors/danger
- Warning (orange) - warnings, AND resolutions (document type color)
- Info (cyan/blue) - informational items, help/tooltip content, info banners
- Slate (gray) - neutral, metadata, disabled states

#### Rationale

1. **Seal-Inspired Palette**: Blue, orange, and yellow/gold are colors from the official Los Baños seal (`#07223c` navy, `#ffcc0f` gold)
2. **Warm & Energetic**: Blue → Orange → Yellow creates a sunny, vibrant interface that feels welcoming and active
3. **Raw Color Tokens**: Uses direct Kapwa color scales for maximum vibrancy (`kapwa-brand-600`, `kapwa-orange-600`, `kapwa-yellow-600`)
4. **Visual Hierarchy**:
   - Blue = most important (legislative primary)
   - Orange = secondary importance (legislative secondary)
   - Yellow/gold = administrative/highlighted (seal-authentic accent)
5. **Accessibility**: All Kapwa raw tokens meet WCAG AA contrast requirements
6. **Distinctive**: Each document type has a unique, easily distinguishable color

### Button Component

**Location:** `@betterlb/ui` package

```tsx
import { Button } from '@betterlb/ui';

<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Confirm</Button>
<Button variant="outline">Outline Button</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>
```

### SearchInput Component

**Location:** `src/components/ui/SearchInput.tsx`

```tsx
import { SearchInput } from '@/components/ui/SearchInput';

<SearchInput
  value={searchQuery}
  onChange={(e) => setSearchQuery(e.target.value)}
  placeholder="Search services..."
  size="md" // sm, md, lg
/>
```

### EmptyState Component

**Location:** `src/components/ui/EmptyState.tsx`

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

<EmptyState
  title="No results found"
  description="Try adjusting your search or filters"
  actionLabel="Clear filters"
  onAction={() => clearFilters()}
/>
```

### Banner Component

**Location:** `@betterlb/ui` package

```tsx
import { Banner } from '@betterlb/ui';

<Banner type="info">Information message</Banner>
<Banner type="warning">Warning message</Banner>
<Banner type="error">Error message</Banner>
<Banner type="success">Success message</Banner>
```

### Pagination Component

**Location:** `src/components/ui/Pagination.tsx`

```tsx
import { PaginationControls } from '@/components/ui/Pagination';

<PaginationControls
  currentPage={page}
  totalPages={Math.ceil(totalItems / itemsPerPage)}
  onPageChange={setPage}
  resultsPerPage={itemsPerPage}
  onResultsPerPageChange={setItemsPerPage}
  totalResults={totalItems}
/>
```

---

## 4. Layout Components

BetterLB provides three primary layout components for consistent page structure.

### PageHero

**Location:** `src/components/layout/PageLayouts.tsx`

Use `PageHero` for **layout file headers** - centered, large titles without search/filter controls.

```tsx
import { PageHero } from '@/components/layout/PageLayouts';

<PageHero
  title="Government Services"
  description="Access all municipal services and resources"
>
  {/* Optional children */}
  <Button>Get Started</Button>
</PageHero>
```

**When to use:**
- Layout file headers
- Centered, large titles
- No search/filter needed
- Matches BetterGov.ph "Portal" header style

**Responsive behavior:**
- Mobile: `py-8` with `text-3xl` heading
- Desktop: `py-12` with `text-4xl` heading
- Animation: `fade-in` with 700ms duration

### ModuleHeader

**Location:** `src/components/layout/PageLayouts.tsx`

Use `ModuleHeader` for **index/listing pages** - left-aligned, compact layout with search/filter integration.

```tsx
import { ModuleHeader } from '@/components/layout/PageLayouts';

<ModuleHeader
  title="Services"
  description="Browse all available municipal services"
>
  <SearchInput
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search services..."
  />
</ModuleHeader>
```

**When to use:**
- Index/listing pages
- Search/filter controls needed
- Left-aligned title
- Standardizes title and search bar layout

**Responsive behavior:**
- Mobile: Stacked (title above search)
- Desktop: Side-by-side (title left, search right)
- Border bottom separation

### DetailSection

**Location:** `src/components/layout/PageLayouts.tsx`

Use `DetailSection` for **grouping related content** with visual boundaries.

```tsx
import { DetailSection } from '@/components/layout/PageLayouts';
import { InfoIcon } from 'lucide-react';

<DetailSection
  title="Section Title"
  icon={InfoIcon}
>
  <p>Section content goes here</p>
</DetailSection>
```

**When to use:**
- Grouping related content sections
- Section needs visual boundary
- Icon + label header needed
- BetterGov-style: slate-50 header with uppercase label

**Styling:**
- Bordered container with subtle shadow
- Raised background header with uppercase label
- Icon support in header (optional)
- Consistent padding

---

## 5. Page Layout Patterns

### Homepage Pattern

**Reference:** `src/pages/Home.tsx`, `src/components/home/*.tsx`

```tsx
<main className='grow'>
  <div className='animate-in fade-in duration-700'>
    <Hero />
    <div className='space-y-16 py-12'>
      <ServicesSection />
      <TimelineSection />
      <WeatherMapSection />
      <NewsSection />
      <GovernmentSection />
    </div>
  </div>
</main>
```

**Structure:**
1. **Hero section** - Search, quick access categories with Badge
2. **Services grid** - All service categories with CardGrid and count badges
3. **Timeline section** - Wrapped in DetailSection, uses documented components
4. **Weather/Map section** - Uses Card and DetailSection
5. **News section** - Uses CardGrid with Badge components (category/date)
6. **Government section** - Stats badges, CardGrid, Banner CTA

**Enhancements (2024):**
- Hero now uses `Badge` component for quick category access
- ServicesSection uses `CardGrid` with service count badges
- TimelineSection wrapped in `DetailSection` for consistency
- WeatherMapSection uses `Card` and `DetailSection` components
- NewsSection uses `CardGrid` with category and date badges
- GovernmentSection includes quick stats badges and uses CardGrid
- Added `animate-in fade-in duration-700` for page entrance animation
- Uses `space-y-16` for consistent section spacing

**Animation pattern:**
- `animate-in fade-in` for page load
- Consistent `space-y-16` spacing between sections

### Index/List Page Pattern

**Reference:** `src/pages/services/index.tsx`

```tsx
<ModuleHeader
  title="Services"
  description="Browse all available municipal services"
>
  <SearchInput
    value={search}
    onChange={(e) => setSearch(e.target.value)}
    placeholder="Search services..."
  />
</ModuleHeader>

{/* Filter controls */}

<CardGrid columns={3}>
  {services.map(service => (
    <Card key={service.id}>
      <CardContent>{service.name}</CardContent>
    </Card>
  ))}
</CardGrid>

{/* Empty state */}
{services.length === 0 && (
  <EmptyState
    title="No services found"
    description="Try adjusting your search"
  />
)}

{/* Pagination */}
<PaginationControls
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
/>
```

**Key elements:**
- `ModuleHeader` with search
- Filter controls (categories, tags)
- Grid/list view toggle
- Pagination
- Empty state
- Loading state

### Detail Page Pattern

**Reference:** `src/pages/services/[service].tsx`

```tsx
{/* Breadcrumb navigation */}
<Breadcrumb items={breadcrumbs} />

{/* Identity header */}
<header className="mb-8">
  <h1 className="kapwa-heading-xl text-kapwa-text-strong">
    {service.name}
  </h1>
  <p className="text-kapwa-text-support mt-2">
    {service.description}
  </p>
</header>

{/* Two-column layout */}
<div className="grid gap-8 lg:grid-cols-3">
  {/* Main content */}
  <div className="lg:col-span-2 space-y-6">
    <DetailSection title="Overview">
      {service.overview}
    </DetailSection>
    <DetailSection title="Requirements">
      {service.requirements}
    </DetailSection>
  </div>

  {/* Sidebar */}
  <aside className="space-y-6">
    <Card>
      <CardHeader>
        <CardTitle level="h3">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="primary">Apply Now</Button>
      </CardContent>
    </Card>
  </aside>
</div>

{/* Related items */}
<DetailSection title="Related Services">
  <CardGrid columns={3}>
    {relatedServices.map(service => (
      <Card key={service.id}>
        <CardContent>{service.name}</CardContent>
      </Card>
    ))}
  </CardGrid>
</DetailSection>
```

**Key elements:**
- Breadcrumb navigation
- Identity header (compact or expanded)
- Two-column layout (main + sidebar)
- `DetailSection` for content blocks
- Related items
- Back navigation

### Dashboard Pattern

**Reference:** Admin pages (`src/pages/admin/`)

```tsx
<SidebarLayout
  title="Dashboard"
  sidebarItems={sidebarItems}
>
  {/* Data tables/grids */}
  <DetailSection title="Recent Activity">
    {/* Table or grid */}
  </DetailSection>

  {/* Status indicators */}
  <CardGrid columns={4}>
    <Card>
      <CardContent>
        <div className="text-kapwa-text-disabled text-sm">Total</div>
        <div className="kapwa-heading-lg text-kapwa-text-strong">1,234</div>
      </CardContent>
    </Card>
  </CardGrid>

  {/* Action buttons */}
  <div className="flex gap-4">
    <Button variant="primary">Add New</Button>
    <Button variant="outline">Export</Button>
  </div>
</SidebarLayout>
```

**Key elements:**
- `SidebarLayout` for navigation
- Data tables/grids
- Status indicators (cards with metrics)
- Action buttons
- Filter controls
- Pagination

### Statistics Pages Pattern

**References:** `src/pages/statistics/*.tsx`

Statistics pages follow the dashboard pattern with consistent light theme and documented components.

#### Standard Structure

```tsx
// Layout: src/pages/statistics/layout.tsx
<div className="bg-kapwa-bg-surface min-h-screen">
  <div className="container mx-auto px-4 py-8 md:py-12">
    <PageHero
      title="Municipal Statistics"
      description="Data-driven insights into population, economy, and performance."
    />
    <SidebarLayout sidebar={<StatisticsSidebar />} collapsible={true}>
      <Outlet />
    </SidebarLayout>
  </div>
</div>
```

#### Page Components

Statistics pages use:
- **`PageHero`** for section headers (not StatsHero - deprecated)
- **`StatCard`** for KPI displays with trend indicators
- **`StatGrid`** for responsive stat card grids
- **`DetailSection`** for chart containers
- **`Badge`** for category and status indicators

```tsx
// Statistics page example
<PageHero
  title="Population Profile"
  description="Detailed demographic analysis..."
>
  <div className="flex flex-wrap justify-center gap-2">
    <Badge variant="primary" dot>Census 2024</Badge>
    <Badge variant="slate">18 Barangays</Badge>
  </div>
</PageHero>

<StatGrid
  columns={3}
  stats={[
    { label: "Population", value: 123456, variant: "primary", trend: { value: 2.5, positive: true } },
    { label: "Growth Rate", value: "2.5%", variant: "secondary" },
    { label: "Barangays", value: 18, variant: "slate", icon: Users }
  ]}
/>

<DetailSection title="Population Growth" icon={TrendingUp}>
  <ResponsiveContainer width="100%" height={400}>
    <LineChart>{/* chart data */}</LineChart>
  </ResponsiveContainer>
</DetailSection>
```

#### Key Design Decisions

- **Light theme**: Statistics pages now use light background (`bg-kapwa-bg-surface`) instead of dark (`bg-kapwa-bg-gray-900`) for consistency
- **Trend indicators**: Use `trend` prop on StatCard to show growth/decline with arrows
- **Chart containers**: Wrap charts in `DetailSection` for consistent visual grouping
- **Footer pattern**: Use standard footer HTML with verified data audit badge

#### Migration Notes

The statistics pages were migrated from custom components (`StatsHero`, `StatsCard`) to documented patterns:
- `StatsHero` → `PageHero` with `Badge` children
- `StatsCard` → `StatCard` (same API, improved styling)
- Custom dark backgrounds → Light theme for consistency

### Search Results Pattern

**Reference:** `src/pages/Search.tsx`

```tsx
<ModuleHeader
  title="Search Results"
  description={`Found ${results.length} results for "${query}"`}
>
  {/* Sort controls */}
</ModuleHeader>

{/* Active filters */}
{activeFilters.length > 0 && (
  <div className="flex gap-2 mb-6">
    {activeFilters.map(filter => (
      <Badge variant="outline" key={filter}>
        {filter}
        <button onClick={() => removeFilter(filter)}>×</button>
      </Badge>
    ))}
  </div>
)}

{/* Results */}
<CardGrid columns={3}>
  {results.map(result => (
    <Card key={result.id}>
      <CardContent>{result.title}</CardContent>
    </Card>
  ))}
</CardGrid>

{/* No results */}
{results.length === 0 && (
  <EmptyState
    title="No results found"
    description="Try different search terms or filters"
  />
)}
```

**Key elements:**
- Search input with filters
- Result count
- Sorting options
- Grid/list toggle
- Active filters display
- Pagination
- No results state

---

## 6. Navigation Patterns

### Navbar

**Location:** `src/components/layout/Navbar.tsx`

The main navigation provides multi-level navigation with dropdowns.

**Features:**
- Multi-level navigation with dropdowns
- Mobile-responsive with overlay menu
- Language switcher in top bar
- Sticky positioning with z-index management

**Usage:**
```tsx
// Automatically included in main layout
// Navigation data defined in navigation config
```

### SidebarLayout

**Location:** `src/components/layout/SidebarLayout.tsx`

Use for admin/dashboard pages with hierarchical navigation.

```tsx
import { SidebarLayout } from '@/components/layout/SidebarLayout';

<SidebarLayout
  title="Admin Dashboard"
  sidebarItems={[
    { label: 'Documents', href: '/admin/documents', icon: FileIcon },
    { label: 'Review Queue', href: '/admin/review', icon: CheckIcon },
    { label: 'Settings', href: '/admin/settings', icon: SettingsIcon },
  ]}
>
  {/* Page content */}
</SidebarLayout>
```

**Features:**
- Collapsible sidebar pattern
- Mobile responsive with hamburger menu
- Scroll reset functionality
- Dual header option

### Breadcrumb

**Location:** `src/components/navigation/Breadcrumb.tsx`

Use for hierarchical navigation on detail pages.

```tsx
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Services', href: '/services' },
    { label: 'Business Permits', href: '/services/business-permits' },
  ]}
/>
```

### Tab Navigation

Use for organizing content within a page.

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="requirements">Requirements</TabsTrigger>
    <TabsTrigger value="process">Process</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    {/* Overview content */}
  </TabsContent>
  <TabsContent value="requirements">
    {/* Requirements content */}
  </TabsContent>
  <TabsContent value="process">
    {/* Process content */}
  </TabsContent>
</Tabs>
```

### Pagination

Use for navigating through paginated content.

```tsx
import { PaginationControls } from '@/components/ui/Pagination';

<PaginationControls
  currentPage={page}
  totalPages={totalPages}
  onPageChange={setPage}
  resultsPerPage={itemsPerPage}
  onResultsPerPageChange={setItemsPerPage}
  totalResults={totalItems}
/>
```

---

## 7. Grid & Spacing System

### Standard Grid Patterns

```tsx
// 1 column (mobile)
<div className="grid grid-cols-1 gap-6">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// 2 columns (tablet+)
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// 3 columns (responsive)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>

// 4 columns (wide desktop)
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {items.map(item => <div key={item.id}>{item}</div>)}
</div>
```

### Gap Spacing Standards

Always use `gap-kapwa-*` utilities for consistent spacing:

```tsx
<div className="flex gap-kapwa-sm">12px gap between children</div>
<div className="flex gap-kapwa-md">16px gap between children</div>
<div className="flex gap-kapwa-lg">24px gap between children</div>
```

### Container Patterns

```tsx
// Max-width container
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
  {/* Content */}
</div>

// Constrained content
<div className="mx-auto max-w-2xl">
  {/* Centered, narrow content */}
</div>
```

### Responsive Breakpoints

| Breakpoint | Min Width | Usage |
|------------|-----------|-------|
| Mobile | Default | < 768px |
| Tablet | `md:` | 768px - 1280px |
| Desktop | `lg:` | ≥ 1280px |
| Wide | `xl:` | ≥ 1536px |

---

## 8. Typography System

### Heading Hierarchy

```tsx
<h1 className="kapwa-heading-xl text-kapwa-text-strong">
  Page Title (2.5rem)
</h1>
<h2 className="kapwa-heading-lg text-kapwa-text-strong">
  Section Title (2rem)
</h2>
<h3 className="kapwa-heading-md text-kapwa-text-strong">
  Subsection Title (1.5rem)
</h3>
<h4 className="kapwa-heading-sm text-kapwa-text-strong">
  Component Title (1.25rem)
</h4>
```

### Body Text

```tsx
// Large body (1.125rem)
<p className="kapwa-body-lg-default text-kapwa-text-support">
  Large body text
</p>

// Default body (1rem)
<p className="kapwa-body-md-default text-kapwa-text-support">
  Default body text
</p>

// Small body (0.875rem)
<p className="kapwa-body-sm-default text-kapwa-text-support">
  Small body text
</p>
```

### Strong/Emphasis Text

```tsx
<p className="kapwa-body-md-strong text-kapwa-text-strong">
  Bold, emphasized text (1rem, 700)
</p>
```

### Responsive Typography Pattern

```tsx
// Mobile → Tablet → Desktop → Large Desktop
<h1 className="kapwa-heading-sm md:kapwa-heading-md lg:kapwa-heading-lg xl:kapwa-heading-xl">
  Responsive Heading
</h1>
```

### Automatic Responsive Tokens

Kapwa provides **automatic responsive typography tokens** that scale across breakpoints without manual breakpoint classes. These are the preferred choice for most use cases.

#### `kapwa-heading` - Auto-Scaling Headings

The `kapwa-heading` token automatically scales across breakpoints:

| Breakpoint | Size | Pixels | Use Case |
|------------|------|--------|----------|
| Mobile (base) | 1.25rem | 20px | Small screens |
| Tablet (md:) | 1.5rem | 24px | 768px+ |
| Desktop (lg:) | 2rem | 32px | 1024px+ |
| XL Desktop (xl:) | 2.5rem | 40px | 1280px+ |

```tsx
// Automatic responsive scaling - no breakpoints needed!
<h1 className="kapwa-heading text-kapwa-text-strong">
  This scales automatically from 20px → 24px → 32px → 40px
</h1>

// Equivalent to:
<h1 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl">
  Manual responsive (don't use this anymore)
</h1>
```

#### Other Auto-Responsive Tokens

All these tokens provide automatic responsive scaling:

| Token | Base → md → lg → xl | Use Case |
|-------|---------------------|----------|
| `kapwa-heading` | 1.25rem → 1.5rem → 2rem → 2.5rem | Headings (H1, H2) |
| `kapwa-body` | 0.875rem → 1rem → 1.125rem → 1.25rem | Body text |
| `kapwa-body strong` | same + bold | Bold body text |
| `kapwa-label` | 0.75rem → 0.875rem → 1rem → 1.125rem | Labels, small text |
| `kapwa-link` | 0.875rem → 1rem → 1.125rem → 1.25rem | Links |
| `kapwa-code` | 0.875rem → 1rem → 1.125rem → 1.25rem | Code blocks |

```tsx
// All auto-responsive examples
<h1 className="kapwa-heading">Auto-scaling heading</h1>
<p className="kapwa-body">Auto-scaling body text</p>
<p className="kapwa-body strong">Auto-scaling bold body</p>
<span className="kapwa-label">Auto-scaling label</span>
<a className="kapwa-link">Auto-scaling link</a>
<code className="kapwa-code">Auto-scaling code</code>
```

#### When to Use Manual Responsive Sizing

Only use manual breakpoint sizing when:
- Hero sections need larger scale (text-4xl md:text-6xl or bigger)
- Special design requirements exceed kapwa-heading range (max 2.5rem)

```tsx
// Hero title - keep manual sizing for larger scale
<h1 className="text-4xl md:text-5xl lg:text-6xl">
  Large hero title
</h1>

// Standard heading - use auto-responsive token
<h2 className="kapwa-heading">
  Standard section heading
</h2>
```

#### Migration Pattern

Replace manual responsive sizing with auto-responsive tokens:

```tsx
// Before ❌
<h2 className="text-2xl font-bold md:text-3xl">Section</h2>
<p className="text-base md:text-lg">Description</p>
<p className="text-base md:text-lg font-bold">Bold description</p>

// After ✅
<h2 className="kapwa-heading font-bold">Section</h2>
<p className="kapwa-body">Description</p>
<p className="kapwa-body strong">Bold description</p>
```

### Text Truncation

```tsx
// Single line truncate
<p className="truncate">
  Long text that will truncate with ellipsis...
</p>

// Multi-line truncate (2 lines)
<p className="line-clamp-2">
  Long text that will truncate after 2 lines with ellipsis...
</p>
```

### Font Weight Usage

- **400 (default)** - Body text, descriptions
- **500 (medium)** - Emphasized body text
- **600 (semibold)** - Subheadings, labels
- **700 (bold)** - Headings, important text
- **800 (extrabold)** - Page titles, emphasis

---

## 9. Icon Usage

BetterLB uses **Lucide React** for icons.

### Icon Sizes

```tsx
import { SearchIcon, PhoneIcon, MapPinIcon } from 'lucide-react';

// Section headers
<SearchIcon className="h-4 w-4" />

// Card icons, buttons
<PhoneIcon className="h-5 w-5" />

// Feature icons
<MapPinIcon className="h-6 w-6" />
```

### Icon Placement Patterns

```tsx
// Icon with text (inline)
<div className="flex items-center gap-2">
  <PhoneIcon className="h-4 w-4" />
  <span>(049) 123-4567</span>
</div>

// Icon in button
<Button>
  <SearchIcon className="h-4 w-4" />
  Search
</Button>

// Icon with background
<div className="bg-kapwa-bg-surface text-kapwa-text-brand rounded-xl p-2.5">
  <Icon className="h-5 w-5" />
</div>
```

### Decorative Icon Handling

```tsx
// Icons that are decorative should be hidden from screen readers
<Icon className="h-4 w-4" aria-hidden="true" />

// Icons that convey meaning need aria-label
<Icon aria-label="Close dialog" />
```

### When to Use Icons vs Text

**Use icons:**
- For common actions (search, close, menu)
- To reinforce text labels
- For visual hierarchy

**Use text:**
- For primary labels
- When meaning is ambiguous
- For accessibility (icons alone may not be clear)

---

## 10. Interactive States

### Hover States

```tsx
// Border color change
<div className="border border-kapwa-border-weak hover:border-kapwa-border-brand">

// Background change
<div className="bg-kapwa-bg-surface hover:bg-kapwa-bg-surface-raised">

// Icon color change
<Icon className="text-kapwa-text-support hover:text-kapwa-text-brand" />

// Shadow elevation
<Card className="shadow-sm hover:shadow-md">

// Translation (subtle lift)
<Card className="hover:-translate-y-0.5">
```

### Focus States

```tsx
// Ring indicator
<input className="
  border border-kapwa-border-weak
  focus:border-kapwa-border-focus
  focus:ring-2 focus:ring-kapwa-border-focus/20
" />

// Focus within container
<div className="
  focus-within:ring-2
  focus-within:ring-kapwa-border-focus
">
  <input />
</div>
```

### Active States

```tsx
<button className="
  bg-kapwa-bg-surface
  hover:bg-kapwa-bg-hover
  active:bg-kapwa-bg-active
">
  Click me
</button>
```

### Disabled States

```tsx
<button
  disabled
  className="
    bg-kapwa-bg-disabled
    text-kapwa-text-disabled
    border border-kapwa-border-on-disabled
    cursor-not-allowed
  "
>
  Disabled
</button>
```

### Loading States

```tsx
// Loading spinner
<div className="animate-spin h-5 w-5 border-2 border-kapwa-border-brand border-t-transparent rounded-full" />

// Skeleton loader
<div className="animate-pulse bg-kapwa-bg-hover h-4 w-full rounded" />
```

### Transition Standards

```tsx
// Standard transition
className="transition-all duration-300"

// Fast transition (hover)
className="transition-colors duration-200"

// Slow transition (page load)
className="transition-opacity duration-700"
```

---

## 11. Accessibility Standards

BetterLB follows **WCAG 2.1 Level AA** as a baseline.

### Semantic HTML

```tsx
// Use semantic elements
<header> {/* Page header */}</header>
<nav> {/* Navigation */}</nav>
<main> {/* Main content */}</main>
<section> {/* Content section */}</section>
<article> {/* Self-contained content */}</article>
<aside> {/* Sidebar */}</aside>
<footer> {/* Page footer */}</footer>
```

### ARIA Attributes

```tsx
// Aria labels for icon-only buttons
<button aria-label="Close dialog">
  <XIcon />
</button>

// Aria labelledby for sections
<section aria-labelledby="section-title">
  <h2 id="section-title">Section Title</h2>
</section>

// Aria hidden for decorative elements
<Icon aria-hidden="true" />

// Aria live for dynamic content
<div aria-live="polite" aria-atomic="true">
  {statusMessage}
</div>

// Role attributes
<div role="button" tabIndex={0} onClick={handleClick}>
  Clickable div
</div>
```

### Keyboard Navigation

```tsx
// Tab order (logical DOM order)
<button>First</button>
<button>Second</button>
<button>Third</button>

// Skip links (add at top of page)
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>

// Keyboard handlers
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick(e);
    }
  }}
>
  Keyboard accessible
</div>
```

### Focus Indicators

```tsx
// Always provide visible focus indicators
<input className="
  focus:outline-none
  focus:ring-2
  focus:ring-kapwa-border-focus
  focus:ring-offset-2
" />
```

### Screen Reader Support

```tsx
// Heading structure (h1-h6 in order)
<h1>Page title</h1>
  <h2>Section title</h2>
    <h3>Subsection title</h3>

// Landmark regions
<header> {/* Banner landmark */}</header>
<nav> {/* Navigation landmark */}</nav>
<main> {/* Main landmark */}</main>
<aside> {/* Complementary landmark */}</aside>
<footer> {/* Contentinfo landmark */}</footer>

// Link descriptions
<a href="/document.pdf" aria-describedby="pdf-link-desc">
  Annual Report
</a>
<span id="pdf-link-desc">PDF, 2.5 MB</span>
```

### Color Contrast Requirements

- **Normal text:** Minimum 4.5:1 contrast ratio
- **Large text (18pt+):** Minimum 3:1 contrast ratio
- **UI components:** Minimum 3:1 contrast ratio

### Touch Target Sizes

- **Minimum:** 44px × 44px
- **Recommended:** 48px × 48px

```tsx
// Ensure adequate touch targets
<button className="min-h-[44px] min-w-[44px]">
  Clickable
</button>
```

### Motion Reduction

```tsx
// Respect prefers-reduced-motion
<div className="transition-transform duration-300 motion-reduce:transition-none">
  Content
</div>
```

---

## 12. Responsive Design

BetterLB uses a **mobile-first** approach.

### Breakpoint System

| Breakpoint | Min Width | Max Width | Usage |
|------------|-----------|-----------|-------|
| Mobile | Default | 767px | Base styles |
| Tablet | 768px | 1279px | `md:` prefix |
| Desktop | 1280px | 1535px | `lg:` prefix |
| Wide | 1536px+ | None | `xl:` prefix |

### Mobile-First Pattern

```tsx
// Start with mobile styles
<div className="grid grid-cols-1 gap-4">

  // Add tablet overrides
  md:grid-cols-2

  // Add desktop overrides
  lg:grid-cols-3

  // Add wide overrides
  xl:grid-cols-4
</div>
```

### Responsive Patterns

```tsx
// Responsive grids
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

// Responsive typography
<h1 className="kapwa-heading-md md:kapwa-heading-lg lg:kapwa-heading-xl">

// Responsive spacing
<div className="p-4 md:p-6 lg:p-8">

// Responsive display
<div className="hidden md:block">Desktop only</div>
<div className="block md:hidden">Mobile only</div>

// Responsive layout
<div className="flex flex-col md:flex-row gap-4">
```

### Responsive Navigation

```tsx
// Mobile: Hamburger menu
// Tablet+: Horizontal nav
<nav className="md:hidden">
  <MobileMenu />
</nav>
<nav className="hidden md:block">
  <DesktopNav />
</nav>
```

### Testing Guidelines

Test on:
- Mobile devices (375px - 428px)
- Tablet devices (768px - 1024px)
- Desktop (1280px - 1920px)

Use browser DevTools device emulation for initial testing.

---

## 13. Animation & Motion

### Page Load Animations

```tsx
// Fade in on mount
<div className="animate-in fade-in duration-700">

// Staggered reveal
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100">
```

### Hover Transitions

```tsx
// Standard duration: 200ms
<button className="transition-all duration-200 hover:scale-105">

// Easing functions
className="transition-all duration-200 ease-in-out"
```

### Motion Reduction Support

```tsx
// Respect user preferences
<div className="transition-transform duration-300 motion-reduce:transition-none">
  Content
</div>
```

### Performance Considerations

- **Animate only transform and opacity** for best performance
- **Avoid animating layout properties** (width, height, top, left)
- **Use will-change sparingly** and only when needed
- **Prefer CSS animations** over JavaScript animations

```tsx
// Good (GPU accelerated)
<div className="transition-transform duration-200 hover:scale-105">

// Avoid (triggers layout)
<div className="transition-all duration-200 hover:width-48">
```

---

## 14. Common Patterns

### Contact Information Display

```tsx
import { CardContactInfo } from '@/components/ui/Card';

<Card>
  <CardContent>
    <CardContactInfo
      contact={{
        address: "123 Main St, Los Baños, Laguna",
        phone: ["(049) 123-4567", "(049) 765-4321"],
        email: "info@losbanos.gov.ph",
        website: "losbanos.gov.ph"
      }}
      compact={false} // Use true for tight layouts
    />
  </CardContent>
</Card>
```

### Search with Autocomplete

```tsx
<ModuleHeader title="Search">
  <div className="relative">
    <SearchInput
      value={search}
      onChange={(e) => setSearch(e.target.value)}
      placeholder="Search..."
    />
    {showSuggestions && (
      <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-kapwa-bg-surface border border-kapwa-border-weak rounded-lg shadow-lg">
        {suggestions.map(s => (
          <button
            key={s.id}
            className="w-full text-left px-4 py-2 hover:bg-kapwa-bg-hover"
          >
            {s.label}
          </button>
        ))}
      </div>
    )}
  </div>
</ModuleHeader>
```

### Filter/Sort Controls

```tsx
<div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
  <div className="flex gap-2">
    {categories.map(cat => (
      <button
        key={cat.id}
        className={`
          px-4 py-2 rounded-lg text-sm font-medium transition-colors
          ${activeCategory === cat.id
            ? 'bg-kapwa-bg-brand-default text-kapwa-text-inverse'
            : 'bg-kapwa-bg-surface text-kapwa-text-support hover:bg-kapwa-bg-hover'
          }
        `}
        onClick={() => setActiveCategory(cat.id)}
      >
        {cat.label}
      </button>
    ))}
  </div>

  <select
    value={sortBy}
    onChange={(e) => setSortBy(e.target.value)}
    className="px-4 py-2 border border-kapwa-border-weak rounded-lg"
  >
    <option value="name">Name (A-Z)</option>
    <option value="date">Date (Newest)</option>
  </select>
</div>
```

### Empty State Handling

```tsx
import { EmptyState } from '@/components/ui/EmptyState';

{items.length === 0 ? (
  <EmptyState
    title="No results found"
    description="Try adjusting your search or filters"
    actionLabel="Clear all filters"
    onAction={() => clearFilters()}
  />
) : (
  <CardGrid columns={3}>
    {items.map(item => <Card key={item.id}>{item}</Card>)}
  </CardGrid>
)}
```

### Loading State Handling

```tsx
{isLoading ? (
  <div className="space-y-4">
    {[...Array(6)].map((_, i) => (
      <Card key={i} className="animate-pulse">
        <CardContent>
          <div className="h-4 bg-kapwa-bg-hover rounded w-3/4" />
          <div className="h-4 bg-kapwa-bg-hover rounded w-1/2 mt-2" />
        </CardContent>
      </Card>
    ))}
  </div>
) : (
  <CardGrid columns={3}>
    {items.map(item => <Card key={item.id}>{item}</Card>)}
  </CardGrid>
)}
```

### Error State Handling

```tsx
{error ? (
  <Banner type="error">
    {error.message}
    <Button variant="link" onClick={retry}>Try again</Button>
  </Banner>
) : (
  <CardContent>{data}</CardContent>
)}
```

### Breadcrumbs

```tsx
import { Breadcrumb } from '@/components/navigation/Breadcrumb';

<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Government', href: '/government' },
    { label: 'Departments', href: '/government/departments' },
    { label: currentDepartment.name, href: `/government/departments/${currentDepartment.slug}` },
  ]}
/>
```

### Tabs

```tsx
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

<Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="requirements">Requirements</TabsTrigger>
    <TabsTrigger value="process">Process</TabsTrigger>
    <TabsTrigger value="faq">FAQ</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">
    <DetailSection title="Overview">
      {overview}
    </DetailSection>
  </TabsContent>
  {/* Other tabs... */}
</Tabs>
```

### Tables vs Grids

**Use Tables when:**
- Data is tabular (rows and columns)
- Users need to compare values across rows
- Sorting/filtering by column is needed
- Data has a natural relationship

```tsx
<table className="w-full">
  <thead>
    <tr className="border-b border-kapwa-border-weak">
      <th className="text-left py-3 px-4 kapwa-label-sm text-kapwa-text-disabled">Name</th>
      <th className="text-left py-3 px-4 kapwa-label-sm text-kapwa-text-disabled">Date</th>
      <th className="text-left py-3 px-4 kapwa-label-sm text-kapwa-text-disabled">Status</th>
    </tr>
  </thead>
  <tbody>
    {items.map(item => (
      <tr key={item.id} className="border-b border-kapwa-border-weak hover:bg-kapwa-bg-hover">
        <td className="py-3 px-4">{item.name}</td>
        <td className="py-3 px-4">{item.date}</td>
        <td className="py-3 px-4">
          <Badge variant={item.statusVariant}>{item.status}</Badge>
        </td>
      </tr>
    ))}
  </tbody>
</table>
```

**Use Card Grids when:**
- Items are self-contained
- Each item has mixed content types
- Visual hierarchy is important
- Items need to stand on their own

```tsx
<CardGrid columns={3}>
  {items.map(item => (
    <Card key={item.id}>
      <CardContent>
        <CardTitle level="h3">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  ))}
</CardGrid>
```

---

## 15. Page Type Guidelines

Use this decision tree to choose the right layout pattern.

### Use PageHero When:

- Layout file headers
- Centered, large titles
- No search/filter needed
- Matches BetterGov.ph "Portal" header style

```tsx
// Example: src/pages/government/layout.tsx
<PageHero
  title="Government"
  description="Learn about Los Baños government officials and departments"
/>
```

### Use ModuleHeader When:

- Index/listing pages
- Search/filter controls needed
- Left-aligned title
- Standardizes title and search bar layout

```tsx
// Example: src/pages/services/index.tsx
<ModuleHeader
  title="Services"
  description="Browse all available municipal services"
>
  <SearchInput
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />
</ModuleHeader>
```

### Use DetailSection When:

- Grouping related content
- Section needs visual boundary
- Icon + label header needed
- BetterGov-style: slate-50 header with uppercase label

```tsx
// Example: src/pages/services/[service].tsx
<DetailSection title="Requirements" icon={CheckIcon}>
  <ul>{requirements.map(req => <li key={req.id}>{req.name}</li>)}</ul>
</DetailSection>
```

### Use Card When:

- Displaying discrete items
- Hover interaction needed
- Consistent item presentation
- Self-contained content

```tsx
// Example: Service cards
<CardGrid columns={3}>
  {services.map(service => (
    <Card key={service.id} hover>
      <CardContent>
        <CardTitle level="h3">{service.name}</CardTitle>
        <CardDescription>{service.description}</CardDescription>
      </CardContent>
    </Card>
  ))}
</CardGrid>
```

---

## 16. Examples & References

### Example Implementations

#### Homepage
**Reference:** `src/pages/Home.tsx`

```tsx
<main className='grow'>
  <Hero />
  <ServicesSection />
  <TimelineSection />
  <WeatherMapSection />
  <GovernmentSection />
</main>
```

#### Government Pages

**References:**
- Main layout: `src/pages/government/layout.tsx`
- Elected Officials: `src/pages/government/elected-officials/index.tsx`
- Departments: `src/pages/government/departments/index.tsx`
- Barangays: `src/pages/government/barangays/index.tsx`

**Structure:**
- All pages use `container mx-auto px-4` for consistent width stretching
- Main layout uses PageHero for section header
- Sub-pages (elected-officials, departments, barangays) use SidebarLayout with navigation
- Index pages use ModuleHeader with search where appropriate
- CardGrid for consistent responsive layouts

**Consistency improvements (2024):**
- Fixed responsiveness to match other pages (use `container` class instead of `max-w-7xl`)
- Elected Officials page uses StatCard for KPI displays
- Departments page includes search in ModuleHeader
- Barangays page includes search in ModuleHeader
- All pages maintain consistent spacing and width with rest of site

**Navigation pattern:**
- "Big 3" cards on main page for executive, departments, barangays
- Sidebar navigation for sub-pages with collapsible menu
- Consistent `container` usage ensures full-width stretching matches homepage

#### Service Detail
**Reference:** `src/pages/services/[service].tsx`

- Breadcrumb navigation
- Two-column layout (main + sidebar)
- `DetailSection` for content blocks
- Related services section

#### Barangay Detail
**Reference:** `src/pages/government/barangays/[barangay].tsx`

- Clean detail page pattern
- Identity header with official information
- Contact info in card
- Related officials section

### Anti-Patterns to Avoid

```tsx
// ❌ DON'T: Use inline styles
<div style={{ color: 'red', padding: '16px' }}>

// ✅ DO: Use Tailwind classes
<div className="text-kapwa-text-danger p-kapwa-md">

// ❌ DON'T: Use magic numbers
<div className="text-[13px] leading-[1.4]">

// ✅ DO: Use Kapwa typography
<div className="kapwa-body-sm-default leading-relaxed">

// ❌ DON'T: Use direct colors
<div className="bg-blue-50 text-blue-800 border-blue-200">

// ✅ DO: Use semantic tokens
<div className="bg-kapwa-bg-surface-raised text-kapwa-text-strong border border-kapwa-border-weak">

// ❌ DON'T: Inconsistent spacing
<div className="p-4 md:p-6 lg:p-8">

// ✅ DO: Use Kapwa spacing
<div className="p-kapwa-md md:p-kapwa-lg lg:p-kapwa-xl">

// ❌ DON'T: Mix old and new systems
<Button className="bg-primary-500">

// ✅ DO: Use component variants
<Button variant="primary">
```

### Migration Checklist for Existing Pages

- [ ] Replace direct colors with Kapwa semantic tokens
- [ ] Use Kapwa typography classes instead of font-size/line-height
- [ ] Replace custom spacing with Kapwa spacing utilities
- [ ] Use Kapwa border tokens instead of color borders
- [ ] Implement proper interactive states (hover, focus, active)
- [ ] Add accessible focus indicators
- [ ] Ensure touch targets meet minimum size (44px)
- [ ] Test keyboard navigation
- [ ] Verify color contrast ratios
- [ ] Add aria labels where needed
- [ ] Use semantic HTML elements
- [ ] Implement proper heading hierarchy
- [ ] Add loading states
- [ ] Add empty states
- [ ] Add error states

---

## Quick Reference

### Common Component Imports

```tsx
// Layout components
import { PageHero, ModuleHeader, DetailSection } from '@/components/layout/PageLayouts';
import { SidebarLayout } from '@/components/layout/SidebarLayout';

// Navigation
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { Navbar } from '@/components/layout/Navbar';

// UI components (local)
import { Card, CardGrid, CardHeader, CardContent, CardFooter, CardTitle, CardDescription, CardContactInfo } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SearchInput } from '@/components/ui/SearchInput';
import { EmptyState } from '@/components/ui/EmptyState';
import { PaginationControls } from '@/components/ui/Pagination';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

// UI components (shared)
import { Button, Banner } from '@betterlb/ui';

// Icons
import {
  SearchIcon,
  PhoneIcon,
  MailIcon,
  MapPinIcon,
  ExternalLinkIcon,
  ChevronLeftIcon,
  InfoIcon,
  CheckIcon,
  XIcon,
} from 'lucide-react';
```

### Common Patterns

```tsx
// Page with search
<ModuleHeader title="Page Title">
  <SearchInput value={search} onChange={(e) => setSearch(e.target.value)} />
</ModuleHeader>

// Card grid
<CardGrid columns={3}>
  {items.map(item => (
    <Card key={item.id} hover>
      <CardContent>
        <CardTitle level="h3">{item.title}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardContent>
    </Card>
  ))}
</CardGrid>

// Detail section with icon
<DetailSection title="Section Title" icon={InfoIcon}>
  <p>Content goes here</p>
</DetailSection>

// Breadcrumb
<Breadcrumb
  items={[
    { label: 'Home', href: '/' },
    { label: 'Parent', href: '/parent' },
    { label: 'Current', href: '/parent/current' },
  ]}
/>
```

---

## Further Reading

- **Kapwa Semantic Guide:** `KAPWA_SEMANTIC_GUIDE.md`
- **Project Architecture:** `CLAUDE.md`
- **Shared Components:** `docs/SHARED_COMPONENTS.md`
- **Accessibility:** WCAG 2.1 Guidelines

---

**Version:** 1.5.0
**Last Updated:** 2026-02-22
**Maintained By:** BetterLB Development Team

## Changelog

### v1.5.0 (2026-02-22)
- Added `yellow` Badge variant for Executive Orders
- Documented `getDocTypeBadgeVariant()` helper function
- Updated Document Type Color Scheme references
