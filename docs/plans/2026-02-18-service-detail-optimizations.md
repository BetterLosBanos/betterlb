# Service Detail Page Optimizations

**Date:** 2026-02-18
**Status:** Backlog
**Priority:** TBD

## Overview

Optimization ideas for the service detail page to improve performance, UX, accessibility, and feature completeness. These are suggestions for future implementation after the initial redesign is complete.

---

## Performance Optimizations

### 1. Lazy Load Heavy Components
**Priority:** Medium
**Effort:** Low

Lazy load the ProcessTimeline component since it's only needed for Citizens Charter services:

```tsx
const ProcessTimeline = lazy(() => import('./components/ProcessTimeline'));

// Usage with Suspense
<Suspense fallback={<Skeleton />}>
  <ProcessTimeline steps={service.clientSteps} />
</Suspense>
```

**Benefit:** Faster initial page load for non-CC services

### 2. Memoize Office Lookups
**Priority:** Low
**Effort:** Low

Memoize the `involvedOffices` calculation to avoid re-filtering on every render:

```tsx
const involvedOffices = useMemo(() =>
  departmentsData.filter(d => officeSlugs.includes(d.slug)),
  [officeSlugs]
);
```

**Benefit:** Minor performance gain, cleaner code

### 3. Optimize Images
**Priority:** Low
**Effort:** Medium

If office photos/icons are added:
- Use WebP format with JPEG fallback
- Implement responsive images with `srcset`
- Add lazy loading for below-fold images

---

## UX Improvements

### 4. Time Estimate Badge
**Priority:** High
**Effort:** Low

Add an "Estimated Time to Complete" badge at the top of the process section:

```
┌─────────────────────────────────┐
│ ⏱️ ~30 minutes total             │
│    5 min → 10 min → 15 min      │
└─────────────────────────────────┘
```

**Implementation:**
- Add `estimatedMinutes` field to Citizens Charter data schema
- Display in Quick Info grid or as a separate banner
- Break down time per step if available

**Benefit:** Sets user expectations, reduces anxiety

### 5. Interactive Requirement Checklist
**Priority:** Medium
**Effort:** Medium

Add a printable/checkable checklist feature for requirements:

```tsx
<RequirementCard
  interactive={true}
  onCheck={(req, checked) => setChecked(req, checked)}
/>
```

**Features:**
- LocalStorage persistence
- Print-friendly layout
- "Copy checklist" button

**Benefit:** Practical utility for users

### 6. Current Wait Time Indicator
**Priority:** Low
**Effort:** High (requires data source)

Show real-time wait times at offices:

```
⏰ ~15 min wait at Municipal Treasurer's Office
```

**Implementation:**
- Requires queue management system integration
- Could use manual updates as fallback

**Benefit:** Helps users plan visits

### 7. Sticky Action Bar (Mobile)
**Priority:** Medium
**Effort:** Low

Add a sticky CTA bar on mobile:

```tsx
<div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4">
  <Button fullWidth>Start Application</Button>
</div>
```

**Benefit:** Better mobile UX

---

## Accessibility Enhancements

### 8. Skip Links
**Priority:** High
**Effort:** Low

Add skip navigation links:

```tsx
<a href="#requirements" className="sr-only focus:not-sr-only">
  Skip to Requirements
</a>
<a href="#timeline" className="sr-only focus:not-sr-only">
  Skip to Process Steps
</a>
```

**Benefit:** Keyboard users can jump to content

### 9. Improved ARIA Labels
**Priority:** High
**Effort:** Low

Add proper ARIA labels:

```tsx
<section aria-labelledby="requirements-heading">
  <h2 id="requirements-heading">Requirements</h2>
  <RequirementGrid requirements={requirements} />
</section>
```

**Benefit:** Better screen reader support

### 10. Keyboard Navigation for Cards
**Priority:** Medium
**Effort:** Low

Ensure clickable requirement cards work with keyboard:

```tsx
<div
  role="button"
  tabIndex={isClickable ? 0 : undefined}
  onKeyDown={handleKeyDown}
  className={...}
>
```

**Benefit:** Accessible navigation

---

## Feature Enhancements

### 11. Related Services Section
**Priority:** High
**Effort:** Medium

Show related services from the same office or category:

```tsx
<RelatedServices
  currentService={service}
  limit={3}
  variant="sidebar"
/>
```

**Implementation:**
- Already have `getRelatedServices()` function in `services.ts`
- Create RelatedServices component
- Display in sidebar

**Benefit:** Service discovery

### 12. Document Download Links
**Priority:** Medium
**Effort:** Medium

Add download buttons for requirements that have forms:

