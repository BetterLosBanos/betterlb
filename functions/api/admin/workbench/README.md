# OpenLGU Review Workbench (D1 Functions)

Cloudflare Pages Functions backing the admin **Review Workbench** — the tool LGU staff use to
resolve missing/ambiguous metadata on staged civic documents (ordinances, resolutions) before
publication. Decisions are recorded as an append-only audit trail and replayed into a per-field
**review projection**.

This directory is the **deployed (D1) adapter**. A second adapter,
`scripts/openlgu/review-workbench-server.mjs`, serves the same UI locally from JSONL pipeline
output. The two share semantics but currently duplicate logic — see the
[shared review modules plan](../../../../docs/superpowers/plans/2026-06-12-openlgu-shared-review-modules.md)
for the planned unification.

## Architecture

```
src/pages/admin/OpenLguWorkbench.tsx     UI (auto-detects deployed vs local)
        │  src/lib/workbench-api.ts       fetch client (credentials: include)
        ▼
functions/api/admin/workbench/*.ts       this dir — D1 adapter
        │  withAuth() + RBAC + CSRF       functions/utils/admin-auth.ts
        ▼
D1 (BETTERLB_DB)                          staged_documents, source_records,
                                          review_decisions, terms
```

Frontend base URL (`src/lib/workbench-api.ts`):
- **dev**: `http://127.0.0.1:8789/api/workbench` (local JSONL server) unless `VITE_OPENLGU_REVIEW_API` set
- **prod**: `/api/admin/workbench` (these Functions)

## Endpoints

All under `/api/admin/workbench`. Every endpoint requires a valid `admin_session` cookie
(GitHub OAuth → KV session) **and** the listed RBAC permission. Mutations also require a CSRF
token (`X-CSRF-Token` header).

| Method | Path | Permission | CSRF | Purpose |
|--------|------|-----------|------|---------|
| GET | `/health` | `workbench:read` | — | Row counts + latest capture timestamp |
| GET | `/stats` | `workbench:read` | — | Per-tab totals (active/resolved/blocked) |
| GET | `/terms` | `workbench:read` | — | Sangguniang Bayan terms (for term inference) |
| GET | `/staged-documents` | `workbench:read` | — | Paginated list; `?tab=&status=&page=&limit=&search=` |
| GET | `/staged-documents/:id` | `workbench:read` | — | Single doc + decisions + review projection |
| GET | `/review-decisions?source_record_id=` | `workbench:read` | — | List decisions for a record |
| POST | `/review-decisions` | `workbench:write` | ✅ | Create a review decision |

### Query params (`/staged-documents`)
- `tab`: `missing_dates` \| `missing_titles` \| `missing_terms` \| `turnover_markers` (default `missing_dates`)
- `status`: `active` \| `resolved` \| `blocked` \| `all` (default `active`)
- `page` (≥1), `limit` (capped by `PAGINATION_LIMITS.MAX_LIMIT`), `search` (LIKE across type/number/title/source id)

### Decision body (`POST /review-decisions`)
```jsonc
{
  "source_record_id": "src_…",       // required, must exist
  "staged_document_id": "stg_…",
  "decision_type": "set_field" | "cannot_determine" | "confirm_turnover",
  "field": "date_enacted" | "title" | "term_id" | "turnover_marker",
  "value": "2023-05-01",             // set_field: validated per field
  "evidence": [{ "kind": "pdf_text", "note": "…", "url": "…" }]  // must be array
}
```
- `set_field` + `date_enacted` → value must match `YYYY-MM-DD`; term auto-inferred from terms table.
- `set_field` + `term_id` / `confirm_turnover` → `value` must be an existing `terms.id`.
- Each decision stores `source_content_hash`; projection only honours decisions whose hash is
  current (`is_current_source_hash`), so stale decisions are ignored after a source re-capture.

## RBAC

Roles map to permissions in `functions/utils/rbac.ts`:
- **viewer** → `workbench:read`
- **editor** / **admin** → `workbench:read` + `workbench:write`

Sessions without a role default to `viewer` (read-only) — so a viewer can browse but not record
decisions.

## Security notes
- All SQL uses bound parameters (`?`), including the `search` LIKE filter and the
  `review-decisions` source-record filter. Do not reintroduce string interpolation of request
  input into SQL.
- The only interpolated value in `utils.ts` is `field`, drawn from a fixed `fieldMap`/tab
  allowlist — never from raw request input.
- Mutations are CSRF-protected and gated by `workbench:write`.

## Data model

Migration `db/migrations/003_workbench_extensions.sql`:
- Extends `source_records` (pdf reachability, source_key, timing) and `staged_documents`
  (`turnover_marker`, `co_author_text`, `matching_key`).
- Creates `review_decisions` (append-only) with indexes on `source_record_id`,
  `staged_document_id`, `(source_record_id, field)`, and `created_at`.

## Deploy / data load

```bash
# Apply migrations to remote D1
./scripts/migrate.sh remote

# Load pipeline JSONL into remote D1
node scripts/openlgu/load-pipeline-to-d1.mjs --remote
```

Local dev against JSONL (no D1) uses the standalone server:
```bash
node scripts/openlgu/review-workbench-server.mjs   # serves :8789
```

## Known divergences (deployed vs local)

Tracked in the [shared review modules plan](../../../../docs/superpowers/plans/2026-06-12-openlgu-shared-review-modules.md).
Notable: the list view (`queryStagedDocuments`) returns placeholder `projected_fields`/empty
`review_decisions` — only the single-document endpoint computes the full projection.
