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
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql  # Manual local DB migration (legacy)

# Database Migrations (Automated)
npm run db:migrate              # Run pending migrations on local database
npm run db:migrate:remote       # Run pending migrations on production (with confirmation)
npm run db:migrate:status       # Show migration status (local + production)
npm run db:migrate:create       # Create a new migration file: npm run db:migrate:create <name>
./scripts/migrate.sh verify     # Verify migration file safety (pre-deployment check)
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

**Base URLs:**
- Production: `https://betterlb.gov.ph`
- Preview: `https://betterlb.pages.dev`
- All API endpoints prefixed with `/api/` (e.g., `/api/openlgu/`, `/api/admin/`)

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

### OpenLGU API Caching
OpenLGU API (`functions/api/openlgu/`) uses Cloudflare KV with these TTL values:
- Static data (terms list): 1 hour (3,600s)
- List endpoints: 15 minutes (900s)
- Detail endpoints: 5 minutes (300s)
- Count/query endpoints: 2 minutes (120s)
- Rate limiting: 100 requests per minute per IP
- API documentation: `docs/openlgu-api.md`
- Cache implementation: `functions/utils/kv-cache.ts`

See `db/migrations/001_initial_schema.sql` for full schema including views like `v_author_productivity`.

### Database Migration Automation

**Migration Tracking:**
- `schema_migrations` table tracks applied migrations (auto-created on first run)
- Migration files in `db/migrations/` with numeric prefixes (e.g., `001_initial_schema.sql`)
- Automated script: `scripts/migrate.sh`

**Running Migrations:**
```bash
# Local development
npm run db:migrate              # Apply pending migrations to local database

# Production deployment
npm run db:migrate:remote       # Apply pending migrations to production (with confirmation)
# Note: Migrations run automatically in CI/CD when merging to main branch

# Check status
npm run db:migrate:status       # Show applied/pending migrations for local and production

# Create new migration
npm run db:migrate:create add_user_settings  # Creates db/migrations/TIMESTAMP_add_user_settings.sql

# Verify safety
./scripts/migrate.sh verify     # Check for dangerous SQL (DROP TABLE, UPDATE without WHERE, etc.)
```

**Best Practices:**
1. Always use `IF NOT EXISTS` for CREATE TABLE statements
2. Add indexes for columns used in WHERE, JOIN, ORDER BY clauses
3. Test migrations locally first: `npm run db:migrate`
4. Verify safety before committing: `./scripts/migrate.sh verify`
5. Migrations run automatically on production deployment (main branch only)
6. Preview environments (PRs) do NOT run migrations (they share production DB)

**CI/CD Integration:**
- Migrations run automatically in `.github/workflows/deploy.yml` when merging to `main`
- Production confirmation prompt prevents accidental execution
- Applied migrations are tracked and skipped on re-runs

**Documentation:** See `docs/DATABASE-MIGRATION-AUTOMATION.md` for complete guide

## Key Architectural Patterns

### Service Data Management
Services are split by category in `src/data/services/categories/*.json`. The `merge:data` script combines them into `src/data/services/services.json`. **Always run `npm run merge:data` after modifying service category files.**

### API Input Validation
- Search query parameters (`q`): Max 100 characters, special characters auto-escaped for SQL safety
- Session type filtering: Case-sensitive values ("Regular", "Special", "Inaugural")
- All database queries use parameterized statements (`.bind()`) to prevent SQL injection
- Rate limiting response: HTTP 429 with `retryAfter` field and rate limit headers

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

### Service Page Components
- `src/pages/services/components/` - Service-specific components
  - `RequirementCard` - Individual requirement card with optional service link
  - `RequirementGrid` - Grid of requirement cards
  - `ProcessTimeline` - Vertical timeline for client steps
  - `ServiceCard` - Service listing card
  - `ServiceFilters` - Service filtering options

### Citizens Charter Merge Script
`scripts/merge_citizens_charter.py` - Merges Citizens Charter data with services.json:
- Maps office divisions to office slugs using `map_office_division_to_slug()`
- Adds service numbers, categories, and verification flags
- Run after updating citizens-charter.json: `python3 scripts/merge_citizens_charter.py`
- Output: `src/data/citizens-charter/merged-services.json`

