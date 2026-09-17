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

  test('the tray holds the four campus services as plain links', async ({ page }) => {
    await inShadow(page, '.signin').click();
    await expect(inShadow(page, '.service')).toHaveCount(4);
    await expect(inShadow(page, '.service')).toHaveText([
      'workday',
      'myUCF',
      'Email',
      'webcourses',
    ]);
    await expect(inShadow(page, '.service').nth(1)).toHaveAttribute('href', 'https://my.ucf.edu');
  });
});

test.describe('sign-in tray', () => {
  test('is closed to begin with, with its links out of the tab order', async ({ page }) => {
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'false');
    // `visibility: hidden` is what removes them — max-width alone would leave
    // four invisible links catching Tab.
    await expect(inShadow(page, '.service').first()).toBeHidden();
  });

  test('opens on click and reveals the links', async ({ page }) => {
    await inShadow(page, '.signin').click();
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'true');
    await expect(inShadow(page, '.service').first()).toBeVisible();
  });

  test('Escape closes it and returns focus to the trigger', async ({ page }) => {
    await inShadow(page, '.signin').click();
    await page.keyboard.press('Escape');
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'false');
    await expect(inShadow(page, '.signin')).toBeFocused();
  });

  test('clicking outside closes it', async ({ page }) => {
    await inShadow(page, '.signin').click();
    await page.locator('.host-content h1').click();
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'false');
  });

  /*
   * The two panels want the same strip of bar and there is only room for one.
   * This is the assertion that keeps them from ever being open together —
   * which at 940px would push the search button off the right edge.
   */
  test('opening either panel closes the other', async ({ page }) => {
    await inShadow(page, '.signin').click();
    await inShadow(page, '.search-toggle').click();
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'false');
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'true');

    await inShadow(page, '.signin').click();
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'false');
    await expect(inShadow(page, '.signin')).toHaveAttribute('aria-expanded', 'true');
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
    // The marker that tells the results side this search came from the header,
    // and nothing else alongside it.
    expect(url.searchParams.get('src')).toBe('ucfhb');
    expect([...url.searchParams.keys()]).toEqual(['q', 'src']);
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

/*
 * Scoped search. The fixtures are served from localhost, so the operator these
 * assert on is `site:localhost` — the mechanism is what is under test, and the
 * hostname it uses is deliberately whatever the page was actually loaded from.
 */
