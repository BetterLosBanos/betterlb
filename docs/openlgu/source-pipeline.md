# OpenLGU Legislative Source Pipeline

This is the v2 pipeline lane for OpenLGU legislative records.

The old numbered Python scripts remain available as legacy tooling, but this lane uses explicit artifact names so it is clear whether a file is source evidence, staging output, reconciliation evidence, or a canonical promotion artifact.

## Artifact Names

- `source-records.jsonl`: raw observations from an upstream or transitional source
- `staged-documents.jsonl`: normalized document candidates that are not canonical yet
- `staged-person-refs.jsonl`: raw author, mover, and seconder names awaiting person matching
- `reconciliation-shadow.json`: machine-readable report from a shadow reconciliation run
- `reconciliation-shadow.md`: human-readable shadow reconciliation summary

These files are local pipeline artifacts. They do not update canonical D1 records.

## Website Source Identity

Website table rows use the PDF URL string as the primary source row identity when present, even if the linked PDF is dead.

Use separate website scrape sources per LGU page:

- `losbanos_website_resolutions`
- `losbanos_website_ordinances`
- `losbanos_website_executive_orders`

Each page has a distinct table shape and should have independent source health, run counts, and missing-from-source thresholds.

A single cron trigger may start the whole website sync batch, but each active source gets its own `scrape_runs` row:

```text
cron trigger
  -> losbanos_website_resolutions scrape_run
  -> losbanos_website_ordinances scrape_run
  -> losbanos_website_executive_orders scrape_run
```

This keeps failures, row counts, source health, and missing thresholds independent per page.

## Website Collector Implementation

The website collector is a single script (`scripts/openlgu/collect-website-source-records.cjs`) that handles all three LGU website sources. It uses `cheerio` for HTML parsing — the only new dependency beyond Node.js built-ins (`node:fs`, `node:path`, `node:crypto`, built-in `fetch`).

### Source Config Table

Each source is defined by a config entry with column mappings:

```js
{
  key: 'resolutions',
  label: 'Resolutions',
  url: 'https://losbanos.gov.ph/municipal_resolutions',
  table_selector: 'table#table1',
  fallback_selectors: ['table#dataTable', 'table.dataTable'],
  expected_columns: 4,
  column_mappings: [
    { header_pattern: /^id$/i, field: 'number' },
    { header_pattern: /title|number/i, field: 'combined_title_number' },
    { header_pattern: /description/i, field: 'description' },
    { header_pattern: /action/i, field: 'pdf_url', is_link: true },
  ],
  document_type: 'resolution',
}
```

Column mappings use regex `header_pattern` for fuzzy header matching. `is_link: true` extracts the `href` from `<a>` tags instead of text content. `combined_title_number` signals that staging must split number from title.

Confirmed column shapes from live data:

| Source | Columns |
|---|---|
| Resolutions | ID, Title/Number, Description, Action (PDF link) |
| Ordinances | Ordinance No., Date Enacted, Committees, Title, Author, Action |
| Executive Orders | Title/EO Number, Description, Created At, Action |

### Table Location

Use header text matching to locate columns — match `<th>` text against `header_pattern` regex. Do not rely on column index position, because upstream column order may change.

### DataTables Pagination

Assume client-side rendering. Live data shows 2385+ rows served in a single HTML response for ordinances, confirming all rows are in the initial page load.

Detection check: if parsed row count is 0 but `table#table1` exists in HTML, the page may be using server-side rendering. Fail explicitly with a table-shape error rather than silently returning empty output.

### Dedup During Collection

Live data shows duplicate rows in the ordinances page (same ordinance appearing twice with slightly different formatting). Dedup during collection using PDF URL as primary key:

- Group rows by normalized PDF URL
- When duplicates exist, keep the row with more populated fields
- Rows with no PDF URL are kept as-is (no metadata dedup fallback at collection time)

### Ordinance Row Variants

Live data shows two populations in ordinances:
- Old rows: ALL CAPS titles, "N/A" committees/author, terse dates
- New rows: properly cased, real committee/author data, full dates

No special handling at collection time. Collection preserves raw values. Staging handles normalization (case, author parsing, etc.). Old rows with "N/A" author/committee will naturally receive lower confidence scores in staging.

### HTTP Error Handling

- Retry: up to 3 attempts per source, exponential backoff (1s, 2s, 4s)
- 429 responses: respect `Retry-After` header if present, otherwise backoff as above
- Per-source independence: one source failing does not block others
- 2-second delay between source fetches to avoid rate limiting
- 30-second timeout per HTTP request
- Non-retryable: table shape failures (missing table, wrong column count) — these are parse errors, log and fail the source run without retrying

### Source Record Schema

The collector emits one JSONL record per source row:

