import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Barangays Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to barangays index before each test
    await page.goto('/government/barangays');
  });

  test('barangays index page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('barangays index displays all barangay cards', async ({ page }) => {
    // Check that barangay cards are displayed
    const cards = page.locator('a[href*="/government/barangays/"]');
    const count = await cards.count();

    // Should have multiple barangays (Los Baños has 14 barangays)
    expect(count).toBeGreaterThan(10);

    // Check first card has proper structure
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard.locator('[aria-label*="View profile"]')).toHaveCount(
      count
    );
  });

  test('barangays search functionality works', async ({ page }) => {
    // Get initial count of all cards
    const allCards = page.locator('a[href*="/government/barangays/"]');
    const initialCount = await allCards.count();

    // Search for a specific barangay
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Anos');

    // Wait for filtering to apply
    await page.waitForTimeout(300);

    // Should have fewer results
    const filteredCards = page.locator('a[href*="/government/barangays/"]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThan(initialCount);
    expect(filteredCount).toBeGreaterThan(0);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Should show all cards again
    const resetCards = page.locator('a[href*="/government/barangays/"]');
    const resetCount = await resetCards.count();
    expect(resetCount).toBe(initialCount);
  });

  test('barangay detail page uses semantic tokens', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check barangay header is visible
    const header = page.locator('header[role="banner"]');
    await expect(header).toBeVisible();

    await assertKapwaTokens(page);
  });

  test('barangay detail page displays officials section', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check officials heading
    const officialsHeading = page
      .locator('h2')
      .filter({ hasText: 'Barangay Officials' });
    await expect(officialsHeading).toBeVisible();

    // Check for official cards
    const officialCards = page.locator('[role="group"]');
    await expect(officialCards.first()).toBeVisible();

    // Check for Punong Barangay section
    const punongSection = page
      .locator('p')
      .filter({ hasText: 'Chief Executive' });
    await expect(punongSection).toBeVisible();
  });

  test('barangay detail page has breadcrumbs', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Check breadcrumb links
    await expect(
      breadcrumb.locator('a[href="/"]').filter({ hasText: 'Home' })
    ).toBeVisible();
    await expect(
      breadcrumb.locator('a[href="/government/barangays"]')
    ).toBeVisible();
  });

  test('barangay detail page has accessible skip link', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check for skip link (should be hidden until focused)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveAttribute('class', /sr-only/);
  });

  test('barangay card hover states work correctly', async ({ page }) => {
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();

    // Check card has hover class
    await expect(firstCard).toHaveClass(/group/);

    // Check for arrow icon that shows on hover
    const arrowIcon = firstCard.locator('svg').last();
    await expect(arrowIcon).toBeVisible();

    // Verify card has proper aria-label
    await expect(firstCard).toHaveAttribute(
      'aria-label',
      /View profile of Barangay/
    );
  });

  test('barangay detail page displays contact information', async ({
    page,
  }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check for contact section in header
    const header = page.locator('header[role="banner"]');

    // Check for phone icon/link
    const phoneLink = header.locator('a[href^="tel:"]').first();
    const hasPhone = (await phoneLink.count()) > 0;

    // Some barangays may not have phone numbers, that's okay
    if (hasPhone) {
      await expect(phoneLink).toBeVisible();
      await expect(phoneLink).toHaveAttribute('href', /tel:/);
    }
  });

  test('sidebar navigation works on detail pages', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/barangays\/.+/);

    // Check sidebar exists on mobile (should be collapsed)
    const sidebar = page.locator('aside');
    await expect(sidebar).toBeVisible();

    // On mobile, sidebar should have mobile menu button
    const mobileMenuButton = page.locator('button').filter({ hasText: 'Menu' });
    const hasMobileMenu = (await mobileMenuButton.count()) > 0;

    if (hasMobileMenu) {
      await expect(mobileMenuButton).toBeVisible();
    }
  });

  test('barangays index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('barangays-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('barangays index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('barangays-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('barangay detail page visual snapshot @visual', async ({ page }) => {
    // Navigate to first barangay
    const firstCard = page.locator('a[href*="/government/barangays/"]').first();
    await firstCard.click();

    // Wait for navigation and load
    await page.waitForURL(/\/government\/barangays\/.+/);
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('barangay-detail.png', {
      maxDiffPixels: 150,
    });
  });
});
