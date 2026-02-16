# CSS Cleanup Guide After Kapwa Migration

After running the migration script, you'll need to clean up your `src/index.css` file to remove old custom tokens and rely on Kapwa's system.

## 🎯 Goal

Transform your CSS from having custom color definitions to using only Kapwa tokens and your font override.

---

## 📝 Step-by-Step Cleanup

### Step 1: Keep These Imports (at the top)
```css
/* Fonts must be imported first */
@import './kapwa-fonts.css';
@import 'tailwindcss';
@import './kapwa.css';

@custom-variant dark (&:is(.dark *));
@custom-variant light (&:is(.light *));
```

### Step 2: Keep the Safelist Layer
Keep your entire `@layer utilities` block - this ensures Kapwa classes are generated.

### Step 3: REMOVE Old Custom Colors
Delete this entire `@theme` block:
```css
/* ❌ DELETE THIS */
@theme {
  /* Fonts */
  --font-sans: 'Figtree', ui-sans-serif, sans-serif;
  
  /* Primary (blue) */
  --color-primary-50: #e6f0fd;
  --color-primary-100: #cce0fb;
  /* ... etc ... */
  --color-primary-900: #00142f;
  
  /* Secondary (orange) */
  --color-secondary-50: #ffede6;
  /* ... etc ... */
  
  /* Accent (yellow/gold) */
  /* Semantic */
  /* Gray */
}
```

### Step 4: Add ONLY Font Override
Replace the deleted `@theme` block with just this:
```css
/* ✅ KEEP: Font override for BetterLB branding */
@theme {
  --font-sans: 'Figtree', ui-sans-serif, sans-serif;
}
```

### Step 5: Keep Essential Base Styles
Keep these base layer styles:
```css
@layer base {
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }
}

/* Leaflet popup fixes */
.leaflet-popup-content-wrapper {
  /* ... keep your Leaflet fixes ... */
}
```

### Step 6: Keep Animations
Keep your animation keyframes and utilities:
```css
@keyframes marquee { /* ... */ }
@keyframes fadeIn { /* ... */ }
@keyframes slideIn { /* ... */ }

@utility animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}
@utility animate-slide-in {
  animation: slideIn 0.5s ease-out;
}
```

### Step 7: Update shadcn/ui Theme (Optional)
If you're using shadcn/ui components, you can keep the shadcn theme vars but they're optional since you're migrating to Kapwa:

```css
@layer base {
  :root {
    /* Keep these if you use shadcn/ui components */
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    /* ... etc ... */
  }
}
```

---

## ✅ Final Clean `src/index.css` Structure

Here's what your file should look like after cleanup:

```css
/* ============================================
   KAPWA DESIGN SYSTEM INTEGRATION
   ============================================ */

/* Fonts must be imported first */
@import './kapwa-fonts.css';
@import 'tailwindcss';
@import './kapwa.css';

@custom-variant dark (&:is(.dark *));
@custom-variant light (&:is(.light *));

/* ============================================
   KAPWA UTILITY SAFELIST
   ============================================ */
@layer utilities {
  /* All your Kapwa utility classes */
  /* Keep this entire block as-is */
  .kapwa-bg-neutral-50 { /* ... */ }
  /* ... etc ... */
}

/* ============================================
   BETTERLB CUSTOMIZATION
   ============================================ */
@theme {
  /* Override Kapwa's Inter font with Figtree for BetterLB branding */
  --font-sans: 'Figtree', ui-sans-serif, sans-serif;
}

/* ============================================
   BASE STYLES
   ============================================ */
@layer base {
  /* Tailwind v4 border color compatibility */
  *,
  ::after,
  ::before,
  ::backdrop,
  ::file-selector-button {
    border-color: var(--color-gray-200, currentcolor);
  }
}

/* ============================================
   THIRD-PARTY FIXES
   ============================================ */

/* Leaflet popup fixes for Tailwind CSS conflicts */
.leaflet-popup-content-wrapper {
  border-radius: 8px !important;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06) !important;
}

.leaflet-popup-content {
  margin: 0 !important;
  line-height: 1.5 !important;
  font-size: 14px !important;
  color: #374151 !important;
  padding: 16px;
  min-width: 300px;
}

.leaflet-popup-tip {
  background: white !important;
  border: none !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1) !important;
}

.leaflet-popup-close-button {
  color: #6b7280 !important;
  font-size: 18px !important;
  font-weight: bold !important;
  padding: 4px 8px !important;
  margin-right: 12px !important;
}

.leaflet-popup-close-button:hover {
  color: #374151 !important;
  background: transparent !important;
}

.leaflet-popup .leaflet-popup-content-wrapper .leaflet-popup-content {
  width: auto !important;
  white-space: normal !important;
}

/* ============================================
   CUSTOM ANIMATIONS
   ============================================ */

@keyframes marquee {
  0% {
    transform: translateX(100%);
  }
  100% {
    transform: translateX(-100%);
  }
}

.animate-marquee {
  animation: marquee 30s linear infinite;
}

@keyframes fadeIn {
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
}

@keyframes slideIn {
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
}

@utility animate-fade-in {
  animation: fadeIn 0.5s ease-in-out;
}

@utility animate-slide-in {
  animation: slideIn 0.5s ease-out;
}

/* ============================================
   SHADCN/UI THEME (Optional - keep if using shadcn)
   ============================================ */

@layer base {
  :root {
    --radius: 0.625rem;
    --background: oklch(1 0 0);
    --foreground: oklch(0.129 0.042 264.695);
    /* ... rest of shadcn vars if needed ... */
  }
  
  .dark {
    --background: oklch(0.129 0.042 264.695);
    --foreground: oklch(0.984 0.003 247.858);
    /* ... rest of dark mode vars if needed ... */
  }
  
  * {
    @apply border-border outline-ring/50;
  }
  
  body {
    @apply bg-background text-foreground;
  }
}

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  /* ... rest of shadcn theme vars if needed ... */
}
```

