# 🏛️ Better LB (Los Baños)

A community-led, open-source portal designed to make the government of the **Municipality of Los Baños** accessible, transparent, and user-friendly.

This project is a municipal-focused fork of [BetterGov.ph](https://bettergov.ph), adapted to meet the specific needs of Los Bañenses.

---

## Why We're Building This Project
Official government websites are often difficult to navigate on mobile devices, lack standardized accessibility features, and can be slow to update. **Better LB** provides a high-performance alternative that mirrors official data (built by BetterGov.PH volunteers) in a modern, inclusive, and community-audited format.

## 🏛️ About Los Baños

**Los Baños** (officially the Municipality of Los Baños) is a first-class municipality in the province of Laguna, Philippines. Known as the "Special Science and Nature City of the Philippines," it hosts prestigious institutions including the University of the Philippines Los Baños (UPLB) and the International Rice Research Institute (IRRI).

### Quick Facts
- **Province:** Laguna
- **Region:** Region IV-A (CALABARZON)
- **Coordinates:** 14.1763°N, 121.2219°E
- **Official Website:** https://losbanos.gov.ph
- **Type:** Municipality
- **Barangays:** 14 barangays

### Portal Features
BetterLB provides Los Baños with:
- **Public Services Directory**: Comprehensive guide to municipal services with requirements, fees, and step-by-step processes
- **Legislative Portal**: Access to ordinances, resolutions, and executive orders from the Sangguniang Bayan
- **Transparency Dashboard**: Financial data, procurement bids, and infrastructure projects
- **Government Directory**: Contact information for all municipal departments and officials
- **Multi-language Support**: English and Filipino translations

---

## 🔄 Forking for Your LGU

BetterLB is designed to be easily adapted for any Local Government Unit (LGU) in the Philippines.

## Quick Start for Other LGUs

1. **Edit Configuration**: Update `/config/lgu.config.json` with your LGU details
2. **Update Translations**: Modify `/public/locales/en/common.json` for LGU-specific text
3. **Add Your Data**: Replace data files in `/src/data/lgu/` with your municipality's information
4. **Build and Test**: Run `npm install && npm run build`

### Configuration Files to Edit

| File | What to Change |
|------|------------------|
| `/config/lgu.config.json` | All LGU settings (name, province, coordinates, branding, transparency config) |
| `/public/locales/en/common.json` | UI text strings (hero title, footer copyright, government section) |
| `/src/data/lgu/yourlgu/directory/departments.json` | Municipal departments and offices |
| `/src/data/lgu/yourlgu/directory/barangays.json` | Barangay information |
| `/src/data/lgu/yourlgu/services/categories/` | Public services data |

### Key Configuration Fields

| Field | Description | Example (Los Baños) |
|-------|-------------|---------------------|
| `lgu.name` | Short municipality name | "Los Baños" |
| `lgu.fullName` | Full official name | "Municipality of Los Baños" |
| `lgu.province` | Province name | "Laguna" |
| `lgu.region` | Region name | "Region IV-A" |
| `lgu.regionCode` | Region code | "CALABARZON" |
| `lgu.type` | LGU type | "municipality" or "city" |
| `lgu.officialWebsite` | Official LGU website | "https://losbanos.gov.ph" |
| `portal.name` | Portal name | "BetterLB" |
| `portal.baseUrl` | Portal base URL | "https://betterlb.org" |
| `portal.tagline` | Portal tagline | "Community Powered Los Baños Portal" |

**Note:** See [`FORKING.md`](./FORKING.md) for comprehensive forking instructions including database setup for legislative data.

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
- **Service Directory**: Categorized services merged from `src/data/lgu/losbanos/services/categories/`
- **Legislative Portal**: Ordinances, resolutions, executive orders with document parsing
- **Transparency Portal**: Financial data, procurement, bids, infrastructure projects
- **Search Integration**: Meilisearch-powered search with real-time indexing
- **Internationalization**: Multi-language support with i18next

### Los Baños-Specific Data

BetterLB includes structured data for Los Baños:

| Data Type | Location | Description |
|-----------|----------|-------------|
| **Departments** | `/src/data/lgu/losbanos/directory/departments.json` | Municipal departments and offices with contact info |
| **Barangays** | `/src/data/lgu/losbanos/directory/barangays.json` | 14 barangay profiles and officials |
| **Services** | `/src/data/lgu/losbanos/services/categories/*.json` | Public services by category (BPLO, Assessor, Engineering, etc.) |
| **Citizens Charter** | `/src/data/citizens-charter/citizens-charter.json` | Service requirements, fees, and client steps |
| **Legislation** | Cloudflare D1 Database | Ordinances, resolutions, executive orders |
| **Statistics** | `/src/data/statistics/` | Municipal demographics and indicators |

#### Data Pipeline for Legislative Documents

Los Baños legislative documents are processed through a Python pipeline:

1. **Scrape** (`pipeline/1_scrape.py`) - Download PDFs from official sources
2. **Normalize** (`pipeline/1.5_normalize.py`) - Standardize filenames and metadata
3. **Parse** (`pipeline/3_parse.py`) - Extract text and metadata from PDFs
4. **Generate** (`pipeline/4_generate.py`) - Create structured JSON for database import

See [`pipeline/README.md`](./pipeline/README.md) for complete documentation.

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

## 🏛️ Los Baños Government Structure

### Executive Branch
- **Mayor**: Chief executive officer of the municipality
- **Vice Mayor**: Presiding officer of the Sangguniang Bayan and mayoral successor
- **Municipal Departments**: Administrative offices implementing municipal programs

### Legislative Branch (Sangguniang Bayan)
The Sangguniang Bayan is the legislative body of Los Baños, composed of:
- **Vice Mayor** (Presiding Officer)
- **8 Regular Councilors** (District representatives)
- **2 Ex-Officio Councilors** (ABC President and SK Federation President)

### Key Departments
- **BPLO**: Business Permit and Licensing Office
- **MTO**: Municipal Treasurer's Office
- **Assessor's Office**: Property assessment and taxation
- **Engineering Office**: Infrastructure and public works
- **MPDC**: Municipal Planning and Development Coordinator
- **LCR**: Local Civil Registry
- **Municipal Health Office**: Public health services
- **Municipal Agriculture Office**: Agricultural programs

See the [Government Directory](https://betterlb.org/government) on the live site for complete department listings and contact information.

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

---

## 🚢 Deployment

### Production Deployment (BetterLB)

BetterLB is deployed on **Cloudflare Pages** with:
- **Frontend**: Vite build automatically deployed on push to `main` branch
- **Backend**: Cloudflare Pages Functions for API endpoints
- **Database**: Cloudflare D1 (`betterlb_openlgu`) for legislative data
- **Search**: Meilisearch instance for fuzzy search
- **KV Storage**: Weather data caching with automatic updates

### Deployment for Other LGUs

When deploying for your own LGU:

1. **Cloudflare Pages**: Connect your GitHub repository
2. **Environment Variables**: Configure your D1 database binding
3. **Custom Domain**: Set up your custom domain (e.g., `betterlgu.gov.ph`)
4. **Database Migration**: Run database migrations on remote D1 instance
5. **Meilisearch**: Deploy your own Meilisearch instance or use alternative search

See [`ARCHITECTURE.md`](./ARCHITECTURE.md#deployment) for detailed deployment strategies.

## License and Data Sources

### Code License
This project is released under the [Creative Commons CC0](https://creativecommons.org/publicdomain/zero/1.0/) dedication. The work is dedicated to the public domain and can be freely used, modified, and distributed without restriction.

### Data Attribution
BetterLB aggregates data from multiple sources:

| Data Source | Type | Attribution |
|-------------|------|-------------|
| **Municipality of Los Baños** | Official government data, services directory | Public domain |
| **Philippine Government Procurement Portal (PhilGEPS)** | Procurement bids and awards | Republic of the Philippines |
| **Department of Budget and Management (DBM)** | Financial releases | Republic of the Philippines |
| **Department of Public Works and Highways (DPWH)** | Infrastructure projects | Republic of the Philippines |
| **Official Gazette of the Philippines** | Legislative documents reference | Republic of the Philippines |

**Note**: Data is presented as-is and may not reflect the most current information. Always verify with official LGU sources.

---

## 📞 Contact and Support

### For Los Baños Residents
- **Website**: https://betterlb.org
- **GitHub Issues**: Report bugs or suggest features at [github.com/BetterLosBanos/betterlb/issues](https://github.com/BetterLosBanos/betterlb/issues)
- **Community**: Join our community contributions via the "Contribute" page on the portal

### For Other LGUs
- **Forking Guide**: See [`FORKING.md`](./FORKING.md) for detailed instructions
- **Architecture**: See [`ARCHITECTURE.md`](./ARCHITECTURE.md) for system design
- **Documentation**: See [`docs/`](./docs/) for comprehensive guides

---

**Built by the community, for the community.**
*Cost to the People of Los Baños = ₱0*

**A proud fork of [BetterGov.ph](https://bettergov.ph) 🇵🇭**
