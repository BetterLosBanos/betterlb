# OpenLGU Legislative Source Pipeline

## Goal

Put a source/staging layer in front of canonical OpenLGU records so scraped website rows, Facebook posts, OCR text, and manual imports can be compared before they mutate D1.

The first version is intentionally non-destructive:

- existing `documents`, `sessions`, `terms`, and `persons` rows remain canonical
- source records are captured as evidence
- parsed records are staged and reconciled
- only selected high-confidence fields get provenance
- review state stays in staging/reconciliation, not canonical documents

## Canonical Boundaries

`terms` are manually maintained reference data. Facebook posts and website rows can imply a term from dates, but they do not create terms.

`sessions` remain canonical, but document promotion does not require session linkage. Missing or uncertain session linkage should stay visible as a review issue.

`document_authors` remains canonical only for high-confidence or manually confirmed authors. Movers and seconders are retained as staging evidence in v1 because they are usually recoverable from the source PDF and are not a core public navigation/query surface.

Sponsor and signatory fields are out of scope for v1.

## Status Model

Canonical documents receive:

- `publication_status`: `active`, `missing_from_source`, `withdrawn`, `superseded`, `manual_only`
- `verification_state`: `unverified`, `partially_verified`, `verified`, `disputed`

Staged rows receive:

- `staging_status`: `new`, `matched`, `collision`, `needs_review`, `promoted`, `ignored`
- `verification_state`: same vocabulary as canonical rows

Existing `documents.status`, `documents.processed`, and `documents.needs_review` are left intact for now. They can be removed after the pipeline owns review workflows end to end.

## Initial Reconciliation

The first reconciliation should run locally in shadow mode against production exports and scraped source files.

Shadow mode may:

- infer term assignment from canonical term date ranges
- build matching keys from `document_type`, `term_id`, and normalized document number
- detect turnover markers such as `(old)` or `(new)`
- report unresolved collisions and missing fields
- attach provenance for high-confidence matches in a later migration/script

Shadow mode must not overwrite canonical values.

## Routine Sync

After the initial import is clean enough, routine sync can move to a scheduled worker:

- scrape source
- write `source_records`
- parse to `staged_documents`
- reconcile against canonical records
- enqueue review items for conflicts
- promote only explicit, high-confidence updates

The hard work is the first import and reconciliation. Routine runs should be mostly incremental.
