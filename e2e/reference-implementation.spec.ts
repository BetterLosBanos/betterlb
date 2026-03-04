import { test, expect } from './test-config';

test('reference page uses semantic tokens', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check page title and subtitle
  const title = page.locator('h1');
  await expect(title).toContainText('Reference Implementation');

  // Check Kapwa semantic classes are used
  const hero = page.locator('[class*="bg-kapwa-bg-surface-bold"]');
  await expect(hero).toBeVisible();

  const heading = page.locator('.kapwa-heading-md').first();
  await expect(heading).toBeVisible();
  await expect(heading).toContainText('Basic Card');

  // Check no raw color classes
  const body = page.locator('body');
  const bodyHTML = await body.innerHTML();

  // These patterns should not appear (raw Tailwind colors)
  expect(bodyHTML).not.toMatch(/text-(slate|gray)-\d+/);
  expect(bodyHTML).not.toMatch(/bg-(slate|gray|white)-\d+/);
  expect(bodyHTML).not.toMatch(/border-(slate|gray)-\d+/);

  // Verify Kapwa semantic tokens are present
  expect(bodyHTML).toMatch(/text-kapwa-text-/);
  expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
  expect(bodyHTML).toMatch(/border-kapwa-border-/);
  expect(bodyHTML).toMatch(/kapwa-heading-/);
  expect(bodyHTML).toMatch(/kapwa-body-/);
  expect(bodyHTML).toMatch(/p-kapwa-/);
  expect(bodyHTML).toMatch(/gap-kapwa-/);
});

test('reference page displays all example cards', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check that all example cards are visible
  const cards = page.locator('.bg-kapwa-bg-surface.border-kapwa-border-weak');
  await expect(cards).toHaveCount(6);

  // Verify specific card content
  await expect(cards.nth(0)).toContainText('Basic Card');
  await expect(cards.nth(1)).toContainText('Status Indicators');
  await expect(cards.nth(2)).toContainText('Typography Scale');
  await expect(cards.nth(3)).toContainText('Spacing Tokens');
  await expect(cards.nth(4)).toContainText('Border Variants');
  await expect(cards.nth(5)).toContainText('Interactive States');
});

test('reference page shows semantic status colors', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check status indicators
  const statusCard = page
    .locator('text=Status Indicators')
    .locator('..')
    .locator('..');
  await expect(statusCard).toContainText('✓ Success state');
  await expect(statusCard).toContainText('⚠ Warning state');
  await expect(statusCard).toContainText('✕ Error state');
  await expect(statusCard).toContainText('ℹ Info state');

  // Verify semantic status classes
  const statusHTML = await statusCard.innerHTML();
  expect(statusHTML).toMatch(/text-kapwa-text-(success|warning|danger|info)/);
});

test('reference page typography scale is correct', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  const typographyCard = page
    .locator('text=Typography Scale')
    .locator('..')
    .locator('..');

  // Check all typography variants are present
  await expect(typographyCard).toContainText('Heading Large');
  await expect(typographyCard).toContainText('Heading Medium');
  await expect(typographyCard).toContainText('Body Large text');
  await expect(typographyCard).toContainText('Body Medium standard');
  await expect(typographyCard).toContainText('Body Small muted');

  // Verify semantic typography classes
  const typographyHTML = await typographyCard.innerHTML();
  expect(typographyHTML).toMatch(/kapwa-heading-(lg|md)/);
  expect(typographyHTML).toMatch(/kapwa-body-(lg|md|sm)/);
});

test('reference page code examples are visible', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check implementation patterns section
  await expect(page.locator('h2')).toContainText('Implementation Patterns');

  // Check code examples exist
  const codeBlocks = page.locator('pre');
  await expect(codeBlocks).toHaveCount(2);

  // Verify DO example contains semantic tokens
  const doExample = codeBlocks.nth(0);
  const doCode = await doExample.textContent();
  expect(doCode).toContain('kapwa-bg-surface');
  expect(doCode).toContain('text-kapwa-text-strong');

  // Verify DON'T example shows raw colors (as anti-pattern)
  const dontExample = codeBlocks.nth(1);
  const dontCode = await dontExample.textContent();
  expect(dontCode).toContain('bg-white');
  expect(dontCode).toContain('text-slate-900');
});

test('reference page is accessible', async ({ page }) => {
  await page.goto('/government/reference-implementation');

  // Check basic accessibility
  const headings = page.locator('h1, h2, h3');
  await expect(headings.first()).toBeVisible();

  // Check contrast (visual check - automated would need axe-core)
  const links = page.locator('a[href="#"]');
  await expect(links.first()).toBeVisible();
});
