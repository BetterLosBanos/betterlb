import { test, expect } from './test-config';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to home page before each test
    // API mocks are applied globally via fixtures.ts
    await page.goto('/');
  });

  test('home page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Municipal Government Portal/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // These patterns should not appear (raw Tailwind colors)
    expect(bodyHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
    expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
    expect(bodyHTML).not.toMatch(
      /border-(slate|gray|blue|green|red|yellow)-\d+/
    );

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('Hero section is displayed with search functionality', async ({
    page,
  }) => {
    // Check hero heading is visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Check search input exists
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Test search functionality
    await searchInput.fill('health');
    await page.waitForTimeout(300);

    // Should show search results
    const searchResults = page.locator('a[href*="/services/"]');
    const resultsCount = await searchResults.count();
    expect(resultsCount).toBeGreaterThan(0);

    // Clear search
    await searchInput.fill('');
    await page.waitForTimeout(300);
  });

  test('Hero section displays quick access cards', async ({ page }) => {
    // Check quick access section exists
    const quickAccessSection = page
      .locator('text=Quick Access')
      .or(page.locator('h2').filter({ hasText: /quick access/i }));
    await expect(quickAccessSection).toBeVisible();

    // Check quick access cards are displayed
    const quickAccessLinks = page.locator(
      'a[href="/transparency/financial"], a[href="/transparency/infrastructure"], a[href="/openlgu"], a[href="/statistics"]'
    );
    const linksCount = await quickAccessLinks.count();
    expect(linksCount).toBe(4);

    // Verify each link has proper structure
    for (const link of await quickAccessLinks.all()) {
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute('href');
    }
  });

  test('Hero section displays random service badges', async ({ page }) => {
    // Check service badges exist
    const serviceBadges = page.locator('a[href*="/services/"]').filter({
      has: page.locator('.badge, [class*="border-white/20"]'),
    });
    const badgesCount = await serviceBadges.count();

    // Should display 2 random services
    expect(badgesCount).toBeGreaterThanOrEqual(2);
  });

  test('ServicesSection displays service categories', async ({ page }) => {
    // Scroll to services section
    const servicesSection = page.locator('section').filter({
      hasText: /Government Services/i,
    });
    await expect(servicesSection).toBeVisible();

    // Check service category cards are displayed
    const categoryCards = page.locator('a[href*="/services?category="]');
    const cardsCount = await categoryCards.count();

    // Should display 8 categories
    expect(cardsCount).toBe(8);

    // Check first card has proper structure
    const firstCard = categoryCards.first();
    await expect(firstCard).toBeVisible();
    await expect(firstCard).toHaveAttribute('href', /\/services\?category=/);
  });

  test('ServicesSection cards use Kapwa semantic tokens', async ({ page }) => {
    // Get first category card
    const firstCard = page.locator('a[href*="/services?category="]').first();
    await expect(firstCard).toBeVisible();

    // Check for Kapwa tokens in card
    const cardHTML = await firstCard.innerHTML();
    expect(cardHTML).toMatch(/text-kapwa-text-/);
    expect(cardHTML).toMatch(/bg-kapwa-bg-/);
  });

  test('TimelineSection is displayed', async ({ page }) => {
    // Scroll to timeline section
    const timelineSection = page.locator('section').filter({
      hasText: /Recent Updates|Latest/i,
    });

    // Timeline section should be visible
    await expect(timelineSection).toBeVisible();
  });

  test('WeatherMapSection is displayed', async ({ page }) => {
    // Scroll to weather/map section
    const weatherSection = page
      .locator('section')
      .filter({
        has: page.locator('text=Weather, Forex & Tickers'),
      })
      .or(
        page.locator('section').filter({
          hasText: /Weather/i,
        })
      );

    // Weather section should be visible
    await expect(weatherSection).toBeVisible();
  });

  test('NewsSection is displayed', async ({ page }) => {
    // Scroll to news section
    const newsSection = page.locator('section').filter({
      hasText: /News|Updates|Announcements/i,
    });

    // News section should be visible
    await expect(newsSection).toBeVisible();
  });

  test('GovernmentSection is displayed', async ({ page }) => {
    // Scroll to government section
    const governmentSection = page.locator('section').filter({
      hasText: /Government|Officials|Departments/i,
    });

    // Government section should be visible
    await expect(governmentSection).toBeVisible();
  });

  test('All sections have consistent spacing', async ({ page }) => {
    // Check that sections are displayed with proper spacing
    const sections = page.locator('main > div > div > section');
    const sectionsCount = await sections.count();

    // Should have multiple sections
    expect(sectionsCount).toBeGreaterThanOrEqual(4);

    // Each section should be visible
    for (const section of await sections.all()) {
      await expect(section).toBeVisible();
    }
  });

  test('Navigation from home page works correctly', async ({ page }) => {
    // Test navigation to services
    const servicesLink = page.locator('a[href*="/services"]').first();
    await servicesLink.click();
    await page.waitForURL(/\/services/);
    expect(page.url()).toMatch(/\/services/);

    // Navigate back
    await page.goBack();

    // Test navigation to transparency
    const transparencyLink = page.locator('a[href*="/transparency"]').first();
    await transparencyLink.click();
    await page.waitForURL(/\/transparency/);
    expect(page.url()).toMatch(/\/transparency/);
  });

  test('Home page is responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Check hero section is still visible
    const heroHeading = page.locator('h1');
    await expect(heroHeading).toBeVisible();

    // Check search input is accessible
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();

    // Check quick access cards stack vertically on mobile
    const quickAccessCards = page.locator(
      'a[href="/transparency/financial"], a[href="/transparency/infrastructure"], a[href="/openlgu"], a[href="/statistics"]'
    );
    const firstCard = quickAccessCards.first();
    await expect(firstCard).toBeVisible();
  });

  test('Home page has proper accessibility features', async ({ page }) => {
    // Check for skip link (accessibility feature)
    const skipLink = page.locator('a[href^="#"]').filter({
      hasText: /Skip|jump to/i,
    });

    // Skip link should exist
    await expect(skipLink).toBeVisible();

    // Check main heading hierarchy
    const h1 = page.locator('h1');
    await expect(h1).toHaveCount(1);

    // Check links have descriptive text or aria-labels
    const quickAccessLinks = page.locator(
      'a[href="/transparency/financial"], a[href="/transparency/infrastructure"], a[href="/openlgu"], a[href="/statistics"]'
    );

    for (const link of await quickAccessLinks.all()) {
      const hasText = (await link.innerText()).trim().length > 0;
      const hasAriaLabel = await link.getAttribute('aria-label');
      expect(hasText || hasAriaLabel).toBeTruthy();
    }
  });

  test('Search results are clickable and navigate correctly', async ({
    page,
  }) => {
    // Enter search query
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('permit');
    await page.waitForTimeout(300);

    // Click first search result
    const firstResult = page.locator('a[href*="/services/"]').first();
    await firstResult.click();

    // Should navigate to service detail page
    await page.waitForURL(/\/services\//);
    expect(page.url()).toMatch(/\/services\/[^/]+$/);
  });

  test('Home page loads without console errors', async ({ page }) => {
    // Collect console errors during page load
    const errors: string[] = [];

    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should have no console errors
    expect(errors.filter(e => !e.includes('DevTools')).length).toBe(0);
  });
});

test.describe('Home Page - Visual Regression', () => {
  test('Hero section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    // Take snapshot of hero section
    const heroSection = page.locator('main > div > div').first();
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100,
    });
  });

  test('Services section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    // Scroll to services section
    const servicesSection = page.locator('section').filter({
      hasText: /Government Services/i,
    });
    await servicesSection.scrollIntoViewIfNeeded();

    // Take snapshot
    await expect(servicesSection).toHaveScreenshot('services-section.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Home Page - Accessibility', () => {
  test('Home page passes accessibility checks @a11y', async ({ page }) => {
    await page.goto('/');

    // Run accessibility checks
    // Note: Requires @axe-core/playwright to be installed
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessibilityScanResults = await (page as any).accessibility.scan();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
