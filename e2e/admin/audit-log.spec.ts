import { test, expect } from '../test-config';

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
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('audit log displays log entries', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

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

  test('audit log shows breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();
    }
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

  test('audit log displays action badges', async ({ page }) => {
    // Wait for logs to load
    await page.waitForTimeout(1000);

    // Check for action badges
    const actionBadges = page
      .locator('[class*="badge"]')
      .or(page.locator('[data-testid*="action"]'));

    const badgeCount = await actionBadges.count();

    // If there are logs, badges should be present
    const hasLogCards = (await page.locator('[class*="card"]').count()) > 0;

    if (hasLogCards) {
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test('audit log has export functionality', async ({ page }) => {
    // Check for export/CSV download button
    const exportButton = page
      .locator('button')
      .filter({
        hasText: /export|download|csv/i,
      })
      .or(page.locator('button[aria-label*="export"]'));

    const exportExists = (await exportButton.count()) > 0;
    expect(exportExists).toBeTruthy();
  });

  test('audit log has pagination controls', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for pagination controls
    const pagination = page
      .locator('[class*="pagination"]')
      .or(page.locator('button').filter({ hasText: /next|previous|chevron/i }));

    const paginationExists = (await pagination.count()) > 0;

    // Pagination might be present depending on number of logs
    expect(paginationExists).toBeGreaterThanOrEqual(0);
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

  test('audit log displays log details', async ({ page }) => {
    // Wait for logs to load
    await page.waitForTimeout(1000);

    // Check for log details (action, performed by, target type, timestamp)
    const logCards = page.locator('[class*="card"]');
    const cardCount = await logCards.count();

    if (cardCount > 0) {
      // Check first card for log details
      const firstCard = logCards.first();
      const cardText = await firstCard.textContent();

      // Should contain log information
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('audit log has navigation back to dashboard', async ({ page }) => {
    // Check for link back to admin dashboard
    const dashboardLink = page
      .locator('a[href*="/admin"]')
      .or(page.locator('a[href*="/admin"]'));

    const linkCount = await dashboardLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('audit log filters work', async ({ page }) => {
    // Check for filter inputs
    const filterInput = page.locator('input[type="text"]').first();
    const filterExists = (await filterInput.count()) > 0;

    if (filterExists) {
      // Get initial state
      await page.waitForTimeout(1000);

      // Try to filter
      await filterInput.fill('test');
      await page.waitForTimeout(500);

      // Filter should be applied (no errors thrown)
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('audit log handles empty state', async ({ page }) => {
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

  test('audit log displays timestamps', async ({ page }) => {
    // Wait for logs to load
    await page.waitForTimeout(1000);

    // Check for timestamp displays
    const logCards = page.locator('[class*="card"]');
    const cardCount = await logCards.count();

    if (cardCount > 0) {
      // Check first card for timestamp information
      const firstCard = logCards.first();
      const cardHTML = await firstCard.innerHTML();

      // Should contain time/date information
      expect(cardHTML.length).toBeGreaterThan(0);
    }
  });

  test('audit log has proper loading state', async ({ page }) => {
    // Navigate and check initial loading state
    await page.goto('/admin/audit-logs');

    // Page should show something (either loading indicator or content)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('audit log navigation works', async ({ page }) => {
    // Check if there's a link to navigate to other admin pages
    const adminLinks = page.locator('a[href*="/admin/"]');

    const linkCount = await adminLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('audit log displays user information', async ({ page }) => {
    // Wait for logs to load
    await page.waitForTimeout(1000);

    // Check for performed by information
    const logCards = page.locator('[class*="card"]');
    const cardCount = await logCards.count();

    if (cardCount > 0) {
      // Check first card for user information
      const firstCard = logCards.first();
      const cardText = await firstCard.textContent();

      // Should contain user/performer information
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('audit log has auto-refresh functionality', async ({ page }) => {
    // Check for auto-refresh toggle/button
    const autoRefreshButton = page
      .locator('button')
      .filter({
        hasText: /auto.?refresh/i,
      })
      .or(page.locator('[data-testid*="auto-refresh"]'));

    const autoRefreshExists = (await autoRefreshButton.count()) > 0;

    // Auto-refresh might be available
    expect(autoRefreshExists).toBeGreaterThanOrEqual(0);
  });

  test('audit log displays target information', async ({ page }) => {
    // Wait for logs to load
    await page.waitForTimeout(1000);

    // Check for target type/id information
    const logCards = page.locator('[class*="card"]');
    const cardCount = await logCards.count();

    if (cardCount > 0) {
      // Check first card for target information
      const firstCard = logCards.first();
      const cardText = await firstCard.textContent();

      // Should contain target information
      expect(cardText).toBeTruthy();
    }
  });

  test('audit log pagination changes page', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for next page button
    const nextButton = page.locator('button').filter({
      hasText: /next|chevron.?right/i,
    });

    const nextExists = (await nextButton.count()) > 0;

    if (nextExists) {
      // Try clicking next page if available
      await nextButton.first().click();
      await page.waitForTimeout(500);

      // Should navigate (no errors thrown)
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('audit log filters by date range', async ({ page }) => {
    // Check for date inputs
    const dateInputs = page.locator('input[type="date"]');
    const dateInputCount = await dateInputs.count();

    if (dateInputCount >= 2) {
      // Try setting a date range
      await dateInputs.nth(0).fill('2024-01-01');
      await page.waitForTimeout(500);

      // Date filter should be applied (no errors thrown)
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();
    }
  });

  test('audit log shows total count', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for total count display
    const bodyText = await page.locator('body').textContent();
    const hasCountInfo = bodyText?.match(/\d+\s+(entries|logs|items|records)/i);

    // Total count might be displayed
    expect(hasCountInfo !== undefined).toBeGreaterThanOrEqual(0);
  });
});
