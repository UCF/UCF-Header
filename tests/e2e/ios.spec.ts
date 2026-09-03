import { expect, test } from '@playwright/test';

/**
 * iOS Safari hazards that a screenshot cannot show.
 *
 * Playwright's WebKit is the same engine as Safari but not the same product:
 * it does not reproduce native form-control chrome, and it never performs the
 * focus zoom that real iOS Safari does. Those behaviours are driven by values
 * we can read directly, so they are asserted as computed style and geometry
 * rather than by pixel diff — the check then holds on every engine, and fails
 * for a legible reason instead of a blurry one.
 *
 * Runs under the `e2e-ios` project (iPhone 14: 390px, isMobile, touch, DPR 3).
 */

const shadow = (page: import('@playwright/test').Page) =>
  page.locator('#ucfhb').locator('.search-input');

test.describe('iOS Safari', () => {
  /*
   * The one that bites hardest. iOS Safari zooms the whole page when a text
   * field smaller than 16px receives focus, and it does not zoom back out on
   * blur. The bar then sits wider than the visual viewport with its right-hand
   * side — search toggle and MyUCF — pushed off screen.
   *
   * The fix is a >=16px font-size on the input at mobile widths, NOT a
   * `maximum-scale=1` viewport meta: that would suppress the zoom by disabling
   * pinch-zoom for the whole host page, which is both an a11y failure the
   * header has no right to impose on its hosts and something the header
   * cannot set anyway — the meta tag belongs to the host page.
   */
  test('the search input is at least 16px, so focus does not zoom the page', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await page.locator('#ucfhb').locator('.search-toggle').tap();

    const px = await shadow(page).evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).fontSize),
    );

    expect(px).toBeGreaterThanOrEqual(16);
  });

  test('opening search does not overflow the viewport', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await page.locator('#ucfhb').locator('.search-toggle').tap();
    await page.waitForTimeout(250);

    const { docWidth, viewport } = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));

    expect(docWidth).toBeLessThanOrEqual(viewport);
  });

  test('the whole right-hand zone stays on screen with search open', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await page.locator('#ucfhb').locator('.search-toggle').tap();
    await page.waitForTimeout(250);

    const viewport = page.viewportSize()?.width ?? 0;
    expect(viewport).toBeGreaterThan(0);

    for (const sel of ['.search-toggle', '.myucf']) {
      const box = await page.locator('#ucfhb').locator(sel).boundingBox();
      if (!box) throw new Error(`${sel} is not laid out`);

      // Sub-pixel tolerance: a fractional edge is rounding, not clipping.
      expect(box.x + box.width, `${sel} right edge`).toBeLessThanOrEqual(viewport + 0.5);
      expect(box.x, `${sel} left edge`).toBeGreaterThanOrEqual(-0.5);
    }
  });

  /*
   * 44x44 CSS px is the Apple HIG minimum and the WCAG 2.5.5 bar. The mobile
   * bar is 60px tall, so this is headroom the design already has; the test is
   * here to stop a future padding or height trim from silently reclaiming it.
   */
  test('tap targets meet the 44px minimum', async ({ page }) => {
    await page.goto('/fixtures/bare.html');

    for (const sel of ['.search-toggle', '.myucf']) {
      const box = await page.locator('#ucfhb').locator(sel).boundingBox();
      if (!box) throw new Error(`${sel} is not laid out`);

      expect(box.height, `${sel} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${sel} width`).toBeGreaterThanOrEqual(44);
    }
  });
});
