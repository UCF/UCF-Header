import { describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../src/config';
import { barMarkup, HOME_URL, MYUCF_URL, searchDestination } from '../../src/template';

const cfg: HeaderConfig = {
  version: '4.0.0-test',
  rootUrl: 'universityheader.test',
  gtmId: null,
  searchUrl: 'https://search.ucf.edu/',
  wideBreakpoint: false,
  fullWidth: false,
  siteScopeDefault: false,
};

const DOMAIN = 'cah.ucf.edu';

function parse(html: string): Element {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

describe('barMarkup', () => {
  it('links home with real, crawler-visible anchor text', () => {
    const home = parse(barMarkup(cfg)).querySelector('.home');
    expect(home?.getAttribute('href')).toBe(HOME_URL);
    expect(home?.textContent).toContain('University of');
    expect(home?.textContent).toContain('Central Florida');
  });

  it('renders MyUCF as a real link, not a button', () => {
    const myucf = parse(barMarkup(cfg)).querySelector('.myucf');
    expect(myucf?.tagName).toBe('A');
    expect(myucf?.getAttribute('href')).toBe(MYUCF_URL);
  });

  // The search must work with no JavaScript beyond the initial render: a real
  // action plus name="q" means the browser performs the GET itself.
  it('gives the form a native GET target', () => {
    const form = parse(barMarkup(cfg)).querySelector('form');
    expect(form?.getAttribute('action')).toBe(cfg.searchUrl);
    expect(form?.getAttribute('method')).toBe('get');
    expect(form?.getAttribute('role')).toBe('search');
    expect(form?.querySelector('input')?.getAttribute('name')).toBe('q');
  });

  it('starts collapsed, with the hidden input out of the tab order', () => {
    const el = parse(barMarkup(cfg));
    expect(el.querySelector('.search')?.classList.contains('is-open')).toBe(false);
    expect(el.querySelector('.search-toggle')?.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.search-input')?.getAttribute('tabindex')).toBe('-1');
  });

  it('labels the search input', () => {
    const el = parse(barMarkup(cfg));
    const input = el.querySelector('.search-input');
    const label = el.querySelector('label');
    expect(label?.getAttribute('for')).toBe(input?.id);
    expect(label?.textContent).toBeTruthy();
  });

  it.each([
    [{ wideBreakpoint: false, fullWidth: false }, []],
    [{ wideBreakpoint: true, fullWidth: false }, ['is-wide']],
    [{ wideBreakpoint: true, fullWidth: true }, ['is-wide', 'is-full']],
  ])('maps config %j to bar classes', (flags, expected) => {
    const bar = parse(barMarkup({ ...cfg, ...flags })).querySelector('.bar');
    for (const c of expected) expect(bar?.classList.contains(c)).toBe(true);
  });

  it('exposes part= hooks for host-page styling', () => {
    const el = parse(barMarkup(cfg));
    for (const part of ['bar', 'logo', 'search', 'search-scope', 'myucf']) {
      expect(el.querySelector(`[part="${part}"]`)).not.toBeNull();
    }
  });

  it('renders the signed-out zone by default', () => {
    expect(parse(barMarkup(cfg)).querySelector('.zone')?.getAttribute('data-state')).toBe('out');
  });

  it('offers both search scopes as a labelled radiogroup', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    const group = el.querySelector('.scope');

    expect(group?.getAttribute('role')).toBe('radiogroup');
    expect(group?.getAttribute('aria-label')).toBeTruthy();
    expect([...el.querySelectorAll('.scope-opt')].map((o) => o.textContent)).toEqual([
      'UCF',
      'Site',
    ]);
  });

  /*
   * A radio needs a `name` to group with its sibling, and any named control in
   * this form is sent to search.ucf.edu as a stray parameter. Buttons carry no
   * form data, so `q` stays the only thing the search engine receives.
   */
  it('builds the picker from buttons, so nothing but q is submitted', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    for (const o of el.querySelectorAll('.scope-opt')) {
      expect(o.tagName).toBe('BUTTON');
      expect(o.getAttribute('type')).toBe('button');
    }
    expect([...el.querySelectorAll('[name]')].map((n) => n.getAttribute('name'))).toEqual(['q']);
  });

  it('starts on UCF, with the picker out of the tab order', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    expect(el.querySelector('.search')?.getAttribute('data-scope')).toBe('ucf');
    expect(el.querySelector('.scope-opt[data-scope="ucf"]')?.getAttribute('aria-checked')).toBe(
      'true',
    );
    for (const o of el.querySelectorAll('.scope-opt')) {
      expect(o.getAttribute('tabindex')).toBe('-1');
    }
  });

  it('opens on Site when use-site-search-default is set', () => {
    const el = parse(barMarkup({ ...cfg, siteScopeDefault: true }, { signedIn: false }, DOMAIN));
    expect(el.querySelector('.search')?.getAttribute('data-scope')).toBe('site');
    expect(el.querySelector('.scope-opt[data-scope="site"]')?.getAttribute('aria-checked')).toBe(
      'true',
    );
    // The field is named after what pressing Enter will actually do.
    expect(el.querySelector('.search-input')?.getAttribute('placeholder')).toBe(
      'Search cah.ucf.edu',
    );
    expect(el.querySelector('label')?.textContent).toBe('Search cah.ucf.edu');
  });

  it('omits the picker entirely when there is no domain to scope to', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, null));
    expect(el.querySelector('.scope')).toBeNull();
    expect(el.querySelector('.search-input')?.getAttribute('placeholder')).toBe('Search UCF');
  });

  // Site scope cannot be forced on when there is nothing to scope to.
  it('falls back to UCF scope when the flag is set but no domain is available', () => {
    const el = parse(barMarkup({ ...cfg, siteScopeDefault: true }, { signedIn: false }, null));
    expect(el.querySelector('.search')?.getAttribute('data-scope')).toBe('ucf');
  });

  it('inlines the mark rather than referencing a file', () => {
    const svg = parse(barMarkup(cfg)).querySelector('.mark');
    expect(svg?.tagName.toLowerCase()).toBe('svg');
    expect(svg?.getAttribute('aria-hidden')).toBe('true');
    expect(barMarkup(cfg)).not.toContain('<img');
  });
});

describe('searchDestination', () => {
  it('builds the query URL', () => {
    expect(searchDestination(cfg, 'financial aid')).toBe('https://search.ucf.edu/?q=financial+aid');
  });

  it('carries the site operator when the search is scoped', () => {
    const url = new URL(searchDestination(cfg, 'financial aid', DOMAIN, 'site'));
    expect(url.searchParams.get('q')).toBe('site:cah.ucf.edu financial aid');
    expect(url.origin).toBe('https://search.ucf.edu');
  });

  it.each(['a&b', 'a#b', 'café', '100% online', 'a?b=c'])('encodes %s safely', (q) => {
    const url = new URL(searchDestination(cfg, q));
    expect(url.searchParams.get('q')).toBe(q);
    expect(url.origin).toBe('https://search.ucf.edu');
  });
});