```json
{
  "id": "src_<source_key>_<sha256(content_hash)>",
  "source_kind": "website_table_row",
  "source_key": "resolutions",
  "source_url": "https://losbanos.gov.ph/municipal_resolutions",
  "content_hash": "sha256:abcdef...",
  "collector_version": "losbanos-website-collector-v1",
  "raw_payload_json": {
    "number": "Resolution No. 2022-001",
    "title": "...",
    "date_enacted": "",
    "pdf_url": "https://...",
    "raw_author_text": "",
    "description": "..."
  },
  "pdf_url": "https://...",
  "pdf_reachability": "reachable|dead|redirect|error|null",
  "pdf_redirect_url": null,
  "pdf_checked_at": "2025-05-23T12:00:00Z",
  "run_id": "run_resolutions_20250523T120000Z",
  "first_seen_at": "2025-05-23T12:00:00Z",
  "last_seen_at": "2025-05-23T12:00:00Z"
}
```

IDs are deterministic: same content hash produces same ID. Changed content produces a new ID. `pdf_url` is duplicated at top level for dedup and identity lookups without parsing payload. `raw_payload_json` holds source-specific fields (different shapes per source kind).

`pdf_reachability` is NOT part of `content_hash` — it changes independently of source content. A URL going dead should not create a new source record version.

### Content Hash Computation

Hash input is a JSON-serialized object with alphabetically sorted keys:

```js
function computeContentHash(sourceKind, sourceUrl, rawPayload) {
  const input = {
    source_kind: sourceKind,
    source_url: sourceUrl,
    ...rawPayload,
  };
  const serialized = JSON.stringify(input, Object.keys(input).sort());
  return `sha256:${crypto.createHash('sha256').update(serialized).digest('hex')}`;
}
```

Normalization before hashing:
- PDF URL: lowercase, strip trailing slashes, strip fragments (`#page=1`)
- Whitespace: collapse multiple spaces to single, trim
- Empty strings: keep as empty strings (missing field is meaningful)

### Run Manifest Schema

```json
{
  "source_key": "resolutions",
  "status": "success|failed",
  "started_at": "ISO-8601",
  "finished_at": "ISO-8601",
  "duration_ms": 1234,
  "attempts": 2,
  "source_url": "https://losbanos.gov.ph/municipal_resolutions",
  "collector_version": "losbanos-website-collector-v1",
  "counts": {
    "rows_found": 2385,
    "rows_parsed": 2380,
    "rows_deduplicated": 12,
    "source_records_emitted": 2368,
    "rows_skipped": 0
  },
  "table_shape": {
    "selector": "table#table1",
    "columns_matched": ["ID", "Title/Number", "Description", "Action"],
    "expected_columns": 4,
    "actual_columns": 4
  },
  "errors": []
}
```

Failed runs replace `counts` with `error`:

```json
{
  "source_key": "resolutions",
  "status": "failed",
  "error": {
    "type": "http_error|table_shape_failure|parse_error",
    "message": "HTTP 429 after 3 attempts",
    "http_status": 429
  }
}
```

### PDF Link Checking

After parsing all rows, the collector performs a deduplicated HEAD request check for each unique PDF URL:

1. Collect all unique PDF URLs across all parsed rows
2. HEAD request each URL with 2-second delay between requests
3. Record reachability status per URL

This is necessary because PDF URLs are needed for the future mirror pipeline. Dead URLs must be known early. The 2-second batching avoids rate-limiting. For ~800-1000 unique URLs, this adds ~15-30 minutes per run — acceptable for local v1.

### Collection is Stateless

Collection does not load previous `source-records.jsonl`. It always emits what it observes now. Diffing is a separate step that compares `latest/` against new `runs/<timestamp>/` outputs.

### Combined Output

After all sources complete, the collector concatenates all per-source `latest/source-records.jsonl` files into a combined `pipeline/openlgu/source-records.jsonl`. Failed sources (no `latest/`) are skipped. This keeps `stage-documents.cjs` reading a single input file.

### CLI Interface

```bash
# Fetch all sources
npm run openlgu:collect-website

# Single source only
node scripts/openlgu/collect-website-source-records.cjs --source resolutions

# Custom output root (default: pipeline/openlgu/sources)
node scripts/openlgu/collect-website-source-records.cjs --output-root pipeline/openlgu/sources

# Use saved HTML fixtures instead of live fetch
node scripts/openlgu/collect-website-source-records.cjs --html-dir pipeline/openlgu/fixtures/html

# Save live HTML alongside source records
node scripts/openlgu/collect-website-source-records.cjs --save-html-dir pipeline/openlgu/fixtures/html
```

Fixture filenames match source keys:
- `pipeline/openlgu/fixtures/html/resolutions.html`
- `pipeline/openlgu/fixtures/html/ordinances.html`
- `pipeline/openlgu/fixtures/html/executive_orders.html`

No network requests when `--html-dir` is provided.

## Source Diff Step

Diffing is a separate script (`scripts/openlgu/diff-source-records.cjs`) that compares previous `latest/` with new `runs/<timestamp>/` for each source.

