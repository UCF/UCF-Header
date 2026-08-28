import { beforeEach, describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../src/config';
import { initAnalytics } from '../../src/features/analytics';
import { mount } from '../../src/render';

const cfg: HeaderConfig = {
  version: '4.0.0-test',
  rootUrl: 'universityheader.test',
  gaId: 'G-TEST12345',
  searchUrl: 'https://search.ucf.edu/',
  wideBreakpoint: false,
  fullWidth: false,
};

/*
 * dataLayer holds two different shapes: gtag pushes real `arguments` objects,
 * while track() pushes plain event objects. Flattening both through Array.from
 * silently destroys the plain ones, so they are read apart.
 */
const isArrayLike = (e: unknown): e is ArrayLike<unknown> =>
  typeof (e as ArrayLike<unknown>)?.length === 'number';

const gtagCalls = () => (window.dataLayer ?? []).filter(isArrayLike).map((e) => Array.from(e));
const findCall = (name: string) => gtagCalls().find((c) => c[0] === name);
const events = () =>
  (window.dataLayer ?? []).filter((e) => !isArrayLike(e)) as Record<string, unknown>[];
const findEvent = (action: string) => events().find((e) => e.ucf_action === action);

function setup(overrides: Partial<HeaderConfig> = {}) {
  // head too: a gtag script left by a previous test would mask a regression.
  document.head.innerHTML = '';
  document.body.innerHTML = '';
  const host = document.createElement('div');
  host.id = 'ucfhb';
  document.body.appendChild(host);
  const root = mount({ ...cfg, ...overrides }, document);
  if (!root) throw new Error('mount failed');
  initAnalytics(root, { ...cfg, ...overrides }, document);
  return root;
}

describe('initAnalytics', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('loads gtag.js for the configured measurement ID', () => {
    setup();
    const script = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]');
    expect(script?.src).toContain('id=G-TEST12345');
    // async, so it never blocks parsing or the bar's render.
    expect(script?.async).toBe(true);
  });

  /*
   * Page views are deliberately ON. With send_page_view disabled, a pageview
   * where nobody touches the header reports nothing at all, and the header's
   * property stops being a census of where the bar runs. Locked in a test
   * because it is a one-word change that silently guts the data.
   */
  it('leaves page view tracking enabled', () => {
    setup();
    const config = findCall('config');
    expect(config?.[1]).toBe('G-TEST12345');

    const opts = config?.[2] as Record<string, unknown> | undefined;
    expect(opts?.send_page_view).not.toBe(false);
  });

  it('does not load analytics when no measurement ID is configured', () => {
    setup({ gaId: null });
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(findCall('config')).toBeUndefined();
  });

  it('reuses an existing dataLayer rather than replacing it', () => {
    window.dataLayer = [{ event: 'host_site_event' }];
    setup();
    expect(window.dataLayer?.[0]).toEqual({ event: 'host_site_event' });
  });
});

describe('interaction events', () => {
  beforeEach(() => {
    window.dataLayer = [];
  });

  it('records a MyUCF click', () => {
    const root = setup();
    root
      .querySelector<HTMLAnchorElement>('.myucf')
      ?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));

    expect(findEvent('myucf_click')).toBeDefined();
  });

  // Query text must never leave the page — presence only.
  it('records search submissions without the query text', () => {
    const root = setup();
    const input = root.querySelector<HTMLInputElement>('.search-input');
    if (input) input.value = 'my private search';

    const form = root.querySelector('form');
    // jsdom cannot navigate; the real submit is the browser's, covered in e2e.
    form?.addEventListener('submit', (e) => e.preventDefault());
    form?.dispatchEvent(new Event('submit', { bubbles: true, composed: true, cancelable: true }));

    const hit = findEvent('search_submit');
    expect(hit?.ucf_target).toBe('has_query');
    expect(JSON.stringify(hit)).not.toContain('my private search');
  });

  it('reports an empty query as empty, not as a search', () => {
    const root = setup();
    const form = root.querySelector('form');
    form?.addEventListener('submit', (e) => e.preventDefault());
    form?.dispatchEvent(new Event('submit', { bubbles: true, composed: true, cancelable: true }));

    expect(findEvent('search_submit')?.ucf_target).toBe('empty_query');
  });
});
