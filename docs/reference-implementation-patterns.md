# BetterLB Reference Implementation Patterns

Reusable architecture, patterns, and conventions extracted from the BetterLB civic tech portal. Each section includes rationale and source file references for copying into new projects.

---

## Table of Contents

1. [Project Structure](#1-project-structure)
2. [Config-Driven Architecture](#2-config-driven-architecture)
3. [Design System Enforcement (Three Layers)](#3-design-system-enforcement)
4. [Compound Component Pattern](#4-compound-component-pattern)
5. [Layout Abstraction Hierarchy](#5-layout-abstraction-hierarchy)
6. [Backend Middleware Chain](#6-backend-middleware-chain)
7. [Five-Tier Cache Strategy](#7-five-tier-cache-strategy)
8. [Security Patterns](#8-security-patterns)
9. [RBAC Permission System](#9-rbac-permission-system)
10. [Audit Logging](#10-audit-logging)
11. [E2E API Mocking via Playwright Fixture](#11-e2e-api-mocking)
12. [Pre-Commit Quality Gates](#12-pre-commit-quality-gates)
13. [CI/CD Pipeline Design](#13-cicd-pipeline-design)
14. [Vite + Cloudflare Functions Dev Setup](#14-vite--cloudflare-functions-dev-setup)
15. [Tailwind v4 + Design System Integration](#15-tailwind-v4--design-system-integration)
16. [Claude Code Skills and Agents](#16-claude-code-skills-and-agents)

---

## 1. Project Structure

```
project-root/
  config/                     # Single-source configuration
    lgu.config.json           # Parameterizes the entire portal
  src/                        # React frontend
    components/
      ui/                     # Primitive components (Card, Badge, Dialog)
        index.ts              # Barrel export
      layout/                 # Layout abstractions
        index.ts
      home/                   # Page-specific sections
        index.ts
    pages/                    # Mirrors URL routes exactly
      government/
        departments/
        barangays/
      services/
      admin/
    hooks/                    # Custom React hooks
    lib/                      # Business logic, API client, utilities
    data/                     # Static JSON data (per-entity subdirectories)
      lgu/losbanos/           # Config-driven data paths
    types/                    # TypeScript type definitions
      index.ts
  functions/                  # Cloudflare Pages Functions (backend)
    utils/                    # Shared middleware and utilities
      admin-auth.ts           # withAuth() middleware
      rbac.ts                 # Role-based access control
      csrf.ts                 # CSRF protection
      rate-limit.ts           # Rate limiting
      kv-cache.ts             # KV cache layer
      cache.ts                # HTTP cache headers
      security-headers.ts     # CSP + security headers
      audit-log.ts            # Audit logging
      cookies.ts              # Cookie parsing
      request.ts              # Request parsing + size limits
    api/                      # API routes (mirrors /api/ paths)
      weather.ts
      admin/
      openlgu/
    types.ts                  # Env interface (KV, D1 bindings)
  e2e/                        # Playwright E2E tests
    test-config.ts            # Extended fixture with API mocking
    utils/                    # Shared test utilities
      kapwa.ts                # Design system assertions
      navbar.ts               # Navigation helpers
      device.ts               # Mobile detection
    government/               # Tests mirror page structure
    services/
    statistics/
  db/migrations/              # Sequential D1 SQL migrations
  .husky/pre-commit           # Two-stage quality gate
  .claude/                    # Claude Code configuration
    skills/                   # 9 invokable skills
    agents/                   # 8 specialized agents
```

**Key principle**: Pages mirror URLs, functions mirror API routes, tests mirror pages. No indirection between file paths and URL paths.

---

## 2. Config-Driven Architecture

**Source**: `config/lgu.config.json`, `src/lib/lguConfig.ts`

A single JSON file parameterizes the entire portal. Swap this file and the portal works for a different LGU.

```json
{
  "lgu": {
    "name": "Los Baños",
    "fullName": "Municipality of Los Baños",
    "province": "Laguna",
    "region": "Region IV-A",
    "regionCode": "CALABARZON",
    "type": "municipality",
    "logoPath": "/logos/png/betterlb-blue.png",
    "officialWebsite": "https://losbanos.gov.ph"
  },
  "portal": {
    "name": "BetterLB",
    "domain": "betterlb.org",
    "brandColor": "#0066eb",
    "tagline": "Community Powered Los Baños Portal"
  },
  "location": {
    "coordinates": { "lat": 14.1763, "lon": 121.2219 },
    "weather": { "defaultCity": "Los Baños" }
  },
  "dataPaths": {
    "departments": "src/data/lgu/losbanos/directory/departments.json",
    "barangays": "src/data/lgu/losbanos/directory/barangays.json",
    "services": "src/data/lgu/losbanos/services/categories"
  },
  "features": {
    "openLGU": true,
    "transparency": true,
    "tourism": true,
    "statistics": true
  }
}
```

**Typed accessor**:

```typescript
// src/lib/lguConfig.ts
import lguConfig from '../../config/lgu.config.json';

export interface LGUConfig {
  lgu: { name: string; fullName: string; province: string; /* ... */ };
  portal: { name: string; domain: string; brandColor: string; /* ... */ };
  features: Record<string, boolean>;
  dataPaths: Record<string, string>;
  // ... other sections
}

export const config = lguConfig as LGUConfig;
export default config;
```

**Why it works**:
- `features` object acts as a feature flag system — entire modules toggle on/off
- `dataPaths` maps to per-entity data subtrees — each LGU gets its own data
- `location.coordinates` drives weather and geographic features
- Typed accessor prevents runtime errors from typos

---

## 3. Design System Enforcement

**Sources**: `.husky/pre-commit`, `e2e/utils/kapwa.ts`, `.claude/skills/design-cohesion-check/`

Three independent enforcement layers ensure the design system is never violated, regardless of who writes the code.

### Layer 1: Pre-Commit Hook (Hard Block)

```bash
# .husky/pre-commit
#!/bin/sh
set -e

# Stage 1: Raw color token detection
if grep -rn "bg-gray-\|text-gray-\|border-gray-\|bg-slate-\|text-slate-\|border-slate-" \
  src/pages/services src/pages/government src/pages/statistics \
  src/pages/transparency src/pages/openlgu --include="*.tsx" 2>/dev/null | \
  grep -v "reference-implementation"; then
  echo "❌ Raw color tokens found! Use semantic tokens:"
  echo "  - bg-kapwa-bg-*, text-kapwa-text-*, border-kapwa-border-*"
  exit 1
fi

# Stage 2: lint-staged (ESLint + Prettier)
npx lint-staged
```

**Cost**: ~50 lines of shell. Catches every violation before it enters the repo.

### Layer 2: E2E Assertion (CI Block)

```typescript
// e2e/utils/kapwa.ts
export async function assertKapwaTokens(page: Page): Promise<void> {
  let mainHTML = await page.locator('main').innerHTML();

  // Strip code examples that intentionally show "wrong" usage
  mainHTML = mainHTML.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '');

  // Positive: semantic tokens MUST be present
  expect(mainHTML).toMatch(/text-kapwa-text-/);
  expect(mainHTML).toMatch(/bg-kapwa-bg-/);
  expect(mainHTML).toMatch(/border-kapwa-border-/);

  // Negative: raw Tailwind colors MUST NOT be present
  expect(mainHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);
}
```

**Key design**: Scopes checks to `<main>` only (excludes Navbar/Footer legacy), strips `<pre>` tags (code examples).

### Layer 3: AI Skill (Developer Guidance)

```markdown
# .claude/skills/design-cohesion-check/SKILL.md
# Detects: missing prefixes, raw colors, hardcoded values, inconsistent spacing
# Provides: quick reference replacement table (wrong → correct)
```

**Why three layers**: Each catches what the others miss. Pre-commit catches local edits, E2E catches visual regressions, AI skill prevents the issue during development.

---

## 4. Compound Component Pattern

**Source**: `src/components/ui/Card.tsx`

A family of named exports that compose together, each with a single responsibility.

```tsx
// Usage
<Card variant="featured">
  <CardImage src={photo} alt="Event" />
  <CardHeader>
    <CardTitle level={3}>Title</CardTitle>
    <CardDescription>Subtitle</CardDescription>
  </CardHeader>
  <CardContent>Body</CardContent>
  <CardFooter>Action</CardFooter>
</Card>
```

**Component inventory**:

| Component | HTML Element | Role |
|-----------|-------------|------|
| `Card` | `<article>` | Root container, `forwardRef`, variant system |
| `CardHeader` | `<header>` | Bordered top section |
| `CardContent` | `<div>` | Main body with responsive padding |
| `CardFooter` | `<footer>` | Bordered bottom with subtle bg |
| `CardImage` | `<img>` in `<div>` | Fixed aspect ratio, lazy loading, hover zoom |
| `CardAvatar` | `<div>` | Initials display (3 sizes), `aria-hidden` |
| `CardTitle` | `<h1>`-`<h6>` | Semantic heading, configurable level |
| `CardDescription` | `<p>` | Muted supporting text |
| `CardContactInfo` | `<address>` | Address/phone/email/website with icons |
| `CardGrid` | `<div>` | Responsive 1-4 column grid with auto-breakpoints |
| `CardList` | `<div>` | Vertical stack |
| `CardDivider` | `<hr>` | Separator |

**Key patterns**:
- `forwardRef` on the root component for ref forwarding
- Variant system via class maps: `{ default, featured, slate, compact }`
- All styling uses design system semantic tokens exclusively
- Semantic HTML elements throughout (`<article>`, `<header>`, `<footer>`, `<address>`)
- `role="list"` on grid/list containers for accessibility

---

## 5. Layout Abstraction Hierarchy

**Source**: `src/components/layout/UnifiedLayouts.tsx`

Three levels of layout primitives, composable from simple to complex.

### Level 1: Section Blocks

```tsx
// Context-based auto-alternating backgrounds
<SectionAlternator>
  <SectionBlock title="Section 1">Content</SectionBlock>    {/* bg-surface */}
  <SectionBlock title="Section 2">Content</SectionBlock>    {/* bg-surface-raised */}
  <SectionBlock title="Section 3">Content</SectionBlock>    {/* bg-surface-brand */}
  <SectionBlock title="Section 4">Content</SectionBlock>    {/* bg-surface (cycles) */}
</SectionAlternator>
```

`SectionAlternator` uses React context + `useLayoutEffect` to synchronously cycle through `default → raised → brand` backgrounds. No parent state management needed.

```tsx
// Implementation sketch
const SectionContext = createContext<{ index: number; increment: () => void }>(...);

export function SectionAlternator({ children }) {
  const [index, setIndex] = useState(0);
  return (
    <SectionContext.Provider value={{ index, increment: () => setIndex(n => n + 1) }}>
      {children}
    </SectionContext.Provider>
  );
}

export function SectionBlock({ variant: explicitVariant, children }) {
  const { index, increment } = useContext(SectionContext);
  const variant = explicitVariant || ['default', 'raised', 'brand'][index % 3];
  useLayoutEffect(() => { if (!explicitVariant) increment(); }, []);
  // ...
}
```

### Level 2: Page Headers

```tsx
// Three variants for different contexts
<PageHeader variant="hero" title="..." description="..." />     // Large centered
<PageHeader variant="centered" title="..." badges={...} />       // Standard centered
<PageHeader variant="compact" title="..." actions={<Search />} /> // Left-aligned + actions
```

Includes `useBreadcrumbs()` hook for automatic breadcrumb generation from the current route:

```tsx
const breadcrumbs = useBreadcrumbs();
// At /services/business-permits → [
//   { label: 'Home', href: '/' },
//   { label: 'Services', href: '/services' },
//   { label: 'Business Permits', href: '/services/business-permits' },
// ]
```

### Level 3: Staggered Grid

```tsx
// Cascading reveal animation
<StaggeredGrid columns={3} baseDelay={100} delayStep={75}>
  {items.map(item => <Card key={item.id}>...</Card>)}
</StaggeredGrid>
```

Wraps children with `animationDelay = baseDelay + index * delayStep` for cascading entrance animations.

---

## 6. Backend Middleware Chain

**Source**: `functions/utils/admin-auth.ts`

Higher-order function composition for composable security:

```
Request → withAuth(handler, options)
  ├── Cookie parsing → session lookup
  ├── Session expiry check
  ├── Authorized user validation
  ├── RBAC permission check (optional)
  ├── CSRF token validation (optional, non-GET only)
  └── handler(context + auth)
```

```typescript
// Signature
function withAuth<T extends { request: Request; env: Env }>(
  handler: (context: T & { auth: AuthContext }) => Promise<Response>,
  options?: {
    requireCSRF?: boolean;
    requirePermission?: Permission;
    requireRole?: UserRole | UserRole[];
  }
): (context: T) => Promise<Response>;

// Usage
export const onRequestPost = withAuth(
  async ({ request, env, auth }) => {
    // auth.user, auth.sessionId, auth.role are guaranteed
    const body = await parseJsonBody(request);
    // ...
    return secureJson(result, 'detail');
  },
  { requirePermission: Permission.DOCUMENTS_WRITE, requireCSRF: true }
);
```

**Error handling**: Custom `AuthError` class with `statusCode`. Unexpected errors return generic "Authentication failed" (no info leakage).

---

## 7. Five-Tier Cache Strategy

**Sources**: `functions/utils/kv-cache.ts`, `functions/utils/cache.ts`, `functions/utils/security-headers.ts`

Consistent TTLs across all caching layers:

| Tier | max-age | s-maxage | stale-while-revalidate | Use case |
|------|---------|----------|----------------------|----------|
| `static` | 3600 (1hr) | 3600 | 86400 (24hr) | Department lists, barangay data |
| `list` | 900 (15min) | 900 | 3600 (1hr) | Search results, document lists |
| `detail` | 300 (5min) | 300 | 600 (10min) | Individual records |
| `count` | 120 (2min) | 120 | 300 (5min) | Aggregated statistics |
| `none` | no-store | — | — | Admin mutations |

### KV Cache (Cache-Aside Pattern)

```typescript
const kvCache = createKVCache(env);

// Cache miss → compute → store → return
const result = await kvCache.get(
  kvCache.documentsKey({ type: 'ordinance', term: 'sb_12' }),
  () => fetchFromDatabase(db, params),
  CACHE_TTL.list
);
```

**Key design decisions**:
- **Fail-open**: KV errors fall back to computing the value (logged, never throws)
- **Sorted params for deterministic keys**: `documents:list?term=sb_12&type=ordinance`
- **Prefix-based invalidation**: `invalidatePrefix('openlgu:documents:')` for bulk cache clear

### HTTP Cache Headers

```typescript
// Convenience: security headers + cache headers in one call
return secureJson(data, 'list', 200, env);
```

### ETag Support

```typescript
const etag = generateETag(data);
const notModified = checkETag(request, etag);
if (notModified) return new Response(null, { status: 304 });
```

---

## 8. Security Patterns

**Source**: `functions/utils/security-headers.ts`

### Defense-in-Depth Layers

```
1. CSP Headers (environment-aware: strict vs development)
2. Standard headers (HSTS, X-Frame-Options, X-Content-Type-Options, etc.)
3. Authentication (GitHub OAuth + KV session store)
4. Authorization (RBAC: admin/editor/viewer)
5. CSRF (one-time tokens, deleted after use)
6. Rate Limiting (per-IP, fail-open)
7. Input Validation (body size limits, SQL parameterization)
8. Audit Logging (non-blocking, comprehensive)
```

### Environment-Aware CSP

```typescript
// Production: strict
const CSP_STRICT =
  "default-src 'self'; " +
  "script-src 'self' 'unsafe-inline'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self' data:; " +
  "connect-src 'self'; " +
  "frame-ancestors 'none';";

// Development: permissive (HMR, devtools)
const CSP_DEVELOPMENT =
  "default-src 'self' 'unsafe-eval'; " +
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'; " +
  "img-src 'self' data: https: http://localhost:*; " +
  "connect-src 'self' http://localhost:* ws://localhost:*; " +
  "frame-ancestors 'none';";
```

### Standard Security Headers

```typescript
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-XSS-Protection': '0',                    // Disable legacy filter (CSP handles XSS)
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
} as const;
```

### CSRF Protection (One-Time Tokens)

```typescript
// Generate
const token = crypto.randomUUID();
await kv.put(`csrf:${sessionId}:${token}`, '1', { expirationTtl: 86400 });

// Validate (deletes after use — prevents replay)
const exists = await kv.get(`csrf:${sessionId}:${token}`);
if (exists) { await kv.delete(key); return true; }
return false;
```

### Rate Limiting (Fail-Open)

```typescript
// KV read failed? Allow the request. KV write failed? Allow the request.
// Never block legitimate traffic due to infrastructure issues.
try {
  const record = await kv.get(key, 'json');
  // ... check rate limit
} catch (error) {
  console.error('Rate limiting KV error, allowing request:', error);
  return { allowed: true, remaining: limit - 1, resetAt: now + window * 1000 };
}
```

Client identification via `CF-Connecting-IP` header (Cloudflare-native). Standard rate limit response headers (`ratelimit-limit`, `ratelimit-remaining`, `ratelimit-reset`).

---

## 9. RBAC Permission System

**Source**: `functions/utils/rbac.ts`

Three-tier role hierarchy with granular permissions:

```typescript
enum UserRole { ADMIN = 'admin', EDITOR = 'editor', VIEWER = 'viewer' }

enum Permission {
  DOCUMENTS_READ = 'documents:read',    DOCUMENTS_WRITE = 'documents:write',
  DOCUMENTS_DELETE = 'documents:delete',
  PERSONS_READ = 'persons:read',        PERSONS_WRITE = 'persons:write',
  PERSONS_DELETE = 'persons:delete',    PERSONS_MERGE = 'persons:merge',
  SESSIONS_READ = 'sessions:read',      SESSIONS_WRITE = 'sessions:write',
  REVIEW_QUEUE_READ = 'review_queue:read', REVIEW_QUEUE_ASSIGN = 'review_queue:assign',
  ADMIN_SETTINGS = 'admin:settings',    ADMIN_AUDIT_LOGS = 'admin:audit_logs',
  // ...
}

const ROLE_PERMISSIONS = {
  [UserRole.ADMIN]:  [/* all 16 permissions */],
  [UserRole.EDITOR]: [/* 13 permissions — no delete, no admin settings/logs */],
  [UserRole.VIEWER]: [/* 4 read-only permissions */],
};
```

**Permission format**: `resource:action` (e.g., `documents:read`). Easy to extend — add a new enum member and update the role mapping.

---

## 10. Audit Logging

**Source**: `functions/utils/audit-log.ts`

Non-blocking audit logging to D1. Core principle: **audit failures never break operations**.

```typescript
await logAudit(env, {
  action: 'create_document',
  performedBy: auth.user.login,
  targetType: 'document',
  targetId: 'doc_123',
  details: { title: 'Ordinance 001', type: 'ordinance' },
});

// Batch operations
await logAuditBatch(env, entries);  // Promise.allSettled internally
```

**Schema**: `admin_audit_log` with columns `id`, `action`, `performed_by`, `target_type`, `target_id`, `details` (JSON), `created_at`.

**Action taxonomy**: 20+ action types as constants (`AuditActions.CREATE_DOCUMENT`, `AuditActions.MERGE_PERSONS`, etc.) and 10+ target types (`AuditTargetTypes.DOCUMENT`, etc.).

---

## 11. E2E API Mocking

**Source**: `e2e/test-config.ts`

Extended Playwright fixture that auto-mocks all API routes when `CI=true`:

```typescript
// e2e/test-config.ts
import { test as base, expect } from '@playwright/test';

const shouldMockApis = process.env.CI === 'true' || process.env.MOCK_API === 'true';

export const test = base.extend({
  page: async ({ page }, use) => {
    if (shouldMockApis) {
      // Most specific routes first, catch-all last
      await page.route('**/api/weather**', route => route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ /* realistic mock data */ }),
      }));

      await page.route('**/api/openlgu/**', route => route.fulfill({
        body: JSON.stringify({ data: [], offline: true }),
      }));

      await page.route('**/api/**', route => route.fulfill({
        body: JSON.stringify({ data: null, offline: true }),
      }));
    }
    await use(page);
  },
});

export { expect };
```

**Usage**: Import from `./test-config` instead of `@playwright/test`:

```typescript
import { test, expect } from './test-config';

test('homepage loads', async ({ page }) => {
  await page.goto('/');
  // API calls are already mocked — no setup needed
});
```

**Why it works**: Zero mocking code in test files. Mocks are set up before the page is used. Deterministic in CI, real API in local dev.

---

## 12. Pre-Commit Quality Gates

**Source**: `.husky/pre-commit`

Two-stage pipeline:

1. **Raw color token detection** — grep scan blocks commits with `bg-gray-*`, `text-gray-*`, etc. in page components
2. **lint-staged** — ESLint auto-fix + Prettier formatting

```bash
#!/bin/sh
set -e

# Stage 1: Design system enforcement
if grep -rn "bg-gray-\|text-gray-\|border-gray-" src/pages/... ; then
  echo "❌ Use semantic tokens: bg-kapwa-bg-*, text-kapwa-text-*"
  exit 1
fi

# Stage 2: Auto-formatting
npx lint-staged
```

**`.lintstagedrc.js`**:
```javascript
module.exports = {
  '*.{js,jsx,ts,tsx,cjs,mjs}': ['eslint --fix'],
  '*.{js,jsx,ts,tsx,cjs,mjs,json,md,yml,yaml,css,html}': ['prettier --write'],
};
```

**`commitlint.config.js`**:
```javascript
module.exports = { extends: ['@commitlint/config-conventional'] };
```

---

## 13. CI/CD Pipeline Design

**Source**: `.github/workflows/`

### Quality Gate Pattern

```
Quality Gate Job (must pass first)
  ├── tsc --noEmit (type check)
  ├── eslint --max-warnings 0 (lint)
  └── prettier --check . (format)

Deploy Job (only runs after quality gate)
  ├── npm run build
  ├── D1 migrations (production only)
  └── Cloudflare Pages deploy (wrangler-action, pinned version)
```

### Parallel E2E Jobs

```yaml
e2e:           # Standard E2E (all browsers: Chromium, Firefox, WebKit, Mobile)
e2e-visual:    # Visual regression (@visual tag, PR only, continue-on-error)
e2e-a11y:      # Accessibility (@a11y tag, continue-on-error)
```

### Security Posture

- **Pinned action SHAs** (not tags — prevents supply chain attacks)
- `persist-credentials: false` on all checkouts
- Least-privilege permissions on all workflows
- `zizmor` workflow for GitHub Actions security analysis

### Multi-Browser Testing

```typescript
// playwright.config.ts
projects: [
  { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
  { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
  { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
],
```

CI: `forbidOnly`, 2 retries, blob reporter. Local: HTML reporter, no retries, auto-reuse dev server.

---

## 14. Vite + Cloudflare Functions Dev Setup

**Source**: `vite.config.ts`

```typescript
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: [{ find: '@', replacement: path.resolve(__dirname, 'src') }],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8788',  // Wrangler dev server
        changeOrigin: true,
        configure: proxy => {
          // Graceful degradation when backend is offline
          proxy.on('error', (_err, _req, res) => {
            if (!res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'API unavailable', offline: true }));
            }
          });
        },
      },
    },
  },
});
```

**Dev workflow**: `vite dev` (port 5173) proxies `/api` to `wrangler pages dev` (port 8788). Backend offline? Frontend gets `{ offline: true }` instead of crashing.

**TypeScript**: Three configs — `tsconfig.json` (base), `tsconfig.app.json` (frontend, strict), `tsconfig.node.json` (tooling).

---

## 15. Tailwind v4 + Design System Integration

**Source**: `src/index.css`, `tailwind.config.js`

Tailwind v4 CSS-first configuration. Design tokens come from the `@bettergov/kapwa` npm package.

```css
/* src/index.css */
@import 'tailwindcss';
@source '../node_modules/@bettergov/kapwa/dist';
@import '@bettergov/kapwa/styles';
```

**Minimal tailwind.config.js** — Kapwa provides everything:

```javascript
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-kapwa-sans)'],   // Inter
        mono: ['var(--font-kapwa-mono)'],   // Roboto Mono
      },
    },
  },
  plugins: [],
};
```

**Design token hierarchy** (defined in Kapwa's CSS via `@theme`):

| Layer | Pattern | Example |
|-------|---------|---------|
| Text | `text-kapwa-text-{purpose}` | `text-kapwa-text-strong`, `text-kapwa-text-support`, `text-kapwa-text-brand` |
| Background | `bg-kapwa-bg-{purpose}` | `bg-kapwa-bg-surface`, `bg-kapwa-bg-surface-raised`, `bg-kapwa-bg-hover` |
| Border | `border-kapwa-border-{purpose}` | `border-kapwa-border-weak`, `border-kapwa-border-strong`, `border-kapwa-border-brand` |
| Spacing | `p-kapwa-{size}` | `p-kapwa-xs` (4px) through `p-kapwa-3xl` (48px) |
| Typography | `kapwa-heading-xl/lg/md/sm` | `kapwa-heading-lg` (bold, tight tracking) |
| Animation | `duration-kapwa-{speed}` | `duration-kapwa-fast` (75ms) through `duration-kapwa-slow` (500ms) |

---

## 16. Claude Code Skills and Agents

**Source**: `.claude/skills/`, `.claude/agents/`

Project-specific quality standards encoded as AI-checkable checklists.

### Skills (9 invokable)

| Skill | Trigger | What it does |
|-------|---------|--------------|
| `design-cohesion-check` | After writing components | Audits Kapwa token usage, detects raw colors, hardcoded values |
| `component-split` | When component >300 lines | Guides splitting into focused sub-components |
| `responsive-check` | After UI changes | Checks mobile-first breakpoints, touch targets, fixed widths |
| `d1-migration` | Database schema changes | Sequential migration numbering, local-first, backup safety |
| `d1-query-analyzer` | Before running SQL | Analyzes query safety and performance |
| `d1-data-backfill` | Data migration operations | Guides batch operations with idempotency |
| `d1-review-queue` | Data change reviews | Systematic processing of queued changes |
| `i18n-sync` | After adding translatable strings | Syncs translation keys across locale files |
| `pipeline-run` | Running data pipelines | Execution safety checklist |

### Agents (8 specialized reviewers)

| Agent | Focus Area |
|-------|-----------|
| `a11y-reviewer` | WCAG 2.1 AA compliance |
| `design-token-auditor` | Design system adherence |
| `responsive-reviewer` | Mobile responsiveness |
| `performance-analyzer` | Page load and runtime performance |
| `i18n-auditor` | Translation completeness |
| `d1-data-auditor` | Database data quality |
| `author-matcher` | Legislative author matching |
| `session-number-fixer` | Session numbering validation |

### Skill File Structure

```markdown
# .claude/skills/design-cohesion-check/SKILL.md
---
name: design-cohesion-check
description: Audit components for Kapwa design token usage
disable-model-invocation: false
user-invocable: true
---

## Check 1: Missing Tailwind v4 Prefixes
Detect: `kapwa-text-strong` (missing `text-` prefix)
Fix: `text-kapwa-text-strong`

## Check 2: Raw Color Tokens
Detect: `bg-gray-500`, `text-blue-600`
Fix: `bg-kapwa-bg-surface`, `text-kapwa-text-brand`

## Check 3: Hardcoded Colors
Detect: `#fff`, `rgb(0,0,0)`, `rgba(...)`
Fix: Use semantic tokens

# ... more checks with patterns and examples
```

**Why this pattern works**: Project conventions are encoded as machine-readable checklists. New contributors (human or AI) get consistent guidance without reading documentation. Skills evolve with the project independently of code.

---

## Quick Reference: File Paths

| Pattern | File |
|---------|------|
| Central config | `config/lgu.config.json` |
| Config accessor | `src/lib/lguConfig.ts` |
| Compound components | `src/components/ui/Card.tsx` |
| Layout abstractions | `src/components/layout/UnifiedLayouts.tsx` |
| Auth middleware | `functions/utils/admin-auth.ts` |
| RBAC | `functions/utils/rbac.ts` |
| CSRF | `functions/utils/csrf.ts` |
| Rate limiting | `functions/utils/rate-limit.ts` |
| KV cache | `functions/utils/kv-cache.ts` |
| HTTP cache | `functions/utils/cache.ts` |
| Security headers | `functions/utils/security-headers.ts` |
| Audit logging | `functions/utils/audit-log.ts` |
| E2E test config | `e2e/test-config.ts` |
| Design assertions | `e2e/utils/kapwa.ts` |
| Pre-commit hook | `.husky/pre-commit` |
| Vite config | `vite.config.ts` |
| Tailwind config | `tailwind.config.js` |
| Cloudflare bindings | `functions/types.ts` |
