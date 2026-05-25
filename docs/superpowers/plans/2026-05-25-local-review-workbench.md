# Local Review Workbench v1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a local dev-only review workbench for staged OpenLGU legislative documents with a Hono server and Vite UI.

**Architecture:** Two-process design — a Hono ESM server reads local JSONL artifacts into memory, serves a REST API, and appends review decisions. The Vite app renders the workbench UI at `/admin/openlgu/workbench` with a lazy-loaded, DEV-guarded route.

**Tech Stack:** Hono (HTTP server), Vitest (tests), React 19 + Kapwa design system (UI), Node.js built-ins (fs, crypto, path)

**Spec:** `docs/superpowers/specs/2026-05-25-local-review-workbench-design.md`

---

## File Structure

### Server (new files)

```
scripts/openlgu/
  generate-term-snapshot.cjs          # generates pipeline/openlgu/terms.json
  review-workbench-server.mjs         # Hono server entry + routes
  workbench/
    artifacts.mjs                     # JSONL loading, memory snapshots, reload
    projection.mjs                    # review state projection, term inference
    types.mjs                         # shared types, constants, schemas
```

### UI (new files)

```
src/pages/admin/openlgu/
  WorkbenchPage.tsx                   # main page + DEV guard fallback
  components/
    ArtifactStatusBanner.tsx          # artifact counts, stale/error state
    WorkbenchTabs.tsx                 # tab navigation
    MissingDatesTab.tsx               # missing dates list
    MissingTitlesTab.tsx              # missing titles list
    TurnoverMarkersTab.tsx            # turnover markers list
    DocumentReviewPanel.tsx           # side panel: evidence + form + history
    SourceEvidencePanel.tsx           # raw payload, PDF links, mirror
    ReviewForm.tsx                    # date/title input, evidence, submit
    ReviewHistory.tsx                 # decision timeline with status
src/lib/workbench-api.ts             # API client for workbench server
```

### Tests (new files)

```
scripts/openlgu/workbench/
  artifacts.test.mjs                  # artifact loading tests
  projection.test.mjs                 # projection + term inference tests
```

### Modified files

```
package.json                          # add hono dep + new scripts
src/App.tsx                           # add DEV-guarded lazy route
```

---

## Chunk 1: Server Foundation

### Task 1: Install Hono + add package scripts

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install hono**

```bash
cd /mnt/fast/github/betterlb && npm install hono @hono/node-server
```

- [ ] **Step 2: Add scripts to package.json**

Add to `scripts`:

```json
"openlgu:review-server": "node scripts/openlgu/review-workbench-server.mjs",
"openlgu:generate-term-snapshot": "node scripts/openlgu/generate-term-snapshot.cjs"
```

- [ ] **Step 3: Verify install**

```bash
node -e "require('hono'); require('@hono/node-server'); console.log('hono + @hono/node-server OK')"
```

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add hono dep + workbench scripts"
```

---

### Task 2: Term snapshot generator

**Files:**
- Create: `scripts/openlgu/generate-term-snapshot.cjs`
- Create: `pipeline/openlgu/terms.json` (output)

- [ ] **Step 1: Write the script**

```js
// scripts/openlgu/generate-term-snapshot.cjs
const fs = require('node:fs');
const path = require('node:path');

const TERMS = [
  { term_id: 'sb_9', label: '2016-2019', start_date: '2016-07-01', end_date: '2019-06-30' },
  { term_id: 'sb_10', label: '2019-2022', start_date: '2019-07-01', end_date: '2022-06-30' },
  { term_id: 'sb_11', label: '2022-2025', start_date: '2022-07-01', end_date: '2025-06-30' },
  { term_id: 'sb_12', label: '2025-2028', start_date: '2025-07-01', end_date: '2028-06-30' },
];

const outPath = path.resolve(__dirname, '../../pipeline/openlgu/terms.json');
fs.writeFileSync(outPath, JSON.stringify(TERMS, null, 2) + '\n');
console.log(`Wrote ${TERMS.length} terms to ${outPath}`);
```

- [ ] **Step 2: Run it**

```bash
npm run openlgu:generate-term-snapshot
```

Expected: `Wrote 4 terms to .../pipeline/openlgu/terms.json`

- [ ] **Step 3: Commit**

```bash
git add scripts/openlgu/generate-term-snapshot.cjs pipeline/openlgu/terms.json
git commit -m "feat(workbench): add term snapshot generator"
```

---

### Task 3: Server types and constants

**Files:**
- Create: `scripts/openlgu/workbench/types.mjs`

- [ ] **Step 1: Write types module**

```js
// scripts/openlgu/workbench/types.mjs

export const REVIEW_DECISION_SCHEMA_VERSION = 'review-decision-v1';
export const DEFAULT_PORT = 8789;
export const DEFAULT_API_PREFIX = '/api/workbench';

export const DECISION_TYPES = /** @type {const} */ ([
  'set_field',
  'cannot_determine',
  'confirm_turnover',
  'ignore',
]);

export const EVIDENCE_KINDS = /** @type {const} */ ([
  'pdf_text',
  'website_table_row',
  'facebook_post',
  'filename_inference',
  'manual_inspection',
  'manual_entry',
]);

export const REVIEW_FIELDS = /** @type {const} */ ([
  'date_enacted',
  'title',
  'term_id',
  'turnover_marker',
]);

export const REVIEW_STATUSES = /** @type {const} */ ([
  'active',
  'resolved',
  'blocked',
  'superseded',
]);

/** @typedef {{
 *   schema_version: string,
 *   id: string,
 *   source_record_id: string,
 *   staged_document_id: string | null,
 *   source_content_hash: string | null,
 *   decision_type: typeof DECISION_TYPES[number],
 *   field: typeof REVIEW_FIELDS[number] | null,
 *   value: string | null,
 *   derived: { term_id: string | null, term_inference: 'auto' | 'manual' | 'unmatched' | null } | null,
 *   term_override_id: string | null,
 *   term_override_reason: string | null,
 *   evidence: Array<{
 *     kind: typeof EVIDENCE_KINDS[number],
 *     note: string,
 *     url: string | null,
 *     local_path: string | null,
 *     quote: string | null,
 *   }>,
 *   created_at: string,
 *   created_by: string,
 * }} ReviewDecision */

/** @typedef {{
 *   id: string,
 *   source_record_id: string,
 *   candidate_document_id: string,
 *   document_type: string,
 *   number: string,
 *   normalized_number: string,
 *   title: string,
 *   date_enacted: string,
 *   pdf_url: string,
 *   term_id: string,
 *   staging_status: string,
 *   review_reason: string | null,
 *   turnover_marker: boolean | string,
 *   confidence_score: number | null,
 *   created_at: string,
 * }} StagedDocument */

/** @typedef {{
 *   term_id: string,
 *   label: string,
 *   start_date: string,
 *   end_date: string,
 * }} Term */

/** @typedef {{
 *   stagedDocs: StagedDocument[],
 *   sourceRecords: Map<string, any>,
 *   personRefs: any[],
 *   shadowReport: any,
 *   runManifests: Map<string, any>,
 *   terms: Term[],
 *   decisions: ReviewDecision[],
 *   projections: Map<string, Map<string, { status: string, decision: ReviewDecision | null, superseded_by: string | null }>>,
 *   loadedAt: string,
 *   errors: string[],
 * }} ArtifactSnapshot */
```

- [ ] **Step 2: Commit**

```bash
git add scripts/openlgu/workbench/types.mjs
git commit -m "feat(workbench): add server types and constants"
```

---

### Task 4: Artifact loader

**Files:**
- Create: `scripts/openlgu/workbench/artifacts.mjs`
- Create: `scripts/openlgu/workbench/artifacts.test.mjs`

- [ ] **Step 1: Write failing test for JSONL loading**

```js
// scripts/openlgu/workbench/artifacts.test.mjs
import { describe, it, expect, beforeAll } from 'vitest';
import { loadJsonl, loadJson, buildSnapshot } from './artifacts.mjs';
import { resolve } from 'node:path';
import { existsSync } from 'node:fs';

