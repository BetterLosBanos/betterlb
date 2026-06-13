# BetterLB Design Refinement — Design Spec

**Date:** 2026-06-13
**Status:** Approved (brainstorming)
**Scope:** Refine BetterLB's visual identity and layout to stay near-identical to BetterGovPH's Kapwa design system while adding subtle Los Baños personality. Three-part refinement: (0) Kapwa 1.4.1 alignment, (1) color discipline, (2) layout simplification, (3) Makiling motif.

---

## Goal

BetterLB should read as unmistakably part of the BetterGovPH family (shared Kapwa system, blue brand, same typography) while carrying a quiet, distinctly Los Baños character — delivered through a motif, not a divergent palette. The current "blue + orange everywhere" dual-tone is replaced by a single brand hue with functional-only semantics. The pervasive sidebar-on-every-section layout is reduced to where it earns its place, and nested chrome is flattened.

**Design philosophy:** Less is more. Personality comes from a motif (the Mt. Makiling "sleeping lady" ridgeline), the way BetterDasmariñas uses butterflies — not from extra colors or fonts.

---

## Constraints & Principles

- **Semantic tokens only, used correctly.** Every color routes through a Kapwa semantic token (`--color-kapwa-*` / `*-kapwa-*` Tailwind classes) that matches its *meaning*. A warning uses a warning token; a brand element uses a brand token. No raw Tailwind color classes (`amber-*`, `blue-*`, `red-300`, etc.). The existing pre-commit hook guards regressions.
- **Kapwa typography utilities only.** All text uses Kapwa's `@utility` type scale (`kapwa-heading-*`, `kapwa-body-*`, `kapwa-label-*`, `kapwa-link-*`, `kapwa-code-*`). No raw `text-{size} font-{weight}` for type styling.
- **Family resemblance first.** Brand stays Kapwa blue (`--color-kapwa-brand-600`, `#005df5`). No new accent colors. No font changes (Inter + Roboto Mono, as Kapwa ships).
- **Light mode only.** App has no dark mode (0 `dark:` usages, no toggle). All work is light-mode scoped.

---

## Part 0 — Kapwa 1.4.1 Alignment

The app pins `@bettergov/kapwa@^1.2.4` but hand-rolls things 1.4.1 already provides, and carries a broken token reference.

### Changes

1. **Bump dependency:** `@bettergov/kapwa` `^1.2.4` → `1.4.1` in `package.json`. Reinstall.
2. **Remove redundant font var definitions.** Kapwa defines `--font-kapwa-sans` (Inter) and `--font-kapwa-mono` (Roboto Mono) in `kapwa.css`. The app redefines both in `src/index.css` (lines ~8–14) and `src/fonts.css`. Remove these redefinitions. **Keep** the Google Fonts `@import` (Kapwa names the fonts but does not load the webfonts) and keep the `body { font-family: var(--font-kapwa-sans) }` rule (Kapwa's base layer sets body bg/color but not font-family).
3. **Remove broken global border override.** `src/index.css` sets `border-color: var(--color-border-kapwa-border-weak, currentcolor)` on `*`. That token name does not exist in Kapwa (correct: `--color-kapwa-border-weak`), so it always falls back to `currentcolor`. Kapwa's own base layer already sets a sane default border color (`--color-kapwa-gray-200`). Remove the override block.

### Acceptance
- `package.json` shows `@bettergov/kapwa: "1.4.1"`; lockfile updated.
- No `--font-kapwa-*` redefinitions remain in app CSS; fonts still render (Inter body, Roboto Mono code).
- No reference to `--color-border-kapwa-border-weak` anywhere; default borders still visible.
- Build + existing e2e Kapwa assertions pass.

---

## Part 1 — Color: Blue-Mono, Semantic-Correct

The Kapwa `orange` scale currently does double duty: functional `warning` semantics **and** decorative `accent-orange`. The decorative usage (plus raw color leaks) creates the dual blue/orange theme. Refinement = orange becomes warning-only; everything else routes to the correct semantic token.

### Audit-by-meaning sweep

Each occurrence is migrated based on what it *means*, not by blind find/replace:

| Current (raw / decorative) | Meaning | Migrate to |
|---|---|---|
| `text-accent-orange`, `bg-accent-orange-weak` (~41 uses) used decoratively | Brand/neutral emphasis | `text-kapwa-text-brand` / `bg-kapwa-bg-brand-weak` (or neutral surface) |
| `amber-*` conveying caution | Warning | `bg-kapwa-bg-warning-weak` / `text-kapwa-text-warning` / `border-kapwa-border-warning` |
| `amber-*` purely decorative | Brand/neutral | brand or neutral token (not warning) |
| `from-blue-* to-blue-*` gradients | Brand | brand-scale tokens |
| `border-red-300`, other `red-*` | Danger | `border-kapwa-border-danger` / danger tokens |
| `text-yellow-400` and similar | case-by-case | matching semantic (`accent-yellow` only if genuinely a yellow accent; else brand/neutral) |

**Rule:** never assign `brand` to a true warning, or `warning` to decoration. When meaning is ambiguous, inspect the component context before choosing.

Orange **stays** wherever it is genuinely a warning/alert (`bg-warning`, `text-warning`, `border-warning` semantic tokens) — those are untouched.

### Scope of files
All `src/` files containing raw color classes (grep baseline: `amber-*` ~30, `blue-*` gradients/text several, `red-*` a few) plus the decorative `accent-orange` usages across `src/pages` and `src/components`.

### Acceptance
- `grep -rE "(text|bg|border|ring|from|to|via)-(blue|orange|amber|sky|indigo|red|green|yellow)-[0-9]{2,3}" src/` returns zero (or only documented, justified exceptions).
- No `accent-orange` token used for non-warning decoration.
- Pre-commit raw-color hook passes.
- Visual spot-check: warnings still orange; former decorative-orange now reads as brand/neutral; no dual-tone.

---

## Part 2 — Layout: Tiered Sidebar, Flattened Chrome

Sidebar currently appears on all 7 major sections, each with a bespoke `*Sidebar.tsx`, compounding with nested chrome (`ModuleHeader` + sidebar + bordered content card = three stacked frames). Sidebar should be earned by deep lateral browsing.

### Tiering

**Keep sidebar** (deep catalogs with real lateral nav):
- `src/pages/services/layout.tsx` → `ServicesSidebar`
- `src/pages/openlgu/layout.tsx` → `OpenLGUSidebar`

**Drop sidebar** → `PageHeader` + horizontal `SubNav` (where sub-pages exist), else plain content:
- `src/pages/statistics/layout.tsx` → remove `StatisticsSidebar`
- `src/pages/transparency/layout.tsx` → remove `TransparencySidebar`
- `src/pages/government/departments/layout.tsx` → remove `DepartmentsSidebar`
- `src/pages/government/barangays/layout.tsx` → remove `BarangaysSidebar`
- `src/pages/government/elected-officials/layout.tsx` → remove `ElectedOfficialsSidebar`

### New shared component: `SubNav`
- Location: `src/components/navigation/SubNav.tsx` (+ barrel export).
- Horizontal pill/tab nav for lateral navigation between sibling sub-pages. Replaces the per-section vertical sidebars on de-sidebar'd sections.
- Props: `items: { label, href }[]`, active-state derived from route. Kapwa tokens + typography (`kapwa-label-*`). Accessible (keyboard nav, `aria-current`, 44px targets, visible focus).
- The nav links currently living in the deleted sidebars move into `SubNav` configs per section.

### Flatten nested chrome
- On de-sidebar'd pages: drop the bordered content well (`rounded-2xl border shadow-sm` from `SidebarLayout`'s content `main`); use whitespace + section rhythm (`SectionBlock`) instead.
- Lighten `ModuleHeader` weight (reduce competing frames). Sidebar-retaining pages (Services, OpenLGU) keep a lighter divider rather than a full bordered box where feasible.

