# Kapwa Semantic Token Quick Reference

## 🎯 Philosophy: Semantic First

Always use **semantic tokens** (like `text-kapwa-text-strong`) over raw color tokens (like `text-kapwa-gray-900`) whenever possible. Semantic tokens adapt better to theme changes and express intent clearly.

## ⚠️ Class Naming Rules

Kapwa semantic classes follow these patterns:

| Type | Pattern | Example |
|------|---------|---------|
| Text Colors | `text-` prefix required | `text-kapwa-text-strong` |
| Backgrounds | `bg-` prefix required | `bg-kapwa-bg-surface` |
| Borders | `border-` prefix required | `border-kapwa-border-weak` |
| Typography | No prefix | `kapwa-heading-md` |
| Spacing | No prefix | `p-kapwa-md`, `m-kapwa-lg` |

---

## 📝 TEXT COLORS

**Important:** All text color classes MUST use the `text-` prefix.

### Hierarchy
```tsx
// Primary text - headlines, important content
<h1 className="kapwa-heading-lg text-kapwa-text-strong">Main Heading</h1>

// Secondary text - body, descriptions  
<p className="kapwa-body-md-default text-kapwa-text-support">Supporting information</p>

// Disabled/inactive text
<span className="text-kapwa-text-disabled">Disabled option</span>

// Disabled with emphasis
<span className="text-kapwa-text-on-disabled">Label on disabled button</span>

// Inverse text (on dark backgrounds)
<div className="bg-kapwa-bg-surface-bold">
  <p className="text-kapwa-text-inverse">White text on dark</p>
</div>
```

### Links
```tsx
// Default link
<a className="text-kapwa-text-link">Click here</a>

// Link hover (use with hover:)
<a className="text-kapwa-text-link hover:text-kapwa-text-link-hover">Hover me</a>

// Visited link
<a className="text-kapwa-text-link-visited">Already visited</a>
```

### Brand
```tsx
// Brand color text
<span className="text-kapwa-text-brand">Brand colored</span>

// Strong brand emphasis
<strong className="text-kapwa-text-brand-bold">Bold brand</strong>
```

### Status
```tsx
// Success message
<p className="text-kapwa-text-success">Operation successful!</p>

// Error message
<p className="text-kapwa-text-danger">Error occurred</p>

// Warning message
<p className="text-kapwa-text-warning">Please be careful</p>

// Info message
<p className="text-kapwa-text-info">For your information</p>
```

### Accents
```tsx
<span className="text-kapwa-text-accent-purple">Purple accent</span>
<span className="text-kapwa-text-accent-green">Green accent</span>
<span className="text-kapwa-text-accent-red">Red accent</span>
<span className="text-kapwa-text-accent-orange">Orange accent</span>
<span className="text-kapwa-text-accent-blue">Blue accent</span>
```

---

## 🎨 BACKGROUND COLORS

**Important:** All background classes MUST use the `bg-` prefix.

### Surfaces
```tsx
// Base white surface
<div className="bg-kapwa-bg-surface">Default background</div>

// Slightly raised surface (cards, panels)
<div className="bg-kapwa-bg-surface-raised">Card background</div>

// Brand-tinted surface
<div className="bg-kapwa-bg-surface-brand">Brand section</div>

// Dark/bold surface
<div className="bg-kapwa-bg-surface-bold">Footer background</div>

// Adaptive (changes with theme)
<div className="bg-kapwa-bg-surface-adaptive">Theme-aware bg</div>
```

### Interactive States
```tsx
// Hover state
<button className="bg-kapwa-bg-surface hover:bg-kapwa-bg-hover">
  Hover me
</button>

// Active/pressed state
<button className="bg-kapwa-bg-surface active:bg-kapwa-bg-active">
  Click me
</button>

// Disabled state
<button className="bg-kapwa-bg-disabled" disabled>
  Disabled
</button>

// Focus indicator
<input className="focus:bg-kapwa-bg-focus" />
```

### Brand Backgrounds (Buttons, CTAs)
```tsx
// Primary button
<button className="
  bg-kapwa-bg-brand-default
  hover:bg-kapwa-bg-brand-hover
  active:bg-kapwa-bg-brand-active
  text-kapwa-text-inverse
  kapwa-body-md-strong
">
  Primary Action
</button>

// Subtle brand background
<div className="bg-kapwa-bg-brand-weak">
  Subtle brand section
</div>
```

