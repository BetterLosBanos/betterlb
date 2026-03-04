# Developer Contribution Guide Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Create comprehensive BetterLB-specific developer contribution guide (`docs/DEVELOPER_GUIDE.md`) covering setup, architecture, workflows, testing, deployment, and LGU forking process.

**Architecture:** Single comprehensive markdown document (~2500 lines) with 12 major sections, integrating existing docs (ARCHITECTURE.md, ADMIN_GUIDE.md, etc.) with step-by-step developer workflows. Code examples, diagrams, and cross-references to detailed documentation.

**Tech Stack:** Markdown, diagrams (text-based), code examples (TypeScript, Python, SQL, Bash)

---

## Task 1: Create Document Skeleton and Header

**Files:**
- Create: `docs/DEVELOPER_GUIDE.md`

**Step 1: Write document header with overview**

```markdown
# BetterLB Developer Contribution Guide

> BetterLB - Municipal Government Portal for Los Baños, Laguna, Philippines
> Fork of BetterGov.ph, customized for municipal LGU adoption

**Last Updated:** 2026-02-27
**Target Audience:** Developers contributing to BetterLB or forking for their municipality

---

## Table of Contents

1. [Quick Start](#1-quick-start-5-minutes)
2. [Project Overview](#2-project-overview)
3. [Development Environment](#3-development-environment)
4. [Project Structure](#4-project-structure)
5. [Development Workflows](#5-development-workflows)
6. [Common Tasks](#6-common-tasks)
7. [Design System](#7-design-system)
8. [Data Management](#8-data-management)
9. [Testing Guide](#9-testing-guide)
10. [Deployment](#10-deployment)
11. [For LGU Adopters](#11-for-lgu-adopters)
12. [Troubleshooting](#12-troubleshooting)
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: create developer contribution guide skeleton"
```

---

## Task 2: Write Quick Start Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Quick Start section**

```markdown
## 1. Quick Start (5 minutes)

Get up and running with BetterLB development in 5 minutes.

### Prerequisites

- **Node.js:** v20+ (v22 recommended)
- **npm:** v10+ or **pnpm** v8+
- **Python:** v3.10+ (for data pipeline)
- **Git:** Latest version
- **Code Editor:** VS Code (recommended)

### Installation

\`\`\`bash
# 1. Clone repository
git clone https://github.com/betterlosbanos/betterlb.git
cd betterlb

# 2. Install frontend dependencies
npm install

# 3. Install Python dependencies (for data pipeline)
pip3 install --break-system-packages pdfplumber pdf2image PyPDF2 aiohttp jsonschema tqdm

# 4. Merge services data
python3 scripts/merge_services.py
\`\`\`

### Run Development Server

\`\`\`bash
# Frontend only (port 5173)
npm run dev

# Full stack with Functions backend (ports 5173 + 8788)
npx wrangler pages dev --proxy 5173 -- npm run dev
\`\`\`

Visit: http://localhost:5173

### Make Your First Change

1. Edit `src/pages/index.tsx`
2. Save file (Vite HMR reloads automatically)
3. See changes at http://localhost:5173

### Next Steps

- Read [Project Overview](#2-project-overview) for architecture
- Set up [Development Environment](#3-development-environment) for full stack
- Explore [Common Tasks](#6-common-tasks) for workflows
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add quick start section to developer guide"
```

---

## Task 3: Write Project Overview Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Project Overview section**

```markdown
## 2. Project Overview

### What is BetterLB?

**BetterLB** is a municipal government portal for Los Baños, Laguna, Philippines. It's a fork and localization of [BetterGov.ph](https://bettergov.ph), customized for municipal-level government transparency and service delivery.

**Key Features:**
- 🔍 **Services Directory:** Citizens Charter with 80+ frontline services
- 📜 **Legislative Tracking:** Ordinances, resolutions, executive orders
- 👥 **Government Directory:** Departments, elected officials, barangays
- 📊 **Transparency Dashboard:** Budget, procurement, infrastructure data
- 🗺️ **Interactive Maps:** Barangay boundaries, facility locations
- 🌐 **Bilingual:** English and Filipino (i18next)

### Technical Stack

**Frontend:**
- **React 19** with TypeScript strict mode
- **Vite 6** for build tooling
- **Tailwind CSS v4** with Kapwa Design System
- **React Router** v6 for routing
- **i18next** for internationalization

**Backend:**
- **Cloudflare Pages Functions** (serverless API)
- **D1 Database** (SQLite-based, edge-native)
- **KV** for caching (weather data)

**Data Pipeline:**
- **Python** scripts for PDF processing
- **Meilisearch** for fuzzy search
- Automated data validation

**Testing:**
- **Playwright** for E2E tests
- **Vitest** for unit tests
- **ESLint** with --max-warnings 0
- **Conventional Commits** with commitlint

### Architecture Diagram

See [ARCHITECTURE.md](../ARCHITECTURE.md) for complete system architecture including:
- JAMstack architecture (static frontend + serverless backend)
- Cloudflare Pages deployment
- D1 database schema
- Data pipeline workflow

### BetterLB vs BetterGov.ph

| Aspect | BetterGov.ph | BetterLB |
|--------|--------------|----------|
| Scope | National government | Municipal (Los Baños) |
| Backend | Generic | Cloudflare Functions + D1 |
| Database | Not specified | SQLite (D1) with migrations |
| Search | Basic | Meilisearch integration |
| Data Pipeline | Not specified | Python PDF processing |
| Tech Stack | Generic | React 19, Vite 6, Tailwind v4 |
| LGU Focus | N/A | Forkable for municipalities |

### Key Concepts

**JAMstack Architecture:**
- Static frontend (pre-built React app)
- Serverless API endpoints (Cloudflare Functions)
- Edge database (D1)
- Global CDN (Cloudflare)

**Data Flow:**
1. Python pipeline processes PDFs → JSON
2. JSON data validated and loaded into D1
3. React app queries D1 via Functions API
4. Meilisearch indexes searchable content
5. Frontend displays data with Kapwa components

**Design System:**
- Fork of Kapwa (@betterlb/kapwa)
- Semantic tokens for theming
- WCAG 2.1 AA accessibility
- Municipal branding customization
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add project overview section"
```

