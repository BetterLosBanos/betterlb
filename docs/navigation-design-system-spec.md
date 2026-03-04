# Navigation Design System Specification

**Task:** T-079 - Create unified navigation page design system specification
**Date:** 2026-03-01
**Author:** developer-1
**Status:** Implementation Complete - Ready for QA Review

---

## Executive Summary

This specification defines unified design standards for all navigation pages in the BetterLB application. It addresses the inconsistencies identified in the T-078 Navigation Patterns Audit and provides prescriptive guidelines for implementing consistent, accessible, and maintainable navigation across the application.

**Scope:** Navigation pages including services, government (departments, elected officials, barangays), statistics, transparency, and OpenLGU sections.

**Goals:**
- Unify design patterns across all navigation pages
- Address T-078 inconsistencies (breadcrumb usage, header variants, sidebar naming)
- Provide clear, actionable standards for developers
- Guide refactoring efforts (T-089 through T-093)
- Ensure WCAG 2.1 Level AA accessibility compliance

**Relationship to T-078:** T-078 documents the current state of navigation patterns. This specification prescribes what patterns SHOULD be used, building on T-078 findings to establish unified standards.

---

## 1. Purpose & Scope

### 1.1 What This Specification Covers

This specification applies to all **navigation pages** in BetterLB - pages that use sidebar navigation with hierarchical content organization:

**Included Sections:**
- Services (`/services/*`)
- Government Departments (`/government/departments/*`)
- Elected Officials (`/government/elected-officials/*`)
- Barangays (`/government/barangays/*`)
- Statistics (`/statistics/*`)
- Transparency (`/transparency/*`)
- OpenLGU (`/openlgu/*`)

**Page Types:**
- Index pages (list/grid views with filtering)
- Detail pages (individual item views)
- Hub pages (navigation to sub-sections)

### 1.2 What This Specification Does NOT Cover

- Homepage (`/`) - has unique layout patterns
- Admin dashboard (`/admin/*`) - separate UI patterns
- Non-navigation pages (about, contribute, etc.)
- Chart components - covered by separate statistics page documentation

### 1.3 Relationship to T-078 Navigation Patterns Audit

**T-078 Audit** (docs/qa-reports/T-078-Navigation-Patterns-Audit-QA-Report.md):
- Documents current state: 900+ lines covering existing navigation patterns
- Identifies strengths and inconsistencies
- Provides comprehensive inventory of navigation components

**This Specification**:
- Prescribes unified standards based on T-078 findings
- Addresses inconsistencies with clear rules
- Provides DO/DON'T examples
- Guides systematic migration of existing pages

**Key Inconsistencies from T-078 Being Addressed:**
1. Breadcrumb usage (auto vs manual patterns)
2. Header variant guidelines (hero vs compact usage)
3. Sidebar collapse logic naming consistency

---

## 2. Design Token Standards

All navigation pages MUST use Kapwa semantic tokens following Tailwind v4 prefix conventions.

### 2.1 Token Usage Rules

**Color Tokens:**
```tsx
// ✅ CORRECT - Use Kapwa semantic tokens
className="text-kapwa-text-strong bg-kapwa-bg-surface border-kapwa-border-weak"

// ❌ INCORRECT - Raw color tokens
className="text-gray-900 bg-white border-gray-200"
```

**Tailwind v4 Prefix Convention:**
All Kapwa tokens MUST include the `kapwa-` prefix:
- `text-kapwa-text-*` (not `text-kapwa-*`)
- `bg-kapwa-bg-*` (not `bg-kapwa-*`)
- `border-kapwa-border-*` (not `border-kapwa-*`)

### 2.2 Navigation-Specific Token Mappings

**Page Backgrounds:**
- Default: `bg-kapwa-bg-surface`
- No dark backgrounds on navigation pages (use `bg-kapwa-bg-surface` or `bg-kapwa-bg-surface-bold`)

**Header Backgrounds:**
- Hero headers (index pages): `bg-kapwa-bg-surface-bold` with optional gradient overlay
- Compact headers (detail pages): `bg-kapwa-bg-surface` with `border-b border-kapwa-border-weak`
- Section headers: `bg-kapwa-bg-hover-weak`

**Sidebar Backgrounds:**
- Container: `bg-kapwa-bg-surface`
- Active items: `bg-kapwa-bg-selected`
- Hover items: `bg-kapwa-bg-hover`

**Text Colors:**
- Headings: `text-kapwa-text-strong`
- Body text: `text-kapwa-text-default`
- Muted text: `text-kapwa-text-weak`
- Links: `text-kapwa-text-link` (or `text-kapwa-text-inverse` on dark backgrounds)

---

## 3. Color & Background System

### 3.1 Page Background Standards

