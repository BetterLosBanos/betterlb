# Kapwa Semantic Token Quick Reference

## Philosophy: Semantic vs Raw Colors

**CRITICAL:** Use semantic tokens ONLY for their actual semantic purpose.

| Type | When to Use | Examples |
|------|-------------|----------|
| **Semantic** | Status/feedback conveying meaning | `text-kapwa-text-success`, `text-kapwa-text-danger` |
| **Raw** | Decorative, data viz, non-semantic styling | `bg-kapwa-green-50`, `text-kapwa-blue-600` |

**Rule:** If the color conveys success/error/warning/info → use semantic. If it's just visual decoration or data → use raw colors.

---

## Class Naming Rules

Kapwa semantic classes MUST use Tailwind v4 prefixes:

| Type | Prefix | Example |
|------|--------|---------|
| Text Colors | `text-` | `text-kapwa-text-strong` |
| Backgrounds | `bg-` | `bg-kapwa-bg-surface` |
| Borders | `border-` | `border-kapwa-border-weak` |

---

## TEXT COLORS

### Hierarchy
```tsx
<h1 className="kapwa-heading text-kapwa-text-strong">Main Heading</h1>
<p className="kapwa-body text-kapwa-text-support">Supporting information</p>
<span className="text-kapwa-text-disabled">Disabled option</span>
```

### Links
```tsx
<a className="text-kapwa-text-link hover:text-kapwa-text-link-hover">Link</a>
```

### Brand
```tsx
<span className="text-kapwa-text-brand">Brand colored</span>
<strong className="text-kapwa-text-brand-bold">Bold brand</strong>
```

### Status (ONLY for actual status/feedback)
```tsx
<p className="text-kapwa-text-success">Operation successful!</p>
<p className="text-kapwa-text-danger">Error occurred</p>
<p className="text-kapwa-text-warning">Please be careful</p>
<p className="text-kapwa-text-info">For your information</p>
```

---

## BACKGROUND COLORS

### Surfaces
```tsx
<div className="bg-kapwa-bg-surface">Default background</div>
<div className="bg-kapwa-bg-surface-raised">Card background</div>
<div className="bg-kapwa-bg-surface-bold">
  <p className="text-kapwa-text-inverse">White text on dark</p>
</div>
```

### Interactive States
```tsx
<button className="bg-kapwa-bg-surface hover:bg-kapwa-bg-hover">
  Hover me
</button>
```

### Brand Backgrounds
```tsx
<button className="bg-kapwa-bg-brand-default hover:bg-kapwa-bg-brand-hover">
  Primary Action
</button>
<div className="bg-kapwa-bg-brand-weak">Subtle brand section</div>
```

### Status Backgrounds - USE RAW COLORS
**IMPORTANT:** `bg-kapwa-bg-success-weak` etc. DO NOT exist. Use raw colors:

```tsx
// Success - use green scale
<div className="bg-kapwa-green-50 border border-kapwa-green-200">
  <p className="text-kapwa-text-success">Success message!</p>
</div>

// Error - use red scale
<div className="bg-kapwa-red-50 border border-kapwa-red-200">
  <p className="text-kapwa-text-danger">Error message!</p>
</div>

// Warning - use orange scale
<div className="bg-kapwa-orange-50 border border-kapwa-orange-200">
  <p className="text-kapwa-text-warning">Warning message!</p>
</div>

// Info - use blue scale
<div className="bg-kapwa-blue-50 border border-kapwa-blue-200">
  <p className="text-kapwa-text-info">Info message!</p>
</div>
```

---

## BORDER COLORS

```tsx
<div className="border border-kapwa-border-weak">Default border</div>
<div className="border border-kapwa-border-strong">Emphasized border</div>
<div className="border border-kapwa-border-brand">Brand border</div>
```

### Status Borders - USE RAW COLORS
```tsx
<div className="border border-kapwa-green-300">Success</div>
<div className="border border-kapwa-red-300">Error</div>
<div className="border border-kapwa-orange-300">Warning</div>
```

---

## COMPLETE COLOR REFERENCE

### Raw Color Scales (50-950)

| Scale | Use For |
|-------|---------|
| `kapwa-brand-*` | Brand colors, primary actions |
| `kapwa-red-*` | Errors, destructive, data viz |
| `kapwa-green-*` | Success states, positive trends |
| `kapwa-yellow-*` | Warnings, highlights |
| `kapwa-orange-*` | Warnings, secondary brand |
| `kapwa-blue-*` | Info, links |
| `kapwa-gray-*` | Neutral borders, dividers |
| `kapwa-neutral-*` | Neutral backgrounds, text |

### Semantic Text Mapping

| Token | Raw Color |
|-------|-----------|
| `text-kapwa-text-strong` | Gray/950 |
| `text-kapwa-text-support` | Gray/700 |
| `text-kapwa-text-disabled` | Gray/500 |
| `text-kapwa-text-inverse` | Neutral/50 |
| `text-kapwa-text-brand` | Brand/600 |
| `text-kapwa-text-success` | Green/600 |
| `text-kapwa-text-danger` | Red/600 |
| `text-kapwa-text-warning` | Orange/600 |
| `text-kapwa-text-info` | Blue/600 |

---

## COMMON MISTAKES

```tsx
// ❌ DON'T: Use non-existent semantic backgrounds
<div className="bg-kapwa-bg-danger-weak text-kapwa-text-danger">Error</div>

// ✅ DO: Use raw colors for backgrounds
<div className="bg-kapwa-red-50 text-kapwa-text-danger">Error</div>

// ❌ DON'T: Use semantic colors for non-semantic purposes
<div className="text-kapwa-text-success">Profit chart</div>

// ✅ DO: Use raw colors for data visualization
<div className="text-kapwa-green-600">Profit chart</div>
```

---

For full component examples and patterns, see `docs/BetterLB-Design-System-Guide.md`.
