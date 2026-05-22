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

**Field Provenance**:
The ownership and history of an individual canonical field, including whether its current value came from website data, Facebook data, OCR, or manual correction. Field provenance protects manual corrections while allowing unrelated fields to continue syncing.
_Avoid_: Source of truth, record owner

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

**Scrape Source**:
An upstream location monitored by the pipeline, such as a Los Baños website table or Facebook source. A scrape source defines what is checked, not what was found.
_Avoid_: Source record, data source row

**Scrape Run**:
One execution of source collection for one or more scrape sources. A scrape run records timing, status, counts, and errors.
_Avoid_: Sync, import batch

**Validation Result**:
The outcome of checking a staged record or source record against pipeline rules. Validation results explain whether a candidate can promote, needs review, or should be rejected.
_Avoid_: Review status, error

**Website Table Row**:
A source kind from losbanos.gov.ph HTML tables. It is the primary source for document metadata such as type, number, title, enacted date, PDF URL, ordinance author, and committees.
_Avoid_: Website document, PDF record

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
A canonical relationship between a legislative document and a person credited as its author when that relationship is confidently known. Document authorship is public-facing metadata.
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

**Mover and Seconder**:
Procedural details from legislative proceedings indicating who moved or seconded consideration of a document. In v1 these remain source or staging evidence and are not canonical document-person relationships.
_Avoid_: Document participant, canonical author

**Staging Status**:
The pipeline lifecycle of a staged record before or after promotion. Staging status describes whether a candidate is pending validation, ready to promote, blocked, promoted, or rejected.
_Avoid_: Publication status, document status

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
