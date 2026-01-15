import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.describe('Better LB Sanity Suite', () => {
  // RULE 1: Accessibility (The most important for a government portal)
  test('should pass WCAG 2.1 Level AA checks', async ({ page }) => {
    await page.goto('/');
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);

    await page.goto('/services');
    const servicesResults = await new AxeBuilder({ page }).analyze();
    expect(servicesResults.violations).toEqual([]);
  });

  // RULE 2: Search Logic (Ensures the JSON-to-UI bridge isn't broken)
  test('search functionality should filter services', async ({ page }) => {
    await page.goto('/services');
    const searchInput = page.getByPlaceholder(/Search for services/i);
    await searchInput.fill('Business');
    // Ensure at least one result card appears
    await expect(page.locator('article'))
      .count()
      .then(c => expect(c).toBeGreaterThan(0));
  });

  // RULE 3: Navigation & Breadcrumbs (Ensures the site "Flow" works)
  test('directory navigation should be intact', async ({ page }) => {
    await page.goto('/government/departments');
    await page.getByText('Engineering').first().click();
    await expect(page.url()).toContain(
      '/government/departments/municipal-engineering-office'
    );
    // Ensure the Breadcrumb component is working
    await expect(page.locator('nav[aria-label="breadcrumb"]')).toBeVisible();
  });

  // RULE 4: Touch Targets (Ensures mobile users and people with motor impairments can use the site)
  test('interactive elements must meet 44px target size', async ({ page }) => {
    await page.goto('/');
    const primaryLinks = page.locator('a.group, button');
    const box = await primaryLinks.first().boundingBox();
    if (box) {
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
  });
});
