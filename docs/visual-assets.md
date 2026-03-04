# BetterLB Visual Assets Guide

This guide covers all visual assets used in the BetterLB portal, including usage guidelines, format specifications, and instructions for LGUs who want to fork and rebrand the portal.

---

## Table of Contents

1. [Asset Inventory](#asset-inventory)
2. [Usage Guidelines](#usage-guidelines)
3. [Format Specifications](#format-specifications)
4. [LGU Forking Guide](#lgu-forking-guide)
5. [Color Specifications](#color-specifications)
6. [Code Integration](#code-integration)
7. [Testing Checklist](#testing-checklist)

---

## Asset Inventory

### 1. Logo Assets

**Location:** `public/logos/`

#### SVG Format (18 files)

**BetterGov Branding** (legacy, 14 files):
- `BetterGov_Emblem-Outline-Inversed.svg` - Emblem with white outline
- `BetterGov_Emblem-Outline.svg` - Emblem outline variant
- `BetterGov_Emblem-Primary.svg` - Primary emblem color
- `BetterGov_Horizontal-Black.svg` - Horizontal layout, black
- `BetterGov_Horizontal-Primary.svg` - Horizontal layout, primary color
- `BetterGov_Horizontal-White.svg` - Horizontal layout, white
- `BetterGov_Icon-Black.svg` - Icon only, black
- `BetterGov_Icon-Primary.svg` - Icon only, primary color
- `BetterGov_Icon-White.svg` - Icon only, white
- `BetterGov_Vertical-Black.svg` - Vertical layout, black
- `BetterGov_Vertical-Primary.svg` - Vertical layout, primary color
- `BetterGov_Vertical-White.svg` - Vertical layout, white

**BetterLB Branding** (current, 4 files):
- `BetterLB_Icon.svg` - Main icon
- `BetterLB_Icon-Primary.svg` - Icon with primary color
- `BetterLB_Icon-edit.svg` - Editable version
- `BetterLB_sym.svg` - Symbol/logo mark

#### PNG Format (3 files)
**Location:** `public/logos/png/`
- `betterlb-blue.png` - Blue background variant
- `betterlb-blue-transparent.png` - Blue variant with transparency
- `betterlb-white-transparent.png` - White variant with transparency

#### WebP Format (3 files)
**Location:** `public/logos/webp/`
- `betterlb-blue-outline.webp` - Blue outline variant (optimized)
- `betterlb-blue.webp` - Blue background variant (optimized)
- `betterlb-white-outline.webp` - White outline variant (optimized)

**Current Usage:**
- **Navbar:** `/logos/webp/betterlb-blue-outline.webp` (see `src/components/layout/Navbar.tsx`)
- **SEO/OpenGraph:** `/logos/png/betterlb-white.jpg` (see `src/components/layout/SEO.tsx`)

---

### 2. LGU Seal

**Location:** `public/logos/lb-seal.png`
- **Size:** 1MB+ (high-resolution)
- **Format:** PNG
- **Description:** Official Los Baños municipal seal
- **Usage:** Official documents, certificates, government pages

---

### 3. Map Assets

**Location:** `public/`

- `ph-logo.webp` - Philippines flag/logo (WebP format)
- `ph-logo.svg` - Philippines flag/logo (SVG format)
- `marker-icon-2x.webp` - Map marker for Leaflet maps

**Usage:**
- National indicators on government pages
- Interactive maps using Leaflet

---

### 4. Citizens Charter Images

**Location:** `pipeline/data/cc_page_images/`
- **Format:** PNG (60+ files)
- **Purpose:** Source images for PDF extraction pipeline
- **Usage:** Internal processing only, not displayed to users

---

## Usage Guidelines

### When to Use Each Format

| Format | When to Use | Advantages | Disadvantages |
|--------|-------------|------------|---------------|
| **SVG** | Logos, icons, navigation | Scalable, small file size, crisp at any size | Not suitable for photos |
| **PNG** | Photos, complex graphics, print | Lossless, wide compatibility | Larger file size |
| **WebP** | Web images, optimized delivery | Modern compression, smallest size | Older browser support (fallback needed) |

### Logo Variants

| Variant | Usage Context | Recommended Size |
|---------|--------------|------------------|
| **Horizontal** | Navigation bars, headers, wide spaces | Width: 200px, Height: auto |
| **Vertical** | Sidebars, cards, vertical layouts | Width: 150px, Height: auto |
| **Icon** | Favicons, avatars, small spaces | 32x32, 64x64, 128x128 |
| **Emblem** | Badges, stamps, official documents | Varies |

**Current Implementation:**
- Navbar uses: `betterlb-blue-outline.webp` (WebP format)
- OpenGraph/Social: `betterlb-white.jpg` (referenced as JPG but file is PNG)

---

## Format Specifications

### SVG Requirements

**When creating SVG logos for your LGU:**

1. **Vector Format:** Ensure logo is true vector (paths, shapes) - not raster embedded in SVG
2. **ViewBox:** Include `viewBox` attribute for scalability
   ```xml
   <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
   ```
3. **Colors:** Use hex codes or named colors (avoid RGB for simplicity)
4. **File Size:** Keep under 50KB for optimal performance
5. **Accessibility:** Add `<title>` and `<desc>` tags
   ```xml
   <svg ...>
     <title>Your LGU Name Logo</title>
     <desc>Official logo of Your LGU</desc>
   ```

### PNG Requirements

**For PNG variants (optional but recommended for fallback):**

1. **Resolution:** Minimum 1024x1024 pixels (for high-DPI displays)
2. **Transparency:** Use PNG-24 with alpha channel for transparent backgrounds
3. **Compression:** Optimize with tools like TinyPNG or ImageOptim
4. **File Size:** Keep under 200KB

### WebP Requirements

**For WebP variants (recommended for web performance):**

1. **Quality:** 80-85% (good balance of quality/size)
2. **Transparency:** WebP supports alpha channel
3. **File Size:** Typically 30-50% smaller than PNG

---

## LGU Forking Guide

### Step 1: Prepare Your Logo

**Required Format:**
- ✅ **SVG** (mandatory) - Scalable vector format
- ⚠️ **PNG** (recommended) - Fallback for older browsers
- ⚠️ **WebP** (optional) - Optimized web format

**Recommended Variants:**
Create your LGU logo in these layouts:
- **Icon** - Simple symbol/mark (favicon, avatars)
- **Horizontal** - Logo + text side by side (navigation)
- **Vertical** - Logo + text stacked (sidebars, cards)

**Tools:**
- Vector: Inkscape, Adobe Illustrator, Figma
- Raster: Photoshop, GIMP
- Optimization: Squoosh, TinyPNG

---

### Step 2: Follow Naming Conventions

Replace "BetterLB" with your LGU name:

```
[LGU]_Icon.svg
[LGU]_Icon-Primary.svg
[LGU]_Horizontal-Black.svg
[LGU]_Horizontal-Primary.svg
[LGU]_Horizontal-White.svg
[LGU]_Vertical-Black.svg
[LGU]_Vertical-Primary.svg
[LGU]_Vertical-White.svg
```

**Example for "SanPablo":**
```
SanPablo_Icon.svg
SanPablo_Horizontal-Primary.svg
SanPablo_Vertical-White.svg
```

---

### Step 3: Replace Logo Files

1. **Navigate to logo directory:**
   ```bash
   cd public/logos/
   ```

2. **Create backup (optional):**
   ```bash
   cp -r svg svg-backup
   ```

3. **Replace SVG files:**
   - Copy your SVG files to `public/logos/svg/`
   - Replace BetterLB/BetterGov files with your LGU variants
   - Keep same filenames for consistency

4. **Replace PNG files (if created):**
   - Copy to `public/logos/png/`
   - Recommended: `[lgu]-blue.png`, `[lgu]-blue-transparent.png`, `[lgu]-white-transparent.png`

5. **Replace WebP files (if created):**
   - Copy to `public/logos/webp/`
   - Recommended: `[lgu]-blue-outline.webp`, `[lgu]-blue.webp`, `[lgu]-white-outline.webp`

---

### Step 4: Replace LGU Seal

**File:** `public/logos/lb-seal.png`

1. Obtain official municipal seal (high resolution)
2. Convert to PNG if needed
3. Replace `lb-seal.png` with your seal
4. Update filename to `[your-municipality]-seal.png`
5. **Important:** Update code references if you change filename

---

### Step 5: Update Code References (if needed)

**Check these files for logo references:**

1. **Navbar Component** (`src/components/layout/Navbar.tsx`):
   ```tsx
   src='/logos/webp/betterlb-blue-outline.webp'
   ```
   Update to your LGU filename if different.

2. **SEO Component** (`src/components/layout/SEO.tsx`):
   ```tsx
   ogImage = '/logos/png/betterlb-white.jpg'
   ```
   Update if you change filename or format.

3. **Favicon** (check `index.html`):
   ```html
   <link rel="icon" type="image/png" sizes="32x32" href="/logos/...">
   ```

---

## Color Specifications

### BetterLB Brand Colors

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Primary Blue** | #0066CC | Links, buttons, accents |
| **White** | #FFFFFF | Text on dark backgrounds |
| **Black** | #000000 | Text, borders |

### Extracting Colors from Your Logo

**Tools:**
- **Online:** ImageColorPicker, ColorZilla
- **Design Tools:** Eyedropper tool in Figma, Illustrator, Photoshop
- **CLI:** `magick identify -verbose logo.png` (ImageMagick)

**Steps:**
1. Open your logo in design tool or color picker
2. Identify primary, secondary, and accent colors
3. Note hex codes (e.g., #1A237E)
4. Update `tailwind.config.js` if custom colors needed:
   ```javascript
   module.exports = {
     theme: {
       extend: {
         colors: {
           primary: '#1A237E',
           secondary: '#FF6F00',
         }
       }
     }
   }
   ```

---

## Code Integration

### Where Assets Are Used in BetterLB

Based on codebase analysis (as of 2026-02-28):

| Component | File | Asset Used | Line |
|-----------|------|------------|------|
| **Navbar** | `src/components/layout/Navbar.tsx` | `/logos/webp/betterlb-blue-outline.webp` | 111 |
| **SEO/OpenGraph** | `src/components/layout/SEO.tsx` | `/logos/png/betterlb-white.jpg` | 33 |
| **Footer** | `src/components/layout/Footer.tsx` | Text reference: "BetterLB" | 47 |

### Actual Code References

**1. Navbar Component** (`src/components/layout/Navbar.tsx`):

```tsx
// Line 111-112
<Image
  src='/logos/webp/betterlb-blue-outline.webp'
  alt='BetterLB Logo'
  // ... other props
/>
```

**Update for your LGU:**
```tsx
<Image
  src='/logos/webp/[your-lgu]-blue-outline.webp'
  alt='Your LGU Name Logo'
  // ... other props
/>
```

**2. SEO Component** (`src/components/layout/SEO.tsx`):

```tsx
// Line 33
const seo: MetaProps = {
  ogImage = '/logos/png/betterlb-white.jpg',
  // ... other props
}
```

**Note:** The file extension says `.jpg` but the actual file is PNG. When forking, ensure your file matches the path.

**Update for your LGU:**
```tsx
const seo: MetaProps = {
  ogImage = '/logos/png/[your-lgu]-white.png',
  // ... other props
}
```

**3. Footer Component** (`src/components/layout/Footer.tsx`):

```tsx
// Line 47: Text reference
alt='BetterLB'

// Update to:
alt='Your LGU Name'
```

**4. Additional References** (not visual assets, but branding):

- `src/data/navigation.ts:170` - Facebook URL: `https://facebook.com/betterlb.org`
- `src/data/navigation.ts:180` - GitHub URL: `https://github.com/BetterLosBanos/betterlb`

Update these URLs to your LGU's social media accounts.

### Updating Asset Imports: Step-by-Step

**Step 1: Search for all logo references**

```bash
# Search for logo references in TypeScript/JavaScript files
grep -r "betterlb" src/ --include="*.tsx" --include="*.ts" -n
grep -r "BetterLB" src/ --include="*.tsx" --include="*.ts" -n
```

**Step 2: Update each reference**

For each file found:
1. Open the file
2. Replace "betterlb" with your LGU identifier (kebab-case)
3. Replace "BetterLB" with your LGU name
4. Test the changes

**Step 3: Verify no broken references**

```bash
# Start dev server
npm run dev

# Check browser console for 404 errors (missing images)
# Verify all logos load correctly
```

### Dynamic Logo Loading (Advanced Pattern)

For better LGU forking support, you can use dynamic logo loading based on config:

**Create logo utility** (`src/lib/logos.ts`):

```typescript
import lguConfig from '/config/lgu.config.json';

export function getLogoPath(variant: 'icon' | 'horizontal' | 'vertical'): string {
  const logoBase = `/logos/${lguConfig.lgu.id}`;

  switch (variant) {
    case 'icon':
      return `${logoBase}_Icon.svg`;
    case 'horizontal':
      return `${logoBase}_Horizontal-Primary.svg`;
    case 'vertical':
      return `${logoBase}_Vertical-Primary.svg`;
    default:
      return `${logoBase}_Icon.svg`;
  }
}

export function getSealPath(): string {
  return `/logos/${lguConfig.lgu.id}-seal.png`;
}
```

**Usage in components:**

```tsx
// src/components/layout/Navbar.tsx
import { getLogoPath } from '@/lib/logos';

function Navbar() {
  const logoPath = getLogoPath('horizontal');

  return (
    <Image
      src={logoPath}
      alt={`${lguConfig.portal.name} Logo`}
      // ... other props
    />
  );
}
```

**Benefits:**
- Single source of truth for logo paths
- Easy to update across all components
- Supports multiple LGU configurations
- No hardcoded file paths

---

## Testing Checklist

After replacing visual assets, verify:

### Logo Display
- [ ] Logo appears correctly in navbar (desktop)
- [ ] Logo appears correctly in navbar (mobile)
- [ ] Logo appears in footer (if applicable)
- [ ] Logo appears on homepage
- [ ] Logo scales properly on different screen sizes

### Favicon
- [ ] Favicon displays in browser tab
- [ ] Favicon displays in bookmarks
- [ ] Favicon works on mobile devices

### OpenGraph/Social
- [ ] Correct image displays when link shared on Facebook
- [ ] Correct image displays when link shared on Twitter
- [ ] Image dimensions are correct (1200x630 recommended)

### File Verification
- [ ] All SVG files are valid (open in browser)
- [ ] All PNG files have transparency where needed
- [ ] All WebP files load correctly
- [ ] No broken image links (check browser console)

### Performance
- [ ] SVG files are under 50KB
- [ ] PNG files are optimized (under 200KB)
- [ ] WebP files load quickly (use Network tab in DevTools)

### Cross-Browser
- [ ] Logos display in Chrome
- [ ] Logos display in Firefox
- [ ] Logos display in Safari
- [ ] Logos display in Edge
- [ ] Fallback works for older browsers (if PNG provided)

### Print Stylesheet
- [ ] Logos print correctly (test Print to PDF)
- [ ] Colors are preserved or use print-optimized variants

---

## Asset Organization Best Practices

### Directory Structure
```
public/logos/
├── svg/              # Vector logos (primary)
│   ├── [LGU]_Icon.svg
│   ├── [LGU]_Horizontal-Primary.svg
│   └── [LGU]_Vertical-White.svg
├── png/              # Raster fallback (optional)
│   ├── [lgu]-blue.png
│   └── [lgu]-white-transparent.png
├── webp/             # Optimized web variants (recommended)
│   ├── [lgu]-blue-outline.webp
│   └── [lgu]-white-outline.webp
└── [lgu]-seal.png    # Municipal seal
```

### File Naming Conventions
- Use kebab-case: `san-pablo-icon.svg`
- Include variant: `horizontal-primary.svg`, `vertical-white.svg`
- Be consistent across all formats
- Avoid spaces and special characters

### Version Control
- Commit optimized assets (not source files)
- Keep file sizes reasonable (under 1MB per file)
- Use `.gitignore` for working files if needed

---

## Additional Resources

### Tools
- **Vector Editing:** [Inkscape](https://inkscape.org/) (free), [Figma](https://www.figma.com/)
- **Raster Editing:** [GIMP](https://www.gimp.org/) (free), [Photopea](https://www.photopea.com/) (free online)
- **Image Optimization:** [Squoosh](https://squoosh.app/), [TinyPNG](https://tinypng.com/)
- **Color Extraction:** [ImageColorPicker](https://imagecolorpicker.com/)

### References
- [SVG Accessibility](https://www.w3.org/WAI/tutorials/images/)
- [WebP Browser Support](https://caniuse.com/webp)
- [Open Graph Protocol](https://ogp.me/)

---

**Last Updated:** 2026-02-28
**Maintained By:** BetterLB Development Team