```bash
node scripts/openlgu/diff-source-records.cjs --source resolutions
node scripts/openlgu/diff-source-records.cjs  # all sources
```

Diff logic per source:

1. Load `latest/source-records.jsonl` (previous) — if missing, all records are `new`
2. Load `runs/<latest_timestamp>/source-records.jsonl` (current)
3. Match records by content hash (deterministic ID)
4. Classify each record

Output per source:

```text
pipeline/openlgu/sources/<key>/diffs/<timestamp>/source-diff.json
pipeline/openlgu/sources/<key>/diffs/<timestamp>/source-diff.md
```

Diff record shape:

```json
{
  "source_record_id": "src_res_abc123",
  "change_type": "new|changed|unchanged|missing",
  "decision": "stage_new|stage_for_reconciliation|skip|candidate_missing_from_source",
  "reason": "new_record|content_hash_changed|unchanged|disappeared_from_source",
  "previous_hash": null,
  "current_hash": "sha256:..."
}
```

Missing records do not auto-promote to `missing_from_source` — that requires confirmed missing source (multiple successful scrapes per the Missing From Source Threshold policy). Diff just flags them as `candidate_missing_from_source`.

## Successful Scrape Criteria

A scrape counts toward missing-from-source thresholds only if it is a successful scrape.

Required:

- HTTP fetch succeeds
- expected table is found
- parsed row count is above the source-specific minimum
- layout/schema validation passes

Does not count:

- HTTP failure
- timeout
- zero-row result
- expected table missing
- unexpected column count
- parser exception
- suspicious row-count drop below threshold

Initial minimum row thresholds:

| Source | Minimum rows |
|---|---:|
| `losbanos_website_resolutions` | 1000 |
| `losbanos_website_ordinances` | 500 |
| `losbanos_website_executive_orders` | 50 |

## Table Shape and Row Validation

Invalid source table shape fails the source run. Row-level issues produce partial output.

```text
expected table missing:
  source run = failed
  emit no source_records for that source
  write scrape alert / validation result

unexpected column count:
  source run = failed
  emit no source_records for that source
  write scrape alert / validation result

some malformed rows but table shape valid:
  source run = partial
  emit valid source_records
  write validation results for bad rows
```

Invalid table shape must not create changed or missing records.

## Review Queue Policy

Review queue items are actionable decisions, not raw scrape events.

```text
new or changed source:
  create source_record and staged_document

tracked field conflict:
  create data conflict or validation result

review queue:
  create only when the issue is actionable and unresolved
```

Create review queue items for:

- unresolved collisions
- tracked field conflicts needing a decision
- confirmed `missing_from_source` candidates
- relevant unresolved author references above the review threshold

Do not create review queue items for every changed row.

Unresolved mover and seconder references remain staged evidence in v1. They do not create review queue items by default.

## Person Matching

Person matching happens after staging, not during source collection.

```text
collect-website-source-records:
  preserve raw author text

stage-documents:
  create staged_person_refs(role='author')

match-staged-person-refs:
  use persons, memberships, and term_id
  assign candidate_person_id and confidence
  mark matched, ambiguous, unresolved, or ignored
```

Re-running person matching should not require re-scraping the website.

```text
website:{document_type}:pdf_url:{hash(normalized_pdf_url)}
```

When a website row has no PDF URL, identity falls back to document metadata:

```text
website:{document_type}:metadata:{term_id}:{normalized_number}:{date_enacted}:{title_hash}
```

PDF reachability is tracked separately from source row identity:

- `unchecked`
- `reachable`
- `dead`
- `redirected`
- `missing`

If the website keeps the same dead PDF URL, that is the same source row with a dead link. If the website later changes the PDF URL, that is a changed source record.

## PDF Mirrors

Official LGU PDF URLs remain the canonical source link. BetterLB may store archived PDF mirrors separately, usually in R2, so review and OCR can continue when official links rot.

Recommended fields:

- `pdf_url`: official LGU URL
- `pdf_url_status`: `unchecked`, `reachable`, `dead`, `redirected`, or `missing`
- `mirror_pdf_uri`: BetterLB-controlled archived copy
- `mirror_status`: `archived`, `missing`, or `failed`

Scheduled scrapes should not block on mirroring every PDF. Scrapes detect source row changes; a separate archive job downloads or refreshes mirrors.

Initial public display should use official LGU PDF URLs only. PDF mirrors are internal preservation/review/OCR evidence at first. The data model should still keep enough mirror metadata to support a future public "Archived copy" fallback when official links are dead.

## Snapshot Retention

Raw website snapshots are useful for parser replay, audit evidence, source disappearance, and debugging upstream layout changes. They should not be stored for every routine unchanged scrape.

Store compact metadata for every scrape:

- source ID
- run ID
- page hash
- byte size
- row count
- status

Store raw snapshots only for:

- parser errors
- zero-row scrapes
- upstream layout changes
- new source rows
- changed source rows
- missing-from-source events
- explicit debug runs

