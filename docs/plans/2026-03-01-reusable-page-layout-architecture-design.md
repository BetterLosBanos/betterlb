# Reusable Page Layout Component Architecture Design

**Task:** T-081 - Design reusable page layout component architecture
**Date:** 2026-03-01
**Author:** project-manager
**Status:** Design Complete - Ready for Implementation Planning
**Dependencies:** T-078 (Navigation Patterns Audit), T-079 (Navigation Design System Spec), T-080 (Component Usage Audit)

---

## Executive Summary

This design document defines the architecture for reusable page layout components that will consolidate inconsistent patterns across 61 navigation page files in the BetterLB application. The design creates two primary layout components (`IndexPageLayout` and `DetailPageLayout`) plus supporting components (`FilterBar`, `NavigationSidebar`) that will reduce boilerplate code by 40-60% while ensuring consistency with the Kapwa Design System.

**Key Benefits:**
- 40-60% reduction in boilerplate per page (per T-080 audit)
- Consistent UX across all navigation pages
- Easier maintenance - changes in one place affect all pages
- Faster development - new pages can be created quickly
- Full type safety with TypeScript

**Estimated Implementation Effort:** 26-33 hours across 3 phases

---

## Background and Context

### Problem Statement

The T-080 Component Usage Audit identified significant inconsistencies across 61 navigation page files:

- **18+ index pages** with repetitive patterns: ModuleHeader → Filters → Results Count → Grid/List → Pagination → Empty State
- **15+ detail pages** with repetitive patterns: PageHero → Contact/Info Section → Content Sections → Related Items
- **Inconsistent filter interfaces** - custom `FilterBar` (services), `DocumentFilters` (openlgu), and various SelectPicker patterns
- **3 sidebar variants** (`DepartmentsSidebar`, `BarangaysSidebar`, `OpenLGUSidebar`) with 80% code duplication

### Dependencies and Prerequisites

**T-078 Navigation Patterns Audit:**
- Documented current state across 900+ lines
- Identified strengths and inconsistencies
- Provided comprehensive component inventory

**T-079 Navigation Design System Spec:**
- Established unified design standards
- Defined Kapwa semantic token usage rules
- Prescribed DO/DON'T patterns for navigation pages

**T-080 Component Usage Audit:**
- Identified consolidation opportunities
- Proposed `IndexPageLayout` and `DetailPageLayout` interfaces
- Estimated 40-60% code reduction potential

---

## Architecture Overview

### Design Principles

1. **Composition over configuration** - Layouts are composed from existing components (ModuleHeader, PageHero, DetailSection)
2. **Backwards compatible** - Pages can opt-in gradually; no breaking changes to existing pages
3. **TypeScript strict mode** - Full type safety with proper interfaces and generics
4. **Kapwa token compliance** - All styling uses semantic tokens per T-079 spec
5. **Accessibility first** - ARIA labels, keyboard navigation, screen reader support (WCAG 2.1 Level AA)
6. **Performance optimized** - No unnecessary re-renders; proper React.memo usage where appropriate

### Component Hierarchy

```
src/components/layout/
├── IndexPageLayout.tsx       # Primary layout for listing pages
├── DetailPageLayout.tsx      # Primary layout for detail pages
└── PageLayouts.tsx           # Export barrel (existing components)

src/components/filters/
├── FilterBar.tsx             # Standardized multi-filter interface
└── FilterTypes.ts            # TypeScript types for filter configurations

src/components/navigation/
├── NavigationSidebar.tsx     # Generic sidebar component
└── SidebarTypes.ts           # TypeScript types for sidebar configurations
```

---

## Component Specifications

### Component 1: IndexPageLayout

**Purpose:** Abstract the common pattern of listing/grid pages with search, filters, and pagination.

**Target Pages:** 18+ index pages across:
- Services (`/services`)
- Government Departments (`/government/departments`)
- Barangays (`/government/barangays`)
- Transparency (`/transparency/infrastructure`, `/transparency/financial`)
- Statistics (`/statistics`)
- OpenLGU (`/openlgu/documents`, `/openlgu/terms`)

**TypeScript Interface:**

