# Forking Guide — Create Your BetterLGU Portal

BetterLB is a forkable template for building community-powered LGU portals. Follow these steps to create a portal for your municipality, city, or province.

## Quick Start

```bash
# 1. Fork or clone
git clone https://github.com/BetterLosBanos/betterlb.git better-yourlgu
cd better-yourlgu

# 2. Run setup wizard
node scripts/setup-lgu.cjs

# 3. Install and run
npm install
npm run dev
```

The setup wizard will prompt you for LGU details and generate all config files.

---

## What to Customize

### 1. Config (`config/lgu.config.json`)

All LGU-specific values live here. The setup wizard generates it, but you can edit manually:

```json
{
  "lgu": {
    "name": "Quezon",
    "fullName": "Municipality of Quezon",
    "province": "Bukidnon",
    "region": "Northern Mindanao (X)",
    "type": "municipality"
  },
  "portal": {
    "name": "BetterQuezon",
    "domain": "betterquezon.org",
    "brandColor": "#0066eb"
  }
}
```

Supported LGU types: `municipality`, `city`, `province`. Labels adapt automatically (Mayor/Governor, Sangguniang Bayan/Panlungsod/Panlalawigan, etc.).

### 2. Data Files

| File | What |
|------|------|
| `src/data/directory/departments.json` | Municipal/city departments |
| `src/data/directory/barangays.json` | Barangay directory |
| `src/data/directory/executive.json` | Elected officials (mayor, vice mayor) |
| `src/data/directory/legislative.json` | Sangguniang members |
| `src/data/services/` | Service categories and citizens charter |
| `src/data/tourism/` | Tourism data (if enabled) |
| `src/data/statistics/` | Population, income, competitiveness data (if enabled) |
| `src/data/about/` | LGU history and highlights |

### 3. Logos

Replace files in `public/logos/` with your own:
- `svg/{slug}-icon-white.svg` — Navbar/footer logo (white)
- `svg/{slug}-icon-colored.svg` — Default logo
- `png/{slug}-banner-colored.png` — Favicon
- `png/{slug}-banner-inverted.png` — Apple touch icon

### 4. SEO Metadata

`src/data/seo-metadata.json` uses template tokens resolved at runtime:

```json
{
  "/": {
    "title": "{{portal.name}}.org | {{lgu.fullName}} | Community Powered Government Portal",
    "description": "Find important information about {{portal.name}}.org..."
  }
}
```

Available tokens: `{{portal.name}}`, `{{portal.domain}}`, `{{portal.baseUrl}}`, `{{lgu.name}}`, `{{lgu.fullName}}`, `{{lgu.province}}`, `{{lgu.type}}`, `{{lgu.adjective}}`

To regenerate with concrete values: `node scripts/generate-seo.cjs`

### 5. Environment

```bash
cp .env.example .env
# Edit .env with your MeiliSearch credentials
```

The shared bettergovph MeiliSearch instance provides:
- **Procurement data** — filter by your LGU's PhilGEPS org name
- **DPWH infrastructure** — filter by municipality/province
- **Site-wide search** — via the bettergov index

### 6. Feature Flags

Enable/disable entire sections in `config/lgu.config.json`:

```json
{
  "features": {
    "openLGU": true,
    "transparency": true,
    "tourism": false,
    "statistics": true
  }
}
```

Routes and navigation automatically hide disabled features.

---

## Architecture

```
config/lgu.config.json          ← All LGU identity (edit this)
src/lib/lguConfig.ts             ← Typed config loader
src/lib/lguLabels.ts             ← LGU-type-aware labels
src/lib/seoTemplates.ts          ← SEO token resolution
src/data/navigation.ts           ← Config-driven nav (reads from config)
src/data/seo-metadata.json       ← Template tokens (resolved at runtime)
```

Everything reads from `config/lgu.config.json`. No hardcoded LGU names in source code.

---

## Deploy

```bash
npm run build
# Deploy dist/ to Cloudflare Pages, Netlify, Vercel, or any static host
```

For Cloudflare Pages Functions (admin API), see `functions/` directory.

---

## Contributing Back

Found a bug or improvement that applies to all LGU portals? Open an issue or PR on the [BetterLB repo](https://github.com/BetterLosBanos/betterlb).