Unchanged routine scrapes should update run/page metadata without adding redundant raw HTML snapshots.

## Source Record Versioning

Source records are versioned only when upstream content changes.

```text
unchanged row:
  update freshness metadata only

changed row:
  mark previous source record version as not current
  insert new source record with same source_record_id and new content_hash
  create staged document for the new version

missing row:
  mark latest source record as missing from source candidate
```

The schema supports this with:

```sql
UNIQUE(source_id, source_record_id, content_hash)
```

Do not create a new source record version for every unchanged scrape.

## Collection vs Staging

Collection preserves source evidence. Staging interprets it.

```text
collect-source-records:
  preserve raw table values
  compute source_record_id
  compute content_hash from canonicalized raw payload
  avoid title-casing, author cleanup, and canonical field inference

stage-documents:
  normalize number
  extract turnover marker
  parse date
  infer term_id from date
  clean candidate title
  split author/person refs
  produce matching_key
```

Minimal collection-time canonicalization is allowed for identity and hash stability:

- trim leading/trailing whitespace
- normalize absolute URLs
- decode HTML entities
- preserve original raw table-cell values when possible

## Content Hash Boundary

`content_hash` detects meaningful upstream row changes. It should include source row content, not scrape/run state.

Include:

- `source_kind`
- `document_type`
- source page URL
- raw table cell values
- normalized absolute PDF URL string

Exclude:

- `scrape_run_id`
- `captured_at`
- source row index
- fetch duration
- HTTP status
- parser version
- `pdf_url_status`
- `mirror_status`

This prevents routine scrape metadata, row reordering, dead-link checks, or mirror work from creating false changed-source versions.

## Row Index Policy

Source table row position is debug-report only.

```text
source_row_index:
  may appear in local debug reports
  may appear in raw snapshot inspection output
  is not stored as durable D1 state
  is not part of source_record_id
  is not part of content_hash
  is not matching evidence
  is not shown in public UI
```

End users do not need to know what upstream table row a record came from.

## Missing From Source Threshold

A source row disappearing from one scrape is not enough to change canonical publication status.

Policy:

```text
first missing successful scrape:
  record absence
  create warning or validation result
  do not change canonical publication_status

third consecutive successful scrape where the row is missing:
  create staged publication-status candidate:
  publication_status = missing_from_source

promotion:
  update canonical publication_status only after manual confirmation
  or high-confidence promotion rules
```

Failed scrapes and zero-row anomaly runs do not count toward the missing threshold.

## Changed Row Promotion Rules

Changed website rows do not blindly overwrite populated tracked canonical fields.

Tracked fields:

- `title`
- `date_enacted`
- `pdf_url`
- `session_id`
- `author_ids`
- `publication_status`

Policy:

```text
changed source row:
  create new source_record version
  create staged_document
  compare against canonical tracked fields
  if populated tracked field differs:
    create data conflict or review item
  do not overwrite automatically

exception:
  if canonical tracked field is empty and source confidence is high:
    allow auto-fill through promotion
```

Source freshness metadata, PDF reachability, and mirror status may update routinely because they do not replace canonical document facts.

## Transitional Input

`pipeline/data/documents.csv` was the `legacy_manual_documents_csv` staging input from the original pipeline. It is now deprecated. The website collector is the primary source path. The legacy CSV script (`collect-source-records.cjs`) remains in the repo for reference but is removed from the pipeline chain.

## Commands

From the repo root:

```bash
# Website collection (all sources)
npm run openlgu:collect-website

# Source diffing
npm run openlgu:diff-source-records

# Staging and reconciliation
npm run openlgu:stage-documents
npm run openlgu:reconcile:shadow
```

Full local shadow lane:

```bash
npm run openlgu:pipeline:shadow
```

The legacy `openlgu:collect-source-records` command (CSV-based) is deprecated. The website collector is now the primary source path.

The local website collector should write one source-record file per website source:

```text
pipeline/openlgu/sources/losbanos_website_resolutions/source-records.jsonl
pipeline/openlgu/sources/losbanos_website_ordinances/source-records.jsonl
pipeline/openlgu/sources/losbanos_website_executive_orders/source-records.jsonl
```

This mirrors future D1 source/run boundaries and allows source-specific debugging.

Each local website source run should also write a per-source run manifest and validation output, even when no source records are emitted:

```text
pipeline/openlgu/sources/losbanos_website_resolutions/run.json
pipeline/openlgu/sources/losbanos_website_resolutions/validation-results.jsonl
pipeline/openlgu/sources/losbanos_website_ordinances/run.json
pipeline/openlgu/sources/losbanos_website_ordinances/validation-results.jsonl
pipeline/openlgu/sources/losbanos_website_executive_orders/run.json
pipeline/openlgu/sources/losbanos_website_executive_orders/validation-results.jsonl
```

`run.json` should record:

