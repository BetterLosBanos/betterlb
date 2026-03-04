# 🏛️ BetterLB - Forking Guide

This guide helps you adapt BetterLB for your own Local Government Unit (LGU).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📋 Configuration File

The `/config/lgu.config.json` file contains all LGU-specific branding values in one place.

### Essential Fields

| Field | Description | Example |
|-------|-------------|-------------|
| `lgu.name` | "Your Municipality" | "Los Baños" |
| `lgu.fullName` | "Municipality of Los Baños" | "Municipality of Los Baños" |
| `lgu.province` | "Your Province" | "Laguna" |
| `lgu.provinceWebsite` | "Province Official Website" | "https://laguna.gov.ph" |
| `lgu.region` | "Your Region" | "Region IV-A" |
| `lgu.regionCode` | "Your Region Code" | "CALABARZON" |
| `lgu.officialWebsite` | "Official LGU Website" | "https://www.losbanos.gov.ph" |
| `portal.name` | "YourPortalName" | "BetterLB" |
| `portal.domain` | "YourDomain" | "BetterLB.org" |
| `portal.baseUrl` | "YourBaseURL" | "https://betterLB.org" |
| `portal.tagline` | "YourTagline" | "Your Slogan" |
| `portal.description` | "YourDescription" | "Portal description..." |
| `portal.navbarTagline` | "Navbar subtitle" | "A Community-run portal for" |
| `portal.footerBrandName` | "Footer brand name" | "Better Los Baños" |
| `portal.footerTagline` | "Footer tagline" | "Community Civic Portal" |

### Example Configuration

```json
{
  "lgu": {
    "id": "sanpablo",
    "name": "San Pablo",
    "fullName": "City of San Pablo",
    "province": "Laguna",
    "region": "Region IV-A",
    "regionCode": "CALABARZON",
    "type": "city",
    "logoPath": "/logos/png/betterlb-blue.png",
    "officialWebsite": "https://www.sanpablo.gov.ph",
    "barangayCount": 14
  },
  "portal": {
    "name": "BetterLGU",
    "domain": "betterlgu.org",
    "baseUrl": "https://betterlgu.org",
    "tagline": "Transparent. Accessible. Friendly.",
    "navbarTagline": "A Community-run portal for",
    "footerBrandName": "Better LGU",
    "footerTagline": "Community Civic Portal"
  }
}
```

## ⚠️ Manual Changes Required

### Code Files

| File | What to Change |
|------|----------------|
| `functions/api/weather.ts` | Update `DEFAULT_CITY` (lines 16-20) with your LGU name and coordinates |
| `/public/locales/en/common.json` | LGU-specific text for descriptions and labels |

---

## 🎨 Visual Assets (Branding)

To replace BetterLB branding with your LGU's visual identity, you'll need to update logos, seals, and brand colors.

### Quick Overview

**What to Replace:**
- ✅ Logo files (icon, horizontal, vertical variants)
- ✅ LGU seal (official municipal seal)
- ✅ Brand colors (primary, secondary colors)
- ⚠️ Code references (if filenames change)

**Estimated Time:** 30-60 minutes

---

### Step 1: Prepare Your Logo

**Required Format:**
- ✅ **SVG** (mandatory) - Scalable vector format for best quality
- ⚠️ **PNG** (recommended) - Fallback for older browsers
- ⚠️ **WebP** (optional) - Optimized web format for better performance

**Recommended Logo Variants:**

| Variant | Usage | Recommended Size |
|---------|-------|------------------|
| **Icon** | Favicons, avatars, small spaces | 64x64 to 256x256 |
| **Horizontal** | Navbar, headers, wide layouts | 200-300px wide |
| **Vertical** | Sidebars, cards, narrow spaces | 150-200px tall |