---

## 🗑️ What to Delete

### DELETE: All Custom Color Definitions
```css
/* ❌ DELETE ALL OF THESE */
--color-primary-50: #e6f0fd;
--color-primary-100: #cce0fb;
--color-secondary-50: #ffede6;
--color-accent-50: #fef3e6;
--color-success-50: #e6f7ef;
--color-warning-50: #fff8e6;
--color-error-50: #fceaea;
--color-gray-50: #f8f9fa;
/* ... all color definitions ... */
```

---

## ✅ Verification Checklist

After cleanup:
- [ ] File imports Kapwa CSS
- [ ] Font override is present (Figtree)
- [ ] No old `--color-primary-*` variables
- [ ] No old `--color-secondary-*` variables
- [ ] No old `--color-success-*` variables
- [ ] Leaflet fixes are intact
- [ ] Animations are intact
- [ ] Safelist utilities block is intact
- [ ] Application builds successfully: `npm run build`
- [ ] Application runs successfully: `npm run dev`

---

## 🔍 Testing After Cleanup

```bash
# 1. Build the application
npm run build

# 2. Check for any errors
# Should build successfully with no errors

# 3. Run dev server
npm run dev

# 4. Visual inspection
# - Check that colors look correct
# - Test hover/focus states
# - Verify alerts/badges
# - Test form inputs
```

---

## 💡 Pro Tips

1. **Keep a backup**: Before deleting, copy your current `index.css` to `index.css.backup`
2. **Gradual cleanup**: Comment out sections first, test, then delete
3. **Check imports**: Make sure `kapwa.css` path is correct
4. **Font loading**: Verify `kapwa-fonts.css` exists and is importing correctly

---

## 🚨 Common Issues

### Issue: "Colors not working"
**Solution**: Check that `@import './kapwa.css';` is after `@import 'tailwindcss';`

### Issue: "Safelist classes not generated"
**Solution**: Make sure the entire `@layer utilities` block is present

### Issue: "Font not loading"
**Solution**: Verify `kapwa-fonts.css` exists and contains font-face declarations

### Issue: "Build errors"
**Solution**: Check for syntax errors in `@theme` block, ensure braces match

---

## 📊 Before & After Comparison

### Before (Old)
```css
@theme {
  --font-sans: 'Figtree', ui-sans-serif, sans-serif;
  --color-primary-50: #e6f0fd;
  --color-primary-100: #cce0fb;
  /* 100+ lines of color definitions */
  --color-gray-900: #212529;
}
```

### After (Clean)
```css
@theme {
  /* Single line - font override only */
  --font-sans: 'Figtree', ui-sans-serif, sans-serif;
}
```

**Result**: ~100 lines removed, relying entirely on Kapwa's design system! 🎉

---

## 🎯 Next Steps

After CSS cleanup:
1. Test all pages thoroughly
2. Check responsive layouts
3. Verify dark mode (if applicable)
4. Run accessibility audit
5. Commit changes: `git commit -am "Clean up CSS after Kapwa migration"`

---

Done! Your CSS is now clean and fully integrated with Kapwa. 🚀
