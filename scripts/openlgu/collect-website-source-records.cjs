#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

const cheerio = require('cheerio');

const COLLECTOR_VERSION = 'losbanos-website-collector-v1';
const DEFAULT_OUTPUT_ROOT = 'pipeline/openlgu/sources';

const SOURCES = [
  {
    key: 'resolutions',
    label: 'Resolutions',
    url: 'https://losbanos.gov.ph/municipal_resolutions',
    table_selector: 'table#table1',
    fallback_selectors: ['table#dataTable', 'table.dataTable'],
    expected_columns: 4,
    column_mappings: [
      { header_pattern: /^id$/i, field: 'number' },
      { header_pattern: /title|number/i, field: 'combined_title_number' },
      { header_pattern: /description/i, field: 'description' },
      { header_pattern: /action/i, field: 'pdf_url', is_link: true },
    ],
    document_type: 'resolution',
    min_rows: 1000,
  },
  {
    key: 'ordinances',
    label: 'Ordinances',
    url: 'https://losbanos.gov.ph/ordinance',
    table_selector: 'table#table1',
    fallback_selectors: ['table#dataTable', 'table.dataTable'],
    expected_columns: 6,
    column_mappings: [
      { header_pattern: /ordinance\s*no/i, field: 'number' },
      { header_pattern: /date\s*enacted/i, field: 'date_enacted' },
      { header_pattern: /committee/i, field: 'committees' },
      { header_pattern: /^title$/i, field: 'title' },
      { header_pattern: /author/i, field: 'raw_author_text' },
      { header_pattern: /action/i, field: 'pdf_url', is_link: true },
    ],
    document_type: 'ordinance',
    min_rows: 500,
  },
  {
    key: 'executive_orders',
    label: 'Executive Orders',
    url: 'https://losbanos.gov.ph/executive',
    table_selector: 'table#table1',
    fallback_selectors: ['table#dataTable', 'table.dataTable'],
    expected_columns: 4,
    column_mappings: [
      { header_pattern: /^title$/i, field: 'combined_title_number' },
      { header_pattern: /description/i, field: 'description' },
      { header_pattern: /created\s*at|date/i, field: 'date_enacted' },
      { header_pattern: /action/i, field: 'pdf_url', is_link: true },
    ],
    document_type: 'executive_order',
    min_rows: 50,
  },
];

// --- CLI ---

function parseArgs(argv) {
  const args = {
    source: null,
    htmlDir: null,
    saveHtmlDir: null,
    outputRoot: DEFAULT_OUTPUT_ROOT,
  };

  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    const next = argv[i + 1];

    if (arg === '--source' && next) {
      args.source = next;
      i += 1;
    } else if (arg === '--html-dir' && next) {
      args.htmlDir = next;
      i += 1;
    } else if (arg === '--save-html-dir' && next) {
      args.saveHtmlDir = next;
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
  console.log(`Usage: node scripts/openlgu/collect-website-source-records.cjs [options]

Fetches losbanos.gov.ph legislative tables, parses rows, emits source-record JSONL.

Options:
  --source <key>          Collect single source only (resolutions|ordinances|executive_orders)
  --html-dir <path>       Read saved HTML fixtures instead of live fetch
  --save-html-dir <path>  Save fetched HTML to disk for fixture generation
  --output-root <path>    Output root directory. Default: ${DEFAULT_OUTPUT_ROOT}
`);
}

// --- Utilities ---

function writeJsonl(filePath, records) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(
    filePath,
    records.length ? `${records.map(r => JSON.stringify(r)).join('\n')}\n` : ''
  );
}

function readJsonl(filePath) {
  if (!fs.existsSync(filePath)) return [];
  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function timestampSlug() {
  return new Date().toISOString().replace(/[:.]/g, '-');
}

// --- HTTP ---

async function fetchWithRetry(url, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt += 1) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 30000);

      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.status === 429) {
        const retryAfter = res.headers.get('retry-after');
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : Math.pow(2, attempt) * 1000;
        if (attempt < retries) {
          console.log(`  HTTP 429, retry ${attempt}/${retries} in ${waitMs}ms`);
          await delay(waitMs);
          continue;
        }
        throw new Error(`HTTP 429 after ${retries} attempts`);
      }

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }

      return await res.text();
    } catch (err) {
      if (err.name === 'AbortError') {
        throw new Error(
          `Request timeout after 30s (attempt ${attempt}/${retries})`
        );
      }
      if (attempt < retries) {
        const waitMs = Math.pow(2, attempt) * 1000;
        console.log(
          `  ${err.message}, retry ${attempt}/${retries} in ${waitMs}ms`
        );
        await delay(waitMs);
        continue;
      }
      throw err;
    }
  }
}

