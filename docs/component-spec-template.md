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