**Index Pages:**
```tsx
<div className="bg-kapwa-bg-surface min-h-screen">
  <SidebarLayout>
    <PageHeader variant="hero" />
    {/* Content */}
  </SidebarLayout>
</div>
```

**Detail Pages:**
```tsx
<div className="bg-kapwa-bg-surface min-h-screen">
  <SidebarLayout>
    <PageHeader variant="compact" />
    {/* Content */}
  </SidebarLayout>
</div>
```

**Rules:**
- ALL navigation pages use `bg-kapwa-bg-surface`
- NO raw color tokens (e.g., `bg-gray-900`, `bg-slate-50`)
- NO dark mode variations on navigation pages

### 3.2 Header Background Standards

**Hero Headers (Index Pages Only):**
```tsx
<PageHeader
  variant="hero"
  className="bg-kapwa-bg-surface-bold"
  // Optional gradient overlay for visual distinction
  overlay="bg-gradient-to-b from-kapwa-bg-surface-bold to-kapwa-bg-surface"
/>
```

**Compact Headers (Detail Pages):**
```tsx
<PageHeader
  variant="compact"
  className="bg-kapwa-bg-surface border-b border-kapwa-border-weak"
/>
```

**Section Headers (Within Pages):**
```tsx
<section className="bg-kapwa-bg-hover-weak p-kapwa-md rounded-lg">
  <h2 className="kapwa-heading-md text-kapwa-text-strong">
    Section Title
  </h2>
</section>
```

### 3.3 Sidebar Background Standards

**Sidebar Container:**
```tsx
<div className="bg-kapwa-bg-surface border-r border-kapwa-border-weak">
  {/* Sidebar content */}
</div>
```

**Active Navigation Item:**
```tsx
<SidebarItem
  className="bg-kapwa-bg-selected text-kapwa-text-strong"
  isActive={true}
/>
```

**Hover State:**
```tsx
<SidebarItem
  className="hover:bg-kapwa-bg-hover transition-colors"
/>
```

### 3.4 Background Color Reference Table

| Context | Background Class | Usage |
|---------|-----------------|-------|
| Page container | `bg-kapwa-bg-surface` | All navigation pages |
| Hero header | `bg-kapwa-bg-surface-bold` | Index page headers |
| Compact header | `bg-kapwa-bg-surface` | Detail page headers |
| Section header | `bg-kapwa-bg-hover-weak` | Sub-sections within pages |
| Sidebar container | `bg-kapwa-bg-surface` | Sidebar background |
| Active nav item | `bg-kapwa-bg-selected` | Currently selected item |
| Hover nav item | `hover:bg-kapwa-bg-hover` | Interactive state |

---

## 4. Typography Standards

### 4.1 Font Usage Hierarchy

**Page Headers (PageHeader Component):**

Hero variant (index pages):
```tsx
<PageHeader variant="hero">
  <h1 className="kapwa-display-xl text-kapwa-text-strong">
    Page Title
  </h1>
  <p className="kapwa-body-lg text-kapwa-text-default">
    Page description
  </p>
</PageHeader>
```

Compact variant (detail pages):
```tsx
<PageHeader variant="compact">
  <h1 className="kapwa-heading-xl text-kapwa-text-strong">
    Page Title
  </h1>
  <p className="kapwa-body-md text-kapwa-text-weak">
    Page description
  </p>
</PageHeader>
```

**Sidebar Components:**

Container titles:
```tsx
<h3 className="kapwa-heading-md text-kapwa-text-strong">
  Categories
</h3>
```

Item labels:
```tsx
<span className="kapwa-body-md-default text-kapwa-text-default">
  Category Name
</span>
```

Group headers:
```tsx
<h4 className="kapwa-label-md text-kapwa-text-weak uppercase">
  Group Name
</h4>
```

**Breadcrumbs:**
```tsx
<nav className="kapwa-body-sm-default">
  <a className="text-kapwa-text-link">Home</a>
  <span className="text-kapwa-text-weak">/</span>
  <span className="text-kapwa-text-weak">Current Page</span>
</nav>
```

### 4.2 Typography Rules

**DO:**
- Use Kapwa typography tokens for ALL text
- Follow semantic heading hierarchy (h1 → h2 → h3)
- Maintain consistent scale across all navigation pages
- Use `kapwa-body-*` for body text, `kapwa-heading-*` for headings

**DON'T:**
- Use arbitrary text sizes (`text-lg`, `text-sm`, `text-xl`)
- Skip heading levels (h1 → h3)
- Use non-Kapwa font classes

---

## 5. Spacing System

All spacing follows the 4px base unit using Kapwa spacing tokens.

### 5.1 Layout Spacing

**Page Container Padding:**
```tsx
<div className="p-kapwa-lg">  // 32px
  {/* Page content */}
</div>
```

