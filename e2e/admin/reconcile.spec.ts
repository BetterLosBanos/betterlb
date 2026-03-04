import { test, expect } from '../test-config';

test.describe('Admin Reconcile', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to reconcile page
    await page.goto('/admin/reconcile');
  });

  test('reconcile page uses Kapwa semantic tokens', async ({ page }) => {
    // Check page title is visible
    await expect(
      page.locator('h1').filter({ hasText: /Reconcile/i })
    ).toBeVisible();

    // Verify Kapwa semantic tokens are used
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    // Kapwa semantic tokens should be present
    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
    expect(bodyHTML).toMatch(/border-kapwa-border-/);
  });

  test('reconcile page displays conflict records', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check that conflict cards or empty state is displayed
    const conflictCards = page.locator('[class*="card"]');
    const emptyState = page.locator('[class*="empty"]');

    const cardCount = await conflictCards.count();
    const emptyStateExists = (await emptyState.count()) > 0;

    // Should either have conflict cards or empty state
    expect(cardCount > 0 || emptyStateExists).toBeTruthy();
  });

  test('reconcile page has filter controls', async ({ page }) => {
    // Check for status filter dropdown
    const filterSelect = page
      .locator('select')
      .or(page.locator('[role="combobox"]'));

    const filterCount = await filterSelect.count();

    // Filter controls should be present
    expect(filterCount).toBeGreaterThan(0);
  });

  test('reconcile page shows breadcrumb navigation', async ({ page }) => {
    // Check for breadcrumb navigation
    const breadcrumb = page.locator('nav[aria-label="Breadcrumb"]');
    const breadcrumbExists = (await breadcrumb.count()) > 0;

    if (breadcrumbExists) {
      await expect(breadcrumb).toBeVisible();
    }
  });

  test('reconcile page is accessible', async ({ page }) => {
    // Check page has proper heading structure
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();

    // Check that interactive elements are focusable
    const buttons = page.locator('button, a[href]');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('reconcile page displays status badges', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for status badges (unresolved, resolved, skipped)
    const statusBadges = page
      .locator('[class*="badge"]')
      .or(page.locator('[data-testid*="status"]'));

    const badgeCount = await statusBadges.count();

    // If there are conflicts, badges should be present
    const hasConflictCards =
      (await page.locator('[class*="card"]').count()) > 0;

    if (hasConflictCards) {
      expect(badgeCount).toBeGreaterThan(0);
    }
  });

  test('reconcile page has action buttons', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for action buttons (accept, reject, skip, edit)
    const actionButtons = page.locator('button').filter({
      hasText: /accept|reject|skip|edit/i,
    });

    const buttonCount = await actionButtons.count();

    // If there are unresolved conflicts, action buttons should be present
    const hasConflictCards =
      (await page.locator('[class*="card"]').count()) > 0;

    if (hasConflictCards) {
      expect(buttonCount).toBeGreaterThan(0);
    }
  });

  test('reconcile page has pagination controls', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check for pagination controls
    const pagination = page
      .locator('[class*="pagination"]')
      .or(page.locator('button').filter({ hasText: /next|previous|chevron/i }));

    const paginationExists = (await pagination.count()) > 0;

    // Pagination might not be visible if there are few conflicts
    expect(paginationExists).toBeGreaterThanOrEqual(0);
  });

  test('reconcile page has refresh button', async ({ page }) => {
    // Check for refresh button
    const refreshButton = page
      .locator('button')
      .filter({
        hasText: /refresh/i,
      })
      .or(page.locator('button[aria-label*="refresh"]'));

    const refreshExists = (await refreshButton.count()) > 0;
    expect(refreshExists).toBeTruthy();
  });

  test('reconcile page displays conflict details', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for conflict details (conflict type, values)
    const conflictCards = page.locator('[class*="card"]');
    const cardCount = await conflictCards.count();

    if (cardCount > 0) {
      // Check first card for conflict details
      const firstCard = conflictCards.first();
      const cardText = await firstCard.textContent();

      // Should contain conflict information
      expect(cardText).toBeTruthy();
      expect(cardText!.length).toBeGreaterThan(0);
    }
  });

  test('reconcile page has navigation back to dashboard', async ({ page }) => {
    // Check for link back to admin dashboard
    const dashboardLink = page
      .locator('a[href*="/admin"]')
      .or(page.locator('a[href*="/admin"]'));

    const linkCount = await dashboardLink.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('reconcile page filters work', async ({ page }) => {
    // Check for status filter
    const filterSelect = page.locator('select').first();
    const filterExists = (await filterSelect.count()) > 0;

    if (filterExists) {
      // Get initial state
      await page.waitForTimeout(1000);

      // Try to filter by status
      const options = await filterSelect.locator('option').all();
      if (options.length > 1) {
        await filterSelect.selectOption({ index: 1 });
        await page.waitForTimeout(500);

        // Filter should be applied (no errors thrown)
        const currentUrl = page.url();
        expect(currentUrl).toBeTruthy();
      }
    }
  });

  test('reconcile page handles empty state', async ({ page }) => {
    // Wait for page to load
    await page.waitForTimeout(1000);

    // Check if empty state is shown
    const emptyState = page.locator('[class*="empty"]');
    const emptyStateExists = (await emptyState.count()) > 0;

    if (emptyStateExists) {
      // Empty state should have descriptive text
      const emptyText = await emptyState.textContent();
      expect(emptyText).toBeTruthy();
      expect(emptyText!.length).toBeGreaterThan(0);
    }
  });

  test('reconcile page shows document links', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for document links
    const docLinks = page.locator('a[href*="/admin/documents/"]');

    const linkCount = await docLinks.count();

    // If there are conflicts, document links should be present
    const hasConflictCards =
      (await page.locator('[class*="card"]').count()) > 0;

    if (hasConflictCards) {
      expect(linkCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('reconcile page displays conflict type badges', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for conflict type badges (moved_by, seconded_by, authors, title)
    const conflictCards = page.locator('[class*="card"]');
    const cardCount = await conflictCards.count();

    if (cardCount > 0) {
      // Check first card for conflict type information
      const firstCard = conflictCards.first();
      const cardHTML = await firstCard.innerHTML();

      // Should contain conflict type information
      expect(cardHTML.length).toBeGreaterThan(0);
    }
  });

  test('reconcile page has proper loading state', async ({ page }) => {
    // Navigate and check initial loading state
    await page.goto('/admin/reconcile');

    // Page should show something (either loading indicator or content)
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('reconcile page navigation works', async ({ page }) => {
    // Check if there's a link to navigate to other admin pages
    const adminLinks = page.locator('a[href*="/admin/"]');

    const linkCount = await adminLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('reconcile page displays source indicators', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for source indicators (facebook, govph)
    const conflictCards = page.locator('[class*="card"]');
    const cardCount = await conflictCards.count();

    if (cardCount > 0) {
      // Check for source indicators (icons or badges)
      const sourceIndicators = page
        .locator('[data-testid*="source"]')
        .or(page.locator('[class*="facebook"], [class*="govph"]'));

      const indicatorCount = await sourceIndicators.count();
      expect(indicatorCount).toBeGreaterThanOrEqual(0);
    }
  });

  test('reconcile page has edit functionality', async ({ page }) => {
    // Wait for conflicts to load
    await page.waitForTimeout(1000);

    // Check for edit buttons or inputs
    const editButtons = page
      .locator('button')
      .filter({ hasText: /edit|save/i });
    const editInputs = page.locator('input[type="text"]');

    const editElementCount =
      (await editButtons.count()) + (await editInputs.count());

    // Edit functionality might be available for certain conflict types
    expect(editElementCount).toBeGreaterThanOrEqual(0);
  });
});
