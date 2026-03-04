# UI/UX Improvement Roadmap Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Systematically achieve complete visual consistency across BetterLB by migrating all pages to Kapwa design system semantic tokens over 4 phases (12 weeks).

**Architecture:** Phased rollout approach - Phase 1 establishes foundation and reference implementations, Phases 2-3 update pages by priority (P0/P1 first, then P2), Phase 4 focuses on polish and QA. Each phase has quality gates before proceeding.

**Tech Stack:** React 19, TypeScript, Vite, Tailwind CSS v4, @betterlb/kapwa design system, Playwright (E2E tests), axe-core (accessibility)

---

## Phase 1: Foundation (Weeks 1-2)

### Task 1: Fix SidebarLayout Mobile Responsiveness

**Files:**
- Modify: `src/components/layout/SidebarLayout.tsx`
- Test: `e2e/layout/sidebar-layout.spec.ts`

**Step 1: Write failing test for mobile responsiveness**

Create `e2e/layout/sidebar-layout.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('sidebar collapses on mobile', async ({ page }) => {
  await page.goto('/government/departments');
  await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE

  // Sidebar should be collapsed by default on mobile
  const sidebar = page.locator('[data-testid="sidebar"]');
  await expect(sidebar).toHaveClass(/hidden/);

  // Hamburger menu should be visible
  const menuButton = page.locator('[data-testid="mobile-menu-button"]');
  await expect(menuButton).toBeVisible();
});

test('sidebar expands when menu button clicked', async ({ page }) => {
  await page.goto('/government/departments');
  await page.setViewportSize({ width: 375, height: 667 });

  const menuButton = page.locator('[data-testid="mobile-menu-button"]');
  await menuButton.click();

  const sidebar = page.locator('[data-testid="sidebar"]');
  await expect(sidebar).toBeVisible();
  await expect(sidebar).not.toHaveClass(/hidden/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e e2e/layout/sidebar-layout.spec.ts`
Expected: FAIL - mobile menu button doesn't exist

**Step 3: Add mobile menu button to SidebarLayout**

Modify `src/components/layout/SidebarLayout.tsx`:

```typescript
import { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { Button } from '@betterlb/kapwa';

// In component:
const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

// Add mobile menu button (hidden on desktop)
<Button
  data-testid="mobile-menu-button"
  variant="ghost"
  size="sm"
  className="lg:hidden"
  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
  aria-label="Toggle menu"
>
  <MenuIcon className="h-5 w-5" />
</Button>

// Update sidebar className to include mobile visibility
<div
  data-testid="sidebar"
  className={`${isMobileMenuOpen ? 'block' : 'hidden'} lg:block lg:w-64`}
>
  {/* sidebar content */}
</div>
```

**Step 4: Run test to verify it passes**

Run: `npm run test:e2e e2e/layout/sidebar-layout.spec.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/components/layout/SidebarLayout.tsx e2e/layout/sidebar-layout.spec.ts
git commit -m "feat: add mobile menu button to SidebarLayout"
```

---

### Task 2: Create Component Specification Template

**Files:**
- Create: `docs/component-spec-template.md`

**Step 1: Create component spec template**

Create `docs/component-spec-template.md`:

```markdown
# Component Specification Template

**Component Name:** [Name]
**Purpose:** [One sentence description]
**Status:** [Draft/Approved/Implemented]

## Props Interface

```typescript
interface [ComponentName]Props {
  // Required props
  requiredProp: string;

  // Optional props
  optionalProp?: boolean;

  // Styling
  className?: string;
  children?: React.ReactNode;
}
```

## Design System Compliance

- **Colors:** Use Kapwa semantic tokens (text-kapwa-text-*, bg-kapwa-bg-*, border-kapwa-border-*)
- **Spacing:** Use 4px base unit scale (kapwa-spacing-* tokens)
- **Typography:** Use kapwa-heading-* or kapwa-body-* classes
- **States:** Follow hover, focus, disabled patterns from Design System Guide

## Accessibility Requirements

- [ ] Keyboard navigable (Tab, Enter, Escape)
- [ ] ARIA labels and roles
- [ ] Focus management
- [ ] Color contrast WCAG AA (4.5:1)
- [ ] Screen reader tested

## Responsive Behavior

- **Mobile (< 640px):** [Describe behavior]
- **Tablet (640px - 1024px):** [Describe behavior]
- **Desktop (> 1024px):** [Describe behavior]

## Variations

| Variant | Usage | Props |
|---------|-------|-------|
| Default | Standard use | No extra props |
| Variant A | [Use case] | prop="value" |
| Variant B | [Use case] | prop="value" |

## Examples

```tsx
// Basic usage
<ComponentName requiredProp="value" />

