#!/usr/bin/env node
import { MeiliSearch } from 'meilisearch';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// Constants
const MEILISEARCH_HOST = process.env.VITE_MEILISEARCH_HOST || 'http://localhost';
const MEILISEARCH_PORT = process.env.VITE_MEILISEARCH_PORT || '7700';
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_MASTER_KEY || ''; // Use MASTER KEY for admin operations
const INDEX_NAME = 'bettergov_flood_control';

console.log('Updating Meilisearch settings for', INDEX_NAME);

// Initialize MeiliSearch client
const client = new MeiliSearch({
  host: `${MEILISEARCH_HOST}:${MEILISEARCH_PORT}`,
  apiKey: MEILISEARCH_API_KEY,
});

async function updateSettings() {
  try {
    console.log(`Setting maxTotalHits to 10000 for index ${INDEX_NAME}...`);
    
    // Update the settings
    await client.index(INDEX_NAME).updateSettings({ 
      pagination: { 
        maxTotalHits: 10000 
      }
    });

    console.log('Settings updated successfully!');
    
    // Verify the settings were updated
    const settings = await client.index(INDEX_NAME).getSettings();
    console.log('Current settings:', JSON.stringify(settings, null, 2));
  } catch (error) {
    console.error(`Error updating settings: ${error.message}`);
    process.exit(1);
  }
}

// Run the update function
updateSettings();
