#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

function printHelp() {
  console.log(`Usage: node scripts/openlgu/normalize-unicode-text.cjs <file-or-dir> [options]

Converts mathematical bold/symbols back to plain ASCII using NFKD normalization.
Also normalizes first line to: Nth regular session / YYYY-MM-DD

Options:
  --dry-run    Show what would change without writing files
`);
}

const MONTHS = {
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
};

function normalizeFirstLine(text) {
  const lines = text.split('\n');
  const line1 = lines[0];

  // Handle word ordinals: "THIRTEENTH (13TH) REGULAR SESSION" -> extract 13th
  let cleaned = line1.replace(
    /\b(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH|THIRTEENTH|FOURTEENTH|FIFTEENTH|SIXTEENTH|SEVENTEENTH|EIGHTEENTH|NINETEENTH|TWENTIETH|THIRTIETH|FORTIETH|FIFTIETH)\s*\((\d+)\s*(st|nd|rd|th)\)/i,
    '$2$3'
  );

  // Handle "SECOND SPECIAL SESSION" -> "2nd special session"
  const WORD_ORDINALS = {
    FIRST: '1st',
    SECOND: '2nd',
    THIRD: '3rd',
    FOURTH: '4th',
    FIFTH: '5th',
    SIXTH: '6th',
    SEVENTH: '7th',
    EIGHTH: '8th',
    NINTH: '9th',
    TENTH: '10th',
    ELEVENTH: '11th',
    TWELFTH: '12th',
  };
  cleaned = cleaned.replace(
    /^(FIRST|SECOND|THIRD|FOURTH|FIFTH|SIXTH|SEVENTH|EIGHTH|NINTH|TENTH|ELEVENTH|TWELFTH)\s+(SPECIAL)\s+SESSION/i,
    (_, word, type) =>
      `${WORD_ORDINALS[word.toUpperCase()]} ${type.toLowerCase()} session`
  );

  // Handle "INAUGURAL SESSION"
  const inauguralMatch = cleaned.match(
    /INAUGURAL\s+SESSION\s*(?:DATED|[|/\-]+)\s*(.+)/i
  );
  if (inauguralMatch) {
    const dateStr = inauguralMatch[1].trim();
    const isoDate = parseDate(dateStr);
    if (isoDate) {
      lines[0] = `inaugural session / ${isoDate}`;
      return lines.join('\n');
    }
    return text;
  }

  const match = cleaned.match(
    /(\d+)\s*(st|nd|rd|th)\s*(regular|special)\s*session\s*(?:dated|[|/\-]+)\s*(.+)/i
  );
  if (!match) return text;

  const ordinal = parseInt(match[1], 10);
  const suffix = match[2].toLowerCase();
  const type = match[3].toLowerCase();
  const dateStr = match[4].trim();

  const isoDate = parseDate(dateStr);
  if (!isoDate) return text;

  const newLine1 = `${ordinal}${suffix} ${type} session / ${isoDate}`;
  if (newLine1 === line1) return text;

  lines[0] = newLine1;
  return lines.join('\n');
}

function parseDate(dateStr) {
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) return dateStr;

  const monthMatch = dateStr.match(/^([A-Za-z]+)\s+0?(\d{1,2}),?\s+(\d{4})$/i);
  if (monthMatch) {
    const mm = MONTHS[monthMatch[1].toLowerCase()];
    const dd = monthMatch[2].padStart(2, '0');
    if (mm) return `${monthMatch[3]}-${mm}-${dd}`;
  }

  return null;
}

const STANDARD_LINE1 =
  /^(inaugural session|\d+(st|nd|rd|th)\s+(regular|special)\s+session)\s+\/\s+\d{4}-\d{2}-\d{2}$/;

function normalizeFile(filePath, dryRun) {
  const text = fs.readFileSync(filePath, 'utf8');
  let normalized = text.normalize('NFKD');
  normalized = normalizeFirstLine(normalized);

  const line1 = normalized.split('\n')[0];
  const needsAttention = !STANDARD_LINE1.test(line1);
  const hasChanges = text !== normalized;

  if (needsAttention) {
    if (!dryRun && hasChanges) fs.writeFileSync(filePath, normalized);
    console.log(`  ${filePath} — NEEDS MANUAL EDIT: "${line1.slice(0, 80)}"`);
    return hasChanges;
  }

  if (!hasChanges) {
    console.log(`  ${filePath} — ok`);
    return false;
  }

  if (dryRun) {
    console.log(`  ${filePath} — WOULD normalize`);
    return true;
  }

  fs.writeFileSync(filePath, normalized);
  console.log(`  ${filePath} — normalized`);
  return true;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const target = args.find(a => !a.startsWith('-') && a !== '--dry-run');

  if (!target || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(target ? 1 : 0);
  }

  if (fs.statSync(target).isDirectory()) {
    const files = fs
      .readdirSync(target)
      .filter(f => f.endsWith('.txt'))
      .map(f => path.join(target, f));

    console.log(`Processing ${files.length} file(s) in ${target}`);
    let changed = 0;
    for (const f of files) {
      if (normalizeFile(f, dryRun)) changed += 1;
    }
    console.log(
      `${dryRun ? 'Would change' : 'Changed'} ${changed}/${files.length} file(s)`
    );
  } else {
    normalizeFile(target, dryRun);
  }
}

try {
  main();
} catch (err) {
  console.error(err.message);
  process.exit(1);
}