const PIPELINE_ROOT = resolve(import.meta.dirname, '../../../pipeline/openlgu');

describe('loadJsonl', () => {
  it('loads staged-documents.jsonl into array', async () => {
    const path = resolve(PIPELINE_ROOT, 'staged-documents.jsonl');
    if (!existsSync(path)) return; // skip if no artifacts
    const records = await loadJsonl(path);
    expect(records.length).toBeGreaterThan(0);
    expect(records[0]).toHaveProperty('id');
    expect(records[0]).toHaveProperty('source_record_id');
    expect(records[0]).toHaveProperty('staging_status');
  });

  it('returns empty array for missing file', async () => {
    const records = await loadJsonl('/tmp/does-not-exist.jsonl');
    expect(records).toEqual([]);
  });
});

describe('loadJson', () => {
  it('loads reconciliation-shadow.json', async () => {
    const path = resolve(PIPELINE_ROOT, 'reconciliation-shadow.json');
    if (!existsSync(path)) return;
    const data = await loadJson(path);
    expect(data).toHaveProperty('totals');
    expect(data).toHaveProperty('missing_fields');
  });

  it('returns null for missing file', async () => {
    const data = await loadJson('/tmp/does-not-exist.json');
    expect(data).toBeNull();
  });
});

describe('buildSnapshot', () => {
  it('loads all artifacts and returns snapshot', async () => {
    const snapshot = await buildSnapshot(PIPELINE_ROOT);
    expect(snapshot).toHaveProperty('stagedDocs');
    expect(snapshot).toHaveProperty('terms');
    expect(snapshot).toHaveProperty('decisions');
    expect(snapshot).toHaveProperty('loadedAt');
    expect(snapshot).toHaveProperty('errors');
    expect(snapshot.stagedDocs.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npx vitest run scripts/openlgu/workbench/artifacts.test.mjs
```

Expected: FAIL — module not found

- [ ] **Step 3: Write artifact loader**

```js
// scripts/openlgu/workbench/artifacts.mjs
import { readFile, readdir, stat } from 'node:fs/promises';
import { resolve, join } from 'node:path';

/**
 * @param {string} filePath
 * @returns {Promise<any[]>}
 */
export async function loadJsonl(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    const results = [];
    const lines = content.trim().split('\n').filter(Boolean);
    for (const line of lines) {
      try {
        results.push(JSON.parse(line));
      } catch {
        // skip malformed lines — errors surface via /health if needed
      }
    }
    return results;
  } catch {
    return [];
  }
}

/**
 * @param {string} filePath
 * @returns {Promise<any|null>}
 */
export async function loadJson(filePath) {
  try {
    const content = await readFile(filePath, 'utf-8');
    return JSON.parse(content);
  } catch {
    return null;
  }
}

/**
 * @param {string} pipelineRoot
 * @returns {Promise<import('./types.mjs').ArtifactSnapshot>}
 */
export async function buildSnapshot(pipelineRoot) {
  const errors = [];
  const startTime = new Date().toISOString();

  // Load staged documents
  const stagedDocs = await loadJsonl(resolve(pipelineRoot, 'staged-documents.jsonl'));

  // Load source records — merged file first, then per-source
  const sourceRecords = new Map();
  const mergedSourceRecords = await loadJsonl(resolve(pipelineRoot, 'source-records.jsonl'));
  for (const rec of mergedSourceRecords) {
    sourceRecords.set(rec.id, rec);
  }

  // Per-source source records (override merged for evidence display)
  const sourcesDir = resolve(pipelineRoot, 'sources');
  try {
    const sourceDirs = await readdir(sourcesDir);
    for (const dir of sourceDirs) {
      const latestPath = resolve(sourcesDir, dir, 'latest', 'source-records.jsonl');
      const records = await loadJsonl(latestPath);
      for (const rec of records) {
        sourceRecords.set(rec.id, rec);
      }
    }
  } catch {
    // sources directory may not exist
  }

  // Load person refs
  const personRefs = await loadJsonl(resolve(pipelineRoot, 'staged-person-refs.jsonl'));

  // Load reconciliation shadow
  const shadowReport = await loadJson(resolve(pipelineRoot, 'reconciliation-shadow.json'));

  // Load run manifests
  const runManifests = new Map();
  try {
    const sourceDirs = await readdir(sourcesDir);
    for (const dir of sourceDirs) {
      const runPath = resolve(sourcesDir, dir, 'latest', 'run.json');
      const manifest = await loadJson(runPath);
      if (manifest) runManifests.set(dir, manifest);
    }
  } catch {
    // ok
  }

  // Load terms
  const terms = (await loadJson(resolve(pipelineRoot, 'terms.json'))) || [];

  // Load review decisions
  const decisions = await loadJsonl(resolve(pipelineRoot, 'review-decisions.jsonl'));

  return {
    stagedDocs,
    sourceRecords,
    personRefs,
    shadowReport,
    runManifests,
    terms,
    decisions,
    projections: new Map(),
    loadedAt: startTime,
    errors,
  };
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npx vitest run scripts/openlgu/workbench/artifacts.test.mjs
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add scripts/openlgu/workbench/artifacts.mjs scripts/openlgu/workbench/artifacts.test.mjs
git commit -m "feat(workbench): add artifact loader with tests"
```

---

### Task 5: Review projection logic

**Files:**
- Create: `scripts/openlgu/workbench/projection.mjs`
- Create: `scripts/openlgu/workbench/projection.test.mjs`

- [ ] **Step 1: Write failing tests**

```js
// scripts/openlgu/workbench/projection.test.mjs
import { describe, it, expect } from 'vitest';
import { inferTerm, projectReviewState, filterStagedDocs } from './projection.mjs';

const TERMS = [
  { term_id: 'sb_11', label: '2022-2025', start_date: '2022-07-01', end_date: '2025-06-30' },
  { term_id: 'sb_12', label: '2025-2028', start_date: '2025-07-01', end_date: '2028-06-30' },
];

describe('inferTerm', () => {
  it('auto-infers term from date within range', () => {
    const result = inferTerm('2023-07-15', TERMS);
    expect(result).toEqual({ term_id: 'sb_11', term_inference: 'auto' });
  });

  it('returns unmatched for date outside all ranges', () => {
    const result = inferTerm('2010-01-01', TERMS);
    expect(result).toEqual({ term_id: null, term_inference: 'unmatched' });
  });

  it('handles boundary dates inclusively', () => {
    const result = inferTerm('2022-07-01', TERMS);
    expect(result.term_id).toBe('sb_11');
  });

  it('returns unmatched for empty date', () => {
    const result = inferTerm('', TERMS);
    expect(result).toEqual({ term_id: null, term_inference: 'unmatched' });
  });
});

describe('projectReviewState', () => {
  it('returns active for no decisions', () => {
    const projections = projectReviewState([], new Map());
    expect(projections.size).toBe(0);
  });

  it('marks field resolved from set_field decision', () => {
    const decisions = [
      {
        id: 'rvd_001',
        source_record_id: 'src_1',
        decision_type: 'set_field',
        field: 'date_enacted',
        value: '2023-07-15',
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    const projections = projectReviewState(decisions);
    const fieldState = projections.get('src_1')?.get('date_enacted');
    expect(fieldState?.status).toBe('resolved');
    expect(fieldState?.decision?.id).toBe('rvd_001');
  });

  it('marks field blocked from cannot_determine decision', () => {
    const decisions = [
      {
        id: 'rvd_002',
        source_record_id: 'src_1',
        decision_type: 'cannot_determine',
        field: 'date_enacted',
        value: null,
        created_at: '2026-01-01T00:00:00Z',
      },
    ];
    const projections = projectReviewState(decisions);
    const fieldState = projections.get('src_1')?.get('date_enacted');
    expect(fieldState?.status).toBe('blocked');
  });

  it('latest decision wins (supersession)', () => {
    const decisions = [
      {
        id: 'rvd_old',
        source_record_id: 'src_1',
        decision_type: 'set_field',
        field: 'date_enacted',
        value: '2023-01-01',
        created_at: '2026-01-01T00:00:00Z',
      },
      {
        id: 'rvd_new',
        source_record_id: 'src_1',
        decision_type: 'set_field',
        field: 'date_enacted',
        value: '2023-07-15',
        created_at: '2026-01-02T00:00:00Z',
      },
    ];
    const projections = projectReviewState(decisions);
    const fieldState = projections.get('src_1')?.get('date_enacted');
    expect(fieldState?.status).toBe('resolved');
    expect(fieldState?.decision?.id).toBe('rvd_new');
    expect(fieldState?.superseded_by).toBeUndefined();
  });
});

describe('filterStagedDocs', () => {
  const stagedDocs = [
    { id: 'std_1', source_record_id: 'src_1', document_type: 'resolution', normalized_number: '2022-001', staging_status: 'needs_review', date_enacted: '', title: 'Test', turnover_marker: false },
    { id: 'std_2', source_record_id: 'src_2', document_type: 'ordinance', normalized_number: '2023-001', staging_status: 'needs_review', date_enacted: '2023-07-15', title: '', turnover_marker: false },
    { id: 'std_3', source_record_id: 'src_3', document_type: 'resolution', normalized_number: '2022-002', staging_status: 'needs_review', date_enacted: '', title: 'Has Title', turnover_marker: true },
    { id: 'std_4', source_record_id: 'src_4', document_type: 'executive_order', normalized_number: '2026-001', staging_status: 'new', date_enacted: '2026-01-01', title: 'Active EO', turnover_marker: false },
  ];

  const projections = new Map([
    ['src_1', new Map([['date_enacted', { status: 'resolved', decision: { id: 'rvd_1' }, superseded_by: null }]])],
  ]);

  it('filters missing_dates tab — active only', () => {
    const result = filterStagedDocs(stagedDocs, projections, { tab: 'missing_dates', status: 'active' });
    // src_1 has date resolved, src_3 still missing date — only src_3 active
    expect(result.items.some(d => d.source_record_id === 'src_3')).toBe(true);
    expect(result.items.some(d => d.source_record_id === 'src_1')).toBe(false);
  });

  it('filters missing_titles tab — active only', () => {
    const result = filterStagedDocs(stagedDocs, projections, { tab: 'missing_titles', status: 'active' });
    expect(result.items.some(d => d.source_record_id === 'src_2')).toBe(true);
  });

  it('filters turnover_markers tab', () => {
    const result = filterStagedDocs(stagedDocs, projections, { tab: 'turnover_markers', status: 'active' });
    expect(result.items.some(d => d.source_record_id === 'src_3')).toBe(true);
    expect(result.items.length).toBe(1);
  });
});
```

- [ ] **Step 2: Run test — expect failure**

```bash
npx vitest run scripts/openlgu/workbench/projection.test.mjs
```

- [ ] **Step 3: Write projection module**

```js
// scripts/openlgu/workbench/projection.mjs

/**
 * @param {string} dateStr - ISO date string
 * @param {import('./types.mjs').Term[]} terms
 * @returns {{ term_id: string | null, term_inference: 'auto' | 'unmatched' }}
 */
export function inferTerm(dateStr, terms) {
  if (!dateStr) return { term_id: null, term_inference: 'unmatched' };

  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return { term_id: null, term_inference: 'unmatched' };

  const matches = terms.filter((t) => {
    const start = new Date(t.start_date);
    const end = new Date(t.end_date);
    return date >= start && date <= end;
  });

  if (matches.length === 1) return { term_id: matches[0].term_id, term_inference: 'auto' };
  if (matches.length === 0) return { term_id: null, term_inference: 'unmatched' };

  // Multiple overlapping — should not happen with well-formed terms
  return { term_id: matches[0].term_id, term_inference: 'auto' };
}

/**
 * @param {import('./types.mjs').ReviewDecision[]} decisions
 * @returns {Map<string, Map<string, { status: string, decision: import('./types.mjs').ReviewDecision | null, superseded_by: string | null }>>}
 */
export function projectReviewState(decisions) {
  // Group decisions by (source_record_id, field), keep latest
  const grouped = new Map();

  for (const decision of decisions) {
    const srcId = decision.source_record_id;
    if (!grouped.has(srcId)) grouped.set(srcId, new Map());

    const field = decision.field || '__record__';
    const fieldMap = grouped.get(srcId);

    if (!fieldMap.has(field)) {
      fieldMap.set(field, []);
    }
    fieldMap.get(field).push(decision);
  }

  // Project: latest wins
  const projections = new Map();

  for (const [srcId, fieldMap] of grouped) {
    const projection = new Map();

    for (const [field, fieldDecisions] of fieldMap) {
      // Sort by created_at, latest last
      fieldDecisions.sort((a, b) => a.created_at.localeCompare(b.created_at));
      const latest = fieldDecisions[fieldDecisions.length - 1];

      let status = 'active';
      if (latest.decision_type === 'set_field' || latest.decision_type === 'confirm_turnover') {
        status = 'resolved';
      } else if (latest.decision_type === 'cannot_determine') {
        status = 'blocked';
      } else if (latest.decision_type === 'ignore') {
        status = 'resolved'; // ignored = resolved
      }

      projection.set(field, { status, decision: latest, superseded_by: null });
    }

    projections.set(srcId, projection);
  }

  return projections;
}

/**
 * @param {import('./types.mjs').StagedDocument[]} docs
 * @param {Map<string, Map<string, any>>} projections
 * @param {{ tab: string, status?: string, page?: number, limit?: number }} filters
 * @returns {{ items: any[], total: number, page: number, limit: number, has_more: boolean }}
 */
export function filterStagedDocs(docs, projections, filters) {
  const { tab, status = 'active', page = 1, limit = 50 } = filters;

  let filtered = docs.filter((doc) => {
    // Tab filter: which documents belong to this tab
    if (tab === 'missing_dates') {
      if (!doc.date_enacted) return true;
      return false;
    }
    if (tab === 'missing_titles') {
      if (!doc.title) return true;
      return false;
    }
    if (tab === 'turnover_markers') {
      if (doc.turnover_marker) return true;
      return false;
    }
    return true;
  });

  // Status filter: apply projection
  filtered = filtered.filter((doc) => {
    const fieldProjections = projections.get(doc.source_record_id);

    // Check record-level ignore decision
    const recordState = fieldProjections?.get('__record__');
    if (recordState?.status === 'resolved' && status === 'active') return false;

    const relevantField = tab === 'missing_dates' ? 'date_enacted'
      : tab === 'missing_titles' ? 'title'
      : tab === 'turnover_markers' ? 'turnover_marker'
      : null;

    const fieldState = fieldProjections?.get(relevantField || '__record__');

    const docStatus = fieldState?.status || 'active';

    if (status === 'active') return docStatus === 'active';
    if (status === 'resolved') return docStatus === 'resolved';
    if (status === 'blocked') return docStatus === 'blocked';
    return true; // 'all'
  });

  // Deterministic sort: document_type, normalized_number, id
  filtered.sort((a, b) => {
    const typeCmp = (a.document_type || '').localeCompare(b.document_type || '');
    if (typeCmp !== 0) return typeCmp;
    const numCmp = (a.normalized_number || '').localeCompare(b.normalized_number || '');
    if (numCmp !== 0) return numCmp;
    return a.id.localeCompare(b.id);
  });

  const total = filtered.length;
  const offset = (page - 1) * limit;
  const items = filtered.slice(offset, offset + limit);

  return {
    items,
    total,
    page,
    limit,
    has_more: offset + limit < total,
  };
}
```

- [ ] **Step 4: Run test — expect pass**

```bash
npx vitest run scripts/openlgu/workbench/projection.test.mjs
```

- [ ] **Step 5: Commit**

```bash
git add scripts/openlgu/workbench/projection.mjs scripts/openlgu/workbench/projection.test.mjs
git commit -m "feat(workbench): add review projection with term inference and filtering"
```

---

## Chunk 2: Server API

### Task 6: Hono server with health, reload, terms, artifact-status endpoints

**Files:**
- Create: `scripts/openlgu/review-workbench-server.mjs`

- [ ] **Step 1: Write server entry point**

The server wires together the artifact loader, projection logic, and Hono routes. All routes in one file for v1 (~300 lines).

```js
// scripts/openlgu/review-workbench-server.mjs
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { serve } from '@hono/node-server';
import { resolve } from 'node:path';
import { appendFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { buildSnapshot } from './workbench/artifacts.mjs';
import { inferTerm, projectReviewState, filterStagedDocs } from './workbench/projection.mjs';
import {
  DEFAULT_PORT,
  REVIEW_DECISION_SCHEMA_VERSION,
  DECISION_TYPES,
  EVIDENCE_KINDS,
  REVIEW_FIELDS,
} from './workbench/types.mjs';

const PORT = parseInt(process.env.OPENLGU_REVIEW_PORT || String(DEFAULT_PORT), 10);
const PIPELINE_ROOT = resolve(import.meta.dirname, '../../pipeline/openlgu');
const DECISIONS_PATH = resolve(PIPELINE_ROOT, 'review-decisions.jsonl');

let snapshot = null;

async function reloadSnapshot() {
  const next = await buildSnapshot(PIPELINE_ROOT);
  next.projections = projectReviewState(next.decisions);
  snapshot = next;
  return next;
}

function requireSnapshot(c) {
  if (!snapshot) return c.json({ error: 'Artifacts not loaded' }, 503);
  return null;
}

const app = new Hono();

app.use('*', cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
}));

// Health
app.get('/api/workbench/health', (c) => {
  return c.json({
    status: snapshot ? 'ok' : 'loading',
    loadedAt: snapshot?.loadedAt || null,
    errors: snapshot?.errors || [],
    artifactCounts: snapshot ? {
      stagedDocs: snapshot.stagedDocs.length,
      sourceRecords: snapshot.sourceRecords.size,
      decisions: snapshot.decisions.length,
      terms: snapshot.terms.length,
    } : null,
  });
});

// Reload
app.post('/api/workbench/reload', async (c) => {
  try {
    const next = await reloadSnapshot();
    return c.json({ status: 'ok', loadedAt: next.loadedAt });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// Terms
app.get('/api/workbench/terms', (c) => {
  if (!snapshot) return c.json([]);
  return c.json(snapshot.terms);
});

// Artifact status
app.get('/api/workbench/artifact-status', (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);
  const shadow = snapshot.shadowReport || {};
  const sourceRuns = Object.fromEntries(
    [...snapshot.runManifests.entries()].map(([key, manifest]) => [
      key,
      {
        status: manifest.status,
        started_at: manifest.started_at,
        finished_at: manifest.finished_at,
        rows_emitted: manifest.counts?.source_records_emitted ?? 0,
      },
    ])
  );
  return c.json({
    generatedAt: shadow.generated_at || null,
    stagedDocCount: snapshot.stagedDocs.length,
    decisionCount: snapshot.decisions.length,
    termsCount: snapshot.terms.length,
    sourceRuns,
    loadedAt: snapshot.loadedAt,
    errors: snapshot.errors,
  });
});

// Stats
app.get('/api/workbench/stats', (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);

  const needsReview = snapshot.stagedDocs.filter(d => d.staging_status === 'needs_review');
  const missingDates = needsReview.filter(d => !d.date_enacted);
  const missingTitles = needsReview.filter(d => !d.title);
  const turnoverMarked = snapshot.stagedDocs.filter(d => d.turnover_marker);

  const proj = snapshot.projections;
  const countActive = (docs, field) => docs.filter(d => {
    const state = proj.get(d.source_record_id)?.get(field);
    return !state || state.status === 'active';
  }).length;

  return c.json({
    missing_dates: { total: missingDates.length, active: countActive(missingDates, 'date_enacted') },
    missing_titles: { total: missingTitles.length, active: countActive(missingTitles, 'title') },
    turnover_markers: { total: turnoverMarked.length, active: countActive(turnoverMarked, 'turnover_marker') },
    total_staged: snapshot.stagedDocs.length,
    total_decisions: snapshot.decisions.length,
  });
});

// Staged documents list
app.get('/api/workbench/staged-documents', (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);

  const tab = c.req.query('tab') || 'missing_dates';
  const status = c.req.query('status') || 'active';
  const page = parseInt(c.req.query('page') || '1', 10);
  const limit = Math.min(parseInt(c.req.query('limit') || '50', 10), 200);

  const result = filterStagedDocs(snapshot.stagedDocs, snapshot.projections, { tab, status, page, limit });

  // Enrich with source record data
  const enriched = result.items.map((doc) => {
    const sourceRecord = snapshot.sourceRecords.get(doc.source_record_id);
    const fieldProjections = snapshot.projections.get(doc.source_record_id);
    return {
      ...doc,
      review_state: Object.fromEntries(
        (fieldProjections?.entries() || []).map(([field, state]) => [field, state.status])
      ),
      source_payload: sourceRecord?.raw_payload_json || null,
      pdf_reachability: sourceRecord?.pdf_reachability || null,
      pdf_mirror_path: null, // TODO: local mirror support
    };
  });

  return c.json({ ...result, items: enriched });
});

// Staged document detail
app.get('/api/workbench/staged-documents/:id', (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);

  const id = c.req.param('id');
  const doc = snapshot.stagedDocs.find(d => d.source_record_id === id || d.id === id);
  if (!doc) return c.json({ error: 'not found' }, 404);

  const sourceRecord = snapshot.sourceRecords.get(doc.source_record_id);
  const fieldProjections = snapshot.projections.get(doc.source_record_id);
  const docDecisions = snapshot.decisions
    .filter(d => d.source_record_id === doc.source_record_id)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return c.json({
    ...doc,
    review_state: Object.fromEntries(
      (fieldProjections?.entries() || []).map(([field, state]) => [field, state])
    ),
    source_record: sourceRecord || null,
    decisions: docDecisions,
  });
});

// Create review decision
app.post('/api/workbench/review-decisions', async (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);

  const body = await c.req.json();

  // Validate
  if (!body.source_record_id) return c.json({ error: 'source_record_id required' }, 400);
  if (!DECISION_TYPES.includes(body.decision_type)) return c.json({ error: 'invalid decision_type' }, 400);

  if (body.decision_type === 'set_field') {
    if (!REVIEW_FIELDS.includes(body.field)) return c.json({ error: 'invalid field' }, 400);
    if (!body.value) return c.json({ error: 'value required for set_field' }, 400);
  }

  // Find staged doc for context
  const stagedDoc = snapshot.stagedDocs.find(d => d.source_record_id === body.source_record_id);
  const sourceRecord = snapshot.sourceRecords.get(body.source_record_id);

  // Build decision record
  const now = new Date().toISOString();
  const decision = {
    schema_version: REVIEW_DECISION_SCHEMA_VERSION,
    id: `rvd_${Date.now().toString(36)}_${randomUUID().slice(0, 8)}`,
    source_record_id: body.source_record_id,
    staged_document_id: stagedDoc?.id || null,
    source_content_hash: sourceRecord?.content_hash || null,
    decision_type: body.decision_type,
    field: body.field || null,
    value: body.value || null,
    derived: null,
    term_override_id: body.term_override_id || null,
    term_override_reason: body.term_override_reason || null,
    evidence: body.evidence || [],
    created_at: now,
    created_by: 'local',
  };

  // Compute derived for date_enacted
  if (body.decision_type === 'set_field' && body.field === 'date_enacted') {
    if (body.term_override_id) {
      decision.derived = {
        term_id: body.term_override_id,
        term_inference: 'manual',
      };
    } else {
      decision.derived = inferTerm(body.value, snapshot.terms);
    }
  }

  // Append to file
  await appendFile(DECISIONS_PATH, JSON.stringify(decision) + '\n');

  // Update in-memory snapshot
  snapshot.decisions.push(decision);
  snapshot.projections = projectReviewState(snapshot.decisions);

  // Return updated projected state
  const fieldProjections = snapshot.projections.get(body.source_record_id);
  return c.json({
    decision,
    projected_state: Object.fromEntries(
      (fieldProjections?.entries() || []).map(([field, state]) => [field, state])
    ),
  });
});

// Get review decisions
app.get('/api/workbench/review-decisions', (c) => {
  if (!snapshot) return c.json({ error: 'not loaded' }, 503);

  const sourceRecordId = c.req.query('source_record_id');
  if (!sourceRecordId) return c.json({ error: 'source_record_id required' }, 400);

  const decisions = snapshot.decisions
    .filter(d => d.source_record_id === sourceRecordId)
    .sort((a, b) => b.created_at.localeCompare(a.created_at));

  return c.json({ decisions });
});

// Start server
console.log(`Loading artifacts from ${PIPELINE_ROOT}...`);
reloadSnapshot().then((snap) => {
  console.log(`Loaded: ${snap.stagedDocs.length} docs, ${snap.sourceRecords.size} source records, ${snap.decisions.length} decisions, ${snap.terms.length} terms`);

  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`Workbench server running at http://127.0.0.1:${info.port}`);
  });
}).catch((err) => {
  console.error('Failed to load artifacts:', err);
  // Start anyway — /health will show error
  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`Workbench server running at http://127.0.0.1:${info.port} (artifacts failed to load)`);
  });
});
```

- [ ] **Step 2: Test server starts**

```bash
timeout 5 npm run openlgu:review-server 2>&1 || true
```

Expected: "Workbench server running at http://127.0.0.1:8789"

- [ ] **Step 4: Test endpoints with curl**

In separate terminal:

```bash
# Health
curl -s http://localhost:8789/api/workbench/health | jq '.status'
# Expected: "ok"

