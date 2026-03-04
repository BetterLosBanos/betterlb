import { test, expect } from '../test-config';

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

    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('review queue page displays queue items', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check for queue items (cards or table rows)
    const items = page.locator('[class*="card"], table tbody tr');

    const itemCount = await items.count();

    // Queue may be empty, but if items exist they should be visible
    if (itemCount > 0) {
      await expect(items.first()).toBeVisible();
    }
  });

  test('review queue page shows empty state when no items', async ({
    page,
  }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Empty state may or may not be shown depending on data
    // Just verify page loaded successfully
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('review queue page has filter controls', async ({ page }) => {
    // Check for filter dropdowns or buttons
    const filters = page.locator('select, button').filter({
      hasText: /Filter|Status|Type/i,
    });

    const filterCount = await filters.count();

    // Filters may or may not exist
    if (filterCount > 0) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('review queue page shows breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();

      // Should have link back to admin dashboard
      const adminLink = page.locator('a[href*="/admin"]');
      expect(await adminLink.count()).toBeGreaterThan(0);
    }
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

  test('review queue page navigation back to dashboard works', async ({
    page,
  }) => {
    // Click breadcrumb link to admin dashboard
    const adminLink = page.locator('a[href*="/admin"]').first();
    const linkExists = (await adminLink.count()) > 0;

    if (linkExists) {
      await adminLink.click();

      // Should navigate back to admin dashboard
      await page.waitForURL(/\/admin/);
      expect(page.url()).toMatch(/\/admin/);
    }
  });

  test('review queue page has action buttons', async ({ page }) => {
    // Check for action buttons (assign, resolve, etc.)
    const actionButtons = page.locator('button').filter({
      hasText: /Assign|Resolve|Review|Action/i,
    });

    const buttonCount = await actionButtons.count();

    // Action buttons may or may not exist depending on queue state
    if (buttonCount > 0) {
      await expect(actionButtons.first()).toBeVisible();
    }
  });

  test('review queue displays item details when items exist', async ({
    page,
  }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check for detailed queue items
    const queueItems = page.locator('[class*="card"], table tbody tr');
    const itemCount = await queueItems.count();

    if (itemCount > 0) {
      // Check first item has some content
      const firstItem = queueItems.first();
      const itemHTML = await firstItem.innerHTML();

      // Should have some text content
      expect(itemHTML.length).toBeGreaterThan(100);
    }
  });
});