- source key and source URL
- started/completed timestamps
- live or fixture input mode
- fetch status
- parser status
- table-shape status
- parsed row count
- expected minimum row count
- whether the run is a successful scrape
- whether the run may count toward missing-from-source thresholds
- error summary, if any

This avoids ambiguity between "collector did not run" and "collector ran but the source failed validation."

A failed local website run should not overwrite or delete the last successful `source-records.jsonl` for that source. Failed runs write diagnostics only:

```text
run.json
validation-results.jsonl
```

The diff step should compare only source-record files from successful scrapes. A failed run is diagnostic evidence, not new source truth.

Successful local website runs should keep both a per-source `latest/` view and a bounded run history:

```text
pipeline/openlgu/sources/losbanos_website_resolutions/latest/source-records.jsonl
pipeline/openlgu/sources/losbanos_website_resolutions/latest/run.json
pipeline/openlgu/sources/losbanos_website_resolutions/runs/2026-05-23T10-30-00/source-records.jsonl
pipeline/openlgu/sources/losbanos_website_resolutions/runs/2026-05-23T10-30-00/run.json
pipeline/openlgu/sources/losbanos_website_resolutions/runs/2026-05-23T10-30-00/validation-results.jsonl
```

`latest/` is the default input for staging and diffing. `runs/` preserves replay/debug history. Local tooling may prune old successful run folders later, keeping a small bounded history such as the last 5 to 10 successful runs per source.

`latest/` should contain copied files, not symlinks or pointer files:

```text
latest/source-records.jsonl
latest/run.json
runs/<timestamp>/source-records.jsonl
runs/<timestamp>/run.json
```

The small local duplication is preferable to symlink portability issues and pointer-file indirection.

Failed runs should also keep lightweight diagnostics without modifying `latest/`:

```text
pipeline/openlgu/sources/losbanos_website_resolutions/last-failed-run.json
pipeline/openlgu/sources/losbanos_website_resolutions/runs/2026-05-23T10-35-00/run.json
pipeline/openlgu/sources/losbanos_website_resolutions/runs/2026-05-23T10-35-00/validation-results.jsonl
```

Failed run folders should not contain `source-records.jsonl`. Local tooling may prune failed run folders more aggressively, keeping a small bounded history such as the last 3 to 5 failed runs per source.

The local website collector should support both live fetches and saved HTML fixtures:

```bash
npm run openlgu:collect-website-source-records
npm run openlgu:collect-website-source-records -- --save-html-dir pipeline/openlgu/fixtures/html
npm run openlgu:collect-website-source-records -- --html-dir pipeline/openlgu/fixtures/html
```

Live fetch is the default path. Saved fixtures let parser changes be replayed without depending on losbanos.gov.ph availability or changing upstream content.

Fixture filenames should be source-specific:

```text
pipeline/openlgu/fixtures/html/losbanos_website_resolutions.html
pipeline/openlgu/fixtures/html/losbanos_website_ordinances.html
pipeline/openlgu/fixtures/html/losbanos_website_executive_orders.html
```

## Flow

```text
losbanos.gov.ph website tables
  -> collect-website-source-records (per-source JSONL)
  -> combined source-records.jsonl
  -> diff-source-records (change detection)
  -> stage-documents (normalized candidates)
  -> reconcile-shadow (collision analysis, gaps, report)
```

The promotion step is intentionally absent for now. Promotion should be added only after initial reconciliation rules are good enough to protect manually checked production records.

The legacy CSV collector is deprecated. The website collector is the only source path.

## Routine Sync Rollout

Routine website sync should be built local-first before scheduled D1 writes.

```text
Phase A:
  local collect-website-source-records
  local diff-source-records
  local reconciliation report

Phase B:
  D1 staging import
  source_records/staged_documents/page_fetches/scrape_alerts

Phase C:
  Cloudflare Cron Worker
  routine scrape writes compact D1 state

Phase D:
  archive Worker
  PDF mirror downloads to R2
```

The local phase validates row identity, changed-row diffing, missing thresholds, and source anomalies against the real LGU site before scheduled Workers write D1 state.

## Actionable Outputs

Local diffing should produce two separate outputs:

1. Source diff: previous successful source records vs new successful source records.
2. Reconciliation report: staged records vs production D1 canonical records.

These outputs must be actionable. Do not generate reports whose only purpose is to summarize activity.

Every row or section should map to one of these decisions:

- no action
- auto-promote candidate
- create review item
- investigate parser/source anomaly
- confirm missing-from-source candidate
- protect existing canonical value from overwrite
- attach provenance without changing canonical value

Reports may include summary counts, but summary counts are secondary. The primary output is a bounded list of records that need a pipeline decision or human action.

## Local Review Workbench

A local development-only workbench for reviewing staged legislative documents. Separate from the production review queue. Does not mutate canonical D1 records in v1.

### Architecture

The workbench is a Hono HTTP server embedded inside the existing Vite app:

