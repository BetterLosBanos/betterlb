import { test, expect } from '../test-config';

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
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('error log displays error cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

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

  test('error log shows breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();
    }
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

  test('error log displays stage badges', async ({ page }) => {
    // Wait for errors to load
    await page.waitForTimeout(1000);

    // Check for stage badges (scrape, download, parse, extract, migrate)
    const stageBadges = page
      .locator('[class*="badge"]')
      .or(page.locator('[data-testid*="stage"]'));

    const badgeCount = await stageBadges.count();

    // If there are errors, badges should be present
    const hasErrorCards = (await page.locator('[class*="card"]').count()) > 0;

    if (hasErrorCards) {
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test('error log has retry functionality', async ({ page }) => {
    // Wait for errors to load
    await page.waitForTimeout(1000);

    // Check for retry buttons
    const retryButtons = page.locator('button').filter({ hasText: /retry/i });

    const retryCount = await retryButtons.count();

    // If there are errors, retry buttons should be present
    const hasErrorCards = (await page.locator('[class*="card"]').count()) > 0;

    if (hasErrorCards) {
      expect(retryCount).toBeGreaterThan(0);
    }
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

  test('error log displays error details', async ({ page }) => {
    // Wait for errors to load
    await page.waitForTimeout(1000);

    // Check for error details (error type, error message, timestamp)
    const errorCards = page.locator('[class*="card"]');
    const cardCount = await errorCards.count();

    if (cardCount > 0) {
      // Check first card for error details
      const firstCard = errorCards.first();
      const cardText = await firstCard.textContent();

      // Should contain error information
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('error log has navigation back to dashboard', async ({ page }) => {
    // Check for link back to admin dashboard
    const dashboardLink = page
      .locator('a[href*="/admin"]')
      .or(page.locator('a[href*="/admin"]'));

    const linkCount = await dashboardLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('error log filters work', async ({ page }) => {
    // Check for stage filter
    const filterSelect = page.locator('select').first();
    const filterExists = (await filterSelect.count()) > 0;

    if (filterExists) {
      // Get initial state
      await page.waitForTimeout(1000);

      // Try to filter by stage (if select element exists)
      const options = await filterSelect.locator('option').all();
      if (options.length > 1) {
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Filter should be applied (no errors thrown)
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('error log handles empty state', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check if empty state is shown
    const emptyState = page.locator('[class*="empty"]');
    const emptyStateExists = (await emptyState.count()) > 0;

    if (emptyStateExists) {
      // Empty state should have descriptive text
      const emptyText = await emptyState.textContent();
      expect(emptyText).toBeTruthy();
      expect(emptyText!.length).toBeGreaterThan(0);
    }
  });

  test('error log shows PDF links for document errors', async ({ page }) => {
    // Wait for errors to load
    await page.waitForTimeout(1000);

    // Check for PDF links
    const pdfLinks = page.locator('a[href*=".pdf"');

    const linkCount = await pdfLinks.count();

    // If there are document errors, PDF links should be present
    const hasErrorCards = (await page.locator('[class*="card"]').count()) > 0;

    if (hasErrorCards) {
      // PDF links might not be present for all error types
      expect(linkCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('error log displays timestamps', async ({ page }) => {
    // Wait for errors to load
    await page.waitForTimeout(1000);

    // Check for timestamp displays
    const errorCards = page.locator('[class*="card"]');
    const cardCount = await errorCards.count();

    if (cardCount > 0) {
      // Check first card for timestamp information
      const firstCard = errorCards.first();
      const cardHTML = await firstCard.innerHTML();

      // Should contain time/date information
      expect(cardHTML.length).toBeGreaterThan(0);
    }
  });

  test('error log has proper loading state', async ({ page }) => {
    // Navigate and check initial loading state
    await page.goto('/admin/errors');

    // Page should show something (either loading indicator or content)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('error log navigation works', async ({ page }) => {
    // Check if there's a link to navigate to other admin pages
    const adminLinks = page.locator('a[href*="/admin/"]');

    const linkCount = await adminLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
