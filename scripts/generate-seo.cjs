#!/usr/bin/env node

/**
 * generate-seo.js
 * Replaces template tokens in seo-metadata.json with values from lgu.config.json.
 * Run: node scripts/generate-seo.js
 *
 * Template tokens: {{portal.name}}, {{portal.domain}}, {{lgu.name}}, {{lgu.fullName}},
 *                  {{lgu.province}}, {{lgu.type}}, {{lgu.adjective}}
 */

const fs = require('fs');
const path = require('path');

const configPath = path.join(__dirname, '..', 'config', 'lgu.config.json');
const seoPath = path.join(__dirname, '..', 'src', 'data', 'seo-metadata.json');

const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
let seo = fs.readFileSync(seoPath, 'utf8');

const tokens = {
  '{{portal.name}}': config.portal.name,
  '{{portal.domain}}': config.portal.domain,
  '{{portal.baseUrl}}': config.portal.baseUrl,
  '{{lgu.name}}': config.lgu.name,
  '{{lgu.fullName}}': config.lgu.fullName,
  '{{lgu.province}}': config.lgu.province,
  '{{lgu.type}}': config.lgu.type,
  // adjective derived from type
  '{{lgu.adjective}}':
    config.lgu.type === 'city'
      ? 'City'
      : config.lgu.type === 'province'
        ? 'Provincial'
        : 'Municipal',
};

let replacements = 0;
for (const [token, value] of Object.entries(tokens)) {
  const before = seo;
  seo = seo.replaceAll(token, value);
  replacements += (
    before.match(
      new RegExp(token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')
    ) || []
  ).length;
}

fs.writeFileSync(seoPath, seo, 'utf8');
console.log(`✅ Replaced ${replacements} token(s) in seo-metadata.json`);