// --- Content hash ---

function normalizeUrl(url) {
  return String(url ?? '')
    .trim()
    .toLowerCase()
    .replace(/#.*$/, '')
    .replace(/\/+$/, '');
}

function normalizeCellValue(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function computeContentHash(sourceKind, sourceUrl, rawPayload) {
  const input = { source_kind: sourceKind, source_url: sourceUrl };
  for (const key of Object.keys(rawPayload).sort()) {
    input[key] = normalizeCellValue(rawPayload[key]);
  }
  if (rawPayload.pdf_url) {
    input.pdf_url = normalizeUrl(rawPayload.pdf_url);
  }
  const serialized = JSON.stringify(input, Object.keys(input).sort());
  return `sha256:${crypto.createHash('sha256').update(serialized).digest('hex')}`;
}

// --- PDF link checking ---

async function checkPdfUrls(urls) {
  const results = new Map();
  const unique = [...new Set(urls.filter(Boolean).map(normalizeUrl))];

  console.log(`  Checking ${unique.length} unique PDF URL(s)...`);

  for (const url of unique) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 15000);
      const res = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (res.ok) {
        const location = res.redirected ? res.url : null;
        results.set(url, {
          reachability: res.redirected ? 'redirect' : 'reachable',
          redirect_url: location,
        });
      } else if (res.status === 404) {
        results.set(url, { reachability: 'dead', redirect_url: null });
      } else {
        results.set(url, { reachability: 'error', redirect_url: null });
      }
    } catch {
      results.set(url, { reachability: 'error', redirect_url: null });
    }
    await delay(2000);
  }

  return results;
}

// --- HTML parsing ---

function findTable($, source) {
  let table = $(source.table_selector);
  if (table.length) return table;

  for (const sel of source.fallback_selectors) {
    table = $(sel);
    if (table.length) return table;
  }

  return null;
}

function getHeaderCells(table, $) {
  // Try <thead> first
  let cells = table.find('thead tr:first th');
  if (cells.length) return cells;

  // Fallback: first <tr> cells (may be <th> or <td>)
  cells = table.find('tr:first th');
  if (cells.length) return cells;

  return table.find('tr:first td');
}

