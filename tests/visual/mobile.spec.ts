import { expect, test } from '@playwright/test';

/**
 * The iOS visual matrix.
 *
 * Unlike bar.spec.ts, these tests never call setViewportSize — the viewport,
 * device pixel ratio, mobile user agent and touch support all come from the
 * device descriptor on the project (see playwright.config.ts). Each iOS
 * project therefore contributes its own baseline at its own width, which is
 * what brackets the 390px wordmark breakpoint:
 *
 *   iPhone SE (3rd gen)  375px  — below it, wordmark clipped
 *   iPhone 14            390px  — exactly at it, wordmark visible
 *   iPhone 14 Pro Max    430px  — above it, wordmark visible
 *
 * Container modes are already covered across three engines on desktop, so
 * this suite stays on `bare` and spends its budget on device width instead.
 */

test('closed', async ({ page }) => {
  await page.goto('/fixtures/bare.html');
  await expect(page.locator('#ucfhb')).toHaveScreenshot('ios-closed.png');
});

test('search open', async ({ page }) => {
  await page.goto('/fixtures/bare.html');
  await page.locator('#ucfhb').locator('.search-toggle').tap();
  // Let the pop-out settle; the assertion itself disables animations.
  await page.waitForTimeout(250);
  await expect(page.locator('#ucfhb')).toHaveScreenshot('ios-open.png');
});