**Section Gaps:**
```tsx
<div className="flex flex-col gap-kapwa-lg">  // 32px between sections
  <section>...</section>
  <section>...</section>
</div>
```

**Card Gaps:**
```tsx
<div className="grid grid-cols-3 gap-kapwa-md">  // 16px between cards
  {/* Cards */}
</div>
```

### 5.2 Sidebar Spacing

**Sidebar Container:**
```tsx
<aside className="p-kapwa-md">  // 16px padding
  <SidebarContainer>
    {/* Content */}
  </SidebarContainer>
</aside>
```

**Sidebar Items:**
```tsx
<SidebarItem className="py-kapwa-sm px-kapwa-md">  // 8px vertical, 16px horizontal
  Item Label
</SidebarItem>
```

**Sidebar Groups:**
```tsx
<SidebarGroup className="gap-kapwa-sm">  // 8px between items
  {/* Group items */}
</SidebarGroup>
```

### 5.3 Header Spacing

**Hero Header:**
```tsx
<PageHeader variant="hero" className="py-kapwa-2xl px-kapwa-lg">
  {/* 64px vertical padding, 32px horizontal */}
</PageHeader>
```

**Compact Header:**
```tsx
<PageHeader variant="compact" className="py-kapwa-lg px-kapwa-lg">
  {/* 32px vertical padding, 32px horizontal */}
</PageHeader>
```

### 5.4 Spacing Reference Table

| Context | Spacing Class | Value | Usage |
|---------|--------------|-------|-------|
| Page padding | `p-kapwa-lg` | 32px | Page container padding |
| Section gaps | `gap-kapwa-lg` | 32px | Between sections |
| Card gaps | `gap-kapwa-md` | 16px | Between cards |
| Sidebar container | `p-kapwa-md` | 16px | Sidebar padding |
| Sidebar item | `py-kapwa-sm px-kapwa-md` | 8px / 16px | Item padding |
| Sidebar groups | `gap-kapwa-sm` | 8px | Between sidebar items |
| Hero header | `py-kapwa-2xl px-kapwa-lg` | 64px / 32px | Hero header padding |
| Compact header | `py-kapwa-lg px-kapwa-lg` | 32px | Compact header padding |

---

## 6. Layout Patterns

### 6.1 Pattern A: Index Page with Sidebar

**Structure:**
```
SidebarLayout (collapsible={true})
├── PageHeader (variant="hero", autoBreadcrumbs={true})
├── Sidebar (section-specific, collapsible)
└── Outlet (filterable grid/list)
```

**Example Implementation:**
```tsx
<SidebarLayout
  collapsible={true}
  defaultCollapsed={false}
  headerNode={
    <PageHeader
      variant="hero"
      title="Local Government Services"
      description="Browse services by category"
      autoBreadcrumbs={true}
    />
  }
  sidebar={<ServicesSidebar />}
>
  <Outlet />
</SidebarLayout>
```

**Used By:**
- `/services` (services index)
- `/government/departments` (departments index)
- `/statistics` (statistics index)
- `/transparency` (transparency index)

### 6.2 Pattern B: Detail Page with Sidebar

**Structure:**
```
SidebarLayout (collapsible={true})
├── PageHeader (variant="compact", autoBreadcrumbs={true})
├── Sidebar (section-specific, default collapsed)
└── Outlet (detail content)
```

**Example Implementation:**
```tsx
<SidebarLayout
  collapsible={true}
  defaultCollapsed={true}
  headerNode={
    <PageHeader
      variant="compact"
      title="Business Permit"
      description="Requirements and application process"
      autoBreadcrumbs={true}
    />
  }
  sidebar={<ServicesSidebar />}
>
  <Outlet />
</SidebarLayout>
```

**Used By:**
- `/services/:service` (service detail pages)
- `/government/departments/:dept` (department detail pages)
- `/statistics/:stat` (statistics detail pages)

### 6.3 Pattern C: Root Hub Page

**Structure:**
```
SidebarLayout (collapsible={false})
├── PageHeader (variant="hero", centered)
└── Outlet (card-based navigation to sub-sections)
```

**Example Implementation:**
```tsx
<SidebarLayout
  collapsible={false}
  headerNode={
    <PageHeader
      variant="hero"
      title="Government"
      description="Elected officials, departments, and barangays"
      centered={true}
      autoBreadcrumbs={true}
    />
  }
>
  <Outlet />
</SidebarLayout>
```

**Used By:**
- `/government` (government root hub)

### 6.4 Layout Pattern Rules

**Header Variant Usage:**
- Index pages: ALWAYS use `variant="hero"`
- Detail pages: ALWAYS use `variant="compact"`
- Hub pages: Use `variant="hero"` with `centered={true}`

