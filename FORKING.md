# Forking Guide

Everything you need to customize this portal for your own LGU (municipality/city).

## Quick Start (3 files)

### 1. `config/lgu.config.json` — Your Identity

This is the **single source of truth** for all branding, URLs, and LGU info. Edit these fields:

```jsonc
{
  "lgu": {
    "name": "Your Municipality",           // Short name used in UI text
    "fullName": "Municipality of Your Town", // Full legal name
    "province": "Your Province",
    "region": "Region IV-A",
    "regionCode": "CALABARZON",
    "type": "municipality",                  // "municipality" or "city"
    "officialWebsite": "https://yourtown.gov.ph",
    "provinceWebsite": "https://yourprovince.gov.ph"
  },
  "portal": {
    "name": "BetterYourTown",               // Portal brand name
    "domain": "bettertown.org",             // Production domain
    "baseUrl": "https://bettertown.org",    // Full URL (used for OG/canonical)
    "tagline": "Community Powered Portal",
    "description": "Community-powered portal of the Municipality of Your Town.",
    "brandColor": "#0066eb",
    "navbarTagline": "A Community-run portal for",
    "footerBrandName": "Better Your Town",
    "footerTagline": "Community Civic Portal",
    "githubUrl": "https://github.com/yourorg/yourrepo",
    "discordUrl": "https://discord.gg/yourinvite",
    "facebookUrl": "https://facebook.com/yourpage",
    "contactEmail": "you@example.com"
  }
}
```

> **Type safety**: `src/lib/lguConfig.ts` defines the TypeScript interface. If you add/remove config fields, update the `LGUConfig` interface there too.

### 2. `public/logos/` — Your Assets

Replace the logo files. The app reads these paths from config:

| Config Field | Default Path | Purpose |
|---|---|---|
| `portal.navbarLogoPath` | `/logos/webp/betterlb-blue-outline.webp` | Navbar logo |
| `portal.logoWhitePath` | `/logos/svg/betterlb-logo-white.svg` | Footer logo (dark bg) |
| `portal.defaultOgImagePath` | `/logos/png/betterlb-blue.png` | OG/social sharing image |
| `portal.faviconSvgPath` | `/logos/svg/betterlb-logo-primary.svg` | Browser tab icon (SVG) |
| `portal.faviconPath` | `/logos/png/betterlb-banner-inverted.png` | Browser tab icon (PNG fallback) |
| `portal.appleTouchIconPath` | `/logos/png/betterlb-banner-inverted.png` | iOS home screen icon |

Put your files in `public/logos/` and update the paths in config. Supported formats: SVG, WebP, PNG.

### 3. `index.html` — Static Head

`index.html` can't read config at build time (it's loaded before React). Update these manually:

```html
<link rel="icon" type="image/svg+xml" href="/logos/svg/your-logo.svg" />
<link rel="icon" type="image/png" sizes="180x180" href="/logos/png/your-icon.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/logos/png/your-icon.png" />
<meta property="og:image" content="/logos/png/your-og-image.png" />
```

> Keep these in sync with your `config.json` paths.

## Data Files

Replace LGU-specific data under `src/data/lgu/`:

- `src/data/lgu/yourtown/directory/departments.json` — Government departments
- `src/data/lgu/yourtown/directory/barangays.json` — Barangay listings
- `src/data/lgu/yourtown/services/categories/` — Service categories

Update `config.dataPaths` to point to your data directory.

## Transparency / Procurement

```jsonc
{
  "transparency": {
    "procurement": {
      "organizationName": "MUNICIPALITY OF YOUR TOWN, PROVINCE",
      "externalDashboard": "https://transparency.bettergov.ph/organizations/"
    },
    "infrastructure": {
      "searchString": "Your Town",
      "exactMatchTargets": ["your town", "your-town"]
    }
  }
}
```

## i18n Translations

Translation files live in `public/locales/{lang}/`. Edit these to change any UI text that isn't covered by config. The English files (`en/`) are the canonical source.

## Verification

After forking and customizing:

```bash
# Type check
npx tsc --noEmit

# Build
npx vite build

# Dev server
npm run dev
```

## Architecture Notes

- **Config is imported as JSON** — no runtime fetch, it's bundled at build time. Changes require a rebuild.
- **SEO component** (`src/components/layout/SEO.tsx`) reads from config for default OG image. Individual pages can override via props.
- **No hardcoded brand names in code** — all visible text comes from config or i18n files. If you find one, it's a bug.
