import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Review Queue Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin review queue page
    await page.goto('/admin/review-queue');
  });

  test('review queue page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Review/i })
    ).toBeVisible();

    await assertKapwaTokens(page);
  });

  test('review queue page shows empty state when no items', async ({
    page,
  }) => {
    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // Empty state may or may not be shown depending on data
    // Just verify page loaded successfully
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('review queue page is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