```tsx
interface IndexPageLayoutProps {
  // === Header ===
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];

  // === Search & Filters ===
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
  };

  filters?: FilterConfig[];

  // === Actions Slot ===
  // For buttons, links, or other interactive elements
  actions?: ReactNode;

  // === Results ===
  resultsCount?: number;
  resultsLabel?: string;  // e.g., "departments", "documents"
  children: ReactNode;    // The grid/list content

  // === Pagination ===
  pagination?: {
    type: 'infinite' | 'traditional';
    currentPage?: number;
    totalPages?: number;
    onPageChange?: (page: number) => void;
    onLoadMore?: () => void;
    hasMore?: boolean;
    isLoading?: boolean;
  };

  // === Empty State ===
  emptyState?: {
    icon?: LucideIcon;
    title: string;
    message: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
  };

  // === Styling Variants ===
  variant?: 'default' | 'compact' | 'wide';
  className?: string;
}
```

**Usage Example (Departments Index):**

```tsx
<IndexPageLayout
  title="Municipal Departments"
  description={`${filtered.length} active offices.`}
  search={{
    value: search,
    onChange: setSearch,
    placeholder: 'Search departments...',
    className: 'md:w-72'
  }}
  resultsCount={filtered.length}
  resultsLabel="departments"
  pagination={{
    type: 'infinite',
    hasMore: hasMore,
    onLoadMore: loadMore,
    isLoading: isLoading
  }}
  emptyState={{
    icon: SearchXIcon,
    title: 'No departments found',
    message: 'Try adjusting your search or filters to find what you\'re looking for.',
    actionLabel: 'Suggest a Department',
    actionHref: '/contribute'
  }}
>
  <CardGrid>
    {filtered.map(dept => (
      <Link key={dept.slug} to={dept.slug} className="group block h-full">
        <Card hover className="flex h-full flex-col">
          <CardContent>
            <DepartmentCardContent dept={dept} />
          </CardContent>
        </Card>
      </Link>
    ))}
  </CardGrid>
</IndexPageLayout>
```

**Internal Structure:**

```tsx
export function IndexPageLayout({
  title,
  description,
  breadcrumbs,
  search,
  filters,
  actions,
  resultsCount,
  resultsLabel = 'items',
  children,
  pagination,
  emptyState,
  variant = 'default',
  className
}: IndexPageLayoutProps) {
  // Compose ModuleHeader with search/filters/actions
  // Render results count badge
  // Render children (grid/list)
  // Render pagination or infinite scroll trigger
  // Render empty state if no results
  // All using Kapwa semantic tokens
}
```

---

### Component 2: DetailPageLayout

**Purpose:** Abstract the common pattern of detail pages with hero, sections, and related items.

**Target Pages:** 15+ detail pages across:
- Services (`/services/[service]`)
- Government Departments (`/government/departments/[department]`)
- Barangays (`/government/barangays/[barangay]`)
- Elected Officials (`/government/elected-officials/*`)
- OpenLGU (`/openlgu/documents/[document]`, `/openlgu/persons/[person]`)

**TypeScript Interface:**

```tsx
interface DetailPageLayoutProps {
  // === Hero Section ===
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  metadata?: ReactNode;      // Badges, tags, status indicators
  heroActions?: ReactNode;   // Buttons, links in hero

  // === Content Sections ===
  sections: Array<{
    id: string;
    title: string;
    description?: string;
    content: ReactNode;
    variant?: 'default' | 'highlighted' | 'compact';
  }>;

  // === Contact Information ===
  // Common pattern across most detail pages
  contact?: {
    email?: string;
    phone?: string;
    address?: string;
    website?: string;
    hours?: string;
    custom?: Array<{
      label: string;
      value: string;
      icon?: LucideIcon;
    }>;
  };

  // === Related Items ===
  related?: {
    title: string;
    items: Array<{
      title: string;
      href: string;
      description?: string;
      icon?: LucideIcon;
    }>;
  };

  // === Styling ===
  variant?: 'default' | 'wide' | 'sidebar';
  className?: string;
}
```

**Usage Example (Department Detail):**

