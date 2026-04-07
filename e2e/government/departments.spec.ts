import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Departments Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to departments index before each test
    await page.goto('/government/departments');
  });

  test('departments index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    await assertKapwaTokens(page);
  });

  test('departments index displays all department cards', async ({ page }) => {
    // Check that department cards are displayed
    const cards = page.locator('a[href*="/government/departments/"]');
    const count = await cards.count();

    // Should have multiple departments
    expect(count).toBeGreaterThan(5);

    // Check first card has proper structure
    const firstCard = cards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('aria-label', /View details for/);
  });

  test('departments search functionality works', async ({ page }) => {
    // Get initial count of all cards
    const allCards = page.locator('a[href*="/government/departments/"]');
    const initialCount = await allCards.count();

    // Search for a specific department
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Health');

    // Wait for filtering to apply
    await page.waitForTimeout(300);

    // Should have fewer results
    const filteredCards = page.locator('a[href*="/government/departments/"]');
    const filteredCount = await filteredCards.count();
    expect(filteredCount).toBeLessThan(initialCount);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);

    // Should show all cards again
    const resetCards = page.locator('a[href*="/government/departments/"]');
    const resetCount = await resetCards.count();
    expect(resetCount).toBe(initialCount);
  });

  test('department detail page uses semantic tokens', async ({ page }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/departments\/.+/);

    // Check department header/heading is visible
    const heading = page.locator('h1, h2').first();
    await expect(heading).toBeVisible();

    await assertKapwaTokens(page);
  });

  test('department detail page has breadcrumbs', async ({ page }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/departments\/.+/);

    // Check breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    // Check breadcrumb links
    await expect(
      breadcrumb.locator('a[href="/"]').filter({ hasText: 'Home' })
    ).toBeVisible();
    await expect(
      breadcrumb.locator('a[href="/government/departments"]')
    ).toBeVisible();
  });

  test('department detail page displays contact information', async ({
    page,
  }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/departments\/.+/);

    // Check for contact section
    const contactSection = page.locator('text=Contact').first();
    const hasContact = (await contactSection.count()) > 0;

    if (hasContact) {
      await expect(contactSection).toBeVisible();

      // Check for phone links
      const phoneLinks = page.locator('a[href^="tel:"]');
      const hasPhone = (await phoneLinks.count()) > 0;

      if (hasPhone) {
        await expect(phoneLinks.first()).toBeVisible();
        await expect(phoneLinks.first()).toHaveAttribute('href', /tel:/);
      }

      // Check for email links
      const emailLinks = page.locator('a[href^="mailto:"]');
      const hasEmail = (await emailLinks.count()) > 0;

      if (hasEmail) {
        await expect(emailLinks.first()).toBeVisible();
        await expect(emailLinks.first()).toHaveAttribute('href', /mailto:/);
      }
    }
  });

  test('department detail page has accessible skip link', async ({ page }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/departments\/.+/);

    // Check for skip link (should be hidden until focused)
    const skipLink = page.locator('a[href="#main-content"]');
    await expect(skipLink).toHaveAttribute('class', /sr-only/);
  });

  test('department card shows department head when available', async ({
    page,
  }) => {
    // Get all department cards
    const cards = page.locator('a[href*="/government/departments/"]');

    // Check if any card has department head info
    for (let i = 0; i < Math.min(3, await cards.count()); i++) {
      const card = cards.nth(i);
      const hasHeadInfo =
        (await card.locator('text=Department Head').count()) > 0 ||
        (await card.locator('[aria-label*="head"]').count()) > 0;

      if (hasHeadInfo) {
        await expect(card.locator('svg').first()).toBeVisible();
        break;
      }
    }
  });

  test('department detail page may show associated services', async ({
    page,
  }) => {
    // Navigate to a department (try BPLO as it likely has services)
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('BPLO');
    await page.waitForTimeout(300);

    const bploCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    const hasCard = (await bploCard.count()) > 0;

    if (hasCard) {
      await bploCard.click();
      await page.waitForURL(/\/government\/departments\/.+/);

      // Check if services section exists (some departments may not have services)
      const servicesSection = page.locator('text=Services').first();
      const hasServices = (await servicesSection.count()) > 0;

      if (hasServices) {
        await expect(servicesSection).toBeVisible();
      }
    }
  });

  test('department card hover states work correctly', async ({ page }) => {
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();

    // Check card has hover class
    await expect(firstCard).toHaveClass(/group/);

    // Check for arrow icon
    const arrowIcon = firstCard.locator('svg[data-lucide="arrow-right"]');
    await expect(arrowIcon).toBeVisible();

    // Verify card has proper aria-label
    await expect(firstCard).toHaveAttribute('aria-label', /View details for/);
  });

  test('department detail page displays leadership section', async ({
    page,
  }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation
    await page.waitForURL(/\/government\/departments\/.+/);

    // Check for leadership section (may vary by department)
    const leadershipSection = page
      .locator('text=Leadership')
      .or(page.locator('text=Department Head'));
    const hasLeadership = (await leadershipSection.count()) > 0;

    if (hasLeadership) {
      await expect(leadershipSection.first()).toBeVisible();
    }
  });

  test('departments index page visual snapshot @visual', async ({ page }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('departments-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('departments index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    // Wait for page to fully load
    await page.waitForLoadState('networkidle');

    // Take snapshot of hero section
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('departments-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('department detail page visual snapshot @visual', async ({ page }) => {
    // Navigate to first department
    const firstCard = page
      .locator('a[href*="/government/departments/"]')
      .first();
    await firstCard.click();

    // Wait for navigation and load
    await page.waitForURL(/\/government\/departments\/.+/);
    await page.waitForLoadState('networkidle');

    // Take full page screenshot
    await expect(page).toHaveScreenshot('department-detail.png', {
      maxDiffPixels: 150,
    });
  });
});
