# Barangay Page Redesign Design Document

**Date:** 2026-02-16
**Status:** Approved
**Designer:** Claude (with user input)

---

## Executive Summary

Redesign the barangay detail page to be **modern, professional, clean minimal, and compact/grid-focused** while maintaining **WCAG 2.1 Level AA accessibility compliance**.

**Key metrics:**
- 40% reduction in page height (1500px → 900px)
- Unified visual language across all officials
- Improved scannability with consistent grid layout
- Full keyboard navigation and screen reader support

---

## Design Philosophy

### "Civic Registry" Aesthetic

Treat barangay officials with the dignity of a public registry—clean, structured, authoritative. Think digital government plaques.

**Design principles:**
1. **Neutral palette with restrained brand use** - hierarchy through size/spacing, not color
2. **One card pattern** - every official follows the same component structure
3. **Generous whitespace within tight overall height** - breathing room without scrolling fatigue
4. **Accessibility-first** - semantic HTML, keyboard navigation, screen reader support

---

## Visual Specifications

### Color System

**Remove all color accents except:**
- **Brand (`border-kapwa-border-brand`, `text-kapwa-text-brand`)** - Punong Barangay seal, hover states only
- **Neutral** - everything else: `text-kapwa-text-strong`, `text-kapwa-text-support`, `text-kapwa-text-disabled`

| Purpose | Token | Usage |
|---------|-------|-------|
| Primary text | `text-kapwa-text-strong` | Official names, headings |
| Secondary text | `text-kapwa-text-support` | Roles, labels |
| Muted text | `text-kapwa-text-disabled` | Section labels, meta info |
| Brand accent | `text-kapwa-text-brand` | PB seal, hover states |
| Borders | `border-kapwa-border-weak` | Default card borders |
| Borders (hover) | `border-kapwa-border-brand` | Interactive states |
| Backgrounds | `bg-kapwa-bg-surface` | Card backgrounds |
| Backgrounds (hover) | `bg-kapwa-bg-surface-raised` | Interactive states |

**Contrast ratios (WCAG AA compliance):**
- All text on white: ≥4.5:1
- Large text (18px+): ≥3:1
- Focus indicators: 3:1 against background

### Typography

| Element | Class | Size | Weight |
|---------|-------|------|--------|
| Header title | `kapwa-heading-lg` | 1.5rem (24px) | 800 |
| Section label | `text-[10px] font-bold tracking-widest uppercase` | 10px | 700 |
| Official name | `text-sm font-bold` | 14px | 700 |
| Role label | `text-[10px] font-bold tracking-widest uppercase` | 10px | 700 |
| Contact info | `text-sm` | 14px | 400 |

All text uses Kapwa semantic tokens for consistency and theming support.

### Spacing

**Card padding:** `px-4 py-0` (standard card), `px-6 py-4` (Punong Barangay)

**Grid gaps:** `gap-3` (12px) between cards, `gap-6` (24px) between sections

**Section spacing:** `space-y-6` (24px) vertical rhythm

**Touch targets:** All interactive elements minimum 44×44px (WCAG AAA)

---

## Component Structure

```
BarangayDetail
├── IdentityHeader (compact card)
└── OfficialsSection (unified)
    ├── SectionLabel ("Chief Executive")
    ├── PunongBarangayCard (prominent)
    ├── SectionLabel ("Sangguniang Barangay")
    ├── OfficialCard[] (grid of 6-8)
    ├── SectionLabel ("Sangguniang Kabataan")
    ├── OfficialCard[] (grid of 7-8)
    └── SectionLabel ("Barangay Administration")
        └── OfficialCard[] (side-by-side)
```

---

## Component Specifications

### 1. Identity Header (Compact Card)

**Purpose:** Establish barangay identity in minimal vertical space.

**Dimensions:** ~120px height (vs current ~200px)

**Layout:**
```
┌─────────────────────────────────────────────────────────────────┐
│ [📍] Barangay Anonas                             [Official Profile]│
│      Anonas Street, Los Baños, Laguna                            │
│      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│      Phone: 049-xxx-xxxx  |  Facebook: View Page                 │
└─────────────────────────────────────────────────────────────────┘
```

**Accessibility:**
- Semantic `<header>` element with `role="banner"`
- `aria-label="Barangay information header"`
- Contact links have `aria-label` describing purpose
- Map icon has `aria-hidden="true"` (decorative)

**Styling:**
```tsx
className="bg-kapwa-bg-surface border border-kapwa-border-weak rounded-xl p-6 shadow-sm"
```

### 2. Officials Section

**Purpose:** Unified section for all officials with subtle grouping.

**Layout:** Single container with label + subsections

**Accessibility:**
- `<section>` with `aria-labelledby="officials-heading"`
- `h2` with `id="officials-heading"`
- Section labels use visually hidden + visible pattern for screen readers
- Each subsection has `role="group"` with `aria-label`