```tsx
<DetailPageLayout
  title="Municipal Agriculture Office"
  description="Agricultural services and programs for Los Baños"
  breadcrumbs={[
    { label: 'Government', href: '/government' },
    { label: 'Departments', href: '/government/departments' }
  ]}
  metadata={<Badge>Frontline Service</Badge>}
  contact={{
    email: 'agri@betterlb.gov.ph',
    phone: '530-2981',
    address: 'Municipal Hall, Los Baños, Laguna',
    hours: 'Monday - Friday, 8:00 AM - 5:00 PM'
  }}
  sections={[
    {
      id: 'services',
      title: 'Services',
      description: 'Services offered by this office',
      content: <ServiceCardGrid services={services} />
    },
    {
      id: 'leadership',
      title: 'Office Leadership',
      content: <LeadershipSection officials={officials} />
    },
    {
      id: 'programs',
      title: 'Programs & Projects',
      variant: 'highlighted',
      content: <ProgramsList programs={programs} />
    }
  ]}
  related={{
    title: 'Related Offices',
    items: relatedOffices.map(office => ({
      title: office.name,
      href: office.href,
      description: office.description
    }))
  }}
/>
```

**Internal Structure:**

```tsx
export function DetailPageLayout({
  title,
  description,
  breadcrumbs,
  metadata,
  heroActions,
  sections,
  contact,
  related,
  variant = 'default',
  className
}: DetailPageLayoutProps) {
  // Render PageHero with breadcrumbs, title, description, metadata, actions
  // Render contact section if provided
  // Render sections array using DetailSection for each
  // Render related items using CardGrid if provided
  // All using Kapwa semantic tokens per T-079 spec
}
```

---

### Component 3: FilterBar (Standardized)

**Purpose:** Replace custom filter components (`FilterBar` in services, `DocumentFilters` in openlgu) with a unified, type-safe interface.

**Current State (Inconsistent):**
- Services: Custom `FilterBar` with office dropdown, source toggle, classification dropdown
- OpenLGU: Custom `DocumentFilters` with type tabs, author multi-select, year dropdown
- Transparency: Multiple `SelectPicker` components inline
- Inconsistent UI patterns and data structures

**Target State (Unified):**
- Single `FilterBar` component with declarative configuration
- Consistent visual design using Kapwa tokens
- Type-safe filter definitions

**TypeScript Interface:**

```tsx
type FilterType =
  | 'search'           // Single text input
  | 'select'           // Single-select dropdown
  | 'multiselect'      // Multi-select dropdown
  | 'toggle'           // On/off toggle
  | 'tab'              // Tab group (mutually exclusive)
  | 'date-range';      // Date range picker

interface FilterConfig {
  id: string;
  type: FilterType;
  label?: string;
  placeholder?: string;
  value: any;
  onChange: (value: any) => void;
  options?: Array<{
    value: string;
    label: string;
    count?: number;    // For showing result counts
    disabled?: boolean;
  }>;
  icon?: LucideIcon;
  disabled?: boolean;
}

interface FilterBarProps {
  filters: FilterConfig[];
  onClearAll?: () => void;
  layout?: 'horizontal' | 'vertical' | 'dropdown';
  activeFiltersCount?: number;
  showActiveFilters?: boolean;  // Show badges for active filters
  className?: string;
}
```

**Usage Example (Services):**

```tsx
const [filters, setFilters] = useState({
  search: '',
  office: '',
  source: 'official' as 'official' | 'community',
  classification: ''
});

<FilterBar
  filters={[
    {
      id: 'search',
      type: 'search',
      placeholder: 'Search services...',
      value: filters.search,
      onChange: (value) => setFilters(f => ({ ...f, search: value }))
    },
    {
      id: 'office',
      type: 'select',
      label: 'Office',
      placeholder: 'All offices',
      value: filters.office,
      onChange: (value) => setFilters(f => ({ ...f, office: value })),
      options: officeOptions
    },
    {
      id: 'source',
      type: 'tab',
      value: filters.source,
      onChange: (value) => setFilters(f => ({ ...f, source: value })),
      options: [
        { value: 'official', label: 'Official', count: 150 },
        { value: 'community', label: 'Community', count: 45 }
      ]
    },
    {
      id: 'classification',
      type: 'select',
      label: 'Type',
      placeholder: 'All types',
      value: filters.classification,
      onChange: (value) => setFilters(f => ({ ...f, classification: value })),
      options: classificationOptions
    }
  ]}
  onClearAll={() => setFilters({ search: '', office: '', source: 'official', classification: '' })}
  activeFiltersCount={Object.values(filters).filter(v => v).length}
  showActiveFilters
/>
```

---

### Component 4: NavigationSidebar (Generic)

**Purpose:** Replace three custom sidebar components (`DepartmentsSidebar`, `BarangaysSidebar`, `OpenLGUSidebar`) with a single data-driven component.

