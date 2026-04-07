import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Error Log', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to error log page
    await page.goto('/admin/errors');
  });

  test('error log page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Error Log/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('error log displays error cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that error cards or empty state is displayed
    const errorCards = page.locator('[class*="card"]');
    const emptyState = page.locator('[class*="empty"]');

    const cardCount = await errorCards.count();
    const emptyStateExists = (await emptyState.count()) > 0;

    // Should either have error cards or empty state
    expect(cardCount > 0 || emptyStateExists).toBeTruthy();
  });

  test('error log has filter controls', async ({ page }) => {
    // Check for stage filter dropdown
    const filterSelect = page
      .locator('select')
      .or(page.locator('[role="combobox"]'));

    const filterCount = await filterSelect.count();

    // Filter controls should be present (at least for stage filtering)
    expect(filterCount).toBeGreaterThan(0);
  });

  test('error log is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('error log has refresh button', async ({ page }) => {
    // Check for refresh button
    const refreshButton = page
      .locator('button')
      .filter({
        hasText: /refresh/i,
      })
      .or(page.locator('button[aria-label*="refresh"]'));

    const refreshExists = (await refreshButton.count()) > 0;
    expect(refreshExists).toBeTruthy();
  });

  test('error log has navigation back to dashboard', async ({ page }) => {
    // Check for link back to admin dashboard
    const dashboardLink = page
      .locator('a[href*="/admin"]')
      .or(page.locator('a[href*="/admin"]'));

    const linkCount = await dashboardLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
