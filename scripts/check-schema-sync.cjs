#!/usr/bin/env node

/**
 * Schema Sync Checker
 *
 * Validates that SELECT column references in API code match the D1 schema
 * defined in migration files. Catches mismatches like querying columns that
 * were removed from the schema (D1 silently returns NULL for unknown columns).
 *
 * Usage:
 *   node scripts/check-schema-sync.js
 *
 * Exit code 1 if mismatches found. Runs in CI.
 */

const fs = require('fs');
const path = require('path');

const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');
const FUNCTIONS_DIR = path.join(__dirname, '..', 'functions');
const SRC_DIR = path.join(__dirname, '..', 'src');

// ─── 1. Parse schema from migrations ────────────────────────────────────────

function parseSchema() {
  const schema = {}; // table -> Set of column names

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter(f => f.endsWith('.sql'))
    .sort();

  for (const file of files) {
    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf-8');

    // Parse CREATE TABLE columns
    const createRegex =
      /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)\s*\(([^;]+)\);/gi;
    let match;
    while ((match = createRegex.exec(sql)) !== null) {
      const tableName = match[1];
      const body = match[2];

      if (!schema[tableName]) schema[tableName] = new Set();

      for (const line of body.split('\n')) {
        const trimmed = line.trim().replace(/,\s*$/, '');
        if (!trimmed) continue;
        if (
          /^(PRIMARY\s+KEY|UNIQUE|CHECK|FOREIGN|CONSTRAINT|CREATE\s+INDEX)/i.test(
            trimmed
          )
        )
          continue;

        const colMatch = trimmed.match(/^["']?(\w+)["']?\s/);
        if (colMatch) {
          schema[tableName].add(colMatch[1]);
        }
      }
    }

    // ALTER TABLE ADD COLUMN
    const alterRegex =
      /ALTER\s+TABLE\s+(\w+)\s+ADD\s+COLUMN\s+(?:IF\s+NOT\s+EXISTS\s+)?(\w+)/gi;
    while ((match = alterRegex.exec(sql)) !== null) {
      const [, tableName, colName] = match;
      if (!schema[tableName]) schema[tableName] = new Set();
      schema[tableName].add(colName);
    }

    // ALTER TABLE DROP COLUMN
    const dropColRegex =
      /ALTER\s+TABLE\s+(\w+)\s+DROP\s+COLUMN\s+(?:IF\s+EXISTS\s+)?(\w+)/gi;
    while ((match = dropColRegex.exec(sql)) !== null) {
      const [, tableName, colName] = match;
      if (schema[tableName]) schema[tableName].delete(colName);
    }
  }

  return schema;
}

// ─── 2. Extract table.column references from TypeScript ─────────────────────

function findColumnReferences(dir) {
  const refs = [];

  function walk(d) {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        if (entry.name !== 'node_modules' && entry.name !== '.git') walk(full);
        continue;
      }
      if (!/\.(ts|tsx)$/.test(entry.name)) continue;

      const content = fs.readFileSync(full, 'utf-8');

      // Only scan inside backtick template strings (SQL queries)
      // This avoids false positives from JS object property access
      const templateStringRegex = /`([^`]+)`/g;
      let tsMatch;
      while ((tsMatch = templateStringRegex.exec(content)) !== null) {
        const sqlBlock = tsMatch[1];

        // Quick heuristic: only process if it looks like SQL
        if (!/\b(SELECT|FROM|WHERE|JOIN|INSERT|UPDATE)\b/i.test(sqlBlock))
          continue;

        // Find the starting line number for this template string
        const beforeMatch = content.substring(0, tsMatch.index);
        const startLine = (beforeMatch.match(/\n/g) || []).length + 1;

        const lines = sqlBlock.split('\n');
        for (let j = 0; j < lines.length; j++) {
          const line = lines[j];
          const sqlColRegex = /\b(\w+)\.(\w+)\b/g;
          let m;
          while ((m = sqlColRegex.exec(line)) !== null) {
            const alias = m[1];
            const col = m[2];
            if (/^\d/.test(col)) continue;
            if (
              col === 'prototype' ||
              col === 'constructor' ||
              col === 'length'
            )
              continue;
            refs.push({
              file: path.relative(process.cwd(), full),
              line: startLine + j,
              alias,
              column: col,
            });
          }
        }
      }
    }
  }

  walk(dir);
  return refs;
}

// ─── 3. Map SQL aliases to table names ───────────────────────────────────────

function resolveAliasToTable(refs) {
  const aliasMap = {
    d: 'documents',
    doc: 'documents',
    s: 'sessions',
    sess: 'sessions',
    t: 'terms',
    p: 'persons',
    m: 'memberships',
    da: 'document_authors',
    ds: 'document_subjects',
    cm: 'committee_memberships',
    c: 'committees',
    sa: 'session_absences',
    rq: 'review_queue',
    dc: 'data_conflicts',
    fsd: 'facebook_session_data',
  };

  return refs.map(ref => ({ ...ref, table: aliasMap[ref.alias] || null }));
}

// ─── 4. Run checks ──────────────────────────────────────────────────────────

const schema = parseSchema();
const refs = resolveAliasToTable(
  findColumnReferences(FUNCTIONS_DIR).concat(findColumnReferences(SRC_DIR))
);

const mismatches = [];
for (const ref of refs) {
  if (!ref.table || !schema[ref.table]) continue;
  if (!schema[ref.table].has(ref.column)) {
    if (
      [
        'then',
        'catch',
        'finally',
        'toString',
        'valueOf',
        'hasOwnProperty',
      ].includes(ref.column)
    )
      continue;
    if (ref.column.startsWith('_') || ref.column.startsWith('$')) continue;
    mismatches.push(ref);
  }
}

const seen = new Set();
const unique = mismatches.filter(m => {
  const key = `${m.file}:${m.line}:${m.table}.${m.column}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

if (unique.length > 0) {
  console.error('Schema mismatch detected:\n');
  for (const m of unique) {
    console.error(
      `  ${m.file}:${m.line} — ${m.table}.${m.column} not in schema`
    );
  }
  console.error(`\n${unique.length} mismatch(es) found.`);
  process.exit(1);
} else {
  console.log(`Schema sync OK. ${Object.keys(schema).length} tables checked.`);
}