**Current State (Duplicated):**
- Three separate components with 80% code duplication
- Hardcoded navigation items in each component
- Inconsistent styling and behavior

**Target State (Unified):**
- Single `NavigationSidebar` component with declarative configuration
- Navigation items defined in data files
- Consistent behavior across all sections

**TypeScript Interface:**

```tsx
interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

interface SidebarItem {
  label: string;
  href: string;
  icon?: LucideIcon;
  badge?: string | number;
  disabled?: boolean;
}

interface NavigationSidebarProps {
  sections: SidebarSection[];
  currentPath: string;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  onCollapseChange?: (collapsed: boolean) => void;
  className?: string;
}
```

**Usage Example:**

```tsx
// Data file: src/data/navigation/departments-sidebar.ts
export const departmentsSidebarSections: SidebarSection[] = [
  {
    title: 'Departments',
    items: [
      { label: 'All Departments', href: '/government/departments', icon: Building2Icon },
      { label: 'Frontline Services', href: '/government/departments?frontline=true', badge: 8 },
      { label: 'Administrative', href: '/government/departments?type=admin' },
      { label: 'Legislative', href: '/government/departments?type=legislative' }
    ]
  },
  {
    title: 'Related',
    items: [
      { label: 'Elected Officials', href: '/government/elected-officials', icon: UsersIcon },
      { label: 'Barangays', href: '/government/barangays', icon: MapPinIcon }
    ]
  }
];

// Component usage
<NavigationSidebar
  sections={departmentsSidebarSections}
  currentPath={location.pathname}
  collapsible
  defaultCollapsed={false}
/>
```

---

## Implementation Phases

### Phase 1: Create Components (6-8 hours)

**Goal:** Build the four core components with full TypeScript types and basic functionality.

**Tasks:**
1. Create `IndexPageLayout` component
   - Implement full TypeScript interface
   - Compose existing components (ModuleHeader, CardGrid, PaginationControls, EmptyState)
   - Add Kapwa semantic token styling per T-079
   - Write unit tests for rendering and props

2. Create `DetailPageLayout` component
   - Implement full TypeScript interface
   - Compose existing components (PageHero, DetailSection, ContactContainer)
   - Add Kapwa semantic token styling
   - Write unit tests

3. Create `FilterBar` component
   - Implement all filter types (search, select, multiselect, toggle, tab, date-range)
   - Add accessible keyboard navigation
   - Add active filter badges display
   - Write unit tests for each filter type

4. Create `NavigationSidebar` component
   - Implement section-based navigation
   - Add collapsible functionality
   - Add active state highlighting
   - Ensure mobile responsiveness
   - Write unit tests

5. Create TypeScript type definitions
   - `FilterTypes.ts` - Filter-related types
   - `SidebarTypes.ts` - Sidebar-related types
   - Export from barrel files

**Success Criteria:**
- All components render without errors
- TypeScript types pass strict mode checks
- Unit tests pass (80%+ coverage)
- Components use Kapwa semantic tokens exclusively
- ESLint passes with zero warnings

---

### Phase 2: Migrate High-Value Pages (8-10 hours)

**Goal:** Migrate 3-5 representative pages to validate the architecture and gather feedback.

**Target Pages:**
1. `/government/departments/index.tsx` (simple index with search)
2. `/services/index.tsx` (complex index with multi-filter)
3. `/government/departments/[department].tsx` (detail page with sections)
4. `/openlgu/documents/index.tsx` (API-driven index with filters)
5. `/government/barangays/[barangay].tsx` (detail page with contact info)

**Tasks:**
1. Migrate each page one at a time
2. Test responsive behavior on mobile/tablet/desktop
3. Test accessibility with screen reader
4. Verify Kapwa token usage
5. Run linter and type checker
6. Manual smoke test in browser

**Success Criteria:**
- Migrated pages match existing visual design
- All functionality works (filters, search, pagination)
- Responsive design works on all breakpoints
- Accessibility passes basic checks
- No console errors or warnings
- Performance is comparable or better than before

---

### Phase 3: Full Migration (12-15 hours)

**Goal:** Migrate remaining 30+ pages and clean up deprecated components.

**Target Pages:**
- All remaining index pages (~13 pages)
- All remaining detail pages (~12 pages)
- Update any pages using old sidebar components

