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
    const form = document.getElementById('ucfhb')?.shadowRoot?.querySelector('.search-form');
    return !!form && getComputedStyle(form).opacity === '1';
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
}
