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
};

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
    const el = parse(barMarkup(cfg));
    for (const part of ['bar', 'logo', 'search', 'signin', 'services']) {
      expect(el.querySelector(`[part="${part}"]`)).not.toBeNull();
    }
  });

  it('renders the signed-out zone by default', () => {
    expect(parse(barMarkup(cfg)).querySelector('.zone')?.getAttribute('data-state')).toBe('out');
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

  it.each(['a&b', 'a#b', 'café', '100% online', 'a?b=c'])('encodes %s safely', (q) => {
    const url = new URL(searchDestination(cfg, q));
    expect(url.searchParams.get('q')).toBe(q);
    expect(url.origin).toBe('https://search.ucf.edu');
  });
});
