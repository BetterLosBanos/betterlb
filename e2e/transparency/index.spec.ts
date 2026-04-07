import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Transparency Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to transparency index before each test
    await page.goto('/transparency');
  });

  test('transparency index page loads successfully', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Transparency/i })
    ).toBeVisible();
  });

  test('transparency index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('transparency index displays navigation cards', async ({ page }) => {
    // Check that transparency section cards are displayed
    const cards = page.locator('a[href^="/transparency/"]');
    const count = await cards.count();

    // Should have multiple transparency sections
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
  });

  test('transparency section cards are navigable', async ({ page }) => {
    // Get all transparency section cards
    const cards = page.locator('a[href^="/transparency/"]');
    const firstCard = cards.first();

    // Navigate to first section
    await firstCard.click();

    // Should navigate to a transparency sub-page
    await page.waitForURL(/\/transparency\/.+/);

    // Check that page loaded
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();
  });

  test('transparency index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('transparency-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('transparency index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('transparency-hero.png', {
      maxDiffPixels: 100,
    });
  });
});