### Office Data Structure
- `departments.json` - Municipal departments (slug field: `office_name`)
- `executive.json` - Elected officials (slug field: `role`, path: `/government/executive/{slug}`)
- `legislative.json` - Sangguniang Bayan (slug field: `chamber`, path: `/government/legislative/{slug}`)
- When linking offices, check all three sources based on office type

### Python JSON Operations
```bash
# Quick JSON operations when jq is unavailable
python3 -c "import json; data=json.load(open('file.json')); print(json.dumps(data, indent=2))"
python3 -c "import json; d=json.load(open('f.json')); print(set(s['field'] for s in d['services']))"

### Large JSON Files
- `citizens-charter.json` exceeds 256KB - use Read with offset/limit or Python: `python3 -c "import json; print(len(json.load(open('file.json'))['services']))"`
```

### Audit Logging Pattern

All admin state-changing operations MUST log audit entries for compliance and security tracking.

**Import the utility:**
```typescript
import { logAudit, AuditActions, AuditTargetTypes } from '../../utils/audit-log';
```

**Log an action in your endpoint handler:**
```typescript
await logAudit(env, {
  action: AuditActions.CREATE_DOCUMENT,  // or custom string
  performedBy: context.auth.user.login,
  targetType: AuditTargetTypes.DOCUMENT,
  targetId: documentId,
  details: {
    title: 'Ordinance 001',
    type: 'ordinance',
    // Additional context about the action
  },
});
```

**Key points:**
- Use `AuditActions` constants when available (see `functions/utils/audit-log.ts`)
- Use `AuditTargetTypes` constants for target_type
- Include meaningful `details` object for forensic analysis
- Audit logging failures are non-blocking (logged to console only)
- View audit logs at `/admin/audit-logs` with filtering and CSV export

**Common actions:**
- `create_document`, `update_document`, `delete_document`
- `merge_persons`, `delete_person`, `update_attendance`
- `assign_review`, `update_review_status`
- `login`, `logout`, `login_failed`
- `reconcile_data`, `parse_facebook_post`

### Icon Naming Convention
- This codebase uses `*Icon` suffix for Lucide icons (e.g., `ArrowRightIcon`, not `ArrowRight`)
- Check existing imports before using new icons to avoid ESLint errors
- Icons used in `src/lib/officeIcons.ts` map department slugs to Lucide names

### Path Aliases
`@` maps to `src/` (configured in `vite.config.ts` and `tsconfig.json`)

### Slug Naming Convention (Directory Data)
- Use full-name, hyphenated lowercase slugs (e.g., `gender-and-development-office`, `public-employment-service-office`)
- Avoid abbreviations (not `gad`, `peso`, `dilg`)
- For committees or non-departments, use descriptive names (e.g., `bids-and-awards-committee`)

## Code Quality Standards

- **ESLint**: Zero warnings allowed (`--max-warnings 0`)
- **Conventional Commits**: Enforced via commitlint
- **Pre-commit hooks**: Husky + lint-staged auto-format on commit
- **TypeScript strict mode** enabled

### Security Documentation
- **Security Guide**: `docs/SECURITY-GUIDE.md` - Comprehensive security architecture, authentication patterns, data protection, API security
- **Privacy Documentation**: `docs/PRIVACY.md` - Data collection, user rights, GDPR/DPA compliance
- **Security Checklist**: `docs/SECURITY-CHECKLIST.md` - Developer security checklist with best practices
- **RBAC Guide**: `docs/RBAC-IMPLEMENTATION-GUIDE.md` - Role-based access control usage
- All admin state-changing operations must use audit logging (see Audit Logging Pattern below)
- CSRF protection required for all admin POST/PUT/PATCH/DELETE endpoints

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

### Directory Data Structure
- `departments.json` - Municipal departments/administrative offices only
- `executive.json` - Elected officials (Mayor, Vice Mayor) with personal contact info
- `legislative.json` - Sangguniang Bayan with councilors and committees
- Do NOT add executive/legislative offices to departments.json

### Phone Number Format
- **Display**: `530-2981, 3000` (comma for extension, more compact)
- **tel: links**: `tel:+63495302981` (E.164 format, main number only - extensions not well-supported)
- Use `toTelUri()` utility from `@/lib/utils` for conversion
- Area code for Los Baños: 049, Philippines country code: +63

