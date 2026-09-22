import { describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../src/config';
import { SITE_SEARCH } from '../../src/features/search';
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

  it('renders the four services as real links, not buttons', () => {
    const links = [...parse(barMarkup(cfg)).querySelectorAll('.service')];
    expect(links.map((a) => a.tagName)).toEqual(['A', 'A', 'A', 'A']);
    expect(links.map((a) => a.getAttribute('href'))).toContain(MYUCF_URL);
  });

  /*
   * The whole point of dropping the spritesheet. v3 drew "myUCF" and
   * "webcourses" as PNG slices, so their accessible name came from an
   * aria-label that could drift from what was on screen. Split across two
   * spans, the text IS the name — which is only true if the fragments
   * concatenate with no whitespace between them.
   */
  it('builds two-tone labels that read as one word', () => {
    const names = [...parse(barMarkup(cfg)).querySelectorAll('.service')].map((a) => a.textContent);
    expect(names).toEqual(['workday', 'myUCF', 'Email', 'webcourses']);
  });

  it('starts with the sign-in tray closed', () => {
    const el = parse(barMarkup(cfg));
    expect(el.querySelector('.zone')?.classList.contains('is-open')).toBe(false);
    expect(el.querySelector('.signin')?.getAttribute('aria-expanded')).toBe('false');
    expect(el.querySelector('.signin')?.getAttribute('aria-controls')).toBe(
      el.querySelector('.services')?.id,
    );
  });

  // No aria-label on the button either: "UCF SIGN IN" is real text, clipped
  // rather than removed at mobile widths so the name survives the breakpoint.
  it('names the sign-in button from its own visible text', () => {
    expect(parse(barMarkup(cfg)).querySelector('.signin')?.textContent).toContain('SIGN IN');
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
    // An explicit domain, so `search-scope` is rendered whatever SITE_SEARCH says.
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    for (const part of ['bar', 'logo', 'search', 'search-scope', 'signin', 'services']) {
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

  // Inside the search wrapper, so a click on it counts as inside the panel
  // wherever CSS places it. Before the field, so DOM order matches the desktop row.
  it('puts the toggle inside the search panel, ahead of the field', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    expect(el.querySelector('.search .scope')).not.toBeNull();
    expect(el.querySelector('.scope + .search-input')).not.toBeNull();
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

  it('starts on UCF, with a single tab stop on the checked option', () => {
    const el = parse(barMarkup(cfg, { signedIn: false }, DOMAIN));
    expect(el.querySelector('.search')?.getAttribute('data-scope')).toBe('ucf');
    const ucf = el.querySelector('.scope-opt[data-scope="ucf"]');
    const site = el.querySelector('.scope-opt[data-scope="site"]');
    expect(ucf?.getAttribute('aria-checked')).toBe('true');
    expect(ucf?.getAttribute('tabindex')).toBe('0');
    expect(site?.getAttribute('tabindex')).toBe('-1');
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

  // The default domain is what SITE_SEARCH gates, so this is the switch as a
  // real page sees it: no picker, and use-site-search-default has no effect.
  it.runIf(!SITE_SEARCH)('offers no picker while site search is switched off', () => {
    const el = parse(barMarkup({ ...cfg, siteScopeDefault: true }));
    expect(el.querySelector('.scope')).toBeNull();
    expect(el.querySelector('.search')?.getAttribute('data-scope')).toBe('ucf');
    expect(el.querySelector('.search-input')?.getAttribute('placeholder')).toBe('Search UCF');
  });

  // Site scope cannot be forced on when there is nothing to scope to.
  it('falls back to UCF when the flag is set but no domain is available', () => {
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
