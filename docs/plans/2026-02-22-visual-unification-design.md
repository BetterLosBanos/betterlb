# BetterLB Visual Unification Design Documentation

**Date**: 2026-02-22
**Status**: Implemented
**Scope**: Comprehensive visual unification across all pages

---

## Table of Contents

1. [Overview](#overview)
2. [New Unified Components](#new-unified-components)
3. [Design System Patterns](#design-system-patterns)
4. [Migration Guide](#migration-guide)
5. [Verification Checklist](#verification-checklist)

---

## Overview

The BetterLB Visual Unification redesign establishes a consistent design language across the entire municipal portal. This document serves as the comprehensive reference for the unified design system.

### Design Principles

1. **Unified Header System** - All pages use `PageHeader` with appropriate variants
2. **Section Alternation** - Content sections use `SectionBlock` for visual rhythm
3. **Staggered Animations** - Consistent 700ms fade-in with staggered children
4. **Kapwa Token Compliance** - All components use Tailwind v4 prefixed semantic tokens
5. **Auto-Generated Breadcrumbs** - Detail pages automatically show navigation breadcrumbs

---

## New Unified Components

### PageHeader

**Location**: `src/components/layout/UnifiedLayouts.tsx`

A unified header system that replaces conditional header logic across layouts.

#### Variants

```tsx
// Hero variant - Full-width gradient (used on home page index views)
<PageHeader
  variant="hero"
  title="OpenLGU Portal"
  description="Browse official documents..."
  actions={<SearchInput />}
/>

// Centered variant - Centered text (section pages)
<PageHeader
  variant="centered"
  title="Government"
  description="Access information on elected leaders..."
/>

// Compact variant - Left-aligned with actions (index/list pages)
<PageHeader
  variant="compact"
  title="Services"
  description="Browse all available services"
  actions={<SearchInput />}
  autoBreadcrumbs={true}
/>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'hero' \| 'centered' \| 'compact'` | `'centered'` | Header style variant |
| `title` | `string` | - | Page title (required) |
| `description` | `string` | - | Optional description |
| `actions` | `ReactNode` | - | Action buttons/inputs |
| `breadcrumbs` | `ReactNode` | - | Custom breadcrumb element |
| `autoBreadcrumbs` | `boolean` | `false` | Auto-generate from route |
| `badges` | `ReactNode` | - | Status badges |

---

### SectionBlock

**Location**: `src/components/layout/UnifiedLayouts.tsx`

Reusable section wrapper with alternating backgrounds for visual rhythm.

#### Variants

```tsx
// Default - White/neutral surface
<SectionBlock variant="default" title="Section Title">
  {children}
</SectionBlock>

// Raised - Subtle gray (creates rhythm)
<SectionBlock variant="raised" title="Section Title">
  {children}
</SectionBlock>

// Brand - Brand-tinted background
<SectionBlock variant="brand" title="Section Title">
  {children}
</SectionBlock>
```

#### Auto-Alternating with SectionAlternator

```tsx
<SectionAlternator>
  <SectionBlock title="Section 1">...</SectionBlock>
  <SectionBlock title="Section 2">...</SectionBlock>
  <SectionBlock title="Section 3">...</SectionBlock>
</SectionAlternator>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `variant` | `'default' \| 'raised' \| 'brand'` | Auto | Background variant |
| `title` | `string` | - | Section title |
| `icon` | `ComponentType` | - | Icon for title |
| `action` | `ReactNode` | - | Action link/button |
| `stagger` | `number` | `0` | Animation delay (ms) |
| `children` | `ReactNode` | - | Section content |

---

### useBreadcrumbs Hook

**Location**: `src/components/layout/UnifiedLayouts.tsx`

Auto-generates breadcrumbs from the current route.

```tsx
const breadcrumbs = useBreadcrumbs();
// Returns: [
//   { label: 'Home', href: '/' },
//   { label: 'Services', href: '/services' },
//   { label: 'Business Permits', href: '/services/business-permits' },
// ]
```

#### Usage with PageHeader

```tsx
<PageHeader
  variant="compact"
  title={service.name}
  autoBreadcrumbs={true}
/>
```

#### Custom Labels

```tsx
const customConfig = {
  '/government/elected-officials': 'Elected Officials',
  '/government/departments': 'Departments & Offices',
};

const breadcrumbs = useBreadcrumbs(customConfig);
```

---

### StaggeredGrid

**Location**: `src/components/layout/UnifiedLayouts.tsx`

Card grid with automatic stagger animations for cascading reveal effect.

```tsx
<StaggeredGrid columns={3} baseDelay={100} delayStep={75}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</StaggeredGrid>
```

#### Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `columns` | `1 \| 2 \| 3 \| 4` | `3` | Grid columns |
| `baseDelay` | `number` | `0` | Base animation delay (ms) |
| `delayStep` | `number` | `75` | Delay per item (ms) |

---

## Design System Patterns

### Container Pattern

All page content uses the standard container:

```tsx
<div className="container mx-auto px-4">
  {/* Content */}
</div>
```

### Section Padding

Standard vertical spacing:

```tsx
<div className="py-12 md:py-16">
  {/* Section content */}
</div>
```

### Animation Standards

**Page Load**: `animate-in fade-in duration-700`

**Staggered Children**: `animate-in fade-in slide-in-from-bottom-4 duration-500 delay-{n}`

**Hover Effects**: `hover:scale-[1.02] hover:shadow-lg transition-all duration-200`

**Focus**: `focus:ring-2 focus:ring-kapwa-border-focus`

### Typography Standards

```tsx
// H1 - Page titles
<h1 className="kapwa-heading text-kapwa-text-strong">

// H2 - Section titles
<h2 className="kapwa-heading-md text-kapwa-text-strong">

// H3 - Card/subsection titles
<h3 className="kapwa-heading-sm text-kapwa-text-strong">
```

---

## Migration Guide

### Layout File Updates

**Before** (Conditional header logic):
```tsx
headerNode={
  isIndexPage ? (
    <PageHero title="..." description="..." />
  ) : (
    <ModuleHeader title="..." description="..." />
  )
}
```

**After** (Unified PageHeader):
```tsx
headerNode={
  <PageHeader
    variant={isIndexPage ? 'hero' : 'compact'}
    title="..."
    description="..."
    autoBreadcrumbs={!isIndexPage}
  />
}
```

### Index Page Updates

**Before** (Custom grid):
```tsx
<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</div>
```

**After** (CardGrid or StaggeredGrid):
```tsx
<CardGrid columns={3}>
  {items.map(item => <Card key={item.id}>{item.content}</Card>)}
</CardGrid>
```

### Detail Page Updates

**Before** (Manual breadcrumbs):
```tsx
<Breadcrumb>
  <BreadcrumbList>
    <BreadcrumbItem><BreadcrumbHome href="/" /></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbLink href="/services">Services</BreadcrumbLink></BreadcrumbItem>
    <BreadcrumbSeparator />
    <BreadcrumbItem><BreadcrumbPage>{service.name}</BreadcrumbPage></BreadcrumbItem>
  </BreadcrumbList>
</Breadcrumb>
```

**After** (Auto-generated):
```tsx
const breadcrumbs = useBreadcrumbs();

<Breadcrumb>
  <BreadcrumbList>
    {breadcrumbs.map((crumb, index) => (
      <React.Fragment key={crumb.href}>
        {index > 0 && <BreadcrumbSeparator />}
        <BreadcrumbItem>
          {index === breadcrumbs.length - 1 ? (
            <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
          ) : (
            <BreadcrumbLink href={crumb.href}>{crumb.label}</BreadcrumbLink>
          )}
        </BreadcrumbItem>
      </React.Fragment>
    ))}
  </BreadcrumbList>
</Breadcrumb>
```

---

## Verification Checklist

### Layout Files
- [ ] All layout files use `PageHeader` instead of conditional logic
- [ ] Container pattern `container mx-auto px-4` applied consistently
- [ ] Section spacing uses `py-12 md:py-16` standard

### Index/List Pages
- [ ] All index pages use `ModuleHeader` or `PageHeader` with actions
- [ ] Card layouts use `CardGrid` component
- [ ] Filter/search patterns use `SearchInput` component

### Detail Pages
- [ ] All detail pages have breadcrumbs
- [ ] Breadcrumbs use `useBreadcrumbs` hook
- [ ] Content sections use `SectionBlock` where appropriate

### Special Pages
- [ ] About page uses unified components
- [ ] Accessibility page uses unified components
- [ ] Home sections have consistent spacing

### Component Audit
- [ ] Unused components removed
- [ ] Duplicate implementations consolidated
- [ ] All exports updated in `index.ts` files

---

## Files Modified

### New Components
- `src/components/layout/UnifiedLayouts.tsx` (SectionBlock, PageHeader, StaggeredGrid, useBreadcrumbs)

### Layout Files
- `src/pages/services/layout.tsx`
- `src/pages/government/layout.tsx`
- `src/pages/statistics/layout.tsx`
- `src/pages/openlgu/layout.tsx`
- `src/pages/transparency/layout.tsx`

### Index Pages
- `src/pages/transparency/index.tsx`
- `src/pages/services/index.tsx`
- `src/pages/government/elected-officials/index.tsx`
- `src/pages/government/departments/index.tsx`

### Detail Pages
- `src/pages/services/[service].tsx`
- `src/pages/openlgu/[document].tsx`
- `src/pages/openlgu/[term].tsx`
- `src/pages/openlgu/[person].tsx`

### Special Pages
- `src/pages/accessibility/index.tsx`

### Export Updates
- `src/components/layout/index.ts`
- `src/hooks/index.ts`

---

## Implementation Notes

1. **Container Pattern**: Removed redundant `container mx-auto px-4` from pages where the SidebarLayout already provides it. Added where needed for consistency.

2. **Animation Consistency**: Applied `animate-in fade-in duration-700` to all page wrappers and section blocks.

3. **CardGrid Adoption**: Replaced custom grid implementations with `CardGrid` from `@/components/ui/Card` for consistency.

4. **Breadcrumb Hook**: Created `useBreadcrumbs` hook for automatic breadcrumb generation from route. Updated all detail pages to use it.

5. **Kapwa Token Prefixes**: Ensured all semantic tokens use Tailwind v4 prefixes (`text-kapwa-text-*`, `bg-kapwa-bg-*`, `border-kapwa-border-*`).

---

## Component Exports

### Updated `src/components/layout/index.ts`

```tsx
export { Footer } from './Footer';
export { Navbar } from './Navbar';
export { PageLayouts } from './PageLayouts';
export { ScrollToTop } from './ScrollToTop';
export { SEO } from './SEO';
export { SidebarLayout } from './SidebarLayout';

// Unified Layout Components
export {
  PageHeader,
  SectionBlock,
  SectionAlternator,
  StaggeredGrid,
  useBreadcrumbs,
  type SectionBlockProps,
  type PageHeaderProps,
  type StaggeredGridProps,
} from './UnifiedLayouts';
```

### Updated `src/hooks/index.ts`

```tsx
export * from './useFinancialData';
export * from './useLegislation';
export { useBreadcrumbs } from '@/components/layout/UnifiedLayouts';
```

---

## Next Steps

1. **Component Audit**: Run usage analysis to identify unused components for removal
2. **Consolidation**: Merge duplicate timeline and skeleton implementations
3. **Testing**: Verify responsive behavior across all breakpoints
4. **Documentation**: Update CLAUDE.md with new component patterns

---

## References

- **Kapwa Semantic Guide**: `KAPWA_SEMANTIC_GUIDE.md`
- **Design System Guide**: `docs/BetterLB-Design-System-Guide.md`
- **Visual Consistency Plan**: `VISUAL_CONSISTENCY_PLAN.md`
