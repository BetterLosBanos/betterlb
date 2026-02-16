# Visual Consistency Improvement Plan for BetterLB

## Executive Summary

This plan provides a page-by-page audit of visual consistency improvements needed across the BetterLB project, based on the BetterLB Design System Guide and Kapwa Design System tokens.

## Priority Levels

- **P0 (Critical)**: Breaks design system, affects user experience significantly
- **P1 (High)**: Clear deviation from standards, impacts consistency
- **P2 (Medium)**: Minor inconsistencies, polish-level improvements
- **P3 (Low)**: Nice-to-have improvements

---

## 1. LAYOUT COMPONENTS

### 1.1 Navbar (`src/components/layout/Navbar.tsx`)
**Priority: P1**

**Issues:**
- Mix of Kapwa semantic tokens and custom Tailwind classes
- Uses `text-primary-600`, `bg-slate-50` instead of Kapwa tokens
- Inconsistent hover states

**Improvements:**
1. Replace `text-primary-600` with `text-kapwa-text-brand`
2. Replace `bg-slate-50` with `bg-kapwa-bg-surface-raised`
3. Ensure all interactive states use Kapwa hover/active tokens
4. Standardize dropdown menu styling with Kapwa border tokens

**Files to modify:**
- `src/components/layout/Navbar.tsx`

---

### 1.2 Footer (`src/components/layout/Footer.tsx`)
**Priority: P1**

**Issues:**
- Uses `bg-gray-900`, `text-white` instead of Kapwa tokens
- Inconsistent with `bg-kapwa-bg-surface-bold` pattern
- Mix of text sizes without Kapwa typography

**Improvements:**
1. Replace `bg-gray-900` with `bg-kapwa-bg-surface-bold`
2. Replace `text-white` with `text-kapwa-text-inverse`
3. Use Kapwa typography classes (`kapwa-body-sm-default`, etc.)
4. Ensure consistent spacing using `gap-kapwa-*` utilities

**Files to modify:**
- `src/components/layout/Footer.tsx`

---

### 1.3 PageLayouts (`src/components/layout/PageLayouts.tsx`)
**Priority: P0** (Reference implementation - already good)

**Status:** ✅ Already follows Kapwa semantic tokens correctly
- This is the reference implementation for other components
- No changes needed

---

### 1.4 SidebarLayout (`src/components/layout/SidebarLayout.tsx`)
**Priority: P2**

**Issues:**
- Generally good Kapwa token usage
- Minor inconsistencies in mobile responsiveness patterns

**Improvements:**
1. Ensure consistent responsive breakpoints with design system
2. Standardize animation patterns (`duration-300`)

**Files to modify:**
- `src/components/layout/SidebarLayout.tsx`

---

## 2. MAIN PAGES (ROOT LEVEL)

### 2.1 Home Page (`src/pages/Home.tsx`)
**Priority: P1**

**Issues:**
- Uses gradient backgrounds (`bg-gradient-to-br`) instead of solid Kapwa surfaces
- Inconsistent with other pages that use `bg-kapwa-bg-surface-raised`
- Section spacing inconsistencies

**Improvements:**
1. Replace gradient backgrounds with `bg-kapwa-bg-surface` or `bg-kapwa-bg-surface-raised`
2. Use `DetailSection` component for content blocks (ServicesSection, GovernmentSection)
3. Standardize spacing using `gap-kapwa-lg` or `space-y-kapwa-lg`
4. Ensure all cards use Kapwa border tokens

**Files to modify:**
- `src/pages/Home.tsx`
- `src/components/home/*` (child components)

---

### 2.2 Contact Us (`src/pages/ContactUs.tsx`)
**Priority: P1**

**Issues:**
- Custom header implementation instead of using `PageHero`
- Inconsistent card styling
- Non-standard contact info display

**Improvements:**
1. Replace custom header with `PageHero` component
2. Use `CardContactInfo` component for contact information
3. Ensure cards use Kapwa semantic tokens
4. Standardize section spacing

**Files to modify:**
- `src/pages/ContactUs.tsx`

---

### 2.3 Join Us (`src/pages/JoinUs.tsx`)
**Priority: P1**

**Issues:**
- Uses gradient background (`bg-gradient-to-br`)
- Custom section styling instead of `DetailSection`
- Inconsistent button styling

