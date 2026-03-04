import { test as base } from '@playwright/test';

/**
 * Global API mocking fixture for E2E tests
 *
 * This applies API mocks BEFORE any page loads, preventing ECONNREFUSED errors
 * when the Functions backend is unavailable.
 */

/* eslint-disable react-hooks/rules-of-hooks -- 'use' is from Playwright fixtures, not React */

// Apply API mocks to all pages in CI or when MOCK_API=true
const shouldMockApis =
  process.env.CI === 'true' || process.env.MOCK_API === 'true';

export const test = base.extend({
  page: async ({ page }, use) => {
    if (shouldMockApis) {
      // Set up routes BEFORE page is used
      // Specific routes first (more specific = higher priority)

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

      // Catch-all for all other API requests
      await page.route('**/api/**', route => {
        route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: null, offline: true }),
        });
      });

      console.log('[API Mocks] Global API route mocks applied');
    }

    await use(page);
  },
});