---

## Task 4: Write Development Environment Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Development Environment section**

```markdown
## 3. Development Environment

### Frontend Setup

#### Install Node.js Dependencies

\`\`\`bash
npm install
\`\`\`

#### Run Development Server

\`\`\`bash
# Frontend only (Vite dev server on port 5173)
npm run dev

# Open browser to http://localhost:5173
\`\`\`

### Backend Setup (Cloudflare Functions)

#### Install Wrangler CLI

\`\`\`bash
npm install -g wrangler
\`\`\`

#### Configure Local D1 Database

\`\`\`bash
# Create local D1 database
npx wrangler d1 create BETTERLB_DB --local

# Run migrations
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql
\`\`\`

#### Start Functions Dev Server

\`\`\`bash
# Start Functions backend on port 8788 with Vite frontend proxy
npx wrangler pages dev --proxy 5173 -- npm run dev

# API endpoints available at http://localhost:8788/api/*
\`\`\`

### Search Setup (Meilisearch - Optional)

Meilisearch is optional for local development. The app works without it (fallback to client-side filtering).

#### Install Meilisearch

\`\`\`bash
# macOS
brew install meilisearch

# Linux
curl -L https://install.meilisearch.com | sh

# Start Meilisearch
meilisearch
\`\`\`

#### Configure Search Index

See [MEILISEARCH_INTEGRATION_GUIDE.md](MEILISEARCH_INTEGRATION_GUIDE.md) for setup instructions.

### Environment Variables

Create `.env` file in project root (see `.env.example`):

\`\`\`bash
# Vite
VITE_MEILISEARCH_HOST=http://localhost:7700
VITE_MEILISEARCH_API_KEY=masterKey

# Cloudflare (for Wrangler commands)
# Get from Cloudflare Dashboard
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_API_TOKEN=your-api-token
\`\`\`

### IDE Configuration

#### VS Code Extensions (Recommended)

- **ESLint** - Linting
- **Prettier** - Code formatting
- **Tailwind CSS IntelliSense** - CSS autocomplete
- **vitest** - Unit testing
- **Playwright** - E2E testing

#### VS Code Settings

Create `.vscode/settings.json`:

\`\`\`json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "files.associations": {
    "*.tsx": "typescriptreact"
  }
}
\`\`\`

### Python Environment (Data Pipeline)

#### Install Python Dependencies

\`\`\`bash
pip3 install --break-system-packages \\
  pdfplumber pdf2image PyPDF2 \\
  aiohttp jsonschema tqdm
\`\`\`

#### Verify Python Setup

\`\`\`bash
python3 scripts/merge_services.py --help
\`\`\`
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add development environment section"
```

---

## Task 5: Write Project Structure Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Project Structure section**

```markdown
## 4. Project Structure

### Directory Overview

\`\`\`
betterlb/
├── db/                          # Database
│   └── migrations/              # D1 database migration files
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md          # System architecture
│   ├── ADMIN_GUIDE.md           # Admin panel guide
│   └── ...
├── e2e/                         # E2E Tests (Playwright)
│   ├── government/              # Government pages tests
│   ├── services/                # Services pages tests
│   └── ...
├── functions/                   # Cloudflare Pages Functions (API)
│   └── api/                     # API endpoints
│       ├── admin/               # Admin endpoints
│       ├── openlgu/             # OpenLGU integration
│       └── weather.ts           # Weather endpoint
├── pipeline/                    # Python Data Pipeline
│   ├── 1_scrape.py              # Web scraping
│   ├── 2_download.py            # PDF downloads
│   ├── 3_parse.py               # PDF parsing
│   └── 4_generate.py            # JSON generation
├── public/                      # Static assets
│   └── locales/                 # i18next translation files
│       ├── en/                  # English
│       └── tl/                  # Filipino
├── scripts/                     # Utility scripts
│   └── merge_services.py        # Merge category files
├── src/                         # Frontend Source
│   ├── components/              # React Components
│   │   ├── admin/               # Admin-specific components
│   │   ├── data-display/        # Data visualization
│   │   ├── government/          # Government-specific
│   │   ├── layout/              # Layout components
│   │   ├── map/                 # Leaflet maps
│   │   ├── navigation/          # Navigation (breadcrumbs, sidebar)
│   │   ├── search/              # Search components
│   │   └── ui/                  # UI Components (local)
│   ├── data/                    # Static Data
│   │   ├── citizens-charter/    # Citizens Charter data
│   │   └── directory/           # Government directory
│   ├── lib/                     # Utilities
│   │   ├── citizens-charter.ts  # Citizens Charter utilities
│   │   └── utils.ts             # General utilities
│   ├── pages/                   # Pages (file-based routing)
│   │   ├── government/          # Government section
│   │   ├── services/            # Services section
│   │   └── ...
│   └── types/                   # TypeScript Types
├── .env.example                 # Environment variables template
├── ARCHITECTURE.md              # System architecture (root-level)
├── CLAUDE.md                    # Claude Code instructions
├── package.json                 # NPM dependencies
├── tsconfig.json                # TypeScript config
├── vite.config.ts               # Vite config
└── wrangler.jsonc               # Cloudflare config
\`\`\`

### Frontend Structure (src/)

**Components (`src/components/`):**

- `ui/` - Local UI components (Card, Badge, SearchInput, etc.)
- `layout/` - Layout components (PageHero, SidebarLayout, etc.)
- `navigation/` - Navigation (Breadcrumb, SidebarNavigation)
- `government/` - Government-specific (OfficialCard, BarangayHeader)
- `pages/` - Page-level components

**Pages (`src/pages/`):**

File-based routing via React Router:
- `index.tsx` → `/` (homepage)
- `government/departments/index.tsx` → `/government/departments`
- `services/[service].tsx` → `/services/:service`

**Data (`src/data/`):**

- `citizens-charter/` - Citizens Charter service data
- `directory/` - Government directory (departments, barangays, officials)

### Backend Structure (functions/)

**API Endpoints (`functions/api/`):**

\`\`\`
functions/api/
├── admin/
│   ├── documents/[id].ts       # GET/PUT/PATCH document
│   ├── review-queue/            # Review queue management
│   └── sessions/                # Legislative sessions
├── openlgu/
│   └── sessions/[id].ts         # OpenLGU session data
└── weather.ts                   # Weather data with KV cache
\`\`\`

**D1 Bindings:**

All Functions have access to D1 via `env.DB` binding:

\`\`\`typescript
export async function onRequest(context) {
  const { env } = context;
  const db = env.DB as D1Database;

  const result = await db.prepare('SELECT * FROM documents').all();
  return Response.json(result);
}
\`\`\`

### Data Pipeline Structure (pipeline/)

Python scripts numbered for execution order:

1. **1_scrape.py** - Scrape Los Baños official sources
2. **1.5_normalize.py** - Normalize scraped data
3. **2_download.py** - Download PDF documents
4. **3_parse.py** - Parse PDFs (extract text, metadata)
5. **4_generate.py** - Generate JSON files for frontend

Run in sequence:

\`\`\`bash
python3 pipeline/1_scrape.py
python3 pipeline/1.5_normalize.py
python3 pipeline/2_download.py
python3 pipeline/3_parse.py
python3 pipeline/4_generate.py
\`\`\`

### Testing Structure (e2e/)

Playwright E2E tests organized by feature:

\`\`\`
e2e/
├── government/
│   ├── barangays.spec.ts        # Barangays pages
│   ├── departments.spec.ts      # Departments pages
│   └── elected-officials.spec.ts # Elected officials pages
└── reference-implementation.spec.ts # Design system reference
\`\`\`

Run tests:

\`\`\`bash
npm run test:e2e
\`\`\`
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add project structure section"
```