# Stats
curl -s http://localhost:8789/api/workbench/stats | jq '.missing_dates'
# Expected: { "total": <number>, "active": <number> }

# Missing dates list
curl -s "http://localhost:8789/api/workbench/staged-documents?tab=missing_dates&status=active&page=1&limit=2" | jq '.total'
# Expected: positive number

# Terms
curl -s http://localhost:8789/api/workbench/terms | jq 'length'
# Expected: 4
```

- [ ] **Step 5: Commit**

```bash
git add scripts/openlgu/review-workbench-server.mjs package.json package-lock.json
git commit -m "feat(workbench): add Hono review server with all v1 endpoints"
```

---

## Chunk 3: UI

### Task 7: Workbench API client

**Files:**
- Create: `src/lib/workbench-api.ts`

- [ ] **Step 1: Write API client**

```ts
// src/lib/workbench-api.ts

const API_BASE =
  import.meta.env.VITE_OPENLGU_REVIEW_API || 'http://localhost:8789';

export interface ArtifactStatus {
  generatedAt: string | null;
  stagedDocCount: number;
  decisionCount: number;
  termsCount: number;
  sourceRuns: Record<string, { status: string; started_at: string; finished_at: string; rows_emitted: number }>;
  loadedAt: string;
  errors: string[];
}