### Citizens Charter Data
Location: `src/data/citizens-charter/citizens-charter.json`

**Structure:**
- Services use `category.service_number` format (e.g., "1.1", "2.3")
- Categories 1-8: Frontline services with detailed info tables (from Citizens Charter document)
  - 1: BPLO, 2: Assessor, 3: Engineering, 4: MPDC, 5: LCR, 6: Market, 7: Slaughterhouse, 8: Agriculture
- Categories 9+: Other services without detailed tables, grouped by division
- **Important**: BPLO and Treasurer are separate divisions - do not merge

**When reorganizing:**
- Preserve exact service names from the document for categories 1-8
- Services without tables should have basic info only (no made-up requirements/steps/fees)
- Use `/tmp/` for temporary Python scripts when manipulating JSON

**Requirement Linking:**
- Requirements can optionally have a `serviceSlug` field
- If present, the requirement card becomes clickable and links to that service
- Example: "Barangay Clearance" requirement with `serviceSlug: "barangay-clearance"`

**Extraction utilities (pipeline/):**
- `citizens_charter_extractor.py` - Main orchestrator for PDF data extraction
- `cc_data_validator.py` - JSON schema validation for service data
- `cc_merge_utils.py` - Merge utilities with automatic backup
- `vision_prompt_templates.py` - Prompt templates for vision extraction

**Python packages for PDF processing:**
```bash
pip3 install --break-system-packages pdfplumber pdf2image PyPDF2  # PDF extraction
pip3 install --break-system-packages aiohttp jsonschema tqdm  # Validation utilities
```

**Verification queue:** `src/data/citizens-charter/verification-queue.json` tracks services needing extraction

**Data Quality Patterns:**
- Truncated requirements end with: "(if", "(for", ", ", " or " - flag for manual review
- Empty `agency_action` fields are common (unused in UI) - may be removed in future
- Missing `where_to_secure` (20% of requirements) - default to "Contact the office" if unknown

**Core Data Fields** (see `src/types/citizens-charter.ts` for full schema):

Required fields (all services):
- `service_number`: Unique ID (e.g., "1.1", "5.2")
- `service_name`: Official name from Citizens Charter document
- `plain_language_name`: User-friendly name following UK GOV.UK plain language principles
  - Starts with action verbs: "Get", "Apply for", "Pay", "Renew"
  - Removes bureaucratic language: "Issuance of" → "Get"
  - Under 65 characters where possible
- `office_division`: Responsible office/division
- `classification`: Service complexity - "Simple" or "Complex"
- `type_of_transaction`: Transaction type - "G2C" (citizen) or "G2B" (business)
- `who_may_avail`: Description of eligible users
- `requirements`: Array of requirements with sources
- `client_steps`: Step-by-step process (imperative language)
- `fees`: Fee information (dict format: {amount, description})
- `processing_time`: In-person transaction time

Optional fields:
- `turnaround_time`: Total time for complex services including waiting/approval periods
- `supporting_documents_detail`: Complex nested structure for conditional requirements
- `website`: Online portal URL

**Utility Functions:**
- See `src/lib/citizens-charter.ts` for helper functions:
  - `getAllServices()` - Get all services
  - `getServiceByNumber(number)` - Get by service number
  - `getServicesByOffice(office)` - Filter by office
  - `filterServices(options)` - Advanced filtering
  - `searchServices(query)` - Search in name, office, who_may_avail

## Shared Components (@betterlb/ui)

### Important: No Shared UI Package
**Note:** The `@betterlb/ui` package mentioned in older documentation no longer exists. All UI components are maintained locally in `src/components/ui/`.

### Local UI Components (src/components/ui/)
Available local components:
- `Badge` - Status and label badges (aligned with municipal branding)
- `Card` - Card container with Header, Content, Footer, Title, Description, CardGrid, CardContactInfo
- `Dialog` - Modal dialogs (Radix UI-based)
- `EmptyState` - Empty state placeholder component
- `Pagination` - PaginationControls component
- `ScrollArea` - Scrollable area with custom scrollbar
- `SearchInput` - Search input with icon and clear button
- `SelectPicker` - Multi-select dropdown with search
- `Skeletons` - CardSkeleton, DirectoryGridSkeleton, PageLoadingState
- `Tabs` - Tabbed interface (Radix UI-based)
- `Timeline` - Vertical timeline with TimelineItem
- `Ticker` - News ticker (forex/weather data)