---

## Task 6: Write Development Workflows Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Development Workflows section**

```markdown
## 5. Development Workflows

### Frontend Development

#### Create a New Page

1. Create file in `src/pages/`:

\`\`\`typescript
// src/pages/my-page/index.tsx
export default function MyPage() {
  return (
    <div className="min-h-screen bg-kapwa-bg-surface">
      <h1 className="kapwa-heading-lg text-kapwa-text-strong">
        My New Page
      </h1>
    </div>
  );
}
\`\`\`

2. Visit: http://localhost:5173/my-page

#### Create a New Component

1. Create in appropriate directory:

\`\`\`typescript
// src/components/my-feature/MyComponent.tsx
interface MyComponentProps {
  title: string;
  description?: string;
}

export function MyComponent({ title, description }: MyComponentProps) {
  return (
    <div className="bg-kapwa-bg-surface border-kapwa-border-weak rounded-lg p-4">
      <h3 className="kapwa-heading-md text-kapwa-text-strong">
        {title}
      </h3>
      {description && (
        <p className="kapwa-body-md text-kapwa-text-support">
          {description}
        </p>
      )}
    </div>
  );
}
\`\`\`

2. Use in page:

\`\`\`import { MyComponent } from '@/components/my-feature/MyComponent';

<MyComponent title="Hello" description="World" />
\`\`\`

#### Add Translations

1. Add to namespace files:

\`\`\`json
// public/locales/en/my-page.json
{
  "title": "My Page",
  "description": "Page description"
}

// public/locales/tl/my-page.json
{
  "title": "Aking Pahina",
  "description": "Paglalarawan ng pahina"
}
\`\`\`

2. Use in component:

\`\`\`import { useTranslation } from 'react-i18next';

const { t } = useTranslation('my-page');
<h1>{t('title')}</h1>
\`\`\`

### Backend API Development

#### Create API Endpoint

1. Create file in `functions/api/`:

\`\`\`typescript
// functions/api/my-endpoint/index.ts
import type { RequestContext } from '@cloudflare/workers-types';

export async function onRequest(context: RequestContext) {
  const { request, env } = context;
  const db = env.DB as D1Database;

  // Query D1 database
  const result = await db
    .prepare('SELECT * FROM my_table LIMIT 10')
    .all();

  // Return JSON response
  return Response.json({
    success: true,
    data: result.results
  });
}
\`\`\`

2. Access at: http://localhost:8788/api/my-endpoint

#### Query D1 Database

\`\`\`typescript
// Single row
const doc = await db
  .prepare('SELECT * FROM documents WHERE id = ?')
  .bind(id)
  .first();

// Multiple rows
const docs = await db
  .prepare('SELECT * FROM documents WHERE type = ?')
  .bind(type)
  .all();

// Execute write
await db
  .prepare('INSERT INTO documents (title) VALUES (?)')
  .bind(title)
  .run();
\`\`\`

### Data Pipeline Development

#### Process Legislative PDFs

1. Place PDFs in input directory:

\`\`\`bash
cp /path/to/pdfs/*.pdf pipeline/input/
\`\`\`

2. Run pipeline scripts:

\`\`\`bash
python3 pipeline/3_parse.py
python3 pipeline/4_generate.py
\`\`\`

3. Output: JSON files in `src/data/legislative/`

#### Add Custom Processing Logic

1. Edit pipeline scripts:

\`\`\`python
# pipeline/3_parse.py
def parse_custom_fields(pdf_text):
    # Add your custom parsing logic
    pass
\`\`\`

### Testing Workflows

#### Write Unit Test

1. Create test file:

\`\`\`typescript
// src/lib/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-util';

describe('myFunction', () => {
  it('returns expected result', () => {
    expect(myFunction('input')).toBe('output');
  });
});
\`\`\`

2. Run test:

\`\`\`bash
npm test
\`\`\`

#### Write E2E Test

1. Create test file:

\`\`\`typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test('my feature works', async ({ page }) => {
  await page.goto('/my-page');
  await expect(page.locator('h1')).toContainText('My Page');
});
\`\`\`

2. Run test:

\`\`\`bash
npm run test:e2e -- e2e/my-feature.spec.ts
\`\`\`

### Code Quality Workflows

#### Lint Code

\`\`\`bash
npm run lint
\`\`\`

**Required:** Zero warnings (`--max-warnings 0`)

#### Format Code

\`\`\`bash
npm run format
\`\`\`

#### Pre-commit Hooks

Husky runs automatically on commit:

- ESLint
- Prettier format
- Type check

Fix issues and commit again.

### Conventional Commits

Follow commit message format:

\`\`\`bash
feat(component): add new feature
fix(api): correct query error
docs: update developer guide
test(e2e): add missing test case
refactor(pages): improve page layout
\`\`\`

Auto-enforced by commitlint on commit.
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add development workflows section"
```

