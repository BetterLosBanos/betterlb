# BetterLB OpenLGU

This context describes the civic-legislative data language used by BetterLB's OpenLGU portal. It distinguishes source intake, review, and canonical public records for municipal legislation.

## Language

**OpenLGU Legislative Source Pipeline**:
The workflow that turns website table rows, Facebook session posts, and optional PDF/OCR extraction into reviewed canonical legislative records in D1.
_Avoid_: Data pipeline, scraper pipeline, OpenLGU pipeline

**Citizens Charter Pipeline**:
The separate workflow that merges service data into public Citizens Charter service JSON.
_Avoid_: OpenLGU pipeline, legislative pipeline

**Source Record**:
A raw observation from an upstream source, such as a website table row, Facebook post, or OCR result. A source record records what was seen, not what BetterLB believes is true.
_Avoid_: Document, canonical record

**Raw-Preserving Collection**:
The collection rule that source records preserve upstream values as observed, while interpretation and cleanup happen later in staging. Collection may perform minimal URL and whitespace canonicalization for identity and hashing.
_Avoid_: Early normalization, scrape cleanup

**Versioned Source Record**:
A source record version created only when the same upstream row is observed with changed content. Unchanged observations update freshness metadata; they do not create duplicate source record versions.
_Avoid_: Every scrape copy, append-only scrape row

**Source Content Hash**:
A stable hash of meaningful upstream row content used to detect changed source records. It excludes scrape metadata, row position, link-health state, mirror state, and timestamps.
_Avoid_: Run hash, scrape hash

**Source Row Index**:
The transient row position of an upstream table row during a scrape. Row index is debug-report evidence only and is not D1 state, source identity, matching evidence, or public data.
_Avoid_: Source identity, document number

**Staged Record**:
A normalized but untrusted candidate produced from one or more source records. A staged record must pass matching and validation before it can change canonical records.
_Avoid_: Draft document, imported document

**Canonical Record**:
A reviewed or high-confidence record in D1 that is safe for public OpenLGU APIs. Canonical records may reference source records, but they are not overwritten directly by scrapers or parsers.
_Avoid_: Source row, scrape result

**Legacy Canonical Record**:
An existing production D1 record created before the staged source pipeline. A legacy canonical record is protected from blind overwrite, but may still be unverified.
_Avoid_: Trusted record, imported record

**Shadow Mode**:
A pipeline run mode that fetches, parses, stages, validates, and compares source data without changing canonical records. Shadow mode produces reconciliation evidence before promotion is enabled.
_Avoid_: Dry run, test import

**Turnover Marker**:
A source marker such as `(OLD)` that indicates a record belongs to the outgoing administration during an election-year transition. A turnover marker is evidence for term assignment, not part of the public document number.
_Avoid_: Old document, duplicate marker

**Matching Key**:
A ranked set of evidence used to decide whether source or staged records refer to the same legislative document. Matching keys are not canonical identity; unresolved collisions remain separate candidates for review.
_Avoid_: Primary key, dedupe key

**Unresolved Collision**:
Two or more source or staged records that look related but cannot be safely merged automatically. Unresolved collisions must go to review instead of being collapsed by the pipeline.
_Avoid_: Duplicate, conflict

**Promotion**:
The act of applying a staged record to canonical records after validation. Promotion may be automatic for high-confidence staged records or manual when review is required.
_Avoid_: Import, sync write

**Review Queue**:
The human decision queue for staged records, source changes, or collisions that the pipeline cannot safely promote automatically.
_Avoid_: Error queue, needs-review flag

**Local Review Workbench**:
A development-only review surface for inspecting local staging artifacts and recording replayable review decisions before D1 staging and promotion are enabled. It is not the production review queue.
_Avoid_: Review Queue, admin review queue, production review UI

**Review Decision**:
A replayable human decision recorded separately from generated staging artifacts, such as setting a missing date, confirming a title, ignoring a bad candidate, or marking a value as indeterminate. A review decision applies to a source record and may also name the staged record visible when the decision was made.
_Avoid_: Edited staged record, direct JSONL correction

**Review Evidence**:
The lightweight source explanation attached to a review decision, such as PDF text, website table value, Facebook post text, filename inference, or an explicit cannot-determine outcome.
_Avoid_: Audit log, full citation, source record

**Actionable Review Item**:
A review queue item created from an unresolved decision that needs human action, such as a collision, tracked field conflict, confirmed missing-source candidate, or relevant unresolved person reference.
_Avoid_: Raw scrape event, every changed row

**Field Provenance**:
The ownership and history of an individual canonical field, including whether its current value came from website data, Facebook data, OCR, or manual correction. Field provenance protects manual corrections while allowing unrelated fields to continue syncing.
_Avoid_: Source of truth, record owner