**Styling:**
```tsx
// Section header
<div className="flex items-center gap-2 border-b border-kapwa-border-weak pb-3">
  <UsersIcon aria-hidden="true" className="text-kapwa-text-disabled h-4 w-4" />
  <h2 id="officials-heading" className="kapwa-heading-md text-kapwa-text-strong">
    Barangay Officials
  </h2>
</div>

// Subsection label
<p className="sr-only">Chief Executive</p>
<p className="text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase">
  Chief Executive
</p>
```

### 3. Standard Official Card

**Purpose:** Consistent card for all non-chief-executive officials.

**Dimensions:** 80px height, full width

**Layout:**
```
┌────────────────────────────────────┐
│ [icon]  Maria Santos               │
│         Barangay Kagawad           │
└────────────────────────────────────┘
```

**Accessibility:**
- `<article>` with `role="article"`
- `aria-label="{role} - {name}"`
- Icon has `aria-hidden="true"`
- Name is heading level 3 (`h3`) for document structure
- Keyboard focus visible with `ring-2 ring-kapwa-border-focus ring-offset-2`

**Hover/Focus states:**
- Border: `border-kapwa-border-weak` → `border-kapwa-border-brand`
- Background: `bg-kapwa-bg-surface` → `bg-kapwa-bg-surface-raised`
- Icon color: `text-kapwa-text-support` → `text-kapwa-text-brand`
- Shadow: `shadow-sm` → `shadow-md`

**Styling:**
```tsx
<Card
  hover
  className="group h-20 transition-all focus-within:ring-2 focus-within:ring-kapwa-border-focus focus-within:ring-offset-2"
>
  <CardContent className="flex h-full items-center gap-3 px-4 py-0">
    <Icon aria-hidden="true" className="text-kapwa-text-support group-hover:text-kapwa-text-brand h-5 w-5 shrink-0 transition-colors" />
    <div className="min-w-0 flex-1">
      <h3 className="text-kapwa-text-strong truncate text-sm font-bold">
        {toTitleCase(official.name)}
      </h3>
      <p className="text-kapwa-text-support text-[10px] font-bold tracking-widest uppercase">
        {role}
      </p>
    </div>
  </CardContent>
</Card>
```

### 4. Punong Barangay Card (Prominent Variant)

**Purpose:** Emphasize chief executive while maintaining system consistency.

**Dimensions:** 120px height, full width

**Layout (centered):**
```
┌────────────────────────────────────────┐
│         [seal]                         │
│    Hon. Juan Dela Cruz  [Punong Barangay]│
└────────────────────────────────────────┘
```

**Accessibility:**
- `<article>` with `role="article"` and `aria-label="Punong Barangay - {name}"`
- Larger touch target (120px vs 80px)
- Name is `h2` (higher heading level for importance)
- Badge has `aria-label="Position: Punong Barangay"`

**Differentiation:**
- Seal: Brand color background (`bg-kapwa-bg-brand-weak`, `text-kapwa-text-brand`)
- Layout: Centered vs left-aligned
- Height: 120px vs 80px
- Typography: Larger name (lg vs sm)

**Styling:**
```tsx
<Card className="h-30 border-kapwa-border-brand" variant="default">
  <CardContent className="flex h-full flex-col items-center justify-center gap-2 px-6 py-4 text-center">
    <div className="bg-kapwa-bg-brand-weak text-kapwa-text-brand border-kapwa-border-brand flex h-12 w-12 items-center justify-center rounded-full border-2">
      <UserIcon aria-hidden="true" className="h-6 w-6" />
    </div>
    <div className="min-w-0">
      <h2 className="text-kapwa-text-strong text-lg font-black">
        Hon. {toTitleCase(official.name)}
      </h2>
      <Badge variant="primary" className="mt-1" aria-label="Position: Punong Barangay">
        Punong Barangay
      </Badge>
    </div>
  </CardContent>
</Card>
```

---

## Responsive Grid Breakpoints

| Screen Size | Kagawad Grid | SK Grid | Admin Grid | Header |
|-------------|--------------|---------|------------|--------|
| Mobile (<768px) | 1 col | 1 col | 1 col | Stacked |
| Tablet (768-1280px) | 2 cols | 2 cols | 2 cols | Stacked |
| Desktop (≥1280px) | 3 cols | 3 cols | 2 cols | Inline |

**Tailwind classes:**
```tsx
// Kagawads/SK
className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3"

// Admin
className="grid grid-cols-1 gap-3 md:grid-cols-2"

// Header contact
className="flex flex-col gap-4 md:flex-row md:gap-6"
```

---

## Accessibility Specifications

### Keyboard Navigation

**Tab order:**
1. Breadcrumb links
2. Header contact links (Phone, Facebook)
3. Punong Barangay card (if clickable)
4. Kagawad cards (left-to-right, top-to-bottom)
5. SK cards (left-to-right, top-to-bottom)
6. Admin cards (left-to-right)

