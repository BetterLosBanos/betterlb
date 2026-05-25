# Local Review Workbench: separate Hono server with append-only decisions

The OpenLGU source pipeline produces staged artifacts that need human review before promotion. The existing production review queue targets old `review_queue` D1 tables incompatible with the rebuilt schema. Rather than extending the old review queue or building review into Cloudflare Functions, we build a local dev-only workbench backed by a separate Hono Node server that reads local JSONL artifacts and writes append-only review decisions.

## Decision

Embed the workbench UI in the existing Vite app at `/admin/openlgu/workbench` alongside other admin routes. Run a local Hono server (`scripts/openlgu/review-workbench-server.mjs`) that:

- Reads local JSONL artifacts into memory (staged docs, source records, person refs, reconciliation shadow, source runs)
- Writes append-only review decisions to `pipeline/openlgu/review-decisions.jsonl`
- Serves server-side projection of current review state
- Does not touch canonical D1 records

## Alternatives considered

### Extend existing Cloudflare Functions

Cloudflare Functions run sandboxed and cannot read local JSONL files from the developer's filesystem. The workbench needs file I/O to read staging artifacts and append review decisions. A Cloudflare Function would require uploading all artifacts to D1/R2 first, which is premature for a local dev workflow.

### Standalone mini app

A separate app at its own port would duplicate UI components (admin layout, design system) and lose the shared admin navigation. The workbench has the same component dependencies as other admin pages.

### Wrangler Pages Functions with local binding

Wrangler's local dev mode serves Functions but still targets D1, not local JSONL. No binding mechanism exists for arbitrary local file reads in the Pages Functions runtime.

### Inline forms or modals

Inline review forms in list rows make dense tables unstable. Modals hide source evidence. A side panel keeps the list scannable while showing raw payload, PDF links, mirror paths, decisions, and form together.

## Consequences

- Two running processes required (Vite dev server + workbench server) during review sessions
- Review decisions are local-only; no network or D1 dependency
- Review projection is a deterministic replay of decisions onto staged records — promotion is a separate future step
- Decision schema is versioned (`schema_version`) for forward compatibility
- `source_content_hash` on decisions enables replay durability when staged artifacts are regenerated
- CORS restricted to local dev origins only; server binds `127.0.0.1`