**Improvements:**
1. Replace gradient with `bg-kapwa-bg-surface-raised`
2. Use `DetailSection` for commitment sections
3. Ensure buttons use Kapwa variants from `@bettergov/kapwa`
4. Standardize card grid layouts

**Files to modify:**
- `src/pages/JoinUs.tsx`

---

### 2.4 Terms of Service (`src/pages/TermsOfService.tsx`)
**Priority: P2**

**Issues:**
- Uses `text-slate-*` instead of Kapwa text tokens
- Inconsistent heading hierarchy
- Missing semantic HTML structure

**Improvements:**
1. Replace `text-slate-*` with `text-kapwa-text-strong/support`
2. Use Kapwa heading classes (`kapwa-heading-md`, etc.)
3. Add proper semantic HTML (`<section>`, `<article>`)
4. Standardize spacing between sections

**Files to modify:**
- `src/pages/TermsOfService.tsx`

---

### 2.5 Not Found (`src/pages/NotFound.tsx`)
**Priority: P2**

**Issues:**
- Uses gradient background
- Inconsistent with other error handling patterns

**Improvements:**
1. Use `bg-kapwa-bg-surface` instead of gradient
2. Consider using `EmptyState` component pattern
3. Ensure consistent with brand

**Files to modify:**
- `src/pages/NotFound.tsx`

---

### 2.6 Ideas (`src/pages/Ideas.tsx`)
**Priority: P1**

**Issues:**
- Voting buttons may not use Kapwa button variants
- Card styling inconsistencies
- Grid layout variations

**Improvements:**
1. Ensure voting buttons use Kapwa button variants
2. Standardize card styling with Kapwa tokens
3. Use `CardGrid` for consistent layouts
4. Implement proper hover states

**Files to modify:**
- `src/pages/Ideas.tsx`

---

### 2.7 About (`src/pages/about/index.tsx`)
**Priority: P2**

**Issues:**
- i18n support may cause styling variations
- Section organization inconsistencies

**Improvements:**
1. Use `DetailSection` for content blocks
2. Ensure consistent spacing across locales
3. Standardize image/text layouts

**Files to modify:**
- `src/pages/about/index.tsx`

---

### 2.8 Accessibility (`src/pages/accessibility/index.tsx`)
**Priority: P2**

**Issues:**
- May use non-semantic styling
- Heading hierarchy issues

**Improvements:**
1. Use Kapwa typography for headings
2. Ensure semantic HTML structure
3. Add proper ARIA labels

**Files to modify:**
- `src/pages/accessibility/index.tsx`

---

### 2.9 Search (`src/pages/Search.tsx`)
**Priority: P0**

**Issues:**
- Should follow "Search Results Pattern" from design guide
- May have inconsistent filter styling

**Improvements:**
1. Implement `ModuleHeader` with search input
2. Use proper filter button styling with Kapwa tokens
3. Implement active filter badges pattern
4. Ensure proper empty state handling

**Files to modify:**
- `src/pages/Search.tsx`

---

## 3. SERVICES SECTION

### 3.1 Services Index (`src/pages/services/index.tsx`)
**Priority: P0** (Reference implementation)

**Status:** ✅ Already follows design system patterns well
- Uses appropriate header pattern
- Card grid layout is consistent
- No major changes needed

**Minor improvements:**
1. Ensure infinite scroll pagination matches design system
2. Verify filter button styling

---

### 3.2 Service Detail (`src/pages/services/[service].tsx`)
**Priority: P1**

**Issues:**
- Should follow "Detail Page Pattern" from design guide
- May be missing breadcrumbs
- Inconsistent two-column layout

**Improvements:**
1. Add `Breadcrumb` component
2. Implement two-column layout (main + sidebar)
3. Use `DetailSection` for content blocks
4. Add related services section with `CardGrid`

**Files to modify:**
- `src/pages/services/[service].tsx`

---

### 3.3 Contribute (`src/pages/contribute/index.tsx`)
**Priority: P1**

**Issues:**
- Form styling may not use Kapwa tokens
- Live preview section inconsistencies

**Improvements:**
1. Ensure form inputs use Kapwa input styling
2. Use Kapwa border tokens for form containers
3. Standardize button variants
4. Ensure proper focus states

