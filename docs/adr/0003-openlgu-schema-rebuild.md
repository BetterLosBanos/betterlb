# Rebuild OpenLGU D1 schema with proper constraints and clean column sets

The initial schema (migrations 001-004) accumulated technical debt: duplicate mayor/vice_mayor storage on terms, raw TEXT mover/seconder fields on documents, no CHECK constraints on enum-like columns, overlapping status fields, and no FK enforcement. Migration 006 added pipeline tables but never applied them to remote. Rather than patch incrementally (D1 lacks DROP COLUMN), we squash into a clean rebuild with a data migration script to transform existing records.

## Breaking changes

- `terms`: dropped `mayor`/`vice_mayor` TEXT (use memberships + person_id FK instead)
- `documents`: dropped `status`, `needs_review`, `processed`, `review_notes`, `moved_by`, `seconded_by`; added `term_id`, `publication_status`, `verification_state`, `source_confidence`, `canonical_notes`
- `document_authors`: `author_type` CHECK constrained to `principal`/`co_author`; added `raw_name`
- `sessions`: `type` CHECK constrained to `Regular`/`Special`/`Inaugural`; dropped `ordinal_number`; `date` NOT NULL
- `persons`: dropped `photo_url`; added `birth_name`; `last_name` NOT NULL
- `memberships`: restored `start_date`/`end_date` for mid-term role changes (mayor death, VP promotion)
- Dropped tables: `facebook_session_data`, `data_conflicts`, `review_queue`, `admin_audit_log`, `subjects` (re-added empty), `document_subjects` (re-added empty)

## Data transformation

- Executive session (`sb_11_2025-01-01_executive`) dissolved; 157 documents get `session_id = NULL`
- `sb_09` FK references fixed to `sb_9` (terms PK)
- Duplicate membership `perez-muriel-laisa-b` removed
- `document_authors.author_type` migrated from `primary` to `principal`
- `admin_audit_log` rows merged into `audit_log`

## Upgrade path

1. `wrangler d1 export betterlb_openlgu --remote --output=backup.sql`
2. Apply `001_initial_schema.sql` (clean schema) + `002_baseline_data.sql` (seed)
3. Run `scripts/openlgu/migrate-data.cjs` to transform and import old data
