import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Documents Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin documents page
    await page.goto('/admin/documents');
  });

  test('documents page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Documents/i })
    ).toBeVisible();

    await assertKapwaTokens(page);
  });

  test('documents page displays document table or cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Check for document table or cards
    const table = page.locator('table');
    const cards = page.locator('[class*="card"]');

    const hasContent = (await table.count()) > 0 || (await cards.count()) > 0;
    expect(hasContent).toBeTruthy();
  });
});
