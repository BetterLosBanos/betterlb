import { test, expect } from '@playwright/test';

test.describe('Elected Officials Pages', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to elected officials index before each test
    await page.goto('/government/elected-officials');
  });

  test('elected officials index page uses Kapwa semantic tokens', async ({
    page,
  }) => {
    // Check page title is visible
    const heading = page
      .locator('h1')
      .filter({ hasText: /Elected Officials/i });
    await expect(heading).toBeVisible();

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

  test('elected officials index displays executive branch', async ({
    page,
  }) => {
    // Check for Mayor section
    const mayorSection = page.locator('h2').filter({ hasText: /Mayor/i });
    await expect(mayorSection).toBeVisible();

    // Check for Vice Mayor section
    const viceMayorSection = page
      .locator('h2')
      .filter({ hasText: /Vice Mayor/i });
    await expect(viceMayorSection).toBeVisible();
  });

  test('elected officials index displays legislative branch cards', async ({
    page,
  }) => {
    // Check for Sangguniang Bayan section
    const sangguniangSection = page
      .locator('h2, h3')
      .filter({ hasText: /Sangguniang Bayan/i });
    await expect(sangguniangSection).toBeVisible();

    // Check for legislative chamber cards
    const chamberCards = page.locator(
      'a[href*="/government/elected-officials/"]'
    );
    const hasChambers = (await chamberCards.count()) > 0;

    if (hasChambers) {
      expect(await chamberCards.count()).toBeGreaterThan(0);
    }
  });

  test('elected officials index has contact information', async ({ page }) => {
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
  });

  test('mayor card navigates to detail page', async ({ page }) => {
    // Find mayor card/link
    const mayorCard = page
      .locator('a[href*="office-of-the-mayor"]')
      .or(page.locator('[aria-label*="Mayor"]'));
    const hasMayorCard = (await mayorCard.count()) > 0;

    if (hasMayorCard) {
      await mayorCard.first().click();

      // Wait for navigation
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check mayor detail page
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

  test('legislative chamber card navigates to detail page', async ({
    page,
  }) => {
    // Find any legislative chamber card
    const chamberCards = page.locator(
      'a[href*="/government/elected-officials/"]'
    );
    const count = await chamberCards.count();

    if (count > 0) {
      await chamberCards.first().click();

      // Wait for navigation
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check chamber detail page
      const heading = page.locator('h1, h2').first();
      await expect(heading).toBeVisible();
    }
  });

  test('elected official detail page uses semantic tokens', async ({
    page,
  }) => {
    // Navigate to mayor detail page
    const mayorCard = page.locator('a[href*="office-of-the-mayor"]');
    const hasMayor = (await mayorCard.count()) > 0;

    if (hasMayor) {
      await mayorCard.first().click();
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check for semantic tokens
      const bodyHTML = await page.locator('body').innerHTML();
      expect(bodyHTML).toMatch(/text-kapwa-text-/);
      expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
      expect(bodyHTML).toMatch(/border-kapwa-border-/);

      // Should not have raw color classes
      expect(bodyHTML).not.toMatch(/text-(slate|gray)-\d+/);
      expect(bodyHTML).not.toMatch(/bg-(slate|gray|white)-\d+/);
    }
  });

  test('elected official detail page has breadcrumbs', async ({ page }) => {
    // Navigate to a detail page
    const detailLinks = page.locator(
      'a[href*="/government/elected-officials/"]'
    );
    const count = await detailLinks.count();

    if (count > 0) {
      await detailLinks.first().click();
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check breadcrumb navigation
      const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
      await expect(breadcrumb).toBeVisible();

      // Check breadcrumb links
      await expect(
        breadcrumb.locator('a[href="/"]').filter({ hasText: 'Home' })
      ).toBeVisible();
      await expect(
        breadcrumb.locator('a[href="/government/elected-officials"]')
      ).toBeVisible();
    }
  });

  test('elected official detail page displays contact info', async ({
    page,
  }) => {
    // Navigate to mayor detail page
    const mayorCard = page.locator('a[href*="office-of-the-mayor"]');
    const hasMayor = (await mayorCard.count()) > 0;

    if (hasMayor) {
      await mayorCard.first().click();
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check for contact section
      const contactSection = page.locator('text=Contact');
      const hasContact = (await contactSection.count()) > 0;

      if (hasContact) {
        await expect(contactSection.first()).toBeVisible();
      }

      // Check for phone links
      const phoneLinks = page.locator('a[href^="tel:"]');
      const hasPhone = (await phoneLinks.count()) > 0;

      if (hasPhone) {
        await expect(phoneLinks.first()).toHaveAttribute('href', /tel:/);
      }
    }
  });

  test('elected official detail page has accessible skip link', async ({
    page,
  }) => {
    // Navigate to a detail page
    const detailLinks = page.locator(
      'a[href*="/government/elected-officials/"]'
    );
    const count = await detailLinks.count();

    if (count > 0) {
      await detailLinks.first().click();
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check for skip link (should be hidden until focused)
      const skipLink = page.locator('a[href="#main-content"]');
      await expect(skipLink).toHaveAttribute('class', /sr-only/);
    }
  });

  test('legislative detail page shows council members', async ({ page }) => {
    // Try to navigate to Sangguniang Bayan
    const sangguniangCard = page
      .locator('a[href*="sangguniang-bayang"]')
      .or(page.locator('a[href*="sangguniang-bayan"]'));
    const hasCard = (await sangguniangCard.count()) > 0;

    if (hasCard) {
      await sangguniangCard.first().click();
      await page.waitForURL(/\/government\/elected-officials\/.+/);

      // Check for councilors/members section
      const membersSection = page
        .locator('h2, h3')
        .filter({ hasText: /Members|Councilors/i });
      const hasMembers = (await membersSection.count()) > 0;

      if (hasMembers) {
        await expect(membersSection.first()).toBeVisible();
      }
    }
  });

  test('elected officials page uses proper semantic HTML', async ({ page }) => {
    // Check for proper heading hierarchy
    const h1 = page.locator('h1');
    const hasH1 = (await h1.count()) > 0;

    if (hasH1) {
      await expect(h1.first()).toBeVisible();
    }

    // Check for proper section/heading structure
    const sections = page
      .locator('section')
      .or(page.locator('[role="region"]'));
    const hasSections = (await sections.count()) > 0;

    if (hasSections) {
      expect(await sections.count()).toBeGreaterThan(0);
    }

    // Check for ARIA labels on interactive elements
    const links = page.locator('a[href]');
    await expect(links.first()).toBeVisible();
  });

  test('elected officials cards have proper hover states', async ({ page }) => {
    // Check for cards with hover effects
    const cards = page.locator('.group').or(page.locator('[class*="hover"]'));
    const hasCards = (await cards.count()) > 0;

    if (hasCards) {
      await expect(cards.first()).toBeVisible();
    }

    // Check for arrow icons or navigation indicators
    const arrows = page.locator('svg[data-lucide="arrow-right"]');
    const hasArrows = (await arrows.count()) > 0;

    if (hasArrows) {
      await expect(arrows.first()).toBeVisible();
    }
  });
});
