/**
 * The right-hand zone as it renders in a build with UCFHB_SESSION=1.
 *
 * The signed-out build's own assertions live in tests/unit/template.test.ts;
 * these cover the branches esbuild eliminates there.
 */

import { describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../../src/config';
import type { Session } from '../../../src/features/session';
import { mount, renderActions } from '../../../src/render';
import { actions, barMarkup, loginUrl } from '../../../src/template';

const cfg: HeaderConfig = {
  version: '4.0.0-test',
  rootUrl: 'universityheader.test',
  gtmId: null,
  searchUrl: 'https://search.ucf.edu/',
  wideBreakpoint: false,
  fullWidth: false,
};

const SIGNED_OUT: Session = { signedIn: false };
const LULU: Session = { signedIn: true, firstName: 'Lulu', initials: 'L', links: [] };

function parse(html: string): Element {
  const el = document.createElement('div');
  el.innerHTML = html;
  return el;
}

describe('signed-out zone', () => {
  it('replaces the MyUCF button with Login', () => {
    const zone = parse(actions(cfg, SIGNED_OUT));

    expect(zone.querySelector('.myucf')).toBeNull();
    expect(zone.querySelector('.login')?.textContent).toContain('Login');
    expect(zone.querySelector('.zone')?.getAttribute('data-state')).toBe('out');
  });

  // Same reasoning as the search form: a real href means login works before
  // any deferred script has run, and without a click handler to bind.
  it('is a real anchor, not a button', () => {
    const login = parse(actions(cfg, SIGNED_OUT)).querySelector('.login');

    expect(login?.tagName).toBe('A');
    expect(login?.getAttribute('href')).toContain('/api/dev/login');
  });

  it('sends the current page as the return destination', () => {
    const url = new URL(loginUrl(cfg, window.location));

    expect(url.host).toBe('universityheader.test');
    expect(url.pathname).toBe('/api/dev/login');
    expect(url.searchParams.get('return')).toBe(window.location.href);
  });

  it('takes its protocol from the host page, so it never mixes content', () => {
    const https = { protocol: 'https:', href: 'https://cah.ucf.edu/a' } as Location;
    expect(loginUrl(cfg, https)).toMatch(/^https:\/\/universityheader\.test\//);
  });
});

describe('signed-in zone', () => {
  it('greets the user by name', () => {
    const zone = parse(actions(cfg, LULU));

    expect(zone.querySelector('.greeting')?.textContent).toBe('Hi, Lulu');
    expect(zone.querySelector('.login')).toBeNull();
    expect(zone.querySelector('.zone')?.getAttribute('data-state')).toBe('in');
  });

  // firstName is the only value in the markup that comes off the network, and
  // the bar renders inside hundreds of host pages — an injection here is ours.
  it('escapes a hostile name rather than interpolating it', () => {
    const hostile: Session = {
      signedIn: true,
      firstName: '<img src=x onerror=alert(1)>',
      initials: '',
      links: [],
    };
    const zone = parse(actions(cfg, hostile));

    expect(zone.querySelector('img')).toBeNull();
    expect(zone.querySelector('.greeting')?.textContent).toBe('Hi, <img src=x onerror=alert(1)>');
  });
});

describe('renderActions', () => {
  it('swaps only the zone, leaving the rest of the bar untouched', () => {
    document.body.innerHTML = '';
    const root = mount(cfg, document);
    if (!root) throw new Error('bar failed to mount');

    const searchBefore = root.querySelector('.search-toggle');
    expect(root.querySelector('.login')).not.toBeNull();

    expect(renderActions(root, cfg, LULU)).toBe(true);

    expect(root.querySelector('.greeting')?.textContent).toBe('Hi, Lulu');
    expect(root.querySelector('.login')).toBeNull();
    // Same element, not a re-render: the search controller's listeners are
    // bound to it and would be lost if the whole bar were rewritten.
    expect(root.querySelector('.search-toggle')).toBe(searchBefore);
  });

  it('reports failure rather than throwing when there is no zone', () => {
    const stub = document.createElement('div').attachShadow({ mode: 'open' });
    expect(renderActions(stub, cfg, LULU)).toBe(false);
  });
});

describe('barMarkup', () => {
  it('renders the signed-out zone by default', () => {
    expect(parse(barMarkup(cfg)).querySelector('.login')).not.toBeNull();
  });
});

/**
 * The round trip a user actually takes. The client half is here; the server
 * half — that this exact `return` value comes back as a 302 Location — is
 * asserted in api/test/dev-login.test.ts against the same URLs.
 */
describe('returning the user to where they came from', () => {
  const cases = [
    'https://www.ucf.edu/news',
    'https://www.ucf.edu/news/some-story/',
    'https://www.ucf.edu/news?page=3&tag=research',
    'https://cah.ucf.edu/programs#admissions',
  ];

  it.each(cases)('carries %s through as the return destination', (href) => {
    const loc = { protocol: 'https:', href } as Location;
    const url = new URL(loginUrl(cfg, loc));

    // The login link points at the header's own origin...
    expect(url.origin).toBe('https://universityheader.test');
    // ...but carries the full original URL, path, query and fragment intact.
    expect(url.searchParams.get('return')).toBe(href);
  });

  it('never sends the user to the header site itself', () => {
    const loc = { protocol: 'https:', href: 'https://www.ucf.edu/news' } as Location;
    const returnTo = new URL(loginUrl(cfg, loc)).searchParams.get('return');

    expect(returnTo).not.toContain('universityheader');
    expect(new URL(returnTo as string).host).toBe('www.ucf.edu');
  });
});