**Tools for Creating Logos:**
- **Vector (SVG):** [Inkscape](https://inkscape.org/) (free), [Figma](https://www.figma.com/) (free)
- **Raster (PNG/WebP):** [GIMP](https://www.gimp.org/) (free), [Photopea](https://www.photopea.com/) (free online)
- **Optimization:** [Squoosh](https://squoosh.app/), [TinyPNG](https://tinypng.com/)

---

### Step 2: Replace Logo Files

#### Option A: Direct Replacement (Recommended for Quick Start)

1. **Navigate to logo directory:**
   ```bash
   cd public/logos/
   ```

2. **Backup existing logos (optional):**
   ```bash
   mkdir -p backup
   cp *.svg backup/
   cp *.png backup/
   cp *.webp backup/
   ```

3. **Replace logo files:**
   - Create your LGU logo variants (icon, horizontal, vertical)
   - Save with **same filenames** as existing files:
     - `BetterLB_Icon.svg` → Your icon variant
     - `BetterLB_Icon-Primary.svg` → Your primary color variant
     - `betterlb-blue-outline.webp` → Your web-optimized version
   - Copy files to `public/logos/`

4. **Replace LGU seal:**
   ```bash
   # Replace Los Baños seal with your seal
   cp /path/to/your-municipality-seal.png public/logos/lb-seal.png
   ```

#### Option B: New Filenames (Requires Code Updates)

If you prefer new filenames (e.g., `sanpablo-icon.svg`):

1. **Add your logo files** to `public/logos/`
2. **Update code references** (see Step 4 below)

---

### Step 3: Update Brand Colors

**Extract Your LGU's Brand Colors:**

1. **Use a color picker tool:**
   - Online: [Adobe Color](https://color.adobe.com/), [Coolors](https://coolors.co/)
   - Design software: Eyedropper tool in Figma, Illustrator, Photoshop

2. **Extract colors from your logo:**
   - Primary color (dominant brand color)
   - Secondary color (accent color, if any)

3. **Update Tailwind config:**

   Edit `tailwind.config.js`:

   ```javascript
   module.exports = {
     theme: {
       extend: {
         colors: {
           // Replace with your LGU's colors
           primary: '#1A237E',     // Your primary color
           secondary: '#C62828',   // Your secondary color (optional)
         }
       }
     }
   }
   ```

4. **Test across components:**
   - Check buttons, links, headers use new colors
   - Verify contrast ratios (WCAG AA: 4.5:1 for text)
   - Ensure readability on all backgrounds

---

### Step 4: Update Code References (If Needed)

**Only required if you changed filenames or file locations.**

**Files to Check:**

1. **Navbar Component** (`src/components/layout/Navbar.tsx`):
   ```tsx
   // Search for:
   src='/logos/webp/betterlb-blue-outline.webp'

   // Update to your filename if different
   src='/logos/webp/[your-lgu]-blue-outline.webp'
   ```

2. **SEO Component** (`src/components/layout/SEO.tsx`):
   ```tsx
   // Search for:
   ogImage = '/logos/png/betterlb-white.jpg'

   // Update if filename changed
   ogImage = '/logos/png/[your-lgu]-white.png'
   ```

3. **Favicon** (`index.html`):
   ```html
   <!-- Check for: -->
   <link rel="icon" href="/logos/...">

   <!-- Update if needed -->
   <link rel="icon" href="/logos/[your-lgu]-icon.svg">
   ```

**Search for all logo references:**
```bash
grep -r "betterlb" src/ --include="*.tsx" --include="*.ts"
grep -r "BetterLB" src/ --include="*.tsx" --include="*.ts"
```

---

### Step 5: Verify Your Changes

**After replacing visual assets, verify:**

- [ ] **Logo appears in navbar** (desktop and mobile)
- [ ] **Logo appears in footer** (if used)
- [ ] **Favicon displays correctly** in browser tab
- [ ] **All logo variants work** (icon, horizontal, vertical)
- [ ] **Logo scales properly** on different screen sizes
- [ ] **LGU seal appears** on government pages
- [ ] **Brand colors applied** across components
- [ ] **No broken images** (check browser console)
- [ ] **Cross-browser test** (Chrome, Firefox, Safari, Edge)

**Performance Check:**
- [ ] SVG files under 50KB
- [ ] PNG files optimized (under 200KB)
- [ ] WebP files load quickly (check Network tab in DevTools)

---

### Advanced: Custom Brand Colors in Components

If your LGU uses custom brand colors beyond the primary color:

**Option 1: Extend Tailwind Theme**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
     extend: {
       colors: {
         'lgu-primary': '#1A237E',
         'lgu-secondary': '#C62828',
         'lgu-accent': '#FF6F00',
       }
     }
   }
}
```

**Usage in components:**
```tsx
<div className="bg-lgu-primary text-white">
  <h1 className="text-lgu-secondary">Your LGU Name</h1>
</div>
```

**Option 2: CSS Variables**

```css
/* src/index.css */
:root {
  --color-lgu-primary: #1A237E;
  --color-lgu-secondary: #C62828;
}
```

**Usage in components:**
```tsx
<div style={{ backgroundColor: 'var(--color-lgu-primary)' }}>
  Your content
</div>
```

---

### For Complete Details

See the **[Visual Assets Guide](visual-assets.md)** for comprehensive documentation on:
- Complete asset inventory (all logos, seals, map assets)
- Detailed format specifications (SVG, PNG, WebP requirements)
- Logo variants and when to use each
- File organization and naming conventions
- Image optimization guidelines
- Accessibility considerations
- Troubleshooting common issues

---

## 💾 D1 Database (Legislative Data)

The D1 database (`betterlb_openlgu` remote, `BETTERLB_DB` local) contains all legislative data.

### Core Tables to Populate

| Table | Description | What to Replace |
|-------|-------------|-----------------|
| `terms` | Council terms with dates, mayor/vice-mayor info | Your LGU's council terms, elected officials |
| `persons` | Council members and officials | Your councilors, mayor, vice-mayor |
| `memberships` | Person-term relationships | Who served in which term/role |
| `sessions` | Legislative session records | Your session dates, numbers, types |
| `session_absences` | Attendance records (absent-only model) | Your attendance data |
| `documents` | Ordinances, resolutions, executive orders | **ALL** legislative documents from your LGU |
| `document_authors` | Many-to-many relationship for document authors | Who authored each document |
| `committees` | Legislative committees | Your LGU's committee structure |
| `committee_memberships` | Committee assignments | Who serves on which committees |
| `subjects` | Subject tags/categories | Topics relevant to your legislation |
| `document_subjects` | Document-subject relationships | Tag documents with appropriate subjects |
| `review_queue` | Items pending manual review | Data quality queue for your sources |
| `data_conflicts` | Reconciliation between sources | Conflicts found during data import |

### Database Commands

```bash
# Local development
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql

# Remote production
npx wrangler d1 execute betterlb_openlgu --remote --file=db/migrations/001_initial_schema.sql

# Query local database
npx wrangler d1 execute BETTERLB_DB --local --command="SELECT * FROM terms LIMIT 10"
```

### Data Pipeline Scripts

The `pipeline/` directory contains Python scripts to process legislative PDFs into structured JSON:

```bash
# Run in sequence for processing PDFs
python3 pipeline/1_scrape.py        # Scrape document metadata
python3 pipeline/1.5_normalize.py  # Normalize scraped data
python3 pipeline/2_download.py      # Download PDFs
python3 pipeline/3_parse.py         # Parse PDF content
python3 pipeline/4_generate.py      # Generate database-ready JSON
```

Note: this is specific to our LGU´s website. You might need a script that works for your LGU´s govph.

---

## 📁 src/data Directory (Static Data Files)

The `src/data/` directory contains LGU-specific static data organized by category.

### Services Data

Located in `src/data/services/categories/` - these define the services your LGU provides:

| File | What to Replace |
|------|-----------------|
| `agriculture-livelihood.json` | Your LGU's agriculture programs |
| `business-licensing.json` | Your business requirements and fees |
| `certificates-vital-records.json` | Your civil registry processes |
| `education-scholarship.json` | Your scholarship programs |
| `environment-waste.json` | Your waste collection schedules |
| `health-wellness.json` | Your health centers and programs |
| `infrastructure-engineering.json` | Your engineering office services |
| `public-safety.json` | Your public safety contacts |
| `social-services.json` | Your social services offerings |
| `taxation-assessment.json` | Your tax rates and schedules |

> **Important:** After modifying category files, run:
> ```bash
> python3 scripts/merge_services.py
> ```
> This combines category files into `src/data/services/services.json`.

### Directory Data

Located in `src/data/directory/`:

| File | What to Replace |
|------|-----------------|
| `barangays.json` | Your LGU's barangays (update count in config too) |
| `departments.json` | Your department names, addresses, contacts |
| `executive.json` | Your mayor, vice mayor, department heads |
| `legislative.json` | Your councilors and committees |

### Statistics Data

Located in `src/data/statistics/`:

| File | What to Replace |
|------|-----------------|
| `ari.json` | Your LGU's revenue statistics | get from https://data.bettergov.ph/datasets/9
| `cmci.json` | Your CMCI scores (if available) | get from https://cmci.dti.gov.ph/
| `population.json` | Your LGU's population census data | get from https://psa.gov.ph/statistics/population-and-housing

### Other Data Files

| Location | File | What to Replace |
|----------|------|-----------------|
| `src/data/tourism/` | `resorts.json` | Your LGU's tourist spots |
| `src/data/about/` | `history.json` | Your LGU's history |
| `src/data/about/` | `highlights.json` | Your LGU's highlights |
| `src/data/transparency/` | `budgetData.ts` | Your budget allocations | get from https://data.bettergov.ph/datasets/9
| `src/data/transparency/` | `sre.json` | Your SRE evaluation results | get from https://data.bettergov.ph/datasets/9
| `src/data/` | `navigation.ts` | Navigation structure changes (if needed) |
| `src/data/` | `news.ts` | Your LGU's news feed |
| `src/data/` | `websites.json` | Your related government sites |
| `src/data/` | `hotlines.txt` | Your local emergency contacts |

---

## 📄 License

This project is released under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication.
