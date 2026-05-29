#!/usr/bin/env node

const crypto = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_INPUT = 'pipeline/data/documents.csv';
const DEFAULT_OUTPUT = 'pipeline/openlgu/source-records.jsonl';
const SOURCE_ID = 'legacy_manual_documents_csv';

function parseArgs(argv) {
  const args = {
    input: DEFAULT_INPUT,
    output: DEFAULT_OUTPUT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--input' && next) {
      args.input = next;
      i += 1;
    } else if (arg === '--output' && next) {
      args.output = next;
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
  console.log(`Usage: node scripts/openlgu/collect-source-records.cjs [options]

Converts the legacy manually edited documents CSV into source-record JSONL.
This preserves what was observed or manually staged. It does not write canonical D1.

Options:
  --input <path>    Legacy/manual staging CSV. Default: ${DEFAULT_INPUT}
  --output <path>   Source record JSONL output. Default: ${DEFAULT_OUTPUT}
`);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = '';
  let quoted = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (quoted) {
      if (char === '"' && next === '"') {
        value += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        value += char;
      }
      continue;
    }

    if (char === '"') {
      quoted = true;
    } else if (char === ',') {
      row.push(value);
      value = '';
    } else if (char === '\n') {
      row.push(value);
      rows.push(row);
      row = [];
      value = '';
    } else if (char !== '\r') {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map(header => header.trim());
  return rows
    .slice(1)
    .filter(fields => fields.some(field => field.trim().length > 0))
    .map((fields, index) => {
      const record = { _row_number: index + 2 };
      headers.forEach((header, fieldIndex) => {
        record[header] = fields[fieldIndex] ?? '';
      });
      return record;
    });
}

function stableHash(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function toSourceRecord(row, inputPath) {
  const payload = { ...row };
  delete payload._row_number;

  const sourceRecordId = row.id?.trim() || `row_${row._row_number}`;
  const payloadJson = JSON.stringify(payload);
  const contentHash = stableHash(payloadJson);
  const id = `source_${SOURCE_ID}_${stableHash(`${sourceRecordId}:${contentHash}`).slice(0, 20)}`;

  return {
    id,
    scrape_run_id: null,
    source_id: SOURCE_ID,
    source_record_id: sourceRecordId,
    source_url: row.pdf_url?.trim() || null,
    source_kind: 'manual_entry',
    entity_type: 'document',
    content_hash: contentHash,
    raw_payload_json: payload,
    raw_text: null,
    source_updated_at: null,
    captured_at: new Date().toISOString(),
    parsed_status: 'pending',
    parse_error: null,
    _source_file: inputPath,
    _source_row_number: row._row_number,
  };
}

function writeJsonl(filePath, records) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    `${records.map(record => JSON.stringify(record)).join('\n')}\n`
  );
}

function main() {
  const args = parseArgs(process.argv);
  const rows = parseCsv(fs.readFileSync(args.input, 'utf8'));
  const records = rows.map(row => toSourceRecord(row, args.input));

  writeJsonl(args.output, records);

  console.log(`Collected ${records.length} source record(s)`);
  console.log(`wrote ${args.output}`);
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