**Breadcrumb Usage:**
- ALWAYS use `autoBreadcrumbs={true}`
- NEVER use manual breadcrumb components
- Let PageHeader handle breadcrumb generation

**Sidebar Configuration:**
- Index pages: `collapsible={true}`, `defaultCollapsed={false}`
- Detail pages: `collapsible={true}`, `defaultCollapsed={true}`
- Hub pages: `collapsible={false}` (no sidebar on hub)

---

## 7. Component Specifications

### 7.1 PageHeader Component

**Props Interface:**
```typescript
interface PageHeaderProps {
  variant: 'hero' | 'compact';
  title: string;
  description?: string;
  autoBreadcrumbs?: boolean;
  centered?: boolean;
  className?: string;
  overlay?: string; // For gradient overlays on hero headers
}
```

**Design System Compliance:**
- Colors: `bg-kapwa-bg-surface` (compact), `bg-kapwa-bg-surface-bold` (hero)
- Text: `kapwa-display-xl` (hero title), `kapwa-heading-xl` (compact title)
- Spacing: `py-kapwa-2xl px-kapwa-lg` (hero), `py-kapwa-lg px-kapwa-lg` (compact)

**Variations:**

| Variant | Usage | Breadcrumbs | Centered |
|---------|-------|-------------|----------|
| Hero | Index pages | autoBreadcrumbs={true} | Optional (hub pages) |
| Compact | Detail pages | autoBreadcrumbs={true} | false |

**Example Usage:**
```tsx
// Hero header (index page)
<PageHeader
  variant="hero"
  title="Services"
  description="Browse local government services"
  autoBreadcrumbs={true}
/>

// Compact header (detail page)
<PageHeader
  variant="compact"
  title="Business Permit"
  description="Requirements and process"
  autoBreadcrumbs={true}
/>

// Hero header (hub page)
<PageHeader
  variant="hero"
  title="Government"
  description="Elected officials and departments"
  centered={true}
  autoBreadcrumbs={true}
/>
```

### 7.2 SidebarLayout Component

**Props Interface:**
```typescript
interface SidebarLayoutProps {
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  headerNode?: React.ReactNode;
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}
```

**Design System Compliance:**
- Backgrounds: `bg-kapwa-bg-surface`
- Borders: `border-kapwa-border-weak`
- Text: `text-kapwa-text-default`

**Responsive Behavior:**
- Mobile (< 640px): Sidebar hidden by default, hamburger menu toggle
- Tablet (640px - 1024px): Sidebar collapsible
- Desktop (> 1024px): Sidebar visible by default (index pages)

**Variations:**

| Pattern | Collapsible | Default Collapsed | Usage |
|---------|-------------|-------------------|-------|
| Index page | true | false | Index pages with filters |
| Detail page | true | true | Detail pages |
| Hub page | false | N/A | Root hub pages |

### 7.3 SidebarContainer Component

**Props Interface:**
```typescript
interface SidebarContainerProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Design System Compliance:**
- Background: `bg-kapwa-bg-surface`
- Title: `kapwa-heading-md text-kapwa-text-strong`
- Spacing: `p-kapwa-md`

**Example Usage:**
```tsx
<SidebarContainer title="Categories">
  <SidebarGroup>
    {/* Sidebar items */}
  </SidebarGroup>
</SidebarContainer>
```

### 7.4 SidebarGroup Component

**Props Interface:**
```typescript
interface SidebarGroupProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
}
```

**Design System Compliance:**
- Gap: `gap-kapwa-sm` (8px between items)
- Title: `kapwa-label-md text-kapwa-text-weak uppercase`

**Example Usage:**
```tsx
<SidebarGroup title="Frontline Services">
  <SidebarItem label="Business Permit" path="/services/business-permit" />
  <SidebarItem label="Building Permit" path="/services/building-permit" />
</SidebarGroup>
```

### 7.5 SidebarItem Component

**Props Interface:**
```typescript
interface SidebarItemProps {
  label: string;
  path?: string;
  icon?: LucideIcon;
  isActive?: boolean;
  onClick?: () => void;
  className?: string;
}
```

**Design System Compliance:**
- Default: `bg-kapwa-bg-surface text-kapwa-text-default`
- Active: `bg-kapwa-bg-selected text-kapwa-text-strong`
- Hover: `hover:bg-kapwa-bg-hover`
- Padding: `py-kapwa-sm px-kapwa-md`
- Text: `kapwa-body-md-default`

**Example Usage:**
```tsx
<SidebarItem
  label="All Services"
  icon={FileText}
  isActive={selectedCategory === 'all'}
  onClick={() => handleCategoryChange('all')}