```tsx
{requirement.formUrl && (
  <Button
    variant="outline"
    size="sm"
    href={requirement.formUrl}
    download
  >
    <Download className="h-4 w-4" />
    Download Form
  </Button>
)}
```

**Implementation:**
- Add `formUrl` field to Requirement schema
- Store form URLs in data

**Benefit:** Convenience for users

### 13. Appointment Booking CTA
**Priority:** Medium
**Effort:** High (requires appointment system)

Add "Book Appointment" button for applicable services:

```tsx
{service.requiresAppointment && (
  <Button href={`/appointments?service=${service.slug}`}>
    Book Appointment
  </Button>
)}
```

**Benefit:** Streamlined process

---

## Data Quality Improvements

### 14. Automated Requirement Linking
**Priority:** Medium
**Effort:** Medium

Create a script to auto-match requirements to services:

```python
# scripts/link_requirements.py
def find_matching_service(requirement_name, all_services):
    # Fuzzy match requirement names to service slugs
    pass
```

**Benefit:** More requirement links without manual work

### 15. Incomplete Data Handling
**Priority:** High
**Effort:** Low

Better messaging for incomplete data:

```tsx
{service.needsVerification && (
  <Alert variant="info" icon={Info}>
    <AlertTitle>Details Pending Verification</AlertTitle>
    <AlertDescription>
      Contact {service.officeDivision} at {contactInfo} for current requirements.
    </AlertDescription>
  </Alert>
)}
```

**Benefit:** Clearer communication

---

## Mobile Optimizations

### 16. Collapsible Timeline on Mobile
**Priority:** Low
**Effort:** Medium

Collapse timeline steps by default on mobile:

```tsx
<ProcessTimeline
  collapsible={isMobile}
  defaultExpanded={false}
/>
```

**Benefit:** Less scrolling on mobile

### 17. Swipeable Requirements Grid
**Priority:** Low
**Effort:** High

Add swipe gestures to requirements grid on mobile:

**Benefit:** Native mobile feel

---

## Quick Wins

### 18. Copy Requirements Button
**Priority:** Medium
**Effort:** Low

```tsx
<Button
  variant="ghost"
  size="sm"
  onClick={() => copyToClipboard(requirementsList)}
>
  <Copy className="h-4 w-4" />
  Copy List
</Button>
```

**Benefit:** Easy sharing

### 19. Print-Friendly Styles
**Priority:** Medium
**Effort:** Low

Add `@media print` CSS:

```css
@media print {
  .no-print { display: none; }
  .print-break { page-break-before: always; }
}
```

**Benefit:** Offline use

### 20. Loading Skeletons
**Priority:** High
**Effort:** Low

Show skeletons while data loads:

```tsx
{isLoading ? (
  <RequirementGridSkeleton />
) : (
  <RequirementGrid requirements={requirements} />
)}
```

**Benefit:** Perceived performance

### 21. Enhanced Breadcrumbs
**Priority:** Low
**Effort:** Low

Add category filters to breadcrumbs:

```tsx
<Breadcrumb>
  <BreadcrumbItem>
    <BreadcrumbLink href="/services?category=business">
      Business & Licensing
    </BreadcrumbLink>
  </BreadcrumbItem>
</Breadcrumb>
```

**Benefit:** Better navigation

---

## Priority Recommendations

### Do First (High Value, Low Effort)
1. **#20 Loading Skeletons** - Immediate perceived performance
2. **#8 Skip Links** - Accessibility win
3. **#9 ARIA Labels** - Accessibility win
4. **#19 Print-Friendly Styles** - Practical utility
5. **#4 Time Estimate Badge** - User expectations

### Do Next (High Value, Medium Effort)
6. **#11 Related Services** - Service discovery
7. **#5 Interactive Checklist** - User utility
8. **#18 Copy Requirements** - Sharing feature

### Consider Later (Medium Value, Higher Effort)
9. **#12 Document Downloads** - Requires file hosting
10. **#7 Sticky Action Bar** - Mobile UX
11. **#14 Auto Linking** - Data quality

### Backlog (Lower Priority)
12. Wait time indicators (#6) - Requires external system
13. Appointment booking (#13) - Requires new system
14. Swipe gestures (#17) - Nice to have

---

## Implementation Notes

- Each optimization should be its own focused PR
- Test mobile responsiveness for all changes
- Run accessibility audits (axe DevTools) after ARIA changes
- Measure performance impact before/after for performance optimizations
- Consider creating A/B tests for UX changes

---

## Related Documentation

- Design: `docs/plans/2026-02-18-services-detail-page-redesign-design.md`
- Implementation: `docs/plans/2026-02-18-services-detail-page-redesign.md`
- Design System: `docs/BetterLB-Design-System-Guide.md`