### Import Pattern
```tsx
// All local components - import from @/components/ui
import { Badge, Card, SearchInput, EmptyState } from '@/components/ui';

// Kapwa base components - use subpath imports for each component
import { Button } from '@bettergov/kapwa/button';
import { Input } from '@bettergov/kapwa/input';
import { Label } from '@bettergov/kapwa/label';
import { Banner } from '@bettergov/kapwa/banner';
```

### Component Development Guidelines
When modifying or creating local UI components:
1. Follow Kapwa design patterns (see `docs/BetterLB-Design-System-Guide.md`)
2. Use Kapwa semantic tokens with proper Tailwind v4 prefixes
3. Ensure component variants match design system standards
4. Maintain consistent prop interfaces with TypeScript

### Office Icon Mappings
- Icon mappings in `src/lib/officeIcons.ts` map department slugs to Lucide icons
- When adding new departments, add corresponding icon mapping
- Lucide icon names are camelCase (e.g., `IdCard`, `UserCheck`, `ShieldAlert`)
- Unused icon imports will cause ESLint errors

## Kapwa Design System (@bettergov/kapwa)

BetterLB uses the Kapwa Design System published by bettergov. Transitioned from the local fork to the officially published

### Import Pattern
- **TypeScript/JavaScript**: Use `@bettergov/kapwa` subpath imports (one per component)
- **CSS**: Must use `@betterlb/kapwa/kapwa.css` (Tailwind plugin bypasses Vite resolver)

```tsx
// ✅ Correct - use subpath imports for each component
import { Button } from '@bettergov/kapwa/button';
import { Input } from '@bettergov/kapwa/input';
import { Label } from '@bettergov/kapwa/label';
import { Banner } from '@bettergov/kapwa/banner';

// ❌ Incorrect - importing from package root
import { Button, Input, Label } from '@bettergov/kapwa';
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

### Kapwa Design System Migration (Phase 1) - COMPLETED ✅

**Timeline:** February 26 - March 4, 2026
**Overall Grade:** A (95/100)
**Tasks:** T-065, T-067, T-069, T-071, T-072, T-073

**Migration Summary:**
BetterLB completed Phase 1 of Kapwa Design System migration, replacing hardcoded colors and raw Tailwind tokens with semantic tokens from the `@betterlb/kapwa` package (forked from `@bettergov/kapwa`). This migration ensures consistent styling, better maintainability, and full design system compliance across the application.

**Completed Migrations:**

**T-065: Ticker Component**
- **File:** `src/components/ui/Ticker.tsx`
- **Change:** Replaced hardcoded hex color `#fbbf24` with `text-kapwa-text-warning`
- **Impact:** 1 component, 1 token replacement
- **Quality:** ESLint zero errors, zero warnings
- **Status:** ✅ Complete

**T-067: Statistics Pages**
- **Files:**
  - `src/pages/statistics/population/index.tsx` (1 change: footer checkmark icon)
  - `src/pages/statistics/municipal-income/index.tsx` (2 changes: External section + footer)
  - `src/pages/statistics/competitiveness/index.tsx` (2 changes: "Up" rank indicator + footer)
- **Changes:** 5 raw color tokens replaced with Kapwa semantic tokens
  - `text-kapwa-text-success` (success indicators)
  - `bg-kapwa-bg-success-weak` (backgrounds)
  - `border-kapwa-border-success` (borders)
- **Preserved:** Chart colors (hex codes) for data visualization (acceptable per design system)
- **Quality:** ESLint zero errors, zero warnings; TypeScript compilation successful
- **Status:** ✅ Complete - 100% Kapwa semantic token compliance

**T-069: Admin Dashboard Compliance Audit**
- **Scope:** 14 admin dashboard files
- **Findings:**
  - ✅ **Base styling**: 70% compliant (text, backgrounds, borders use semantic tokens correctly)
  - ⚠️ **Status colors**: 27 raw color token violations found (rose/amber/emerald/slate)
  - ❌ **Typo**: `border-kap-border-weak` → should be `border-kapwa-border-weak`
