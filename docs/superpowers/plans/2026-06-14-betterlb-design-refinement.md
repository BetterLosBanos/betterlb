# BetterLB Design Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine BetterLB to stay near-identical to BetterGovPH's Kapwa system while adding subtle Los Baños personality — via blue-mono color discipline, a tiered/flattened layout, and a Mt. Makiling motif.

**Architecture:** Four independent workstreams landed in order. Part 0 aligns the app to `@bettergov/kapwa@1.4.1` (removing hand-rolled duplicates) so correct tokens/typography exist for the rest. Part 1 sweeps all color through semantically-correct Kapwa tokens (orange → warning-only). Part 2 keeps sidebars only on deep catalogs and flattens nested chrome. Part 3 adds a `MakilingRidge` SVG motif to hero, footer, and 404.

**Tech Stack:** React 19, Vite 6, Tailwind v4, `@bettergov/kapwa` 1.4.1, react-router-dom, lucide-react, Vitest + @testing-library/react (happy-dom), Playwright e2e.

**Reference spec:** `docs/superpowers/specs/2026-06-13-betterlb-design-refinement-design.md`

---

## File Structure

**Created:**
- `src/components/navigation/SubNav.tsx` — horizontal pill nav for shallow lateral sections (replaces 3 bespoke sidebars).
- `src/components/navigation/__tests__/SubNav.test.tsx` — SubNav unit tests.
- `src/components/brand/MakilingRidge.tsx` — decorative SVG ridgeline motif.
- `src/components/brand/index.ts` — barrel export.
- `src/components/brand/__tests__/MakilingRidge.test.tsx` — motif render test.

**Modified:**
- `package.json` — bump Kapwa.
- `src/index.css`, `src/fonts.css` — remove redundant font vars + broken border override.
- `src/components/layout/PageLayouts.tsx` — typography utilities; lighten `ModuleHeader`.
- `src/pages/statistics/layout.tsx`, `src/pages/transparency/layout.tsx`, `src/pages/government/elected-officials/layout.tsx` — drop sidebar → SubNav.
- ~30 component/page files — color sweep (full list in Tasks 4–6).
- `src/components/home/Hero.tsx`, `src/components/layout/Footer.tsx`, `src/pages/NotFound.tsx` — add motif.

**Deleted:**
- `src/pages/statistics/components/StatisticsSidebar.tsx`
- `src/pages/transparency/components/TransparencySidebar.tsx`
- `src/pages/government/elected-officials/components/ElectedOfficialsSidebar.tsx`

**Convention notes:**
- `kapwa-brand-*` scale classes used for *brand gradients* (Hero, NotFound) are in-system and acceptable — they are NOT leaks. Only **non-`kapwa`** raw color classes (`blue-*`, `amber-*`, `emerald-*`, `white/xx`, `yellow-*`, `primary-*`) and **decorative `accent-orange/yellow`** tokens get migrated.
- Run all `git commit` steps exactly as written. Commit messages follow conventional-commit format (commitlint enforced).

---

## Part 0 — Kapwa 1.4.1 Alignment

### Task 1: Bump @bettergov/kapwa to 1.4.1

**Files:**
- Modify: `package.json` (dependency line `"@bettergov/kapwa": "^1.2.4"`)

- [ ] **Step 1: Update the dependency version**

In `package.json`, change:
```json
"@bettergov/kapwa": "^1.2.4",
```
to:
```json
"@bettergov/kapwa": "1.4.1",
```

- [ ] **Step 2: Install**

Run: `npm install`
Expected: lockfile updates, `node_modules/@bettergov/kapwa` resolves to 1.4.1.

- [ ] **Step 3: Verify version**

Run: `npm ls @bettergov/kapwa`
Expected: shows `@bettergov/kapwa@1.4.1`.

- [ ] **Step 4: Build sanity check**

Run: `npm run build`
Expected: build succeeds (no missing-export errors from the bump).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: bump @bettergov/kapwa to 1.4.1"
```

---

### Task 2: Remove redundant font vars and broken border override

Kapwa 1.4.1 already defines `--font-kapwa-sans` (Inter) and `--font-kapwa-mono` (Roboto Mono) and sets sane default border color in its base layer. The app duplicates the font vars and references a non-existent token `--color-border-kapwa-border-weak` (always falls back to `currentcolor`).

**Files:**
- Modify: `src/index.css:8-24`
- Modify: `src/fonts.css`

- [ ] **Step 1: Remove the duplicate `:root` font block and broken border layer in `src/index.css`**

Delete these two blocks (lines ~8-24):
```css
:root {
  --font-kapwa-sans:
    'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont,
    sans-serif;
  --font-kapwa-mono:
    'Roboto Mono', ui-monospace, SFMono-Regular, Menlo, monospace;
}