**Tracked Field Conflict**:
A changed source value for a tracked canonical field that already has a populated canonical value. Tracked field conflicts require review or explicit promotion instead of blind overwrite.
_Avoid_: Auto-update, source correction

**Tracked Field**:
A canonical field whose provenance is recorded because it is source-owned, manually corrected, or conflict-prone. Not every database column is a tracked field.
_Avoid_: All fields, audited column

**Initial Reconciliation**:
The first bulk comparison between existing production records and the staged source pipeline. Initial reconciliation is expected to be more expensive and review-heavy than routine syncs.
_Avoid_: Initial import, migration

**Auto-Attached Provenance**:
Field provenance attached during initial reconciliation when a source record matches a legacy canonical record with high confidence and no material differences. Auto-attached provenance must not overwrite protected canonical values.
_Avoid_: Auto-merge, auto-correction

**Routine Sync**:
A recurring pipeline run after initial reconciliation. Routine syncs should mostly process deltas: new, changed, missing, or conflicting source records.
_Avoid_: Full reimport

**Reconciliation Report**:
A bulk-run summary of matches, conflicts, collisions, new candidates, and legacy-only records. A reconciliation report explains a pipeline run; it is not the human work queue.
_Avoid_: Review queue, audit log

**Local Reconciliation Run**:
An initial or investigative reconciliation run executed locally to iterate on parsing, matching, and reporting before routine sync is automated.
_Avoid_: Worker sync, production import

**Legacy Manual Staging CSV**:
The manually edited `pipeline/data/documents.csv` file from the original pipeline. It is a transitional staging input and source of evidence, not a canonical import artifact.
_Avoid_: Canonical CSV, production import CSV

**Routine Worker Sync**:
A Cloudflare Worker sync used after initial reconciliation is proven. Routine worker syncs process source deltas rather than performing full bulk reconciliation.
_Avoid_: Initial reconciliation

**Record Verification**:
The record-level trust summary used for filtering, review planning, and public/admin indicators. Record verification summarizes trust but does not replace field provenance.
_Avoid_: Field provenance, publication status

**Data Conflict**:
A recorded disagreement between a source record and a canonical field that cannot be applied automatically. Data conflicts preserve source evidence without overwriting protected canonical values.
_Avoid_: Validation error, duplicate

**Source Snapshot**:
The preserved raw payload observed from an upstream source at a point in time, such as a website table row, Facebook post text, or OCR text. Source snapshots support replay, parser fixes, and conflict review.
_Avoid_: Scrape log, canonical copy

**Selective Snapshot Retention**:
The policy of preserving raw source snapshots only for changed, anomalous, or explicitly debugged scrape runs. Routine unchanged scrapes keep compact run metadata and hashes instead of raw payload copies.
_Avoid_: Full snapshot archive, keep everything

**Scrape Source**:
An upstream location monitored by the pipeline, such as a Los Baños website table or Facebook source. A scrape source defines what is checked, not what was found.
_Avoid_: Source record, data source row

**Scrape Run**:
One execution of source collection for one or more scrape sources. A scrape run records timing, status, counts, and errors.
_Avoid_: Sync, import batch

**Successful Scrape**:
A scrape run that fetched the upstream page, found the expected table, parsed enough rows for that source, and passed layout validation. Only successful scrapes count toward missing-from-source confirmation.
_Avoid_: HTTP success only, partial scrape

**Validation Result**:
The outcome of checking a staged record or source record against pipeline rules. Validation results explain whether a candidate can promote, needs review, or should be rejected.
_Avoid_: Review status, error

**Table Shape Failure**:
A source-level scrape failure where the expected upstream table or column layout is missing or invalid. Table shape failures stop source-record emission for that source run.
_Avoid_: Row validation error, missing source record

**Website Table Row**:
A source kind from losbanos.gov.ph HTML tables. It is the primary source for document metadata such as type, number, title, enacted date, PDF URL, ordinance author, and committees.
_Avoid_: Website document, PDF record

**Source Row Identity**:
The stable identity of an upstream row across scrape runs. For website table rows, the PDF URL string is the primary identity when present, even if the linked PDF is dead.
_Avoid_: Document identity, matching key

**PDF Reachability**:
The observed fetchability of a PDF URL, such as reachable, dead, redirected, missing, or unchecked. PDF reachability is evidence about a linked file, not the identity of the website table row.
_Avoid_: Source identity, publication status

**PDF Mirror**:
A BetterLB-controlled archived copy of an official LGU PDF, usually stored outside D1. A PDF mirror preserves evidence when official links rot, but it does not replace the official source URL.
_Avoid_: Official PDF URL, canonical source