export interface WorkbenchStats {
  missing_dates: { total: number; active: number };
  missing_titles: { total: number; active: number };
  turnover_markers: { total: number; active: number };
  total_staged: number;
  total_decisions: number;
}

export interface StagedDocument {
  id: string;
  source_record_id: string;
  document_type: string;
  number: string;
  normalized_number: string;
  title: string;
  date_enacted: string;
  pdf_url: string;
  term_id: string;
  staging_status: string;
  turnover_marker: boolean | string;
  review_state: Record<string, string>;
  source_payload: Record<string, string> | null;
  pdf_reachability: string | null;
  pdf_mirror_path: string | null;
}

export interface ReviewDecision {
  id: string;
  source_record_id: string;
  decision_type: string;
  field: string | null;
  value: string | null;
  derived: { term_id: string | null; term_inference: string | null } | null;
  evidence: Array<{
    kind: string;
    note: string;
    url?: string;
    quote?: string;
  }>;
  created_at: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  has_more: boolean;
}

export interface Term {
  term_id: string;
  label: string;
  start_date: string;
  end_date: string;
}

async function fetchApi<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(body.error || `API error ${res.status}`);
  }
  return res.json();
}

export const workbenchApi = {
  health: () => fetchApi<{ status: string; loadedAt: string }>('/api/workbench/health'),

  stats: () => fetchApi<WorkbenchStats>('/api/workbench/stats'),

  artifactStatus: () => fetchApi<ArtifactStatus>('/api/workbench/artifact-status'),

  terms: () => fetchApi<Term[]>('/api/workbench/terms'),

  stagedDocuments: (params: {
    tab: string;
    status?: string;
    page?: number;
    limit?: number;
  }) => {
    const qs = new URLSearchParams({
      tab: params.tab,
      status: params.status || 'active',
      page: String(params.page || 1),
      limit: String(params.limit || 50),
    });
    return fetchApi<PaginatedResponse<StagedDocument>>(
      `/api/workbench/staged-documents?${qs}`
    );
  },

  stagedDocument: (id: string) =>
    fetchApi<StagedDocument & { source_record: any; decisions: ReviewDecision[] }>(
      `/api/workbench/staged-documents/${encodeURIComponent(id)}`
    ),

  createDecision: (decision: {
    source_record_id: string;
    decision_type: string;
    field?: string | null;
    value?: string | null;
    term_override_id?: string | null;
    term_override_reason?: string | null;
    evidence?: Array<{ kind: string; note: string }>;
  }) =>
    fetchApi<{ decision: ReviewDecision; projected_state: Record<string, any> }>(
      '/api/workbench/review-decisions',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(decision),
      }
    ),

  decisions: (sourceRecordId: string) =>
    fetchApi<{ decisions: ReviewDecision[] }>(
      `/api/workbench/review-decisions?source_record_id=${encodeURIComponent(sourceRecordId)}`
    ),

  reload: () =>
    fetchApi<{ status: string; loadedAt: string }>('/api/workbench/reload', { method: 'POST' }),
};
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/workbench-api.ts
git commit -m "feat(workbench): add API client for review server"
```

---

### Task 8: WorkbenchPage + ArtifactStatusBanner + WorkbenchTabs

**Files:**
- Create: `src/pages/admin/openlgu/WorkbenchPage.tsx`
- Create: `src/pages/admin/openlgu/components/ArtifactStatusBanner.tsx`
- Create: `src/pages/admin/openlgu/components/WorkbenchTabs.tsx`

- [ ] **Step 1: Write ArtifactStatusBanner**

Simple banner showing artifact load state. Uses Kapwa Banner component (see existing admin pages for import pattern).

```tsx
// src/pages/admin/openlgu/components/ArtifactStatusBanner.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type ArtifactStatus } from '@/lib/workbench-api';

