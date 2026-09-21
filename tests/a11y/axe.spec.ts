import AxeBuilder from '@axe-core/playwright';
import { expect, type Page, test } from '@playwright/test';

const FIXTURES = ['bare', 'aggressive-reset', 'padded-body', 'foundation'];

/**
 * Opens the search and waits for the fade to finish.
 *
 * Scanning mid-transition makes axe read the placeholder at partial opacity and
 * report a contrast failure that does not exist once the panel has settled.
 */
async function openSearch(page: Page): Promise<void> {
  await page.locator('#ucfhb').locator('.search-toggle').click();
  await page.waitForFunction(() => {
    const root = document.getElementById('ucfhb')?.shadowRoot;
    const settled = (el: Element | null | undefined) =>
      !!el && getComputedStyle(el).opacity === '1';
    // On a phone the scope shelf fades in on a short delay behind the field.
    // It is absent altogether while SITE_SEARCH is off.
    const scope = root?.querySelector('.scope');
    return settled(root?.querySelector('.search-form')) && (!scope || settled(scope));
  });
}

/** Opens the sign-in tray and waits for its links to reach full opacity. */
async function openTray(page: Page): Promise<void> {
  await page.locator('#ucfhb').locator('.signin').click();
  await page.waitForFunction(() => {
    const tray = document.getElementById('ucfhb')?.shadowRoot?.querySelector('.services');
    return !!tray && getComputedStyle(tray).opacity === '1';
  });
}

for (const fixture of FIXTURES) {
  test(`${fixture}: no accessibility violations, search closed`, async ({ page }) => {
    await page.goto(`/fixtures/${fixture}.html`);
    await expect(page.locator('#ucfhb')).toBeVisible();

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .include('#ucfhb')
      .analyze();

    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test(`${fixture}: no accessibility violations, search open`, async ({ page }) => {
    await page.goto(`/fixtures/${fixture}.html`);
    await openSearch(page);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .include('#ucfhb')
      .analyze();

    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });

  test(`${fixture}: no accessibility violations, sign-in tray open`, async ({ page }) => {
    await page.goto(`/fixtures/${fixture}.html`);
    await openTray(page);

    const { violations } = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
      .include('#ucfhb')
      .analyze();

    expect(violations.map((v) => `${v.id}: ${v.help}`)).toEqual([]);
  });
}