**Focus indicators:**
- All interactive elements: `ring-2 ring-kapwa-border-focus ring-offset-2`
- Minimum visible area: 2px outline with 4×4px minimum
- Focus never hidden or obscured

**Skip links:**
```tsx
<a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-kapwa-bg-surface focus:text-kapwa-text-strong focus:ring-2 focus:ring-kapwa-border-focus">
  Skip to main content
</a>
```

### Screen Reader Support

**Heading structure:**
```
h1: Barangay name (in header)
h2: Barangay Officials (section)
h3: Official names (card headings)
```

**ARIA attributes:**
- `aria-label` on all cards describing content
- `aria-hidden="true"` on decorative icons
- `aria-labelledby` for section associations
- `role="article"` on each official card

**Live regions:**
- None needed (static content)

### Visual Accessibility

**High contrast mode support:**
- All borders darken in `@media (prefers-contrast: high)`
- Text maintains minimum 4.5:1 contrast ratio

**Reduced motion support:**
```tsx
className="transition-all duration-200 motion-reduce:transition-none"
```

**Text scaling:**
- All units use `rem` for scalability
- Layout supports 200% zoom without horizontal scroll

**Color blindness:**
- Information never conveyed by color alone
- Icons + text labels for all roles
- Border thickness varies (PB: 2px, others: 1px)

### Motor Accessibility

**Touch targets:**
- Minimum 44×44px for all interactive elements
- Cards: 80px height (full-width tap target)
- Contact links: Padded to 44px minimum

**Error prevention:**
- N/A (informational page)

---

## Animation & Interaction

### Page Load

**Staggered fade-in:**
```tsx
<div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
  {/* Content */}
</div>
```

**Sequence:**
1. Header (0ms delay)
2. Punong Barangay (100ms delay)
3. Sangguniang Barangay (200ms delay)
4. SK (300ms delay)
5. Admin (400ms delay)

### Card Hover

**Transition:** All properties 200ms ease-out

**State changes:**
- Border color: weak → brand
- Background: surface → surface-raised
- Icon color: support → brand
- Shadow: sm → md

**Motion reduction:**
```tsx
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## File Modifications

### Files to Create

1. **`src/components/government/OfficialCard.tsx`**
   - Standard official card component
   - Props: `official`, `role`, `icon`, `variant?`
   - Exports: `OfficialCard`, `PunongBarangayCard`

2. **`src/components/government/BarangayHeader.tsx`**
   - Compact identity header
   - Props: `barangay`
   - Uses existing `ContactItem`, `ContactContainer`

### Files to Modify

1. **`src/pages/government/barangays/[barangay].tsx`**
   - Replace entire implementation
   - Use new components
   - Maintain data fetching logic

### Files to Update (Accessibility)

1. **`src/components/ui/Card.tsx`**
   - Add `focus-within` ring styles
   - Ensure keyboard navigation works

---

## Testing Checklist

### Visual Testing
- [ ] Hero reduced to ~120px
- [ ] All cards same height (except PB)
- [ ] Grid displays correctly at all breakpoints
- [ ] Hover states work consistently
- [ ] No color accents except brand on PB/hover

### Accessibility Testing
- [ ] Keyboard navigation works end-to-end
- [ ] Focus indicators visible on all interactive elements
- [ ] Screen reader announces all content correctly
- [ ] Heading structure is logical (h1 → h2 → h3)
- [ ] Touch targets minimum 44×44px
- [ ] Contrast ratios meet WCAG AA
- [ ] Reduced motion respected

### Browser Testing
- [ ] Chrome/Edge (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Mobile iOS Safari
- [ ] Mobile Chrome

### Screen Reader Testing
- [ ] NVDA (Firefox)
- [ ] JAWS (Chrome)
- [ ] VoiceOver (Safari)

---

## Implementation Notes

1. **Maintain existing data fetching** - no API changes
2. **Preserve breadcrumb** - keeps navigation context
3. **Keep Kapwa tokens** - design system consistency
4. **Test with real data** - some barangays may have incomplete officials
5. **Mobile-first** - design for mobile, enhance for desktop

---

## Success Criteria

- [ ] Page height reduced by ~40% (1500px → 900px)
- [ ] All officials use unified card component
- [ ] WCAG 2.1 Level AA compliance verified
- [ ] Keyboard navigation works without mouse
- [ ] Screen reader testing passes
- [ ] Visual design matches "clean minimal" aesthetic
- [ ] Zero ESLint warnings
- [ ] No performance regression (Lighthouse score maintained)

---

## References

- WCAG 2.1 Guidelines: https://www.w3.org/WAI/WCAG21/quickref/
- Kapwa Design System: `/KAPWA_SEMANTIC_GUIDE.md`
- Current implementation: `/src/pages/government/barangays/[barangay].tsx`
