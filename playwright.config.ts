import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

/*
 * ios.spec.ts asserts mobile-only behaviour and drives the bar with tap(), so
 * it is excluded from the desktop e2e projects: a desktop context has no touch
 * support and never matches the mobile media query. Every other spec in
 * tests/e2e runs on all four engines, iOS included.
 */
const E2E_DESKTOP = { testDir: './tests/e2e', testIgnore: /ios\.spec\.ts/ };

/**
 * Visual baselines are generated in the pinned Playwright container (see
 * `npm run test:visual:docker`) because font rasterization differs enough
 * between macOS and Linux CI to produce permanent false diffs otherwise.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],

  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'on-first-retry',
  },

  webServer: {
    command: `npm run build && node tests/fixtures/_make.mjs && PORT=${PORT} node scripts/serve.mjs`,
    url: `http://localhost:${PORT}/fixtures/bare.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  expect: {
    toHaveScreenshot: {
      // Tight, but not zero: sub-pixel AA differs slightly even within one
      // browser across runs. Anything structural blows well past this.
      maxDiffPixelRatio: 0.002,
      animations: 'disabled',
    },
  },

  projects: [
    { name: 'e2e-chromium', ...E2E_DESKTOP, use: devices['Desktop Chrome'] },
    { name: 'e2e-firefox', ...E2E_DESKTOP, use: devices['Desktop Firefox'] },
    { name: 'e2e-webkit', ...E2E_DESKTOP, use: devices['Desktop Safari'] },
    // The full e2e suite plus ios.spec.ts, under mobile WebKit.
    { name: 'e2e-ios', testDir: './tests/e2e', use: devices['iPhone 14'] },

    // Desktop: one project per engine, driven by explicit setViewportSize.
    {
      name: 'visual-chromium',
      testDir: './tests/visual',
      testMatch: /bar\.spec\.ts/,
      use: devices['Desktop Chrome'],
    },
    {
      name: 'visual-firefox',
      testDir: './tests/visual',
      testMatch: /bar\.spec\.ts/,
      use: devices['Desktop Firefox'],
    },
    {
      name: 'visual-webkit',
      testDir: './tests/visual',
      testMatch: /bar\.spec\.ts/,
      use: devices['Desktop Safari'],
    },

    /*
     * iOS: WebKit plus the parts of a phone that change layout — the mobile
     * user agent, `isMobile` (which makes the meta viewport authoritative),
     * touch, and a 3x device pixel ratio. These descriptors carry their own
     * viewport, so mobile.spec.ts must never call setViewportSize.
     *
     * This is emulation, not a device: it catches CSS and layout regressions,
     * but not native iOS form-control rendering or focus-zoom behaviour. The
     * hazards emulation cannot see are asserted directly in tests/e2e/ios.spec.ts.
     */
    {
      name: 'visual-ios-se',
      testDir: './tests/visual',
      testMatch: /mobile\.spec\.ts/,
      use: devices['iPhone SE (3rd gen)'],
    },
    {
      name: 'visual-ios-14',
      testDir: './tests/visual',
      testMatch: /mobile\.spec\.ts/,
      use: devices['iPhone 14'],
    },
    {
      name: 'visual-ios-max',
      testDir: './tests/visual',
      testMatch: /mobile\.spec\.ts/,
      use: devices['iPhone 14 Pro Max'],
    },

    { name: 'a11y', testDir: './tests/a11y', use: devices['Desktop Chrome'] },
  ],
});