- **UI route**: `/admin/openlgu/workbench` — lives alongside other admin routes in the Vite app, no `import.meta.env.DEV` guard
- **Local server**: `scripts/openlgu/review-workbench-server.mjs` — Hono framework, ESM
- **Package script**: `openlgu:review-server`
- **Gate**: server not running = network errors, same as Wrangler-down state

Server binds to `127.0.0.1` only (never `0.0.0.0`). Default port `8789` (avoids Vite `5173`, Wrangler `8787`/`8788`). Configurable via env:

```text
OPENLGU_REVIEW_PORT=8789
VITE_OPENLGU_REVIEW_API=http://localhost:8789
```

CORS allows `localhost:5173` and `127.0.0.1:5173` only. The Vite page reads `VITE_OPENLGU_REVIEW_API` and shows a clear "review server unavailable" state when unset or unreachable.

### Artifacts Read

- `pipeline/openlgu/staged-documents.jsonl` — staged document candidates
- `pipeline/openlgu/staged-person-refs.jsonl` — unresolved person references
- `pipeline/openlgu/reconciliation-shadow.json` — shadow reconciliation report
- `pipeline/openlgu/sources/*/latest/run.json` — source run manifests
- `pipeline/openlgu/sources/*/latest/source-records.jsonl` — raw source payloads for evidence display
- `pipeline/openlgu/terms.json` — local term snapshot for inference

### Artifact Written

- `pipeline/openlgu/review-decisions.jsonl` — append-only review decisions

Atomic append: write with append flags, newline discipline, single-writer assumption.

### Server Architecture

Load all JSONL artifacts into immutable memory snapshots at startup. On file change or reload, parse into a new snapshot first, then atomically swap. If parse fails, keep the previous snapshot and expose the error via `/health`.

File watching triggers reload as convenience. Also expose `POST /api/workbench/reload` for manual reload.

Read order matters: load staged artifacts first, then source records, then review decisions, then project current review state.

Deterministic sort for pagination: `document_type, normalized_number, id` — prevents page content jumps between reloads.

### Review Decision Schema

Append-only, discriminated by `decision_type`. One decision per source record per field. `value` is typed by `decision_type`, not loosely polymorphic. IDs use UUIDv7 for timestamp-sortable history.

```json
{
  "schema_version": "review-decision-v1",
  "id": "rvd_<uuidv7>",
  "source_record_id": "src_res_abc123",
  "staged_document_id": "std_res_def456",
  "source_content_hash": "sha256:...",
  "decision_type": "set_field | cannot_determine | confirm_turnover | ignore",
  "field": "date_enacted | title | term_id",
  "value": "2023-07-15",
  "derived": {
    "term_id": "sb_11",
    "term_inference": "auto | manual | unmatched"
  },
  "term_override_id": null,
  "term_override_reason": null,
  "evidence": [
    {
      "kind": "pdf_text | website_table | facebook_post | filename_inference | manual_inspection",
      "note": "Date visible in PDF header",
      "url": "https://...",
      "local_path": "pipeline/openlgu/mirror/...",
      "quote": "enacted July 15, 2023"
    }
  ],
  "created_at": "2026-05-25T10:00:00Z",
  "created_by": "local"
}
```

Discriminated shapes:

- `set_field`: `field` + `value` required. `derived` computed server-side.
- `cannot_determine`: `field` required, `value` null. Row leaves active list but stays visible as blocked.
- `confirm_turnover`: structured — sets `derived.term_id` and turnover marker. `field` is `turnover_marker`.
- `ignore`: no `field`/`value`. Marks entire row as not a real document.

No batch decisions. One decision per source record per field. Optional `batch_id` for grouping in future.

`source_content_hash` records what artifact version the reviewer saw. If staged docs are regenerated and content hash changes, show decision as historical requiring confirmation. If hash matches, carry decision forward.

### Term Inference

The workbench uses a local term snapshot at `pipeline/openlgu/terms.json`, not hardcoded config or live D1 queries. The snapshot is generated from canonical data (API or manual) and contains term date ranges.

Inference rules when `field=date_enacted`:

- Ranges are inclusive: `start_date <= date_enacted <= end_date`
- Exactly one match → auto-infer, set `term_inference: "auto"`
- No match → store date, set `term_inference: "unmatched"`, require manual term if promotion needs one
- Multiple overlapping terms → block auto-inference, surface term-data error
- Date on inauguration/election boundary + turnover marker → require reviewer confirmation

Manual override:

```json
{
  "term_override_id": "sb_11",
  "term_override_reason": "turnover_marker | pdf_evidence | other"
}
```

Server validates that override term exists in the snapshot and records both inferred and selected term.

### Review State and Filtering

Review state is per-field, per-source-record. Derived by server-side projection over review decisions, not stored.

A row missing both `date_enacted` and `title` stays active in the title tab after date is resolved.

Filtering is server-side. The server owns projection rules; the client renders tabs.