test.describe('search scope', () => {
  const host = (page: Page) => new URL(page.url()).hostname;
  const option = (page: Page, scope: string) => inShadow(page, `.scope-opt[data-scope="${scope}"]`);

  const submit = async (page: Page, query: string) => {
    await inShadow(page, '.search-input').fill(query);
    await Promise.all([
      page.waitForURL(/search\.ucf\.edu/),
      inShadow(page, '.search-input').press('Enter'),
    ]);
    return new URL(page.url()).searchParams;
  };

  test('is hidden until search opens, and offered on UCF', async ({ page }) => {
    await expect(inShadow(page, '.scope')).toBeHidden();
    await inShadow(page, '.search-toggle').click();
    await expect(inShadow(page, '.scope')).toBeVisible();
    await expect(option(page, 'ucf')).toHaveAttribute('aria-checked', 'true');
  });

  test('hides again when search closes', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await inShadow(page, '.search-toggle').click();
    await expect(inShadow(page, '.scope')).toBeHidden();
  });

  test('choosing Site keeps the panel open and the field focused', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await option(page, 'site').click();
    await expect(inShadow(page, '.search-toggle')).toHaveAttribute('aria-expanded', 'true');
    await expect(inShadow(page, '.search-input')).toBeFocused();
    await expect(inShadow(page, '.search-input')).toHaveAttribute(
      'placeholder',
      `Search ${host(page)}`,
    );
  });

  test('submits the site operator for the page it is embedded on', async ({ page }) => {
    const domain = host(page);
    await inShadow(page, '.search-toggle').click();
    await option(page, 'site').click();
    const params = await submit(page, 'financial aid');

    expect(params.get('q')).toBe(`site:${domain} financial aid`);
    expect([...params.keys()]).toEqual(['q', 'src']);
  });

  test('switching back to UCF submits the query unchanged', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await option(page, 'site').click();
    await option(page, 'ucf').click();
    expect((await submit(page, 'financial aid')).get('q')).toBe('financial aid');
  });

  test('use-site-search-default opens already scoped to the site', async ({ page }) => {
    await page.goto('/fixtures/bare-site.html');
    const domain = host(page);
    await inShadow(page, '.search-toggle').click();
    await expect(option(page, 'site')).toHaveAttribute('aria-checked', 'true');
    expect((await submit(page, 'financial aid')).get('q')).toBe(`site:${domain} financial aid`);
  });

  test('arrow keys move between the scopes', async ({ page }) => {
    await inShadow(page, '.search-toggle').click();
    await option(page, 'ucf').focus();
    await page.keyboard.press('ArrowRight');
    await expect(option(page, 'site')).toHaveAttribute('aria-checked', 'true');
    await expect(option(page, 'site')).toBeFocused();
  });

  /*
   * In the row wherever the row has room for it, and on a shelf below the bar
   * where it does not. Either way the bar keeps its height and nothing is
   * pushed off the right edge.
   */
  for (const [width, placement] of [
    [390, 'shelf'],
    [768, 'row'],
    [1200, 'row'],
  ] as const) {
    test(`sits in the ${placement} at ${width}px without changing the bar`, async ({ page }) => {
      await page.setViewportSize({ width, height: 700 });
      await page.goto('/fixtures/bare.html');
      const before = await bar(page).boundingBox();
      await inShadow(page, '.search-toggle').click();
      await expect(inShadow(page, '.scope')).toBeVisible();

      const after = await bar(page).boundingBox();
      const track = await inShadow(page, '.scope-track').boundingBox();
      const toggle = await inShadow(page, '.search-toggle').boundingBox();
      if (!before || !after || !track || !toggle) throw new Error('not laid out');

      expect(after.height).toBe(before.height);
      expect(toggle.x + toggle.width).toBeLessThanOrEqual(width);
      const barBottom = after.y + after.height;
      if (placement === 'row') expect(track.y + track.height).toBeLessThanOrEqual(barBottom);
      else expect(track.y).toBeGreaterThanOrEqual(barBottom);
    });
  }
});

test.describe('keyboard', () => {
  // DOM order is what determines focus order, and it is the same in every
  // browser — so this is the assertion that actually protects the behaviour.
  test('focusable controls are in DOM order matching visual order', async ({ page }) => {
    const order = await page.evaluate(() => {
      const root = document.getElementById('ucfhb')?.shadowRoot;
      const sel = 'a[href], button, input:not([tabindex="-1"]):not([type="hidden"])';
      return [...(root?.querySelectorAll(sel) ?? [])].map((e) => e.className);
    });
    // The tray's four links sit between the button that opens them and the
    // search toggle, which is what puts them in reading order the moment they
    // become focusable. Until then `visibility: hidden` keeps Tab off them.
    // The scope toggle sits just left of the field on desktop, and is held off
    // Tab the same way until search opens.
    expect(order).toEqual([
      'home',
      'signin',
      'service',
      'service',
      'service',
      'service',
      'scope-opt',
      'scope-opt',
      'search-toggle',
    ]);
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
    expect(seen[1]).toContain('signin');
    expect(seen[2]).toContain('search-toggle');
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

      const overflow = () =>
        page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );

      // Each panel in turn — either one open is wider than the closed bar, and
      // the tray is the wider of the two.
      await inShadow(page, '.search-toggle').click();
      expect(await overflow(), 'search open').toBeLessThanOrEqual(0);

      await inShadow(page, '.signin').click();
      expect(await overflow(), 'tray open').toBeLessThanOrEqual(0);
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