### Cleanup
- Delete the 5 unused bespoke sidebar components after migration: `StatisticsSidebar`, `TransparencySidebar`, `DepartmentsSidebar`, `BarangaysSidebar`, `ElectedOfficialsSidebar`.
- `SidebarLayout` remains (used by Services + OpenLGU).

### Acceptance
- Statistics, Transparency, Departments, Barangays, Elected Officials render with no sidebar; lateral nav (where applicable) via `SubNav`.
- Services + OpenLGU retain sidebars.
- 5 bespoke sidebar components deleted; no dead imports.
- No nested bordered-card-inside-header on de-sidebar'd pages.
- `SubNav` keyboard-navigable, `aria-current` on active, focus visible.
- Existing layout tests updated and passing.

---

## Part 3 — Makiling Motif

A single Los Baños signature: the Mt. Makiling "sleeping lady" ridgeline as monochrome SVG line art. Zero color cost; carries local identity.

### New component: `MakilingRidge`
- Location: `src/components/brand/MakilingRidge.tsx` (+ barrel export).
- SVG ridgeline silhouette, `currentColor`-driven (or brand tint), with configurable `height`, `opacity`, and `className`. Decorative → `aria-hidden="true"`.
- Respects `prefers-reduced-motion` (no animation by default; static).

### Placement
1. **Homepage hero** — faint silhouette behind/below hero content (`src/components/home/Hero.tsx`). Primary identity moment.
2. **Footer band** — thin ridge along the footer top edge (`src/components/layout/Footer.tsx`). Every-page signature.
3. **404** — anchors `src/pages/NotFound.tsx` (low-traffic bonus, adds warmth).

### Acceptance
- `MakilingRidge` renders crisply at hero, footer, and 404; monochrome; `aria-hidden`.
- No layout shift; no horizontal scroll at 375/768/1024/1440px.
- Contrast unaffected (decorative, behind/around content at low opacity).

---

## Out of Scope
- Dark mode.
- Typography/font changes (beyond routing to Kapwa utilities).
- Logo redesign.
- New accent colors or palettes.
- Unrelated refactors.

---

## Testing Strategy
- **Color:** grep gate for raw colors (zero); e2e Kapwa token assertions (`e2e/utils/kapwa.ts`) pass; visual spot-check of warnings vs former decorative orange.
- **Layout:** update/extend layout tests (`src/components/layout/__tests__/`); add `SubNav` unit test (active state, a11y); manual nav check per de-sidebar'd section.
- **Motif:** render test for `MakilingRidge`; responsive + reduced-motion manual check.
- **Regression:** full build + existing e2e suite green before merge.

## Rollout
Single feature branch off current `feature/workbench-deploy` base (or new branch from `main`). Parts 0→1→2→3 are largely independent; can land as sequential commits or stacked PRs. Part 0 first (unblocks correct tokens/typography for the rest).
