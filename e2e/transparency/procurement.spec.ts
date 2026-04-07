import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Procurement Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to procurement page before each test
    await page.goto('/transparency/procurement');
  });

  test('procurement page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Procurement/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('procurement page displays stats cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check that stats cards are displayed
    const statsCards = page
      .locator('[class*="stats-card"]')
      .or(page.locator('[class*="StatsCard"]'));

    // Should have multiple stats cards (total amount, count, etc.)
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    const firstCard = statsCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('procurement search functionality works', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Check search input exists
    const searchInput = page
      .locator('input[placeholder*="Search"]')
      .or(page.locator('input[type="search"]'));
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('construction');

    // Wait for search to apply
    await page.waitForTimeout(500);

    // Check that some interaction occurred
    const bodyHTML = await page.locator('body').innerHTML();
    const hasResults =
      bodyHTML.includes('construction') ||
      bodyHTML.includes('No results') ||
      bodyHTML.includes('0 procurements');

    expect(hasResults).toBeTruthy();
  });

  test('procurement page has external links to PhilGEPS', async ({ page }) => {
    // Check for external links to PhilGEPS
    const philgepsLinks = page.locator('a[href*="philgeps.gov.ph"]');
    const linkCount = await philgepsLinks.count();

    // Should have at least one PhilGEPS link
    expect(linkCount).toBeGreaterThan(0);

    // Verify first link has appropriate attributes
    if (linkCount > 0) {
      await expect(philgepsLinks.first()).toHaveAttribute('target', '_blank');
      await expect(philgepsLinks.first()).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    }
  });

  test('procurement page displays procurement cards with proper information', async ({
    page,
  }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for procurement cards
    const procurementCards = page
      .locator('[class*="procurement"]')
      .or(page.locator('[class*="card"]'));
    const cardCount = await procurementCards.count();

    if (cardCount > 0) {
      // Check first card has proper elements
      const firstCard = procurementCards.first();
      await expect(firstCard).toBeVisible();

      // Should have procurement title
      const cardText = await firstCard.textContent();
      expect(cardText?.length).toBeGreaterThan(0);
    } else {
      // Should show empty state or no results if no procurements
      const emptyState = page
        .locator('[class*="empty"]')
        .or(page.locator('text=/No results|0 procurements/i'));
      await expect(emptyState).toBeVisible();
    }
  });

  test('procurement page has accessible skip link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('procurement page pagination works', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for pagination controls
    const pagination = page
      .locator('[class*="pagination"]')
      .or(page.locator('button').filter({ hasText: /\d+|Next|Previous/i }));
    const paginationCount = await pagination.count();

    if (paginationCount > 0) {
      // Should have pagination controls
      await expect(pagination.first()).toBeVisible();
    }
  });

  test('procurement page displays filters', async ({ page }) => {
    // Check for filter options
    const filters = page
      .locator('button')
      .filter({ hasText: /All|Notice|Award/i });
    const filterCount = await filters.count();

    // Should have filter options
    expect(filterCount).toBeGreaterThan(0);
  });

  test('procurement page breadcrumbs are present', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page
      .locator('nav[aria-label*="Breadcrumb"]')
      .or(page.locator('[class*="breadcrumb"]'));

    await expect(breadcrumbs).toBeVisible();
  });

  test('procurement page stats display aggregate information', async ({
    page,
  }) => {
    // Wait for stats to load
    await page.waitForTimeout(1000);

    // Check for stats cards
    const statsCards = page
      .locator('[class*="stats"]')
      .or(page.locator('[class*="StatsCard"]'));

    const statsCount = await statsCards.count();
    expect(statsCount).toBeGreaterThan(0);

    // Check that stats contain numbers
    if (statsCount > 0) {
      const firstCardText = await statsCards.first().textContent();
      expect(firstCardText?.length).toBeGreaterThan(0);
    }
  });

  test('procurement transparency page visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('procurement-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