// With optional props
<ComponentName requiredProp="value" optionalProp={true} />

// Custom styling
<ComponentName requiredProp="value" className="custom-class" />
```

## Testing Checklist

- [ ] Unit tests for all props
- [ ] Accessibility test with axe-core
- [ ] Visual regression test (Playwright screenshot)
- [ ] Responsive design test (mobile, tablet, desktop)

## Related Components

- [Component A] - [Relationship]
- [Component B] - [Relationship]

## Implementation Notes

[Any special considerations, edge cases, or technical details]
```

**Step 2: Commit**

```bash
git add docs/component-spec-template.md
git commit -m "docs: add component specification template"
```

---

### Task 3: Create Reference Implementation Example

**Files:**
- Create: `src/pages/government/reference-implementation.tsx`
- Test: `e2e/reference-implementation.spec.ts`

**Step 1: Create reference implementation page**

Create `src/pages/government/reference-implementation.tsx`:

```typescript
import { PageHero } from '@/components/layout';
import { Card, CardHeader, CardContent } from '@/components/ui';

export default function ReferenceImplementation() {
  return (
    <div className="min-h-screen bg-kapwa-bg-surface">
      <PageHero
        title="Reference Implementation"
        subtitle="Demonstrates design system patterns"
        className="bg-kapwa-bg-surface-bold border-kapwa-border-weak"
      />

      <main className="container mx-auto px-kapwa-md py-kapwa-lg">
        <div className="grid gap-kapwa-md md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <h3 className="kapwa-heading-md text-kapwa-text-strong">
                Card Example
              </h3>
            </CardHeader>
            <CardContent>
              <p className="kapwa-body-md text-kapwa-text-support">
                This card demonstrates proper semantic token usage.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
```

**Step 2: Create E2E test for reference page**

Create `e2e/reference-implementation.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('reference page uses semantic tokens', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check Kapwa semantic classes are used
  const hero = page.locator('[class*="bg-kapwa-bg-surface-bold"]');
  await expect(hero).toBeVisible();

  const heading = page.locator('.kapwa-heading-md');
  await expect(heading).toContainText('Card Example');

  // Check no raw color classes
  const body = page.locator('body');
  const bodyHTML = await body.innerHTML();
  expect(bodyHTML).not.toMatch(/text-(slate|gray|blue)-\d+/);
  expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue)-\d+/);
});
```

**Step 3: Run test to verify it passes**

Run: `npm run test:e2e e2e/reference-implementation.spec.ts`
Expected: PASS

**Step 4: Commit**

```bash
git add src/pages/government/reference-implementation.tsx e2e/reference-implementation.spec.ts
git commit -m "feat: add design system reference implementation"
```

---

## Phase 2: High-Priority Pages (Weeks 3-6)

### Task 4: Migrate Departments Pages to Kapwa Tokens

**Files:**
- Modify: `src/pages/government/departments/index.tsx`
- Modify: `src/pages/government/departments/layout.tsx`
- Modify: `src/pages/government/departments/[department].tsx`
- Test: `e2e/government/departments.spec.ts`

**Step 1: Write failing test for semantic token usage**

Create `e2e/government/departments.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('departments page uses Kapwa semantic tokens', async ({ page }) => {
  await page.goto('/government/departments');

  // Check for raw color classes (should not exist)
  const body = page.locator('body');
  const bodyHTML = await body.innerHTML();

  // These patterns should not appear
  expect(bodyHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);

  // Kapwa semantic tokens should be present
  expect(bodyHTML).toMatch(/text-kapwa-text-/);
  expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
  expect(bodyHTML).toMatch(/border-kapwa-border-/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e e2e/government/departments.spec.ts`
Expected: FAIL - raw color classes exist

**Step 3: Replace raw colors with Kapwa semantic tokens in index.tsx**

Modify `src/pages/government/departments/index.tsx`:

**Find and replace patterns:**
```bash
# Text colors
text-slate-900 → text-kapwa-text-strong
text-slate-600 → text-kapwa-text-support
text-slate-500 → text-kapwa-text-disabled
text-white → text-kapwa-text-inverse

# Backgrounds
bg-white → bg-kapwa-bg-surface
bg-slate-50 → bg-kapwa-bg-surface-raised
bg-gray-900 → bg-kapwa-bg-surface-bold

# Borders
border-slate-200 → border-kapwa-border-weak
border-slate-300 → border-kapwa-border-default
```

**Example component migration:**
```typescript
// Before
<div className="bg-white border border-slate-200 rounded-lg p-6">
  <h2 className="text-xl font-semibold text-slate-900">
    {department.name}
  </h2>
  <p className="text-slate-600 mt-2">
    {department.description}
  </p>
</div>

// After
<div className="bg-kapwa-bg-surface border border-kapwa-border-weak rounded-lg p-kapwa-md">
  <h2 className="kapwa-heading-lg text-kapwa-text-strong">
    {department.name}
  </h2>
  <p className="kapwa-body-md text-kapwa-text-support mt-kapwa-sm">
    {department.description}
  </p>
</div>
```

**Step 4: Run linting to check for issues**

Run: `npm run lint`
Expected: PASS with --max-warnings 0

**Step 5: Run test to verify it passes**

Run: `npm run test:e2e e2e/government/departments.spec.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/government/departments/ e2e/government/departments.spec.ts
git commit -m "refactor: migrate departments pages to Kapwa semantic tokens"
```

---

### Task 5: Migrate Barangays Pages to Kapwa Tokens

**Files:**
- Modify: `src/pages/government/barangays/index.tsx`
- Modify: `src/pages/government/barangays/layout.tsx`
- Modify: `src/pages/government/barangays/[barangay].tsx`
- Test: `e2e/government/barangays.spec.ts`

**Step 1: Create test following Task 4 pattern**

Create `e2e/government/barangays.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('barangays page uses Kapwa semantic tokens', async ({ page }) => {
  await page.goto('/government/barangays');

  const body = page.locator('body');
  const bodyHTML = await body.innerHTML();

  expect(bodyHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e e2e/government/barangays.spec.ts`
Expected: FAIL

**Step 3: Apply same migration pattern as Task 4**

Use the find-replace patterns from Task 4 on all barangays files.

**Step 4: Run linting**

Run: `npm run lint`
Expected: PASS

**Step 5: Run test to verify it passes**

Run: `npm run test:e2e e2e/government/barangays.spec.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/government/barangays/ e2e/government/barangays.spec.ts
git commit -m "refactor: migrate barangays pages to Kapwa semantic tokens"
```

---

### Task 6: Migrate Elected Officials Pages to Kapwa Tokens

**Files:**
- Modify: `src/pages/government/elected-officials/index.tsx`
- Modify: `src/pages/government/elected-officials/layout.tsx`
- Modify: `src/pages/government/elected-officials/[chamber].tsx`
- Test: `e2e/government/elected-officials.spec.ts`

**Step 1-6:** Follow same pattern as Tasks 4-5

Create test, verify failure, migrate tokens, lint, verify pass, commit.

---

### Task 7: Migrate Services Index Page

**Files:**
- Modify: `src/pages/services/index.tsx`
- Test: `e2e/services/index.spec.ts`

**Step 1-6:** Follow same pattern as Task 4

**Additional:** Ensure ServiceCard and ServiceFilters components also use Kapwa tokens.

---

### Task 8: Redesign Service Detail Pages

**Files:**
- Modify: `src/pages/services/[service].tsx`
- Modify: `src/pages/services/components/RequirementCard.tsx`
- Modify: `src/pages/services/components/ProcessTimeline.tsx`
- Test: `e2e/services/service-detail.spec.ts`

**Step 1: Write failing test for service detail patterns**

Create `e2e/services/service-detail.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('service detail page follows design system', async ({ page }) => {
  await page.goto('/services/business-permit');

  // Check RequirementCard uses proper tokens
  const requirementCard = page.locator('[data-testid="requirement-card"]').first();
  await expect(requirementCard).toBeVisible();
  const cardHTML = await requirementCard.innerHTML();
  expect(cardHTML).toMatch(/bg-kapwa-bg-surface/);
  expect(cardHTML).not.toMatch(/bg-white/);

  // Check ProcessTimeline uses proper tokens
  const timeline = page.locator('[data-testid="process-timeline"]');
  await expect(timeline).toBeVisible();
});
```

