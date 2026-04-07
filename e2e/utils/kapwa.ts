import { expect, type Page } from '@playwright/test';

/**
 * Assert that the page uses Kapwa design system semantic tokens
 * and does not contain raw Tailwind color classes.
 */
export async function assertKapwaTokens(page: Page): Promise<void> {
  const bodyHTML = await page.locator('body').innerHTML();

  // Positive: Kapwa semantic tokens should be present
  expect(bodyHTML).toMatch(/text-kapwa-text-/);
  expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
  expect(bodyHTML).toMatch(/border-kapwa-border-/);

  // Negative: no raw Tailwind color classes
  expect(bodyHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
  expect(bodyHTML).not.toMatch(/border-(slate|gray|blue|green|red|yellow)-\d+/);
}
