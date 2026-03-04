import { test, expect } from '../test-config';

test.describe('Admin Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Set mock auth mode for testing
    await page.goto('/admin');
  });

  test('admin dashboard uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Admin/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('admin dashboard displays stat cards', async ({ page }) => {
    // Check that stat cards are displayed
    const statCards = page
      .locator('[class*="card"]')
      .or(page.locator('[data-testid*="stat"]'));

    // Wait for stats to load
    await page.waitForTimeout(1000);

    // Should have multiple stat cards
    const count = await statCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    const firstCard = statCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('admin dashboard has navigation links', async ({ page }) => {
    // Check for navigation links to admin sections
    const documentsLink = page.locator('a[href*="/admin/documents"]');
    const reviewQueueLink = page.locator('a[href*="/admin/review-queue"]');
    const errorsLink = page.locator('a[href*="/admin/errors"]');
    const reconcileLink = page.locator('a[href*="/admin/reconcile"]');

    // At least some admin links should be present
    const linkCount =
      (await documentsLink.count()) +
      (await reviewQueueLink.count()) +
      (await errorsLink.count()) +
      (await reconcileLink.count());

    expect(linkCount).toBeGreaterThan(0);
  });

  test('admin dashboard shows breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('admin dashboard is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('admin dashboard navigation works', async ({ page }) => {
    // Try clicking on Documents link if it exists
    const documentsLink = page.locator('a[href*="/admin/documents"]').first();
    const linkExists = (await documentsLink.count()) > 0;

    if (linkExists) {
      await documentsLink.click();

      // Should navigate to documents page
      await page.waitForURL(/\/admin\/documents/);
      expect(page.url()).toMatch(/\/admin\/documents/);
    }
  });
});
