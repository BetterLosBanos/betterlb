import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Bids Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to bids page before each test
    await page.goto('/transparency/bids');
  });

  test('bids page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Bids|Invitation/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('bids page has accessible skip link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('bids page displays bid information', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for bid listings or information
    const bidContent = page
      .locator('[class*="bid"]')
      .or(page.locator('text=/Invitation|Notice|Award/i'));

    // Should have some bid-related content
    const contentCount = await bidContent.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('bids page breadcrumbs are present', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page
      .locator('nav[aria-label*="Breadcrumb"]')
      .or(page.locator('[class*="breadcrumb"]'));

    await expect(breadcrumbs).toBeVisible();
  });

  test('bids page displays external links if available', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for external links (e.g., to PhilGEPS)
    const externalLinks = page.locator('a[href*="http"]').filter({
      hasText: /^(?!.*\/transparency)/, // Not internal links
    });

    const linkCount = await externalLinks.count();

    // If external links exist, verify they have proper attributes
    if (linkCount > 0) {
      await expect(externalLinks.first()).toHaveAttribute('target', '_blank');
      await expect(externalLinks.first()).toHaveAttribute(
        'rel',
        'noopener noreferrer'
      );
    }
  });

  test('bids page has proper heading structure', async ({ page }) => {
    // Check for h1 heading
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Verify heading contains relevant text
    const h1Text = await h1.textContent();
    expect(h1Text?.length).toBeGreaterThan(0);
  });
});

test.describe('Transparency Index Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to transparency index before each test
    await page.goto('/transparency');
  });

  test('transparency index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Transparency/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('transparency index has navigation to subpages', async ({ page }) => {
    // Check for links to transparency subpages
    const transparencyLinks = page.locator('a[href*="/transparency/"]');
    const linkCount = await transparencyLinks.count();

    // Should have links to infrastructure, procurement, financial, etc.
    expect(linkCount).toBeGreaterThan(0);

    // Verify first link is visible
    await expect(transparencyLinks.first()).toBeVisible();
  });

  test('transparency index has accessible skip link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('transparency index displays overview information', async ({ page }) => {
    // Check for overview or description content
    const content = page
      .locator('p, .description, .overview')
      .or(page.locator('text=/budget|procurement|infrastructure|financial/i'));

    const contentCount = await content.count();
    expect(contentCount).toBeGreaterThan(0);
  });

  test('transparency index breadcrumbs are present', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page
      .locator('nav[aria-label*="Breadcrumb"]')
      .or(page.locator('[class*="breadcrumb"]'));

    await expect(breadcrumbs).toBeVisible();
  });

  test('transparency index has sidebar navigation', async ({ page }) => {
    // Check for transparency sidebar
    const sidebar = page
      .locator('[class*="sidebar"]')
      .or(page.locator('[class*="Sidebar"]'));

    await expect(sidebar).toBeVisible();
  });

  test('transparency index links work correctly', async ({ page }) => {
    // Get first transparency subpage link
    const subpageLink = page.locator('a[href*="/transparency/"]').first();

    // Click link
    await subpageLink.click();

    // Verify navigation occurred
    await expect(page).toHaveURL(/\/transparency\/.+/);

    // Verify new page uses Kapwa tokens
    await assertKapwaTokens(page);
  });

  test('bids and awards page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('bids-awards.png', {
      maxDiffPixels: 150,
    });
  });
});