---

## Task 7: Write Common Tasks Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Common Tasks section**

```markdown
## 6. Common Tasks

### Add a New Page Route

1. Create page file:

\`\`\`typescript
// src/pages/my-new-page/index.tsx
import { PageHero } from '@/components/layout';

export default function MyNewPage() {
  return (
    <div>
      <PageHero title="My New Page" />
      {/* Page content */}
    </div>
  );
}
\`\`\`

2. Add navigation link:

\`\`\`typescript
// src/components/navigation/Navbar.tsx
<Link to="/my-new-page">My New Page</Link>
\`\`\`

### Add a Reusable Component

1. Create component file:

\`\`\`typescript
// src/components/widgets/MyWidget.tsx
interface MyWidgetProps {
  data: string;
}

export function MyWidget({ data }: MyWidgetProps) {
  return (
    <div className="bg-kapwa-bg-surface border-kapwa-border-weak rounded-lg p-4">
      {data}
    </div>
  );
}
\`\`\`

2. Export from index (if needed):

\`\`\`typescript
// src/components/widgets/index.ts
export { MyWidget } from './MyWidget';
\`\`\`

### Add Service to Citizens Charter

1. Edit service category file:

\`\`\`json
// src/data/services/categories/bplo.json
{
  "services": [
    {
      "service_number": "1.15",
      "service_name": "New Service",
      "plain_language_name": "Get New Service",
      ...
    }
  ]
}
\`\`\`

2. Merge category files:

\`\`\`bash
python3 scripts/merge_services.py
\`\`\`

### Process Legislative PDF

1. Add PDF to pipeline input:

\`\`\`bash
cp ordinance-001.pdf pipeline/input/
\`\`\`

2. Run pipeline:

\`\`\`bash
python3 pipeline/3_parse.py
\`\`\`

3. Verify output in `src/data/legislative/`

### Run Tests

\`\`\`bash
# All tests
npm test

# Specific test file
npm test -- src/lib/utils.test.ts

# Watch mode
npm test -- --watch

# E2E tests
npm run test:e2e

# Specific E2E test
npm run test:e2e -- e2e/government/barangays.spec.ts
\`\`\`

### Build for Production

\`\`\`bash
npm run build
\`\`\`

Output: `dist/` directory

### Deploy to Cloudflare Pages

\`\`\`bash
# Login to Wrangler
npx wrangler login

# Deploy
npx wrangler pages deploy dist
\`\`\`

### Add Translation

1. Add to both locale files:

\`\`\`json
// public/locales/en/common.json
{
  "myKey": "My Translation"
}

// public/locales/tl/common.json
{
  "myKey": "Aking Salin"
}
\`\`\`

2. Use in component:

\`\`\`import { useTranslation } from 'react-i18next';
const { t } = useTranslation('common');
<span>{t('myKey')}</span>
\`\`\`

### Debug API Endpoint

1. Start Functions dev server:

\`\`\`bash
npx wrangler pages dev --proxy 5173
\`\`\`

2. Test endpoint:

\`\`\`bash
curl http://localhost:8788/api/my-endpoint
\`\`\`

3. Check logs in terminal

### Add Database Migration

1. Create migration file:

\`\`\`sql
-- db/migrations/002_add_my_table.sql
CREATE TABLE IF NOT EXISTS my_table (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL
);
\`\`\`

2. Run migration:

\`\`\`bash
# Local
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/002_add_my_table.sql

# Production
npx wrangler d1 execute betterlb_openlgu --file=db/migrations/002_add_my_table.sql
\`\`\`
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add common tasks section"
```

---

## Task 8: Write Design System Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Design System section**

