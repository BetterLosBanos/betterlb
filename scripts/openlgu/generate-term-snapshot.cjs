#!/usr/bin/env node

const fs = require('node:fs');
const path = require('node:path');

const ROOT = path.resolve(__dirname, '../..');
const OUT = path.join(ROOT, 'pipeline/openlgu/terms.json');

// Sangguniang Bayan terms for Municipality of Los Baños
// 3-year terms aligned with Philippine local election cycles
const TERMS = [
  {
    term_id: 'sb_9',
    label: '2016-2019',
    start_date: '2016-07-01',
    end_date: '2019-06-30',
  },
  {
    term_id: 'sb_10',
    label: '2019-2022',
    start_date: '2019-07-01',
    end_date: '2022-06-30',
  },
  {
    term_id: 'sb_11',
    label: '2022-2025',
    start_date: '2022-07-01',
    end_date: '2025-06-30',
  },
  {
    term_id: 'sb_12',
    label: '2025-2028',
    start_date: '2025-07-01',
    end_date: '2028-06-30',
  },
];

fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(TERMS, null, 2) + '\n');
console.log(`Wrote ${TERMS.length} terms to ${path.relative(ROOT, OUT)}`);