**Files to modify:**
- `src/pages/contribute/index.tsx`

---

## 4. GOVERNMENT SECTION

### 4.1 Government Layout (`src/pages/government/layout.tsx`)
**Priority: P1**

**Issues:**
- May not use `PageHero` correctly
- Inconsistent with other section layouts

**Improvements:**
1. Ensure `PageHero` is used correctly
2. Verify consistent spacing
3. Add proper navigation structure

**Files to modify:**
- `src/pages/government/layout.tsx`

---

### 4.2 Elected Officials Index (`src/pages/government/elected-officials/index.tsx`)
**Priority: P0**

**Issues:**
- Should follow "Index/List Page Pattern"
- Chamber filtering may have inconsistent styling

**Improvements:**
1. Use `ModuleHeader` with search
2. Implement filter buttons with Kapwa tokens
3. Use `CardGrid` for officials
4. Ensure proper pagination

**Files to modify:**
- `src/pages/government/elected-officials/index.tsx`

---

### 4.3 Elected Officials Detail (`src/pages/government/elected-officials/[chamber].tsx`)
**Priority: P1**

**Issues:**
- May not follow "Detail Page Pattern"
- Inconsistent official card styling

**Improvements:**
1. Add breadcrumb navigation
2. Use `DetailSection` for content
3. Standardize official cards with Kapwa tokens
4. Ensure responsive layouts

**Files to modify:**
- `src/pages/government/elected-officials/[chamber].tsx`

---

### 4.4 Departments Index & Detail (`src/pages/government/departments/*`)
**Priority: P1**

**Issues:**
- Department cards may not use consistent styling
- Contact info display inconsistencies

**Improvements:**
1. Use `CardContactInfo` for department contact information
2. Ensure consistent card styling
3. Use `DetailSection` for department information
4. Add breadcrumb navigation

**Files to modify:**
- `src/pages/government/departments/index.tsx`
- `src/pages/government/departments/[department].tsx`

---

### 4.5 Barangays Index & Detail (`src/pages/government/barangays/*`)
**Priority: P0**

**Status:** ✅ Reference implementation mentioned in design guide
- Already follows good patterns

**Minor improvements:**
1. Verify all Kapwa tokens are used correctly
2. Ensure consistent with detail page pattern

---

## 5. TRANSPARENCY & STATISTICS SECTION

### 5.1 Transparency Pages (`src/pages/transparency/*`)
**Priority: P1**

**Issues:**
- Three pillars may have inconsistent styling
- Card variations not standardized

**Improvements:**
1. Use `DetailSection` for each pillar
2. Ensure consistent card styling across pillars
3. Standardize data visualization components
4. Use Kapwa status tokens for indicators

**Files to modify:**
- `src/pages/transparency/index.tsx`
- `src/pages/transparency/financial/index.tsx`
- `src/pages/transparency/infrastructure/index.tsx`
- `src/pages/transparency/infrastructure/[project].tsx`
- `src/pages/transparency/procurement/index.tsx`

---

### 5.2 Statistics Pages (`src/pages/statistics/*`)
**Priority: P1**

**Issues:**
- Data visualization inconsistencies
- Chart styling not standardized

**Improvements:**
1. Create standard chart wrapper components
2. Use Kapwa colors for data visualizations
3. Ensure consistent card layouts
4. Use `DetailSection` for statistical sections

**Files to modify:**
- `src/pages/statistics/index.tsx`
- `src/pages/statistics/population/index.tsx`
- `src/pages/statistics/competitiveness/index.tsx`
- `src/pages/statistics/municipal-income/index.tsx`

---

## 6. OPENLGU (LEGISLATIVE) SECTION

### 6.1 OpenLGU Pages (`src/pages/openlgu/*`)
**Priority: P0**

**Issues:**
- Document listings may not follow "Index/List Page Pattern"
- Filter styling inconsistencies
- Table vs grid usage not standardized

**Improvements:**
1. Use `ModuleHeader` for document listings
2. Implement proper filter button styling
3. Standardize table styling with Kapwa border tokens
4. Ensure proper pagination
5. Use appropriate badge variants for document status

