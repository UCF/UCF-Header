import { expect, test } from '@playwright/test';

/**
 * The performance requirements encoded as tests rather than intentions:
 * one request before paint, nothing third-party until after the DOM is ready,
 * and the bar built during parse instead of after it.
 */

test('the header costs exactly one request — no separate stylesheet', async ({ page }) => {
  const requests: string[] = [];
  page.on('request', (r) => requests.push(r.url()));

  await page.goto('/fixtures/bare.html');
  await expect(page.locator('#ucfhb')).toBeVisible();

  const headerAssets = requests.filter((u) => /university-header|\.css$/.test(u));
  expect(headerAssets).toHaveLength(1);
  expect(headerAssets[0]).toContain('university-header.js');
});

test('nothing third-party loads during initial render', async ({ page }) => {
  const thirdParty: string[] = [];
  page.on('request', (r) => {
    const host = new URL(r.url()).hostname;
    if (host !== 'localhost' && host !== '127.0.0.1') thirdParty.push(r.url());
  });

  await page.goto('/fixtures/bare.html', { waitUntil: 'load' });
  await expect(page.locator('#ucfhb')).toBeVisible();

  expect(thirdParty).toEqual([]);
});

// v3 always waited for DOMContentLoaded. The bar only needs <body>, so on the
// common embed pattern it can be built during parse — which means it is already
// mounted by the time DOMContentLoaded fires.
test('the bar is mounted before DOMContentLoaded fires', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as { mountedAtDCL?: boolean }).mountedAtDCL = false;
    document.addEventListener(
      'DOMContentLoaded',
      () => {
        (window as unknown as { mountedAtDCL?: boolean }).mountedAtDCL =
          !!document.getElementById('ucfhb')?.shadowRoot;
      },
      { once: true },
    );
  });

  await page.goto('/fixtures/bare.html');
  const mounted = await page.evaluate(
    () => (window as unknown as { mountedAtDCL?: boolean }).mountedAtDCL,
  );
  expect(mounted).toBe(true);
});

test('the bar survives the script being included twice', async ({ page }) => {
  await page.goto('/fixtures/bare.html');
  await page.evaluate(async () => {
    const s = document.createElement('script');
    s.src = '/bar/js/university-header.js';
    document.body.appendChild(s);
    await new Promise((r) => s.addEventListener('load', r));
  });
  await expect(page.locator('#ucfhb')).toHaveCount(1);
  const bars = await page.evaluate(
    () => document.getElementById('ucfhb')?.shadowRoot?.querySelectorAll('.bar').length,
  );
  expect(bars).toBe(1);
});