@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-border-kapwa-border-weak, currentcolor);
  }
}
```
The file should now go straight from the `@import` lines (and the `@source` line) into the Leaflet overrides.

- [ ] **Step 2: Trim `src/fonts.css` to the webfont import + body rule only**

Replace the entire contents of `src/fonts.css` with:
```css
/* src/fonts.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500;600&display=swap');

body {
  font-family: var(--font-kapwa-sans);
}

code,
pre {
  font-family: var(--font-kapwa-mono);
}
```
(Removes the duplicate `:root` `--font-kapwa-*` definitions; keeps the Google Fonts load and the body/code font rules that consume Kapwa's vars.)

- [ ] **Step 3: Run the app and verify fonts + borders**

Run: `npm run dev`
Expected: body renders in Inter, code in Roboto Mono; card/table borders still visible (Kapwa base default). No console errors.

- [ ] **Step 4: Build sanity check**

Run: `npm run build`
Expected: success.

- [ ] **Step 5: Commit**

```bash
git add src/index.css src/fonts.css
git commit -m "refactor: drop redundant font vars and broken border override, defer to Kapwa 1.4.1"
```

---

### Task 3: Route hard-coded heading styles to Kapwa typography utilities

`PageLayouts.tsx` pairs Kapwa heading utilities with raw `font-bold`/`font-extrabold`/`tracking-tight`. Kapwa's `kapwa-heading-*` utilities already set weight (700) and tracking, so the raw modifiers are redundant overrides. Remove them so typography is driven solely by Kapwa tokens.

**Files:**
- Modify: `src/components/layout/PageLayouts.tsx:54`, `:89`
- Modify: `src/components/layout/UnifiedLayouts.tsx:268`, `:400`, `:428`, `:456`

- [ ] **Step 1: PageLayouts — PageHero h1 (line ~54)**

Change:
```tsx
<h1 className='text-kapwa-text-strong mb-4 kapwa-heading-xl font-bold tracking-tight'>
```
to:
```tsx
<h1 className='text-kapwa-text-strong mb-4 kapwa-heading-xl'>
```

- [ ] **Step 2: PageLayouts — ModuleHeader h2 (line ~89)**

Change:
```tsx
<h2 className='text-kapwa-text-strong kapwa-heading-lg font-extrabold tracking-tight'>
```
to:
```tsx
<h2 className='text-kapwa-text-strong kapwa-heading-lg'>
```

- [ ] **Step 3: UnifiedLayouts — remove redundant weight/tracking on the four headings**

At UnifiedLayouts.tsx:268 (SectionBlock h2), :400 (hero h1), :428 (centered h1), :456 (compact h1), remove `font-bold` / `font-extrabold` and `tracking-tight` from each, leaving the `kapwa-heading-*` utility (and `text-kapwa-text-strong`, `mb-4` etc.) intact. Example for :268:
```tsx
<h2 className='text-kapwa-text-strong kapwa-heading-lg'>
```

- [ ] **Step 4: Run typography-related tests**

Run: `npm run test -- src/components/layout/__tests__/`
Expected: PASS (tests assert text content, not classes).

- [ ] **Step 5: Visual check**

Run: `npm run dev` — confirm headings render bold (Kapwa utility supplies weight 700). No visual regression.

- [ ] **Step 6: Commit**

```bash
git add src/components/layout/PageLayouts.tsx src/components/layout/UnifiedLayouts.tsx
git commit -m "refactor: drive headings purely from Kapwa typography utilities"
```

---

## Part 1 — Color: Blue-Mono, Semantic-Correct

**Migration mapping (apply by meaning):**

| Found | Meaning | Replace with |
|---|---|---|
| `amber-*` (caution/warning) | warning | `bg-kapwa-bg-warning-weak` / `text-kapwa-text-warning` / `border-kapwa-border-warning` |
| `bg-amber-100`/`bg-amber-200` (icon chips) | warning surface | `bg-kapwa-bg-warning-weak` |
| `emerald-*` (present/success) | success | `bg-kapwa-bg-success-weak` / `border-kapwa-border-success` / `text-kapwa-text-success` |
| `blue-*` (weather/data-viz) | brand scale | `kapwa-brand-*` equivalents |
| `yellow-400` (decorative) | brand/neutral | `text-kapwa-text-disabled` (decorative) |
| `white/xx` overlays on brand bg | inverse overlay | `kapwa-bg-surface/xx` or `border-kapwa-border-inverse/xx` |
| `selection:bg-primary-500` | brand selection | `selection:bg-kapwa-bg-brand-default` |
| decorative `accent-orange` (non-warning) | brand/neutral | `text-kapwa-text-brand` / `bg-kapwa-bg-brand-weak` / neutral |
| `accent-orange` as true warning badge | warning | `text-kapwa-text-warning` / `bg-kapwa-bg-warning-weak` |
| OpenLGU doc-type categorical orange | neutral category | `text-kapwa-text-support` + keep icon/label as differentiator |
| `accent-yellow` (marketing pages) | brand emphasis | `text-kapwa-text-brand` / `bg-kapwa-bg-brand-weak` |

**Rule:** color is never the sole differentiator (a11y). Where orange distinguished a category (OpenLGU doc types), collapse to neutral and rely on the existing icon + label.

### Task 4: Color sweep A — admin warning/success leaks (`amber-*`, `emerald-*`)

**Files (exact sites):**
- `src/components/admin/FlagForReviewButton.tsx:210,211`
- `src/components/admin/SessionAttendanceQuickEdit.tsx:149`
- `src/pages/admin/components/AttendanceForm.tsx:187,218,219,226,230`
- `src/pages/admin/components/DeletionQueue.tsx:451,453,455,458`
- `src/pages/admin/components/DocumentEditModal.tsx:715`
- `src/pages/admin/components/LegislativePostImporter.tsx:1067`
- `src/pages/admin/components/PersonMergeTool.tsx:230,352,366`
- `src/pages/admin/components/SessionDataForm.tsx:399,400,407,411`
- `src/pages/admin/Documents.tsx:333`
- `src/pages/admin/index.tsx:228`

- [ ] **Step 1: Replace amber → warning tokens, emerald → success tokens**

In each site above, apply the mapping table. Examples:
```tsx
// before
<div className='... bg-amber-100'>
  <AlertTriangle className='h-5 w-5 text-amber-600' />
// after
<div className='... bg-kapwa-bg-warning-weak'>
  <AlertTriangle className='h-5 w-5 text-kapwa-text-warning' />
```
```tsx
// before
'border-amber-200 bg-amber-50'  ...  isAbsent ? 'bg-amber-200' : 'bg-emerald-200'
// after
'border-kapwa-border-warning bg-kapwa-bg-warning-weak'
  ...  isAbsent ? 'bg-kapwa-bg-warning-weak' : 'bg-kapwa-bg-success-weak'
```
`text-amber-{700,800,900}` → `text-kapwa-text-warning`; `border-amber-{300,400}` → `border-kapwa-border-warning`; `border-emerald-200`/`bg-emerald-50` → `border-kapwa-border-success`/`bg-kapwa-bg-success-weak`.

- [ ] **Step 2: Verify no amber/emerald remain in admin**

Run: `grep -rnE "(amber|emerald)-[0-9]" src/components/admin src/pages/admin`
Expected: no output.

- [ ] **Step 3: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 4: Commit**

```bash
git add src/components/admin src/pages/admin
git commit -m "refactor(color): route admin warning/success colors through Kapwa tokens"
```

---

### Task 5: Color sweep B — weather, marketing, misc raw leaks

**Files (exact sites):**
- `src/pages/data/weather.tsx:67,71,75,78` (`from/to-blue-*`)
- `src/pages/JoinUs.tsx:243` (`text-yellow-400`), `:198,291` (`border-white/20`, `from-white/20 to-white/10`)
- `src/components/layout/Footer.tsx:39` (`selection:bg-primary-500`)

- [ ] **Step 1: weather.tsx — map blue gradients to brand scale**

Change the four returns:
```tsx
'bg-linear-to-br from-blue-400 to-blue-600'  → 'bg-linear-to-br from-kapwa-brand-400 to-kapwa-brand-600'
'bg-linear-to-br from-blue-600 to-blue-800'  → 'bg-linear-to-br from-kapwa-brand-600 to-kapwa-brand-800'
'bg-linear-to-br from-blue-100 to-blue-300'  → 'bg-linear-to-br from-kapwa-brand-100 to-kapwa-brand-300'
'bg-linear-to-br from-blue-500 to-blue-700'  → 'bg-linear-to-br from-kapwa-brand-500 to-kapwa-brand-700'
```

- [ ] **Step 2: JoinUs.tsx — decorative yellow + white overlays**

Line 243: `text-yellow-400` → `text-kapwa-text-disabled`.
Lines 198, 291: `border-white/20` → `border-kapwa-border-inverse/20`; `from-white/20 to-white/10` → `from-kapwa-bg-surface/20 to-kapwa-bg-surface/10`.

- [ ] **Step 3: Footer.tsx — selection color**

Line 39: `selection:bg-primary-500` → `selection:bg-kapwa-bg-brand-default`.

- [ ] **Step 4: Verify**

Run: `grep -rnE "(blue|yellow|primary)-[0-9]|white/[0-9]" src/pages/data/weather.tsx src/pages/JoinUs.tsx src/components/layout/Footer.tsx`
Expected: no output.

- [ ] **Step 5: Build**

Run: `npm run build`
Expected: success.

- [ ] **Step 6: Commit**

```bash
git add src/pages/data/weather.tsx src/pages/JoinUs.tsx src/components/layout/Footer.tsx
git commit -m "refactor(color): route weather/marketing/footer raw colors through Kapwa tokens"
```

---

### Task 6: Color sweep C — demote decorative accent-orange / accent-yellow

**Files (exact sites):**
- `src/components/ui/Badge.tsx:38,53`
- `src/components/home/InfoWidgets.tsx:118`
- `src/components/home/PromotionBanner.tsx:12,26`
- `src/pages/about/index.tsx:185,245`
- `src/pages/Ideas.tsx:101`
- `src/pages/JoinUs.tsx:43,200,205,216,226,233,234,271,59`
- `src/pages/government/elected-officials/index.tsx:75`
- `src/pages/government/elected-officials/municipal-committees.tsx:101,133`
- `src/pages/statistics/MunicipalIncomePage.tsx:133`
- `src/pages/services/components/FilterBar.tsx:168`
- `src/pages/services/components/ProcessTimeline.tsx:33`
- `src/pages/services/components/ServicesSidebar.tsx:51,53,70`
- `src/pages/services/components/SupportingDocumentsDetail.tsx:161`
- `src/pages/services/[service].tsx:345,514,531`
- `src/pages/openlgu/components/CurrentTermCard.tsx:70,71,73,76`
- `src/pages/openlgu/[document].tsx:127,180,197`
- `src/pages/openlgu/[session].tsx:84,146`
- `src/pages/openlgu/[person].tsx:293,302,330,581,745,747,827`
- `src/pages/openlgu/terms.tsx:138,157`
- `src/pages/openlgu/[term].tsx:388,389,391,394`

- [ ] **Step 1: Badge.tsx — fix the warning vs decorative split**

Line 38 (the `warning` variant) is a genuine warning — keep warning intent but make it self-consistent:
```tsx
'bg-kapwa-bg-warning-weak text-kapwa-text-warning border-kapwa-border-warning',
```
Line 53 (`secondary` variant, decorative) → brand:
```tsx
secondary: 'bg-kapwa-bg-brand-default',
```

- [ ] **Step 2: Services + general decorative orange → brand**

For non-categorical decorative usages (services hover states, CTA boxes, committee icons, stat headers, Ideas tag, InfoWidgets, MunicipalIncome), replace:
`text-kapwa-text-accent-orange` → `text-kapwa-text-brand`,
`bg-kapwa-bg-accent-orange-weak` → `bg-kapwa-bg-brand-weak`,
`bg-kapwa-bg-accent-orange-default` → `bg-kapwa-bg-brand-default`,
`border-kapwa-border-accent-orange` → `border-kapwa-border-brand`,
`hover:bg-kapwa-orange-700` → `hover:bg-kapwa-bg-brand-hover`,
`border-kapwa-orange-100` → `border-kapwa-border-weak`.
Applies to: ServicesSidebar (51,53,70), FilterBar (168), ProcessTimeline (33), SupportingDocumentsDetail (161), `[service].tsx` (345,514,531), elected-officials/index (75), municipal-committees (101,133), MunicipalIncomePage (133), Ideas (101), InfoWidgets (118).

- [ ] **Step 3: Marketing accent-yellow → brand**

In JoinUs.tsx (43,200,205,216,226,233,234,271,59), about/index (245), PromotionBanner (12,26):
`text-kapwa-text-accent-yellow` → `text-kapwa-text-brand`,
`bg-kapwa-bg-accent-yellow-weak` → `bg-kapwa-bg-brand-weak`,
`bg-kapwa-bg-accent-yellow-default` → `bg-kapwa-bg-brand-default`,
`border-kapwa-border-accent-yellow` → `border-kapwa-border-brand`,
`hover:bg-kapwa-accent-yellow-hover` → `hover:bg-kapwa-bg-brand-hover`.
JoinUs line 216 (`text-kapwa-text-accent-orange`) → `text-kapwa-text-brand`.

- [ ] **Step 4: about/index.tsx:185 — multi-stop accent gradient → single brand surface**

Replace:
```tsx
className='border-kapwa-border-brand bg-gradient-to-r from-kapwa-bg-danger-weak via-kapwa-bg-accent-orange-weak to-kapwa-bg-warning-weak rounded-xl border-l-4 p-6 md:p-8'
```
with:
```tsx
className='border-kapwa-border-brand bg-kapwa-bg-brand-weak rounded-xl border-l-4 p-6 md:p-8'
```

- [ ] **Step 5: OpenLGU doc-type categorical orange → neutral (keep icon/label)**

The "third category" color (resolution/other doc types) collapses to neutral; ordinance stays brand, executive_order stays warning. Replace the accent-orange branch in each ternary:
- `[document].tsx:127` `border-l-kapwa-border-accent-orange` → `border-l-kapwa-border-weak`
- `[document].tsx:180` `text-kapwa-text-accent-orange` → `text-kapwa-text-support`; also `text-kapwa-yellow-700` (executive_order) → `text-kapwa-text-warning`
- `[document].tsx:197` `bg-kapwa-bg-accent-orange-default hover:bg-kapwa-bg-accent-orange-hover` → `bg-kapwa-bg-surface-bold hover:bg-kapwa-bg-active`
- `[session].tsx:84` `border-l-kapwa-border-accent-orange` → `border-l-kapwa-border-weak`
- `[session].tsx:146` `text-kapwa-text-accent-orange` → `text-kapwa-text-support`

- [ ] **Step 6: Remaining OpenLGU decorative orange → brand**

In CurrentTermCard (70,71,73,76), `[person].tsx` (293,302,330,581,745,747,827), terms.tsx (138,157), `[term].tsx` (388,389,391,394): these are decorative emphasis (term/legislative highlights) → map to brand per the Step 2 rule (`accent-orange-weak`→`brand-weak`, `text-accent-orange`→`text-brand`, `border-accent-orange`→`border-brand`).

- [ ] **Step 7: Verify all decorative accent tokens gone**

Run: `grep -rnE "accent-orange|accent-yellow|kapwa-orange-|kapwa-yellow-[0-9]" src/`
Expected: no output. (Functional `bg-warning`/`text-warning` orange semantics remain and are fine.)

- [ ] **Step 8: Build + lint**

Run: `npm run build`
Expected: success.

- [ ] **Step 9: Commit**

```bash
git add src/
git commit -m "refactor(color): demote decorative orange/yellow to brand/neutral, keep warnings only"
```

---

### Task 7: Verify the color gate

**Files:** none (verification only)

- [ ] **Step 1: Global raw-color gate**

Run: `grep -rnE "(text|bg|border|ring|from|to|via|fill|stroke|selection:bg)-(blue|orange|amber|sky|indigo|red|yellow|emerald|primary)-[0-9]{2,3}" src/ | grep -v kapwa`
Expected: no output (or only intentional, comment-justified exceptions).

- [ ] **Step 2: Run pre-commit raw-color hook check**

Run: `npx lint-staged` (or trigger via a no-op staged change) / confirm `.husky/pre-commit` passes.
Expected: no raw-color violations.

- [ ] **Step 3: Run e2e Kapwa token assertions**

Run: `npm run test:e2e -- --grep kapwa` (or the suite that uses `e2e/utils/kapwa.ts`)
Expected: PASS.

- [ ] **Step 4: Visual spot-check**

Run: `npm run dev`. Confirm: warnings still orange; former decorative orange now reads brand/neutral; no blue+orange dual-tone on home, services, openlgu, about, joinus.

---

## Part 2 — Layout: Tiered Sidebar + SubNav

### Task 8: Create the SubNav component

**Files:**
- Create: `src/components/navigation/SubNav.tsx`
- Test: `src/components/navigation/__tests__/SubNav.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Users } from 'lucide-react';
import { SubNav } from '../SubNav';

const items = [
  { label: 'Demographics', href: '/statistics', icon: Users },
  { label: 'Competitiveness', href: '/statistics/competitiveness' },
];

describe('SubNav', () => {
  it('renders all items as links', () => {
    render(
      <MemoryRouter initialEntries={['/statistics']}>
        <SubNav items={items} aria-label='Statistics sections' />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /Demographics/ })).toHaveAttribute('href', '/statistics');
    expect(screen.getByRole('link', { name: /Competitiveness/ })).toBeInTheDocument();
  });

  it('marks the active route with aria-current=page', () => {
    render(
      <MemoryRouter initialEntries={['/statistics']}>
        <SubNav items={items} aria-label='Statistics sections' />
      </MemoryRouter>
    );
    expect(screen.getByRole('link', { name: /Demographics/ })).toHaveAttribute('aria-current', 'page');
    expect(screen.getByRole('link', { name: /Competitiveness/ })).not.toHaveAttribute('aria-current', 'page');
  });

  it('exposes the nav landmark with the provided label', () => {
    render(
      <MemoryRouter initialEntries={['/statistics']}>
        <SubNav items={items} aria-label='Statistics sections' />
      </MemoryRouter>
    );
    expect(screen.getByRole('navigation', { name: 'Statistics sections' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/navigation/__tests__/SubNav.test.tsx`
Expected: FAIL (`Cannot find module '../SubNav'`).

- [ ] **Step 3: Implement SubNav**

```tsx
import { ReactNode } from 'react';

import { NavLink } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

export interface SubNavItem {
  /** Visible label */
  label: string;
  /** Route path */
  href: string;
  /** Optional leading icon */
  icon?: LucideIcon;
  /** Match the path exactly (default true for index-style links) */
  end?: boolean;
}

