# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Initial setup (required before first run)
python3 scripts/merge_services.py    # Merges category files into services.json

# Development
npm run dev                          # Start Vite dev server (port 5173)
npm run functions:dev                # Start Cloudflare Functions dev server (port 8788)

# Build
npm run build                        # Full production build (tsc + merge:data + vite build)

# Code quality
npm run lint                         # ESLint with --max-warnings 0 (zero tolerance)
npm run format                       # Prettier formatting

# Testing
npm run test:e2e                     # Playwright E2E tests

# Cloudflare/Wrangler
npx wrangler pages dev --proxy 5173  # Dev server with Functions backend
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql  # Local DB migration
```

## Project Architecture

**BetterLB** is a municipal government portal for Los Baños, Philippines - a fork of BetterGov.ph. The architecture consists of:

### Frontend (React/Vite)
- **React 19** with TypeScript strict mode, **Vite 6** build tool
- **Tailwind CSS v4** with custom design tokens (see `tailwind.config.js`)
- **i18next** for English/Filipino translations (namespace-based, files in `public/locales/`)
- **Meilisearch** integration for fuzzy search
- **Leaflet** for map visualizations

### Backend (Cloudflare Pages Functions)
- Serverless API endpoints in `functions/api/`
- Uses **Cloudflare D1** (SQLite) database with migrations in `db/migrations/`
- **KV namespace** for weather caching (`WEATHER_KV`)
- Proxied in dev via Vite: `/api` → `http://localhost:8788`

### Data Pipeline (Python)
- Scripts in `pipeline/` for processing legislative PDFs → structured JSON
- Run numbered scripts in sequence: `1_scrape.py` → `1.5_normalize.py` → `2_download.py` → `3_parse.py` → `4_generate.py`

### Database Schema (D1/SQLite)
Key tables for legislation tracking:
- **terms**, **persons**, **memberships** - Council members and their terms
- **sessions**, **session_absences** - Legislative sessions (absent-only attendance model)
- **documents** (ordinances/resolutions/executive orders) with **document_authors** (many-to-many)
- **committees**, **committee_memberships**
- **review_queue** - Items needing manual review
- **data_conflicts** - Reconciliation between data sources (Facebook vs govph)

See `db/migrations/001_initial_schema.sql` for full schema including views like `v_author_productivity`.

## Key Architectural Patterns

### Service Data Management
Services are split by category in `src/data/services/categories/*.json`. The `merge:data` script combines them into `src/data/services/services.json`. **Always run `npm run merge:data` after modifying service category files.**

### Translation Pattern
- Namespaces in `public/locales/{locale}/{namespace}.json`
- Common namespace `common` for navigation/buttons
- Page-specific namespaces (e.g., `visa.json`, `about.json`)
- Add new namespace to `src/i18n.ts` and use with `useTranslation('namespace')`
- English is fallback - missing translations show English automatically

### Component Organization
- `src/components/` - Reusable UI components
  - `data-display/` - Tables, cards, record viewers
  - `layout/` - Headers, footers, grids
  - `map/` - Leaflet map components
  - `navigation/` - Menus, breadcrumbs
  - `search/` - Search bars, filters
  - `ui/` - Local-only components (Input, Ticker)
  - `widgets/` - Small reusable widgets
- `src/pages/` - Route-level page components (site sections)

### Path Aliases
`@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)

## Code Quality Standards

- **ESLint**: Zero warnings allowed (`--max-warnings 0`)
- **Conventional Commits**: Enforced via commitlint
- **Pre-commit hooks**: Husky + lint-staged auto-format on commit
- **TypeScript strict mode** enabled

## CI/CD Workflows

- `verify-contributions.yml` - Validates community submissions via GitHub issues
- `validate-json-schema.yml` - JSON schema validation
- `deploy.yml` - Deployment to Cloudflare Pages

## Important Notes

- The project uses **Cloudflare D1** with remote database (`betterlb_openlgu`)
- D1 binding name (`BETTERLB_DB`) is variable name in code, `database_name` (`betterlb_openlgu`) is actual database
- Local wrangler commands use binding name, remote commands use `database_name` - both reference same database
- An older database (`betterlb_opencouncil`) is preserved in `wrangler.jsonc` comments for backup
- Legislative documents have a "pending" status by default and require admin review
- The data pipeline includes a "human-in-the-loop" verification system
- Maps use Leaflet - ensure map tiles are properly loaded
- Weather data is cached in Cloudflare KV with automatic updates

## Shared Components (@betterlb/ui)

BetterLB uses shared UI components from `@betterlb/ui` package (located at `../betterlb-ui`).

### Development Workflow
- Terminal 1: `cd ../betterlb-ui && npm run dev` - Watch shared components for changes
- Terminal 2: `cd betterlb && npm run dev` - Run main app
- After building shared package: Clear Vite cache with `rm -rf node_modules/.vite` and restart dev server

### Available Components

**Layout Components:**
- `Navbar` - Main navigation bar with i18n support
- `Footer` - Site footer with navigation links
- `SidebarLayout` - Admin dashboard sidebar layout

**UI Components (import from @betterlb/ui):**
- `Button` - Supports variants: primary, secondary, success, outline, ghost, link
- `Card` - Card container with Header, Content, Footer, Title, Description variants
- `Badge` - Status and label badges
- `Dialog` - Modal dialogs with Portal, Overlay, Content variants
- `Tabs` - Tabbed interface with List, Trigger, Content variants
- `PaginationControls` - Pagination navigation
- `EmptyState` - Empty state placeholder component
- `Banner` - Alert banners with types: info, warning, error, success, default
- `SearchInput` - Search input with icon and clear button
- `SelectPicker` - Multi-select dropdown with search
- `ScrollArea` - Scrollable area with custom scrollbar
- `Skeletons` - CardSkeleton, DirectoryGridSkeleton, PageLoadingState
- `Timeline` - Vertical timeline with TimelineItem

**Local Components (src/components/ui/):**
- `Input` - Form input (stays local - form-specific)
- `Ticker` - News ticker (BetterLB-specific)

### Import Pattern
```tsx
// Import shared components
import { Button, Card, Badge, Banner } from '@betterlb/ui';