### Gray Backgrounds
```tsx
// Gray button/element
<button className="
  bg-kapwa-bg-gray-default
  hover:bg-kapwa-bg-gray-hover
  active:bg-kapwa-bg-gray-active
">
  Secondary Action
</button>

// Disabled gray
<div className="bg-kapwa-bg-gray-disabled">Disabled area</div>
```

### Status Backgrounds - Success ✅
```tsx
// Success button
<button className="
  bg-kapwa-bg-success-default
  hover:bg-kapwa-bg-success-hover
  active:bg-kapwa-bg-success-active
  text-kapwa-text-inverse
  kapwa-body-md-strong
">
  Confirm
</button>

// Success alert/banner
<div className="bg-kapwa-bg-success-weak border border-kapwa-border-success">
  <p className="text-kapwa-text-success kapwa-body-sm-strong">Success message!</p>
</div>
```

### Status Backgrounds - Danger/Error ⛔
```tsx
// Danger button
<button className="
  bg-kapwa-bg-danger-default
  hover:bg-kapwa-bg-danger-hover
  active:bg-kapwa-bg-danger-active
  text-kapwa-text-inverse
  kapwa-body-md-strong
">
  Delete
</button>

// Error alert
<div className="bg-kapwa-bg-danger-weak border border-kapwa-border-danger">
  <p className="text-kapwa-text-danger kapwa-body-sm-strong">Error: Something went wrong</p>
</div>
```

### Status Backgrounds - Warning ⚠️
```tsx
// Warning button
<button className="
  bg-kapwa-bg-warning-default
  hover:bg-kapwa-bg-warning-hover
  active:bg-kapwa-bg-warning-active
  text-kapwa-text-inverse
  kapwa-body-md-strong
">
  Proceed with Caution
</button>

// Warning alert
<div className="bg-kapwa-bg-warning-weak border border-kapwa-border-warning">
  <p className="text-kapwa-text-warning kapwa-body-sm-strong">Warning: Please review</p>
</div>
```

### Status Backgrounds - Info ℹ️
```tsx
// Info button
<button className="
  bg-kapwa-bg-info-default
  hover:bg-kapwa-bg-info-hover
  active:bg-kapwa-bg-info-active
  text-kapwa-text-inverse
  kapwa-body-md-strong
">
  Learn More
</button>

// Info alert
<div className="bg-kapwa-bg-info-weak border border-kapwa-border-info">
  <p className="text-kapwa-text-info kapwa-body-sm-strong">Info: New feature available</p>
</div>
```

---

## 🔲 BORDER COLORS

**Important:** All border classes MUST use the `border-` prefix.

```tsx
// Subtle border (most common)
<div className="border border-kapwa-border-weak">Default border</div>

// Strong border (emphasis)
<div className="border border-kapwa-border-strong">Emphasized border</div>

// Inverse border (on dark backgrounds)
<div className="bg-kapwa-bg-surface-bold border border-kapwa-border-inverse">
  Light border on dark
</div>

// Disabled border
<input className="border border-kapwa-border-on-disabled" disabled />

// Focus border
<input className="border border-kapwa-border-weak focus:border-kapwa-border-focus" />

// Brand border
<div className="border border-kapwa-border-brand">Brand bordered</div>

// Status borders
<div className="border border-kapwa-border-success">Success</div>
<div className="border border-kapwa-border-danger">Error</div>
<div className="border border-kapwa-border-warning">Warning</div>
<div className="border border-kapwa-border-info">Info</div>
```

---

## ✏️ TYPOGRAPHY

**No prefix needed** - use directly as `kapwa-heading-*`, `kapwa-body-*`, etc.

### Headings
```tsx
<h1 className="kapwa-heading-xl">Extra Large Heading (2.5rem)</h1>
<h2 className="kapwa-heading-lg">Large Heading (2rem)</h2>
<h3 className="kapwa-heading-md">Medium Heading (1.5rem)</h3>
<h4 className="kapwa-heading-sm">Small Heading (1.25rem)</h4>

// With responsive scaling
<h1 className="kapwa-heading-md md:kapwa-heading-lg lg:kapwa-heading-xl">
  Responsive Title
</h1>
```

