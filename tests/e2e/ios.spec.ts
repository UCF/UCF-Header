import { expect, type Locator, type Page, test } from '@playwright/test';

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

/** Matches tests/e2e/header.spec.ts — everything lives inside the shadow root. */
const inShadow = (p: Page, sel: string): Locator => p.locator('#ucfhb').locator(sel);

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
    await inShadow(page, '.search-toggle').tap();

    const px = await inShadow(page, '.search-input').evaluate((el) =>
      Number.parseFloat(getComputedStyle(el).fontSize),
    );

    expect(px).toBeGreaterThanOrEqual(16);
  });

  test('opening search does not overflow the viewport', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await inShadow(page, '.search-toggle').tap();
    await page.waitForTimeout(250);

    const { docWidth, viewport } = await page.evaluate(() => ({
      docWidth: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));

    expect(docWidth).toBeLessThanOrEqual(viewport);
  });

  test('the whole right-hand zone stays on screen with search open', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await inShadow(page, '.search-toggle').tap();
    await page.waitForTimeout(250);

    const viewport = page.viewportSize()?.width ?? 0;
    expect(viewport).toBeGreaterThan(0);

    for (const sel of ['.search-toggle', '.myucf']) {
      const box = await inShadow(page, sel).boundingBox();
      if (!box) throw new Error(`${sel} is not laid out`);

      // Sub-pixel tolerance: a fractional edge is rounding, not clipping.
      expect(box.x + box.width, `${sel} right edge`).toBeLessThanOrEqual(viewport + 0.5);
      expect(box.x, `${sel} left edge`).toBeGreaterThanOrEqual(-0.5);
    }
  });

  /*
   * The regression that emulation missed and a real iPhone caught.
   *
   * Opening search at a mobile width must collapse the wordmark to give the
   * field room. That used to be expressed as `.inner:has(.search.is-open)`,
   * which iOS Safari stopped re-evaluating once script mutated the descendant
   * class inside the shadow root — the wordmark kept its full width and the
   * input was squeezed down to a bare caret.
   *
   * Asserting BOTH halves matters: a wordmark at zero width is only meaningful
   * if the field actually claimed the space, and a wide field is only correct
   * if the wordmark yielded it. Checking one alone would have passed all the
   * way through the broken build.
   */
  test('opening search collapses the wordmark and gives the field real width', async ({ page }) => {
    await page.goto('/fixtures/bare.html');

    const wordmark = inShadow(page, '.wordmark');
    const input = inShadow(page, '.search-input');

    // Precondition: at 390px the wordmark is visible before search opens.
    expect((await wordmark.boundingBox())?.width ?? 0).toBeGreaterThan(0);

    await inShadow(page, '.search-toggle').tap();
    await page.waitForTimeout(400);

    expect((await wordmark.boundingBox())?.width ?? -1, 'wordmark collapsed').toBe(0);
    // 120px is comfortably more than the ~26px the broken layout left, and
    // comfortably less than the ~142px a correct one produces at 390px.
    expect((await input.boundingBox())?.width ?? 0, 'field width').toBeGreaterThan(120);
  });

  test('the state class is mirrored onto .inner, not derived with :has()', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    const inner = inShadow(page, '.inner');

    await expect(inner).not.toHaveClass(/is-searching/);
    await inShadow(page, '.search-toggle').tap();
    await expect(inner).toHaveClass(/is-searching/);
    await inShadow(page, '.search-toggle').tap();
    await expect(inner).not.toHaveClass(/is-searching/);
  });

  /*
   * 44x44 CSS px is the Apple HIG minimum and the WCAG 2.5.5 bar. The mobile
   * bar is 60px tall, so this is headroom the design already has; the test is
   * here to stop a future padding or height trim from silently reclaiming it.
   */
  test('tap targets meet the 44px minimum', async ({ page }) => {
    await page.goto('/fixtures/bare.html');

    for (const sel of ['.search-toggle', '.myucf']) {
      const box = await inShadow(page, sel).boundingBox();
      if (!box) throw new Error(`${sel} is not laid out`);

      expect(box.height, `${sel} height`).toBeGreaterThanOrEqual(44);
      expect(box.width, `${sel} width`).toBeGreaterThanOrEqual(44);
    }
  });

  /*
   * The field is sized in the same mobile rule as the two controls beside it,
   * and for two reasons at once: it is a tap target in its own right, and a
   * 38px field between 44px controls reads as a misalignment. Only the height
   * is asserted — the width is driven by whatever space the collapsed wordmark
   * frees up, which the collapse test above already covers.
   *
   * This has to run with search OPEN: the field is collapsed to zero width
   * while closed, so a closed-state box says nothing about its height.
   */
  test('the open field matches the 44px height of the controls beside it', async ({ page }) => {
    await page.goto('/fixtures/bare.html');
    await inShadow(page, '.search-toggle').tap();
    await page.waitForTimeout(250);

    const box = await inShadow(page, '.search-input').boundingBox();
    if (!box) throw new Error('.search-input is not laid out');

    expect(box.height, '.search-input height').toBeGreaterThanOrEqual(44);
  });
});
