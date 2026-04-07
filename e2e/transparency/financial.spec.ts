import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Financial Transparency Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to financial page before each test
    await page.goto('/transparency/financial');
  });

  test('financial page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Financial/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('financial page displays summary cards', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check that summary cards are displayed
    const summaryCards = page
      .locator('[class*="summary"]')
      .or(page.locator('[class*="Summary"]'));

    // Should have summary cards (annual budget, expenditures, etc.)
    const count = await summaryCards.count();
    expect(count).toBeGreaterThan(0);

    // Check first card is visible
    const firstCard = summaryCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('financial page displays pie chart', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for chart container
    const chartContainer = page
      .locator('[class*="chart"]')
      .or(page.locator('svg').or(page.locator('canvas')));

    // Should have some form of chart visualization
    const chartCount = await chartContainer.count();
    expect(chartCount).toBeGreaterThan(0);
  });

  test('financial page has quarter toggle', async ({ page }) => {
    // Check for quarter toggle buttons
    const quarterButtons = page.locator('button').filter({
      hasText: /Q1|Q2|Q3|Q4|Quarter/i,
    });
    const buttonCount = await quarterButtons.count();

    // Should have quarter selection options
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('financial page has accessible skip link', async ({ page }) => {
    // Check for skip link
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toBeVisible();
  });

  test('financial page displays budget information', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for budget information (peso amounts)
    const bodyText = await page.locator('body').textContent();
    const hasAmount = bodyText?.includes('₱') || bodyText?.includes('PHP');

    // Should display monetary values
    expect(hasAmount).toBeTruthy();
  });

  test('financial page breadcrumbs are present', async ({ page }) => {
    // Check for breadcrumbs
    const breadcrumbs = page
      .locator('nav[aria-label*="Breadcrumb"]')
      .or(page.locator('[class*="breadcrumb"]'));

    await expect(breadcrumbs).toBeVisible();
  });

  test('financial page displays expenditure breakdown', async ({ page }) => {
    // Wait for data to load
    await page.waitForTimeout(1000);

    // Check for expenditure categories or breakdown
    const categories = page
      .locator('[class*="category"]')
      .or(page.locator('[class*="breakdown"]'))
      .or(page.locator('text=/Budget|Expenditure|Income/i'));

    // Should have financial categories or breakdown
    const categoryCount = await categories.count();
    expect(categoryCount).toBeGreaterThan(0);
  });

  test('financial page quarter toggle updates display', async ({ page }) => {
    // Wait for initial load
    await page.waitForTimeout(1000);

    // Check for quarter buttons
    const quarterButtons = page.locator('button').filter({
      hasText: /Q1|Q2|Q3|Q4/i,
    });
    const buttonCount = await quarterButtons.count();

    if (buttonCount > 0) {
      // Click a different quarter
      await quarterButtons.nth(1).click();

      // Wait for update
      await page.waitForTimeout(500);

      // Verify page is still responsive
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('financial transparency page visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('financial-transparency.png', {
      maxDiffPixels: 150,
    });
  });
});