export function ArtifactStatusBanner() {
  const [status, setStatus] = useState<ArtifactStatus | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    workbenchApi.artifactStatus().then(setStatus).catch(() => setError('Review server unreachable'));
  }, []);

  if (error) {
    return (
      <div className="rounded-md bg-yellow-50 p-3 text-sm text-yellow-800">
        {error}. Start the server with <code>npm run openlgu:review-server</code>
      </div>
    );
  }

  if (!status) return null;

  if (status.errors.length > 0) {
    return (
      <div className="rounded-md bg-red-50 p-3 text-sm text-red-800">
        Artifact errors: {status.errors.join(', ')}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 text-sm text-slate-600">
      <span>{status.stagedDocCount} staged docs</span>
      <span>{status.decisionCount} decisions</span>
      <span>{status.termsCount} terms</span>
      {Object.entries(status.sourceRuns).map(([key, run]) => (
        <span key={key} className={`text-xs ${run.status === 'success' ? 'text-green-600' : 'text-red-500'}`}>
          {key}: {run.status} ({run.rows_emitted} rows)
        </span>
      ))}
      <span className="text-xs text-slate-400">
        Loaded {new Date(status.loadedAt).toLocaleTimeString()}
      </span>
    </div>
  );
}
```

- [ ] **Step 2: Write WorkbenchTabs**

```tsx
// src/pages/admin/openlgu/components/WorkbenchTabs.tsx
import type { WorkbenchStats } from '@/lib/workbench-api';

