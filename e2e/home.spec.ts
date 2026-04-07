import { test, expect } from './test-config';
import { assertKapwaTokens } from './utils/kapwa';

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Hero section with search and quick access', async ({ page }) => {
    // Hero heading is visible
    await expect(page.locator('h1')).toBeVisible();

    // Search functionality works
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('health');
    await page.waitForTimeout(300);
    await expect(page.locator('a[href*="/services/"]')).toHaveCount(1);

    // Clear search and verify quick access cards
    await searchInput.fill('');
    await expect(
      page.locator(
        'a[href="/transparency/financial"], a[href="/transparency/infrastructure"], a[href="/openlgu"], a[href="/statistics"]'
      )
    ).toHaveCount(4);
  });

  test('All main sections are displayed', async ({ page }) => {
    // Consolidated section check - verify each section exists
    const sections = [
      /Government Services/i,
      /Recent Updates|Latest/i,
      /Weather/i,
      /News|Updates|Announcements/i,
      /Government|Officials|Departments/i,
    ];

    for (const text of sections) {
      await expect(
        page.locator('section').filter({ hasText: text })
      ).toBeVisible();
    }
  });

  test('Services section displays 8 category cards', async ({ page }) => {
    const cards = page.locator('a[href*="/services?category="]');
    await expect(cards).toHaveCount(8);
    await expect(cards.first()).toBeVisible();
  });

  test('Page uses Kapwa semantic tokens', async ({ page }) => {
    await assertKapwaTokens(page);
  });

  test('Navigation links work correctly', async ({ page }) => {
    // Test multiple navigation paths in one test
    const links = [
      '/services',
      '/transparency/financial',
      '/government/elected-officials',
    ];

    for (const href of links) {
      await page.goto('/');
      await page.locator(`a[href*="${href}"]`).first().click();
      await page.waitForURL(new RegExp(href.replace('/', '\\/')));
      expect(page.url()).toMatch(new RegExp(href.replace('/', '\\/')));
    }
  });

  test('Mobile responsive', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
  });

  test('No console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(errors.filter(e => !e.includes('DevTools'))).toHaveLength(0);
  });
});

test.describe('Home Page - Visual Regression', () => {
  test('Hero section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    const heroSection = page.locator('main > div > div').first();
    await expect(heroSection).toHaveScreenshot('hero-section.png', {
      maxDiffPixels: 100,
    });
  });

  test('Services section visual snapshot @visual', async ({ page }) => {
    await page.goto('/');

    const servicesSection = page.locator('section').filter({
      hasText: /Government Services/i,
    });
    await servicesSection.scrollIntoViewIfNeeded();

    await expect(servicesSection).toHaveScreenshot('services-section.png', {
      maxDiffPixels: 100,
    });
  });
});

test.describe('Home Page - Accessibility', () => {
  test('Home page passes accessibility checks @a11y', async ({ page }) => {
    await page.goto('/');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const accessibilityScanResults = await (page as any).accessibility.scan();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
