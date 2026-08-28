import { beforeEach, describe, expect, it } from 'vitest';
import { readConfig, rootUrlFor } from '../../src/config';

function withScript(src: string | null): Document {
  document.head.innerHTML = '';
  if (src !== null) {
    const s = document.createElement('script');
    s.id = 'ucfhb-script';
    s.setAttribute('src', src);
    document.head.appendChild(s);
  }
  return document;
}

const BASE = '//universityheader.ucf.edu/bar/js/university-header.js';

describe('readConfig', () => {
  beforeEach(() => withScript(null));

  it('defaults every flag off when no script tag is present', () => {
    const cfg = readConfig(withScript(null));
    expect(cfg.wideBreakpoint).toBe(false);
    expect(cfg.fullWidth).toBe(false);
  });

  it('defaults every flag off for a bare src', () => {
    const cfg = readConfig(withScript(BASE));
    expect(cfg.wideBreakpoint).toBe(false);
    expect(cfg.fullWidth).toBe(false);
  });

  it('reads use-1200-breakpoint', () => {
    expect(readConfig(withScript(`${BASE}?use-1200-breakpoint=1`)).wideBreakpoint).toBe(true);
  });

  it('reads use-full-width', () => {
    expect(readConfig(withScript(`${BASE}?use-full-width=1`)).fullWidth).toBe(true);
  });

  // v3's full-width.scss imported 1200-breakpoint.scss, so the two never had to
  // be combined by a site. That has to keep holding.
  it('treats use-full-width as implying the wide breakpoint', () => {
    expect(readConfig(withScript(`${BASE}?use-full-width=1`)).wideBreakpoint).toBe(true);
  });

  // Bootstrap 2.x support was dropped for 4.0.0. Sites still passing the flag
  // must keep working; it simply does nothing now.
  it('accepts and ignores use-bootstrap-overrides', () => {
    const cfg = readConfig(withScript(`${BASE}?use-bootstrap-overrides=1`));
    expect(cfg.wideBreakpoint).toBe(false);
    expect(cfg.fullWidth).toBe(false);
  });

  // v3 matched flags with a substring test, so extra params kept working.
  it.each([
    `${BASE}?use-full-width=1&cachebust=123`,
    `${BASE}?cachebust=123&use-full-width=1`,
    `${BASE}?use-bootstrap-overrides=1&use-full-width=1&use-1200-breakpoint=1`,
  ])('stays permissive about surrounding params: %s', (src) => {
    expect(readConfig(withScript(src)).fullWidth).toBe(true);
  });

  it('does not fire on a flag explicitly set to 0', () => {
    expect(readConfig(withScript(`${BASE}?use-full-width=0`)).fullWidth).toBe(false);
  });

  it('exposes the injected build constants', () => {
    const cfg = readConfig(withScript(BASE));
    expect(cfg.version).toBe('4.0.0-test');
    expect(cfg.searchUrl).toBe('https://search.ucf.edu/');
    expect(cfg.gaId).toBeNull();
  });
});

describe('rootUrlFor', () => {
  const cfg = readConfig(withScript(BASE));
  const loc = (protocol: string) => ({ protocol }) as Location;

  // rootUrl is a bare host by contract. Handing it to fetch() unchanged would
  // resolve against the host page and hit the wrong origin entirely.
  it('produces an absolute URL, not a page-relative one', () => {
    const url = rootUrlFor(
      { ...cfg, rootUrl: 'universityheader.ucf.edu' },
      'api/session',
      loc('https:'),
    );
    expect(url).toBe('https://universityheader.ucf.edu/api/session');
    expect(new URL(url).hostname).toBe('universityheader.ucf.edu');
  });

  it('inherits the page protocol so the header never mixes content', () => {
    const c = { ...cfg, rootUrl: 'universityheader.ucf.edu' };
    expect(rootUrlFor(c, 'api/session', loc('http:'))).toBe(
      'http://universityheader.ucf.edu/api/session',
    );
  });

  it.each([
    ['universityheader.ucf.edu', 'https://universityheader.ucf.edu/api/session'],
    ['universityheader.ucf.edu/', 'https://universityheader.ucf.edu/api/session'],
    ['https://universityheader.ucf.edu', 'https://universityheader.ucf.edu/api/session'],
    ['localhost:4321', 'https://localhost:4321/api/session'],
  ])('normalizes %s', (rootUrl, expected) => {
    expect(rootUrlFor({ ...cfg, rootUrl }, 'api/session', loc('https:'))).toBe(expected);
  });

  it('tolerates a leading slash on the path', () => {
    const c = { ...cfg, rootUrl: 'example.test' };
    expect(rootUrlFor(c, '/api/session', loc('https:'))).toBe('https://example.test/api/session');
  });
});
