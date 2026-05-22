#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DEFAULT_SOURCE = "pipeline/data/documents.csv";
const DEFAULT_TERMS = "pipeline/data/terms.csv";
const DEFAULT_OUT = "pipeline/output/openlgu-reconciliation-shadow.json";
const DEFAULT_MARKDOWN = "pipeline/output/openlgu-reconciliation-shadow.md";

function parseArgs(argv) {
  const args = {
    source: DEFAULT_SOURCE,
    terms: DEFAULT_TERMS,
    out: DEFAULT_OUT,
    markdown: DEFAULT_MARKDOWN,
    write: true,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === "--source" && next) {
      args.source = next;
      i += 1;
    } else if (arg === "--terms" && next) {
      args.terms = next;
      i += 1;
    } else if (arg === "--out" && next) {
      args.out = next;
      i += 1;
    } else if (arg === "--markdown" && next) {
      args.markdown = next;
      i += 1;
    } else if (arg === "--no-write" || arg === "--dry-run") {
      args.write = false;
    } else if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  return args;
}

function printHelp() {
  console.log(`Usage: node scripts/openlgu-reconcile.cjs [options]

Options:
  --source <path>     Scraped/staged document CSV. Default: ${DEFAULT_SOURCE}
  --terms <path>      Canonical term range CSV. Default: ${DEFAULT_TERMS}
  --out <path>        JSON report path. Default: ${DEFAULT_OUT}
  --markdown <path>   Markdown report path. Default: ${DEFAULT_MARKDOWN}
  --dry-run           Analyze only; do not write report files.
`);
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
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
    } else if (char === ",") {
      row.push(value);
      value = "";
    } else if (char === "\n") {
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else if (char !== "\r") {
      value += char;
    }
  }

  if (value.length > 0 || row.length > 0) {
    row.push(value);
    rows.push(row);
  }

  if (rows.length === 0) return [];

  const headers = rows[0].map((header) => header.trim());
  return rows
    .slice(1)
    .filter((fields) => fields.some((field) => field.trim().length > 0))
    .map((fields) => {
      const record = {};
      headers.forEach((header, index) => {
        record[header] = fields[index] ?? "";
      });
      return record;
    });
}

function loadCsv(filePath) {
  return parseCsv(fs.readFileSync(filePath, "utf8"));
}