- **Grade:** C+ (70/100)
- **Migration Plan:** 4 hours estimated (provided in QA report)
- **Status:** ⚠️ Partially complete - migration plan ready, awaiting execution

**T-071: ARCHITECTURE.md Documentation**
- **Added:** "UX Improvements (February-March 2026)" section documenting Phase 1 migration
- **Content:** Timeline, completed tasks, design system compliance details, quality metrics
- **Status:** ✅ Complete

**T-072: VISUAL_CONSISTENCY_PLAN.md Update**
- **Updated:** Section 5.2 (Statistics Pages) with T-067 completion details
- **Updated:** Section 7.1 (Admin Pages) with T-069 audit results
- **Status:** ✅ Complete

**T-073: Full Design System Compliance Audit**
- **Scope:** 108+ files across entire codebase
- **Overall Grade:** A (95/100)
- **Key Findings:**
  - ✅ **Tailwind v4 prefix compliance**: 100% - zero violations
  - ✅ **Semantic token usage**: 98% - excellent adoption
  - ✅ **Spacing consistency**: 100% - perfect
  - ✅ **Typography standards**: 100% - all use Kapwa classes
  - ✅ **Hardcoded colors**: 99% - only acceptable cases (error states, test data)
- **Issues:** 3 important issues identified (TermsOfService.tsx, InfoWidgets.tsx) with 15 minor acceptable use cases
- **Recommendations:** Fix 3 important issues (15 min), optional pre-commit hook enhancement
- **QA Report:** `docs/qa-reports/T-073-Design-System-Compliance-Audit-QA-Report.md`
- **Status:** ✅ Complete

**Quality Metrics:**
- ✅ ESLint: Zero errors, zero warnings (`--max-warnings 0`)
- ✅ TypeScript: Strict mode enabled, all compilations successful
- ✅ Mobile Responsive: All migrated components fully responsive
- ✅ Accessibility: WCAG 2.1 Level AA compliance maintained
- ✅ Design System: Mature adoption with exceptional prefix compliance

**Pending Work:**
- ⚠️ **T-069 Migration Execution**: Admin dashboard status colors (27 raw tokens, 4 hours)
- ⚠️ **T-073 Important Issues**: Fix 3 important issues (TermsOfService.tsx, InfoWidgets.tsx, 15 min)

**Design System Compliance:**
- **Kapwa Semantic Tokens**: 98% adoption across codebase
- **Tailwind v4 Prefixes**: 100% compliance (zero violations)
- **Chart Colors**: Hex codes preserved for data visualization (acceptable)
- **Raw Token Usage**: Limited to error states and test data (acceptable per design system guidelines)

**References:**
- ARCHITECTURE.md: "UX Improvements (February-March 2026)" section
- VISUAL_CONSISTENCY_PLAN.md: Updated with completion details
- QA Reports: T-069 (Admin Dashboard), T-073 (Full Audit)
- Navigation Design System Specification: `docs/navigation-design-system-spec.md`

**Migration Best Practices:**
1. **Always use semantic tokens** for status/feedback colors (success, error, warning, info)
2. **Preserve hex codes** for data visualization (charts, graphs)
3. **Test accessibility** after each migration (WCAG AA contrast ratios)
4. **Run ESLint** with `--max-warnings 0` to verify quality
5. **Update documentation** (ARCHITECTURE.md, VISUAL_CONSISTENCY_PLAN.md)

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

### Navigation Page Color Standards

All navigation pages MUST use Kapwa semantic tokens for colors and backgrounds to ensure consistency with the Design System.

**Background Colors:**
- Page container: `bg-kapwa-bg-surface` (all navigation pages)
- Hero header: `bg-kapwa-bg-surface-bold` (index page headers)
- Section header: `bg-kapwa-bg-hover-weak` (sub-sections within pages)
- Sidebar: `bg-kapwa-bg-surface` (sidebar container)
- Active nav item: `bg-kapwa-bg-selected` (currently selected item)
- Hover nav item: `hover:bg-kapwa-bg-hover` (interactive state)

**Text Colors:**
- Primary/headings: `text-kapwa-text-strong`
- Body text: `text-kapwa-text-default`
- Muted/secondary: `text-kapwa-text-weak`
- Inverse (on bold backgrounds): `text-kapwa-text-inverse`

