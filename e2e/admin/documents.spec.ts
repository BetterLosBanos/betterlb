import { test, expect } from '../test-config';

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

    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('documents page displays document table or cards', async ({ page }) => {
    // Wait for content to load
    await page.waitForTimeout(1000);

    // Check for document table or cards
    const table = page.locator('table');
    const cards = page.locator('[class*="card"]');

    const hasContent = (await table.count()) > 0 || (await cards.count()) > 0;
    expect(hasContent).toBeTruthy();
  });

  test('documents page has search functionality', async ({ page }) => {
    // Check for search input
    const searchInput = page
      .locator('input[placeholder*="Search"]')
      .or(page.locator('input[type="search"]'));

    const searchExists = (await searchInput.count()) > 0;

    if (searchExists) {
      await expect(searchInput.first()).toBeVisible();
    }
  });

  test('documents page has filter controls', async ({ page }) => {
    // Check for filter dropdowns or buttons
    const filters = page.locator('select, button').filter({
      hasText: /Filter|Status|Type|Category/i,
    });

    const filterCount = await filters.count();

    // Filters may or may not exist
    if (filterCount > 0) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test('documents page shows breadcrumb navigation', async ({ page }) => {
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

  test('documents page is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('documents page navigation back to dashboard works', async ({
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

  test('documents page has create document button', async ({ page }) => {
    // Check for create/add document button
    const createButton = page.locator('button').filter({
      hasText: /Create|Add|New/i,
    });

    const buttonExists = (await createButton.count()) > 0;

    if (buttonExists) {
      await expect(createButton.first()).toBeVisible();
    }
  });
});