interface Props {
  activeTab: string;
  onTabChange: (tab: string) => void;
  stats: WorkbenchStats | null;
}

const TABS = [
  { key: 'missing_dates', label: 'Missing Dates', statKey: 'missing_dates' },
  { key: 'missing_titles', label: 'Missing Titles', statKey: 'missing_titles' },
  { key: 'turnover_markers', label: 'Turnover Markers', statKey: 'turnover_markers' },
] as const;

export function WorkbenchTabs({ activeTab, onTabChange, stats }: Props) {
  return (
    <div className="flex border-b border-slate-200">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key;
        const count = stats?.[tab.statKey]?.active ?? '?';
        return (
          <button
            key={tab.key}
            onClick={() => onTabChange(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              isActive
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 3: Write WorkbenchPage**

```tsx
// src/pages/admin/openlgu/WorkbenchPage.tsx
import { useCallback, useEffect, useState } from 'react';
import { workbenchApi, type WorkbenchStats, type StagedDocument } from '@/lib/workbench-api';
import { ArtifactStatusBanner } from './components/ArtifactStatusBanner';
import { WorkbenchTabs } from './components/WorkbenchTabs';
import { MissingDatesTab } from './components/MissingDatesTab';
import { MissingTitlesTab } from './components/MissingTitlesTab';
import { TurnoverMarkersTab } from './components/TurnoverMarkersTab';
import { DocumentReviewPanel } from './components/DocumentReviewPanel';

type TabKey = 'missing_dates' | 'missing_titles' | 'turnover_markers';

export default function WorkbenchPage() {
  const [stats, setStats] = useState<WorkbenchStats | null>(null);
  const [activeTab, setActiveTab] = useState<TabKey>('missing_dates');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const apiConfigured = !!import.meta.env.VITE_OPENLGU_REVIEW_API;

  const refreshStats = useCallback(() => {
    workbenchApi.stats().then(setStats).catch(() => {});
  }, []);

  useEffect(() => {
    if (!apiConfigured) return;
    refreshStats();
  }, [refreshStats, apiConfigured]);

  if (!apiConfigured) {
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-4">OpenLGU Review Workbench</h1>
        <div className="rounded-md bg-yellow-50 p-4 text-sm text-yellow-800">
          <p className="font-medium">Review server not configured</p>
          <p className="mt-1">Set <code>VITE_OPENLGU_REVIEW_API=http://localhost:8789</code> in your <code>.env.local</code> file, then restart the dev server.</p>
          <p className="mt-1">Start the review server with <code>npm run openlgu:review-server</code></p>
        </div>
      </div>
    );
  }

  const handleDecisionSaved = () => {
    refreshStats();
    setSelectedId(null);
  };

  const tabComponent = {
    missing_dates: <MissingDatesTab onSelect={setSelectedId} />,
    missing_titles: <MissingTitlesTab onSelect={setSelectedId} />,
    turnover_markers: <TurnoverMarkersTab onSelect={setSelectedId} />,
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">OpenLGU Review Workbench</h1>
        <button
          onClick={() => workbenchApi.reload().then(refreshStats)}
          className="text-sm text-slate-500 hover:text-slate-700"
        >
          Reload
        </button>
      </div>

      <ArtifactStatusBanner />
      <WorkbenchTabs activeTab={activeTab} onTabChange={setActiveTab} stats={stats} />

      <div className="flex gap-4">
        <div className="flex-1 min-w-0">
          {tabComponent[activeTab]}
        </div>

        {selectedId && (
          <div className="w-96 shrink-0">
            <DocumentReviewPanel
              sourceRecordId={selectedId}
              onDecisionSaved={handleDecisionSaved}
              onClose={() => setSelectedId(null)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/openlgu/
git commit -m "feat(workbench): add WorkbenchPage, tabs, and status banner"
```

---

### Task 9: Tab list components

**Files:**
- Create: `src/pages/admin/openlgu/components/MissingDatesTab.tsx`
- Create: `src/pages/admin/openlgu/components/MissingTitlesTab.tsx`
- Create: `src/pages/admin/openlgu/components/TurnoverMarkersTab.tsx`

- [ ] **Step 1: Write MissingDatesTab**

```tsx
// src/pages/admin/openlgu/components/MissingDatesTab.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type StagedDocument } from '@/lib/workbench-api';

interface Props {
  onSelect: (sourceRecordId: string) => void;
}

const TYPE_BADGE: Record<string, string> = {
  resolution: 'bg-blue-100 text-blue-800',
  ordinance: 'bg-purple-100 text-purple-800',
  executive_order: 'bg-green-100 text-green-800',
};

export function MissingDatesTab({ onSelect }: Props) {
  const [docs, setDocs] = useState<StagedDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    workbenchApi
      .stagedDocuments({ tab: 'missing_dates', status: 'active', page, limit: 50 })
      .then((res) => {
        setDocs(res.items);
        setTotal(res.total);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  if (loading) return <div className="p-4 text-sm text-slate-400">Loading...</div>;

  if (docs.length === 0) {
    return <div className="p-4 text-sm text-slate-500">No missing dates to review.</div>;
  }

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">{total} items need dates</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-slate-500">
            <th className="py-2 pr-2">Type</th>
            <th className="py-2 pr-2">Number</th>
            <th className="py-2 pr-2">Title</th>
            <th className="py-2 pr-2">Term</th>
            <th className="py-2">PDF</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr
              key={doc.source_record_id}
              onClick={() => onSelect(doc.source_record_id)}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            >
              <td className="py-2 pr-2">
                <span className={`inline-block rounded px-1.5 py-0.5 text-xs ${TYPE_BADGE[doc.document_type] || 'bg-slate-100'}`}>
                  {doc.document_type?.slice(0, 3).toUpperCase()}
                </span>
              </td>
              <td className="py-2 pr-2 font-mono text-xs">{doc.number}</td>
              <td className="py-2 pr-2 max-w-xs truncate">{doc.title || <span className="text-slate-400 italic">no title</span>}</td>
              <td className="py-2 pr-2 text-xs">{doc.term_id || '—'}</td>
              <td className="py-2">
                {doc.pdf_url ? (
                  <a
                    href={doc.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-xs"
                    onClick={(e) => e.stopPropagation()}
                  >
                    PDF
                  </a>
                ) : (
                  <span className="text-xs text-slate-300">none</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {total > 50 && (
        <div className="flex items-center justify-between mt-3 text-sm">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="text-slate-500 disabled:opacity-30"
          >
            Previous
          </button>
          <span>Page {page} of {Math.ceil(total / 50)}</span>
          <button
            disabled={page * 50 >= total}
            onClick={() => setPage(page + 1)}
            className="text-slate-500 disabled:opacity-30"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write MissingTitlesTab** (same pattern, tab='missing_titles')

```tsx
// src/pages/admin/openlgu/components/MissingTitlesTab.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type StagedDocument } from '@/lib/workbench-api';

interface Props {
  onSelect: (sourceRecordId: string) => void;
}

export function MissingTitlesTab({ onSelect }: Props) {
  const [docs, setDocs] = useState<StagedDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    workbenchApi
      .stagedDocuments({ tab: 'missing_titles', status: 'active', page: 1, limit: 50 })
      .then((res) => {
        setDocs(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-slate-400">Loading...</div>;
  if (docs.length === 0) return <div className="p-4 text-sm text-slate-500">No missing titles to review.</div>;

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">{total} items need titles</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-slate-500">
            <th className="py-2 pr-2">Type</th>
            <th className="py-2 pr-2">Number</th>
            <th className="py-2 pr-2">Date</th>
            <th className="py-2">PDF</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr
              key={doc.source_record_id}
              onClick={() => onSelect(doc.source_record_id)}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            >
              <td className="py-2 pr-2 text-xs">{doc.document_type}</td>
              <td className="py-2 pr-2 font-mono text-xs">{doc.number}</td>
              <td className="py-2 pr-2 text-xs">{doc.date_enacted || '—'}</td>
              <td className="py-2">
                {doc.pdf_url ? (
                  <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs" onClick={(e) => e.stopPropagation()}>PDF</a>
                ) : <span className="text-xs text-slate-300">none</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 3: Write TurnoverMarkersTab** (tab='turnover_markers')

```tsx
// src/pages/admin/openlgu/components/TurnoverMarkersTab.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type StagedDocument } from '@/lib/workbench-api';

interface Props {
  onSelect: (sourceRecordId: string) => void;
}

export function TurnoverMarkersTab({ onSelect }: Props) {
  const [docs, setDocs] = useState<StagedDocument[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    workbenchApi
      .stagedDocuments({ tab: 'turnover_markers', status: 'active', page: 1, limit: 50 })
      .then((res) => {
        setDocs(res.items);
        setTotal(res.total);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-4 text-sm text-slate-400">Loading...</div>;
  if (docs.length === 0) return <div className="p-4 text-sm text-slate-500">No turnover markers to review.</div>;

  return (
    <div>
      <div className="text-sm text-slate-500 mb-2">{total} turnover-marked items</div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs text-slate-500">
            <th className="py-2 pr-2">Type</th>
            <th className="py-2 pr-2">Number</th>
            <th className="py-2 pr-2">Title</th>
            <th className="py-2 pr-2">Marker</th>
            <th className="py-2">PDF</th>
          </tr>
        </thead>
        <tbody>
          {docs.map((doc) => (
            <tr
              key={doc.source_record_id}
              onClick={() => onSelect(doc.source_record_id)}
              className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
            >
              <td className="py-2 pr-2 text-xs">{doc.document_type}</td>
              <td className="py-2 pr-2 font-mono text-xs">{doc.number}</td>
              <td className="py-2 pr-2 max-w-xs truncate">{doc.title || '—'}</td>
              <td className="py-2 pr-2 text-xs">{String(doc.turnover_marker)}</td>
              <td className="py-2">
                {doc.pdf_url ? (
                  <a href={doc.pdf_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-xs" onClick={(e) => e.stopPropagation()}>PDF</a>
                ) : <span className="text-xs text-slate-300">none</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/pages/admin/openlgu/components/MissingDatesTab.tsx src/pages/admin/openlgu/components/MissingTitlesTab.tsx src/pages/admin/openlgu/components/TurnoverMarkersTab.tsx
git commit -m "feat(workbench): add tab list components"
```

---

### Task 10: DocumentReviewPanel (side panel)

**Files:**
- Create: `src/pages/admin/openlgu/components/DocumentReviewPanel.tsx`
- Create: `src/pages/admin/openlgu/components/SourceEvidencePanel.tsx`
- Create: `src/pages/admin/openlgu/components/ReviewForm.tsx`
- Create: `src/pages/admin/openlgu/components/ReviewHistory.tsx`

- [ ] **Step 1: Write SourceEvidencePanel**

```tsx
// src/pages/admin/openlgu/components/SourceEvidencePanel.tsx

interface Props {
  sourcePayload: Record<string, string> | null;
  pdfUrl: string | null;
  pdfReachability: string | null;
  pdfMirrorPath: string | null;
}

export function SourceEvidencePanel({ sourcePayload, pdfUrl, pdfReachability, pdfMirrorPath }: Props) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700">Source Evidence</h3>

      {pdfUrl && (
        <div>
          <span className="text-xs text-slate-500">Official PDF</span>
          <div className="flex items-center gap-2 mt-0.5">
            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:underline truncate max-w-[250px]"
            >
              {pdfUrl.replace(/^https?:\/\/[^/]+/, '')}
            </a>
            {pdfReachability && (
              <span className={`text-xs px-1 rounded ${
                pdfReachability === 'reachable' ? 'bg-green-100 text-green-700' :
                pdfReachability === 'dead' ? 'bg-red-100 text-red-700' :
                'bg-slate-100 text-slate-600'
              }`}>
                {pdfReachability}
              </span>
            )}
          </div>
        </div>
      )}

      {pdfMirrorPath && (
        <div>
          <span className="text-xs text-slate-500">Local Mirror</span>
          <div className="text-xs text-slate-600 mt-0.5 font-mono">{pdfMirrorPath}</div>
        </div>
      )}

      {!pdfUrl && !pdfMirrorPath && (
        <div className="text-xs text-slate-400 italic">No PDF link available</div>
      )}

      {sourcePayload && (
        <div>
          <span className="text-xs text-slate-500">Raw Source Data</span>
          <pre className="mt-1 text-xs bg-slate-50 rounded p-2 overflow-auto max-h-48">
            {JSON.stringify(sourcePayload, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Write ReviewForm**

```tsx
// src/pages/admin/openlgu/components/ReviewForm.tsx
import { useState } from 'react';
import { workbenchApi, type Term } from '@/lib/workbench-api';

interface Props {
  sourceRecordId: string;
  docType: string; // 'missing_dates' | 'missing_titles' | 'turnover_markers'
  terms: Term[];
  onSaved: () => void;
}

const EVIDENCE_KINDS = [
  'pdf_text',
  'website_table_row',
  'facebook_post',
  'filename_inference',
  'manual_inspection',
  'manual_entry',
];

export function ReviewForm({ sourceRecordId, docType, terms, onSaved }: Props) {
  const [value, setValue] = useState('');
  const [evidenceKind, setEvidenceKind] = useState('manual_inspection');
  const [evidenceNote, setEvidenceNote] = useState('');
  const [inferredTerm, setInferredTerm] = useState<string | null>(null);
  const [termOverride, setTermOverride] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDateChange = (date: string) => {
    setValue(date);
    // Preview term inference
    if (date && terms.length > 0) {
      const d = new Date(date);
      const match = terms.find(t => d >= new Date(t.start_date) && d <= new Date(t.end_date));
      setInferredTerm(match?.term_id || null);
    } else {
      setInferredTerm(null);
    }
  };

  const handleSubmit = async (decisionType: string) => {
    setSaving(true);
    setError(null);
    try {
      await workbenchApi.createDecision({
        source_record_id: sourceRecordId,
        decision_type: decisionType,
        field: docType === 'missing_dates' ? 'date_enacted' : docType === 'missing_titles' ? 'title' : 'turnover_marker',
        value: decisionType === 'set_field' ? value : null,
        term_override_id: termOverride || null,
        term_override_reason: termOverride ? 'manual_override' : null,
        evidence: [{ kind: evidenceKind, note: evidenceNote }],
      });
      setValue('');
      setEvidenceNote('');
      setTermOverride('');
      setInferredTerm(null);
      onSaved();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-slate-700">Review</h3>

      {error && <div className="text-xs text-red-600">{error}</div>}

      {docType === 'missing_dates' && (
        <>
          <div>
            <label className="text-xs text-slate-500">Date Enacted</label>
            <input
              type="date"
              value={value}
              onChange={(e) => handleDateChange(e.target.value)}
              className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm"
            />
          </div>
          {inferredTerm && (
            <div className="text-xs text-green-700">
              Inferred term: <strong>{inferredTerm}</strong>
              <select
                value={termOverride}
                onChange={(e) => setTermOverride(e.target.value)}
                className="ml-2 text-xs border rounded px-1 py-0.5"
              >
                <option value="">Auto (correct)</option>
                {terms.map(t => <option key={t.term_id} value={t.term_id}>{t.term_id} ({t.label})</option>)}
              </select>
            </div>
          )}
        </>
      )}

      {docType === 'missing_titles' && (
        <div>
          <label className="text-xs text-slate-500">Title</label>
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className="mt-0.5 block w-full rounded border border-slate-300 px-2 py-1 text-sm"
            placeholder="Enter document title"
          />
        </div>
      )}

      <div>
        <label className="text-xs text-slate-500">Evidence</label>
        <div className="flex gap-2 mt-0.5">
          <select
            value={evidenceKind}
            onChange={(e) => setEvidenceKind(e.target.value)}
            className="rounded border border-slate-300 px-2 py-1 text-xs"
          >
            {EVIDENCE_KINDS.map(k => <option key={k} value={k}>{k.replace(/_/g, ' ')}</option>)}
          </select>
          <input
            type="text"
            value={evidenceNote}
            onChange={(e) => setEvidenceNote(e.target.value)}
            className="flex-1 rounded border border-slate-300 px-2 py-1 text-xs"
            placeholder="Note (optional)"
          />
        </div>
      </div>

      <div className="flex gap-2 pt-2">
        <button
          onClick={() => handleSubmit('set_field')}
          disabled={saving || !value}
          className="rounded bg-blue-600 px-3 py-1 text-xs text-white disabled:opacity-40"
        >
          Save
        </button>
        <button
          onClick={() => handleSubmit('cannot_determine')}
          disabled={saving}
          className="rounded bg-yellow-500 px-3 py-1 text-xs text-white disabled:opacity-40"
        >
          Cannot Determine
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Write ReviewHistory**

```tsx
// src/pages/admin/openlgu/components/ReviewHistory.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type ReviewDecision } from '@/lib/workbench-api';

interface Props {
  sourceRecordId: string;
}

export function ReviewHistory({ sourceRecordId }: Props) {
  const [decisions, setDecisions] = useState<ReviewDecision[]>([]);

  useEffect(() => {
    workbenchApi.decisions(sourceRecordId).then(res => setDecisions(res.decisions)).catch(() => {});
  }, [sourceRecordId]);

  if (decisions.length === 0) return null;

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-slate-700">History</h3>
      {decisions.map((d) => (
        <div key={d.id} className="text-xs border-l-2 border-slate-200 pl-2 py-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{d.decision_type}</span>
            {d.field && <span className="text-slate-500">{d.field}</span>}
            {d.value && <span className="text-slate-700">{d.value}</span>}
            {d.derived?.term_id && <span className="text-green-700">→ {d.derived.term_id}</span>}
          </div>
          <div className="text-slate-400 mt-0.5">
            {new Date(d.created_at).toLocaleString()}
            {d.evidence?.[0]?.note && ` — ${d.evidence[0].note}`}
          </div>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 4: Write DocumentReviewPanel (composes the above)**

```tsx
// src/pages/admin/openlgu/components/DocumentReviewPanel.tsx
import { useEffect, useState } from 'react';
import { workbenchApi, type StagedDocument, type Term } from '@/lib/workbench-api';
import { SourceEvidencePanel } from './SourceEvidencePanel';
import { ReviewForm } from './ReviewForm';
import { ReviewHistory } from './ReviewHistory';

interface Props {
  sourceRecordId: string;
  onDecisionSaved: () => void;
  onClose: () => void;
}

export function DocumentReviewPanel({ sourceRecordId, onDecisionSaved, onClose }: Props) {
  const [doc, setDoc] = useState<ReturnType<typeof workbenchApi.stagedDocument> extends Promise<infer T> ? T : never>(null as any);
  const [terms, setTerms] = useState<Term[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      workbenchApi.stagedDocument(sourceRecordId),
      workbenchApi.terms(),
    ]).then(([docData, termsData]) => {
      setDoc(docData);
      setTerms(termsData);
    }).finally(() => setLoading(false));
  }, [sourceRecordId]);

  if (loading) return <div className="p-4 text-sm text-slate-400">Loading...</div>;
  if (!doc) return <div className="p-4 text-sm text-red-600">Document not found</div>;

  const docTab = !doc.date_enacted ? 'missing_dates'
    : !doc.title ? 'missing_titles'
    : doc.turnover_marker ? 'turnover_markers'
    : 'missing_dates';

  return (
    <div className="border rounded-lg p-4 space-y-4 max-h-[80vh] overflow-auto sticky top-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs text-slate-500">{doc.document_type} {doc.number}</div>
          <div className="font-medium text-sm truncate">{doc.title || <em className="text-slate-400">no title</em>}</div>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-lg">&times;</button>
      </div>

      <div className="border-t pt-3">
        <SourceEvidencePanel
          sourcePayload={doc.source_payload}
          pdfUrl={doc.pdf_url}
          pdfReachability={doc.pdf_reachability}
          pdfMirrorPath={doc.pdf_mirror_path}
        />
      </div>

      <div className="border-t pt-3">
        <ReviewForm
          sourceRecordId={sourceRecordId}
          docType={docTab}
          terms={terms}
          onSaved={onDecisionSaved}
        />
      </div>

      <div className="border-t pt-3">
        <ReviewHistory sourceRecordId={sourceRecordId} />
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/pages/admin/openlgu/components/DocumentReviewPanel.tsx src/pages/admin/openlgu/components/SourceEvidencePanel.tsx src/pages/admin/openlgu/components/ReviewForm.tsx src/pages/admin/openlgu/components/ReviewHistory.tsx
git commit -m "feat(workbench): add review panel, evidence, form, and history components"
```

---

### Task 11: Route integration + build verification

**Files:**
- Modify: `src/App.tsx`

- [ ] **Step 1: Add DEV-guarded lazy route to App.tsx**

Find the admin lazy imports block (near other `const Admin...` declarations) and add:

```tsx
const OpenLguWorkbenchPage = import.meta.env.DEV
  ? lazy(() => import('@/pages/admin/openlgu/WorkbenchPage'))
  : () => <div className="p-6 text-slate-500">Not available in production</div>;
```

Find the admin routes block and add inside the `<Route path='admin' element={<AdminLayout />}>` parent:

```tsx
<Route path='openlgu/workbench' element={<OpenLguWorkbenchPage />} />
```

- [ ] **Step 2: Run build**

```bash
npm run build
```

Expected: build passes with no errors.

- [ ] **Step 3: Verify DEV exclusion**

Check that the workbench route is only present in dev build:

```bash
grep -c "openlgu/workbench" dist/assets/*.js || echo "not found in production build — correct"
```

Expected: "not found in production build — correct"

- [ ] **Step 4: Commit**

```bash
git add src/App.tsx
git commit -m "feat(workbench): add DEV-guarded route for Local Review Workbench"
```

---

### Task 12: Integration smoke test

- [ ] **Step 1: Start review server**

```bash
npm run openlgu:review-server &
```

- [ ] **Step 2: Start Vite dev server**

```bash
npm run dev &
```

- [ ] **Step 3: Verify no D1 writes**

```bash
grep -r "D1\|\.d1\|executeBatch\|prepare(" scripts/openlgu/workbench/ scripts/openlgu/review-workbench-server.mjs && echo "FAIL: D1 reference found" || echo "OK: no D1 writes"
```

Expected: "OK: no D1 writes"

- [ ] **Step 4: Verify in browser**

Open http://localhost:5173/admin/openlgu/workbench

Expected:
- ArtifactStatusBanner shows staged doc count, decision count, terms count
- MissingDatesTab is active by default, shows list of items needing dates
- Clicking a row opens DocumentReviewPanel side panel
- Panel shows source evidence, PDF link, review form
- Entering a date shows inferred term
- Saving a decision appends to review-decisions.jsonl
- Item leaves active list after decision

- [ ] **Step 4: Kill background processes**

```bash
kill %1 %2 2>/dev/null; true
```

- [ ] **Step 5: Final commit (if any fixes needed)**

```bash
git add -A
git commit -m "fix(workbench): integration fixes from smoke test"
```
