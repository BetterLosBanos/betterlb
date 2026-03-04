/**
 * Global test configuration for E2E tests with API mocking
 *
 * Import from this file instead of @playwright/test to get automatic API mocking:
 *
 *   import { test, expect } from './test-config';
 *
 * When CI=true or MOCK_API=true, all API requests will be mocked automatically.
 */

/* eslint-disable react-hooks/rules-of-hooks -- 'use' is from Playwright fixtures, not React */

import { test as base, expect } from '@playwright/test';

// Check if API mocking should be enabled
const shouldMockApis =
  process.env.CI === 'true' || process.env.MOCK_API === 'true';

/**
 * Extended test object with automatic API mocking
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    if (shouldMockApis) {
      // Set up API routes BEFORE page is used (most specific first)

      await page.route('**/api/weather**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            los_ba_os: {
              name: 'Los Baños',
              coordinates: { lat: 14.1763, lon: 121.2219 },
              weather: [{ icon: '01d', description: 'partly cloudy' }],
              main: {
                temp: 28,
                feels_like: 30,
                temp_min: 25,
                temp_max: 31,
                pressure: 1012,
                humidity: 75,
              },
              visibility: 10000,
              wind: { speed: 3.5, deg: 180 },
              clouds: { all: 10 },
              dt: Math.floor(Date.now() / 1000),
              sys: {},
              timezone: 28800,
              id: 1706511,
              timestamp: new Date().toISOString(),
              hourly: [],
            },
          }),
        });
      });

      await page.route('**/api/openlgu/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: [], offline: true }),
        });
      });

      await page.route('**/api/admin/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ authenticated: false, offline: true }),
        });
      });

      await page.route('**/api/weather**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            los_ba_os: {
              name: 'Los Baños',
              temperature: 28,
              description: 'partly cloudy',
            },
          }),
        });
      });

      await page.route('**/api/submit-contribution**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ success: true, offline: true }),
        });
      });

      // Catch-all for all other API requests (must be LAST)
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: null, offline: true }),
        });
      });
    }

    await use(page);
  },
});

// Re-export expect for convenience
export { expect };
