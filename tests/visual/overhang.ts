import type { Page } from '@playwright/test';

/**
 * How far below the bar an open panel can reach. The phone shelves are the
 * deepest: 60px for the search scope toggle, 56px for the sign-in tray.
 */
const OVERHANG = 60;

/**
 * Screenshot options that frame the bar plus the strip of page beneath it.
 *
 * A locator screenshot is cropped to the element's own box, and `#ucfhb` is
 * exactly as tall as the bar. Anything positioned below it — the scope shelf
 * and the sign-in tray, below 768px — falls outside that crop, so a screenshot
 * of `#ucfhb` stays green with either one broken or missing entirely. Every
 * phone baseline was 60px tall before this existed.
 *
 * Only for open states. A closed bar has nothing below it, and a taller frame
 * would just put more host page into the comparison.
 */
export async function withOverhang(page: Page) {
  const box = await page.locator('#ucfhb').boundingBox();
  if (!box) throw new Error('#ucfhb is not laid out');
  return {
    clip: { x: box.x, y: box.y, width: box.width, height: box.height + OVERHANG },
  };
}