```markdown
## 7. Design System

BetterLB uses the **Kapwa Design System** fork (@betterlb/kapwa).

### Kapwa Basics

**Install:**

\`\`\`bash
npm install @betterlb/kapwa
\`\`\`

**Import Components:**

\`\`\`typescript
import { Button, Input, Label } from '@bettergov/kapwa';
\`\`\`

**Import CSS:**

\`\`\`css
/* src/index.css */
@import '@betterlb/kapwa/kapwa.css';
\`\`\`

### Semantic Tokens

**Always use Kapwa semantic tokens:**

\`\`\`tsx
// ✅ Correct
<div className="bg-kapwa-bg-surface text-kapwa-text-strong">
  Content
</div>

// ❌ Wrong
<div className="bg-white text-slate-900">
  Content
</div>
\`\`\`

**Token Categories:**

- **Text:** `text-kapwa-text-strong`, `text-kapwa-text-support`, `text-kapwa-text-disabled`
- **Background:** `bg-kapwa-bg-surface`, `bg-kapwa-bg-surface-raised`, `bg-kapwa-bg-surface-bold`
- **Border:** `border-kapwa-border-weak`, `border-kapwa-border-default`, `border-kapwa-border-strong`
- **Colors:** `bg-kapwa-blue-600`, `text-kapwa-orange-600`, etc.

### Component Patterns

**Card Pattern:**

\`\`\`tsx
import { Card, CardHeader, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <h3 className="kapwa-heading-md text-kapwa-text-strong">
      Card Title
    </h3>
  </CardHeader>
  <CardContent>
    <p className="kapwa-body-md text-kapwa-text-support">
      Card content
    </p>
  </CardContent>
</Card>
\`\`\`

**Button Pattern:**

\`\`\`tsx
import { Button } from '@bettergov/kapwa';

<Button variant="primary" onClick={handleClick}>
  Click Me
</Button>
\`\`\`

**Badge Pattern:**

\`\`\`tsx
import { Badge } from '@/components/ui';

<Badge variant="success">Active</Badge>
\`\`\`

### Local UI Components

BetterLB maintains local UI components in `src/components/ui/`:

- **Card** - Advanced card with sub-components
- **Badge** - Status badges with variants
- **SearchInput** - Search input with clear button
- **EmptyState** - Empty state placeholder
- **Timeline** - Vertical timeline component
- **Dialog** - Modal dialogs
- **Pagination** - Pagination controls
- **ScrollArea** - Custom scrollbar
- **Skeletons** - Loading skeletons

**Import:**

\`\`\`tsx
import { Card, Badge, SearchInput } from '@/components/ui';
\`\`\`

### Styling Conventions

**Spacing:** Use Kapwa spacing tokens:

\`\`\`tsx
<div className="p-kapwa-md gap-kapwa-lg">
\`\`\`

**Typography:** Use Kapwa type scale:

\`\`\`tsx
<h1 className="kapwa-heading-lg text-kapwa-text-strong">
<p className="kapwa-body-md text-kapwa-text-support">
\`\`\`

### Accessibility

**WCAG 2.1 Level AA Compliance:**

- Color contrast: Minimum 4.5:1
- Keyboard navigation: Tab, Enter, Escape
- ARIA labels: On interactive elements
- Semantic HTML: Use proper elements

**Example:**

\`\`\`tsx
<button
  className="focus:ring-kapwa-border-focus focus:ring-2"
  aria-label="Close dialog"
  onClick={onClose}
>
  <XIcon aria-hidden="true" />
</button>
\`\`\`

### Customization for Municipalities

**Update Brand Colors:**

1. Edit Kapwa tokens in `tailwind.config.js`:

\`\`\`js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Municipal brand colors
        'municipal-primary': '#your-color',
      }
    }
  }
}
\`\`\`

2. Update semantic tokens

**Reference:** See [BetterLB-Design-System-Guide.md](BetterLB-Design-System-Guide.md) for complete design system documentation.
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add design system section"
```

---

## Task 9: Write Data Management Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Data Management section**

```markdown
## 8. Data Management

### Services Directory (Citizens Charter)

**Location:** `src/data/services/categories/`

**Structure:**

\`\`\`json
{
  "category_name": "BPLO",
  "category_slug": "bplo",
  "services": [
    {
      "service_number": "1.1",
      "service_name": "Business Permit Renewal",
      "plain_language_name": "Renew Business Permit",
      "office_division": "Business Permits and Licensing Office",
      "classification": "Simple",
      "type_of_transaction": "G2B",
      "who_may_avail": "Business owners with existing permits",
      "requirements": [],
      "client_steps": [],
      "fees": {},
      "processing_time": "30 minutes"
    }
  ]
}
\`\`\`

**Update Process:**

1. Edit category file
2. Run merge script: `python3 scripts/merge_services.py`
3. Verify: `src/data/citizens-charter/merged-services.json`

### Government Directory

**Departments:** `src/data/directory/departments.json`

\`\`\`json
{
  "slug": "budget-office",
  "office_name": "Municipal Budget Office",
  "department_head": {
    "name": "Juan Dela Cruz",
    "role": "Department Head"
  },
  "trunkline": ["(049) 123-4567"],
  "address": "Los Baños, Laguna"
}
\`\`\`

**Barangays:** `src/data/directory/barangays.json`

\`\`\`json
{
  "slug": "barangay-anos",
  "barangay_name": "BARANGAY ANOS",
  "officials": [
    {
      "name": "Maria Santos",
      "role": "Punong Barangay"
    }
  ]
}
\`\`\`

**Elected Officials:** `src/data/directory/executive.json` and `legislative.json`

### Legislative Data

**Location:** `src/data/legislative/` (generated by pipeline)

**Structure:**

\`\`\`json
{
  "id": "ordinance-001-2024",
  "number": "2024-001",
  "type": "ordinance",
  "title": "An Ordinance...",
  "authors": ["Councilor Name"],
  "date_passed": "2024-01-15",
  "pdf_url": "/documents/ordinances/2024-001.pdf"
}
\`\`\`

**Update Process:**

Run Python pipeline (see [Development Workflows](#5-development-workflows))

### Translation Files

**Location:** `public/locales/{locale}/{namespace}.json`

**Namespaces:**

- `common.json` - Shared translations
- `services.json` - Services-specific
- `government.json` - Government pages
- Page-specific namespaces

**Add New Namespace:**

1. Register in `src/i18n.ts`:

\`\`\`typescript
i18next.init({
  ns: ['common', 'my-new-namespace'],
  defaultNS: 'common'
});
\`\`\`

2. Create files:

\`\`\`json
// public/locales/en/my-new-namespace.json
{
  "key": "Translation"
}
\`\`\`

### Data Validation

**JSON Schema Validation:**

\`\`\`bash
node scripts/validate-json-schema.js \\
  src/data/directory/schema/departments.schema.json \\
  "src/data/directory/departments.json"
\`\`\`

**See:** JSON Schema Validation section in CONTRIBUTING.md

### Data Quality Patterns

**Phone Number Format:**

- **Display:** `530-2981, 3000`
- **tel: links:** `tel:+63495302981` (use `toTelUri()` utility)

**Slug Naming:**

- Use full-name, hyphenated lowercase
- Avoid abbreviations: `gender-and-development-office` (not `gad`)
- For non-departments: use descriptive names

**Reference:** See CLAUDE.md for complete data structure documentation
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add data management section"
```

---

## Task 10: Write Testing Guide Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Testing Guide section**