/>
```

---

## 8. Responsive Guidelines

### 8.1 Breakpoint System

BetterLB uses standard Tailwind breakpoints:
- Mobile: `< 640px` (default)
- Tablet: `640px - 1024px` (`md:`)
- Desktop: `> 1024px` (`lg:`)

### 8.2 Mobile (< 640px)

**Sidebar Behavior:**
- Hidden by default
- Hamburger menu button (44px minimum touch target)
- Full-screen overlay when open
- Close button in top-right corner

**Header Behavior:**
- Compact variant ONLY (no hero headers on mobile)
- Single-column layout
- Centered content

**Breadcrumbs:**
- Horizontal scrollable if needed
- Truncate long breadcrumb items
- Maintain accessibility (keyboard navigation)

**Touch Targets:**
- Minimum 44px x 44px for all interactive elements
- Adequate spacing between links (at least 8px)

**Example:**
```tsx
<div className="lg:hidden">
  {/* Mobile view */}
  <SidebarLayout collapsible={true} defaultCollapsed={true}>
    <PageHeader variant="compact" /> {/* Hero becomes compact on mobile */}
  </SidebarLayout>
</div>
```

### 8.3 Tablet (640px - 1024px)

**Sidebar Behavior:**
- Collapsible (default collapsed on detail pages)
- Overlay when expanded (not push)
- Smooth transitions (300ms)

**Header Behavior:**
- Hero variant allowed on index pages
- Compact variant on detail pages
- Responsive font sizing

**Breadcrumbs:**
- Auto-wrap to multiple lines if needed
- Truncate long items with ellipsis

**Example:**
```tsx
<div className="md:flex md:flex-row">
  <SidebarLayout collapsible={true} defaultCollapsed={isDetailPage}>
    <PageHeader variant={isIndexPage ? 'hero' : 'compact'} />
  </SidebarLayout>
</div>
```

### 8.4 Desktop (> 1024px)

**Sidebar Behavior:**
- Visible by default on index pages
- Collapsible on detail pages
- Smooth transitions

**Header Behavior:**
- Full hero and compact variants
- Maximum width containers (1280px)

**Breadcrumbs:**
- Single line (no wrapping)
- Full text display (no truncation)

**Example:**
```tsx
<div className="lg:flex lg:flex-row">
  <SidebarLayout
    collapsible={isDetailPage}
    defaultCollapsed={isDetailPage}
  >
    <PageHeader variant={isIndexPage ? 'hero' : 'compact'} />
  </SidebarLayout>
</div>
```

### 8.5 Responsive Design Rules

**DO:**
- Use mobile-first responsive design (`default` → `md:` → `lg:`)
- Test on actual devices (not just browser resize)
- Ensure touch targets meet minimum size (44px)
- Maintain accessibility across all viewports

**DON'T:**
- Use viewport-specific CSS (use Tailwind breakpoints)
- Hide content on mobile (refactor layout instead)
- Use fixed widths (use responsive container queries)

---

## 9. Accessibility Requirements

All navigation pages MUST meet WCAG 2.1 Level AA standards.

### 9.1 Keyboard Navigation

**Tab Order:**
1. Skip to content link (first focusable element)
2. Mobile menu toggle (if visible)
3. Main navigation (Navbar)
4. Breadcrumbs
5. Page title (h1)
6. Sidebar navigation items
7. Page content
8. Footer links

**Keyboard Shortcuts:**
- `Tab` / `Shift+Tab`: Navigate forward/backward
- `Enter` / `Space`: Activate links and buttons
- `Escape`: Close mobile menu or dropdown
- `Home` / `End`: Jump to first/last item in lists
- `Arrow keys`: Navigate within lists (sidebar items)

**Focus Management:**
- Visible focus indicators on all interactive elements
- Logical tab order (follows visual layout)
- No keyboard traps
- Focus returns to triggering element after closing modals/menus

**Example:**
```tsx
<button
  className="focus-visible:ring-2 focus-visible:ring-kapwa-border-focus"
  aria-label="Toggle navigation menu"
  onClick={toggleMenu}
>
  <MenuIcon />
</button>
```

### 9.2 ARIA Attributes

**Navigation Landmarks:**
```tsx
<nav aria-label="Main navigation">
  {/* Navbar content */}
</nav>

<nav aria-label="Page navigation">
  {/* Breadcrumbs */}
</nav>

<aside aria-label="Page categories">
  {/* Sidebar content */}
</aside>
```

**Current Page Indicators:**
```tsx
<SidebarItem
  aria-current={isActive ? 'page' : undefined}
  isActive={isActive}
>
  Category Name
</SidebarItem>
```

**Expanded/Collapsed States:**
```tsx
<button
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  aria-label="Toggle navigation menu"
>
  <MenuIcon />
</button>

<div id="mobile-menu" aria-hidden={!isMenuOpen}>
  {/* Mobile menu content */}
