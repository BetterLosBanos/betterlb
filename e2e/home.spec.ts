import { test, expect } from '@playwright/test';

const WEATHER_MOCK = {
  los_ba_os: {
    name: 'Los Baños',
    coordinates: { lat: 14.1763, lon: 121.2219 },
    weather: [{ icon: '01d', description: 'clear sky' }],
    main: {
      temp: 28,
      feels_like: 30,
      temp_min: 25,
      temp_max: 31,
      pressure: 1012,
      humidity: 75,
    },
    visibility: 10000,
    wind: { speed: 3.5, deg: 180 },
    clouds: { all: 10 },
    dt: Math.floor(Date.now() / 1000),
    sys: {},
    timezone: 28800,
    id: 1706511,
    timestamp: new Date().toISOString(),
    hourly: [],
  },
};

test.describe('Home Page', () => {
  test.beforeEach(async ({ page }) => {
    // Mock weather API to prevent ECONNREFUSED in CI
    await page.route('**/api/weather**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(WEATHER_MOCK),
      })
    );

    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('home page uses Kapwa semantic tokens', async ({ page }) => {
    const body = page.locator('body');
    const bodyHTML = await body.innerHTML();

    expect(bodyHTML).not.toMatch(/text-(slate|gray|blue|green|red|yellow)-\d+/);
    expect(bodyHTML).not.toMatch(/bg-(slate|gray|blue|green|red|yellow)-\d+/);
    expect(bodyHTML).not.toMatch(
      /border-(slate|gray|blue|green|red|yellow)-\d+/
    );

    expect(bodyHTML).toMatch(/text-kapwa-text-/);
    expect(bodyHTML).toMatch(/bg-kapwa-bg-/);
  });

  test('HeroSection is displayed', async ({ page }) => {
    const heroSection = page.locator('main').first();
    await expect(heroSection).toBeVisible();

    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
  });

  test('ServicesSection is displayed', async ({ page }) => {
    const servicesSection = page.locator('section').filter({
      hasText: /Services/i,
    });
    await expect(servicesSection.first()).toBeVisible();
  });

  test('TimelineSection is displayed', async ({ page }) => {
    const timelineSection = page.locator('section').filter({
      hasText: /Recent Updates|Latest/i,
    });
    await expect(timelineSection).toBeVisible();
  });

  test('WeatherMapSection is displayed', async ({ page }) => {
    const weatherSection = page
      .locator('section')
      .filter({ has: page.locator('text=Weather, Forex & Tickers') })
      .or(page.locator('section').filter({ hasText: /Weather/i }));
    await expect(weatherSection).toBeVisible();
  });

  test('NewsSection is displayed', async ({ page }) => {
    const newsSection = page.locator('section').filter({
      hasText: /News|Updates|Announcements/i,
    });
    await expect(newsSection).toBeVisible();
  });

  test('GovernmentSection is displayed', async ({ page }) => {
    const governmentSection = page.locator('section').filter({
      hasText: /Government|Officials|Departments/i,
    });
    await expect(governmentSection).toBeVisible();
  });

  test('All sections have consistent spacing', async ({ page }) => {
    const sections = page.locator('main > div > div > section');
    const sectionsCount = await sections.count();
    expect(sectionsCount).toBeGreaterThanOrEqual(4);

    for (const section of await sections.all()) {
      await expect(section).toBeVisible();
    }
  });

  test('Navigation from home page works correctly', async ({ page }) => {
    const servicesLink = page.locator('a[href*="/services"]').first();
    await servicesLink.click();
    await page.waitForURL(/\/services/);
    expect(page.url()).toContain('/services');
  });

  test('Home page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.reload();
    await page.waitForLoadState('networkidle');

    expect(errors.filter(e => !e.includes('DevTools')).length).toBe(0);
  });
});

test.describe('Home Page - Visual Regression', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/weather**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(WEATHER_MOCK),
      })
    );
  });

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
    await page.route('**/api/weather**', route =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(WEATHER_MOCK),
      })
    );

    await page.goto('/');

    const accessibilityScanResults = await page.accessibility.scan();
    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
