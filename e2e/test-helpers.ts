/**
 * Mock API responses for E2E tests
 *
 * When the Functions backend is unavailable (e.g., in CI),
 * these mocks prevent ECONNREFUSED errors and provide
 * predictable test data.
 */

import type { Page } from '@playwright/test';

export const mockApiEndpoints = async (page: Page) => {
  // Mock all /api/* requests
  await page.route('**/api/**', route => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: null, offline: true }),
    });
  });

  // Mock specific endpoints with realistic data if needed
  await page.route('**/api/openlgu/terms', route => {
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

  await page.route('**/api/weather', route => {
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
export const setupApiMocks = (page: Page) => {
  // Only mock in CI or when backend is known to be unavailable
  if (process.env.CI || process.env.MOCK_API === 'true') {
    return mockApiEndpoints(page);
  }
  return Promise.resolve();
};