### Body Text
```tsx
<p className="kapwa-body-xl-default">Extra large body (1.25rem)</p>
<p className="kapwa-body-xl-strong">Extra large bold (1.25rem, 700)</p>

<p className="kapwa-body-lg-default">Large body (1.125rem)</p>
<p className="kapwa-body-lg-strong">Large bold (1.125rem, 700)</p>

<p className="kapwa-body-md-default">Default body (1rem)</p>
<p className="kapwa-body-md-strong">Default bold (1rem, 700)</p>

<p className="kapwa-body-sm-default">Small body (0.875rem)</p>
<p className="kapwa-body-sm-strong">Small bold (0.875rem, 700)</p>

<p className="kapwa-body-xs-default">Extra small (0.75rem)</p>
<p className="kapwa-body-xs-strong">Extra small bold (0.775rem, 700)</p>
```

### Code
```tsx
<code className="kapwa-code-lg">Large code (1.125rem)</code>
<code className="kapwa-code-md">Default code (1rem)</code>
<code className="kapwa-code-sm">Small code (0.875rem)</code>
```

### Labels
```tsx
<label className="kapwa-label-lg">Large label (1.125rem, 700)</label>
<label className="kapwa-label-md">Default label (1rem, 700)</label>
<label className="kapwa-label-sm">Small label (0.875rem, 700)</label>
<label className="kapwa-label-xs">Extra small label (0.75rem, 700)</label>
```

### Links
```tsx
<a className="kapwa-link-lg">Large link (1.125rem, underlined)</a>
<a className="kapwa-link-md">Default link (1rem, underlined)</a>
<a className="kapwa-link-sm">Small link (0.875rem, underlined)</a>
```

### Input
```tsx
<input className="kapwa-input" />
// 1rem, 400 weight, 1.5rem line-height
```

---

## 📏 SPACING

**Use with Tailwind spacing utilities** - add `kapwa-` to the size.

| Class | Size | Pixels |
|-------|------|--------|
| `p-kapwa-3xs` | 0.125rem | 2px |
| `p-kapwa-2xs` | 0.25rem | 4px |
| `p-kapwa-xs` | 0.5rem | 8px |
| `p-kapwa-sm` | 0.75rem | 12px |
| `p-kapwa-md` | 1rem | 16px |
| `p-kapwa-lg` | 1.5rem | 24px |
| `p-kapwa-xl` | 2rem | 32px |
| `p-kapwa-2xl` | 2.5rem | 40px |
| `p-kapwa-3xl` | 3rem | 48px |

```tsx
// Padding
<div className="p-kapwa-md">Medium padding (16px)</div>
<div className="px-kapwa-lg py-kapwa-sm">Horizontal 24px, Vertical 12px</div>

// Margin
<div className="m-kapwa-lg">Medium margin (24px)</div>
<div className="mt-kapwa-xl mb-kapwa-md">Top 32px, Bottom 16px</div>

// Gap
<div className="flex gap-kapwa-md">16px gap between children</div>
```

---

## 🌓 SHADOWS

```tsx
<div className="shadow-xs">Extra small shadow</div>
<div className="shadow-sm">Small shadow</div>
<div className="shadow-base">Base shadow (default)</div>
<div className="shadow-md">Medium shadow</div>
<div className="shadow-lg">Large shadow</div>
```

---

## 📦 COMPLETE COMPONENT EXAMPLES

### Alert Component
```tsx
// Success Alert
<div className="
  bg-kapwa-bg-success-weak
  border border-kapwa-border-success
  rounded-lg
  p-kapwa-md
">
  <p className="text-kapwa-text-success kapwa-body-sm-strong">
    ✓ Changes saved successfully!
  </p>
</div>

// Error Alert
<div className="
  bg-kapwa-bg-danger-weak
  border border-kapwa-border-danger
  rounded-lg
  p-kapwa-md
">
  <p className="text-kapwa-text-danger kapwa-body-sm-strong">
    ⚠ Please fix the errors below
  </p>
</div>

// Warning Alert
<div className="
  bg-kapwa-bg-warning-weak
  border border-kapwa-border-warning
  rounded-lg
  p-kapwa-md
">
  <p className="text-kapwa-text-warning kapwa-body-sm-strong">
    ⚡ This action cannot be undone
  </p>
</div>

// Info Alert
<div className="
  bg-kapwa-bg-info-weak
  border border-kapwa-border-info
  rounded-lg
  p-kapwa-md
">
  <p className="text-kapwa-text-info kapwa-body-sm-strong">
    💡 Tip: Press Ctrl+S to save
  </p>
</div>
```

