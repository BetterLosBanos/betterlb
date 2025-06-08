import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const generateSlug = (name) => {
  if (!name || typeof name !== 'string') return 'unknown-slug';
  return name
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/--+/g, '-'); // Replace multiple hyphens with single
};

const getBestName = (entry, type) => {
  return entry.name || entry.office || entry.office_name || entry.agency_name || entry.organization_name || entry.chamber || 'Unknown Entry';
};

const extractContactInfo = (entry) => {
  if (entry.contact) return entry.contact;
  if (entry.mayor?.contact) return entry.mayor.contact;
  return undefined;
};

const main = async () => {
  // Adjusted directoryPath to point to src/data/directory from scripts/
  const directoryPath = path.join(__dirname, '..', 'src', 'data', 'directory');
  // Adjusted outputFilePath to point to src/data/websites.json from scripts/
  const outputFilePath = path.join(__dirname, '..', 'src', 'data', 'websites.json');
  const allWebsiteEntries = [];

  try {
    const files = await fs.readdir(directoryPath);
    const jsonFiles = files.filter((file) => path.extname(file).toLowerCase() === '.json' && file !== 'websites.json' && file !== 'lgu.json');

    for (const jsonFile of jsonFiles) {
      const filePath = path.join(directoryPath, jsonFile);
      const fileContent = await fs.readFile(filePath, 'utf-8');
      const jsonData = JSON.parse(fileContent);

      const type = path.basename(jsonFile, '.json');
      let entriesToProcess = [];

      if (Array.isArray(jsonData)) {
        entriesToProcess = jsonData;
      } else if (typeof jsonData === 'object' && jsonData !== null) {

        // Fallback for other object structures - might need specific handling
        // For now, assume direct array if not LGU structure
        Object.values(jsonData).forEach(value => {
          if (Array.isArray(value)) {
            entriesToProcess.push(...value.flatMap(item => item.cities || item));
          }
        });

      }

      for (const entry of entriesToProcess) {
        const name = getBestName(entry, type);
        const slug = generateSlug(name);
        const contact = extractContactInfo(entry);

        const websiteEntry = {
          name,
          slug,
          email: entry.email || null,
          website: entry.website || null,
          address: entry.address || null,
          contact: contact || null,
          type,
        };
        allWebsiteEntries.push(websiteEntry);
      }
    }

    await fs.writeFile(outputFilePath, JSON.stringify(allWebsiteEntries, null, 2));
    console.log(`Successfully extracted websites to ${outputFilePath}`);
  } catch (error) {
    console.error('Error extracting websites:', error);
  }
};

main();