**Tasks:**
1. Create migration checklist for all remaining pages
2. Migrate pages in priority order (high-traffic pages first)
3. Update documentation (CLAUDE.md, ARCHITECTURE.md)
4. Remove deprecated custom components
   - Old `FilterBar` (services/components/FilterBar.tsx)
   - Old `DocumentFilters` (openlgu/components/DocumentFilters.tsx)
   - `DepartmentsSidebar`
   - `BarangaysSidebar`
   - `OpenLGUSidebar`
5. Update imports across all files
6. Run full test suite
7. Manual QA pass on all navigation pages

**Success Criteria:**
- All 61 navigation pages use new layouts
- Zero deprecated components remain
- All tests pass
- No visual regressions
- Documentation is updated
- Code review approval

---

## Design Token Compliance

All components MUST use Kapwa semantic tokens following Tailwind v4 prefix conventions per T-079 Navigation Design System Spec.

### Background Tokens
- Page container: `bg-kapwa-bg-surface`
- Hero header: `bg-kapwa-bg-surface-bold`
- Section header: `bg-kapwa-bg-hover-weak`
- Active state: `bg-kapwa-bg-selected`
- Hover state: `hover:bg-kapwa-bg-hover`

### Text Tokens
- Primary/headings: `text-kapwa-text-strong`
- Body text: `text-kapwa-text-default`
- Muted/secondary: `text-kapwa-text-weak`
- Inverse (on bold backgrounds): `text-kapwa-text-inverse`

### Border Tokens
- Default borders: `border-kapwa-border-weak`
- Strong borders: `border-kapwa-border-strong`
- Focus states: `border-kapwa-border-focus`

### Verification
- Run `design-cohesion-check` skill on all new components
- Zero hardcoded hex colors
- Zero raw Tailwind color tokens
- Zero non-semantic CSS variables

---

## Accessibility Requirements

All components MUST meet WCAG 2.1 Level AA standards.

### IndexPageLayout
- Search input has proper label and placeholder
- Filters are keyboard accessible (Tab, Enter, Escape)
- Pagination links have proper ARIA labels
- Empty state is announced to screen readers
- Grid items have proper heading hierarchy

### DetailPageLayout
- Breadcrumb navigation has proper ARIA markup
- Sections have proper heading levels (h2, h3)
- Contact information is semantically structured
- Related items links have descriptive text

### FilterBar
- All filter inputs have associated labels
- Filter changes are announced to screen readers
- Active filter badges can be removed via keyboard
- Clear All button is keyboard accessible
- Focus indicators are visible (Kapwa focus tokens)

### NavigationSidebar
- Sidebar is a `<nav>` element with `aria-label`
- Navigation links have proper `aria-current` for active state
- Collapsible state is announced to screen readers
- Keyboard navigation works (Tab, Enter, Arrow keys)

### Verification
- Run automated accessibility tests (axe-core)
- Manual keyboard navigation test
- Screen reader test (NVDA/VoiceOver)
- Color contrast verification (Kapwa tokens handle this)

---

## Testing Strategy

### Unit Tests (Vitest)
- Component rendering with different props
- Filter state changes
- Pagination interactions
- Sidebar collapse/expand
- Empty state rendering

### Integration Tests
- Full page render with IndexPageLayout
- Full page render with DetailPageLayout
- Filter interactions and URL state updates
- Search functionality

### Visual Regression Tests (Playwright)
- Screenshot comparisons for all variants
- Responsive layout tests (mobile, tablet, desktop)
- Dark mode tests (if applicable)

### Accessibility Tests
- Automated axe-core tests
- Keyboard navigation tests
- Screen reader tests

---

## Risk Assessment

### High Risk
- **Breaking existing functionality** during migration
  - **Mitigation:** Gradual migration, one page at a time, thorough testing

### Medium Risk
- **Performance regression** from additional abstraction layers
  - **Mitigation:** React.memo usage, performance profiling, benchmark before/after

- **Developer learning curve** for new components
  - **Mitigation:** Comprehensive documentation, examples, code comments

### Low Risk
- **Type safety issues** with complex TypeScript generics
  - **Mitigation:** Strict TypeScript configuration, thorough type testing

- **Accessibility regressions**
  - **Mitigation:** Automated and manual accessibility testing, Kapwa tokens already accessible

---

## Migration Priority Matrix

