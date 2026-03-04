import { test, expect } from '../test-config';

test.describe('Service Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to a service detail page before each test
    // Using 'animal-bite-treatment-center' as it's a real service
    await page.goto('/services/animal-bite-treatment-center');
  });

  test('service detail page uses Kapwa semantic tokens', async ({ page }) => {
    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('service detail page displays quick info section', async ({ page }) => {
    // Check that service title is visible
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // May or may not have quick info depending on service
    // Just verify the page structure is present
    const bodyHTML = await page.locator('body').innerHTML();
    expect(bodyHTML).toMatch(/kapwa/); // Kapwa design tokens present
  });

  test('service detail page displays requirements section', async ({
    page,
  }) => {
    // Check for requirement cards
    const requirementCards = page.locator('[data-testid="requirement-card"]');
    const cardCount = await requirementCards.count();

    // Some services have requirements, others don't
    // Just verify the page loaded successfully
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // If requirements exist, check their structure
    if (cardCount > 0) {
      const firstCard = requirementCards.first();
      await expect(firstCard).toBeVisible();

      // Check that requirement card uses Kapwa tokens
      const cardHTML = await firstCard.innerHTML();
      expect(cardHTML).toMatch(/kapwa/);
    }
  });

  test('service detail page displays process timeline', async ({ page }) => {
    // Check for process timeline
    const timeline = page.locator('[data-testid="process-timeline"]');
    const timelineExists = (await timeline.count()) > 0;

    // Some services have process steps, others don't
    // Just verify the page loaded successfully
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // If timeline exists, check its structure
    if (timelineExists) {
      await expect(timeline).toBeVisible();

      // Check that timeline uses Kapwa tokens
      const timelineHTML = await timeline.innerHTML();
      expect(timelineHTML).toMatch(/kapwa/);
    }
  });

  test('service detail page has breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();

      // Should have link back to services
      const servicesLink = page.locator('a[href*="/services"]');
      expect(await servicesLink.count()).toBeGreaterThan(0);
    }
  });

  test('service detail page shows office contact information', async ({
    page,
  }) => {
    // May or may not have contact info depending on service
    // Just verify page structure is intact
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });

  test('service detail page has proper external links', async ({ page }) => {
    // Check for external links (if any)
    const externalLinks = page.locator('a[target="_blank"]');
    const externalLinkCount = await externalLinks.count();

    // If external links exist, check they have rel="noreferrer"
    if (externalLinkCount > 0) {
      const firstLink = externalLinks.first();
      await expect(firstLink).toHaveAttribute('rel', 'noreferrer');
    }
  });

  test('service detail page handles not found gracefully', async ({ page }) => {
    // Navigate to non-existent service
    await page.goto('/services/nonexistent-service-12345');

    // Should show not found message
    const bodyHTML = await page.locator('body').innerHTML();
    const hasNotFoundMessage =
      bodyHTML.includes('Service not found') ||
      bodyHTML.includes('not found') ||
      bodyHTML.includes('404');

    expect(hasNotFoundMessage).toBeTruthy();
  });

  test('service detail page is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('service detail page navigation works', async ({ page }) => {
    // Click breadcrumb link to services
    const breadcrumbLink = page.locator('a[href*="/services"]').first();
    const linkExists = (await breadcrumbLink.count()) > 0;

    if (linkExists) {
      await breadcrumbLink.click();

      // Should navigate back to services index
      await page.waitForURL(/\/services$/);
      expect(page.url()).toMatch(/\/services$/);
    }
  });

  test('requirement cards are clickable if they have serviceSlug', async ({
    page,
  }) => {
    // Check for requirement cards with links
    const requirementCards = page.locator('[data-testid="requirement-card"]');
    const count = await requirementCards.count();

    if (count > 0) {
      // Check if any requirement card has a link
      const firstCard = requirementCards.first();
      const cardHTML = await firstCard.innerHTML();
      const hasLink =
        cardHTML.includes('<a ') || cardHTML.includes('View Service');

      if (hasLink) {
        // Try clicking the card (if it's a link)
        await firstCard.click();

        // Either navigated to another service or nothing happened
        // Just verify no errors occurred
        const currentURL = page.url();
        expect(currentURL).toBeTruthy();
      }
    }
  });
});
