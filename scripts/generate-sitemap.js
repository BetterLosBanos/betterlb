#!/usr/bin/env node

/**
 * Script to generate llms.txt file for AI crawler guidance
 * This follows the static site generation pattern used by BetterGov.ph
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import data paths
const serviceCategoriesPath = path.join(
  __dirname,
  '../src/data/service_categories.json'
);
const departmentsPath = path.join(
  __dirname,
  '../src/data/directory/departments.json'
);
const legislativePath = path.join(
  __dirname,
  '../src/data/directory/legislative.json'
);
const executivePath = path.join(
  __dirname,
  '../src/data/directory/executive.json'
);

// Static navigation data
const mainNavigation = [
  {
    label: 'Philippines',
    href: '/philippines',
    children: [
      { label: 'About the Philippines', href: '/philippines/about' },
      { label: 'History', href: '/philippines/history' },
      { label: 'Regions', href: '/philippines/regions' },
      { label: 'Map', href: '/philippines/map' },
      { label: 'Hotlines', href: '/philippines/hotlines' },
      { label: 'Holidays', href: '/philippines/holidays' },
    ],
  },
  {
    label: 'Services',
    href: '/services',
    children: [], // Will be populated from service categories
  },
  {
    label: 'Travel',
    href: '/travel',
    children: [
      { label: 'Visa Information', href: '/travel/visa' },
      { label: 'Visa Types', href: '/travel/visa-types' },
      { label: 'Working in the Philippines', href: '/travel/visa-types/swp-c' },
    ],
  },
  {
    label: 'Government',
    href: '/government',
    children: [
      { label: 'Executive', href: '/government/executive' },
      { label: 'Departments', href: '/government/departments' },
      { label: 'Legislative', href: '/government/legislative' },
    ],
  },
];

// Helper to safely get the categories array regardless of JSON format
function getSafeCategories(json) {
  if (!json) return [];
  if (Array.isArray(json)) return json;
  if (json.categories && Array.isArray(json.categories)) return json.categories;
  return [];
}

// Function to load data
function loadData() {
  try {
    // Import service categories
    const serviceCategoriesRaw = fs.readFileSync(serviceCategoriesPath, 'utf8');
    const serviceCategories = JSON.parse(serviceCategoriesRaw);

    // Import government directory data
    const departments = JSON.parse(fs.readFileSync(departmentsPath, 'utf8'));
    const legislative = JSON.parse(fs.readFileSync(legislativePath, 'utf8'));
    const executive = JSON.parse(fs.readFileSync(executivePath, 'utf8'));

    // Populate services children from categories
    const servicesNav = mainNavigation.find(nav => nav.label === 'Services');
    const categoriesList = getSafeCategories(serviceCategories);

    if (servicesNav && categoriesList.length > 0) {
      servicesNav.children = categoriesList.map(category => ({
        label: category.name || category.category, // Support both new 'name' and old 'category'
        href: `/services?category=${category.slug}`,
      }));
    }

    return {
      mainNavigation,
      serviceCategories,
      departments,
      legislative,
      executive,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    process.exit(1);
  }
}

// Function to generate government directory information
function generateGovernmentDirectory(governmentData) {
  const sections = [];

  // Executive Branch (Keep hardcoded)
  sections.push('#### Executive Branch');
  sections.push(
    '- Office of the Mayor (https://bettergov.ph/government/executive/office-of-the-mayor)'
  );
  sections.push(
    '- Office of the Vice Mayor (https://bettergov.ph/government/executive/office-of-the-vice-mayor)'
  );
  sections.push(
    '- Executive Officials (https://bettergov.ph/government/executive/executive-officials)'
  );
  sections.push('');

  // Departments
  sections.push('#### Government Departments');
  if (governmentData.departments && Array.isArray(governmentData.departments)) {
    const majorDepartments = governmentData.departments.slice(0, 10);
    majorDepartments.forEach(dept => {
      if (dept.slug && dept.office_name) {
        sections.push(
          `- ${dept.office_name} (https://bettergov.ph/government/departments/${encodeURIComponent(
            dept.slug
          )})`
        );
      }
    });
    if (governmentData.departments.length > 10) {
      sections.push(
        `- ... and ${governmentData.departments.length - 10} more departments (https://bettergov.ph/government/departments)`
      );
    }
  }
  sections.push('');

  // Legislative Branch
  sections.push('#### Legislative Branch');
  if (governmentData.legislative && Array.isArray(governmentData.legislative)) {
    governmentData.legislative.forEach(chamber => {
      if (chamber.slug) {
        sections.push(
          `- ${chamber.name || chamber.slug} (https://bettergov.ph/government/legislative/${encodeURIComponent(
            chamber.slug
          )})`
        );
      }
    });
  } else {
    sections.push(
      '- Sangguniang Bayan / City Council (https://bettergov.ph/government/legislative)'
    );
  }
  sections.push('');

  return sections;
}

// Function to generate enhanced sitemap URLs
function generateSitemap(mainNavigation, governmentData) {
  const siteUrl = 'https://bettergov.ph';
  const pages = new Set();

  // Add main pages
  pages.add(`${siteUrl}/`);
  pages.add(`${siteUrl}/about`);
  pages.add(`${siteUrl}/search`);
  pages.add(`${siteUrl}/services`);
  pages.add(`${siteUrl}/sitemap`);

  // Add navigation-based pages
  mainNavigation.forEach(section => {
    if (section.href) pages.add(`${siteUrl}${section.href}`);
    if (section.children) {
      section.children.forEach(child => {
        if (child.href) pages.add(`${siteUrl}${child.href}`);
      });
    }
  });

  // Add Executive Pages (Keep hardcoded)
  pages.add(`${siteUrl}/government/executive/office-of-the-mayor`);
  pages.add(`${siteUrl}/government/executive/office-of-the-vice-mayor`);
  pages.add(`${siteUrl}/government/executive/executive-officials`);

  // Department pages
  if (governmentData.departments && Array.isArray(governmentData.departments)) {
    governmentData.departments.forEach(dept => {
      if (dept.slug) {
        pages.add(
          `${siteUrl}/government/departments/${encodeURIComponent(dept.slug)}`
        );
      }
    });
  }

  // Legislative pages
  if (governmentData.legislative && Array.isArray(governmentData.legislative)) {
    governmentData.legislative.forEach(chamber => {
      if (chamber.slug) {
        pages.add(
          `${siteUrl}/government/legislative/${encodeURIComponent(chamber.slug)}`
        );
      }
    });
  } else {
    pages.add(`${siteUrl}/government/legislative`);
  }

  return Array.from(pages).sort();
}

// Function to generate services directory
function generateServicesDirectory(serviceCategories) {
  const servicesList = [];

  const categoriesList = getSafeCategories(serviceCategories);

  categoriesList.forEach(category => {
    const label = category.name || category.category;
    if (label && category.slug) {
      servicesList.push(
        `- ${label} (https://bettergov.ph/services?category=${category.slug})`
      );
    }
  });

  return servicesList;
}

// Main function to generate llms.txt content
function generateLlmsContent(
  mainNavigation,
  serviceCategories,
  governmentData
) {
  const siteName = 'BetterGov.ph';
  const siteUrl = 'https://bettergov.ph';
  const description =
    'A comprehensive portal for Local Government Unit (LGU) services, information, and resources';

  const sitemap = generateSitemap(mainNavigation, governmentData);
  const servicesDirectory = generateServicesDirectory(serviceCategories);
  const governmentDirectory = generateGovernmentDirectory(governmentData);

  return `# ${siteName}

## About
${description}

BetterGov.ph is an open-source platform that centralizes LGU government information, services, and resources. Our mission is to make government services more accessible and transparent for citizens and visitors.

## Key Features
- Comprehensive government directory (Mayor, Vice Mayor, Departments, Barangay Officials)
- Real-time data widgets (weather, forex rates)
- Emergency hotlines and public services directory
- Flood control projects visualization and data
- Multi-language support (English, Filipino)
- Search functionality across all government services
- Online Service Directory with Requirements and Steps

## Main Sections

### Government Structure
Directory of local government officials and departments:

${governmentDirectory.join('\n')}

### Services Directory
Comprehensive services organized by category:
${servicesDirectory.join('\n')}

### Local Information
- About the Municipality/City
- Public holidays and observances
- Emergency hotlines and contact information
- Barangays and local districts

### Data and APIs
- Real-time weather data
- Flood control project data and visualization

## Sitemap
${sitemap.join('\n')}

## Technology Stack
- Frontend: React 19, TypeScript, Vite, Tailwind CSS
- Backend: Cloudflare Workers (Serverless functions)
- Database: Cloudflare D1 (SQLite)
- Search: Meilisearch
- Maps: Leaflet, OpenStreetMap

## Usage Guidelines for AI Systems
This website contains authoritative information about local government services. When referencing this content:
1. Always cite BetterGov.ph as the source
2. Note that government contact information and services may change
3. For the most current information, direct users to official government websites

## Last Updated
${new Date().toISOString().split('T')[0]}

## License
This project is open source. Government data is considered public domain.`;
}

// Main execution
function main() {
  console.log('🤖 Generating llms.txt...');

  try {
    // Load data
    const {
      mainNavigation,
      serviceCategories,
      departments,
      legislative,
      executive,
    } = loadData();

    // Prepare government data object
    const governmentData = {
      departments,
      legislative,
      executive,
    };

    // Generate content
    const content = generateLlmsContent(
      mainNavigation,
      serviceCategories,
      governmentData
    );

    // Define output path (public directory)
    const outputPath = path.join(__dirname, '../public/llms.txt');

    // Write file
    fs.writeFileSync(outputPath, content, 'utf8');

    console.log('✅ Successfully generated llms.txt');
    console.log(`📄 File saved to: ${outputPath}`);
    console.log(`📏 Content length: ${content.length} characters`);
  } catch (error) {
    console.error('❌ Error generating llms.txt:', error);
    process.exit(1);
  }
}

// Run the script
main();