### Button Component
```tsx
// Primary Button
<button className="
  bg-kapwa-bg-brand-default
  hover:bg-kapwa-bg-brand-hover
  active:bg-kapwa-bg-brand-active
  text-kapwa-text-inverse
  px-kapwa-lg py-kapwa-sm
  rounded-lg
  kapwa-body-md-strong
  transition-colors
  shadow-sm hover:shadow-md
">
  Primary Action
</button>

// Secondary Button
<button className="
  bg-kapwa-bg-surface-raised
  hover:bg-kapwa-bg-hover
  active:bg-kapwa-bg-active
  text-kapwa-text-strong
  border border-kapwa-border-weak
  px-kapwa-lg py-kapwa-sm
  rounded-lg
  kapwa-body-md-strong
  transition-colors
">
  Secondary Action
</button>

// Danger Button
<button className="
  bg-kapwa-bg-danger-default
  hover:bg-kapwa-bg-danger-hover
  active:bg-kapwa-bg-danger-active
  text-kapwa-text-inverse
  px-kapwa-lg py-kapwa-sm
  rounded-lg
  kapwa-body-md-strong
  transition-colors
">
  Delete
</button>

// Success Button
<button className="
  bg-kapwa-bg-success-default
  hover:bg-kapwa-bg-success-hover
  active:bg-kapwa-bg-success-active
  text-kapwa-text-inverse
  px-kapwa-lg py-kapwa-sm
  rounded-lg
  kapwa-body-md-strong
  transition-colors
">
  Confirm
</button>
```

### Card Component
```tsx
// Default Card
<div className="
  bg-kapwa-bg-surface
  border border-kapwa-border-weak
  rounded-lg
  shadow-sm
  hover:shadow-md
  transition-shadow
">
  <div className="p-kapwa-lg">
    <h3 className="kapwa-heading-md text-kapwa-text-strong">
      Card Title
    </h3>
    <p className="kapwa-body-sm-default text-kapwa-text-support mt-kapwa-xs">
      Card description goes here
    </p>
  </div>
</div>

// Featured/Brand Card
<div className="
  bg-kapwa-bg-surface-brand
  border border-kapwa-border-brand
  rounded-lg
  shadow-md
">
  <div className="p-kapwa-lg">
    <h3 className="kapwa-heading-md text-kapwa-text-brand-bold">
      Featured Content
    </h3>
    <p className="kapwa-body-sm-default text-kapwa-text-support mt-kapwa-xs">
      Special highlighted section
    </p>
  </div>
</div>
```

### Hero Section with Responsive Typography
```tsx
<div className="
  from-kapwa-brand-600 to-kapwa-brand-700
  text-kapwa-text-inverse
  bg-gradient-to-r
  py-12 md:py-24
">
  <h1 className="
    text-kapwa-text-inverse
    kapwa-heading-md md:kapwa-heading-lg lg:kapwa-heading-xl
    mb-4
  ">
    Main Title
  </h1>
  <p className="
    text-kapwa-text-inverse
    kapwa-body-md-default
    mb-8 max-w-lg opacity-80
  ">
    Subtitle text
  </p>
</div>
```

### Form Input
```tsx
// Default Input
<input
  type="text"
  className="
    w-full
    bg-kapwa-bg-surface
    border border-kapwa-border-weak
    focus:border-kapwa-border-focus
    focus:ring-2 focus:ring-kapwa-border-focus/20
    text-kapwa-text-strong
    px-kapwa-sm py-kapwa-xs
    rounded-md
    kapwa-body-md-default
    transition-colors
  "
  placeholder="Enter text..."
/>

// Error State Input
<input
  type="text"
  className="
    w-full
    bg-kapwa-bg-surface
    border-2 border-kapwa-border-danger
    focus:border-kapwa-border-danger
    text-kapwa-text-strong
    px-kapwa-sm py-kapwa-xs
    rounded-md
    kapwa-body-md-default
  "
  placeholder="Enter text..."
/>

// Disabled Input
<input
  type="text"
  disabled
  className="
    w-full
    bg-kapwa-bg-disabled
    border border-kapwa-border-on-disabled
    text-kapwa-text-disabled
    px-kapwa-sm py-kapwa-xs
    rounded-md
    kapwa-body-md-default
    cursor-not-allowed
  "
  placeholder="Disabled..."
/>
```