**Archived Copy Fallback**:
A future public display mode where BetterLB can show a preserved PDF mirror when the official PDF URL is dead. Archived copy fallback is not the initial public behavior.
_Avoid_: Primary source, official record

**Facebook Post**:
A source kind from legislative session posts on Facebook. It is the primary source for session linkage and proceedings details such as movers, seconders, and some resolution authors.
_Avoid_: Social source, post import

**OCR Text**:
A source kind produced by extracting text from scanned PDFs. In v1 it is an enrichment source, not a required path for automatic promotion.
_Avoid_: PDF source, document body

**Publication Status**:
The public lifecycle of a canonical record, such as active, missing from source, withdrawn, or superseded. Publication status is not review state.
_Avoid_: Review status, processed flag

**Verification State**:
The trust level of a canonical record after human review or reconciliation evidence. Verification state is separate from publication status and review queue status.
_Avoid_: Processed, active, approved

**Unverified**:
A verification state indicating that the record has not been human-checked or sufficiently reconciled.
_Avoid_: Pending

**Partially Verified**:
A verification state indicating that some evidence supports the record, but it should not be treated as fully human-checked.
_Avoid_: Processed

**Verified**:
A verification state indicating that the record has been human-checked or otherwise reconciled with enough evidence to trust it.
_Avoid_: Approved

**Disputed**:
A verification state indicating that source evidence and canonical data disagree in a way that needs resolution.
_Avoid_: Invalid, duplicate

**Active**:
A publication status indicating that a canonical document is currently valid for public display.
_Avoid_: Approved, processed

**Missing from Source**:
A publication status indicating that a canonical document was previously observed upstream but is no longer present there. The record remains public with source freshness context.
_Avoid_: Deleted, removed

**Confirmed Missing Source**:
A source row absence observed across enough successful scrapes to treat it as a real upstream disappearance rather than a transient fetch or parsing issue.
_Avoid_: First missing scrape, scrape failure

**Withdrawn**:
A publication status indicating that the LGU or an admin determined the document should no longer be treated as valid.
_Avoid_: Deleted, rejected

**Superseded**:
A publication status indicating that a newer document replaces or amends the document while the older document remains historically relevant.
_Avoid_: Inactive, archived

**Manual Only**:
A publication status indicating that a canonical document exists from manual/admin entry and has no current upstream source match.
_Avoid_: Unsynced, orphan

**Unresolved Person Reference**:
A source or staged reference to a person name that cannot be confidently matched to a canonical person. It preserves the raw name without creating a public person record.
_Avoid_: Person stub, unknown person

**Document Author**:
A canonical relationship between a legislative document and a person credited as its author (principal or co-author) when that relationship is confidently known. Document authorship is public-facing metadata with a type distinction between principal and co-author.
_Avoid_: Sponsor, mover, seconder

**Authorship Promotion**:
The promotion of a source or staged author reference into canonical document authorship. Authorship promotion requires high-confidence person matching or reviewer confirmation.
_Avoid_: Author import, author parsing

**Session Linkage**:
The relationship between a legislative document and the session where it was discussed, approved, or recorded. Session linkage enriches a document but is not required for document promotion.
_Avoid_: Document identity, required document field

**Term Assignment**:
The derivation of a term from a reliable session or document date matched against canonical term date ranges. Facebook posts do not provide term data directly.
_Avoid_: Facebook term, inferred administration

**Canonical Term**:
Manually maintained reference data describing a Sangguniang Bayan term and its date range. Canonical terms are read by the pipeline for term assignment but are not produced by source ingestion.
_Avoid_: Scraped term, imported term

**Principal Author**:
The person who drafted and filed a legislative document. A document may have multiple principal authors if both genuinely co-wrote it.
_Avoid_: Primary author, sponsor

**Co-Author**:
A person who co-sponsored a legislative document in support of the principal author. Co-authors are supporters, not drafters.
_Avoid_: Secondary author, co-sponsor

**Mover and Seconder**:
Procedural details from legislative proceedings indicating who moved or seconded consideration of a document. In v1 these remain staging evidence only and are not canonical document-person relationships.
_Avoid_: Document participant, canonical author

**Collective Authorship**:
A source pattern where authorship is attributed to a group such as "All SB Members" rather than named individuals. Collective authorship is preserved as unresolved person references until matched against the term membership roster.
_Avoid_: Group author, anonymous author

**Membership Tenure**:
The date range during which a person held a specific role within a term. A person may have multiple membership records per term if their role changed mid-term due to promotion, resignation, or death.
_Avoid_: Term period, service dates

**Birth Name**:
The surname a person had before marriage. Used for person matching when source records use pre-marriage names.
_Avoid_: Maiden name, original name

