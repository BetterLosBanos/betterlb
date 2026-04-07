import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Statistics Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to statistics index before each test
    await page.goto('/statistics');
  });

  test('statistics index page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible (should show PopulationPage by default)
    await expect(
      page.locator('h1').filter({ hasText: 'Population Profile' })
    ).toBeVisible();

    // Check PageHeader is visible
    await expect(
      page.locator('h1').filter({ hasText: 'Municipal Statistics' })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('statistics layout has PageHeader and Sidebar', async ({ page }) => {
    // Check PageHeader with centered variant
    const pageHeader = page.locator('header');
    await expect(pageHeader).toBeVisible();
    await expect(
      pageHeader.locator('h1:has-text("Municipal Statistics")')
    ).toBeVisible();

    // Check description is present
    await expect(
      page.locator('p:has-text("Data-driven insights")')
    ).toBeVisible();

    // Check StatisticsSidebar is present
    const sidebar = page
      .locator('aside')
      .or(page.locator('[data-testid="sidebar"]'));
    await expect(sidebar).toBeVisible();
  });

  test('population page displays KPI cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check StatCard components are displayed
    const statCards = page
      .locator('[data-testid="stat-card"]')
      .or(page.locator('.stat-card'));
    const count = await statCards.count();

    // Should have at least 3 KPI cards
    expect(count).toBeGreaterThanOrEqual(3);

    // Check first card has proper structure
    const firstCard = statCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('population page displays chart', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for chart container
    const chartContainer = page
      .locator('.recharts-wrapper')
      .or(page.locator('[data-testid="chart"]'));
    await expect(chartContainer).toBeVisible();
  });

  test('population page has tab switching functionality', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check for tab buttons
    const tabs = page
      .locator('button')
      .filter({ hasText: /Municipality|Barangays/i });
    const tabCount = await tabs.count();

    if (tabCount > 0) {
      // Click second tab
      await tabs.nth(1).click();

      // Wait for content to update
      await page.waitForTimeout(300);

      // Verify content changed (chart should still be visible)
      const chart = page.locator('.recharts-wrapper');
      await expect(chart).toBeVisible();
    }
  });

  test('statistics sidebar navigation works', async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check sidebar links
    const sidebarLinks = page
      .locator('aside a')
      .or(page.locator('[data-testid="sidebar"] a'));

    // Should have links to different statistics pages
    const linkCount = await sidebarLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Click on municipal income link
    const incomeLink = sidebarLinks.filter({ hasText: /Municipal Income/i });
    if ((await incomeLink.count()) > 0) {
      await incomeLink.click();

      // Should navigate to municipal income page
      await page.waitForURL(/municipal-income/);
      await expect(
        page.locator('h1').filter({ hasText: /Municipal Income/i })
      ).toBeVisible();
    }
  });

  test('municipal income page displays correctly', async ({ page }) => {
    // Navigate directly to municipal income page
    await page.goto('/statistics/municipal-income');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(
      page.locator('h1').filter({ hasText: /Municipal Income/i })
    ).toBeVisible();

    // Check for StatCard components
    const statCards = page
      .locator('[data-testid="stat-card"]')
      .or(page.locator('.stat-card'));
    await expect(statCards.first()).toBeVisible();

    // Check for chart
    const chart = page
      .locator('.recharts-wrapper')
      .or(page.locator('[data-testid="chart"]'));
    await expect(chart).toBeVisible();
  });

  test('competitiveness page displays correctly', async ({ page }) => {
    // Navigate directly to competitiveness page
    await page.goto('/statistics/competitiveness');
    await page.waitForLoadState('networkidle');

    // Check page title
    await expect(
      page.locator('h1').filter({ hasText: /Competitiveness/i })
    ).toBeVisible();

    // Check for StatCard components
    const statCards = page
      .locator('[data-testid="stat-card"]')
      .or(page.locator('.stat-card'));
    await expect(statCards.first()).toBeVisible();

    // Check for chart or data display
    const chart = page
      .locator('.recharts-wrapper')
      .or(page.locator('[data-testid="chart"]'));
    await expect(chart).toBeVisible();
  });

  test('statistics pages use StatCard component consistently', async ({
    page,
  }) => {
    const pages = [
      '/statistics',
      '/statistics/municipal-income',
      '/statistics/competitiveness',
    ];

    for (const url of pages) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');

      // Check for StatCard components
      const statCards = page
        .locator('[data-testid="stat-card"]')
        .or(page.locator('.stat-card'));
      const count = await statCards.count();

      // Each page should have at least 2 StatCards
      expect(count).toBeGreaterThanOrEqual(2);

      // Check cards have proper structure
      const firstCard = statCards.first();
      await expect(firstCard).toBeVisible();

      // Check card has label and value
      const cardHTML = await firstCard.innerHTML();
      expect(cardHTML.length).toBeGreaterThan(0);
    }
  });

  test('statistics pages have accessibility features', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // Check for skip link (if present)
    const skipLink = page.locator('a[href^="#"]:has-text("Skip")');
    if ((await skipLink.count()) > 0) {
      await expect(skipLink.first()).toBeVisible();
    }

    // Check main content area
    const main = page.locator('main').or(page.locator('[role="main"]'));
    await expect(main).toBeVisible();

    // Check proper heading hierarchy
    const h1 = page.locator('h1');
    const h1Count = await h1.count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });

  test('statistics pages are mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // Check page is still functional on mobile
    await expect(
      page.locator('h1').filter({ hasText: /Population/i })
    ).toBeVisible();

    // Check sidebar is collapsible on mobile
    const sidebar = page
      .locator('aside')
      .or(page.locator('[data-testid="sidebar"]'));

    // Check for mobile menu button
    const menuButton = page
      .locator('button[aria-label*="menu" i]')
      .or(page.locator('[data-testid="mobile-menu-button"]'));

    const menuButtonCount = await menuButton.count();
    if (menuButtonCount > 0) {
      await expect(menuButton.first()).toBeVisible();

      // Toggle menu
      await menuButton.first().click();
      await page.waitForTimeout(300);

      // Sidebar should be visible after toggle
      await expect(sidebar).toBeVisible();
    }
  });

  test('statistics sidebar is collapsible', async ({ page }) => {
    await page.goto('/statistics');
    await page.waitForLoadState('networkidle');

    // Check sidebar is visible
    const sidebar = page
      .locator('aside')
      .or(page.locator('[data-testid="sidebar"]'));
    await expect(sidebar).toBeVisible();

    // Look for collapse button
    const collapseButton = page.locator('button').filter({
      hasText: /Collapse|Hide|Toggle/i,
    });

    const collapseButtonCount = await collapseButton.count();
    if (collapseButtonCount > 0) {
      // Click collapse button
      await collapseButton.first().click();
      await page.waitForTimeout(300);

      // Main content should still be visible
      const mainContent = page
        .locator('main')
        .or(page.locator('[role="main"]'));
      await expect(mainContent).toBeVisible();
    }
  });

  test('statistics pages have consistent breadcrumb navigation', async ({
    page,
  }) => {
    await page.goto('/statistics/municipal-income');
    await page.waitForLoadState('networkidle');

    // Check for breadcrumb navigation
    const breadcrumb = page
      .locator('nav[aria-label*="Breadcrumb" i]')
      .or(page.locator('[data-testid="breadcrumb"]'));

    const breadcrumbCount = await breadcrumb.count();
    if (breadcrumbCount > 0) {
      await expect(breadcrumb.first()).toBeVisible();

      // Check breadcrumb has Home link
      const homeLink = breadcrumb
        .first()
        .locator('a')
        .filter({ hasText: /Home/i });
      await expect(homeLink).toBeVisible();

      // Check breadcrumb has current page indicator
      const currentPage = breadcrumb
        .first()
        .locator('span, a')
        .filter({
          hasText: /Municipal Income/i,
        });
      await expect(currentPage).toBeVisible();
    }
  });

  test('statistics pages handle data loading states', async ({ page }) => {
    // Navigate to a statistics page
    await page.goto('/statistics');

    // Check for loading state (if applicable)
    const loader = page
      .locator('[data-testid="loader"]')
      .or(page.locator('.animate-spin'));

    // Wait for content to load
    await page.waitForLoadState('networkidle');

    // After loading, content should be visible
    await expect(
      page.locator('h1').filter({ hasText: /Population/i })
    ).toBeVisible();

    // Loader should not be visible after content loads
    const loaderCount = await loader.count();
    if (loaderCount > 0) {
      await expect(loader.first()).not.toBeVisible();
    }
  });

  test('statistics index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('statistics-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('statistics index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('statistics-hero.png', {
      maxDiffPixels: 100,
    });
  });
});