### Badge Component
```tsx
// Default Badge
<span className="
  inline-flex items-center
  bg-kapwa-bg-gray-default
  text-kapwa-text-strong
  border border-kapwa-border-weak
  rounded-md
  px-kapwa-xs py-kapwa-3xs
  kapwa-body-xs-strong
">
  Default
</span>

// Success Badge
<span className="
  inline-flex items-center
  bg-kapwa-bg-success-weak
  text-kapwa-text-success
  border border-kapwa-border-success
  rounded-md
  px-kapwa-xs py-kapwa-3xs
  kapwa-body-xs-strong
">
  Active
</span>

// Danger Badge
<span className="
  inline-flex items-center
  bg-kapwa-bg-danger-weak
  text-kapwa-text-danger
  border border-kapwa-border-danger
  rounded-md
  px-kapwa-xs py-kapwa-3xs
  kapwa-body-xs-strong
">
  Error
</span>

// Warning Badge
<span className="
  inline-flex items-center
  bg-kapwa-bg-warning-weak
  text-kapwa-text-warning
  border border-kapwa-border-warning
  rounded-md
  px-kapwa-xs py-kapwa-3xs
  kapwa-body-xs-strong
">
  Pending
</span>

// Brand Badge
<span className="
  inline-flex items-center
  bg-kapwa-bg-brand-weak
  text-kapwa-text-brand
  border border-kapwa-border-brand
  rounded-md
  px-kapwa-xs py-kapwa-3xs
  kapwa-body-xs-strong
">
  Featured
</span>
```

---

## 🎯 Responsive Typography Pattern

For responsive headings, combine Tailwind's responsive prefixes with Kapwa typography classes:

```tsx
// Mobile → Tablet → Desktop → Large Desktop
<h1 className="kapwa-heading-sm md:kapwa-heading-md lg:kapwa-heading-lg xl:kapwa-heading-xl">
  Responsive Heading
</h1>

// Mobile: 1.25rem → Tablet: 1.5rem → Desktop: 2rem → XL: 2.5rem
```

---

## ❌ Common Mistakes to Avoid

```tsx
// ❌ DON'T: Forget text- prefix for text colors
<div className="kapwa-text-strong">Wrong</div>

// ✅ DO: Always use text- prefix for text colors
<div className="text-kapwa-text-strong">Correct</div>

// ❌ DON'T: Forget bg- prefix for backgrounds
<div className="kapwa-bg-surface">Wrong</div>

// ✅ DO: Always use bg- prefix for backgrounds
<div className="bg-kapwa-bg-surface">Correct</div>

// ❌ DON'T: Forget border- prefix for borders
<div className="border kapwa-border-weak">Wrong</div>

// ✅ DO: Always use border- prefix for borders
<div className="border border-kapwa-border-weak">Correct</div>

// ❌ DON'T: Use raw colors for semantic purposes
<div className="bg-kapwa-red-50 text-kapwa-red-600">Error</div>

// ✅ DO: Use semantic tokens
<div className="bg-kapwa-bg-danger-weak text-kapwa-text-danger">Error</div>

// ❌ DON'T: Mix old and new systems
<div className="bg-primary-500 text-white">

// ✅ DO: Use Kapwa consistently
<div className="bg-kapwa-bg-brand-default text-kapwa-text-inverse">

// ❌ DON'T: Forget interactive states
<button className="bg-kapwa-bg-brand-default">Click</button>

// ✅ DO: Include all states
<button className="
  bg-kapwa-bg-brand-default
  hover:bg-kapwa-bg-brand-hover
  active:bg-kapwa-bg-brand-active
">
  Click
</button>
```

---

## 📚 When to Use Raw Color Tokens

Use raw Kapwa color tokens (like `bg-kapwa-brand-600`) only when:
1. You need a specific shade not covered by semantic tokens
2. Creating custom components with unique styling
3. Design requires a specific brand color that doesn't fit semantic categories

**Example:**
```tsx
// Rare case: specific brand gradient
<div className="bg-gradient-to-r from-kapwa-brand-400 to-kapwa-brand-600">
  Special gradient
</div>
```

---

## 🚀 Pro Tips

1. **Semantic > Raw**: Always prefer `text-kapwa-text-strong` over `text-kapwa-gray-900`
2. **Always Use Prefixes**: `text-` for text, `bg-` for backgrounds, `border-` for borders
3. **Status Colors**: Use semantic status backgrounds (`bg-kapwa-bg-success-weak`) for alerts
4. **Interactive States**: Always include hover/active states on buttons
5. **Consistent Borders**: Use `border border-kapwa-border-weak` for most borders
6. **Focus States**: Always add focus styles to interactive elements
7. **Responsive Typography**: Use Tailwind prefixes with Kapwa typography: `kapwa-heading-md md:kapwa-heading-lg`

---

Good luck with your migration! 🎨✨