```markdown
## 9. Testing Guide

### Unit Tests (Vitest)

**Run Unit Tests:**

\`\`\`bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Specific file
npm test -- src/lib/utils.test.ts

# Coverage report
npm test -- --coverage
\`\`\`

**Write Unit Test:**

\`\`\`typescript
// src/lib/my-util.test.ts
import { describe, it, expect } from 'vitest';
import { myFunction } from './my-util';

describe('myFunction', () => {
  it('returns expected result', () => {
    expect(myFunction('input')).toBe('output');
  });

  it('handles edge case', () => {
    expect(myFunction(null)).toBe(null);
  });
});
\`\`\`

**Test React Components:**

\`\`\`typescript
// src/components/ui/Button.test.tsx
/**
 * @vitest-environment jsdom
 */
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from './Button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('calls onClick handler', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);

    screen.getByText('Click').click();
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
\`\`\`

### E2E Tests (Playwright)

**Run E2E Tests:**

\`\`\`bash
# All tests
npm run test:e2e

# Specific test file
npm run test:e2e -- e2e/government/barangays.spec.ts

# Specific test
npm run test:e2e -- --grep "search functionality"

# UI mode
npm run test:e2e -- --ui
\`\`\`

**Write E2E Test:**

\`\`\`typescript
// e2e/my-feature.spec.ts
import { test, expect } from '@playwright/test';

test.describe('My Feature', () => {
  test('page loads successfully', async ({ page }) => {
    await page.goto('/my-page');

    // Check heading
    await expect(page.locator('h1')).toContainText('My Page');

    // Check for semantic tokens
    const body = await page.locator('body').innerHTML();
    expect(body).toMatch(/text-kapwa-text-/);
    expect(body).not.toMatch(/text-slate-\d+/);
  });

  test('button click works', async ({ page }) => {
    await page.goto('/my-page');

    await page.click('button[data-testid="submit"]');

    // Verify result
    await expect(page.locator('.success-message')).toBeVisible();
  });
});
\`\`\`

**Test Design System Compliance:**

\`\`\`typescript
test('uses Kapwa semantic tokens', async ({ page }) => {
  await page.goto('/my-page');

  const body = await page.locator('body').innerHTML();

  // Should have semantic tokens
  expect(body).toMatch(/text-kapwa-text-/);
  expect(body).toMatch(/bg-kapwa-bg-/);
  expect(body).toMatch(/border-kapwa-border-/);

  // Should NOT have raw colors
  expect(body).not.toMatch(/text-(slate|gray|blue)-\d+/);
  expect(body).not.toMatch(/bg-(slate|gray|white)-\d+/);
});
\`\`\`

**Test Accessibility:**

\`\`\`typescript
test('has accessible skip link', async ({ page }) => {
  await page.goto('/my-page');

  const skipLink = page.locator('a[href="#main-content"]');
  await expect(skipLink).toHaveAttribute('class', /sr-only/);
});
\`\`\`

### Testing Best Practices

**TDD Approach:**

1. Write failing test
2. Run test to verify failure
3. Write minimal implementation
4. Run test to verify pass
5. Refactor
6. Commit

**Test Organization:**

- Unit tests: Co-located with source (`.test.ts` suffix)
- E2E tests: In `e2e/` directory by feature
- Test helpers: In `e2e/helpers/` or `tests/helpers/`

**Coverage Goals:**

- Critical paths: >80% coverage
- UI components: >70% coverage
- Utility functions: 100% coverage

**See:** Existing test files for examples:
- `src/lib/utils.test.ts`
- `e2e/government/barangays.spec.ts`
- `e2e/reference-implementation.spec.ts`
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add testing guide section"
```

---

## Task 11: Write Deployment Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Deployment section**

```markdown
## 10. Deployment

### Local Build

\`\`\`bash
npm run build
\`\`\`

Output: `dist/` directory

Build includes:
- TypeScript compilation
- Vite bundling
- Asset optimization
- Merged data files

### Cloudflare Pages Deployment

#### Deploy via Wrangler

\`\`\`bash
# Build
npm run build

# Deploy
npx wrangler pages deploy dist
\`\`\`

#### Deploy via Git Integration (Recommended)

1. Push to GitHub
2. Connect repository to Cloudflare Pages
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Root directory:** `/`

Auto-deploys on push to main branch.

### Environment Variables

Set in Cloudflare Pages Dashboard:

\`\`\`bash
VITE_MEILISEARCH_HOST=https://your-meilisearch-instance.com
VITE_MEILISEARCH_API_KEY=your-api-key
\`\`\`

### D1 Database Migration

#### Local Development

\`\`\`bash
npx wrangler d1 execute BETTERLB_DB --local --file=db/migrations/001_initial_schema.sql
\`\`\`

#### Production

\`\`\`bash
npx wrangler d1 execute betterlb_openlgu --file=db/migrations/001_initial_schema.sql
\`\`\`

**Note:** `betterlb_openlgu` is the production database name (configured in `wrangler.jsonc`)

### D1 Binding Configuration

**Local:** `wrangler.jsonc`

\`\`\`json
{
  "d1_databases": [
    {
      "binding": "BETTERLB_DB",
      "database_name": "betterlb_openlgu",
      "database_id": "your-database-id"
    }
  ]
}
\`\`\`

**Production:** Configured in Cloudflare Pages Dashboard

Access in code:

\`\`\`typescript
export async function onRequest(context) {
  const db = context.env.BETTERLB_DB as D1Database;
  // Use db
}
\`\`\`

### Preview Deployments

Every pull request gets a preview URL:

- Auto-deployed by Cloudflare Pages
- Test changes before merging
- Share with stakeholders for review

### Deployment Checklist

Before deploying:

- [ ] All tests pass (`npm test` and `npm run test:e2e`)
- [ ] No linting errors (`npm run lint` with --max-warnings 0)
- [ ] Build succeeds (`npm run build`)
- [ ] Environment variables configured
- [ ] Database migrations applied (if needed)
- [ ] Meilisearch index updated (if applicable)

### Rollback

If deployment fails:

1. Revert commit: `git revert HEAD`
2. Push: `git push`
3. Cloudflare auto-deploys rollback

Or use Cloudflare Pages dashboard to revert to previous deployment.

**See:** [CI-CD-SETUP.md](CI-CD-SETUP.md) for complete CI/CD documentation
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add deployment section"
```

