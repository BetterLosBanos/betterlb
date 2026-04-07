import { expect, type Page } from '@playwright/test';

/**
 * Assert that the page uses Kapwa design system semantic tokens
 * and does not contain raw Tailwind color classes.
 *
 * Note: Checks main content area only, excluding Navbar/Footer and code examples (<pre> tags).
 */
export async function assertKapwaTokens(page: Page): Promise<void> {
  // Check main content area instead of entire body to avoid Navbar/Footer legacy classes
  let mainHTML = await page.locator('main').innerHTML();

  // Remove <pre> tag contents (code examples that may show "wrong" usage as examples)
  mainHTML = mainHTML.replace(/<pre[^>]*>[\s\S]*?<\/pre>/gi, '');

  // Positive: Kapwa semantic tokens should be present
  expect(mainHTML).toMatch(/text-kapwa-text-/);
  expect(mainHTML).toMatch(/bg-kapwa-bg-/);
  expect(mainHTML).toMatch(/border-kapwa-border-/);

  // Negative: no raw Tailwind color classes in main content (excluding code examples)
  expect(mainHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(mainHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);
}
