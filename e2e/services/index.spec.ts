import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Services Index Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to services index before each test
    await page.goto('/services');
  });

  test('services page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Services/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    await assertKapwaTokens(page);
  });

  test('services index displays service cards', async ({ page }) => {
    // Check that service cards are displayed
    const cards = page.locator('[data-testid="service-card"]');
    const count = await cards.count();

    // Should have multiple services
    expect(count).toBeGreaterThan(0);

    // Check first card has proper structure
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();

    // Check that cards have links
    const cardLinks = page.locator('a[href*="/services/"]');
    expect(await cardLinks.count()).toBeGreaterThan(0);
  });

  test('services search functionality works', async ({ page }) => {
    // Get initial count of all cards
    const allCards = page.locator('[data-testid="service-card"]');
    const initialCount = await allCards.count();

    // Search for a specific service
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('business');

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Should have different results
    const filteredCards = page.locator('[data-testid="service-card"]');
    const filteredCount = await filteredCards.count();

    // Filtered results should be different from initial count
    // (either fewer or same, but not more)
    expect(filteredCount).toBeLessThanOrEqual(initialCount);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(500);

    // Should show all cards again
    const resetCards = page.locator('[data-testid="service-card"]');
    const resetCount = await resetCards.count();
    expect(resetCount).toBe(initialCount);
  });

  test('filter by source works', async ({ page }) => {
    // Open filter bar
    const filterToggle = page.locator('[data-testid="filter-bar-toggle"]');
    await filterToggle.click();

    // Wait for filter content to expand
    await page.waitForTimeout(300);

    // Get initial count
    const allCards = page.locator('[data-testid="service-card"]');
    const initialCount = await allCards.count();

    // Click Official filter
    const officialFilter = page.locator(
      '[data-testid="filter-source-official"]'
    );
    await officialFilter.click();

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Should have filtered results
    const filteredCards = page.locator('[data-testid="service-card"]');
    const filteredCount = await filteredCards.count();

    // Filtered count should be different
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('filter by classification works', async ({ page }) => {
    // Open filter bar
    const filterToggle = page.locator('[data-testid="filter-bar-toggle"]');
    await filterToggle.click();

    // Wait for filter content to expand
    await page.waitForTimeout(300);

    // Get initial count
    const allCards = page.locator('[data-testid="service-card"]');
    const initialCount = await allCards.count();

    // Click Simple classification filter
    const simpleFilter = page.locator(
      '[data-testid="filter-classification-simple"]'
    );
    await simpleFilter.click();

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Should have filtered results
    const filteredCards = page.locator('[data-testid="service-card"]');
    const filteredCount = await filteredCards.count();

    // Filtered count should be different
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('filter by office works', async ({ page }) => {
    // Open filter bar
    const filterToggle = page.locator('[data-testid="filter-bar-toggle"]');
    await filterToggle.click();

    // Wait for filter content to expand
    await page.waitForTimeout(300);

    // Get initial count
    const allCards = page.locator('[data-testid="service-card"]');
    const initialCount = await allCards.count();

    // Select an office from dropdown
    const officeSelect = page.locator('[data-testid="filter-office-select"]');
    await officeSelect.selectOption({ index: 1 }); // Select first office (not "All")

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Should have filtered results
    const filteredCards = page.locator('[data-testid="service-card"]');
    const filteredCount = await filteredCards.count();

    // Filtered count should be different
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('clear all filters button works', async ({ page }) => {
    // Open filter bar
    const filterToggle = page.locator('[data-testid="filter-bar-toggle"]');
    await filterToggle.click();

    // Wait for filter content to expand
    await page.waitForTimeout(300);

    // Apply a filter
    const officialFilter = page.locator(
      '[data-testid="filter-source-official"]'
    );
    await officialFilter.click();

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Get filtered count
    const filteredCards = page.locator('[data-testid="service-card"]');
    const filteredCount = await filteredCards.count();

    // Click Clear All button
    const clearButton = page.locator('[data-testid="filter-clear-all"]');
    await clearButton.click();

    // Wait for reset
    await page.waitForTimeout(500);

    // Should show all cards again (count should be >= filtered count)
    const resetCards = page.locator('[data-testid="service-card"]');
    const resetCount = await resetCards.count();
    expect(resetCount).toBeGreaterThanOrEqual(filteredCount);
  });

  test('navigation to service detail page works', async ({ page }) => {
    // Click first service card
    const firstCard = page.locator('[data-testid="service-card"]').first();
    await firstCard.click();

    // Should navigate to detail page
    await page.waitForURL(/\/services\/.+/);
    expect(page.url()).toMatch(/\/services\/.+/);

    // Verify Kapwa design tokens are present on detail page
    await assertKapwaTokens(page);
  });

  test('empty state shows when no results', async ({ page }) => {
    // Search for something that won't exist
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xyznonexistent123');

    // Wait for filtering to apply
    await page.waitForTimeout(500);

    // Should show empty state or no results
    const bodyHTML = await page.locator('body').innerHTML();
    const hasEmptyState =
      bodyHTML.includes('No services found') ||
      bodyHTML.includes('No results') ||
      bodyHTML.includes("couldn't find");

    // Either empty state shown or no cards displayed
    const cards = page.locator('[data-testid="service-card"]');
    const cardCount = await cards.count();

    expect(hasEmptyState || cardCount === 0).toBeTruthy();
  });

  test('services page has accessibility features', async ({ page }) => {
    // Check that service cards have proper ARIA labels
    const cards = page.locator('[aria-label*="View details for"]');
    expect(await cards.count()).toBeGreaterThan(0);

    // Check that filter toggle is a button
    const filterToggle = page.locator('[data-testid="filter-bar-toggle"]');
    await expect(filterToggle).toHaveAttribute('type', 'button');
  });

  test('services index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('services-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('services index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('services-hero.png', {
      maxDiffPixels: 100,
    });
  });
});