**Border Colors:**
- Default borders: `border-kapwa-border-weak`
- Strong borders: `border-kapwa-border-strong`
- Focus states: `border-kapwa-border-focus`

**✅ CORRECT:**
```tsx
<div className="bg-kapwa-bg-surface min-h-screen">
  <SidebarLayout>
    <h1 className="text-kapwa-text-strong">Title</h1>
    <p className="text-kapwa-text-default">Content</p>
  </SidebarLayout>
</div>
```

**❌ INCORRECT:**
```tsx
<div className="bg-white min-h-screen">
  <SidebarLayout>
    <h1 className="text-gray-900">Title</h1>
    <p className="text-gray-600">Content</p>
  </SidebarLayout>
</div>
```

**Utility Functions:**
Use `@/lib/navigation-styles.ts` for consistent styling:
```tsx
import { navigationBackgrounds, navigationText, navigationBorders } from '@/lib/navigation-styles';

<div className={navigationBackgrounds.page}>
  <h1 className={navigationText.strong}>Title</h1>
</div>
```

**Component Wrapper:**
Use `SidebarLayout` directly for pages with sidebar navigation:
```tsx
import { SidebarLayout } from '@/components/layout/SidebarLayout';

<SidebarLayout collapsible={true} defaultCollapsed={false}>
  <PageHeader title="Page Title" />
  {/* Content */}
</SidebarLayout>
```

**Reference:** Navigation Design System Specification (`docs/navigation-design-system-spec.md`)

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

**Visual Consistency Plan** (`VISUAL_CONSISTENCY_PLAN.md`) - Page-by-page audit for improving visual consistency:
- Organized by priority (P0-P3) and page type
- Lists specific files needing updates
- Includes verification checklist
- Documents completed local UI component fixes (Badge, Card, Skeletons, ScrollArea, Timeline, Dialog, EmptyState, Pagination, Ticker)

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

---

## QA Review Process

**When tasks lack clear requirements:**
- Create comprehensive QA reports in `docs/qa-reports/T-XXX-task-name-QA-Report.md`
- Document what exists, what's missing, and provide clear recommendations
- Update todo.md with `[qa] BLOCKED - ...` notes explaining the issue
- Offer 2-3 resolution options (define requirements, close as complete, split into smaller tasks)

**Documentation QA Process:**
- Verify API documentation against implementation code for accuracy
- Check TTL values, endpoint paths, response formats match actual code
- QA reports identify critical/important issues with specific line numbers and fixes
- Example: `docs/qa-reports/T-022-OpenLGU-API-Documentation-QA-Report.md`

**Example blocked tasks:** T-009 (OpenLGU enhancements), T-037 (Design Guide redesign), T-010 (Admin dashboard improvements)

## Documentation File Locations

- `docs/qa-reports/` - QA reports for blocked/returned tasks
- `.local/docs/plan/` - Local planning documents (not in git, e.g., VISUAL_CONSISTENCY_PLAN.md)
- `docs/` - Shared documentation (checked into git)

## Component Architecture Clarification

**UI Components are maintained locally:**
- Location: `src/components/ui/` (NOT a separate `@betterlb/ui` package)
- Components: Badge, Card, Dialog, EmptyState, Pagination, ScrollArea, SearchInput, SelectPicker, Skeletons, StatCard, Tabs, Ticker, Timeline
- Import pattern: `import { Card, Badge } from '@/components/ui';`
- Kapwa base components (use subpath imports): `import { Button } from '@bettergov/kapwa/button'; import { Input } from '@bettergov/kapwa/input';`

## Code Quality Notes

**E2E Tests:**
- Located in `e2e/` directory
- Excluded from ESLint (see `.eslintignore`: `src/e2e/**`)
- Should still follow project code style standards (Kapwa tokens, TypeScript strict mode)
- Use Playwright with `@visual`, `@a11y` tags for visual regression and accessibility tests

## Task Management (todo.md)

**Format:**
- Task line: `- [x/-] T-XXX | Title | @assignee | deps: T-YYY | status:pending/in-progress/done:timestamp`
- Pipeline notes in indented lines below task: `> [pipeline] Handed off to qa stage`
- QA notes: `> [qa] BLOCKED - ...` or `> [review] APPROVED/COMPLETED`

**Pipeline stages:** develop → qa → review → done

---

## Navigation Page Layout Standard