function matchColumns(table, source, $) {
  const headerCells = getHeaderCells(table, $);
  const headerTexts = [];
  headerCells.each((_i, el) => {
    headerTexts.push($(el).text().trim());
  });

  const columnMap = new Map();

  for (const mapping of source.column_mappings) {
    let matched = false;
    for (let i = 0; i < headerTexts.length; i += 1) {
      if (mapping.header_pattern.test(headerTexts[i])) {
        columnMap.set(mapping.field, { index: i, mapping });
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new Error(
        `Column "${mapping.field}" not matched. Headers: [${headerTexts.join(', ')}]`
      );
    }
  }

  return { columnMap, headerTexts, actualColumns: headerTexts.length };
}

function parseRows(table, columnMap, $) {
  const rows = [];
  const bodyRows = table.find('tbody tr');
  if (!bodyRows.length) {
    // No tbody: all rows after header
    const allRows = table.find('tr');
    allRows.each((idx, el) => {
      if (idx === 0) return; // skip header
      rows.push(parseRow($(el), columnMap, $));
    });
  } else {
    bodyRows.each((_i, el) => {
      rows.push(parseRow($(el), columnMap, $));
    });
  }
  return rows.filter(Boolean);
}

function parseRow(tr, columnMap, $) {
  const cells = tr.find('td');
  const payload = {};

  for (const [field, { index, mapping }] of columnMap.entries()) {
    const cell = cells.eq(index);
    if (!cell.length) {
      payload[field] = '';
      continue;
    }

    if (mapping.is_link) {
      const href = cell.find('a').attr('href') || '';
      payload[field] = href.trim();
    } else {
      payload[field] = cell.text().trim();
    }
  }

  // Skip empty rows (all fields blank)
  if (Object.values(payload).every(v => !v)) return null;

  return payload;
}

// --- Dedup ---

function dedupRows(rows) {
  const byPdfUrl = new Map();
  const noPdf = [];

  for (const row of rows) {
    const key = normalizeUrl(row.pdf_url);
    if (!key) {
      noPdf.push(row);
      continue;
    }
    const existing = byPdfUrl.get(key);
    if (!existing) {
      byPdfUrl.set(key, row);
      continue;
    }
    // Keep row with more populated fields
    const existingCount = Object.values(existing).filter(
      v => v && v !== 'N/A'
    ).length;
    const newCount = Object.values(row).filter(v => v && v !== 'N/A').length;
    if (newCount > existingCount) {
      byPdfUrl.set(key, row);
    }
  }

  return [...byPdfUrl.values(), ...noPdf];
}

// --- Source record creation ---

function toSourceRecord(rawPayload, source, runId) {
  // Inject document type from source config so staging can read row.type
  const payloadWithType = { ...rawPayload, type: source.document_type };

  const contentHash = computeContentHash(
    'website_table_row',
    source.url,
    rawPayload
  );
  const hashSlug = crypto
    .createHash('sha256')
    .update(contentHash)
    .digest('hex')
    .slice(0, 20);
  const now = new Date().toISOString();

  return {
    id: `src_${source.key}_${hashSlug}`,
    source_kind: 'website_table_row',
    source_key: source.key,
    source_url: source.url,
    content_hash: contentHash,
    collector_version: COLLECTOR_VERSION,
    raw_payload_json: payloadWithType,
    pdf_url: rawPayload.pdf_url || '',
    pdf_reachability: null,
    pdf_redirect_url: null,
    pdf_checked_at: null,
    run_id: runId,
    first_seen_at: now,
    last_seen_at: now,
  };
}

// --- Run output ---

function buildRunManifest(
  source,
  { status, startedAt, finishedAt, attempts, counts, tableShape, error }
) {
  return {
    source_key: source.key,
    status,
    started_at: startedAt,
    finished_at: finishedAt,
    duration_ms: finishedAt ? new Date(finishedAt) - new Date(startedAt) : null,
    attempts,
    source_url: source.url,
    collector_version: COLLECTOR_VERSION,
    counts: status === 'success' ? counts : undefined,
    table_shape: tableShape || undefined,
    error: error || undefined,
  };
}

function writeRunOutput(source, manifest, records, outputRoot) {
  const sourceDir = path.join(outputRoot, source.key);
  const ts = timestampSlug();
  const runDir = path.join(sourceDir, 'runs', ts);

  fs.mkdirSync(runDir, { recursive: true });

  // Always write run.json
  fs.writeFileSync(
    path.join(runDir, 'run.json'),
    `${JSON.stringify(manifest, null, 2)}\n`
  );

  if (manifest.status === 'success') {
    // Write source records
    writeJsonl(path.join(runDir, 'source-records.jsonl'), records);

    // Copy to latest/
    const latestDir = path.join(sourceDir, 'latest');
    fs.mkdirSync(latestDir, { recursive: true });
    fs.writeFileSync(
      path.join(latestDir, 'run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
    writeJsonl(path.join(latestDir, 'source-records.jsonl'), records);
  } else {
    // Write last-failed-run.json
    fs.writeFileSync(
      path.join(sourceDir, 'last-failed-run.json'),
      `${JSON.stringify(manifest, null, 2)}\n`
    );
  }
}

// --- Combined output ---

function writeCombinedOutput(outputRoot) {
  const combined = [];
  for (const source of SOURCES) {
    const latestPath = path.join(
      outputRoot,
      source.key,
      'latest',
      'source-records.jsonl'
    );
    if (fs.existsSync(latestPath)) {
      combined.push(...readJsonl(latestPath));
    }
  }

  const combinedPath = path.join(outputRoot, '..', 'source-records.jsonl');
  writeJsonl(combinedPath, combined);
  console.log(
    `Combined ${combined.length} source record(s) into ${combinedPath}`
  );
}

// --- Main ---

async function main() {
  const args = parseArgs(process.argv);
  const sources = args.source
    ? SOURCES.filter(s => s.key === args.source)
    : SOURCES;

  if (!sources.length) {
    throw new Error(`Unknown source: ${args.source}`);
  }

  fs.mkdirSync(args.outputRoot, { recursive: true });

  for (let i = 0; i < sources.length; i += 1) {
    const source = sources[i];
    console.log(`[${source.key}] Starting collection...`);

    // Delay between sources
    if (i > 0) {
      await delay(2000);
    }

    const startedAt = new Date().toISOString();
    let attempts = 0;

    try {
      // Fetch HTML
      let html;
      if (args.htmlDir) {
        const fixturePath = path.join(args.htmlDir, `${source.key}.html`);
        html = fs.readFileSync(fixturePath, 'utf8');
        console.log(`  Loaded fixture: ${fixturePath}`);
      } else {
        console.log(`  Fetching ${source.url}...`);
        html = await fetchWithRetry(source.url, 3);
        attempts = 3;
      }

      // Save HTML if requested
      if (args.saveHtmlDir) {
        fs.mkdirSync(args.saveHtmlDir, { recursive: true });
        const savePath = path.join(args.saveHtmlDir, `${source.key}.html`);
        fs.writeFileSync(savePath, html);
        console.log(`  Saved HTML: ${savePath}`);
      }

      // Parse with cheerio
      const $ = cheerio.load(html);
      const table = findTable($, source);

      if (!table) {
        throw {
          type: 'table_shape_failure',
          message: `Table not found. Tried: ${[source.table_selector, ...source.fallback_selectors].join(', ')}`,
        };
      }

      const { columnMap, headerTexts, actualColumns } = matchColumns(
        table,
        source,
        $
      );

      const rawRows = parseRows(table, columnMap, $);
      console.log(`  Parsed ${rawRows.length} row(s)`);

      // Detect possible server-side pagination
      if (rawRows.length === 0 && table.length > 0) {
        throw {
          type: 'table_shape_failure',
          message: `Table found but 0 rows parsed. Possible server-side pagination. Headers: [${headerTexts.join(', ')}]`,
        };
      }

      // Dedup
      const deduped = dedupRows(rawRows);
      const dedupCount = rawRows.length - deduped.length;
      if (dedupCount > 0) {
        console.log(`  Deduplicated ${dedupCount} row(s)`);
      }

      // PDF link checking
      const pdfUrls = deduped.map(r => r.pdf_url).filter(Boolean);
      const pdfResults = await checkPdfUrls(pdfUrls);

      // Create source records
      const runId = `run_${source.key}_${timestampSlug()}`;
      const records = deduped.map(row => {
        const rec = toSourceRecord(row, source, runId);
        const normUrl = normalizeUrl(row.pdf_url);
        const check = pdfResults.get(normUrl);
        if (check) {
          rec.pdf_reachability = check.reachability;
          rec.pdf_redirect_url = check.redirect_url;
          rec.pdf_checked_at = new Date().toISOString();
        }
        return rec;
      });

      const finishedAt = new Date().toISOString();
      const manifest = buildRunManifest(source, {
        status: 'success',
        startedAt,
        finishedAt,
        attempts: attempts || 1,
        counts: {
          rows_found: rawRows.length + dedupCount,
          rows_parsed: rawRows.length,
          rows_deduplicated: dedupCount,
          source_records_emitted: records.length,
          rows_skipped: 0,
        },
        tableShape: {
          selector: source.table_selector,
          columns_matched: headerTexts,
          expected_columns: source.expected_columns,
          actual_columns: actualColumns,
        },
      });

      writeRunOutput(source, manifest, records, args.outputRoot);
      console.log(
        `  Emitted ${records.length} source record(s) [${manifest.duration_ms}ms]`
      );
    } catch (err) {
      const finishedAt = new Date().toISOString();
      const isHttp =
        err.message &&
        (err.message.startsWith('HTTP') ||
          err.message.startsWith('fetch failed') ||
          err.message.startsWith('Request timeout'));
      const error = err.type
        ? err
        : { type: isHttp ? 'http_error' : 'parse_error', message: err.message };

      const manifest = buildRunManifest(source, {
        status: 'failed',
        startedAt,
        finishedAt,
        attempts: attempts || 1,
        error,
      });

      writeRunOutput(source, manifest, [], args.outputRoot);
      console.error(`  FAILED: ${error.message}`);
    }
  }

  // Write combined output
  writeCombinedOutput(args.outputRoot);
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
