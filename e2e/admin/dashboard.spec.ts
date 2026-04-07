import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/admin');
  });

  test('admin dashboard uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('admin dashboard displays stat cards', async ({ page }) => {
    await page.waitForLoadState('networkidle');

    const statCards = page
      .locator('[class*="card"]')
      .or(page.locator('[data-testid*="stat"]'));

    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);

    const firstCard = statCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('admin dashboard has navigation links', async ({ page }) => {
    const documentsLink = page.locator('a[href*="/admin/documents"]');
    const reviewQueueLink = page.locator('a[href*="/admin/review-queue"]');
    const errorsLink = page.locator('a[href*="/admin/errors"]');
    const reconcileLink = page.locator('a[href*="/admin/reconcile"]');

    const linkCount =
      (await documentsLink.count()) +
      (await reviewQueueLink.count()) +
      (await errorsLink.count()) +
      (await reconcileLink.count());

    expect(linkCount).toBeGreaterThan(0);
  });

  test('admin dashboard is accessible', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });
});
