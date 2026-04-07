import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Infrastructure Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to infrastructure page before each test
    await page.goto('/transparency/infrastructure');
  });

  test('infrastructure page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Infrastructure/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('infrastructure page displays stats cards', async ({ page }) => {
    // Check that stats cards are displayed
    const statsCards = page
      .locator('[class*="stats-card"]')
      .or(page.locator('[class*="StatsCard"]'));

    // Should have multiple stats cards
    const count = await statsCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    const firstCard = statsCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('infrastructure search functionality works', async ({ page }) => {
    // Check search input exists
    const searchInput = page
      .locator('input[placeholder*="Search"]')
      .or(page.locator('input[type="search"]'));
    await expect(searchInput).toBeVisible();

    // Type a search query
    await searchInput.fill('school');

    // Wait for search to apply
    await page.waitForTimeout(500);

    // Check that some interaction occurred (results updated or empty state shown)
    const bodyHTML = await page.locator('body').innerHTML();
    // The page should either show results or an empty state
    const hasResults =
      bodyHTML.includes('school') ||
      bodyHTML.includes('No results') ||
      bodyHTML.includes('0 projects');

    expect(hasResults).toBeTruthy();
  });

  test('infrastructure page has external links to DPWH and BISTO', async ({
    page,
  }) => {
    // Check for external links to DPWH dashboard
    const dpwhLink = page.locator('a[href*="transparency.bettergov.ph/dpwh"]');
    await expect(dpwhLink).toBeVisible();

    // Check for external links to BISTO
    const bistoLink = page.locator('a[href*="bisto.ph"]');
    await expect(bistoLink).toBeVisible();

    // Verify external links have appropriate attributes
    await expect(dpwhLink).toHaveAttribute('target', '_blank');
    await expect(dpwhLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('infrastructure page displays filter options', async ({ page }) => {
    // Check for status filters
    const filterButtons = page
      .locator('button')
      .filter({ hasText: /Status|All|Active|Completed/i });
    const filterCount = await filterButtons.count();

    // Should have filter options
    expect(filterCount).toBeGreaterThan(0);
  });

  test('infrastructure page has accessible skip link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('infrastructure project cards have proper structure', async ({
    page,
  }) => {
    // Wait for projects to load
    await page.waitForTimeout(1000);

    // Check for project cards or empty state
    const projectCards = page
      .locator('a[href*="/infrastructure/"]')
      .or(page.locator('[class*="project"]'));
    const cardCount = await projectCards.count();

    if (cardCount > 0) {
      // Check first card has proper elements
      const firstCard = projectCards.first();
      await expect(firstCard).toBeVisible();

      // Should have project title or name
      const cardText = await firstCard.textContent();
      expect(cardText?.length).toBeGreaterThan(0);
    } else {
      // Should show empty state if no projects
      const emptyState = page
        .locator('[class*="empty"]')
        .or(page.locator('text=/No results|0 projects/i'));
      await expect(emptyState).toBeVisible();
    }
  });

  test('infrastructure page breadcrumbs are present', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page
      .locator('nav[aria-label*="Breadcrumb"]')
      .or(page.locator('[class*="breadcrumb"]'));

    await expect(breadcrumbs).toBeVisible();
  });
});

test.describe('Infrastructure Detail Page', () => {
  test('infrastructure detail page displays project information', async ({
    page,
  }) => {
    // Navigate to infrastructure index first
    await page.goto('/transparency/infrastructure');

    // Wait for projects to load
    await page.waitForTimeout(1000);

    // Try to find a project link and navigate to detail page
    const projectLinks = page.locator('a[href*="/infrastructure/"]');
    const linkCount = await projectLinks.count();

    if (linkCount > 0) {
      // Click first project link
      await projectLinks.first().click();

      // Check we're on a detail page
      await expect(page).toHaveURL(/\/infrastructure\/.+/);

      // Verify Kapwa semantic tokens
      await assertKapwaTokens(page);

      // Check for project details (title, description, etc.)
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

  test('infrastructure transparency page visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('infrastructure-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
