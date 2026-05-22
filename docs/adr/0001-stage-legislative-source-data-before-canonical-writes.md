# Stage legislative source data before canonical D1 writes

BetterLB's OpenLGU sources are inconsistent: website table rows, Facebook posts, and OCR text may disagree or contain sloppy numbering. We will preserve source snapshots and staged records, then promote only validated high-confidence candidates into canonical D1 records. This avoids direct scraper writes overwriting manual corrections or collapsing ambiguous LGU records.