- Active: no applicable decision for the relevant field
- Resolved: latest applicable `set_field` decision exists
- Blocked: latest applicable `cannot_determine` decision exists
- Superseded: a newer decision replaced an older one

Supersession is computed in projection, not mutated in JSONL:

```json
{
  "status": "superseded",
  "superseded_by": "rvd_xyz"
}
```

History view shows all decisions in append order plus projected status.

### API Endpoints

v1 endpoints:

```text
GET  /api/workbench/health                     # server status, artifact load state, last reload
POST /api/workbench/reload                     # force artifact reload
GET  /api/workbench/stats                      # aggregate counts per tab
GET  /api/workbench/terms                      # local term snapshot
GET  /api/workbench/artifact-status            # generated_at, staged count, decision count, stale/error

GET  /api/workbench/staged-documents           # ?tab=missing_dates&status=active&page=1&limit=50
GET  /api/workbench/staged-documents/:id       # supports source_record_id lookup
POST /api/workbench/review-decisions           # returns updated projected item state
GET  /api/workbench/review-decisions           # ?source_record_id=src_res_abc123
```

Offset pagination for v1 (dataset is small and local). Deterministic sort order prevents page content jumps.

`POST /review-decisions` returns the updated projected item state so the client does not duplicate projection logic.

### UI Architecture

Split tab components under shared `OpenLguWorkbenchPage`:

```text
OpenLguWorkbenchPage
  WorkbenchTabs
    MissingDatesTab          # priority 1
    MissingTitlesTab         # priority 2
    TurnoverMarkersTab       # priority 3
    PersonRefGroupsTab       # priority 4 (deferred)
    SourceRunHealthTab       # priority 5 (deferred)
    CollisionGroupsTab       # priority 6 (deferred)
  DocumentReviewPanel        # side panel for evidence + form
  ReviewHistory              # decision history with projected status
  ArtifactStatusBanner       # generated_at, counts, stale/error state
```

Side panel (not inline, not modal): keeps list scannable while showing raw payload, PDF URL, local mirror, decisions, and review form.

PDF link display:

- Official URL as primary
- Reachability status (reachable/dead/unchecked) when available
- Local mirror path as secondary evidence
- Truncated display text with copy/open controls
- Dead link + no mirror = visible blocker state, not just broken link

### Replay and Projection

The workbench writes decisions, but the pipeline needs a later deterministic step that reads `review-decisions.jsonl` and projects them onto staged records. Design the projection now even though promotion is out of scope for v1.

Projection reads decisions in append order, groups by `(source_record_id, field)`, applies latest-wins, and outputs current review state per field per record. This is a read operation, not a write.

### Deferred to Later Versions

- `GET /api/workbench/person-ref-groups` — person reference grouping endpoint
- `GET /api/workbench/source-runs/:source_key` — per-source run detail
- Reading remote D1 records for comparison (v2)
- Promotion commands/endpoints (v3)

Source diffing should emit both machine-readable and human-readable outputs:

```text
pipeline/openlgu/diffs/2026-05-23T10-45-00/source-diff.json
pipeline/openlgu/diffs/2026-05-23T10-45-00/source-diff.md
```

`source-diff.json` is the primary output for later pipeline steps. Markdown is for inspection.

Diff decisions should be explicit and typed, for example:

```json
{
  "source_record_id": "...",
  "change_type": "changed",
  "decision": "stage_for_reconciliation",
  "reason": "content_hash_changed"
}
```

Timestamped run and diff artifacts are immutable after creation:

```text
runs/<timestamp>/source-records.jsonl
runs/<timestamp>/run.json
runs/<timestamp>/validation-results.jsonl
diffs/<timestamp>/source-diff.json
diffs/<timestamp>/source-diff.md
```

Convenience files may be overwritten by later runs:

```text
latest/source-records.jsonl
latest/run.json
last-failed-run.json
```

Local tooling should treat timestamped artifacts as read-only history and `latest/` or `last-*` files as replaceable convenience state.

Routine staging should consume diff decisions and stage only actionable deltas:

- new source rows
- changed source rows
- confirmed missing-from-source candidates

Unchanged source rows should not be restaged during routine sync.

Parser upgrades are different from source changes. When parsing logic changes, use an explicit full restage path over current successful source records:

```bash
npm run openlgu:stage-documents -- --all-current-source-records
```

This keeps routine runs delta-sized while preserving a deliberate parser replay path.

Staged records and diff outputs should record interpretation versions:

```json
{
  "source_record_id": "...",
  "content_hash": "...",
  "parser_version": "website-table-v1",
  "staged_schema_version": "staged-document-v1"
}
```

`parser_version` and `staged_schema_version` are interpretation provenance. They must not affect `source_record_id` or `content_hash`. They allow parser-output replay and stale-staging detection when source content is unchanged but parsing rules improve.

Parser and schema versions should be explicit constants in the collector/stager modules:

