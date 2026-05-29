#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const COLLECTOR_VERSION = 'facebook-post-collector-v1';
const SOURCE_KEY = 'losbanos_facebook_sessions';
const DEFAULT_INPUT_DIR = 'pipeline/openlgu/fixtures/facebook';
const DEFAULT_OUTPUT_ROOT = 'pipeline/openlgu/sources';

const TYPE_MAP = {
  RESOLUTION: 'resolution',
  ORDINANCE: 'ordinance',
  KAPASIYAHAN: 'resolution',
};

const DOC_BOUNDARY =
  /^\d+\.\s+(RESOLUTION|ORDINANCE|KAPASIYAHAN)\s+(NO\.|BLG\.)\s*/i;

const AUTHOR_RE =
  /^(AUTHOR(S)?\s*:|CO-AUTHOR\s*:|AUTHOR\s*\(S\)\s*:|AUTHORS\s*:)\s*(.+)/i;
const MOVER_RE = /^(MOVED\s+BY\s*:|MOVE\s+BY\s*:)\s*(.+)/i;
const SECONDER_RE = /^SECONDED\s+BY\s*:?\s*(.+)/i;

// --- Args ---

function parseArgs(argv) {
  const args = {
    inputDir: DEFAULT_INPUT_DIR,
    outputRoot: DEFAULT_OUTPUT_ROOT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--input-dir' && next) {
      args.inputDir = next;
      i += 1;
    } else if (arg === '--output-root' && next) {
      args.outputRoot = next;
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
  console.log(`Usage: node scripts/openlgu/collect-facebook-posts.cjs [options]

Parses normalized Facebook session text files into per-document source records.
Reads .txt files from input directory, outputs JSONL for the staging pipeline.

Options:
  --input-dir <path>     Facebook fixture directory. Default: ${DEFAULT_INPUT_DIR}
  --output-root <path>   Pipeline sources directory. Default: ${DEFAULT_OUTPUT_ROOT}
`);
}

// --- Utilities ---

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

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// --- Session header parsing ---

function parseSessionLine(line) {
  const match = line.match(
    /^(inaugural session|\d+(st|nd|rd|th)\s+(regular|special)\s+session)\s+\/\s+(\d{4}-\d{2}-\d{2})$/i
  );
  if (!match) return null;

  if (/inaugural/i.test(match[1])) {
    return { ordinal: 0, type: 'inaugural', date: match[4] };
  }

  const ordinal = parseInt(match[1], 10);
  const suffix = match[2].toLowerCase();
  const type = match[3].toLowerCase();

  return { ordinal, type, date: match[4] };
}

// --- Document parsing ---

function parseDocType(firstLine) {
  const match = firstLine.match(
    /^\d+\.\s+(RESOLUTION|ORDINANCE|KAPASIYAHAN)\s+(NO\.|BLG\.)\s*(.+)/i
  );
  if (!match) return null;

  const rawType = match[1].toUpperCase();
  const docType = TYPE_MAP[rawType] || rawType.toLowerCase();
  const number = match[3].trim();

  return { type: docType, number };
}

function extractFields(lines) {
  const result = {
    raw_author_text: '',
    co_author_text: '',
    moved_by: '',
    seconded_by: '',
    titleLines: [],
  };

  let titleDone = false;

  for (const line of lines) {
    const authorMatch = line.match(AUTHOR_RE);
    if (authorMatch) {
      titleDone = true;
      const isCoAuthor = /CO-AUTHOR/i.test(authorMatch[1]);
      const name = authorMatch[3].trim();
      if (isCoAuthor) {
        result.co_author_text = name;
      } else {
        result.raw_author_text = name;
      }
      continue;
    }

    const moverMatch = line.match(MOVER_RE);
    if (moverMatch) {
      titleDone = true;
      result.moved_by = moverMatch[2].trim();
      continue;
    }

    const seconderMatch = line.match(SECONDER_RE);
    if (seconderMatch) {
      titleDone = true;
      result.seconded_by = seconderMatch[1].trim();
      continue;
    }

    if (!titleDone) {
      result.titleLines.push(line);
    }
  }

  result.title = result.titleLines.join(' ').replace(/\s+/g, ' ').trim();

  return result;
}

function parseFile(filePath) {
  const text = fs.readFileSync(filePath, 'utf8');
  const lines = text.split(/\r?\n/).filter(l => l.trim());

  if (lines.length === 0) return [];

  const session = parseSessionLine(lines[0]);
  if (!session) {
    console.warn(
      `  SKIP ${path.basename(filePath)}: unparseable session line: "${lines[0].slice(0, 80)}"`
    );
    return [];
  }

  // Find document boundaries
  const boundaries = [];
  for (let i = 1; i < lines.length; i += 1) {
    if (DOC_BOUNDARY.test(lines[i])) {
      boundaries.push(i);
    }
  }

  if (boundaries.length === 0) {
    console.warn(`  SKIP ${path.basename(filePath)}: no documents found`);
    return [];
  }

  const docs = [];

  for (let b = 0; b < boundaries.length; b += 1) {
    const start = boundaries[b];
    const end = b + 1 < boundaries.length ? boundaries[b + 1] : lines.length;

    const docLines = lines.slice(start, end);
    const typeInfo = parseDocType(docLines[0]);
    if (!typeInfo) continue;

    const fieldLines = docLines.slice(1);
    const fields = extractFields(fieldLines);

    docs.push({
      type: typeInfo.type,
      number: typeInfo.number,
      title: fields.title,
      date_enacted: session.date,
      pdf_url: '',
      session_ordinal: session.ordinal,
      session_type: session.type,
      session_date: session.date,
      raw_author_text: fields.raw_author_text,
      co_author_text: fields.co_author_text,
      moved_by: fields.moved_by,
      seconded_by: fields.seconded_by,
      source_snapshot: docLines.join('\n'),
    });
  }

  return docs;
}

// --- Content hashing ---

function computeContentHash(payload) {
  const hashFields = {
    type: payload.type,
    number: payload.number,
    title: payload.title,
    session_ordinal: payload.session_ordinal,
    session_type: payload.session_type,
    session_date: payload.session_date,
    raw_author_text: payload.raw_author_text,
    co_author_text: payload.co_author_text,
    moved_by: payload.moved_by,
    seconded_by: payload.seconded_by,
  };

  const sorted = Object.keys(hashFields)
    .sort()
    .map(k => `${k}=${hashFields[k]}`)
    .join('&');

  return crypto.createHash('sha256').update(sorted).digest('hex');
}

function toSourceRecord(rawPayload, runId) {
  const contentHash = computeContentHash(rawPayload);
  const hashSlug = contentHash.slice(0, 20);
  const now = new Date().toISOString();

  // Strip source_snapshot from raw_payload_json (preserved in raw_text)
  const { source_snapshot, ...payloadForRecord } = rawPayload;

  return {
    id: `src_${SOURCE_KEY}_${hashSlug}`,
    source_kind: 'facebook_post',
    source_key: SOURCE_KEY,
    source_url: '',
    content_hash: contentHash,
    collector_version: COLLECTOR_VERSION,
    raw_payload_json: payloadForRecord,
    raw_text: source_snapshot || '',
    pdf_url: '',
    pdf_reachability: null,
    pdf_redirect_url: null,
    pdf_checked_at: null,
    run_id: runId,
    first_seen_at: now,
    last_seen_at: now,
  };
}

// --- Run output ---

function writeRunOutput(sourceKey, manifest, records, outputRoot) {
  const sourceDir = path.join(outputRoot, sourceKey);
  const ts = timestampSlug();
  const runDir = path.join(sourceDir, 'runs', ts);

  fs.mkdirSync(runDir, { recursive: true });

  fs.writeFileSync(
    path.join(runDir, 'run.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  if (manifest.status === 'success') {
    writeJsonl(path.join(runDir, 'source-records.jsonl'), records);

    const latestDir = path.join(sourceDir, 'latest');
    fs.mkdirSync(latestDir, { recursive: true });
    fs.writeFileSync(
      path.join(latestDir, 'run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
    writeJsonl(path.join(latestDir, 'source-records.jsonl'), records);
  } else {
    fs.writeFileSync(
      path.join(sourceDir, 'last-failed-run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
  }
}

// --- Main ---

function main() {
  const args = parseArgs(process.argv);
  const runId = `run_${timestampSlug()}`;
  const startedAt = new Date().toISOString();

  if (!fs.existsSync(args.inputDir)) {
    throw new Error(`Input directory not found: ${args.inputDir}`);
  }

  const files = fs
    .readdirSync(args.inputDir)
    .filter(f => f.endsWith('.txt'))
    .sort()
    .map(f => path.join(args.inputDir, f));

  if (files.length === 0) {
    throw new Error(`No .txt files found in ${args.inputDir}`);
  }

  console.log(
    `Processing ${files.length} session file(s) from ${args.inputDir}`
  );

  const allRecords = [];
  let totalDocs = 0;
  let skippedFiles = 0;

  for (const f of files) {
    const docs = parseFile(f);
    if (docs.length === 0) {
      skippedFiles += 1;
      continue;
    }

    console.log(`  ${path.basename(f)} — ${docs.length} document(s)`);
    totalDocs += docs.length;

    for (const doc of docs) {
      allRecords.push(toSourceRecord(doc, runId));
    }
  }

  const finishedAt = new Date().toISOString();
  const manifest = {
    source_key: SOURCE_KEY,
    status: 'success',
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: new Date(finishedAt) - new Date(startedAt),
    collector_version: COLLECTOR_VERSION,
    counts: {
      files_processed: files.length,
      files_skipped: skippedFiles,
      documents_extracted: totalDocs,
      source_records_emitted: allRecords.length,
    },
  };

  writeRunOutput(SOURCE_KEY, manifest, allRecords, args.outputRoot);

  console.log(
    `Extracted ${totalDocs} document(s) from ${files.length - skippedFiles}/${files.length} file(s)`
  );
  console.log(`Emitted ${allRecords.length} source record(s)`);
  console.log(`Output: ${path.join(args.outputRoot, SOURCE_KEY, 'latest')}`);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
