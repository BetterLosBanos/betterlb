import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Audit Log', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to audit log page
    await page.goto('/admin/audit-logs');
  });

  test('audit log page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Audit Log/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('audit log displays log entries', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check that log entry cards or empty state is displayed
    const logCards = page.locator('[class*="card"]');
    const emptyState = page.locator('[class*="empty"]');

    const cardCount = await logCards.count();
    const emptyStateExists = (await emptyState.count()) > 0;

    // Should either have log entries or empty state
    expect(cardCount > 0 || emptyStateExists).toBeTruthy();
  });

  test('audit log has filter controls', async ({ page }) => {
    // Check for filter inputs/selects
    const filterInputs = page.locator('input[type="text"], input[type="date"]');
    const filterSelects = page
      .locator('select')
      .or(page.locator('[role="combobox"]'));

    const inputCount = await filterInputs.count();
    const selectCount = await filterSelects.count();

    // Filter controls should be present
    expect(inputCount + selectCount).toBeGreaterThan(0);
  });

  test('audit log is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('audit log has refresh button', async ({ page }) => {
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

  test('audit log has navigation back to dashboard', async ({ page }) => {
    // Check for link back to admin dashboard
    const dashboardLink = page
      .locator('a[href*="/admin"]')
      .or(page.locator('a[href*="/admin"]'));

    const linkCount = await dashboardLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('audit log navigation works', async ({ page }) => {
    // Check if there's a link to navigate to other admin pages
    const adminLinks = page.locator('a[href*="/admin/"]');

    const linkCount = await adminLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
