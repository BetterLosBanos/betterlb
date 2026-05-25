#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_STAGED_DOCUMENTS = 'pipeline/openlgu/staged-documents.jsonl';
const DEFAULT_OUT = 'pipeline/openlgu/reconciliation-shadow.json';
const DEFAULT_MARKDOWN = 'pipeline/openlgu/reconciliation-shadow.md';

function parseArgs(argv) {
  const args = {
    stagedDocuments: DEFAULT_STAGED_DOCUMENTS,
    out: DEFAULT_OUT,
    markdown: DEFAULT_MARKDOWN,
    write: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--staged-documents' && next) {
      args.stagedDocuments = next;
      i += 1;
    } else if (arg === '--out' && next) {
      args.out = next;
      i += 1;
    } else if (arg === '--markdown' && next) {
      args.markdown = next;
      i += 1;
    } else if (arg === '--no-write' || arg === '--dry-run') {
      args.write = false;
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
  console.log(`Usage: node scripts/openlgu/reconcile-shadow.cjs [options]

Analyzes staged documents in shadow mode. It does not write canonical D1.

Options:
  --staged-documents <path>    Staged document JSONL. Default: ${DEFAULT_STAGED_DOCUMENTS}
  --out <path>                 JSON report path. Default: ${DEFAULT_OUT}
  --markdown <path>            Markdown report path. Default: ${DEFAULT_MARKDOWN}
  --dry-run                    Analyze only; do not write report files.
`);
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function groupBy(records, keyFn) {
  const groups = new Map();
  for (const record of records) {
    const key = keyFn(record);
    const group = groups.get(key) ?? [];
    group.push(record);
    groups.set(key, group);
  }
  return groups;
}

function uniqueValues(records, field) {
  return [...new Set(records.map(record => record[field]).filter(Boolean))];
}

function summarizeGaps(records) {
  const requiredFields = [
    'document_type',
    'number',
    'normalized_number',
    'title',
    'date_enacted',
    'term_id',
    'pdf_url',
  ];
  const counts = Object.fromEntries(requiredFields.map(field => [field, 0]));

  for (const record of records) {
    for (const field of requiredFields) {
      if (!record[field]) counts[field] += 1;
    }
  }

  return counts;
}

function classifyCollision(group) {
  if (group.some(record => record.turnover_marker)) return 'turnover_marker';
  if (uniqueValues(group, 'pdf_url').length > 1)
    return 'same_key_different_pdf';
  if (uniqueValues(group, 'title').length > 1)
    return 'same_key_different_title';
  return 'duplicate_source_row';
}

function detectCollisions(records) {
  return [...groupBy(records, record => record.matching_key).entries()]
    .filter(([, group]) => group.length > 1)
    .map(([matchingKey, group]) => ({
      matching_key: matchingKey,
      count: group.length,
      staged_document_ids: uniqueValues(group, 'id'),
      candidate_document_ids: uniqueValues(group, 'candidate_document_id'),
      dates: uniqueValues(group, 'date_enacted'),
      pdf_urls: uniqueValues(group, 'pdf_url'),
      titles: uniqueValues(group, 'title'),
      has_turnover_marker: group.some(record => record.turnover_marker),
      collision_type: classifyCollision(group),
    }));
}

function buildReport(stagedDocumentsPath) {
  const records = readJsonl(stagedDocumentsPath);
  const collisions = detectCollisions(records);

  return {
    generated_at: new Date().toISOString(),
    mode: 'shadow',
    staged_documents_path: stagedDocumentsPath,
    totals: {
      staged_documents: records.length,
      needs_review: records.filter(
        record => record.staging_status === 'needs_review'
      ).length,
      collisions: collisions.length,
      records_in_collision: collisions.reduce(
        (total, collision) => total + collision.count,
        0
      ),
      turnover_marked_records: records.filter(record => record.turnover_marker)
        .length,
    },
    by_type: Object.fromEntries(
      [
        ...groupBy(
          records,
          record => record.document_type || 'unknown'
        ).entries(),
      ].map(([key, group]) => [key, group.length])
    ),
    by_term: Object.fromEntries(
      [
        ...groupBy(records, record => record.term_id || 'unknown').entries(),
      ].map(([key, group]) => [key, group.length])
    ),
    missing_fields: summarizeGaps(records),
    collisions,
  };
}

function renderMarkdown(report) {
  const collisionRows = report.collisions
    .slice(0, 50)
    .map(collision =>
      [
        collision.matching_key,
        collision.count,
        collision.collision_type,
        collision.has_turnover_marker ? 'yes' : 'no',
        collision.candidate_document_ids.slice(0, 3).join(', '),
      ].join(' | ')
    )
    .join('\n');

  return `# OpenLGU Reconciliation Shadow Report

Generated: ${report.generated_at}

Mode: shadow, no canonical D1 writes.

## Summary

- Staged documents: ${report.totals.staged_documents}
- Needs review: ${report.totals.needs_review}
- Collision groups: ${report.totals.collisions}
- Records in collision: ${report.totals.records_in_collision}
- Turnover-marked records: ${report.totals.turnover_marked_records}

## Missing Fields

${Object.entries(report.missing_fields)
  .map(([field, count]) => `- ${field}: ${count}`)
  .join('\n')}

## By Type

${Object.entries(report.by_type)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join('\n')}

## By Term

${Object.entries(report.by_term)
  .map(([term, count]) => `- ${term}: ${count}`)
  .join('\n')}

## Collision Sample

matching_key | count | collision_type | turnover_marker | sample_candidate_ids
--- | ---: | --- | --- | ---
${collisionRows || '_No collisions found._'}
`;
}

function writeReport(report, outPath, markdownPath) {
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.mkdirSync(path.dirname(markdownPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`);
  fs.writeFileSync(markdownPath, renderMarkdown(report));
}

function main() {
  const args = parseArgs(process.argv);
  const report = buildReport(args.stagedDocuments);

  console.log(
    [
      'OpenLGU shadow reconciliation',
      `staged_documents=${report.totals.staged_documents}`,
      `needs_review=${report.totals.needs_review}`,
      `collisions=${report.totals.collisions}`,
      `records_in_collision=${report.totals.records_in_collision}`,
      `turnover_marked_records=${report.totals.turnover_marked_records}`,
    ].join(' ')
  );

  if (args.write) {
    writeReport(report, args.out, args.markdown);
    console.log(`wrote ${args.out}`);
    console.log(`wrote ${args.markdown}`);
  }
}

try {
  main();
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