**Files to modify:**
- `src/pages/openlgu/index.tsx`
- `src/pages/openlgu/documents/index.tsx`
- `src/pages/openlgu/[document].tsx`
- `src/pages/openlgu/persons/index.tsx`
- `src/pages/openlgu/[person].tsx`
- `src/pages/openlgu/terms/index.tsx`
- `src/pages/openlgu/[term].tsx`
- `src/pages/openlgu/sessions/index.tsx`
- `src/pages/openlgu/[session].tsx`

---

## 7. ADMIN SECTION

### 7.1 Admin Pages (`src/pages/admin/*`)
**Priority: P1**

**Issues:**
- May not follow "Dashboard Pattern"
- Inconsistent table styling
- Action button variations

**Improvements:**
1. Ensure `SidebarLayout` is used consistently
2. Standardize table styling with Kapwa tokens
3. Use Kapwa button variants for actions
4. Implement proper `Banner` usage for alerts
5. Ensure consistent form styling

**Files to modify:**
- `src/pages/admin/index.tsx`
- `src/pages/admin/documents/*`
- `src/pages/admin/review-queue/*`
- `src/pages/admin/reconcile/*`
- `src/pages/admin/error-log/*`

---

## 8. DATA PAGES

### 8.1 Weather & Forex (`src/pages/data/*`)
**Priority: P2**

**Issues:**
- Display inconsistencies
- Card styling variations

**Improvements:**
1. Use `DetailSection` for data displays
2. Ensure consistent card styling
3. Use Kapwa status tokens for indicators

**Files to modify:**
- `src/pages/data/weather/index.tsx`
- `src/pages/data/forex/index.tsx`

---

## 9. SHARED UI COMPONENTS (LOCAL)

### 9.1 Card Component (`src/components/ui/Card.tsx`)
**Priority: P0** ✅ COMPLETED

**Status:** Fixed to use Kapwa semantic tokens
- Replaced `border-slate-100` with `border-kapwa-border-weak`
- Fixed typo `text-kapwa-text-strong0` → `text-kapwa-text-support`
- Updated `CardDescription` to use `kapwa-body-sm-default`
- All card variants now use consistent Kapwa tokens

---

### 9.2 Badge Component (`src/components/ui/Badge.tsx`)
**Priority: P0** ✅ COMPLETED

**Status:** Fixed to use Kapwa semantic tokens
- Replaced all raw Tailwind colors with Kapwa semantic tokens
- `bg-blue-50` → `bg-kapwa-bg-brand-weak`
- `text-blue-800` → `text-kapwa-text-brand`
- `border-blue-200` → `border-kapwa-border-brand`
- (same pattern for secondary/success/warning/error)
- All variants are WCAG 2.1 Level AA compliant

---

### 9.3 SearchInput (`src/components/ui/SearchInput.tsx`)
**Priority: P2** ✅ ALREADY COMPLIANT

**Status:** Already uses Kapwa tokens correctly
- No changes needed

---

### 9.4 EmptyState (`src/components/ui/EmptyState.tsx`)
**Priority: P2** ✅ COMPLETED

**Status:** Fixed to use Kapwa semantic tokens
- Replaced `ring-slate-50/50` with `ring-kapwa-bg-surface/50`
- Updated heading to use `kapwa-heading-lg`
- Updated text to use `kapwa-body-sm-default`
- Now uses Kapwa spacing utilities

---

### 9.5 Tabs (`src/components/ui/Tabs.tsx`)
**Priority: P2** ✅ ALREADY COMPLIANT

**Status:** Already uses Kapwa tokens correctly
- No changes needed

---

### 9.6 Additional UI Components Fixed ✅ COMPLETED

**Skeletons.tsx:**
- Fixed border and typography tokens
- Now uses Kapwa spacing utilities

**ScrollArea.tsx:**
- Fixed duplicate tokens
- Replaced gray tokens with semantic border tokens

**Timeline.tsx:**
- Fixed mixed brand tokens
- Replaced `ring-white` with `ring-kapwa-bg-surface`
- Updated to Kapwa typography

**Dialog.tsx:**
- Fixed duplicate token in close button
- Updated title to use `kapwa-heading-md`

**Pagination.tsx:**
- Replaced `text-white` with `text-kapwa-text-inverse`

**Ticker.tsx:**
- Replaced raw colors with Kapwa semantic tokens
- Updated to Kapwa typography

**SelectPicker.tsx:**
- Already uses Kapwa tokens correctly