function normalizeType(value) {
  return value.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function hasTurnoverMarker(record) {
  const haystack = [record.number, record.title, record.filename, record.pdf_url]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return /\((old|new)\)|\bold\b|\bnew\b/.test(haystack);
}

function normalizeNumber(value) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\((old|new)\)/g, "")
    .replace(/\b(resolution|ordinance|executive\s+order|order)\b/g, "")
    .replace(/\b(no|number)\b\.?/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function inferTermId(dateValue, terms) {
  if (!dateValue) return "";
  const date = Date.parse(dateValue);
  if (Number.isNaN(date)) return "";

  const term = terms.find((candidate) => {
    const start = Date.parse(candidate.start_date);
    const end = Date.parse(candidate.end_date);
    return !Number.isNaN(start) && !Number.isNaN(end) && date >= start && date <= end;
  });

  return term?.id ?? "";
}

function toStageRecord(record, terms) {
  const type = normalizeType(record.type ?? "");
  const normalizedNumber = normalizeNumber(record.number ?? "");
  const termId = record.term_id?.trim() || inferTermId(record.date_enacted, terms);

  return {
    id: record.id?.trim() || "",
    type,
    number: record.number?.trim() || "",
    normalized_number: normalizedNumber,
    title: record.title?.trim() || "",
    date_enacted: record.date_enacted?.trim() || "",
    term_id: termId,
    session_id: record.session_id?.trim() || "",
    pdf_url: record.pdf_url?.trim() || "",
    raw_author_text: record.raw_author_text?.trim() || "",
    filename: record.filename?.trim() || "",
    turnover_marker: hasTurnoverMarker(record),
    matching_key: [type, termId || "unknown_term", normalizedNumber || "unknown_number"].join("|"),
  };
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
  return [...new Set(records.map((record) => record[field]).filter(Boolean))];
}

function summarizeGaps(records) {
  const requiredFields = ["type", "number", "normalized_number", "title", "date_enacted", "term_id", "pdf_url"];
  const counts = Object.fromEntries(requiredFields.map((field) => [field, 0]));

  for (const record of records) {
    for (const field of requiredFields) {
      if (!record[field]) counts[field] += 1;
    }
  }

  return counts;
}

function detectCollisions(records) {
  return [...groupBy(records, (record) => record.matching_key).entries()]
    .filter(([, group]) => group.length > 1)
    .map(([matchingKey, group]) => ({
      matching_key: matchingKey,
      count: group.length,
      ids: uniqueValues(group, "id"),
      dates: uniqueValues(group, "date_enacted"),
      pdf_urls: uniqueValues(group, "pdf_url"),
      titles: uniqueValues(group, "title"),
      has_turnover_marker: group.some((record) => record.turnover_marker),
      collision_type: classifyCollision(group),
    }));
}

function classifyCollision(group) {
  if (group.some((record) => record.turnover_marker)) return "turnover_marker";
  if (uniqueValues(group, "pdf_url").length > 1) return "same_key_different_pdf";
  if (uniqueValues(group, "title").length > 1) return "same_key_different_title";
  return "duplicate_source_row";
}

function buildReport(sourcePath, termPath) {
  const rawDocuments = loadCsv(sourcePath);
  const terms = loadCsv(termPath);
  const records = rawDocuments.map((record) => toStageRecord(record, terms));
  const collisions = detectCollisions(records);
  const gaps = summarizeGaps(records);
  const byType = Object.fromEntries(
    [...groupBy(records, (record) => record.type || "unknown").entries()].map(([key, group]) => [key, group.length]),
  );
  const byTerm = Object.fromEntries(
    [...groupBy(records, (record) => record.term_id || "unknown").entries()].map(([key, group]) => [key, group.length]),
  );

  return {
    generated_at: new Date().toISOString(),
    mode: "shadow",
    source_path: sourcePath,
    term_path: termPath,
    totals: {
      source_rows: rawDocuments.length,
      staged_records: records.length,
      collisions: collisions.length,
      records_in_collision: collisions.reduce((total, collision) => total + collision.count, 0),
      turnover_marked_records: records.filter((record) => record.turnover_marker).length,
    },
    by_type: byType,
    by_term: byTerm,
    missing_fields: gaps,
    collisions,
  };
}

function renderMarkdown(report) {
  const collisionRows = report.collisions
    .slice(0, 50)
    .map((collision) =>
      [
        collision.matching_key,
        collision.count,
        collision.collision_type,
        collision.has_turnover_marker ? "yes" : "no",
        collision.ids.slice(0, 3).join(", "),
      ].join(" | "),
    )
    .join("\n");

  return `# OpenLGU Reconciliation Shadow Report

Generated: ${report.generated_at}

Mode: shadow, no canonical D1 writes.

## Summary

- Source rows: ${report.totals.source_rows}
- Staged records: ${report.totals.staged_records}
- Collision groups: ${report.totals.collisions}
- Records in collision: ${report.totals.records_in_collision}
- Turnover-marked records: ${report.totals.turnover_marked_records}

## Missing Fields

${Object.entries(report.missing_fields)
  .map(([field, count]) => `- ${field}: ${count}`)
  .join("\n")}

## By Type

${Object.entries(report.by_type)
  .map(([type, count]) => `- ${type}: ${count}`)
  .join("\n")}

## By Term

${Object.entries(report.by_term)
  .map(([term, count]) => `- ${term}: ${count}`)
  .join("\n")}

## Collision Sample

matching_key | count | collision_type | turnover_marker | sample_ids
--- | ---: | --- | --- | ---
${collisionRows || "_No collisions found._"}
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
  const report = buildReport(args.source, args.terms);

  console.log(
    [
      `OpenLGU shadow reconciliation`,
      `source_rows=${report.totals.source_rows}`,
      `collisions=${report.totals.collisions}`,
      `records_in_collision=${report.totals.records_in_collision}`,
      `turnover_marked_records=${report.totals.turnover_marked_records}`,
    ].join(" "),
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
