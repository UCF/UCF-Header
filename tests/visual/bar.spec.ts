import { expect, test } from '@playwright/test';

/**
 * The visual regression matrix: 6 widths x 3 container modes x 2 search states.
 *
 * Baselines are generated inside the pinned Playwright container (see
 * `npm run test:visual:docker`) — font rasterization differs enough between
 * macOS and Linux CI that host-generated baselines produce permanent false
 * diffs. Per R10 these stay loose while the design iterates, and get locked
 * once the look is signed off.
 */

const WIDTHS = [360, 390, 768, 980, 1200, 1440];
const MODES = [
  { name: 'default', fixture: 'bare' },
  { name: 'wide', fixture: 'bare-wide' },
  { name: 'full', fixture: 'bare-full' },
];

for (const { name, fixture } of MODES) {
  for (const width of WIDTHS) {
    test(`${name} @ ${width} — closed`, async ({ page }) => {
      await page.setViewportSize({ width, height: 400 });
      await page.goto(`/fixtures/${fixture}.html`);
      await expect(page.locator('#ucfhb')).toHaveScreenshot(`${name}-${width}-closed.png`);
    });

    test(`${name} @ ${width} — search open`, async ({ page }) => {
      await page.setViewportSize({ width, height: 400 });
      await page.goto(`/fixtures/${fixture}.html`);
      await page.locator('#ucfhb').locator('.search-toggle').click();
      // Let the pop-out settle; the assertion itself disables animations.
      await page.waitForTimeout(250);
      await expect(page.locator('#ucfhb')).toHaveScreenshot(`${name}-${width}-open.png`);
    });
  }
}

test('respects prefers-reduced-motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1200, height: 400 });
  await page.goto('/fixtures/bare.html');

  const transition = await page.evaluate(() => {
    const el = document.getElementById('ucfhb')?.shadowRoot?.querySelector('.search-form');
    return el ? getComputedStyle(el).transitionDuration : null;
  });
  expect(transition).toMatch(/^0s(, 0s)*$/);
});

/*
 * Cross-fixture identity: each hostile host page is compared against the SAME
 * snapshot, so any style leak on any of them fails here. The computed-geometry
 * counterpart lives in tests/e2e/isolation.spec.ts.
 */
const HOSTILE = ['bare', 'aggressive-reset', 'foundation'];

for (const fixture of HOSTILE) {
  test(`isolation — ${fixture} renders identically to bare`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 400 });
    await page.goto(`/fixtures/${fixture}.html`);
    await expect(page.locator('#ucfhb')).toHaveScreenshot('isolated-bar.png');
  });
}
