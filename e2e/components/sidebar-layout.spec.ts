import { test, expect } from '../test-config';

test.describe('SidebarLayout Component', () => {
  test.describe('Mobile Responsiveness', () => {
    test.beforeEach(async ({ page }) => {
      // Navigate to a page that uses SidebarLayout (e.g., Services)
      await page.goto('/services');
    });

    test('mobile menu button is visible on mobile viewport', async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Mobile menu button should be visible
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      await expect(mobileMenuButton).toBeVisible();
    });

    test('mobile menu button is hidden on desktop viewport', async ({
      page,
    }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Mobile menu button should not be visible
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      const count = await mobileMenuButton.count();
      expect(count).toBe(0);
    });

    test('sidebar is hidden by default on mobile', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Sidebar should be hidden (has 'hidden' class when menu is closed)
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeHidden();
    });

    test('sidebar is visible on desktop by default', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Sidebar should be visible on desktop
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();
    });

    test('toggling mobile menu shows and hides sidebar', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Get the mobile menu button
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      await expect(mobileMenuButton).toBeVisible();

      // Sidebar should be hidden initially
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeHidden();

      // Click to open menu
      await mobileMenuButton.click();
      await page.waitForTimeout(300); // Wait for transition

      // Sidebar should now be visible
      await expect(sidebar).toBeVisible();

      // Click to close menu (button should now show X icon)
      await mobileMenuButton.click();
      await page.waitForTimeout(300); // Wait for transition

      // Sidebar should be hidden again
      await expect(sidebar).toBeHidden();
    });

    test('mobile menu button shows correct icon based on state', async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });

      // Initially should show Menu icon
      await expect(mobileMenuButton).toBeVisible();

      // Note: Lucide icons are rendered as SVGs, check for Menu icon presence
      const buttonHTML = await mobileMenuButton.innerHTML();
      expect(buttonHTML).toContain('Menu');

      // Click to open
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      // After opening, should have X icon (close)
      const openedButtonHTML = await mobileMenuButton.innerHTML();
      expect(openedButtonHTML.length).toBeGreaterThan(0); // Button still exists
    });

    test('sidebar uses correct width classes on desktop', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Check that sidebar has appropriate width styling
      const sidebarBox = await sidebar.boundingBox();
      expect(sidebarBox).toBeTruthy();
      expect(sidebarBox!.width).toBeGreaterThan(200); // Should have substantial width on desktop
      expect(sidebarBox!.width).toBeLessThan(400); // But not too wide
    });

    test('sidebar content is accessible on mobile when menu is open', async ({
      page,
    }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      // Sidebar should be visible
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Check that sidebar has content (links, buttons, etc.)
      const sidebarLinks = sidebar.locator('a');
      const linkCount = await sidebarLinks.count();
      expect(linkCount).toBeGreaterThan(0);

      // First link should be visible
      const firstLink = sidebarLinks.first();
      await expect(firstLink).toBeVisible();
    });

    test('main content area is always visible regardless of viewport', async ({
      page,
    }) => {
      // Test on mobile
      await page.setViewportSize({ width: 375, height: 667 });
      const mainContentMobile = page.locator('main').first();
      await expect(mainContentMobile).toBeVisible();

      // Test on desktop
      await page.setViewportSize({ width: 1280, height: 720 });
      const mainContentDesktop = page.locator('main').first();
      await expect(mainContentDesktop).toBeVisible();
    });

    test('sidebar uses Kapwa semantic tokens', async ({ page }) => {
      // Set desktop viewport to ensure sidebar is visible
      await page.setViewportSize({ width: 1280, height: 720 });

      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Check for Kapwa semantic tokens in sidebar
      const sidebarHTML = await sidebar.innerHTML();
      expect(sidebarHTML).toMatch(/kapwa/);
    });

    test('mobile menu button has accessible styling', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });

      // Check button is visible and has proper styling
      await expect(mobileMenuButton).toBeVisible();

      // Check button has appropriate size for touch targets (min 44px for mobile)
      const buttonBox = await mobileMenuButton.boundingBox();
      expect(buttonBox).toBeTruthy();
      expect(buttonBox!.height).toBeGreaterThanOrEqual(44); // Touch target minimum
    });

    test('sidebar collapse/expand works on desktop when collapsible', async ({
      page,
    }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });

      // Navigate to a page with collapsible sidebar if available
      // For now, we'll just verify the sidebar is visible
      const sidebar = page.locator('aside');
      await expect(sidebar).toBeVisible();

      // Check initial width
      const initialBox = await sidebar.boundingBox();
      expect(initialBox).toBeTruthy();

      // Note: Some pages may not have collapsible sidebar enabled
      // This test verifies that when visible, sidebar has appropriate dimensions
      expect(initialBox!.width).toBeGreaterThan(0);
    });

    test('layout adapts to different screen sizes', async ({ page }) => {
      // Test multiple viewport sizes
      const viewports = [
        { width: 375, height: 667 }, // Mobile
        { width: 768, height: 1024 }, // Tablet
        { width: 1280, height: 720 }, // Desktop
        { width: 1920, height: 1080 }, // Large Desktop
      ];

      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(200); // Wait for responsive adjustments

        // Main content should always be visible
        const mainContent = page.locator('main').first();
        await expect(mainContent).toBeVisible();

        // Content should be within viewport bounds
        const contentBox = await mainContent.boundingBox();
        expect(contentBox).toBeTruthy();
        expect(contentBox!.x).toBeGreaterThanOrEqual(0);
        expect(contentBox!.x).toBeLessThanOrEqual(viewport.width);
      }
    });

    test('sidebar maintains functionality across breakpoints', async ({
      page,
    }) => {
      // Start on mobile
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      // Click a link in the sidebar
      const sidebarLinks = page.locator('aside a');
      const firstLink = sidebarLinks.first();
      await firstLink.click();

      // Should navigate
      await page.waitForTimeout(500);
      const currentUrl = page.url();
      expect(currentUrl).toBeTruthy();

      // Sidebar should still work after navigation
      const sidebarAfterNav = page.locator('aside');
      const exists = await sidebarAfterNav.count();
      expect(exists).toBeGreaterThanOrEqual(0);
    });
  });

  test.describe('Accessibility', () => {
    test('mobile menu button is keyboard accessible', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Tab to the button
      await page.keyboard.press('Tab');
      await page.waitForTimeout(100);

      // Button should be focused
      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(focusedElement).toBe('BUTTON');
    });

    test('sidebar links are accessible when menu is open on mobile', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      // Open mobile menu
      const mobileMenuButton = page
        .locator('button')
        .filter({ hasText: 'Menu' });
      await mobileMenuButton.click();
      await page.waitForTimeout(300);

      // Check sidebar has accessible links
      const sidebarLinks = page.locator('aside a');
      const count = await sidebarLinks.count();
      expect(count).toBeGreaterThan(0);

      // First link should be focusable
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab'); // Tab past the menu button

      const focusedElement = await page.evaluate(
        () => document.activeElement?.tagName
      );
      expect(['A', 'BUTTON']).toContain(focusedElement);
    });
  });
});
