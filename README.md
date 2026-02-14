# 🏛️ Better LB (Los Baños)

A community-led, open-source portal designed to make the government of the **Municipality of Los Baños** accessible, transparent, and user-friendly.

This project is a municipal-focused fork of [BetterGov.ph](https://bettergov.ph), adapted to meet the specific needs of Los Bañenses.

---

## Why We're Building This Project
Official government websites are often difficult to navigate on mobile devices, lack standardized accessibility features, and can be slow to update. **Better LB** provides a high-performance alternative that mirrors official data (built by BetterGov.PH volunteers) in a modern, inclusive, and community-audited format.

## Files to Edit
To fork this project for your own LGU

| File | What to Change |
|------|------------------|
| `/config/lgu.config.json` | All LGU settings (name, province, coordinates, branding, transparency config) |
| `/public/locales/en/common.json` | UI text strings (hero title, footer copyright, government section) |
| `/src/lib/lguConfig.ts` | Config loader - no changes needed, just imports config |
| `/src/components/layout/SEO.tsx` | Uses config for portal branding/URLs |
| `/src/pages/transparency/procurement/index.tsx` | Uses config for procurement organization filter |
| `/src/pages/transparency/infrastructure/index.tsx` | Uses config for region/province/search filters |

## Quick Start

1. Edit `/config/lgu.config.json` with your LGU details
2. Run `npm install && npm run build`

## Config Fields to Update

| Field | Your LGU | Description |
|-------|-------------|
| `lgu.name` | "Your Municipality" | Short name |
| `lgu.fullName` | "Municipality of Your Municipality" | Full name |
... (rest of table)

## Notes
- Translations use simple fallbacks - edit JSON directly for any UI text
- Components read from `config` - no need to pass config to translation functions
- Build verification ensures all changes work correctly

See FORKING.md for more details.

## Technical Stack
*   **Frontend**: React 19, Vite, TypeScript (Strict mode)
*   **Styling**: Tailwind CSS v4 (CSS variables, high-contrast tokens)
*   **Backend**: Cloudflare Pages Functions (TypeScript)
*   **Data**: Structured JSON (Modular category-based architecture)
*   **Search**: Meilisearch with Fuse.js fuzzy search
*   **Localization**: i18next with English & Filipino support
*   **Maps**: Leaflet for geospatial visualizations
*   **Data Pipeline**: Python scripts for legislative document processing
*   **Testing**: Playwright (E2E tests across multiple browsers)
*   **Code Quality**: ESLint, Prettier, Husky pre-commit hooks

---

## Project Structure

```
betterlb/
├── e2e/                         # End-to-end tests
│   └── utils/                   # Test helpers and shared testing logic
├── functions/                   # Serverless / backend functions (Cloudflare Pages)
│   └── api/                     # API endpoints and handlers
├── pipeline/                    # Data processing pipeline (Python side)
│   ├── data/                    # Structured source documents
│   │   └── pdfs/                # Source legislative PDFs
│   │       ├── executive_orders/
│   │       ├── ordinances/
│   │       └── resolutions/
│   └── __pycache__/             # Python cache (auto-generated)
├── public/                      # Static public assets
│   ├── assets/                  # General media assets
│   ├── locales/                 # Translation files (en, fil)
│   └── logos/                   # Logo exports
├── raw_data/                    # Unprocessed data before pipeline cleanup
├── scripts/                     # Automation, maintenance, and build scripts
├── src/                         # Main application source code
│   ├── components/              # Reusable UI components
│   │   ├── data-display/        # Tables, cards, and record viewers
│   │   ├── home/                # Homepage-specific components
│   │   ├── layout/              # Layout wrappers, grids, headers, footers
│   │   ├── map/                 # Map visualizations and geospatial UI
│   │   ├── navigation/          # Menus, navbars, breadcrumbs
│   │   ├── search/              # Search bars, filters, query UI
│   │   ├── ui/                  # Generic UI elements (buttons, modals, etc.)
│   │   └── widgets/             # Small reusable info widgets
│   ├── constants/               # App-wide constant values and config
│   ├── data/                    # Structured frontend data layer
│   │   ├── about/               # About page content
│   │   ├── directory/           # Government directory datasets
│   │   │   └── schema/          # Data schemas for directory records
│   │   ├── legislation/         # Legislative data
│   │   │   ├── committees/
│   │   │   ├── documents/
│   │   │   │   └── sb_12/       # Session-specific legislative docs
│   │   │   ├── persons/         # Councilors, authors, sponsors
│   │   │   ├── sessions/        # Legislative sessions
│   │   │   │   └── sb_12/
│   │   │   └── term/            # Term metadata
│   │   ├── schema/              # Global data schemas
│   │   ├── services/            # Public service datasets
│   │   │   └── categories/      # Service classifications
│   │   ├── statistics/          # Municipality statistics datasets
│   │   └── transparency/        # Transparency and governance data
│   ├── hooks/                   # Custom reusable frontend hooks
│   ├── i18n/                    # Internationalization setup and config
│   │   ├── languages.ts         # Language definitions (English, Filipino)
│   │   └── README.md            # Translation guide
│   ├── lib/                     # Utility libraries and helpers
│   ├── pages/                   # Route-level pages (site sections)
│   │   ├── about/
│   │   ├── accessibility/
│   │   ├── contribute/
│   │   ├── data/                # Open data portal pages
│   │   ├── government/          # Government structure pages
│   │   │   ├── barangays/
│   │   │   ├── departments/
│   │   │   ├── elected-officials/
│   │   │   └── executive/
│   │   ├── legislation/         # Legislative portal for Ordinances/Resolutions/Executive Orders
│   │   ├── services/            # Public services portal
│   │   ├── sitemap/             # Human-readable sitemap
│   │   ├── statistics/          # Statistics portal
│   │   └── transparency/        # Transparency portal
│   │       ├── bids/
│   │       ├── components/
│   │       ├── financial/
│   │       ├── infrastructure/
│   │       └── procurement/
│   └── types/                   # Type definitions (TypeScript or schemas)
└── (root config files)          # package.json, build configs, .env files
```

### Key Components
- **Service Directory**: Categorized services merged from `src/data/services/categories/`
- **Legislative Portal**: Ordinances, resolutions, executive orders with document parsing
- **Transparency Portal**: Financial data, procurement, bids, infrastructure projects
- **Search Integration**: Meilisearch-powered search with real-time indexing
- **Internationalization**: Multi-language support with i18next

---

## 🚀 How to Run Locally

### 1. Clone and Install
```bash
git clone https://github.com/BetterLosBanos/betterlb
cd betterlb
npm install
```

### 2. Prepare Data
Since the service directory is split into manageable category files, you must merge them before running the app:
```bash
python3 scripts/merge_services.py
```

### 3. Start Development Server
```bash
npm run dev
```
**Access the portal at:** `http://localhost:5173`

### 4. Running Tests
```bash
npm run test:e2e        # Run all end-to-end tests
npm run lint            # Check code quality (max warnings = 0)
npm run format          # Format code with Prettier
```

### 5. Building for Production
```bash
npm run build           # Combines merge_services, TypeScript, and Vite build
```

**Note:** The build script runs `tsc && npm run merge:data && vite build` automatically

---

## Join the Grassroots Movement
We are looking for volunteers passionate individuals who want to make Los Baños a better place. You don't need to be a developer to help!

### How You Can Contribute:
1.  **Non-Developers**: Visit the `/contribute` page on the live site to suggest new services or fix outdated information using our simple web form.
2.  **Developers**: Check the [Issues](https://github.com/BetterLosBanos/betterlb/issues) tab for "Help Wanted" or "Good First Issue" labels.
3.  **Data Auditors**: Help us verify community submissions on GitHub to ensure the portal remains an authoritative source of information.
4.  **Translators**: Help translate the portal to Filipino and other Philippine languages by working on `public/locales/` files.

### Development Workflow
- Follow [Conventional Commits](https://www.conventionalcommits.org/) (enforced via commitlint)
- All PRs run ESLint and Prettier automatically
- E2E tests run on CI to ensure cross-browser compatibility

## License
This project is released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication. The work is dedicated to the public domain and can be freely used, modified, and distributed without restriction.

---
**Built by the community, for the community.**  
*Cost to the People of Los Baños = ₱0*
