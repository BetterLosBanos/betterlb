# Barangay Page Redesign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Redesign the barangay detail page to be modern, professional, clean minimal, and compact/grid-focused while maintaining WCAG 2.1 Level AA accessibility compliance.

**Architecture:** Replace the current multi-section layout with a unified officials section using a single card component pattern. Create reusable OfficialCard and PunongBarangayCard components, and a compact BarangayHeader. All officials use consistent styling with hierarchy through size/spacing rather than color differentiation.

**Tech Stack:** React 19, TypeScript, Tailwind CSS v4, Kapwa Design System (@betterlb/kapwa), Lucide React icons

---

## Task 1: Create OfficialCard Component (Standard)

**Files:**
- Create: `src/components/government/OfficialCard.tsx`

**Step 1: Write the component**

```tsx
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { toTitleCase } from '@/lib/stringUtils';

interface OfficialCardProps {
  official: {
    name: string;
    role?: string;
  };
  role: string;
  icon: LucideIcon;
}

export function OfficialCard({ official, role, icon: Icon }: OfficialCardProps) {
  return (
    <Card
      hover
      className="group h-20 transition-all focus-within:ring-2 focus-within:ring-kapwa-border-focus focus-within:ring-offset-2"
    >
      <CardContent className="flex h-full items-center gap-3 px-4 py-0">
        <Icon
          aria-hidden="true"
          className="text-kapwa-text-support group-hover:text-kapwa-text-brand h-5 w-5 shrink-0 transition-colors"
        />
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
  );
}
```

**Step 2: Export the component**

The component is already exported. No additional action needed.

**Step 3: Run linter to verify**

Run: `npx eslint src/components/government/OfficialCard.tsx --max-warnings 0`
Expected: No errors

**Step 4: Commit**

```bash
git add src/components/government/OfficialCard.tsx
git commit -m "feat: add OfficialCard component

- Standard card for barangay officials
- 80px height, icon + name + role layout
- Hover states with brand color
- Focus ring for keyboard navigation
- ARIA attributes for screen readers"
```

---

## Task 2: Create PunongBarangayCard Component

**Files:**
- Create: `src/components/government/OfficialCard.tsx` (extend existing file)

**Step 1: Add PunongBarangayCard to existing file**

Add to `src/components/government/OfficialCard.tsx`:

```tsx
import { UserIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

// ... existing OfficialCard component ...

interface PunongBarangayCardProps {
  official: {
    name: string;
  };
}

export function PunongBarangayCard({ official }: PunongBarangayCardProps) {
  return (
    <Card className="h-30 border-kapwa-border-brand" variant="default">
      <CardContent className="flex h-full flex-col items-center justify-center gap-2 px-6 py-4 text-center">
        <div className="bg-kapwa-bg-brand-weak text-kapwa-text-brand border-kapwa-border-brand flex h-12 w-12 items-center justify-center rounded-full border-2">
          <UserIcon aria-hidden="true" className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h2 className="text-kapwa-text-strong text-lg font-black">
            Hon. {toTitleCase(official.name)}
          </h2>
          <Badge
            variant="primary"
            className="mt-1"
            aria-label="Position: Punong Barangay"
          >
            Punong Barangay
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
```

**Step 2: Run linter to verify**

Run: `npx eslint src/components/government/OfficialCard.tsx --max-warnings 0`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/government/OfficialCard.tsx
git commit -m "feat: add PunongBarangayCard component

- Prominent card for chief executive
- 120px height, centered layout
- Brand color seal for emphasis
- h2 heading for document structure"
```

---

## Task 3: Create BarangayHeader Component

**Files:**
- Create: `src/components/government/BarangayHeader.tsx`

**Step 1: Write the component**

```tsx
import { MapPinIcon } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import { PhoneIcon, GlobeIcon } from 'lucide-react';
import { toTitleCase } from '@/lib/stringUtils';

interface BarangayHeaderProps {
  barangay: {
    barangay_name: string;
    address?: string;
    trunkline?: string[];
    website?: string;
  };
}