**Staging Status**:
The pipeline lifecycle of a staged record before or after promotion. Staging status describes whether a candidate is pending validation, ready to promote, blocked, promoted, or rejected.
_Avoid_: Publication status, document status

**Review Projection**:
The deterministic replay of review decisions onto staged records to compute current review state. Projection is how decisions become actionable; it is a read operation, not a write.
_Avoid_: Applying decisions, promotion, merge

**Term Snapshot**:
A local cache of canonical term date ranges used by the review workbench for term inference. Generated from the canonical API or manual entry; not source-derived data.
_Avoid_: Canonical term, term config, hardcoded terms

**Review State**:
The per-field resolution status of a staged record computed by review projection, such as active, resolved, superseded, or blocked. Review state is derived, not stored.
_Avoid_: Staging status, publication status

## Example Dialogue

Dev: "Should Citizens Charter services go through the OpenLGU Legislative Source Pipeline?"

Domain expert: "No. Citizens Charter has its own pipeline. The OpenLGU Legislative Source Pipeline only handles legislative records like documents, sessions, people, and source reconciliation."

Dev: "Can the website scraper insert documents directly?"

Domain expert: "No. It creates source records and staged records first. Only the promotion step can update canonical records."

Dev: "Are existing production records automatically trusted?"

Domain expert: "No. They are legacy canonical records: protected from blind overwrite, but not necessarily verified."

Dev: "Does `active` mean the data is verified?"

Domain expert: "No. Active is a publication status. Verification state says whether the record has been checked."

Dev: "Should `(OLD)` stay in the resolution number?"

Domain expert: "No. Treat it as a turnover marker that helps assign the record to the outgoing term."

Dev: "Two 2019 resolutions have the same number but different titles. Are they duplicates?"

Domain expert: "Not automatically. That is an unresolved collision unless the matching key has enough evidence to merge them."

Dev: "Do admins review every scraped record?"

Domain expert: "No. High-confidence staged records can promote automatically. The review queue is for ambiguity, conflicts, and low-confidence extraction."

Dev: "The website changed a field that an admin corrected. Should the scraper overwrite it?"

Domain expert: "No. Field provenance protects the manual correction and records the disagreement as a data conflict."

Dev: "Do we need field provenance if the record is partially verified?"

Domain expert: "Yes. Record verification is the summary; field provenance explains which fields are trusted and protected."

Dev: "Do we track provenance for every column?"

Domain expert: "No. Only tracked fields need field provenance."

Dev: "Can initial reconciliation update thousands of records automatically?"

Domain expert: "It can auto-attach provenance for high-confidence matches, but it cannot overwrite protected canonical values without review."

Dev: "Is the review queue enough for initial reconciliation?"

Domain expert: "No. The review queue tracks decisions. The reconciliation report explains the whole bulk run."

Dev: "Should the first reconciliation run as a cron Worker?"

Domain expert: "No. Initial reconciliation runs locally first. The Worker is for routine sync after the model is proven."

Dev: "Why keep the raw website row after parsing it?"

Domain expert: "Because source snapshots let us replay parsing, audit source changes, and show evidence during review."

Dev: "Is the PDF itself the source?"

Domain expert: "For v1, no. The website table row is the source for metadata, and OCR text is a separate enrichment source when available."

Dev: "Does a canonical document need `needs_review`?"

Domain expert: "No. Review state belongs to staged records and review queue items. Canonical documents keep publication status."

Dev: "The source mentions a person name we cannot match. Should we create a person?"

Domain expert: "No. Keep an unresolved person reference until a reviewer links it to a canonical person."

Dev: "Should movers and seconders become canonical relationships?"

Domain expert: "No. In v1 they stay as source evidence. Only confident document authorship becomes canonical."

Dev: "Can parsed authors become canonical automatically?"

Domain expert: "Only when matching confidence is high. Otherwise the author reference waits for review."

Dev: "Can we publish a document if we do not know its session?"

Domain expert: "Yes. Session linkage enriches the document, but missing session linkage does not block promotion."

Dev: "Does Facebook provide the term?"

Domain expert: "No. Facebook may provide a session date. Term assignment is derived by matching that date against canonical term date ranges."

Dev: "Can the scraper create a new term?"

Domain expert: "No. Terms are canonical reference data maintained manually."

Dev: "Should the review workbench update staged documents directly?"

Domain expert: "No. It writes append-only review decisions. Review projection replays those decisions to compute review state; it does not mutate staged artifacts."

Dev: "Where does the workbench get term ranges for date inference?"

Domain expert: "From a local term snapshot, not from D1 or hardcoded config. The snapshot is generated from canonical data."

Dev: "Does a row with both missing date and missing title get resolved by one decision?"

Domain expert: "No. Review state is per-field. One decision resolves one field. The row stays active in the other missing-field tab until that field is also resolved."