export interface SubNavProps {
  /** Lateral navigation items */
  items: SubNavItem[];
  /** Accessible landmark label */
  'aria-label': string;
  /** Additional classes on the nav element */
  className?: string;
}

/**
 * SubNav — horizontal pill navigation for shallow lateral sections.
 *
 * Replaces a vertical sidebar where a section has only a few sibling pages.
 * Horizontally scrollable on small screens; 44px min touch targets; visible
 * focus ring; active route marked with aria-current via NavLink.
 */
export function SubNav({ items, className, ...rest }: SubNavProps): ReactNode {
  return (
    <nav
      aria-label={rest['aria-label']}
      className={cn(
        'border-kapwa-border-weak mb-8 flex gap-2 overflow-x-auto border-b pb-3',
        className
      )}
    >
      {items.map(({ label, href, icon: Icon, end = true }) => (
        <NavLink
          key={href}
          to={href}
          end={end}
          className={({ isActive }) =>
            cn(
              'inline-flex min-h-[44px] shrink-0 items-center gap-2 rounded-full px-4 py-2',
              'kapwa-label-sm transition-colors',
              'focus-visible:ring-kapwa-border-focus focus-visible:ring-2 focus-visible:outline-none',
              isActive
                ? 'bg-kapwa-bg-brand-weak text-kapwa-text-brand'
                : 'text-kapwa-text-support hover:bg-kapwa-bg-surface-raised hover:text-kapwa-text-strong'
            )
          }
        >
          {Icon && <Icon className='h-4 w-4 shrink-0' aria-hidden='true' />}
          <span>{label}</span>
        </NavLink>
      ))}
    </nav>
  );
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm run test -- src/components/navigation/__tests__/SubNav.test.tsx`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/components/navigation/SubNav.tsx src/components/navigation/__tests__/SubNav.test.tsx
git commit -m "feat(nav): add SubNav horizontal pill navigation"
```

---

### Task 9: Migrate Statistics to SubNav

**Files:**
- Modify: `src/pages/statistics/layout.tsx`
- Delete: `src/pages/statistics/components/StatisticsSidebar.tsx`

- [ ] **Step 1: Rewrite the layout to use SubNav + plain content (no SidebarLayout)**

Replace the contents of `src/pages/statistics/layout.tsx` with:
```tsx
import { Outlet } from 'react-router-dom';

import { Trophy, Users, Wallet } from 'lucide-react';

import { PageHeader, SectionBlock } from '@/components/layout';
import { SubNav } from '@/components/navigation/SubNav';
import { lguLabels } from '@/lib/lguLabels';

const sections = [
  { label: 'Demographics', href: '/statistics', icon: Users },
  { label: 'Competitiveness', href: '/statistics/competitiveness', icon: Trophy },
  { label: 'Municipal Income', href: '/statistics/municipal-income', icon: Wallet },
];

export default function StatisticsLayout() {
  return (
    <div className='min-h-screen bg-kapwa-bg-surface'>
      <PageHeader
        variant='centered'
        title={`${lguLabels.adjective} Statistics`}
        description={`Data-driven insights into the population, economy, and performance of ${lguLabels.name}.`}
      />

      <SectionBlock>
        <SubNav items={sections} aria-label='Statistics sections' />
        <Outlet />
      </SectionBlock>
    </div>
  );
}
```

- [ ] **Step 2: Delete the bespoke sidebar**

Run: `git rm src/pages/statistics/components/StatisticsSidebar.tsx`

- [ ] **Step 3: Verify no dangling imports**

Run: `grep -rn "StatisticsSidebar" src/`
Expected: no output.

- [ ] **Step 4: Build + run**

Run: `npm run build` then `npm run dev` — visit `/statistics`, `/statistics/competitiveness`, `/statistics/municipal-income`. Expected: no sidebar; pills nav works; active pill highlights.

- [ ] **Step 5: Commit**

```bash
git add src/pages/statistics
git commit -m "refactor(layout): replace Statistics sidebar with SubNav"
```

---

### Task 10: Migrate Transparency to SubNav

**Files:**
- Modify: `src/pages/transparency/layout.tsx`
- Delete: `src/pages/transparency/components/TransparencySidebar.tsx`

- [ ] **Step 1: Rewrite the layout**

Replace the contents of `src/pages/transparency/layout.tsx` with:
```tsx
import { Outlet, useLocation } from 'react-router-dom';

import { CreditCard, Hammer, Truck } from 'lucide-react';

import { PageHeader, SectionBlock } from '@/components/layout';
import { SubNav } from '@/components/navigation/SubNav';
import { lguLabels } from '@/lib/lguLabels';

const sections = [
  { label: 'Budget & Finances', href: '/transparency/financial', icon: CreditCard },
  { label: 'Procurement', href: '/transparency/procurement', icon: Hammer },
  { label: 'DPWH Projects', href: '/transparency/infrastructure', icon: Truck },
];

export default function TransparencyLayout() {
  const location = useLocation();
  const isIndexPage = location.pathname === '/transparency';

  return (
    <div className='min-h-screen bg-kapwa-bg-surface'>
      {isIndexPage ? (
        <PageHeader
          variant='centered'
          title='Transparency Portal'
          description={`A community-led initiative to make ${lguLabels.name} public data accessible, readable, and verifiable for every citizen.`}
        />
      ) : (
        <PageHeader
          variant='compact'
          title='Transparency Portal'
          description='Track municipal funds, infrastructure projects, and procurement records.'
          autoBreadcrumbs={true}
        />
      )}

      <SectionBlock>
        <SubNav items={sections} aria-label='Transparency sections' />
        <Outlet />
      </SectionBlock>
    </div>
  );
}
```
(Note: original sidebar used relative `path` slugs resolved against `/transparency`; SubNav uses absolute hrefs — verify these match the actual child routes in the router; adjust if the route base differs.)

- [ ] **Step 2: Delete the bespoke sidebar**

Run: `git rm src/pages/transparency/components/TransparencySidebar.tsx`

- [ ] **Step 3: Verify**

Run: `grep -rn "TransparencySidebar" src/`
Expected: no output.

- [ ] **Step 4: Build + run**

Run: `npm run build` then `npm run dev` — visit `/transparency` and each sub-route; confirm pills + active state, no sidebar.

- [ ] **Step 5: Commit**

```bash
git add src/pages/transparency
git commit -m "refactor(layout): replace Transparency sidebar with SubNav"
```

---

### Task 11: Migrate Elected Officials to SubNav

**Files:**
- Modify: `src/pages/government/elected-officials/layout.tsx`
- Delete: `src/pages/government/elected-officials/components/ElectedOfficialsSidebar.tsx`

- [ ] **Step 1: Rewrite the layout**

Replace the contents of `src/pages/government/elected-officials/layout.tsx` with:
```tsx
import { Outlet } from 'react-router-dom';

import { BookOpenIcon, BuildingIcon } from 'lucide-react';

import { SectionBlock } from '@/components/layout';
import { SubNav } from '@/components/navigation/SubNav';

const sections = [
  { label: 'Elected Officials', href: '/government/elected-officials', icon: BuildingIcon },
  { label: 'Standing Committees', href: '/government/elected-officials/committees', icon: BookOpenIcon },
];

export default function ElectedOfficialsLayout() {
  return (
    <SectionBlock>
      <SubNav items={sections} aria-label='Elected officials sections' />
      <Outlet />
    </SectionBlock>
  );
}
```

- [ ] **Step 2: Delete the bespoke sidebar**

Run: `git rm src/pages/government/elected-officials/components/ElectedOfficialsSidebar.tsx`

- [ ] **Step 3: Verify**

Run: `grep -rn "ElectedOfficialsSidebar" src/`
Expected: no output.

- [ ] **Step 4: Build + run**

Run: `npm run build` then `npm run dev` — visit `/government/elected-officials` and `/government/elected-officials/committees`; confirm pills + active state, no sidebar. (The "Elected Officials" pill uses `end` matching so it isn't active on the committees route.)

- [ ] **Step 5: Commit**

```bash
git add src/pages/government/elected-officials
git commit -m "refactor(layout): replace Elected Officials sidebar with SubNav"
```

---

### Task 12: Lighten ModuleHeader chrome

`SidebarLayout` already wraps content in a bordered card; the de-sidebar'd sections no longer use it (they use `SectionBlock`), so no nested-card removal is needed there. The remaining chrome refinement is `ModuleHeader`, which is heavy on index/list pages. Reduce its bottom border weight to match the lighter rhythm.

**Files:**
- Modify: `src/components/layout/PageLayouts.tsx:86`

- [ ] **Step 1: Soften the ModuleHeader divider**

Change line ~86:
```tsx
<div className='border-kapwa-border-weak mb-8 border-b pb-6'>
```
to:
```tsx
<div className='border-kapwa-border-weak/60 mb-6 border-b pb-4'>
```

- [ ] **Step 2: Run layout tests**

Run: `npm run test -- src/components/layout/__tests__/`
Expected: PASS.

- [ ] **Step 3: Visual check**

Run: `npm run dev` — confirm index/list headers look lighter, no layout break.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/PageLayouts.tsx
git commit -m "style(layout): lighten ModuleHeader divider"
```

---

## Part 3 — Makiling Motif

### Task 13: Create the MakilingRidge component

**Files:**
- Create: `src/components/brand/MakilingRidge.tsx`
- Create: `src/components/brand/index.ts`
- Test: `src/components/brand/__tests__/MakilingRidge.test.tsx`

- [ ] **Step 1: Write the failing test**

```tsx
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MakilingRidge } from '../MakilingRidge';

describe('MakilingRidge', () => {
  it('renders an aria-hidden decorative svg', () => {
    const { container } = render(<MakilingRidge />);
    const svg = container.querySelector('svg');
    expect(svg).toBeTruthy();
    expect(svg).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies a passed className', () => {
    const { container } = render(<MakilingRidge className='text-kapwa-text-brand' />);
    expect(container.querySelector('svg')).toHaveClass('text-kapwa-text-brand');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/components/brand/__tests__/MakilingRidge.test.tsx`
Expected: FAIL (`Cannot find module '../MakilingRidge'`).

- [ ] **Step 3: Implement MakilingRidge**

```tsx
import { cn } from '@/lib/utils';

export interface MakilingRidgeProps {
  /** Extra classes (drives color via currentColor + opacity utilities) */
  className?: string;
}

/**
 * MakilingRidge — decorative Mt. Makiling "sleeping lady" ridgeline.
 *
 * Pure line/area silhouette driven by `currentColor` (`fill`). Decorative
 * only (aria-hidden). Stretch to any width via className; the viewBox keeps
 * the silhouette proportional. Used in hero, footer, and 404 backgrounds.
 */
export function MakilingRidge({ className }: MakilingRidgeProps) {
  return (
    <svg
      viewBox='0 0 1440 160'
      preserveAspectRatio='none'
      aria-hidden='true'
      className={cn('block h-auto w-full', className)}
    >
      {/* Reclining-figure ridgeline: head (left rise), neck dip, torso peak,
          long sloping legs to the right. Approximate; swap for a surveyed
          profile asset later if desired. */}
      <path
        fill='currentColor'
        d='M0 160 L0 96 C 120 70 200 60 300 84 C 360 98 400 86 440 70
           C 470 58 500 64 540 96 C 600 50 700 18 820 24
           C 980 32 1080 70 1200 92 C 1300 110 1380 118 1440 112
           L1440 160 Z'
      />
    </svg>
  );
}
```

- [ ] **Step 4: Create the barrel export**

`src/components/brand/index.ts`:
```ts
export { MakilingRidge, type MakilingRidgeProps } from './MakilingRidge';
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm run test -- src/components/brand/__tests__/MakilingRidge.test.tsx`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/components/brand
git commit -m "feat(brand): add MakilingRidge motif component"
```

---

### Task 14: Add motif to the homepage hero

**Files:**
- Modify: `src/components/home/Hero.tsx:108-109,200`

- [ ] **Step 1: Make the hero a positioning context and add the ridge**

Change the root wrapper (line 108-109):
```tsx
<div className='py-12 from-kapwa-brand-600 to-kapwa-brand-700 bg-linear-to-r text-kapwa-text-inverse md:py-24'>
  <div className='container px-4 mx-auto'>
```
to:
```tsx
<div className='relative overflow-hidden py-12 from-kapwa-brand-600 to-kapwa-brand-700 bg-linear-to-r text-kapwa-text-inverse md:py-24'>
  <MakilingRidge className='pointer-events-none absolute inset-x-0 bottom-0 text-kapwa-bg-surface/10' />
  <div className='relative container px-4 mx-auto'>
```

- [ ] **Step 2: Add the import**

At the top of `Hero.tsx` with the other `@/components` imports:
```tsx
import { MakilingRidge } from '@/components/brand';
```

- [ ] **Step 3: Build + run**

Run: `npm run build` then `npm run dev` — the home hero shows a faint ridge along its lower edge; hero text/search sit above it; no horizontal scroll.

- [ ] **Step 4: Commit**

```bash
git add src/components/home/Hero.tsx
git commit -m "feat(brand): add Makiling ridge to homepage hero"
```

---

### Task 15: Add motif band to the footer

**Files:**
- Modify: `src/components/layout/Footer.tsx:38-40`

- [ ] **Step 1: Add a thin ridge band at the footer's top edge**

Change the footer opening (lines 38-40):
```tsx
<footer className='bg-kapwa-bg-surface-bold selection:bg-kapwa-bg-brand-default text-kapwa-text-inverse selection:text-kapwa-text-inverse'>
  <div className='container px-4 pt-16 pb-12 mx-auto'>
```
to:
```tsx
<footer className='bg-kapwa-bg-surface-bold selection:bg-kapwa-bg-brand-default text-kapwa-text-inverse selection:text-kapwa-text-inverse'>
  <MakilingRidge className='text-kapwa-bg-surface/5 h-10' />
  <div className='container px-4 pt-8 pb-12 mx-auto'>
```
(Reduces top padding from `pt-16` to `pt-8` since the ridge band now occupies the top edge. Keep the `selection:bg-kapwa-bg-brand-default` from Task 5.)

- [ ] **Step 2: Add the import**

With the other imports in `Footer.tsx`:
```tsx
import { MakilingRidge } from '@/components/brand';
```

- [ ] **Step 3: Build + run**

Run: `npm run build` then `npm run dev` — a subtle ridge spans the footer top on every page; content below unaffected.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Footer.tsx
git commit -m "feat(brand): add Makiling ridge band to footer"
```

---

### Task 16: Add motif to the 404 page and fix its raw leak

**Files:**
- Modify: `src/pages/NotFound.tsx:10,18,52`

- [ ] **Step 1: Add the ridge + fix the `border-white` leak**

Make the gradient wrapper a positioning context and add the ridge. Change line 10:
```tsx
<div className='min-h-screen bg-linear-to-br from-kapwa-brand-600 via-kapwa-brand-700 to-kapwa-brand-800'>
```
to:
```tsx
<div className='relative min-h-screen overflow-hidden bg-linear-to-br from-kapwa-brand-600 via-kapwa-brand-700 to-kapwa-brand-800'>
```
Immediately inside that div (before the `<SEO ... />` / `<div className='relative'>`), add:
```tsx
<MakilingRidge className='pointer-events-none absolute inset-x-0 bottom-0 text-kapwa-bg-surface/10' />
```
Fix the raw leak at line ~52: `border-white` → `border-kapwa-border-inverse`.

- [ ] **Step 2: Add the import**

With the other imports in `NotFound.tsx`:
```tsx
import { MakilingRidge } from '@/components/brand';
```

- [ ] **Step 3: Verify no raw color remains**

Run: `grep -nE "border-white|-(white|blue|orange)-[0-9]" src/pages/NotFound.tsx | grep -v kapwa`
Expected: no output.

- [ ] **Step 4: Build + run**

Run: `npm run build` then `npm run dev` — visit a bad URL; ridge shows at the bottom; buttons/text unaffected.

- [ ] **Step 5: Commit**

```bash
git add src/pages/NotFound.tsx
git commit -m "feat(brand): add Makiling ridge to 404 and fix raw border leak"
```

---

## Final Verification

- [ ] **Full test suite**: `npm run test` — all green.
- [ ] **Build**: `npm run build` — succeeds.
- [ ] **E2E**: `npm run test:e2e` — green (Kapwa token assertions included).
- [ ] **Raw-color gate**: `grep -rnE "(text|bg|border|ring|from|to|via|fill|stroke|selection:bg)-(blue|orange|amber|sky|indigo|red|yellow|emerald|primary)-[0-9]{2,3}" src/ | grep -v kapwa` → empty.
- [ ] **Accent gate**: `grep -rnE "accent-orange|accent-yellow|kapwa-orange-|kapwa-yellow-[0-9]" src/` → empty.
- [ ] **Dead sidebar gate**: `grep -rnE "StatisticsSidebar|TransparencySidebar|ElectedOfficialsSidebar" src/` → empty.
- [ ] **Responsive manual check**: home, services, openlgu, statistics, transparency, elected-officials, 404 at 375 / 768 / 1024 / 1440px — no horizontal scroll; motif crisp; SubNav scrolls on mobile.

---

## Self-Review Notes (author)

- **Spec coverage:** Part 0 → Tasks 1-3; Part 1 → Tasks 4-7; Part 2 → Tasks 8-12; Part 3 → Tasks 13-16. All spec sections mapped.
- **Color verification** is grep-gate + e2e Kapwa assertions (the repo's actual enforcement), not per-color unit tests — appropriate for class-only changes.
- **Decision encoded:** OpenLGU categorical orange collapses to neutral (icon+label remain the differentiator). Override in Task 6 Steps 5-6 if a distinct third category color is wanted (use a neutral brand tint, not orange).
- **Route-base caveat (Task 10):** Transparency child routes assumed at `/transparency/{financial,procurement,infrastructure}`; verify against the router before finalizing hrefs.