---

## 10. KAPWA SHARED COMPONENTS OPPORTUNITIES

> **Important Note:** BetterLB uses the **Kapwa Design System** forked as `@betterlb/kapwa` (aliased from `@bettergov/kapwa` in `vite.config.ts`). The package provides design tokens and base components. The `@betterlb/ui` shared component package no longer exists - components are maintained locally in `src/components/ui/`.

### 10.1 Kapwa Package Structure

**Package:** `@betterlb/kapwa` (published npm package)
**Alias:** `@bettergov/kapwa` (for TypeScript/JavaScript imports)
**CSS Import:** `@betterlb/kapwa/kapwa.css` (direct package name)

**Example:**
```tsx
// TypeScript/JavaScript import (uses alias)
import { Button, Input, Label, Banner } from '@bettergov/kapwa';

// CSS import (direct package name)
@import '@betterlb/kapwa/kapwa.css';
```

### 10.2 Available Kapwa Components

These components are available from `@bettergov/kapwa`:
- `Button` - All button variants (primary, secondary, success, outline, ghost, link)
- `Banner` - Alert banners (info, warning, error, success)
- `Input` - Text input component
- `Label` - Form label component
- `Card` - Card component (note: BetterLB has local version with extended features)

### 10.3 Local Components in BetterLB

These components are maintained locally in `src/components/ui/` and should continue to be local:

**Keep Local (BetterLB-specific):**
- **`Card`** - Extended with CardGrid, CardContactInfo, CardAvatar, etc.
- **`Badge`** - Custom variants aligned with municipal branding
- **`SearchInput`** - Custom clear button behavior and size variants
- **`SelectPicker`** - Multi-select with search functionality
- **`EmptyState`** - BetterLB-specific empty state patterns
- **`Ticker`** - Custom forex/weather ticker
- **`Timeline`** - Custom timeline component
- **`PaginationControls`** - BetterLB-specific pagination pattern
- **`Tabs`** - Radix UI-based tabs component
- **`Dialog`** - Radix UI-based dialog component
- **`ScrollArea`** - Custom scrollable area
- **`Skeletons`** - Loading skeleton components

### 10.4 Components to Consider Migrating

These could potentially use Kapwa components if they meet requirements:

#### Label Component
**Current:** Mixed usage of `@bettergov/kapwa` Label and custom labels
**Opportunity:** Standardize on `Label` from `@bettergov/kapwa`
**Benefit:** Consistent label styling and behavior
**Migration:** Audit label usage and standardize imports
**Priority:** P1

#### Textarea Component
**Current:** May not exist or using native textarea
**Opportunity:** Use Kapwa styling for native textarea
**Benefit:** Consistent textarea styling with Input
**Migration:** Apply Kapwa tokens to native textarea elements
**Priority:** P2

#### Checkbox/Radio Components
**Current:** May not exist or using native inputs
**Opportunity:** Use Kapwa tokens for native checkbox/radio styling
**Benefit:** Consistent form control styling
**Migration:** Apply Kapwa tokens and create wrapper components
**Priority:** P1

### 10.5 Component Usage Guidelines

**When using Kapwa components:**
1. Import from `@bettergov/kapwa` (aliased package name)
2. Use component props (variant, size) instead of className overrides
3. Apply Kapwa semantic tokens consistently
4. Don't wrap shared components unnecessarily - compose them instead

**Example:**
```tsx
// ✅ Import from Kapwa (uses alias)
import { Button, Input, Label } from '@bettergov/kapwa';

// ✅ Use component props
<Button variant="primary" size="md">Submit</Button>

// ✅ Use semantic tokens for custom elements
<div className="bg-kapwa-bg-surface text-kapwa-text-strong">
```

---

## 11. GLOBAL STYLES & CONFIGURATION

### 10.1 `src/index.css`
**Priority: P0**

**Issues:**
- May have unused custom styles
- Should ensure Kapwa CSS is imported correctly

**Improvements:**
1. Verify `@import '@betterlb/kapwa/kapwa.css'` is present
2. Ensure `@source` directives are correct for shared packages
3. Remove unused custom styles
4. Ensure Tailwind v4 prefix configuration

**Files to modify:**
- `src/index.css`

---

