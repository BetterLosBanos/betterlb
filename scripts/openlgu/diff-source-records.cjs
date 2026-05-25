#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const DEFAULT_OUTPUT_ROOT = 'pipeline/openlgu/sources';

const SOURCE_KEYS = ['resolutions', 'ordinances', 'executive_orders'];

// --- CLI ---

function parseArgs(argv) {
  const args = {
    source: null,
    outputRoot: DEFAULT_OUTPUT_ROOT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--source' && next) {
      args.source = next;
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
  console.log(`Usage: node scripts/openlgu/diff-source-records.cjs [options]

Compares previous latest/ source records against the latest run for each source.

Options:
  --source <key>          Diff single source only (resolutions|ordinances|executive_orders)
  --output-root <path>    Output root directory. Default: ${DEFAULT_OUTPUT_ROOT}
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

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// --- Diff logic ---

function findLatestRunDir(sourceDir) {
  const runsDir = path.join(sourceDir, 'runs');
  if (!fs.existsSync(runsDir)) return null;

  const entries = fs
    .readdirSync(runsDir)
    .filter(name => {
      const runPath = path.join(runsDir, name);
      return (
        fs.statSync(runPath).isDirectory() &&
        fs.existsSync(path.join(runPath, 'source-records.jsonl'))
      );
    })
    .sort();

  return entries.length
    ? path.join(runsDir, entries[entries.length - 1])
    : null;
}

function findPreviousRunDir(sourceDir) {
  const runsDir = path.join(sourceDir, 'runs');
  if (!fs.existsSync(runsDir)) return null;

  const entries = fs
    .readdirSync(runsDir)
    .filter(name => {
      const runPath = path.join(runsDir, name);
      return (
        fs.statSync(runPath).isDirectory() &&
        fs.existsSync(path.join(runPath, 'source-records.jsonl'))
      );
    })
    .sort();

  // Second-to-last successful run
  return entries.length >= 2
    ? path.join(runsDir, entries[entries.length - 2])
    : null;
}

function computeDiff(previous, current) {
  const prevById = new Map(previous.map(r => [r.id, r]));
  const currById = new Map(current.map(r => [r.id, r]));

  const diff = [];

  // Current records: new, changed, or unchanged
  for (const record of current) {
    const prev = prevById.get(record.id);
    if (!prev) {
      diff.push({
        source_record_id: record.id,
        change_type: 'new',
        decision: 'stage_new',
        reason: 'new_record',
        previous_hash: null,
        current_hash: record.content_hash,
      });
    } else if (prev.content_hash !== record.content_hash) {
      diff.push({
        source_record_id: record.id,
        change_type: 'changed',
        decision: 'stage_for_reconciliation',
        reason: 'content_hash_changed',
        previous_hash: prev.content_hash,
        current_hash: record.content_hash,
      });
    } else {
      diff.push({
        source_record_id: record.id,
        change_type: 'unchanged',
        decision: 'skip',
        reason: 'unchanged',
        previous_hash: prev.content_hash,
        current_hash: record.content_hash,
      });
    }
  }

  // Previous records not in current: missing
  for (const record of previous) {
    if (!currById.has(record.id)) {
      diff.push({
        source_record_id: record.id,
        change_type: 'missing',
        decision: 'candidate_missing_from_source',
        reason: 'disappeared_from_source',
        previous_hash: record.content_hash,
        current_hash: null,
      });
    }
  }

  return diff;
}

function summarizeDiff(diff) {
  const counts = { new: 0, changed: 0, unchanged: 0, missing: 0 };
  for (const entry of diff) {
    counts[entry.change_type] = (counts[entry.change_type] || 0) + 1;
  }
  return counts;
}

function renderDiffMarkdown(sourceKey, diff, counts) {
  const sampleRows = diff
    .filter(d => d.change_type !== 'unchanged')
    .slice(0, 50)
    .map(d =>
      [
        d.source_record_id.slice(0, 40),
        d.change_type,
        d.decision,
        d.reason,
      ].join(' | ')
    )
    .join('\n');

  return `## Source Diff: ${sourceKey}

Generated: ${new Date().toISOString()}

### Summary

| Type | Count |
|---|---:|
| New | ${counts.new} |
| Changed | ${counts.changed} |
| Unchanged | ${counts.unchanged} |
| Missing | ${counts.missing} |

### Actionable Records

source_record_id | change_type | decision | reason
--- | --- | --- | ---
${sampleRows || '_No actionable records._'}
`;
}

// --- Main ---

function main() {
  const args = parseArgs(process.argv);
  const keys = args.source ? [args.source] : SOURCE_KEYS;

  for (const key of keys) {
    const sourceDir = path.join(args.outputRoot, key);
    console.log(`[${key}] Computing diff...`);

    // Load previous successful run (second-to-last)
    const previousRunDir = findPreviousRunDir(sourceDir);
    const currentRunDir = findLatestRunDir(sourceDir);
    if (!currentRunDir) {
      console.log(`  No successful runs found, skipping`);
      continue;
    }

    // If no previous run, everything is "new"
    const previousPath = previousRunDir
      ? path.join(previousRunDir, 'source-records.jsonl')
      : null;
    const previous = previousPath ? readJsonl(previousPath) : [];

    // Load current successful run
    const currentPath = path.join(currentRunDir, 'source-records.jsonl');
    const current = readJsonl(currentPath);

    if (!previous.length && !current.length) {
      console.log(`  No source records found`);
      continue;
    }

    const diff = computeDiff(previous, current);
    const counts = summarizeDiff(diff);

    console.log(
      `  new=${counts.new} changed=${counts.changed} unchanged=${counts.unchanged} missing=${counts.missing}`
    );

    // Write outputs
    const ts = timestampSlug();
    const diffDir = path.join(sourceDir, 'diffs', ts);
    fs.mkdirSync(diffDir, { recursive: true });

    const report = {
      generated_at: new Date().toISOString(),
      source_key: key,
      previous_path: previousPath,
      current_path: currentPath,
      counts,
      diff: diff.filter(d => d.change_type !== 'unchanged'),
      total_records: diff.length,
    };

    fs.writeFileSync(
      path.join(diffDir, 'source-diff.json'),
      `${JSON.stringify(report, null, 2)}\n`
    );
    fs.writeFileSync(
      path.join(diffDir, 'source-diff.md'),
      renderDiffMarkdown(key, diff, counts)
    );

    console.log(`  Wrote ${diffDir}`);
  }
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