---

## Task 12: Write LGU Adopters Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add LGU Adopters section**

```markdown
## 11. For LGU Adopters

### Forking BetterLB for Your Municipality

BetterLB is designed to be forked by other municipalities.

#### Step 1: Fork Repository

1. Go to https://github.com/betterlosbanos/betterlb
2. Click "Fork" button
3. Choose your GitHub organization

#### Step 2: Clone Your Fork

\`\`\`bash
git clone https://github.com/YOUR-ORG/betterlb.git
cd betterlb
\`\`\`

#### Step 3: Update Municipal Configuration

**Update Site Metadata:**

\`\`\`typescript
// src/config/site.ts
export const siteConfig = {
  name: 'YourMunicipality', // e.g., "City of San Pablo"
  domain: 'yourmunicipality.gov.ph',
  description: 'Official portal of Your Municipality',
  // ...
};
\`\`\`

**Update Government Directory:**

1. Replace `src/data/directory/` with your municipal data:

\`\`\`json
// departments.json
[
  {
    "slug": "mayors-office",
    "office_name": "Office of the Mayor",
    "department_head": {
      "name": "Your Mayor Name"
    }
  }
]

// barangays.json
[
  {
    "slug": "barangay-1",
    "barangay_name": "BARANGAY POBLACION",
    "officials": [...]
  }
]

// executive.json
[
  {
    "slug": "office-of-the-mayor",
    "name": "Your Mayor Name",
    "role": "Mayor",
    ...
  }
]
\`\`\`

#### Step 4: Update Citizens Charter

1. Replace `src/data/services/categories/` with your services
2. Follow same format as BetterLB
3. Run: `python3 scripts/merge_services.py`

#### Step 5: Configure Cloudflare Pages

1. Create Cloudflare Pages project
2. Connect your GitHub fork
3. Configure build settings:
   - **Build command:** `npm run build`
   - **Build output:** `dist`
   - **Root directory:** `/`

#### Step 6: Set Up D1 Database

1. Create D1 database in Cloudflare dashboard
2. Run migrations:

\`\`\`bash
npx wrangler d1 execute YOUR_DB --file=db/migrations/001_initial_schema.sql
\`\`\`

3. Update `wrangler.jsonc` with your database name

#### Step 7: Customize Brand

**Update Colors (tailwind.config.js):**

\`\`\`js
module.exports = {
  theme: {
    extend: {
      colors: {
        'municipal-primary': '#your-color',
      }
    }
  }
}
\`\`\`

**Update Logo:** Replace `public/logo.svg`

#### Step 8: Deploy

\`\`\`bash
npm run build
npx wrangler pages deploy dist
\`\`\`

### Customization Checklist

- [ ] Update site metadata (name, domain, description)
- [ ] Replace government directory data
- [ ] Replace Citizens Charter data
- [ ] Update municipal branding (colors, logo)
- [ ] Create D1 database and run migrations
- [ ] Configure environment variables
- [ ] Test locally before deploying
- [ ] Deploy to Cloudflare Pages

### Data Migration Strategies

**Legislative Data:**

Option 1: **Manual Entry** - Use admin panel to add documents

Option 2: **Python Pipeline** - Adapt pipeline scripts for your sources

Option 3: **OpenLGU Integration** - Connect to OpenLGU API if available

**Services Directory:**

Option 1: **Manual** - Edit JSON files directly

Option 2: **Import** - Provide automated tool for Citizens Charter data

### Ongoing Maintenance

**Update Procedures:**

- Legislative documents: Run pipeline or use admin panel
- Services directory: Edit category files, run merge script
- Government data: Update JSON files in `src/data/directory/`

**Keep Synced with Upstream:**

\`\`\`bash
git remote add upstream https://github.com/betterlosbanos/betterlb.git
git fetch upstream
git merge upstream/main
\`\`\`

Resolve conflicts, test, deploy.
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add LGU adopters section"
```

---

## Task 13: Write Troubleshooting Section

**Files:**
- Modify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Add Troubleshooting section**