### 10.2 `tailwind.config.js`
**Priority: P0**

**Issues:**
- May have outdated theme overrides
- Should not conflict with Kapwa tokens

**Improvements:**
1. Remove any theme overrides that conflict with Kapwa
2. Ensure proper `@source` configuration for v4
3. Verify custom utilities don't duplicate Kapwa functionality

**Files to modify:**
- `tailwind.config.js`

---

## IMPLEMENTATION STRATEGY

### Phase 1: Foundation (P0 Issues)
1. Fix `src/index.css` and `tailwind.config.js`
2. Update Navbar and Footer (main layout components)
3. Fix Search page (high-traffic page)
4. Fix Elected Officials and OpenLGU pages

### Phase 2: High-Traffic Pages (P1 Issues)
1. Home page improvements
2. Services section consistency
3. Government section pages
4. Transparency & Statistics pages

### Phase 3: Polish & Consistency (P2 Issues)
1. Remaining pages (Contact, Join, Terms, etc.)
2. Admin section
3. Data pages

### Phase 4: Component Verification (P3 Issues)
1. Audit all shared components
2. Create component examples/docs
3. Final verification pass

---

## VERIFICATION CHECKLIST

After implementation, verify:

- [ ] All text colors use `text-kapwa-text-*` prefix
- [ ] All backgrounds use `bg-kapwa-bg-*` prefix
- [ ] All borders use `border-kapwa-border-*` prefix
- [ ] Typography uses `kapwa-heading-*`, `kapwa-body-*` classes
- [ ] Spacing uses `gap-kapwa-*`, `p-kapwa-*` utilities
- [ ] Buttons use Kapwa variants from `@bettergov/kapwa`
- [ ] Cards use proper Card component with variants
- [ ] Page headers use `PageHero` or `ModuleHeader`
- [ ] Detail sections use `DetailSection` component
- [ ] Contact info uses `CardContactInfo` component
- [ ] All interactive states (hover, focus, active) implemented
- [ ] Responsive breakpoints consistent across pages
- [ ] Empty states handled properly
- [ ] Loading states implemented
- [ ] Error states use proper Banner components

---

## CRITICAL FILES TO MODIFY

Summary of files that need changes:

**Layout (5 files):**
- `src/components/layout/Navbar.tsx`
- `src/components/layout/Footer.tsx`
- `src/components/layout/SidebarLayout.tsx`
- `src/index.css`
- `tailwind.config.js`

**Main Pages (9 files):**
- `src/pages/Home.tsx`
- `src/pages/ContactUs.tsx`
- `src/pages/JoinUs.tsx`
- `src/pages/TermsOfService.tsx`
- `src/pages/NotFound.tsx`
- `src/pages/Ideas.tsx`
- `src/pages/about/index.tsx`
- `src/pages/accessibility/index.tsx`
- `src/pages/Search.tsx`

**Services (3 files):**
- `src/pages/services/[service].tsx`
- `src/pages/contribute/index.tsx`

**Government (8+ files):**
- `src/pages/government/layout.tsx`
- `src/pages/government/elected-officials/*`
- `src/pages/government/departments/*`

**Transparency & Statistics (7+ files):**
- `src/pages/transparency/*`
- `src/pages/statistics/*`

**OpenLGU (9 files):**
- `src/pages/openlgu/*`

**Admin (5+ files):**
- `src/pages/admin/*`

**Data (2 files):**
- `src/pages/data/*`

**UI Components (12 files) - 10 COMPLETED:**
- `src/components/ui/Card.tsx` ✅
- `src/components/ui/Badge.tsx` ✅
- `src/components/ui/Skeletons.tsx` ✅
- `src/components/ui/ScrollArea.tsx` ✅
- `src/components/ui/Timeline.tsx` ✅
- `src/components/ui/Dialog.tsx` ✅
- `src/components/ui/EmptyState.tsx` ✅
- `src/components/ui/Pagination.tsx` ✅
- `src/components/ui/Ticker.tsx` ✅
- `src/components/ui/SearchInput.tsx` ✅ (already compliant)
- `src/components/ui/SelectPicker.tsx` ✅ (already compliant)
- `src/components/ui/Tabs.tsx` ✅ (already compliant)

**Total estimated files: 60-70 files**
**Completed: 10/12 local UI components (83%)**
