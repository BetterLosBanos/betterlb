# Kapwa Semantic Token Migration Guide

> **Practical guide for migrating components and pages to Kapwa semantic tokens**
>
> **Task:** T-136
> **Last Updated:** 2026-03-03
> **Dependencies:** T-128 (Navigation pages migration - COMPLETE)

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Understanding Semantic Tokens](#understanding-semantic-tokens)
3. [Migration Patterns](#migration-patterns)
4. [Common Migrations](#common-migrations)
5. [Component-Specific Guides](#component-specific-guides)
6. [Validation & Testing](#validation--testing)
7. [Troubleshooting](#troubleshooting)
8. [Best Practices](#best-practices)
9. [Resources](#resources)

---

## Quick Start

### What Are Semantic Tokens?

Semantic tokens convey **meaning** (success, error, warning) rather than just color.

**Example:**
```tsx
// ❌ Raw color - just "red"
<div className="bg-red-50 text-red-600">Error</div>

// ✅ Semantic token - means "danger/error"
<div className="bg-kapwa-red-50 text-kapwa-text-danger">Error</div>
```

### The Golden Rule

**Use semantic tokens for status/feedback. Use raw colors for decoration/data.**

```
Need color?
├─ Is it status/feedback? → Use semantic (success, error, warning, info)
├─ Is it data visualization? → Use raw (hex or scale)
└─ Is it decorative? → Use semantic (brand, text, border)
```

### Tailwind v4 Prefix Rule (CRITICAL)

Kapwa semantic classes **MUST** use Tailwind v4 prefixes:

| Type | Prefix | Example |
|------|--------|---------|
| Text colors | `text-` | `text-kapwa-text-strong` ✅ |
| Backgrounds | `bg-` | `bg-kapwa-bg-surface` ✅ |
| Borders | `border-` | `border-kapwa-border-weak` ✅ |
| Typography | No prefix | `kapwa-heading-md` ✅ |
| Spacing | No prefix | `p-kapwa-md` ✅ |

```tsx
// ❌ WRONG - Missing prefix
<div className="kapwa-text-strong">Error</div>

// ✅ CORRECT - Has prefix
<div className="text-kapwa-text-strong">Error</div>
```

---

## Understanding Semantic Tokens

### Text Color Tokens

| Token | Use For | Example |
|-------|---------|---------|
| `text-kapwa-text-strong` | Primary text, headings | Page titles, section headers |
| `text-kapwa-text-support` | Body text, descriptions | Paragraphs, explanatory text |
| `text-kapwa-text-disabled` | Disabled text, labels | Inactive options, muted labels |
| `text-kapwa-text-inverse` | Text on dark backgrounds | White text on dark backgrounds |
| `text-kapwa-text-link` | Links | Clickable links |
| `text-kapwa-text-success` | **SUCCESS states only** | "Saved successfully", "Active" |
| `text-kapwa-text-danger` | **ERROR states only** | "Failed to save", "Error" |
| `text-kapwa-text-warning` | **WARNING states only** | "Are you sure?", "Pending" |
| `text-kapwa-text-info` | **INFO states only** | "For your information" |

### Background Tokens

| Token | Use For | Example |
|-------|---------|---------|
| `bg-kapwa-bg-surface` | Default white background | Page containers, cards |
| `bg-kapwa-bg-surface-raised` | Card backgrounds | Elevated content |
| `bg-kapwa-bg-surface-bold` | Dark/footer backgrounds | Footers, hero sections |
| `bg-kapwa-bg-hover` | Hover state | Interactive elements |
| `bg-kapwa-bg-disabled` | Disabled backgrounds | Disabled inputs, buttons |

### Border Tokens

| Token | Use For | Example |
|-------|---------|---------|
| `border-kapwa-border-weak` | Default borders | Cards, dividers |
| `border-kapwa-border-strong` | Emphasized borders | Important sections |
| `border-kapwa-border-focus` | Focus states | Input focus, keyboard nav |

---

## Migration Patterns

### Pattern 1: Status Messages (Most Common)

**Error Messages:**
```tsx
// Before ❌
<div className="bg-rose-50 border border-rose-200 rounded-lg p-4">
  <p className="text-rose-600 font-semibold">Error</p>
  <p className="text-rose-800">{errorMessage}</p>
</div>

// After ✅
<div className="bg-kapwa-red-50 border border-kapwa-red-200 rounded-lg p-4">
  <p className="text-kapwa-text-danger font-semibold">Error</p>
  <p className="text-kapwa-text-support">{errorMessage}</p>
</div>
```

**Success Messages:**
```tsx
// Before ❌
<div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4">
  <p className="text-emerald-600">Success!</p>
</div>

// After ✅
<div className="bg-kapwa-green-50 border border-kapwa-green-200 rounded-lg p-4">
  <p className="text-kapwa-text-success">Success!</p>
</div>
```

**Warning Messages:**
```tsx
// Before ❌
<div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
  <p className="text-amber-600">Warning</p>
</div>

// After ✅
<div className="bg-kapwa-orange-50 border border-kapwa-orange-200 rounded-lg p-4">
  <p className="text-kapwa-text-warning">Warning</p>
</div>
```

**Info Messages:**
```tsx
// Before ❌
<div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
  <p className="text-blue-600">Information</p>
</div>

// After ✅
<div className="bg-kapwa-blue-50 border border-kapwa-blue-200 rounded-lg p-4">
  <p className="text-kapwa-text-info">Information</p>
</div>
```

---

### Pattern 2: Text Styling

**Headings:**
```tsx
// Before ❌
<h1 className="text-2xl font-bold text-gray-900">Title</h1>
<h2 className="text-xl font-semibold text-gray-900">Subtitle</h2>

// After ✅
<h1 className="kapwa-heading-xl text-kapwa-text-strong">Title</h1>
<h2 className="kapwa-heading-lg text-kapwa-text-strong">Subtitle</h2>
```

**Body Text:**
```tsx
// Before ❌
<p className="text-base text-gray-600">Description</p>
<p className="text-sm font-medium text-gray-700">Bold description</p>

// After ✅
<p className="kapwa-body-md-default text-kapwa-text-support">Description</p>
<p className="kapwa-body-md-strong text-kapwa-text-support">Bold description</p>
```

**Muted Text:**
```tsx
// Before ❌
<span className="text-gray-500">Disabled</span>

// After ✅
<span className="text-kapwa-text-disabled">Disabled</span>
```

---

### Pattern 3: Backgrounds & Surfaces

**Page Backgrounds:**
```tsx
// Before ❌
<div className="bg-white min-h-screen">
  <div className="bg-gray-50">
    Content
  </div>
</div>

// After ✅
<div className="bg-kapwa-bg-surface min-h-screen">
  <div className="bg-kapwa-bg-surface-raised">
    Content
  </div>
</div>
```

**Card Backgrounds:**
```tsx
// Before ❌
<div className="bg-white rounded-lg shadow-md border border-gray-200">
  Card content
</div>

// After ✅
<div className="bg-kapwa-bg-surface-raised rounded-lg shadow-md border border-kapwa-border-weak">
  Card content
</div>
```

---

### Pattern 4: Interactive States

**Hover States:**
```tsx
// Before ❌
<button className="bg-white hover:bg-gray-50 text-gray-900">
  Button
</button>

// After ✅
<button className="bg-kapwa-bg-surface hover:bg-kapwa-bg-hover text-kapwa-text-strong">
  Button
</button>
```

**Focus States:**
```tsx
// Before ❌
<input className="border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200" />

// After ✅
<input className="border border-kapwa-border-weak focus:border-kapwa-border-focus focus:ring-2 focus:ring-kapwa-border-focus/20" />
```

**Active States:**
```tsx
// Before ❌
<button className="bg-gray-100 active:bg-gray-200">
  Active
</button>

// After ✅
<button className="bg-kapwa-bg-hover active:bg-kapwa-bg-active">
  Active
</button>
```

---

### Pattern 5: Badge & Status Indicators

**Document Type Badges:**
```tsx
// Before ❌
<Badge className="bg-blue-100 text-blue-800 border-blue-200">Ordinance</Badge>
<Badge className="bg-orange-100 text-orange-800 border-orange-200">Resolution</Badge>

// After ✅
<Badge variant="primary">Ordinance</Badge>
<Badge variant="secondary">Resolution</Badge>
```

**Status Badges:**
```tsx
// Before ❌
<span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">Active</span>
<span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm">Inactive</span>

// After ✅
<Badge variant="success">Active</Badge>
<Badge variant="error">Inactive</Badge>
```

---

## Common Migrations

### Navigation Pages

**Migration Checklist:**
1. ✅ Replace `bg-white` → `bg-kapwa-bg-surface`
2. ✅ Replace `text-gray-*` → `text-kapwa-text-*`
3. ✅ Replace `border-gray-*` → `border-kapwa-border-*`
4. ✅ Use semantic tokens for status/feedback
5. ✅ Test visual appearance in browser

**Example: Service Detail Page**

```tsx
// Before ❌
<div className="bg-white min-h-screen">
  <div className="max-w-7xl mx-auto px-4 py-8">
    <h1 className="text-3xl font-bold text-gray-900">Service Name</h1>
    <p className="text-gray-600 mt-2">Description</p>

    <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200">
      <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
    </div>
  </div>
</div>

// After ✅
<div className="bg-kapwa-bg-surface min-h-screen">
  <div className="container mx-auto px-4 py-8">
    <h1 className="kapwa-heading-xl text-kapwa-text-strong">Service Name</h1>
    <p className="text-kapwa-text-support mt-2">Description</p>

    <div className="bg-kapwa-bg-surface-raised rounded-lg p-6 mt-6 border border-kapwa-border-weak">
      <h2 className="kapwa-heading-lg text-kapwa-text-strong">Requirements</h2>
    </div>
  </div>
</div>
```

---

### Admin Dashboard Components

**Error Banners:**
```tsx
// Before ❌
<Banner type="error" className="bg-rose-50 border-rose-200">
  <div className="text-rose-600">Error: {error}</div>
</Banner>

// After ✅
<Banner type="error" className="bg-kapwa-red-50 border-kapwa-red-200">
  <div className="text-kapwa-text-danger">Error: {error}</div>
</Banner>
```

**Status Indicators:**
```tsx
// Before ❌
<span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
  Active
</span>

// After ✅
<Badge variant="success" dot>Active</Badge>
```

**Data Tables:**
```tsx
// Before ❌
<table className="min-w-full bg-white border border-gray-200">
  <thead className="bg-gray-50">
    <tr>
      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
    </tr>
  </thead>
  <tbody className="bg-white divide-y divide-gray-200">
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-2 text-sm text-gray-900">Data</td>
    </tr>
  </tbody>
</table>

// After ✅
<table className="min-w-full bg-kapwa-bg-surface border border-kapwa-border-weak">
  <thead className="bg-kapwa-bg-surface-raised">
    <tr>
      <th className="px-4 py-2 text-left kapwa-label-sm text-kapwa-text-disabled uppercase">Name</th>
    </tr>
  </thead>
  <tbody className="bg-kapwa-bg-surface divide-y divide-kapwa-border-weak">
    <tr className="hover:bg-kapwa-bg-hover">
      <td className="px-4 py-2 kapwa-body-sm-default text-kapwa-text-strong">Data</td>
    </tr>
  </tbody>
</table>
```

---

### Statistics Pages

**Chart Containers:**
```tsx
// Before ❌
<div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
  <h3 className="text-lg font-semibold text-gray-900 mb-4">Chart Title</h3>
  <ResponsiveContainer width="100%" height={400}>
    {/* Chart */}
  </ResponsiveContainer>
</div>

// After ✅
<DetailSection title="Chart Title" icon={TrendingUp}>
  <ResponsiveChart height={400}>
    {/* Chart */}
  </ResponsiveChart>
</DetailSection>
```

**Stat Cards:**
```tsx
// Before ❌
<div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
  <div className="text-sm text-gray-500">Population</div>
  <div className="text-2xl font-bold text-gray-900">123,456</div>
</div>

// After ✅
<StatCard
  label="Population"
  value={123456}
  variant="primary"
  trend={{ value: 2.5, positive: true }}
/>
```

---

### Form Components

**Inputs:**
```tsx
// Before ❌
<input
  type="text"
  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
  placeholder="Enter text"
/>

// After ✅
<Input
  type="text"
  className="w-full"
  placeholder="Enter text"
/>

// Or manually:
<input
  type="text"
  className="w-full px-kapwa-sm py-kapwa-sm border border-kapwa-border-weak rounded-md focus:outline-none focus:ring-2 focus:ring-kapwa-border-focus focus:border-kapwa-border-focus"
  placeholder="Enter text"
/>
```

**Labels:**
```tsx
// Before ❌
<label className="block text-sm font-medium text-gray-700 mb-1">Label</label>

// After ✅
<Label className="block mb-1">Label</Label>

// Or manually:
<label className="block kapwa-label-md text-kapwa-text-strong mb-1">Label</label>
```

---

## Component-Specific Guides

### Badge Component

**Status Badges:**
```tsx
// Document types
<Badge variant="primary">Ordinance</Badge>
<Badge variant="secondary">Resolution</Badge>
<Badge variant="yellow">Executive Order</Badge>

// Status indicators
<Badge variant="success" dot>Active</Badge>
<Badge variant="warning">Pending</Badge>
<Badge variant="error">Failed</Badge>
<Badge variant="slate">Draft</Badge>
```

### Card Component

**Variants:**
```tsx
// Default card
<Card variant="default">
  <CardContent>Content</CardContent>
</Card>

// Featured card (brand accent)
<Card variant="featured">
  <CardContent>Important content</CardContent>
</Card>

// Slate card (subtle)
<Card variant="slate">
  <CardContent>Less emphasized</CardContent>
</Card>

// Compact card (tight spacing)
<Card variant="compact">
  <CardContent>Dense content</CardContent>
</Card>
```

### Button Component

**Variants:**
```tsx
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="success">Confirm</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
```

---

## Validation & Testing

### Pre-Migration Checklist

- [ ] Read `KAPWA_SEMANTIC_GUIDE.md`
- [ ] Understand Tailwind v4 prefix rule
- [ ] Know when to use semantic vs raw tokens
- [ ] Identify files to migrate
- [ ] Create feature branch

### Migration Steps

1. **Find violations**
   ```bash
   grep -rn 'bg-gray-\|text-gray-\|border-gray-\|bg-slate-\|text-slate-\|border-slate-\|bg-rose-\|text-rose-\|border-rose-\|bg-emerald-\|text-emerald-\|border-emerald-\|bg-amber-\|text-amber-\|border-amber-' src/your/path
   ```

2. **Apply migrations**
   - Use patterns from this guide
   - Replace raw tokens with semantic equivalents
   - Don't forget Tailwind v4 prefixes (`text-`, `bg-`, `border-`)

3. **Run linter**
   ```bash
   npm run lint
   ```
   - Fix any ESLint errors
   - Ensure zero warnings (`--max-warnings 0`)

4. **Visual testing**
   ```bash
   npm run dev
   ```
   - Open page in browser
   - Verify visual appearance matches expectations
   - Test all interactive states (hover, focus, active)

5. **Accessibility check**
   - Verify color contrast (WCAG AA)
   - Test keyboard navigation
   - Check screen reader output

6. **Commit changes**
   ```bash
   git add .
   git commit -m "feat: migrate [component/page] to Kapwa semantic tokens

   - Replace raw Tailwind colors with Kapwa semantic tokens
   - Apply Tailwind v4 prefix convention (text-*, bg-*, border-*)
   - Ensure consistent styling across application
   - Maintain visual appearance and accessibility"
   ```

### Post-Migration Validation

- [ ] ESLint passes with zero warnings
- [ ] Visual appearance verified in browser
- [ ] All interactive states work correctly
- [ ] Accessibility standards met (WCAG AA)
- [ ] No console errors
- [ ] Tests pass (if applicable)

---

## Troubleshooting

### Issue: "Token doesn't exist"

**Problem:** Using non-existent semantic token

```tsx
// ❌ WRONG - This token doesn't exist
<div className="bg-kapwa-bg-danger-weak text-kapwa-text-danger">Error</div>
```

**Solution:** Use raw colors for backgrounds, semantic for text

```tsx
// ✅ CORRECT
<div className="bg-kapwa-red-50 text-kapwa-text-danger">Error</div>
```

---

### Issue: "Forgot Tailwind v4 prefix"

**Problem:** Missing required prefix

```tsx
// ❌ WRONG - Missing text- prefix
<div className="kapwa-text-strong">Error</div>
```

**Solution:** Add correct prefix

```tsx
// ✅ CORRECT
<div className="text-kapwa-text-strong">Error</div>
```

---

### Issue: "Semantic token for non-semantic purpose"

**Problem:** Using status colors for decoration

```tsx
// ❌ WRONG - Not a success state
<div className="text-kapwa-text-success">Profit chart</div>
```

**Solution:** Use raw colors for data visualization

```tsx
// ✅ CORRECT
<div className="text-kapwa-green-600">Profit chart</div>
```

---

### Issue: "Colors look different after migration"

**Problem:** Mapped token has slightly different shade

**Solution:** This is expected. Semantic tokens map to specific shades for consistency.

- If the difference is minimal, **accept it** (improves consistency)
- If it breaks functionality, use raw color with justification comment
- Document exception in `docs/token-exceptions.md`

---

### Issue: "ESLint errors after migration"

**Problem:** Linter complains about new tokens

**Solution:** Ensure correct syntax

```tsx
// Check for:
// 1. Missing prefixes (text-, bg-, border-)
// 2. Typos in token names
// 3. Using non-existent tokens

// Run: npm run lint
// Fix all errors and warnings
```

---

## Best Practices

### DO ✅

1. **Use semantic tokens for status/feedback**
   ```tsx
   <p className="text-kapwa-text-success">Saved successfully</p>
   <p className="text-kapwa-text-danger">Error occurred</p>
   <p className="text-kapwa-text-warning">Are you sure?</p>
   ```

2. **Apply Tailwind v4 prefixes consistently**
   ```tsx
   <div className="text-kapwa-text-strong bg-kapwa-bg-surface border border-kapwa-border-weak">
   ```

3. **Use Kapwa typography tokens**
   ```tsx
   <h1 className="kapwa-heading-xl">Title</h1>
   <p className="kapwa-body-md-default">Body text</p>
   <label className="kapwa-label-md">Label</label>
   ```

4. **Document exceptions**
   ```tsx
   {/* Exception: Chart data requires specific hex colors - see docs/token-exceptions.md */}
   <Line stroke="#0066eb" strokeWidth={2} />
   ```

---

### DON'T ❌

1. **Don't use raw colors for status/feedback**
   ```tsx
   // ❌
   <div className="text-rose-600">Error</div>
   ```

2. **Don't forget Tailwind v4 prefixes**
   ```tsx
   // ❌
   <div className="kapwa-text-strong">Error</div>
   ```

3. **Don't use non-existent semantic backgrounds**
   ```tsx
   // ❌ - This doesn't exist
   <div className="bg-kapwa-bg-danger-weak">Error</div>
   ```

4. **Don't use semantic tokens for data visualization**
   ```tsx
   // ❌
   <Chart data={{ color: 'text-kapwa-text-success' }} />
   ```

---

## Resources

### Documentation

- **KAPWA_SEMANTIC_GUIDE.md** - Quick reference for semantic tokens
- **BetterLB-Design-System-Guide.md** - Comprehensive design system documentation
- **ARCHITECTURE.md** - Project architecture and standards
- **CLAUDE.md** - Development guidelines and patterns

### Strategy & Planning

- **Kapwa Semantic Token Consolidation Strategy** (`docs/plans/2026-03-02-kapwa-semantic-token-consolidation-strategy.md`)
- **Navigation Design System Spec** (`docs/navigation-design-system-spec.md`)

### Related Tasks

- **T-128:** Migrate navigation pages to Kapwa semantic tokens (COMPLETE)
- **T-121:** Design Kapwa semantic token consolidation strategy (COMPLETE)
- **T-073:** Design System Compliance Audit (COMPLETE)

---

## Quick Reference Card

### Text Colors

| Purpose | Token |
|---------|-------|
| Headings | `text-kapwa-text-strong` |
| Body text | `text-kapwa-text-support` |
| Disabled | `text-kapwa-text-disabled` |
| Links | `text-kapwa-text-link` |
| Success | `text-kapwa-text-success` |
| Error | `text-kapwa-text-danger` |
| Warning | `text-kapwa-text-warning` |
| Info | `text-kapwa-text-info` |

### Backgrounds

| Purpose | Token |
|---------|-------|
| Default | `bg-kapwa-bg-surface` |
| Cards | `bg-kapwa-bg-surface-raised` |
| Dark/Footer | `bg-kapwa-bg-surface-bold` |
| Hover | `bg-kapwa-bg-hover` |
| Disabled | `bg-kapwa-bg-disabled` |

### Borders

| Purpose | Token |
|---------|-------|
| Default | `border-kapwa-border-weak` |
| Strong | `border-kapwa-border-strong` |
| Focus | `border-kapwa-border-focus` |

---

## Migration Command Reference

### Find Raw Token Usage

```bash
# Find all raw color tokens
grep -rn 'bg-gray-\|text-gray-\|border-gray-\
\|bg-slate-\|text-slate-\|border-slate-\
\|bg-rose-\|text-rose-\|border-rose-\
\|bg-emerald-\|text-emerald-\|border-emerald-\
\|bg-amber-\|text-amber-\|border-amber-' src/

# Find missing Tailwind v4 prefixes
grep -rn 'kapwa-text-\|kapwa-bg-\|kapwa-border-' src/ \
  | grep -v 'text-kapwa-text-\|bg-kapwa-bg-\|border-kapwa-border-'
```

### Count Kapwa Token Usage

```bash
# Count semantic tokens
grep -r 'text-kapwa-\|bg-kapwa-\|border-kapwa-' src/ | wc -l
```

---

## Example: Complete Page Migration

### Before Migration

```tsx
// src/pages/services/example.tsx
export default function ExamplePage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-gray-900">Example Page</h1>
        <p className="text-gray-600 mt-2">This is an example page</p>

        <div className="bg-gray-50 rounded-lg p-6 mt-6 border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Section Title</h2>
          <p className="text-gray-700 mt-2">Section content</p>

          <div className="bg-green-50 border border-green-200 rounded p-4 mt-4">
            <p className="text-green-600">Success message</p>
          </div>
        </div>
      </div>
    </div>
  );
}
```

### After Migration

```tsx
// src/pages/services/example.tsx
import { PageHero, DetailSection } from '@/components/layout/PageLayouts';
import { Badge } from '@/components/ui/Badge';

export default function ExamplePage() {
  return (
    <div className="bg-kapwa-bg-surface min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <PageHero
          title="Example Page"
          description="This is an example page"
        />

        <DetailSection title="Section Title" icon={InfoIcon}>
          <p className="text-kapwa-text-support mt-2">Section content</p>

          <div className="bg-kapwa-green-50 border border-kapwa-green-200 rounded p-4 mt-4">
            <p className="text-kapwa-text-success">Success message</p>
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
```

**Changes:**
1. `bg-white` → `bg-kapwa-bg-surface`
2. `max-w-7xl mx-auto` → `container` (standardized)
3. `text-gray-900` → `text-kapwa-text-strong`
4. `text-gray-600` → `text-kapwa-text-support`
5. `bg-gray-50` → `bg-kapwa-bg-surface-raised`
6. `border-gray-200` → `border-kapwa-border-weak`
7. `text-green-600` → `text-kapwa-text-success`
8. Used documented components (`PageHero`, `DetailSection`)

---

## Conclusion

This migration guide provides practical patterns for migrating components and pages to Kapwa semantic tokens. Remember:

1. **Semantic tokens convey meaning** (success, error, warning)
2. **Raw colors are for decoration** (data visualization, decorative styling)
3. **Always use Tailwind v4 prefixes** (`text-`, `bg-`, `border-`)
4. **Test thoroughly** after migration
5. **Document exceptions** when necessary

For questions or issues, refer to:
- `KAPWA_SEMANTIC_GUIDE.md` - Quick reference
- `BetterLB-Design-System-Guide.md` - Comprehensive guide
- `docs/plans/2026-03-02-kapwa-semantic-token-consolidation-strategy.md` - Strategy and governance

---

**Version:** 1.0.0
**Last Updated:** 2026-03-03
**Maintained By:** BetterLB Development Team
**Task:** T-136

---

## Changelog

### v1.0.0 (2026-03-03)
- Initial migration guide
- Comprehensive patterns for common migrations
- Component-specific guides
- Validation and troubleshooting sections
- Complete page migration example
