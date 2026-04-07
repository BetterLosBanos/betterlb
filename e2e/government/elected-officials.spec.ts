import { test, expect } from '../test-config';
import { assertKapwaTokens } from '../utils/kapwa';

test.describe('Elected Officials Pages', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/government/elected-officials');
  });

  test('elected officials index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    await assertKapwaTokens(page);
  });

  test('elected officials index displays executive branch', async ({
    page,
  }) => {
    // Mayor and Vice Mayor are now h3 inside DetailSection on the index page
    const mayorSection = page
      .locator('h3, h2')
      .filter({ hasText: /Mayor/i })
      .first();
    await expect(mayorSection).toBeVisible();
  });

  test('elected officials index displays legislative branch', async ({
    page,
  }) => {
    // Sangguniang Bayan section is now rendered directly on the index page
    const sangguniangSection = page
      .locator('h2, h3, [class*="text-kapwa"]')
      .filter({ hasText: /Sangguniang Bayan/i })
      .first();
    await expect(sangguniangSection).toBeVisible();
  });

  test('elected officials index has contact information', async ({ page }) => {
    const phoneLinks = page.locator('a[href^="tel:"]');
    const hasPhone = (await phoneLinks.count()) > 0;

    if (hasPhone) {
      await expect(phoneLinks.first()).toBeVisible();
      await expect(phoneLinks.first()).toHaveAttribute('href', /tel:/);
    }

    const emailLinks = page.locator('a[href^="mailto:"]');
    const hasEmail = (await emailLinks.count()) > 0;

    if (hasEmail) {
      await expect(emailLinks.first()).toBeVisible();
      await expect(emailLinks.first()).toHaveAttribute('href', /mailto:/);
    }
  });

  test('mayor card links to OpenLGU profile if available', async ({ page }) => {
    // Mayor cards with personId link to /openlgu/person/:id
    const mayorProfileLink = page
      .locator('a[href*="/openlgu/person/"]')
      .first();
    const hasProfileLink = (await mayorProfileLink.count()) > 0;

    if (hasProfileLink) {
      await expect(mayorProfileLink).toBeVisible();
      await expect(mayorProfileLink).toHaveAttribute(
        'href',
        /\/openlgu\/person\//
      );
    }
  });

  test('committees link navigates to committees page', async ({ page }) => {
    // The index now links to /government/elected-officials/committees
    const committeesLink = page.locator(
      'a[href*="/government/elected-officials/committees"]'
    );
    await expect(committeesLink).toBeVisible();

    await committeesLink.click();
    await page.waitForURL(/\/government\/elected-officials\/committees/);

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('committees page uses semantic tokens', async ({ page }) => {
    await page.goto('/government/elected-officials/committees');

    await assertKapwaTokens(page);
  });

  test('committees page has search functionality', async ({ page }) => {
    await page.goto('/government/elected-officials/committees');

    const searchInput = page
      .locator('input[placeholder*="Search"]')
      .or(page.locator('input[type="search"]'));
    await expect(searchInput).toBeVisible();

    await searchInput.fill('finance');
    await page.waitForTimeout(300);

    // Results should filter
    const results = page.locator('[class*="card"], article');
    const count = await results.count();
    expect(count).toBeGreaterThan(0);
  });

  test('elected officials page uses proper semantic HTML', async ({ page }) => {
    const h1 = page.locator('h1');
    await expect(h1.first()).toBeVisible();

    const sections = page
      .locator('section')
      .or(page.locator('[role="region"]'));
    const hasSections = (await sections.count()) > 0;

    if (hasSections) {
      expect(await sections.count()).toBeGreaterThan(0);
    }

    const links = page.locator('a[href]');
    await expect(links.first()).toBeVisible();
  });

  test('elected officials cards have proper hover states', async ({ page }) => {
    const cards = page.locator('.group').or(page.locator('[class*="hover"]'));
    const hasCards = (await cards.count()) > 0;

    if (hasCards) {
      await expect(cards.first()).toBeVisible();
    }
  });

  test('elected officials index page has breadcrumbs', async ({ page }) => {
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    await expect(breadcrumb).toBeVisible();

    await expect(
      breadcrumb.locator('a').filter({ hasText: /Government/i })
    ).toBeVisible();
  });

  test('elected officials index page visual snapshot @visual', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('elected-officials-index.png', {
      maxDiffPixels: 150,
    });
  });

  test('elected officials index page hero section visual snapshot @visual', async ({
    page,
  }) => {
    await page.waitForLoadState('networkidle');
    const heroSection = page.locator('main').first();
    await expect(heroSection).toHaveScreenshot('elected-officials-hero.png', {
      maxDiffPixels: 100,
    });
  });

  test('committees page visual snapshot @visual', async ({ page }) => {
    await page.goto('/government/elected-officials/committees');
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveScreenshot('elected-officials-committees.png', {
      maxDiffPixels: 150,
    });
  });
});