```js
const SOURCE_COLLECTOR_VERSION = "losbanos-website-collector-v1";
const STAGED_DOCUMENT_PARSER_VERSION = "website-table-to-staged-document-v1";
const STAGED_DOCUMENT_SCHEMA_VERSION = "staged-document-v1";
```

Do not infer parser versions from `package.json` version or git SHA. Package and commit versions change for unrelated reasons; parser versions should bump only when extraction or interpretation behavior changes.

When parser versions change but source content is unchanged, do not classify the source record as changed. Parser replay should emit a separate decision type only when explicitly requested:

```json
{
  "source_record_id": "...",
  "change_type": "unchanged",
  "decision": "restage_for_parser_version",
  "reason": "staged_parser_version_outdated"
}
```

Ordinary source diff avoids restaging unchanged records. Parser replay mode intentionally restages records whose prior staged output was produced by outdated interpretation rules.

Parser replay should target only outdated staged output by default:

```bash
npm run openlgu:stage-documents -- --replay-parser
npm run openlgu:stage-documents -- --replay-parser --force
```

`--replay-parser` compares current source records against the last staged `parser_version` and `staged_schema_version`, then restages only stale records. `--force` restages all current successful source records.

Parser versions should be per parser stage, not one global pipeline version:

```text
losbanos-website-collector-v1
website-table-to-staged-document-v1
legacy-csv-to-source-record-v1
legacy-csv-to-staged-document-v1
facebook-post-to-staged-session-v1
```

Per-stage versions keep replay scope narrow. A Facebook parser change should not make website staged documents stale, and a staged-document mapping change should not imply the raw website source collector changed.

Parser version bumps are manual, but tests should guard accidental misses:

- keep representative fixture HTML/CSV inputs
- snapshot parser outputs for those fixtures
- fail tests when parser output changes but the relevant parser version does not

When the guard fails, either fix the accidental behavior change or accept the new parser behavior and bump the relevant parser-stage version.

Commit small sanitized fixtures for parser tests:

```text
tests/fixtures/openlgu/website/resolutions.sample.html
tests/fixtures/openlgu/website/ordinances.sample.html
tests/fixtures/openlgu/website/executive_orders.sample.html
tests/fixtures/openlgu/legacy/documents.sample.csv
```

These fixtures are stable test inputs, not source evidence and not real reconciliation input. They should cover representative parser cases such as normal rows, `(OLD)` turnover rows, dead or missing PDF URLs, ordinance authors, missing titles, and malformed rows.

Sanitized fixtures should preserve real source structure and realistic numbering/date patterns, but use clearly non-authoritative fixture titles and URLs:

```text
Resolution No. 2022-001 (OLD)
Fixture title for turnover marker parsing
https://example.test/openlgu/resolution-2022-001-old.pdf
```

This keeps parser tests realistic without making committed fixtures look like source evidence.

Keep full live captures ignored as operational/debug artifacts:

```text
pipeline/openlgu/fixtures/html/
```

Ignored live captures may include exact LGU titles and URLs because they are operational replay evidence for debugging parser failures and reconciliation mismatches. Do not sanitize them in place.

Committed fixtures are the sanitized lane:

```text
tests/fixtures/openlgu/
```

A future helper may generate sanitized committed fixtures from ignored live captures:

```bash
npm run openlgu:sanitize-fixture
```

Do not store full raw HTML in D1. D1 should keep compact, queryable state and references:

```text
scrape_runs
page_fetches
source_records
validation_results
content_hash
raw_snapshot_key
```

Large replay payloads such as full raw HTML, PDFs, and OCR text should live in ignored local artifacts or R2. D1 rows reference them by keys such as `raw_snapshot_key`.

OCR is an enrichment lane, not a prerequisite for the first working website pipeline.

Full OCR text should live in R2 or local artifacts, referenced by key:

```text
ocr_text_key
```

D1 stores compact OCR facts only when they are useful for matching, review, or diagnostics:

```text
document_id/source_record_id
ocr_text_key
ocr_status
ocr_engine
ocr_created_at
extracted_title
extracted_document_number
extracted_date
extracted_people_json
confidence
```

Search indexing may later consume OCR text from R2 into MeiliSearch. Do not bloat D1 with full OCR payloads.

OCR is optional until extraction quality is proven. In v1, OCR should not auto-promote canonical fields.

OCR may:

- fill missing staged candidate fields
- improve matching confidence
- flag conflicts
- extract people/date/title evidence
- support review UI

Canonical updates from OCR must go through the same staged validation and review/promotion path as other source evidence. Early OCR-derived updates should require manual review.

PDF mirroring should happen before OCR. OCR should read from a BetterLB-controlled mirror when available, not directly from official LGU URLs.

```text
official pdf_url
  -> link check
  -> mirror to R2/local cache
  -> OCR reads mirrored PDF
  -> OCR text/facts stored as evidence
```

If a mirror is missing but the official URL is reachable, the archive job should mirror first, then OCR. If the official URL is dead and no mirror exists, OCR status should be `blocked_missing_pdf`.
