# 🏛️ BetterLB - Forking Guide

This guide helps you adapt BetterLB for your own Local Government Unit (LGU).

## 🚀 Quick Start

```bash
npm install
npm run dev
```

## 📋 Configuration File

The `/config/lgu.config.json` file contains all LGU-specific values in one place.

### Essential Fields

| Field | Description | Example |
|-------|-------------|-------------|
| `lgu.name\` | "Your Municipality" | "Los Baños" |
| `lgu.fullName\` | "Municipality of Los Baños" | "Municipality of Los Baños" |
| `lgu.province\` | "Your Province" | "Laguna" |
| `lgu.provinceWebsite\` | "Province Official Website" | "https://laguna.gov.ph" |
| `lgu.region\` | "Your Region" | "Region IV-A" |
| `lgu.regionCode\` | "Your Region Code" | "CALABARZON" |
| `lgu.officialWebsite\` | "Official LGU Website" | "https://www.losbanos.gov.ph" |
| `portal.name\` | "YourPortalName" | "BetterLB" |
| `portal.domain\` | "YourDomain" | "BetterLB.org" |
| `portal.baseUrl\` | "YourBaseURL" | "https://betterLB.org" |
| `portal.tagline\` | "YourTagline" | "Your Slogan" |
| `portal.description\` | "YourDescription" | "Portal description..." |
| `portal.navbarTagline\` | "Navbar subtitle" | "A Community-run portal for" |
| `portal.footerBrandName\` | "Footer brand name" | "Better Los Baños" |
| `portal.footerTagline\` | "Footer tagline" | "Community Civic Portal" |

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

The following files contain hardcoded LGU values that must be edited manually:

| File | What to Change |
|------|----------------|
| `functions/api/weather.ts` | Update `DEFAULT_CITY` (lines 16-20) with your LGU name and coordinates |

## 📂 Files Modified

The following files read from the LGU config for dynamic branding:

| File | Purpose | Config Usage |
|------|----------|----------|
| `src/lib/lguConfig.ts\` | Exports `config` object, all components import from here |
| `src/lib/seoTemplates.ts\` | SEO title/description helpers using config for fallbacks |
| `src/lib/weather.ts\` | Uses `config.location.weather.defaultCity`, `config.lgu.name`, `config.location.coordinates` for weather API calls |
| `src/components/layout/SEO.tsx\` | Uses `config.portal.*` for titles, `config.portal.baseUrl` for canonical URLs |
| `src/components/layout/Navbar.tsx\` | Uses `config.portal.name`, `config.portal.navbarTagline`, `config.lgu.fullName`, `config.lgu.officialWebsite` |
| `src/components/layout/Footer.tsx\` | Uses `config.portal.footerBrandName`, `config.portal.footerTagline`, `config.portal.logoWhitePath`, `config.lgu.name` |
| `src/components/home/GovernmentSection.tsx\` | Uses translation keys for descriptions (edit `/public/locales/en/common.json`) |
| `src/components/home/WeatherMapSection.tsx\` | Uses `config.location.coordinates`, `config.lgu.name`, `config.lgu.fullName`, `config.lgu.province` for map center, markers, labels |
| `src/components/home/TimelineSection.tsx\` | Uses `config.lgu.name` |
| `src/data/navigation.ts\` | Uses `config.portal.name`, `config.portal.description`, `config.lgu.fullName`, `config.lgu.name`, `config.lgu.officialWebsite`, `config.lgu.province`, `config.lgu.provinceWebsite` for navigation links |
| `src/pages/transparency/procurement/index.tsx\` | Uses `config.transparency.procurement.organizationName\` for filtering |
| `src/pages/transparency/infrastructure/index.tsx\` | Uses `config.lgu.region\`, `config.lgu.districtEngineeringOffice\`, `config.transparency.infrastructure.*` for DPWH filtering |

## 🚀 How to Fork

### 1. Clone Repository

```bash
git clone https://github.com/your-username/betterlb.git
cd betterlb
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Update Configuration

Edit `/config/lgu.config.json` with your LGU values.

#### Important Fields

- **Location**: Update `coordinates.lat` and `coordinates.lon` for accurate weather
- **Branding**: Update `portal.*` fields to match your portal identity

### 4. Update Translations (Optional)

Edit `/public/locales/en/common.json` for any LGU-specific text.

### 5. Build and Test

```bash
npm run build
```

## 📋 Notes

- **Coordinates**: Use Google Maps to find accurate coordinates for your municipality
- **Organization Name**: Check [PhilGEPS](https://phils.geps.gov.ph/) for exact spelling
- **Exact Match Targets**: Include common typos and variations

## 🆘 Tech Stack

| Component | Stack | Purpose |
|----------|-------------|-------------|
| **Frontend** | React 19, Vite 6, TypeScript (Strict) |
| **Styling** | Tailwind CSS v4 (CSS variables, high-contrast tokens) |
| **Backend** | Cloudflare Pages Functions (TypeScript) |
| **Data** | Structured JSON (Modular category-based architecture) |
| **Search** | Meilisearch with fuzzy matching |

## 📄 License

This project is released under [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication.

---

## ✅ Implementation Complete

All LGU-specific values have been centralized into `/config/lgu.config.json` and are now used throughout the application via `src/lib/lguConfig.ts`.

### Components Using Config

| Component | Config Values Used |
|-----------|-------------------|
| Navbar.tsx | `config.portal.name`, `config.portal.navbarTagline`, `config.lgu.fullName`, `config.lgu.officialWebsite` |
| Footer.tsx | `config.portal.footerBrandName`, `config.portal.footerTagline`, `config.portal.logoWhitePath`, `config.lgu.name` |
| Hero.tsx | Uses translations (forkers edit `/public/locales/en/common.json`) |
| GovernmentSection.tsx | Uses translations |
| TimelineSection.tsx | `config.lgu.name` |
| WeatherMapSection.tsx | `config.location.coordinates`, `config.lgu.name`, `config.lgu.fullName`, `config.lgu.province` |
| weather.ts | `config.location.weather.defaultCity`, `config.lgu.name` |
| navigation.ts | `config.portal.name`, `config.portal.description`, `config.lgu.fullName`, `config.lgu.name`, `config.lgu.officialWebsite`, `config.lgu.province`, `config.lgu.provinceWebsite` |
| seoTemplates.ts | `config.portal.name`, `config.portal.description`, `config.lgu.fullName` |
| navigation.ts | All sections use config templates |

### Manual Changes Still Required

| File | What to Change |
|------|------------------|
| `functions/api/weather.ts` | Update `DEFAULT_CITY` coordinates and city name (line ~16) |

### Summary

The forking implementation is essentially complete. Forkers can now update `/config/lgu.config.json` to adapt:
- Portal name (BetterLB)
- LGU name (Los Baños)
- Full LGU name (Municipality of Los Baños)
- Coordinates for weather and maps
- Official website URLs
- Branding text (navbar tagline, footer brand name, descriptions)
- Taglines (navbar, footer)

All major navigation and UI components now pull from config, making the project fully configurable for other municipalities.
