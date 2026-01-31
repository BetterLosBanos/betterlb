# Meilisearch Integration Guide

This guide documents how Better LB integrates with [BetterGov's Meilisearch instance](https://search2.bettergov.ph) to display filtered transparency data for the Municipality of Los Baños. The key insight is that we leverage BetterGov.ph's existing Meilisearch infrastructure and national datasets—filtering and searching only for data relevant to our specific LGU.

Other LGUs can follow this same pattern to implement their own transparency portals without setting up their own Meilisearch instances or scraping data.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Meilisearch Configuration](#meilisearch-configuration)
4. [Procurement Transparency](#procurement-transparency)
5. [Infrastructure Transparency](#infrastructure-transparency)
6. [Financial Transparency](#financial-transparency)
7. [Implementation Guide for Other LGUs](#implementation-guide-for-other-lgus)

---

## Overview

Better LB leverages **BetterGov.ph's existing Meilisearch infrastructure** to display transparency data. We don't host any national data ourselves—we simply query BetterGov's public search endpoint with filters for our specific LGU.

| Feature | Data Source | How We Access It |
|---------|-------------|------------------|
| **Procurement** | PhilGEPS (all national contracts) | Filter by `organization_name` |
| **Infrastructure** | DPWH (all national projects) | Filter by `region`, `province`, `municipality` |
| **Financial** | SRE (local LGU financial reports) | Download from data.bettergov.ph |

### Requirements

- **Meilisearch API Key**: Required - extract from https://transparency.bettergov.ph (see Step 2)
- **No server/database**: All data comes from BetterGov's existing infrastructure

### The Pattern in One Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  BetterGov.ph                                                │
│  ├── Scrapes PhilGEPS → Index: philgeps                      │
│  ├── Scrapes DPWH → Index: dpwh                              │
│  └── Hosts at https://search2.bettergov.ph                  │
└─────────────────────────────────────────────────────────────┘
                          │
                          │ Your LGU queries with filters:
                          │ ?filter=organization_name="YOUR LGU"
                          │ ?filter=location.region="YOUR REGION"
                          ▼
┌─────────────────────────────────────────────────────────────┐
│  Your LGU Portal                                            │
│  ├── Procurement page (filtered results)                    │
│  ├── Infrastructure page (filtered results)                 │
│  └── No servers, no databases, no scraping!                 │
└─────────────────────────────────────────────────────────────┘
```

### Public Endpoints

| Endpoint | Usage |
|----------|-------|
| `https://search2.bettergov.ph` | Meilisearch host (public, no auth) |
| `https://api.dpwh.bettergov.ph/projects/{id}` | DPWH project detail API |
| `https://data.bettergov.ph` | SRE/ARI financial data downloads |

---

## Architecture

Better LB follows a **"filter-downstream"** pattern—we don't host or scrape any national data ourselves. Instead, we query BetterGov's existing Meilisearch instance with LGU-specific filters.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    BETTERGOV.PH (National Infrastructure)                   │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  Meilisearch at https://search2.bettergov.ph                        │   │
│  │  - philgeps index (ALL national procurement contracts)              │   │
│  │  - dpwh index (ALL national infrastructure projects)                 │   │
│  │  - philgeps_organizations (pre-computed aggregates)                  │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────────┘
                                    │
                                    │ Query with LGU-specific filters
                                    │ (organization_name, region, province, etc.)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                         YOUR LGU FRONTEND (Better LB)                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  /src/lib/meilisearch.ts                                             │   │
│  │  - Configured to point to search2.bettergov.ph                       │   │
│  │  - Type definitions for search results                               │   │
│  │  - Index constants (PHILGEPS, DPWH, etc.)                            │   │
│  └────────────────────────────────┬────────────────────────────────────┘   │
│                                   │                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                     │
│  │ Procurement  │  │Infrastructure│  │  Financial   │                     │
│  │   Page       │  │    Page      │  │    Page      │                     │
│  │  (filters by │  │  (filters by │  │  (local SRE  │                     │
│  │   org_name)  │  │   location)  │  │   JSON)      │                     │
│  └──────────────┘  └──────────────┘  └──────────────┘                     │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Key Benefits of This Pattern

| Benefit | Description |
|---------|-------------|
| **No Data Maintenance** | BetterGov.ph handles all data scraping and updates |
| **No Server Costs** | Use existing public Meilisearch instance |
| **Always Fresh** | Data is updated in real-time by BetterGov |
| **Simple Setup** | Only need to configure filters for your LGU |
| **National Context** | Easy to link to national comparisons |

---

## Meilisearch Configuration

### File: `src/lib/meilisearch.ts`

```typescript
import { MeiliSearch } from 'meilisearch';

// 1. Configuration
const HOST =
  import.meta.env.VITE_MEILISEARCH_HOST || 'https://search2.bettergov.ph';
const KEY = import.meta.env.VITE_MEILISEARCH_API_KEY || '';

export const client = new MeiliSearch({
  host: HOST,
  apiKey: KEY,
});

export const INDICES = {
  PHILGEPS: 'philgeps',
  DPWH: 'dpwh',
  PHILGEPS_ORGS: 'philgeps_organizations',
} as const;
```

### Environment Variables

Create a `.env` file in your project root:

```bash
# Optional: For private Meilisearch instances
VITE_MEILISEARCH_HOST=https://search2.bettergov.ph
VITE_MEILISEARCH_API_KEY=your_api_key_here
```

**Note**: The BetterGov.meilisearch instance at `https://search2.bettergov.ph` is publicly accessible for querying PhilGEPS and DPWH data.

### Available Indices

| Index | Description | Key Fields |
|-------|-------------|------------|
| `philgeps` | Procurement contracts from PhilGEPS | `organization_name`, `contract_amount`, `award_date`, `business_category` |
| `dpwh` | DPWH infrastructure projects | `location.region`, `location.province`, `budget`, `progress`, `status` |
| `philgeps_organizations` | Pre-computed organization stats | `count`, `total` (aggregates) |

---

## Procurement Transparency

### File: `src/pages/transparency/procurement/index.tsx`

### Key Implementation Details

1. **Organization Filter**: Filter by LGU organization name
   ```typescript
   const ORG_NAME = 'MUNICIPALITY OF LOS BAÑOS, LAGUNA';
   const ORG_FILTER = `organization_name = "${ORG_NAME}"`;
   ```

2. **Search Query**: With debouncing (400ms) and pagination
   ```typescript
   const index = client.index(INDICES.PHILGEPS);
   const response = await index.search(query, {
     filter: ORG_FILTER,
     sort: ['award_date:desc'],
     limit: resultsPerPage,
     offset: (currentPage - 1) * resultsPerPage,
   });
   ```

3. **Statistics**: Pre-computed stats from organization index
   ```typescript
   const orgIndex = client.index(INDICES.PHILGEPS_ORGS);
   const statsRes = await orgIndex.search(ORG_NAME, { limit: 1 });
   // Returns: { count: total, total: sum of contract_amount }
   ```

4. **CSV Export**: Client-side CSV generation from search results

### Finding Your LGU's Organization Name

To find your LGU's exact organization name in PhilGEPS:

```typescript
// Search without filter to see organizations
const index = client.index(INDICES.PHILGEPS);
const response = await index.search('', {
  limit: 100,
  attributesToRetrieve: ['organization_name'],
});

// Extract unique organization names
const orgs = [...new Set(response.hits.map(h => h.organization_name))];
console.log(orgs);
```

---

## Infrastructure Transparency

### File: `src/pages/transparency/infrastructure/index.tsx`

### Key Implementation Details

1. **Location Filters**: Filter by region, province (including DEO), and optionally status
   ```typescript
   const filterConditions = [
     'location.region = "Region IV-A"',
     // IMPORTANT: location.province includes BOTH province name AND DEO designation
     // Include both variations to capture all projects
     '(location.province = "Laguna 2nd DEO" OR location.province = "Laguna")',
     // Optional: status filter
     selectedStatuses.length > 0
       ? `(${selectedStatuses.map(s => `status = "${s}"`).join(' OR ')})`
       : '',
   ].filter(Boolean);
   ```

2. **Municipality Matching**: Fuzzy search (client-side) for city/town/municipality name
   ```typescript
   // Municipality is NOT filtered via Meilisearch - use fuzzy search on results
   const exactMatches = hits.filter(h => {
     const mun = h.location.municipality?.toLowerCase() || '';
     const desc = h.description?.toLowerCase() || '';
     const target = ['los baños', 'los banos'];
     return target.some(t => mun.includes(t) || desc.includes(t));
   });
   ```

> **Note**: `location.province` in the DPWH dataset contains both the province name AND the District Engineering Office (DEO) designation (e.g., "Laguna 2nd DEO", "Pampanga 1st DEO"). Always include BOTH the plain province name AND the DEO variant in your filter to ensure complete results.

3. **Project Detail Page**: Direct API call for full project details
   ```typescript
   const response = await fetch(
     `https://api.dpwh.bettergov.ph/projects/${contractId}`
   );
   ```

### DPWH Status Values

| Status | Description |
|--------|-------------|
| `On-Going` | Currently active projects |
| `Completed` | Finished projects (100% progress) |
| `For Procurement` | Not yet awarded |
| `Not Yet Started` | Awarded but not started |
| `Terminated` | Cancelled projects |

---

## Financial Transparency

### File: `src/pages/transparency/financial/index.tsx`

### Data Source

Financial data comes from the **SRE (Statement of Receipts and Expenditures)** files:

- **SRE Data**: `https://data.bettergov.ph/datasets/9/resources/30`
- **ARI Data**: `https://data.bettergov.ph/datasets/9/resources/31`

### Data Processing Pipeline

1. **Download JSON** from data.bettergov.ph
2. **Save to** `src/data/transparency/sre.json`
3. **Transform** using `src/data/transparency/budgetData.ts`

### Key Data Structure

```typescript
interface FinancialQuarter {
  period: string;              // e.g., "Q1-2024"
  location_info: {
    lgu: string;
    province: string;
    region: string;
  };
  current_operating_income: {
    local_sources: { ... };
    external_sources: { ... };
    total_current_operating_income: number;
  };
  current_operating_expenditures: {
    general_public_services: number;
    social_services: { ... };
    economic_services: number;
    total_current_operating_expenditures: number;
  };
  fund_summary?: {
    fund_cash_balance_end: number;
    net_increase_decrease_in_funds: number;
  };
}
```

### Data Access Pattern

```typescript
// Hook: src/hooks/useFinancialData.ts
import budgetData from '@/data/transparency/budgetData';

// The data is processed locally with:
// - Year/quarter selection
// - Year-over-year comparison
// - Aggregation functions (aggregateIncome, aggregateExpenditures)
```

---

## Implementation Guide for Other LGUs

### TL;DR: What You Need to Do

1. **Install the Meilisearch client** (one npm package)
2. **Get the API key** from transparency.bettergov.ph (see instructions below)
3. **Find your LGU's filter values** (organization name, region, province)
4. **Update the filter constants** in your pages
5. **That's it!** No servers, no scraping, no databases

### Step 1: Install Dependencies

```bash
npm install meilisearch
```

### Step 2: Get the Meilisearch API Key

The API key is required for querying BetterGov's Meilisearch instance. You can extract it from https://transparency.bettergov.ph:

**Method 1: Browser DevTools (Recommended)**

1. Visit https://transparency.bettergov.ph/procurement
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Go to the **Network** tab
4. Filter by **Fetch/XHR**
5. Refresh the page and look for requests to `search2.bettergov.ph`
6. Click on the request and check the **Headers** > **Authorization** header
7. The API key is the value after `Bearer `

**Method 2: Browser Console**

1. Visit https://transparency.bettergov.ph
2. Open browser DevTools (F12 or Cmd+Option+I)
3. Go to the **Console** tab
4. Type: `window.localStorage` or `window.sessionStorage`
5. Look for any keys containing "meili" or "search"

The key typically looks like: `aBcDeFgHiJkLmNoPqRsTuVwXyZ123456789...`

### Step 3: Copy the Meilisearch Client Configuration

Create `src/lib/meilisearch.ts`:

```typescript
import { MeiliSearch } from 'meilisearch';

// Point to BetterGov's public Meilisearch instance
const HOST = 'https://search2.bettergov.ph';
const KEY = import.meta.env.VITE_MEILISEARCH_API_KEY || 'YOUR_API_KEY_HERE';

export const client = new MeiliSearch({ host: HOST, apiKey: KEY });

export const INDICES = {
  PHILGEPS: 'philgeps',
  DPWH: 'dpwh',
  PHILGEPS_ORGS: 'philgeps_organizations',
} as const;
```

### Step 3: Find Your LGU's Filter Values

#### For Procurement (PhilGEPS)

You need to find your **exact organization name** as it appears in PhilGEPS:

```typescript
// Quick script to find your org name:
const index = client.index(INDICES.PHILGEPS);
const response = await index.search('[YOUR MUNICIPALITY NAME]', {
  limit: 100,
  attributesToRetrieve: ['organization_name'],
});

// Extract unique org names
const orgs = [...new Set(response.hits.map(h => h.organization_name))];
console.log(orgs);
```

**Examples of organization names:**
- `MUNICIPALITY OF LOS BAÑOS, LAGUNA`
- `CITY OF CEBU, CEBU`
- `PROVINCIAL GOVERNMENT OF PAMPANGA`

#### For Infrastructure (DPWH)

You need your **region, province, and DEO designation**:

| Field | Where to Find |
|-------|---------------|
| Region | https://transparency.bettergov.ph/dpwh - use the region filter dropdown |
| Province | https://transparency.bettergov.ph/dpwh - check the province filter for your DEO |
| Municipality | Use fuzzy search on results (not a Meilisearch filter) |

**Easiest Method**: Visit https://transparency.bettergov.ph/dpwh, use the filters to find your region/province, and copy the exact values from the URL or filter dropdown.

**Examples:**
- Region: `Region IV-A`, `Region III`, `NCR`
- Province (include BOTH): `Laguna` AND `Laguna 2nd DEO`, `Pampanga` AND `Pampanga 1st DEO`

### Step 4: Configure Your Filters

#### Procurement Page (`src/pages/transparency/procurement/index.tsx`)

```typescript
// CHANGE THIS VALUE ONLY
const ORG_NAME = 'MUNICIPALITY OF [YOUR LGU], [YOUR PROVINCE]';
const ORG_FILTER = `organization_name = "${ORG_NAME}"`;

// Search query (rest of code remains the same)
const index = client.index(INDICES.PHILGEPS);
const response = await index.search(query, {
  filter: ORG_FILTER,  // This filters ALL results to your LGU
  sort: ['award_date:desc'],
  limit: resultsPerPage,
  offset: (currentPage - 1) * resultsPerPage,
});
```

#### Infrastructure Page (`src/pages/transparency/infrastructure/index.tsx`)

```typescript
// CHANGE THESE VALUES
const filterConditions = [
  'location.region = "[YOUR REGION]"',           // e.g., "Region IV-A"
  // IMPORTANT: Include BOTH plain province AND DEO variant
  '(location.province = "[YOUR PROVINCE]" OR location.province = "[YOUR PROVINCE] Xth DEO")',
  // Example: '(location.province = "Laguna" OR location.province = "Laguna 2nd DEO")'
  // Status filter is optional
  selectedStatuses.length > 0
    ? `(${selectedStatuses.map(s => `status = "${s}"`).join(' OR ')})`
    : '',
].filter(Boolean);

// Municipality uses fuzzy search (client-side), not Meilisearch filter
// This handles multiple spellings/variations
const exactMatches = hits.filter(h => {
  const mun = h.location.municipality?.toLowerCase() || '';
  const desc = h.description?.toLowerCase() || '';
  const target = [
    '[municipality name 1]',  // e.g., 'los baños'
    '[municipality name 2]',  // e.g., 'los banos' (without tilde)
  ];
  return target.some(t => mun.includes(t) || desc.includes(t));
});
```

**Finding Your Values**: Visit https://transparency.bettergov.ph/dpwh and use the filter dropdowns to discover the exact region, province, and DEO values for your area.

### Step 5: Optional - Add Financial Data

Financial data (SRE) is not in Meilisearch. You have two options:

**Option A: Use data.bettergov.ph (Recommended)**
1. Visit https://data.bettergov.ph
2. Search for your LGU
3. Download SRE/ARI JSON files
4. Process with existing `budgetData.ts`

**Option B: Skip It**
- Focus on Procurement and Infrastructure (both work out-of-the-box)
- Financial data can be added later

### Step 6: Data Attribution (Required)

Always attribute BetterGov.ph as the data source:

```jsx
<footer>
  <p className='text-xs text-slate-400'>
    Data provided by{' '}
    <a href='https://transparency.bettergov.ph' target='_blank'>
      BetterGov.ph Transparency Portal
    </a>
    {' '}(PhilGEPS, DPWH)
  </p>
</footer>
```

---

## Required Files from Better LB

You can implement this integration in two ways:

1. **Minimal** - Copy only the core files and adapt to your existing frontend
2. **Complete** - Copy the full page components for a ready-to-use solution

### Core Files (Required)

These are the essential files needed for any implementation:

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `src/lib/meilisearch.ts` | Meilisearch client setup and type definitions | None (points to public BetterGov instance) |
| `src/lib/format.ts` | Peso formatting utilities | None (generic utility, or use your own) |

**Minimum Viable Implementation:**

```typescript
// With just these core files, you can query data anywhere in your app:
import { client, INDICES } from '@/lib/meilisearch';

// Procurement search
const index = client.index(INDICES.PHILGEPS);
const results = await index.search(query, {
  filter: 'organization_name = "YOUR LGU NAME"',
});

// Infrastructure search
const dpwhIndex = client.index(INDICES.DPWH);
const projects = await dpwhIndex.search('', {
  filter: 'location.region = "YOUR REGION" AND location.province = "YOUR PROVINCE"',
});
```

### Page Components (Optional - Ready-to-Use UI)

If you want a complete transparency portal, copy these files:

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `src/pages/transparency/procurement/index.tsx` | Procurement list page with search, stats, table | Update `ORG_NAME` constant (line ~57) |
| `src/pages/transparency/infrastructure/index.tsx` | Infrastructure list with filters, stats | Update `filterConditions` (line ~94) and `target` array (line ~115) |
| `src/pages/transparency/infrastructure/[project].tsx` | Project detail page | None (uses direct API) |
| `src/pages/transparency/financial/index.tsx` | Financial dashboard | Requires your LGU's SRE data |
| `src/pages/transparency/layout.tsx` | Layout wrapper | None |
| `src/pages/transparency/components/TransparencySidebar.tsx` | Navigation sidebar | Update for your LGU |

### UI Components (Optional - Reusable Widgets)

These components are used by the page components. You can use your own UI library instead:

| File | Purpose | Replaceable With |
|------|---------|------------------|
| `src/components/ui/SearchInput.tsx` | Debounced search input | Any input component |
| `src/components/ui/Pagination.tsx` | Pagination controls | Any pagination component |
| `src/components/ui/SelectPicker.tsx` | Multi-select filter | Any select/multi-select |
| `src/components/data-display/StatsUI.tsx` | Stats cards | Any card/metric component |
| `src/components/layout/PageLayouts.tsx` | ModuleHeader, DetailSection | Your layout components |
| `src/components/ui/Card.tsx` | Card containers | Your card components |
| `src/components/ui/Badge.tsx` | Status badges | Any badge component |

### Data Processing (Optional - For Financial Data Only)

| File | Purpose | Changes Needed |
|------|---------|----------------|
| `src/data/transparency/budgetData.ts` | SRE data processor | Point to your SRE JSON |
| `src/hooks/useFinancialData.ts` | Financial data hook | None |
| `src/lib/budgetUtils.ts` | Aggregation utilities | None |

### Quick Start - Minimal Copy

```bash
# Clone Better LB to examine files
git clone https://github.com/BetterLosBanos/betterlb.git temp-betterlb

# Copy ONLY the core files
mkdir -p YOUR_PROJECT/src/lib
cp temp-betterlb/src/lib/meilisearch.ts YOUR_PROJECT/src/lib/
cp temp-betterlb/src/lib/format.ts YOUR_PROJECT/src/lib/

# Now you can use the Meilisearch client in your existing components!
```

### Quick Start - Full Copy

```bash
# Clone Better LB
git clone https://github.com/BetterLosBanos/betterlb.git temp-betterlb

# Copy core files
cp temp-betterlb/src/lib/meilisearch.ts YOUR_PROJECT/src/lib/
cp temp-betterlb/src/lib/format.ts YOUR_PROJECT/src/lib/

# Copy page components
mkdir -p YOUR_PROJECT/src/pages/transparency/infrastructure
cp temp-betterlb/src/pages/transparency/procurement/index.tsx YOUR_PROJECT/src/pages/transparency/
cp temp-betterlb/src/pages/transparency/infrastructure/index.tsx YOUR_PROJECT/src/pages/transparency/infrastructure/
cp temp-betterlb/src/pages/transparency/infrastructure/\[project\].tsx YOUR_PROJECT/src/pages/transparency/infrastructure/
cp temp-betterlb/src/pages/transparency/layout.tsx YOUR_PROJECT/src/pages/transparency/

# Copy UI components (if you don't have your own)
cp -r temp-betterlb/src/components/ui YOUR_PROJECT/src/components/
cp -r temp-betterlb/src/components/data-display YOUR_PROJECT/src/components/
cp -r temp-betterlb/src/components/layout YOUR_PROJECT/src/components/

# Update the filter constants in the copied page files for your LGU
```

---

## Cloudflare Pages Deployment

Better LB is deployed on Cloudflare Pages. Here's how to configure environment variables for your deployment:

### Setting Environment Variables in Cloudflare Pages

1. **Go to your Cloudflare Pages dashboard**
   - Navigate to: https://dash.cloudflare.com > Pages > Your Project

2. **Access Settings**
   - Click on your project
   - Go to **Settings** > **Environment variables**

3. **Add Production Variables**

   | Variable | Value | Description |
   |----------|-------|-------------|
   | `VITE_MEILISEARCH_HOST` | `https://search2.bettergov.ph` | BetterGov's Meilisearch host |
   | `VITE_MEILISEARCH_API_KEY` | `YOUR_API_KEY_HERE` | Required - extract from transparency.bettergov.ph (see Step 2 above) |

4. **Add Preview/Development Variables** (optional but recommended)
   - Repeat the same variables for the **Preview** environment

### Using Wrangler CLI (Alternative)

If you prefer using the command line:

```bash
# Install wrangler (if not already installed)
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Set environment variables for your Pages project
wrangler pages secret put VITE_MEILISEARCH_HOST --project-name=YOUR_PROJECT_NAME
# Enter value when prompted: https://search2.bettergov.ph

wrangler pages secret put VITE_MEILISEARCH_API_KEY --project-name=YOUR_PROJECT_NAME
# Enter the API key extracted from transparency.bettergov.ph
```

### Accessing Variables in Code

The variables are automatically available via `import.meta.env`:

```typescript
// src/lib/meilisearch.ts
const HOST = import.meta.env.VITE_MEILISEARCH_HOST || 'https://search2.bettergov.ph';
const KEY = import.meta.env.VITE_MEILISEARCH_API_KEY || '';
```

### Deploying to Cloudflare Pages

```bash
# Build your project
npm run build

# Deploy using Wrangler
wrangler pages deploy dist --project-name=YOUR_PROJECT_NAME

# Or connect your Git repository for automatic deployments
# In Cloudflare dashboard: Create a project > Connect to Git > Select your repo
```

### Cloudflare Pages Configuration (Optional)

Create `wrangler.toml` in your project root:

```toml
name = "your-lgu-portal"
compatibility_date = "2024-01-01"

[env.production]
vars = { VITE_MEILISEARCH_HOST = "https://search2.bettergov.ph" }

[env.preview]
vars = { VITE_MEILISEARCH_HOST = "https://search2.bettergov.ph" }
```

---

## Type Definitions

### PhilGEPS Document

```typescript
interface PhilgepsDoc {
  id: string;
  reference_id: string;
  contract_no: string;
  award_title: string;
  notice_title: string;
  awardee_name: string;
  organization_name: string;  // KEY: Filter by this
  area_of_delivery: string;
  business_category: string;
  contract_amount: number;
  award_date: string;
  award_status: string;
}
```

### DPWH Project

```typescript
interface DPWHProject {
  contractId: string;
  description: string;
  category: string;
  status: string;
  budget: number;
  amountPaid: number;
  progress: number;
  location: {
    region: string;        // KEY: Filter by this (e.g., "Region IV-A")
    province: string;      // KEY: Filter by this - INCLUDES DEO (e.g., "Laguna 2nd DEO")
    municipality?: string; // Use fuzzy search, not Meilisearch filter
    barangay?: string;
    coordinates: {
      latitude: number;
      longitude: number;
      verified: boolean;
    };
  };
  infraYear: number | string;
  contractor: string;
  startDate?: string;
  completionDate?: string;
  // ... additional fields
}
```

---

## Common Issues & Solutions

### Issue: No Results for Procurement

**Solution**: Verify the exact organization name. PhilGEPS names are specific:
- Check for "MUNICIPALITY OF" vs "CITY OF" vs "PROVINCIAL GOVERNMENT"
- Check for special characters (Ñ) - try both with and without tilde
- Try searching without filter first to discover available organizations:
  ```typescript
  const response = await index.search('[YOUR LGU NAME]', { limit: 100 });
  console.log(response.hits.map(h => h.organization_name));
  ```

### Issue: No Infrastructure Projects Found

**Solution**:
1. **Include BOTH province variants** - `location.province` includes DEO designation:
   ```typescript
   // WRONG - will miss some projects
   'location.province = "Laguna"'
   // CORRECT - captures all projects
   '(location.province = "Laguna" OR location.province = "Laguna 2nd DEO")'
   ```
2. Verify values on https://transparency.bettergov.ph/dpwh - use the filter dropdowns to see exact values
3. Try broader filters (region only) to confirm data exists for your area

### Issue: Search Results Are Slow

**Solution**: BetterGov's Meilisearch is fast, but network latency adds up:
1. Debounce is already implemented (400ms) - don't reduce it
2. Use pagination to limit result size
3. Consider client-side caching for repeated queries

### Issue: Data Appears Outdated

**Solution**: You're using BetterGov's live data - it's updated when they update:
1. Check https://transparency.bettergov.ph to confirm data freshness
2. This is a read-only integration - no action needed on your end
3. BetterGov typically updates PhilGEPS daily and DPWH weekly

---

## External Links

- **BetterGov Transparency Dashboard**: https://transparency.bettergov.ph
- **PhilGEPS Official**: https://philgeps.gov.ph
- **DPWH Official**: https://dpwh.gov.ph
- **Bisto.ph (Citizen Verification)**: https://bisto.ph
- **data.bettergov.ph (SRE/ARI Data)**: https://data.bettergov.ph

---

## Contributing

To improve this guide or report issues:
1. Open an issue on the Better LB GitHub repository
2. Submit a PR with documentation updates
3. Share your LGU's implementation for case studies