**All navigation pages** (services, government, statistics, transparency, OpenLGU) use `SidebarLayout`:

```tsx
import { SidebarLayout } from '@/components/layout/SidebarLayout';

// Index pages (expanded sidebar)
<SidebarLayout collapsible={true} defaultCollapsed={false}>
  <PageHero title="Page Title" />
  {/* Content */}
</SidebarLayout>

// Detail pages (collapsed sidebar)
<SidebarLayout collapsible={true} defaultCollapsed={true}>
  <PageHero title="Detail Title" />
  {/* Content */}
</SidebarLayout>
```

**Benefits:**
- Consistent `bg-kapwa-bg-surface` background
- Responsive sidebar with mobile toggle
- Collapse mode for content-focused pages
- 100% Kapwa semantic token compliance

**Components Introduced:**
- T-133: SidebarLayout improvements (responsive mobile toggle, collapse mode)
- T-125: IndexPageLayout - For index/listing pages with search/pagination
- T-126: DetailPageLayout - For detail pages with section navigation

**Reference:** `docs/navigation-design-system-spec.md`, `docs/BetterLB-Design-System-Guide.md` Section 4

---

## Chart Component Standards

**All charts** MUST follow the Chart Component Design System Specification (`docs/chart-component-design-system-spec.md`):

**Components:**
- `ChartTooltip` - Unified accessible tooltip (REQUIRED for all charts)
- `ResponsiveChart` - Lightweight wrapper for charts in existing containers
- `ChartContainer` - Full card-style wrapper for standalone charts

**Theme Configuration:**
```tsx
import { CHART_THEME, standardAxisProps } from '@/constants/charts';

// ALWAYS use these for consistency
<LineChart data={chartData}>
  <CartesianGrid vertical={false} stroke={CHART_THEME.grid} />
  <XAxis dataKey='year' {...standardAxisProps} />
  <YAxis {...standardAxisProps} />
  <Tooltip content={<ChartTooltip />} />
</LineChart>
```

**Color Standards:**
- Single series: Municipal Blue (`#0066eb`)
- Multi-series (2-3): Brand-aligned palette (Blue, Orange, Green)
- Multi-series (4+): BRGY_COLORS array (14 distinct colors)

**Quality Requirements:**
- TypeScript strict mode (no `any` types)
- ESLint `--max-warnings 0` compliance
- Kapwa semantic tokens for non-chart styling
- WCAG 2.1 Level AA accessibility

**Reference:** T-124 (Chart Component Design System Specification, 1,200+ lines)

---

## Component Documentation

**BetterLB Design System Guide** (`docs/BetterLB-Design-System-Guide.md`) is comprehensive:

**Section 3: Component Library**
- All Kapwa base components (Button, Banner, Input, Label, Card)
- Local UI components (Badge, Card, EmptyState, SearchInput, etc.)

**Section 4: Layout Components** (Updated T-134)
- PageHero, ModuleHeader, DetailSection (existing)
- SidebarLayout ✅ NEW (T-133)
- IndexPageLayout ✅ NEW (T-125)
- DetailPageLayout ✅ NEW (T-126)

**Section 5: Page Layout Patterns**
- Homepage, index/list, detail, dashboard, search results
- Navigation patterns with sidebar layouts

**Reference:** Always check the Design System Guide before creating new components or pages.

---

## Code Quality Enforcement

**ESLint:** Zero tolerance policy
```bash
npm run lint  # Must pass with --max-warnings 0
```

**Kapwa Semantic Tokens:** Required for all styling
- ✅ `text-kapwa-text-*` for text colors
- ✅ `bg-kapwa-bg-*` for backgrounds
- ✅ `border-kapwa-border-*` for borders
- ❌ NO raw color tokens (gray, slate, white)
- ❌ NO hardcoded hex colors (except acceptable cases: error states, chart data)

**Verification Commands:**
```bash
# Check for raw color tokens
grep -rn "text-gray\|bg-gray\|border-gray\|text-slate\|bg-slate\|border-slate" src/

# Should return: No raw color tokens found
```

**TypeScript:** Strict mode required
- No `any` types
- Proper interface definitions
- Type-safe data transformations

**Documentation:** JSDoc required for public APIs
- Component props interfaces
- Exported functions
- Complex utilities
