#!/usr/bin/env node

/**
 * setup-lgu.cjs
 * Interactive CLI wizard to configure a new BetterLGU portal fork.
 *
 * Usage: node scripts/setup-lgu.cjs
 *
 * Prompts for LGU details, generates config, creates placeholder data,
 * and replaces branding assets.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const ROOT = path.join(__dirname, '..');

// ─── Helpers ───────────────────────────────────────────────────────────

function question(rl, prompt, defaultVal) {
  return new Promise(resolve => {
    const suffix = defaultVal ? ` [${defaultVal}]` : '';
    rl.question(`${prompt}${suffix}: `, answer => {
      resolve(answer.trim() || defaultVal || '');
    });
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function capitalize(s) {
  return s.replace(/\b\w/g, c => c.toUpperCase());
}

// ─── Main ──────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🌍 BetterLGU Portal Setup Wizard\n');
  console.log('This will configure your portal for a new LGU.\n');

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // ─── Collect info ──────────────────────────────────────────────────
  const lguName = await question(rl, 'LGU name (e.g. "Los Baños")');
  const province = await question(rl, 'Province (e.g. "Laguna")');
  const region = await question(rl, 'Region (e.g. "CALABARZON (IV-A)")');
  const regionCode = await question(rl, 'Region code (e.g. "040000000")');
  const lguType = await question(
    rl,
    'LGU type (municipality/city/province)',
    'municipality'
  );

  const slug = slugify(lguName);
  const fullName =
    lguType === 'province'
      ? `Province of ${lguName}`
      : `${capitalize(lguType)} of ${lguName}`;

  const portalName = await question(
    rl,
    'Portal name (e.g. "BetterLB")',
    `Better${slug.replace(/-/g, '').substring(0, 4).toUpperCase()}`
  );
  const domain = await question(
    rl,
    'Domain (e.g. "betterlb.org")',
    `${slugify(portalName)}.org`
  );

  const githubOrg = await question(
    rl,
    'GitHub org or user for this repo',
    `Better${slug.replace(/-/g, '').substring(0, 6)}`
  );
  const githubRepo = await question(
    rl,
    'GitHub repo name',
    slugify(portalName)
  );
  const githubUrl = `https://github.com/${githubOrg}/${githubRepo}`;

  const contactEmail = await question(
    rl,
    'Contact email',
    `volunteers@bettergov.ph`
  );

  // Optional features
  console.log('\n--- Features ---');
  const enableTourism =
    (await question(rl, 'Enable tourism module? (y/n)', 'n')).toLowerCase() ===
    'y';
  const enableStats =
    (
      await question(rl, 'Enable statistics module? (y/n)', 'y')
    ).toLowerCase() === 'y';
  const enableOpenLGU =
    (await question(rl, 'Enable OpenLGU portal? (y/n)', 'y')).toLowerCase() ===
    'y';
  const enableTransparency =
    (
      await question(rl, 'Enable transparency portal? (y/n)', 'y')
    ).toLowerCase() === 'y';

  // MeiliSearch
  console.log('\n--- MeiliSearch ---');
  const msHost = await question(
    rl,
    'MeiliSearch host',
    'https://search2.bettergov.ph'
  );
  const msPort = await question(rl, 'MeiliSearch port', '443');
  const msKey = await question(rl, 'MeiliSearch search API key');

  // Transparency filters
  const orgName = await question(
    rl,
    'PhilGEPS organization name for procurement',
    fullName.toUpperCase()
  );
  const infraSearch = await question(
    rl,
    'DPWH infrastructure search string',
    lguName
  );

  rl.close();

  // ─── Generate config ───────────────────────────────────────────────
  const config = {
    lgu: {
      name: lguName,
      fullName,
      shortName: slug.substring(0, 3).toUpperCase(),
      province,
      region,
      regionCode,
      type: lguType,
      officialWebsite: `https://${domain}`,
      provinceWebsite: '',
    },
    portal: {
      name: portalName,
      domain,
      baseUrl: `https://${domain}`,
      tagline: `Community Powered ${lguName} Portal`,
      description: `Community-powered portal of the ${fullName}.`,
      brandColor: '#0066eb',
      navbarTagline: 'A Community-run portal for',
      footerBrandName: `Better ${lguName}`,
      footerTagline: 'Community Civic Portal',
      logoWhitePath: `/logos/svg/${slug}-icon-white.svg`,
      navbarLogoPath: `/logos/svg/${slug}-icon-colored.svg`,
      defaultOgImagePath: `/logos/svg/${slug}-icon-colored.svg`,
      faviconPath: `/logos/png/${slug}-banner-colored.png`,
      faviconSvgPath: `/logos/svg/${slug}-logo-primary.svg`,
      appleTouchIconPath: `/logos/png/${slug}-banner-inverted.png`,
      githubUrl,
      discordUrl: '',
      facebookUrl: '',
      contactEmail,
    },
    location: {
      coordinates: { lat: 0, lng: 0 },
      weather: { enabled: false },
    },
    transparency: {
      procurement: { organizationName: orgName },
      infrastructure: {
        searchString: infraSearch,
        exactMatchTargets: [lguName.toLowerCase()],
      },
    },
    dataPaths: {
      departments: 'src/data/directory/departments.json',
      barangays: 'src/data/directory/barangays.json',
      executive: 'src/data/directory/executive.json',
      legislative: 'src/data/directory/legislative.json',
      services: 'src/data/services',
    },
    features: {
      openLGU: enableOpenLGU,
      transparency: enableTransparency,
      tourism: enableTourism,
      statistics: enableStats,
    },
  };

  const configPath = path.join(ROOT, 'config', 'lgu.config.json');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n');
  console.log(`\n✅ Written config/lgu.config.json`);

  // ─── Generate .env ─────────────────────────────────────────────────
  const envContent =
    [
      `VITE_MEILISEARCH_HOST=${msHost}`,
      `VITE_MEILISEARCH_PORT=${msPort}`,
      msKey ? `VITE_MEILISEARCH_API_KEY=${msKey}` : 'VITE_MEILISEARCH_API_KEY=',
    ].join('\n') + '\n';
  fs.writeFileSync(path.join(ROOT, '.env'), envContent);
  console.log('✅ Written .env');

  // ─── Generate SEO metadata ─────────────────────────────────────────
  try {
    const seoPath = path.join(ROOT, 'src', 'data', 'seo-metadata.json');
    if (fs.existsSync(seoPath)) {
      // Run token resolver
      let seo = fs.readFileSync(seoPath, 'utf8');
      const tokens = {
        '{{portal.name}}': portalName,
        '{{portal.domain}}': domain,
        '{{portal.baseUrl}}': `https://${domain}`,
        '{{lgu.name}}': lguName,
        '{{lgu.fullName}}': fullName,
        '{{lgu.province}}': province,
        '{{lgu.type}}': lguType,
        '{{lgu.adjective}}':
          lguType === 'city'
            ? 'City'
            : lguType === 'province'
              ? 'Provincial'
              : 'Municipal',
      };
      for (const [token, value] of Object.entries(tokens)) {
        seo = seo.replaceAll(token, value);
      }
      fs.writeFileSync(seoPath, seo);
      console.log('✅ Resolved SEO metadata tokens');
    }
  } catch {
    console.log('⚠️  Could not resolve SEO metadata (non-critical)');
  }

  // ─── Create placeholder data files ─────────────────────────────────
  const placeholderDir = {
    departments: { departments: [] },
    barangays: { barangays: [] },
    executive: { officials: [] },
    legislative: { officials: [] },
  };

  for (const [file, data] of Object.entries(placeholderDir)) {
    const filePath = path.join(
      ROOT,
      'src',
      'data',
      'directory',
      `${file}.json`
    );
    if (!fs.existsSync(filePath)) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
      console.log(`✅ Created placeholder src/data/directory/${file}.json`);
    }
  }

  // ─── Update index.html with config paths ───────────────────────────
  try {
    const htmlPath = path.join(ROOT, 'index.html');
    let html = fs.readFileSync(htmlPath, 'utf8');

    const slug = slugify(lguName);
    const replacements = {
      '/logos/svg/betterlb-logo-primary.svg': `/logos/svg/${slug}-logo-primary.svg`,
      '/logos/png/betterlb-banner-inverted.png': `/logos/png/${slug}-banner-inverted.png`,
      '/logos/png/betterlb-blue.png': `/logos/png/${slug}-blue.png`,
    };

    for (const [from, to] of Object.entries(replacements)) {
      if (html.includes(from)) {
        html = html.replaceAll(from, to);
      }
    }
    fs.writeFileSync(htmlPath, html);
    console.log('✅ Updated index.html logo paths');
  } catch {
    console.log('⚠️  Could not update index.html (non-critical)');
  }

  // ─── Summary ───────────────────────────────────────────────────────
  console.log('\n════════════════════════════════════════════');
  console.log(`  ${portalName} — ${fullName}`);
  console.log(`  https://${domain}`);
  console.log(`  ${githubUrl}`);
  console.log('════════════════════════════════════════════\n');
  console.log('Next steps:');
  console.log('  1. Add LGU data to src/data/directory/');
  console.log(
    '  2. Add service categories to src/data/service_categories.json'
  );
  console.log('  3. Replace logos in public/logos/');
  console.log('  4. Run: npm install && npm run dev\n');
}

main().catch(err => {
  console.error('Setup failed:', err);
  process.exit(1);
});