**Step 2: Run test to verify it fails**

Run: `npm run test:e2e e2e/services/service-detail.spec.ts`
Expected: FAIL

**Step 3: Update RequirementCard component**

Modify `src/pages/services/components/RequirementCard.tsx`:

```typescript
// Before
<Card className="bg-white border border-gray-200 shadow-sm">

// After
<Card className="bg-kapwa-bg-surface border border-kapwa-border-weak">
```

**Step 4: Update ProcessTimeline component**

Modify `src/pages/services/components/ProcessTimeline.tsx`:

```typescript
// Replace timeline colors
border-gray-300 → border-kapwa-border-default
bg-blue-500 → bg-kapwa-bg-primary-brand
text-gray-600 → text-kapwa-text-support
```

**Step 5: Run test to verify it passes**

Run: `npm run test:e2e e2e/services/service-detail.spec.ts`
Expected: PASS

**Step 6: Commit**

```bash
git add src/pages/services/ e2e/services/
git commit -m "refactor: migrate service detail pages to Kapwa semantic tokens"
```

---

### Task 9: Migrate Transparency Pages

**Files:**
- Modify: `src/pages/transparency/index.tsx`
- Modify: All transparency subpages
- Test: `e2e/transparency.spec.ts`

**Step 1-6:** Follow same pattern as previous tasks

**Additional:** Focus on chart components - ensure data visualizations use Kapwa color scales.

---

## Phase 3: Medium-Priority Pages (Weeks 7-10)

### Task 10: Migrate Admin Dashboard

**Files:**
- Modify: `src/pages/admin/index.tsx`
- Modify: `src/pages/admin/layout.tsx`
- Modify: All admin components
- Test: `e2e/admin.spec.ts`

**Step 1-6:** Follow same pattern

**Additional:** Standardize form components to use Kapwa Input, Label, Button variants.

---

### Task 11: Migrate Statistics Pages

**Files:**
- Modify: All statistics page files
- Test: `e2e/statistics.spec.ts`

**Step 1-6:** Follow same pattern

**Additional:** Ensure chart colors use Kapwa semantic scales (bg-kapwa-blue-*, etc.).

---

### Task 12: Migrate OpenLGU Pages

**Files:**
- Modify: All OpenLGU page files
- Test: `e2e/openlgu.spec.ts`

**Step 1-6:** Follow same pattern

---

## Phase 4: Polish & QA (Weeks 11-12)

### Task 13: Run Full Accessibility Audit

**Files:**
- Create: `docs/accessibility-audit-report.md`

**Step 1: Run axe-core audit on all pages**

Run: `npm run test:e2e` (includes accessibility tests)

**Step 2: Document findings**

Create `docs/accessibility-audit-report.md`:

```markdown
# Accessibility Audit Report

**Date:** [Current date]
**Scope:** All BetterLB pages
**Standard:** WCAG 2.1 Level AA

## Violations Found

[Document any violations found]

## Fixed Issues

[Track fixes applied]

## Final Status

- [ ] Zero violations on all pages
- [ ] Keyboard navigation verified
- [ ] Screen reader tested
- [ ] Color contrast validated
```

**Step 3: Fix any violations found**

**Step 4: Re-run audit**

**Step 5: Commit**

```bash
git add docs/accessibility-audit-report.md
git commit -m "docs: add accessibility audit report"
```

---

### Task 14: Final Design System Review

**Step 1: Run ESLint on entire codebase**

Run: `npm run lint`
Expected: Zero warnings

**Step 2: Manual code review**

Check:
- All pages use Kapwa semantic tokens
- Consistent spacing patterns
- Proper component props
- Responsive design verified

**Step 3: Update Visual Consistency Plan**

Mark completed items in `VISUAL_CONSISTENCY_PLAN.md`.

**Step 4: Commit**

```bash
git add VISUAL_CONSISTENCY_PLAN.md
git commit -m "docs: update visual consistency plan with completed items"
```

---

### Task 15: Update CLAUDE.md with UI/UX Patterns

**Files:**
- Modify: `CLAUDE.md`

**Step 1: Add UI/UX section to CLAUDE.md**

Add to `CLAUDE.md`:

```markdown
## UI/UX Development Patterns

### Semantic Token Usage
- **Always** use Kapwa semantic tokens: text-kapwa-text-*, bg-kapwa-bg-*, border-kapwa-border-*
- **Never** use raw color classes: text-slate-*, bg-gray-*, border-blue-*
- Reference: `KAPWA_SEMANTIC_GUIDE.md`

### Component Development
1. Check `docs/component-spec-template.md` for new components
2. Follow patterns in `src/components/ui/` for reusable components
3. Use `BetterLB-Design-System-Guide.md` for layout patterns

### Page Development Workflow
1. Check `VISUAL_CONSISTENCY_PLAN.md` for priority and requirements
2. Use reference implementations in `src/pages/government/`
3. Write E2E test first (TDD approach)
4. Run accessibility audit before marking complete

### Quality Gates
Every UI change must pass:
- `npm run lint` with --max-warnings 0
- E2E tests for affected pages
- axe-core accessibility check
- Visual regression test (if applicable)
```

**Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add UI/UX development patterns to CLAUDE.md"
```

---

## Quality Gates

### After Each Phase
Run this quality gate checklist:

```bash
# 1. Linting
npm run lint
# Expected: 0 warnings

# 2. Type checking
npx tsc --noEmit
# Expected: No errors

# 3. E2E tests
npm run test:e2e
# Expected: All tests pass

# 4. Accessibility (manual)
# Open DevTools → axe DevTools → Run audit
# Expected: Zero violations

# 5. Visual regression (if implemented)
npm run test:e2e -- --project=chromium --update-snapshots
# Expected: No unexpected changes
```

Only proceed to next phase if all quality gates pass.

---

## Task Dependencies

### Must Complete Before Phase 2
- ✅ Task 1: SidebarLayout mobile fixes
- ✅ Task 2: Component spec template
- ✅ Task 3: Reference implementation

### Phase 2 Internal Order
- Tasks 4, 5, 6 (Government) can run in parallel
- Tasks 7, 8 (Services) depend on T-005 design system fixes
- Task 9 (Transparency) depends on T-006 refactoring

### Phase 3 Internal Order
- Task 10 (Admin) depends on T-010 admin dashboard improvements
- Task 11 (Statistics) can run parallel to Task 10
- Task 12 (OpenLGU) depends on T-009 API enhancements

### Phase 4 Internal Order
- Task 13 (Accessibility audit) must complete before Task 14 (Final review)
- Task 15 (Documentation) runs after Task 14

---

## Success Criteria

### Completion Metrics
- [ ] 100% of pages use Kapwa semantic tokens
- [ ] Zero ESLint warnings (--max-warnings 0)
- [ ] Zero accessibility violations (axe-core)
- [ ] > 80% E2E test coverage
- [ ] All phases completed in order
- [ ] All quality gates passed

### Final Deliverables
- Updated codebase with full Kapwa compliance
- Component specification templates
- E2E test suite for all pages
- Accessibility audit report
- Updated CLAUDE.md with UI/UX patterns
- Updated VISUAL_CONSISTENCY_PLAN.md with completed items

---

## Rollback Plan

If issues arise during migration:

1. **Per-file rollback:** Use `git checkout` to revert specific files
2. **Per-phase rollback:** Revert to commit before phase start
3. **Full rollback:** Tag each phase start with `phase-N-start` for easy rollback

Example:
```bash
# Tag phase start
git tag phase-2-start

# If phase 2 has issues, rollback
git checkout phase-2-start
```

---

## Notes for Developers

1. **TDD Approach:** Always write the failing test first, then implement
2. **Semantic Tokens Only:** No raw color classes allowed in production code
3. **Frequent Commits:** Commit after each task (2-5 minutes of work)
4. **Quality First:** Don't skip quality gates - they catch regressions
5. **Ask Questions:** If unsure about token usage, check `KAPWA_SEMANTIC_GUIDE.md`

---

## Related Documentation

- `docs/BetterLB-Design-System-Guide.md` - Complete design system reference
- `VISUAL_CONSISTENCY_PLAN.md` - Page-by-page audit with priorities
- `KAPWA_SEMANTIC_GUIDE.md` - Quick reference for semantic tokens
- `docs/plans/2026-02-26-ux-improvement-roadmap-design.md` - Strategic design document
