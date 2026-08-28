import { defineConfig, devices } from '@playwright/test';

const PORT = 4321;

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
    { name: 'e2e-chromium', testDir: './tests/e2e', use: devices['Desktop Chrome'] },
    { name: 'e2e-firefox', testDir: './tests/e2e', use: devices['Desktop Firefox'] },
    { name: 'e2e-webkit', testDir: './tests/e2e', use: devices['Desktop Safari'] },

    { name: 'visual-chromium', testDir: './tests/visual', use: devices['Desktop Chrome'] },
    { name: 'visual-firefox', testDir: './tests/visual', use: devices['Desktop Firefox'] },
    { name: 'visual-webkit', testDir: './tests/visual', use: devices['Desktop Safari'] },

    { name: 'a11y', testDir: './tests/a11y', use: devices['Desktop Chrome'] },
  ],
});
