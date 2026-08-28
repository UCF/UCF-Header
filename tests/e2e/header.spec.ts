import { expect, type Locator, type Page, test } from '@playwright/test';

/** Everything lives inside the shadow root; Playwright pierces it by default. */
const bar = (p: Page) => p.locator('#ucfhb');
const inShadow = (p: Page, sel: string): Locator => p.locator(`#ucfhb`).locator(sel);

test.beforeEach(async ({ page }) => {
  await page.goto('/fixtures/bare.html');
  await expect(bar(page)).toBeVisible();
});

test.describe('contract', () => {
  test('reuses an existing #ucfhb placeholder rather than adding a second bar', async ({
    page,
  }) => {
    await page.goto('/fixtures/bare.html');
    await expect(page.locator('#ucfhb')).toHaveCount(1);
  });

  test('marks the bar as a labelled landmark', async ({ page }) => {
    await expect(bar(page)).toHaveAttribute('role', 'complementary');
    await expect(bar(page)).toHaveAttribute('aria-label', /University of Central Florida/i);
  });

  test('links home with descriptive anchor text', async ({ page }) => {
    const home = inShadow(page, '.home');
    await expect(home).toHaveAttribute('href', 'https://www.ucf.edu');
    await expect(home).toContainText('University of');
  });

  test('MyUCF is a plain link to my.ucf.edu', async ({ page }) => {
    await expect(inShadow(page, '.myucf')).toHaveAttribute('href', 'https://my.ucf.edu');
  });
});

test.describe('search', () => {
  test('opens on click and focuses the field', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(inShadow(page, '.search-input')).toBeFocused();
  });

  test('is closed to begin with, and its field is out of the tab order', async ({ page }) => {
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(inShadow(page, '.search-input')).toHaveAttribute('tabindex', '-1');
  });

  test('Escape closes it and returns focus to the trigger', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await page.keyboard.press('Escape');
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(inShadow(page, '.search-toggle')).toBeFocused();
  });

  test('clicking outside closes it', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await page.locator('.host-content h1').click();
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  test('clicking the toggle again closes it', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await inShadow(page, '.search-toggle').click();
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'false');
  });

  // The submit path is the browser's own: a real action plus name="q".
  test('submitting navigates to search.ucf.edu with the query', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await inShadow(page, '.search-input').fill('financial aid');
    await Promise.all([
      page.waitForURL(/search\.ucf\.edu/),
      inShadow(page, '.search-input').press('Enter'),
    ]);
    const url = new URL(page.url());
    expect(url.hostname).toBe('search.ucf.edu');
    expect(url.searchParams.get('q')).toBe('financial aid');
  });

  test('encodes awkward queries correctly', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await inShadow(page, '.search-input').fill('100% online & café');
    await Promise.all([
      page.waitForURL(/search\.ucf\.edu/),
      inShadow(page, '.search-input').press('Enter'),
    ]);
    expect(new URL(page.url()).searchParams.get('q')).toBe('100% online & café');
  });
});

test.describe('keyboard', () => {
  // DOM order is what determines focus order, and it is the same in every
  // browser — so this is the assertion that actually protects the behaviour.
  test('focusable controls are in DOM order matching visual order', async ({ page }) => {
    const order = await page.evaluate(() => {
      const root = document.getElementById('ucfhb')?.shadowRoot;
      const sel = 'a[href], button, input:not([tabindex="-1"])';
      return [...(root?.querySelectorAll(sel) ?? [])].map((e) => e.className);
    });
    expect(order[0]).toContain('home');
    expect(order[1]).toContain('search-toggle');
    expect(order[2]).toContain('myucf');
  });

  /*
   * Safari's default is that Tab moves only between form fields — links and
   * buttons are skipped unless the user enables Full Keyboard Access, an OS/
   * browser preference Playwright cannot set. That applies to every link and
   * button on the web, not to anything specific here, so the traversal check
   * runs where the default reaches the controls. What matters everywhere —
   * DOM order, and activation once focused — is asserted separately.
   */
  test('tabbing walks the bar in order', async ({ page, browserName }) => {
    test.skip(browserName === 'webkit', 'Safari Tab skips links/buttons by default');

    const seen: string[] = [];
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Tab');
      seen.push(
        await page.evaluate(
          () => document.getElementById('ucfhb')?.shadowRoot?.activeElement?.className ?? '',
        ),
      );
    }
    expect(seen[0]).toContain('home');
    expect(seen[1]).toContain('search-toggle');
    expect(seen[2]).toContain('myucf');
  });

  test('the search toggle activates from the keyboard', async ({ page }) => {
    await inShadow(page, '.search-toggle').focus();
    await page.keyboard.press('Enter');
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'true');
  });
});

test.describe('config flags', () => {
  for (const [file, expected] of [
    ['bare.html', { wide: false, full: false }],
    ['bare-wide.html', { wide: true, full: false }],
    ['bare-full.html', { wide: true, full: true }],
    // Still sent by real sites. Must be accepted and change nothing.
    ['bare-bs.html', { wide: false, full: false }],
  ] as const) {
    test(`${file} applies the right container mode`, async ({ page }) => {
      await page.goto(`/fixtures/${file}`);
      const cls = await inShadow(page, '.bar').getAttribute('class');
      expect(cls?.includes('is-wide')).toBe(expected.wide);
      expect(cls?.includes('is-full')).toBe(expected.full);
    });
  }
});

test.describe('layout', () => {
  for (const width of [360, 390, 768, 980, 1200, 1440]) {
    test(`no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('/fixtures/bare.html');
      await expect(bar(page)).toBeVisible();

      // With the search panel open too — the widest the bar ever gets.
      await inShadow(page, '.search-toggle').click();
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      );
      expect(overflow).toBeLessThanOrEqual(0);
    });
  }

  test('is 72px tall on desktop and 60px on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 1200, height: 700 });
    await page.goto('/fixtures/bare.html');
    expect((await bar(page).boundingBox())?.height).toBe(72);

    await page.setViewportSize({ width: 390, height: 700 });
    expect((await bar(page).boundingBox())?.height).toBe(60);
  });
});