export function BarangayHeader({ barangay }: BarangayHeaderProps) {
  const contactValue = Array.isArray(barangay.trunkline)
    ? barangay.trunkline[0]
    : barangay.trunkline;

  return (
    <header
      className="bg-kapwa-bg-surface border border-kapwa-border-weak rounded-xl p-6 shadow-sm"
      role="banner"
      aria-label="Barangay information header"
    >
      {/* Top Row: Name + Badge */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-3">
          <MapPinIcon
            aria-hidden="true"
            className="text-kapwa-text-brand h-5 w-5"
          />
          <h1 className="kapwa-heading-lg text-kapwa-text-strong">
            Barangay{' '}
            {toTitleCase(
              barangay.barangay_name.replace('BARANGAY ', '')
            )}
          </h1>
        </div>
        <Badge variant="secondary" dot>
          Official Profile
        </Badge>
      </div>

      {/* Middle: Address */}
      {barangay.address && (
        <p className="text-kapwa-text-support mb-4 text-sm">
          {barangay.address}, Los Baños, Laguna
        </p>
      )}

      {/* Bottom: Contact Row */}
      <ContactContainer variant="inline" className="gap-6 text-sm">
        <ContactItem
          icon={PhoneIcon}
          label=""
          value={contactValue}
          inline
        />
        <ContactItem
          icon={GlobeIcon}
          label=""
          value={barangay.website ? 'Facebook' : undefined}
          href={barangay.website}
          isExternal
          inline
        />
      </ContactContainer>
    </header>
  );
}
```

**Step 2: Run linter to verify**

Run: `npx eslint src/components/government/BarangayHeader.tsx --max-warnings 0`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/government/BarangayHeader.tsx
git commit -m "feat: add BarangayHeader component

- Compact identity header (~120px height)
- Inline contact layout
- Semantic HTML with role=\"banner\"
- ARIA labels for screen readers"
```

---

## Task 4: Update Barangay Detail Page - New Layout

**Files:**
- Modify: `src/pages/government/barangays/[barangay].tsx`

**Step 1: Replace imports**

Replace the existing imports at the top of the file with:

```tsx
import { useParams } from 'react-router-dom';
import {
  Briefcase,
  GraduationCapIcon,
  UserIcon,
  UsersIcon,
} from 'lucide-react';
import {
  ContactContainer,
  ContactItem,
} from '@/components/data-display/ContactInfo';
import {
  Breadcrumb,
  BreadcrumbHome,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/navigation/Breadcrumb';
import { BarangayHeader } from '@/components/government/BarangayHeader';
import { OfficialCard, PunongBarangayCard } from '@/components/government/OfficialCard';
import { toTitleCase } from '@/lib/stringUtils';
import barangaysData from '@/data/directory/barangays.json';
```

**Step 2: Replace the component body**

Replace the entire return statement with:

```tsx
return (
  <div className="animate-in fade-in space-y-6 pb-20 duration-500">
    {/* Skip Link for Accessibility */}
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-kapwa-bg-surface focus:text-kapwa-text-strong focus:ring-2 focus:ring-kapwa-border-focus"
    >
      Skip to main content
    </a>

    {/* --- BREADCRUMBS --- */}
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbHome href="/" />
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/government/barangays">
            Barangays
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>
            {toTitleCase(barangay.barangay_name.replace('BARANGAY ', ''))}
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>

    {/* --- COMPACT IDENTITY HEADER --- */}
    <BarangayHeader barangay={barangay} />

    {/* --- OFFICIALS SECTION (Unified) --- */}
    <main id="main-content" className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-2 border-b border-kapwa-border-weak pb-3">
        <UsersIcon aria-hidden="true" className="text-kapwa-text-disabled h-4 w-4" />
        <h2
          id="officials-heading"
          className="kapwa-heading-md text-kapwa-text-strong"
        >
          Barangay Officials
        </h2>
      </div>

      {/* Punong Barangay */}
      {punongBarangay && (
        <div className="space-y-2" role="group" aria-label="Chief Executive">
          <p className="sr-only">Chief Executive</p>
          <p className="text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase">
            Chief Executive
          </p>
          <PunongBarangayCard official={punongBarangay} />
        </div>
      )}

      {/* Sangguniang Barangay */}
      <div
        className="space-y-2"
        role="group"
        aria-label="Sangguniang Barangay"
      >
        <p className="sr-only">Sangguniang Barangay</p>
        <p className="text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase">
          Sangguniang Barangay
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
          {kagawads?.map(kagawad => (
            <OfficialCard
              key={kagawad.name}
              official={kagawad}
              role="Barangay Kagawad"
              icon={UsersIcon}
            />
          ))}
        </div>
      </div>

      {/* Sangguniang Kabataan */}
      {skOfficials && skOfficials.length > 0 && (
        <div
          className="space-y-2"
          role="group"
          aria-label="Sangguniang Kabataan"
        >
          <p className="sr-only">Sangguniang Kabataan</p>
          <p className="text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase">
            Sangguniang Kabataan
          </p>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {skOfficials.map(sk => (
              <OfficialCard
                key={sk.name}
                official={sk}
                role={sk.role.replace('SK ', '')}
                icon={GraduationCapIcon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Barangay Administration */}
      <div
        className="space-y-2"
        role="group"
        aria-label="Barangay Administration"
      >
        <p className="sr-only">Barangay Administration</p>
        <p className="text-kapwa-text-disabled pl-1 text-[10px] font-bold tracking-widest uppercase">
          Barangay Administration
        </p>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {secretary && (
            <OfficialCard
              official={secretary}
              role="Barangay Secretary"
              icon={Briefcase}
            />
          )}
          {treasurer && (
            <OfficialCard
              official={treasurer}
              role="Barangay Treasurer"
              icon={Briefcase}
            />
          )}
        </div>
      </div>
    </main>
  </div>
);
```

**Step 3: Run linter to verify**

Run: `npx eslint src/pages/government/barangays/[barangay].tsx --max-warnings 0`
Expected: No errors

**Step 4: Commit**

```bash
git add src/pages/government/barangays/[barangay].tsx
git commit -m "feat: redesign barangay page with unified layout

- Replace multi-section layout with unified officials section
- Use OfficialCard and PunongBarangayCard components
- Add BarangayHeader for compact identity display
- Add skip link for accessibility
- Semantic HTML with proper ARIA attributes
- Reduced page height by ~40%"
```

---

## Task 5: Add Focus Styles to Card Component

**Files:**
- Modify: `src/components/ui/Card.tsx`

**Step 1: Update Card className to include focus styles**

Find the Card component definition and update the base className to include focus-within styles.

Look for the line that defines the Card container className and add:

```tsx
className={cn(
  "focus-within:ring-2 focus-within:ring-kapwa-border-focus focus-within:ring-offset-2 transition-all",
  // ... existing classes
)}
```

**Step 2: Run linter to verify**

Run: `npx eslint src/components/ui/Card.tsx --max-warnings 0`
Expected: No errors

**Step 3: Commit**

```bash
git add src/components/ui/Card.tsx
git commit -m "a11y: add focus ring styles to Card component

- Ensures keyboard navigation is visible
- Meets WCAG 2.1 focus indicator requirements"
```

---

## Task 6: Manual Testing - Visual Verification

**Files:**
- None (manual testing)

**Step 1: Start dev server**

Run: `npm run dev`

**Step 2: Navigate to barangay page**

Open: `http://localhost:5173/government/barangays/anonas` (or any barangay)

**Step 3: Verify visual design**

Checklist:
- [ ] Header is compact (~120px height)
- [ ] All officials cards same height (except Punong Barangay)
- [ ] Punong Barangay card is larger with centered layout
- [ ] Grid displays correctly (3 columns on desktop, 2 on tablet, 1 on mobile)
- [ ] Hover states work on all cards
- [ ] Only brand color is Punong Barangay seal and hover states
- [ ] No orange or secondary accent colors visible

**Step 4: Verify responsive breakpoints**

- Resize browser to mobile (<768px): Should be 1 column
- Resize to tablet (768-1280px): Should be 2 columns
- Resize to desktop (≥1280px): Should be 3 columns

**Step 5: Take screenshots**

Take screenshots for documentation (optional but recommended).

---

## Task 7: Manual Testing - Accessibility

**Files:**
- None (manual testing)

**Step 1: Keyboard navigation test**

1. Press `Tab` from top of page
2. Verify focus moves: Skip link → Breadcrumb → Header contact → Punong Barangay → Kagawads → SK → Admin
3. Verify focus indicator is visible (ring around card)
4. Press `Enter` on any link - should navigate

**Step 2: Screen reader test**

Using NVDA (Windows+Firefox), JAWS (Windows+Chrome), or VoiceOver (Mac+Safari):

1. Navigate to page
2. Verify heading structure announced correctly (h1 → h2 → h3)
3. Verify section labels are announced
4. Verify card content is announced as "{role} - {name}"
5. Verify decorative icons are not announced

**Step 3: Contrast check**

Use browser extension or online tool:
- Check all text has minimum 4.5:1 contrast ratio
- Check large text (18px+) has minimum 3:1 contrast ratio
- Check focus indicators have 3:1 contrast against background

**Step 4: Touch target test**

On mobile device or browser dev tools:
- Verify all cards are at least 44px tall (they are 80px)
- Verify all links have adequate tap area

**Step 5: Reduced motion test**

In browser dev tools, enable "prefers-reduced-motion: reduce":
- Reload page
- Verify animations are disabled or instant

---

## Task 8: Run Full Lint Check

**Files:**
- None (verification)

**Step 1: Run ESLint on entire project**

Run: `npm run lint`

Expected: Zero warnings (pre-existing errors in functions/ are okay, but no new errors in src/)

**Step 2: If linter passes, no commit needed**

Move to next task.

---

## Task 9: Final Verification & Documentation

**Files:**
- None (verification)

**Step 1: Verify page height reduction**

Before: ~1500px
After: ~900px

Use browser dev tools to measure total scroll height.

**Step 2: Verify all success criteria**

Checklist:
- [ ] Page height reduced by ~40%
- [ ] All officials use unified card component
- [ ] Keyboard navigation works end-to-end
- [ ] Focus indicators visible
- [ ] Heading structure is logical
- [ ] Touch targets minimum 44×44px
- [ ] Contrast ratios meet WCAG AA
- [ ] Zero ESLint warnings in modified files
- [ ] Visual design matches "clean minimal" aesthetic

**Step 3: Update design document with implementation notes**

Add implementation completion date to `docs/plans/2026-02-16-barangay-page-redesign.md`

**Step 4: Final commit**

```bash
git add docs/plans/2026-02-16-barangay-page-redesign.md
git commit -m "docs: mark barangay redesign as complete

All tasks completed:
- OfficialCard component created
- PunongBarangayCard component created
- BarangayHeader component created
- Barangay page redesigned with unified layout
- Focus styles added to Card component
- Accessibility verified (WCAG 2.1 Level AA)
- Page height reduced by ~40%"
```

---

## Testing Commands Summary

```bash
# Lint specific files
npx eslint src/components/government/OfficialCard.tsx --max-warnings 0
npx eslint src/components/government/BarangayHeader.tsx --max-warnings 0
npx eslint src/pages/government/barangays/[barangay].tsx --max-warnings 0
npx eslint src/components/ui/Card.tsx --max-warnings 0

# Lint all
npm run lint

# Dev server
npm run dev

# Type check (if needed)
npx tsc --noEmit
```

---

## Accessibility Testing Tools

- **Keyboard:** Tab through entire page
- **Screen Reader:** NVDA (Windows), VoiceOver (Mac), JAWS (Windows)
- **Contrast:** WAVE Browser Extension or https://webaim.org/resources/contrastchecker/
- **Touch Targets:** Browser DevTools Responsive Mode
- **Reduced Motion:** Chrome DevTools → More tools → Rendering → Prefers-reduced-motion

---

## Notes for Implementation

1. **Kapwa Semantic Tokens:** Always use `text-kapwa-text-*`, `bg-kapwa-bg-*`, `border-kapwa-border-*` - never use raw colors
2. **ARIA Attributes:** Every card needs proper `role`, `aria-label`, and `aria-hidden` on decorative icons
3. **Heading Structure:** h1 (header) → h2 (section) → h3 (cards)
4. **Focus Management:** All interactive elements must have visible focus indicators
5. **Motion Reduction:** Add `motion-reduce:transition-none` to all transitions