// Import local components
import { Input, Ticker } from '@/components/ui';
```

### Tailwind v4 Configuration
Tailwind v4 requires `@source` directive in `src/index.css` to scan shared package for utility classes:
```css
@source '../../betterlb-ui/src/**/*.{js,ts,jsx,tsx}';
```
The path is relative to the CSS file location. Without this, classes like `lg:flex` or `text-green-500` from shared components won't be generated.

### Translation Pattern
Shared components (Navbar, Footer) handle translations internally via `useTranslation` hook. Pass raw navigation data - do not pre-translate labels.

### Migration Notes
- Previous `src/kapwa/` components have been migrated to `@betterlb/ui`
- Previous `src/components/ui/` duplicates have been removed
- All imports from `@/kapwa/*` and `@/components/ui/*` now use `@betterlb/ui`
- The `success` variant for Button is now available in `@betterlb/ui`

## Kapwa Design System (@betterlb/kapwa)

BetterLB uses the Kapwa Design System fork, published as `@betterlb/kapwa` on npm.

### Import Pattern
- **TypeScript/JavaScript**: Use `@bettergov/kapwa` imports (aliased to `@betterlb/kapwa` via Vite)
- **CSS**: Must use `@betterlb/kapwa/kapwa.css` (Tailwind plugin bypasses Vite resolver)

```tsx
import { Button, Banner, Input, Label } from '@bettergov/kapwa'; // ✅ Works via alias
```

```css
@import '@betterlb/kapwa/kapwa.css'; /* CSS requires real package name */
```

### Vite Resolve Alias (vite.config.ts)
```typescript
{
  find: /^@bettergov\/kapwa(.*)$/,
  replacement: '@betterlb/kapwa$1',
}
```

### Kapwa Semantic Token Prefixes
Kapwa semantic classes MUST use Tailwind v4 prefixes for CSS variables:
- **Text colors**: `text-kapwa-text-*` (e.g., `text-kapwa-text-strong`, `text-kapwa-text-inverse`)
- **Backgrounds**: `bg-kapwa-bg-*` (e.g., `bg-kapwa-bg-surface`, `bg-kapwa-bg-hover`)
- **Borders**: `border-kapwa-border-*` (e.g., `border-kapwa-border-weak`, `border-kapwa-border-focus`)
- **Typography/Spacing**: No prefix (e.g., `kapwa-heading-md`, `kapwa-body-md-strong`, `p-kapwa-lg`)

This follows Tailwind v4's CSS variable convention where `--color-kapwa-text-strong` becomes `text-kapwa-text-strong`.

### Kapwa Color Scales in Components
Kapwa components (Button, Banner) use color scale utilities that must be scanned from compiled JS:
- **Primary**: `bg-kapwa-blue-600 hover:bg-kapwa-blue-700 focus:ring-kapwa-blue-500`
- **Secondary**: `bg-kapwa-orange-600 hover:bg-kapwa-orange-700 focus:ring-kapwa-orange-500`
- **Text**: `text-kapwa-neutral-50`

Since Kapwa publishes only compiled JS (`dist/`), use `@source` to scan these files:
```css
@source '../node_modules/@betterlb/kapwa/dist/**/*.js';
```
**Note**: Path uses `../node_modules` because `index.css` is in `src/`, not project root.

**Reference:** See `KAPWA_SEMANTIC_GUIDE.md` for complete token reference.

### Ticker Component Styling
- Uses Kapwa CSS variables with Tailwind v4 syntax: `text-(--color-kapwa-text-inverse)`
- Background: `bg-(--color-kapwa-bg-surface-bold)`

## Package Publishing Workflow (kapwa fork)

Location: `/mnt/games/github/kapwa` (fork of bettergovph/kapwa)

### Build and Publish
```bash
cd /mnt/games/github/kapwa
npm run build-lib              # Build dist folder
git add -f dist                 # Add built files (force add ignored files)
git commit --no-verify -m "build: add dist folder"
git push
npm version <version>          # Bump version in package.json
npm publish --access public     # Requires granular token with bypass 2FA
```

### Notes
- Pre-commit hooks fail on dist files - use `git commit --no-verify`
- Package exports include: `.`, `./lib/utils`, `./banner`, `./button`, `./button/hooks`, `./card`, `./input`, `./label`, `./kapwa.css`, `./kapwa-fonts.css`

## Design System Documentation

**BetterLB Design System Guide** (`docs/BetterLB-Design-System-Guide.md`) - Comprehensive reference for:
- Component library (Card, Badge, Button, etc.) with variants and usage patterns
- Layout components (PageHero, ModuleHeader, DetailSection) with when-to-use guidelines
- Page layout patterns (homepage, index/list, detail, dashboard, search results)
- Kapwa semantic tokens with Tailwind v4 prefix rules (text-*, bg-*, border-*)
- Typography, spacing, icons, interactive states
- Accessibility standards (WCAG 2.1 Level AA)
- Responsive design patterns and breakpoints
- Common UI patterns (contact info, search, filters, empty/loading/error states)

**Kapwa Semantic Guide** (`KAPWA_SEMANTIC_GUIDE.md`) - Quick reference for semantic token usage with common mistakes to avoid.