</div>
```

**Label Sidebar Toggles:**
```tsx
<button
  aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
  onClick={toggleSidebar}
>
  {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
</button>
```

### 9.3 Screen Reader Support

**Semantic HTML:**
- Proper heading hierarchy (h1 → h2 → h3)
- No skipped heading levels
- Descriptive link text (no "click here", "read more")

**Example:**
```tsx
// ✅ CORRECT
<h1>Local Government Services</h1>
<h2>Business Permit</h2>
<h3>Requirements</h3>

<a href="/services/business-permit">
  View Business Permit requirements
</a>

// ❌ INCORRECT
<h1>Services</h1>
<h3>Permit</h3> {/* Skipped h2 */}

<a href="/services/business-permit">
  Click here
</a>
```

**Breadcrumbs Navigation:**
```tsx
<nav aria-label="Breadcrumb">
  <ol className="flex items-center gap-2">
    <li>
      <a href="/" className="kapwa-body-sm-default">
        Home
      </a>
    </li>
    <li aria-hidden="true">
      <span className="text-kapwa-text-weak">/</span>
    </li>
    <li>
      <a href="/services" className="kapwa-body-sm-default">
        Services
      </a>
    </li>
    <li aria-hidden="true">
      <span className="text-kapwa-text-weak">/</span>
    </li>
    <li>
      <span aria-current="page" className="kapwa-body-sm-default text-kapwa-text-weak">
        Business Permit
      </span>
    </li>
  </ol>
</nav>
```

### 9.4 Visual Accessibility

**Color Contrast:**
- Minimum 4.5:1 for normal text
- Minimum 3:1 for large text (18px+ or 14px bold)
- Minimum 3:1 for UI components and icons

**Focus Indicators:**
- Visible on all interactive elements
- 2px minimum thickness
- High contrast color (use `ring-kapwa-border-focus`)

**Example:**
```tsx
<a
  href="/services/business-permit"
  className="focus-visible:ring-2 focus-visible:ring-kapwa-border-focus focus-visible:ring-offset-2"
>
  Business Permit
</a>
```

**No Color-Only Information:**
- Use icons + text for important information
- Don't rely solely on color to convey meaning
- Provide text alternatives for color-coded elements

---

## 10. DO/DON'T Examples

### 10.1 Color Usage

**DO: Use Kapwa Semantic Tokens**
```tsx
<div className="bg-kapwa-bg-surface p-kapwa-lg">
  <h2 className="kapwa-heading-xl text-kapwa-text-strong">
    Services
  </h2>
  <p className="kapwa-body-md text-kapwa-text-default">
    Browse local government services
  </p>
</div>
```

**DON'T: Use Raw Color Tokens**
```tsx
<div className="bg-white p-8"> {/* ❌ Raw color and spacing */}
  <h2 className="text-xl text-gray-900">
    Services
  </h2>
  <p className="text-base text-gray-700">
    Browse local government services
  </p>
</div>
```

### 10.2 Breadcrumb Usage

**DO: Use Auto-Generated Breadcrumbs**
```tsx
<PageHeader
  variant="hero"
  title="Services"
  autoBreadcrumbs={true} // ✅ Automatic breadcrumb generation
/>
```

**DON'T: Use Manual Breadcrumb Components**
```tsx
<PageHeader variant="hero" title="Services">
  <CustomBreadcrumbs> {/* ❌ Manual breadcrumb component */}
    <BreadcrumbItem href="/">Home</BreadcrumbItem>
    <BreadcrumbItem href="/services">Services</BreadcrumbItem>
  </CustomBreadcrumbs>
</PageHeader>
```

### 10.3 Header Variant Usage

**DO: Use Correct Header Variants**
```tsx
// Index page - hero variant
<PageHeader variant="hero" title="Services" autoBreadcrumbs={true} />

// Detail page - compact variant
<PageHeader variant="compact" title="Business Permit" autoBreadcrumbs={true} />
```

**DON'T: Mix Header Variants**
```tsx
// Index page - compact variant (❌ Wrong variant)
<PageHeader variant="compact" title="Services" />

// Detail page - hero variant (❌ Wrong variant)
<PageHeader variant="hero" title="Business Permit" />
```

### 10.4 Sidebar Configuration

**DO: Configure Sidebar Correctly**
```tsx
// Index page
<SidebarLayout collapsible={true} defaultCollapsed={false}>
  <PageHeader variant="hero" />
  <ServicesSidebar />
</SidebarLayout>

// Detail page
<SidebarLayout collapsible={true} defaultCollapsed={true}>
  <PageHeader variant="compact" />
  <ServicesSidebar />
</SidebarLayout>
```

**DON'T: Use Incorrect Sidebar Settings**
```tsx
// Index page - sidebar collapsed by default (❌ Wrong)
<SidebarLayout collapsible={true} defaultCollapsed={true}>
  <PageHeader variant="hero" />
</SidebarLayout>

// Detail page - non-collapsible sidebar (❌ Wrong)
<SidebarLayout collapsible={false}>
  <PageHeader variant="compact" />
</SidebarLayout>
```

### 10.5 Responsive Patterns

**DO: Use Mobile-First Responsive Design**
```tsx
<div className="p-kapwa-md md:p-kapwa-lg lg:p-kapwa-xl">
  {/* Content */}
</div>

<PageHeader
  variant="compact"
  className="md:variant-hero" // Hero on tablet+, compact on mobile
/>
```

**DON'T: Use Fixed Viewport Styles**
```tsx
<div className="p-4 md:p-8 lg:p-12"> {/* ❌ Raw spacing values */}
  {/* Content */}
</div>

<div className="hidden lg:block"> {/* ❌ Hiding content on mobile */}
  {/* Should refactor layout instead */}
</div>
```

### 10.6 Accessibility Attributes

**DO: Include Proper ARIA Attributes**
```tsx
<button
  aria-label="Toggle navigation menu"
  aria-expanded={isMenuOpen}
  aria-controls="mobile-menu"
  className="focus-visible:ring-2 focus-visible:ring-kapwa-border-focus"
  onClick={toggleMenu}
>
  <MenuIcon />
</button>
```

**DON'T: Omit Accessibility Attributes**
```tsx
<button onClick={toggleMenu}> {/* ❌ No aria-label or focus styles */}
  <MenuIcon />
</button>
```

---

## 11. Migration Path

This section guides systematic migration of existing navigation pages to use unified standards.

### 11.1 Step 1: Audit Current Page

**Checklist:**
- [ ] Search for raw color tokens (`bg-gray-`, `text-orange-`, etc.)
- [ ] Check breadcrumb implementation (manual vs auto)
- [ ] Check header variant usage (hero vs compact)
- [ ] Check sidebar configuration
- [ ] Check for arbitrary spacing values (`p-4`, `gap-2`, etc.)
- [ ] Verify Kapwa token usage

**Commands:**
```bash
# Search for raw color tokens
grep -r "bg-gray-\|text-orange-\|text-yellow-\|text-emerald-" src/pages/services/

# Check breadcrumb usage
grep -r "autoBreadcrumbs" src/pages/services/

# Check header variants
grep -r "variant=" src/pages/services/ | grep PageHeader
```

**Document Deviations:**
Create a checklist of items that don't comply with this specification.

### 11.2 Step 2: Update Colors

**Replace Raw Color Tokens:**

Common replacements:
- `bg-gray-900` → `bg-kapwa-bg-surface-bold`
- `bg-gray-50` → `bg-kapwa-bg-surface`
- `text-orange-100` → `text-kapwa-text-inverse`
- `text-emerald-600` → `text-kapwa-text-success`
- `border-gray-200` → `border-kapwa-border-weak`

**Example Migration:**
```tsx
// BEFORE
<div className="bg-gray-50 text-gray-900 border-gray-200">

// AFTER
<div className="bg-kapwa-bg-surface text-kapwa-text-default border-kapwa-border-weak">
```

**Verification:**
```bash
# Verify no raw color tokens remain
grep -r "bg-gray-\|text-orange-\|text-yellow-\|text-emerald-" src/pages/services/
```

### 11.3 Step 3: Update Spacing

**Replace Arbitrary Spacing:**
- `p-4` → `p-kapwa-md`
- `p-8` → `p-kapwa-lg`
- `gap-2` → `gap-kapwa-sm`
- `gap-4` → `gap-kapwa-md`

**Example Migration:**
```tsx
// BEFORE
<div className="p-8 gap-4">

// AFTER
<div className="p-kapwa-lg gap-kapwa-md">
```

**Verification:**
```bash
# Verify no arbitrary spacing remains
grep -r "p-[0-9]\|gap-[0-9]" src/pages/services/
```

### 11.4 Step 4: Update Layout

**Replace Manual Breadcrumbs:**
```tsx
// BEFORE
<PageHeader variant="hero">
  <CustomBreadcrumbs />
</PageHeader>

// AFTER
<PageHeader variant="hero" autoBreadcrumbs={true} />
```

**Standardize Header Variants:**
```tsx
// Index pages - ensure hero variant
<PageHeader variant="hero" title="Services" autoBreadcrumbs={true} />

// Detail pages - ensure compact variant
<PageHeader variant="compact" title="Business Permit" autoBreadcrumbs={true} />
```

**Update Sidebar Configuration:**
```tsx
// Index pages
<SidebarLayout collapsible={true} defaultCollapsed={false}>

// Detail pages
<SidebarLayout collapsible={true} defaultCollapsed={true}>
```

### 11.5 Step 5: Verify

**ESLint Check:**
```bash
npm run lint
```
Expected: Zero errors and zero warnings

**TypeScript Check:**
```bash
npx tsc --noEmit
```
Expected: No type errors

**Kapwa Token Check:**
```bash
# Use design-cohesion-check skill to verify
npm run run design-cohesion-check src/pages/services/
```

### 11.6 Step 6: Test

**Manual Testing:**
- [ ] Test on mobile viewport (375x667)
- [ ] Test on tablet viewport (768x1024)
- [ ] Test on desktop viewport (1280x720)
- [ ] Test keyboard navigation (Tab, Enter, Escape)
- [ ] Test with screen reader (VoiceOver/NVDA)
- [ ] Test touch targets (minimum 44px)

**E2E Testing:**
```bash
# Run E2E tests for the page
npm run test:e2e -- services
```

**Visual Regression:**
```bash
# Run visual regression tests
npm run test:e2e -- --project=chromium --grep "@visual"
```

### 11.7 Step 7: Update Tests

**Update Kapwa Token Checks:**
```tsx
// E2E test
test('page uses Kapwa semantic tokens', async ({ page }) => {
  const heroSection = page.locator('[data-testid="page-header"]');

  // Check for Kapwa tokens
  await expect(heroSection).toHaveClass(/kapwa-bg-surface/);
  await expect(heroSection).toHaveClass(/kapwa-text-strong/);

  // Check no raw color tokens
  const classes = await heroSection.getAttribute('class');
  expect(classes).not.toMatch(/bg-gray-/);
  expect(classes).not.toMatch(/text-orange-/);
});
```

---

## 12. Related Documentation

### 12.1 T-078 Navigation Patterns Audit
**File:** `docs/qa-reports/T-078-Navigation-Patterns-Audit-QA-Report.md`
**Content:** Comprehensive audit of current navigation patterns (900+ lines)
**Relationship:** This spec builds on T-078 findings to prescribe unified standards

### 12.2 BetterLB Design System Guide
**File:** `docs/BetterLB-Design-System-Guide.md`
**Content:** Comprehensive design system reference (2381 lines, 16 sections)
**Relevant Sections:**
- Section 4: Component Library (PageHeader, SidebarLayout patterns)
- Section 5: Page Layout Patterns (navigation page patterns)

### 12.3 Component Specification Template
**File:** `docs/component-spec-template.md`
**Content:** Template for writing component specifications
**Usage:** Follow this template when creating new navigation components

### 12.4 Kapwa Semantic Token Guide
**File:** `KAPWA_SEMANTIC_GUIDE.md`
**Content:** Quick reference for Kapwa semantic token usage
**Key Points:**
- Tailwind v4 prefix convention (`text-kapwa-text-*`, not `text-kapwa-*`)
- Common mistakes to avoid

### 12.5 Accessibility Guidelines
**Task:** T-031 - Conduct accessibility audit
**File:** `docs/accessibility-audit-summary-T-031.md`
**Content:** Accessibility audit findings and recommendations
**Grade:** B+ (85/100) with path to A grade (95/100)

### 12.6 Security and Privacy Documentation
**Files:**
- `docs/SECURITY-GUIDE.md`
- `docs/PRIVACY.md`
- `docs/SECURITY-CHECKLIST.md`

**Relevance:** Ensure navigation components follow security patterns (CSRF, audit logging for admin actions)

---

## Implementation Notes

### File Naming Convention
This specification should be saved as:
```
docs/navigation-design-system-spec.md
```

### Version History
- **v1.0** (2026-03-01): Initial specification created for T-079

### Maintenance
This specification should be updated when:
- New navigation patterns are introduced
- Kapwa design system tokens change
- Accessibility standards evolve
- New navigation components are created

### Approval Status
- **Design:** Approved - Implementation plan executed
- **Implementation:** Complete - Specification document created
- **QA:** Pending - Awaiting formal QA review

---

## Next Steps

1. **Create Implementation Plan** (T-079 continuation)
   - Use `superpowers:writing-plans` skill
   - Break down into bite-sized tasks
   - Estimate effort and dependencies

2. **Execute Implementation** (T-081, T-082, T-084-T-093)
   - Follow migration path systematically
   - Create reusable layout components (T-085, T-086)
   - Refactor navigation pages to use unified standards

3. **QA Validation** (T-099, T-100, T-103)
   - Verify compliance with this specification
   - Test accessibility, responsive design, and visual consistency
   - Update documentation as needed

---

**Document Status:** Implementation Complete - Ready for QA Review
**Next Action:** Submit to qa-engineer for formal review, then unblock T-081, T-082, T-084-T-094