```markdown
## 12. Troubleshooting

### Common Setup Issues

#### Node.js Version Error

**Problem:** `Unsupported Node.js version`

**Solution:**

\`\`\`bash
# Check version
node --version

# Use correct version (nvm)
nvm install 22
nvm use 22
\`\`\`

#### Dependency Installation Fails

**Problem:** `npm install` errors

**Solution:**

\`\`\`bash
# Clear cache
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
\`\`\`

#### Python Dependencies Missing

**Problem:** `ModuleNotFoundError: No module named 'pdfplumber'`

**Solution:**

\`\`\`bash
pip3 install --break-system-packages \\
  pdfplumber pdf2image PyPDF2 \\
  aiohttp jsonschema tqdm
\`\`\`

### Build Errors

#### TypeScript Errors

**Problem:** Type errors during build

**Solution:**

\`\`\`bash
# Check type errors
npx tsc --noEmit

# Fix common issues:
# - Add type annotations
# - Import types from @types packages
# - Update tsconfig.json paths
\`\`\`

#### Vite Build Fails

**Problem:** Build fails with vite errors

**Solution:**

\`\`\`bash
# Check for circular dependencies
# Remove unused imports
# Check for syntax errors
npm run build --debug
\`\`\`

### Test Failures

#### Unit Tests Fail

**Problem:** `npm test` failures

**Solution:**

\`\`\`bash
# Run in verbose mode
npm test -- --reporter=verbose

# Run specific failing test
npm test -- --t "test name"

# Check test environment
# - Ensure jsdom environment for React tests
# - Check setup files
\`\`\`

#### E2E Tests Fail

**Problem:** Playwright tests timeout or fail

**Solution:**

\`\`\`bash
# Run with headed browser
npm run test:e2e -- --headed

# Run specific test
npm run test:e2e -- e2e/my-test.spec.ts

# Check if dev server is running
npm run dev  # in separate terminal
\`\`\`

### Development Server Issues

#### Vite Dev Server Won't Start

**Problem:** Port 5173 already in use

**Solution:**

\`\`\`bash
# Kill process on port
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
\`\`\`

#### Functions Backend Errors

**Problem:** API endpoints return 500 errors

**Solution:**

\`\`\`bash
# Check Functions logs
npx wrangler pages dev --proxy 5173

# Check D1 binding
# Ensure wrangler.jsonc has correct database binding

# Test endpoint directly
curl http://localhost:8788/api/test-endpoint
\`\`\`

### Deployment Issues

#### Cloudflare Pages Build Fails

**Problem:** Build fails in CI/CD

**Solution:**

1. Check build logs in Cloudflare dashboard
2. Verify `package.json` scripts
3. Ensure all dependencies in `package.json`
4. Check environment variables

#### D1 Database Errors

**Problem:** D1 query failures in production

**Solution:**

\`\`\`bash
# Test query locally first
npx wrangler d1 execute BETTERLB_DB --local --command="SELECT * FROM documents LIMIT 1"

# Check binding in Cloudflare Pages dashboard
# Ensure migration was run in production

# Check query syntax
# - D1 uses SQLite syntax
# - Check for reserved words
\`\`\`

### Getting Help

**Documentation:**

- [ARCHITECTURE.md](../ARCHITECTURE.md) - System architecture
- [CLAUDE.md](../CLAUDE.md) - Project instructions
- [CI-CD-SETUP.md](CI-CD-SETUP.md) - CI/CD pipelines
- [BetterLB-Design-System-Guide.md](BetterLB-Design-System-Guide.md) - Design system

**Community:**

- GitHub Issues: https://github.com/betterlosbanos/betterlb/issues
- GitHub Discussions: https://github.com/betterlosbanos/betterlb/discussions

**Debug Mode:**

\`\`\`bash
# Enable verbose logging
DEBUG=* npm run dev

# Wrangler verbose mode
npx wrangler pages dev --proxy 5173 --log-level debug
\`\`\`
```

**Step 2: Commit**

```bash
git add docs/DEVELOPER_GUIDE.md
git commit -m "docs: add troubleshooting section"
```

---

## Task 14: Update Root CONTRIBUTING.md

**Files:**
- Modify: `CONTRIBUTING.md`

**Step 1: Add reference to DEVELOPER_GUIDE.md**

Add after "Welcome" section:

```markdown
## BetterLB Developer Guide

**NEW:** For BetterLB-specific development setup, workflows, and architecture, see our comprehensive [Developer Guide](docs/DEVELOPER_GUIDE.md).

The Developer Guide covers:
- Quick start (5-minute setup)
- Development environment (frontend + backend + database)
- Project structure and architecture
- Development workflows (frontend, backend, data pipeline)
- Common tasks with code examples
- Design system (Kapwa)
- Testing guide (Vitest + Playwright)
- Deployment to Cloudflare Pages
- For LGU adopters (forking guide)
- Troubleshooting

**Contributors should read both documents:**
1. This file (CONTRIBUTING.md) - General contribution workflow
2. Developer Guide - BetterLB-specific technical details

Continue below for general contribution guidelines...
```

**Step 2: Commit**

```bash
git add CONTRIBUTING.md
git commit -m "docs: reference DEVELOPER_GUIDE.md in CONTRIBUTING.md"
```

---

## Task 15: Final Review and Verification

**Files:**
- Verify: `docs/DEVELOPER_GUIDE.md`

**Step 1: Check document structure**

\`\`\`bash
# Verify file exists and has content
wc -l docs/DEVELOPER_GUIDE.md

# Should show ~2500+ lines
\`\`\`

**Step 2: Check for broken links**

\`\`\`bash
# Check markdown links (if you have markdown-link-check installed)
markdown-link-check docs/DEVELOPER_GUIDE.md
\`\`\`

**Step 3: Verify all code examples are valid**

- TypeScript code compiles
- Bash commands are correct
- JSON examples are valid
- File paths exist

**Step 4: Update table of contents**

Ensure all sections are linked in TOC.

**Step 5: Final commit**

\`\`\`bash
git add docs/DEVELOPER_GUIDE.md CONTRIBUTING.md
git commit -m "docs: complete developer contribution guide

- Added comprehensive DEVELOPER_GUIDE.md with 12 sections
- Covers Quick Start, Project Overview, Development Environment
- Detailed Project Structure, Development Workflows, Common Tasks
- Design System, Data Management, Testing Guide, Deployment
- LGU Adopters Guide, Troubleshooting
- Updated CONTRIBUTING.md to reference new guide

~2500 lines, integrates existing docs with step-by-step workflows"
\`\`\`

---

## Verification Checklist

Before marking complete, verify:

- [ ] All 12 sections written and complete
- [ ] Code examples are valid and tested
- [ ] File paths are correct
- [ ] Cross-references to existing docs work
- [ ] Table of contents is complete
- [ ] CONTRIBUTING.md updated with reference
- [ ] Document is well-formatted markdown
- [ ] No broken links or references

---

## Completion

**Output:** `docs/DEVELOPER_GUIDE.md` (~2500 lines)

**Related Files Modified:**
- `CONTRIBUTING.md` - Added reference to DEVELOPER_GUIDE.md

**Integration Points:**
- Links to `ARCHITECTURE.md`
- Links to `ADMIN_GUIDE.md`
- Links to `BetterLB-Design-System-Guide.md`
- Links to `MEILISEARCH_INTEGRATION_GUIDE.md`
- Links to `CI-CD-SETUP.md`

**Estimated Reading Time:** 45-60 minutes

**Target Audience:**
- External contributors to BetterLB
- New team members onboarding
- Other municipalities forking for their LGU
