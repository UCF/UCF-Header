import { beforeEach, describe, expect, it } from 'vitest';
import type { HeaderConfig } from '../../src/config';
import { initAnalytics } from '../../src/features/analytics';
import { mount } from '../../src/render';

const cfg: HeaderConfig = {
  version: '4.0.0-test',
  rootUrl: 'universityheader.test',
  gtmId: 'GTM-TEST123',
  searchUrl: 'https://search.ucf.edu/',
  wideBreakpoint: false,
  fullWidth: false,
};

/*
 * Everything on the dataLayer is now a plain object — the GTM bootstrap event
 * and the header's own interaction events alike. Under gtag the queue also held
 * real `arguments` objects, which needed reading apart; that shape is gone.
 */
const events = () => (window.dataLayer ?? []) as Record<string, unknown>[];
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

  it('loads gtm.js for the configured container ID', () => {
    setup();
    const script = document.querySelector<HTMLScriptElement>('script[src*="googletagmanager"]');
    expect(script?.src).toContain('/gtm.js?id=GTM-TEST123');
    // async, so it never blocks parsing or the bar's render.
    expect(script?.async).toBe(true);
  });

  /*
   * The `gtm.js` event is what fires the container's All Pages trigger, and so
   * what makes the GA4 Configuration tag inside it send a page view. Page views
   * are still deliberately ON, but the switch now lives in the container rather
   * than in this repo — all the header can guarantee is that the trigger fires.
   * Without this push the container loads and does nothing at all, which is a
   * silent, total loss of data rather than a visible break.
   */
  it('pushes the gtm.js start event that fires the All Pages trigger', () => {
    setup();
    const start = events().find((e) => e.event === 'gtm.js');
    expect(start).toBeDefined();
    expect(typeof start?.['gtm.start']).toBe('number');
  });

  it('does not load analytics when no container ID is configured', () => {
    setup({ gtmId: null });
    expect(document.querySelector('script[src*="googletagmanager"]')).toBeNull();
    expect(events().some((e) => e.event === 'gtm.js')).toBe(false);
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