### Phase 2 (High Value, Low Risk)
1. `/government/departments/index.tsx` - Simple pattern, high traffic
2. `/government/departments/[department].tsx` - Common pattern, high visibility
3. `/services/index.tsx` - Complex filters, validates extensibility

### Phase 3 (Medium Value, Medium Risk)
4. `/government/barangays/*` - Similar to departments
5. `/transparency/*` - Diverse patterns, good test coverage
6. `/openlgu/*` - API-driven, validates data binding

### Phase 3 (Lower Priority)
7. `/statistics/*` - Lower traffic, can migrate later
8. `/government/elected-officials/*` - Fewer pages, lower urgency

---

## Success Metrics

### Quantitative
- **40-60% reduction in lines of code** per migrated page
- **90%+ reduction in component duplication** across navigation pages
- **Zero console errors or warnings** in production
- **100% TypeScript strict mode compliance**
- **80%+ test coverage** on new components

### Qualitative
- Consistent visual design across all navigation pages
- Easier and faster to create new pages
- Positive feedback from developers on maintainability
- No accessibility regressions
- Improved code review efficiency (less boilerplate to review)

---

## Related Documentation

- **T-078 Navigation Patterns Audit:** `docs/qa-reports/T-078-Navigation-Patterns-Audit-QA-Report.md`
- **T-079 Navigation Design System Spec:** `docs/navigation-design-system-spec.md`
- **T-080 Component Usage Audit:** `docs/audits/T-080-navigation-pages-component-audit.md`
- **BetterLB Design System Guide:** `docs/BetterLB-Design-System-Guide.md`
- **Kapwa Semantic Guide:** `KAPWA_SEMANTIC_GUIDE.md`

---

## Next Steps

1. **Review this design document** with stakeholders
2. **Invoke writing-plans skill** to create detailed implementation plan
3. **Assign Phase 1 tasks** to developer
4. **Begin implementation** following the 3-phase approach

---

## Appendix: Code Examples

### Example 1: Before/After Comparison (Departments Index)

**Before (78 lines):**
```tsx
export default function DepartmentsIndex() {
  const [search, setSearch] = useState('');
  // ... 15 lines of filtering logic

  return (
    <div className='animate-in fade-in space-y-6 duration-500'>
      <ModuleHeader title='...' description='...'>
        <SearchInput value={search} onChangeValue={setSearch} />
      </ModuleHeader>
      {/* ... 50 lines of grid rendering */}
      {/* ... 10 lines of empty state */}
    </div>
  );
}
```

**After (32 lines, 59% reduction):**
```tsx
export default function DepartmentsIndex() {
  const [search, setSearch] = useState('');
  const filtered = /* filtering logic */;

  return (
    <IndexPageLayout
      title="Municipal Departments"
      description={`${filtered.length} active offices.`}
      search={{ value: search, onChange: setSearch, placeholder: 'Search departments...' }}
      resultsCount={filtered.length}
      resultsLabel="departments"
      emptyState={{ icon: SearchXIcon, title: 'No departments found', message: '...' }}
    >
      <CardGrid>
        {filtered.map(dept => <DepartmentCard key={dept.slug} {...dept} />)}
      </CardGrid>
    </IndexPageLayout>
  );
}
```

### Example 2: Before/After Comparison (Department Detail)

**Before (124 lines):**
```tsx
export default function DepartmentDetail() {
  return (
    <div className="space-y-6">
      <PageHero title={dept.name} breadcrumb={[...]} />
      <DetailSection title="Contact Information">
        <ContactContainer contacts={contacts} />
      </DetailSection>
      <DetailSection title="Services">
        <ServiceCardGrid services={services} />
      </DetailSection>
      <DetailSection title="Leadership">
        <LeadershipSection officials={officials} />
      </DetailSection>
      {/* ... 60 more lines */}
    </div>
  );
}
```

**After (45 lines, 64% reduction):**
```tsx
export default function DepartmentDetail() {
  const dept = useDepartmentData();
  const { contacts, services, officials, related } = dept;

  return (
    <DetailPageLayout
      title={dept.name}
      description={dept.description}
      breadcrumbs={[...]}
      contact={contacts}
      sections={[
        { id: 'services', title: 'Services', content: <ServiceCardGrid services={services} /> },
        { id: 'leadership', title: 'Leadership', content: <LeadershipSection officials={officials} /> }
      ]}
      related={{ title: 'Related Offices', items: related }}
    />
  );
}
```

---

**End of Design Document**
