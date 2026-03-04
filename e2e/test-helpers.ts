/**
 * Mock API responses for E2E tests
 *
 * When the Functions backend is unavailable (e.g., in CI),
 * these mocks prevent ECONNREFUSED errors and provide
 * predictable test data.
 */

import type { Page } from '@playwright/test';

export const mockApiEndpoints = async (page: Page) => {
  // IMPORTANT: Register most specific routes FIRST (Playwright uses first-match)
  // Mock specific endpoints with realistic data

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

  await page.route('**/api/openlgu/terms**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        {
          id: 1,
          name: '12th Sangguniang Bayan',
          slug: '12th-sangguniang-bayan',
        },
      ]),
    });
  });

  // Catch-all for all other /api/* requests (register LAST)
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, offline: true }),
    });
  });
};

/**
 * Apply API mocks to page
 * Usage in test:
 * ```
 * test.beforeEach(async ({ page }) => {
 *   await mockApiEndpoints(page);
 *   await page.goto('/');
 * });
 * ```
 */
export const setupApiMocks = async (page: Page) => {
  // Only mock in CI or when backend is known to be unavailable
  const shouldMock =
    process.env.CI === 'true' || process.env.MOCK_API === 'true';

  if (shouldMock) {
    console.log('[API Mocks] Applying API route mocks...');
    await mockApiEndpoints(page);
    console.log('[API Mocks] Route mocks applied successfully');
  } else {
    console.log(
      '[API Mocks] Skipping mocks (CI=%s, MOCK_API=%s)',
      process.env.CI,
      process.env.MOCK_API
    );
  }
};
