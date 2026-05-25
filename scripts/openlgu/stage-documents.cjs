#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_INPUT = 'pipeline/openlgu/source-records.jsonl';
const DEFAULT_TERMS = 'pipeline/openlgu/reference/terms.json';
const DEFAULT_ROSTER = 'pipeline/openlgu/reference/term-roster.json';
const DEFAULT_DOCUMENTS_OUTPUT = 'pipeline/openlgu/staged-documents.jsonl';
const DEFAULT_PERSON_REFS_OUTPUT = 'pipeline/openlgu/staged-person-refs.jsonl';

const COLLECTIVE_PATTERN = /all\s+sb\s+members/i;

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    terms: DEFAULT_TERMS,
    roster: DEFAULT_ROSTER,
    documentsOutput: DEFAULT_DOCUMENTS_OUTPUT,
    personRefsOutput: DEFAULT_PERSON_REFS_OUTPUT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--input' && next) {
      args.input = next;
      i += 1;
    } else if (arg === '--terms' && next) {
      args.terms = next;
      i += 1;
    } else if (arg === '--roster' && next) {
      args.roster = next;
      i += 1;
    } else if (arg === '--documents-output' && next) {
      args.documentsOutput = next;
      i += 1;
    } else if (arg === '--person-refs-output' && next) {
      args.personRefsOutput = next;
      i += 1;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/openlgu/stage-documents.cjs [options]

Parses source-record JSONL into staged document and staged person reference JSONL.
This normalizes candidates only. It does not write canonical D1.

Options:
  --input <path>                 Source records JSONL. Default: ${DEFAULT_INPUT}
  --terms <path>                 Terms JSON. Default: ${DEFAULT_TERMS}
  --roster <path>                Term roster JSON. Default: ${DEFAULT_ROSTER}
  --documents-output <path>      Staged documents JSONL. Default: ${DEFAULT_DOCUMENTS_OUTPUT}
  --person-refs-output <path>    Staged person refs JSONL. Default: ${DEFAULT_PERSON_REFS_OUTPUT}
`);
}

function readJson(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function writeJsonl(filePath, records) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    records.length
      ? `${records.map(record => JSON.stringify(record)).join('\n')}\n`
      : ''
  );
}

function normalizeType(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

function normalizeNumber(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replace(/\((old|new)\)/g, '')
    .replace(/\b(resolution|ordinance|executive\s+order|order)\b/g, '')
    .replace(/\b(no|number)\b\.?/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inferTermId(dateValue, terms) {
  if (!dateValue) return '';
  const date = Date.parse(dateValue);
  if (Number.isNaN(date)) return '';

  const term = terms.find(candidate => {
    const start = Date.parse(candidate.start_date);
    const end = Date.parse(candidate.end_date);
    return (
      !Number.isNaN(start) && !Number.isNaN(end) && date >= start && date <= end
    );
  });

  return term?.id ?? '';
}

function hasTurnoverMarker(row) {
  const haystack = [row.number, row.title, row.filename, row.pdf_url]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
  return /\((old|new)\)|\bold\b|\bnew\b/.test(haystack);
}

function splitNames(value) {
  return String(value ?? '')
    .split(/[,;]|\band\b/gi)
    .map(name => name.trim())
    .filter(name => name.length > 2);
}

/**
 * Extract number from combined_title_number fields like:
 *   "(OLD) RESOLUTION NO. 2019-01"
 *   "Executive Order No. 40 Series of 2026"
 */
function extractNumberFromCombined(value) {
  if (!value) return '';
  const m = value.match(/\d{4}\s*-\s*\d+/);
  if (m) return m[0];
  const m2 = value.match(/\d+/);
  return m2 ? m2[0] : '';
}

const MONTH_NAMES = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12',
  abril: '04',
  jan: '01',
  feb: '02',
  febuary: '02',
  fecruary: '02',
  mar: '03',
  apr: '04',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  sept: '09',
  oct: '10',
  nov: '11',
  dec: '12',
};

/**
 * Extract date from resolution description text.
 * Patterns: "Author: Hon. Name, 01/07/19", "dated January 31, 2019", "dated July 5,2019"
 */
function extractDateFromDescription(description) {
  if (!description) return '';

  // Trailing MM/DD/YY after author
  const slashDate = description.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})\)?\s*$/);
  if (slashDate) {
    const month = slashDate[1].padStart(2, '0');
    const day = slashDate[2].padStart(2, '0');
    let year = slashDate[3];
    if (year.length === 2) year = year < 50 ? `20${year}` : `19${year}`;
    return `${year}-${month}-${day}`;
  }

  // OCR sometimes drops the second slash: "AUTHOR: ..., 03/162020)"
  const compactSlashDate = description.match(
    /(\d{1,2})\/(\d{2})(\d{4})\)?\s*$/i
  );
  if (compactSlashDate) {
    const month = compactSlashDate[1].padStart(2, '0');
    const day = compactSlashDate[2].padStart(2, '0');
    const year = compactSlashDate[3];
    return `${year}-${month}-${day}`;
  }

  // Labeled month-name dates: "dated January 31,2019", "petsa Abril 6, 2026"
  const monthPattern = Object.keys(MONTH_NAMES).join('|');
  const labeledMonthDateRe = new RegExp(
    `(?:dated\\s+|petsa\\s+)(${monthPattern})\\.?\\s+(\\d{1,2}),?\\s*(\\d{4})`,
    'i'
  );
  const labeledMonthDate = description.match(labeledMonthDateRe);
  if (labeledMonthDate) {
    const month = MONTH_NAMES[labeledMonthDate[1].toLowerCase()];
    const day = labeledMonthDate[2].padStart(2, '0');
    const year = labeledMonthDate[3];
    return `${year}-${month}-${day}`;
  }

  // Month-name dates: "January 31, 2019"
  const monthDateRe = new RegExp(
    `(${monthPattern})\\.?\\s+(\\d{1,2}),?\\s+(\\d{4})`,
    'i'
  );
  const monthDate = description.match(monthDateRe);
  if (monthDate) {
    const month = MONTH_NAMES[monthDate[1].toLowerCase()];
    const day = monthDate[2].padStart(2, '0');
    const year = monthDate[3];
    return `${year}-${month}-${day}`;
  }

  return '';
}

/**
 * Extract author name from resolution description.
 * Pattern: "(Author: Hon. Name, MM/DD/YY)"
 */
function extractAuthorFromDescription(description) {
  if (!description) return '';
  const m = description.match(
    /\(Author:\s*(.+?),\s*\d{1,2}\/\d{1,2}\/\d{2,4}\)?/i
  );
  return m ? m[1].trim() : '';
}

/**
 * Strip trailing author+date suffix from description to get clean title.
 */
function stripAuthorDateSuffix(description) {
  if (!description) return '';
  return description.replace(/\s*\(Author:.+?\)\s*$/i, '').trim();
}

/**
 * Election boundary years where (OLD)/(NEW) turnover markers disambiguate term.
 * Philippine local elections: every 3 years, mid-year turnover.
 */
const ELECTION_YEARS = [2019, 2022, 2025];

/**
 * Infer term from document number containing YYYY-XX pattern.
 * Non-boundary years: year maps to exactly one term.
 * Boundary years: (OLD) = pre-election (term that ends mid-year), else post-election (term that starts mid-year).
 */
function inferTermFromNumber(value, terms, isOld) {
  const m = String(value ?? '').match(/(\d{4})\s*-\s*\d+/);
  if (!m) return '';
  const year = parseInt(m[1], 10);
  for (const term of terms) {
    const startY = new Date(term.start_date).getFullYear();
    const endY = new Date(term.end_date).getFullYear();
    if (ELECTION_YEARS.includes(year)) {
      if (isOld && endY === year) return term.id;
      if (!isOld && startY === year) return term.id;
    } else if (year >= startY && year <= endY) {
      return term.id;
    }
  }
  return '';
}

/**
 * Normalize fields based on source table shape.
 * Resolutions: number in combined_title_number, title in description, date in description text
 * Executive orders: number in combined_title_number, title in description, date_enacted present
 * Ordinances: direct fields, no remapping needed
 */
function normalizeSourceFields(row, sourceKey, terms) {
  const normalized = { ...row };
  const isOld = /\(old\)/i.test(normalized.combined_title_number || '');

  if (sourceKey === 'resolutions') {
    normalized.number = extractNumberFromCombined(
      normalized.combined_title_number
    );
    normalized.title = stripAuthorDateSuffix(normalized.description || '');
    normalized.date_enacted = extractDateFromDescription(
      normalized.description || ''
    );
    if (!normalized.date_enacted) {
      normalized._term_from_number = inferTermFromNumber(
        normalized.number,
        terms,
        isOld
      );
    }
    const author = extractAuthorFromDescription(normalized.description || '');
    if (author && !normalized.raw_author_text) {
      normalized.raw_author_text = author;
    }
  } else if (sourceKey === 'executive_orders') {
    normalized.number = extractNumberFromCombined(
      normalized.combined_title_number
    );
    if (!normalized.title) {
      normalized.title = normalized.description || '';
    }
  }

  return normalized;
}

function toStagedDocument(sourceRecord, terms) {
  const rawRow = sourceRecord.raw_payload_json ?? {};
  const row = normalizeSourceFields(rawRow, sourceRecord.source_key, terms);
  const documentType = normalizeType(row.type);
  const dateEnacted = String(row.date_enacted ?? '').trim();
  const termId =
    String(row.term_id ?? '').trim() ||
    inferTermId(dateEnacted, terms) ||
    String(row._term_from_number ?? '').trim();
  const normalizedNumber = normalizeNumber(row.number);
  const missing = [];

  for (const field of ['type', 'number', 'title', 'date_enacted']) {
    if (!String(row[field] ?? '').trim()) missing.push(field);
  }

  if (!termId) missing.push('term_id');

  return {
    id: `staged_${sourceRecord.id.replace(/^source_/, '')}`,
    source_record_id: sourceRecord.id,
    candidate_document_id: String(row.id ?? '').trim() || null,
    document_type: documentType,
    number: String(row.number ?? '').trim(),
    normalized_number: normalizedNumber,
    title: String(row.title ?? '').trim(),
    date_enacted: dateEnacted,
    pdf_url: String(row.pdf_url ?? '').trim(),
    term_id: termId,
    session_id: String(row.session_id ?? '').trim(),
    raw_author_text: String(row.raw_author_text ?? '').trim(),
    co_author_text: String(row.co_author_text ?? '').trim(),
    mover_text: String(row.moved_by ?? '').trim(),
    seconder_text: String(row.seconded_by ?? '').trim(),
    publication_status: 'active',
    verification_state: 'unverified',
    confidence_score: null,
    staging_status: missing.length ? 'needs_review' : 'new',
    review_reason: missing.length ? `missing:${missing.join(',')}` : null,
    turnover_marker: hasTurnoverMarker(rawRow),
    matching_key: [
      documentType,
      termId || 'unknown_term',
      normalizedNumber || 'unknown_number',
    ].join('|'),
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function toPersonRefs(stagedDocument, roster) {
  const refs = [];
  const fields = [
    ['author', stagedDocument.raw_author_text],
    ['co_author', stagedDocument.co_author_text],
    ['mover', stagedDocument.mover_text],
    ['seconder', stagedDocument.seconder_text],
  ];

  for (const [role, rawValue] of fields) {
    if (!rawValue) continue;

    if (role === 'author' && COLLECTIVE_PATTERN.test(rawValue)) {
      const termRoster = roster.find(r => r.term_id === stagedDocument.term_id);
      if (termRoster) {
        for (const member of termRoster.members) {
          if (member.role === 'Councilor' || member.role === 'Vice Mayor') {
            refs.push({
              id: `person_ref_${stagedDocument.id}_author_${refs.length + 1}`,
              staged_document_id: stagedDocument.id,
              role: 'author',
              raw_name: member.person_id,
              candidate_person_id: member.person_id,
              confidence_score: 0.9,
              resolution_status: 'matched',
              created_at: new Date().toISOString(),
            });
          }
        }
        continue;
      }
    }

    for (const rawName of splitNames(rawValue)) {
      refs.push({
        id: `person_ref_${stagedDocument.id}_${role}_${refs.length + 1}`,
        staged_document_id: stagedDocument.id,
        role,
        raw_name: rawName,
        candidate_person_id: null,
        confidence_score: null,
        resolution_status: 'unresolved',
        created_at: new Date().toISOString(),
      });
    }
  }

  return refs;
}

function main() {
  const args = parseArgs(process.argv);
  const sourceRecords = readJsonl(args.input);
  const terms = readJson(args.terms);
  const roster = readJson(args.roster);
  const documents = sourceRecords.map(record =>
    toStagedDocument(record, terms)
  );
  const personRefs = documents.flatMap(doc => toPersonRefs(doc, roster));

  writeJsonl(args.documentsOutput, documents);
  writeJsonl(args.personRefsOutput, personRefs);

  console.log(`Staged ${documents.length} document candidate(s)`);
  console.log(`Staged ${personRefs.length} person reference(s)`);
  console.log(`wrote ${args.documentsOutput}`);
  console.log(`wrote ${args.personRefsOutput}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
