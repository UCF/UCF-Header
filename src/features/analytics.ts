/**
 * Deferred layer. Nothing here runs until after first paint.
 *
 * Two audiences: whatever GTM/GA4 the host site already runs (which can build
 * triggers off the dataLayer events) and the header's own GA4 property, which
 * gives the central team a census of usage without depending on every
 * department configuring analytics correctly.
 *
 * All of this is deferred until after first paint, so loading GA never blocks
 * the bar from rendering. That costs a little page-view fidelity at the very
 * fast tail — a visitor who leaves before the idle callback fires is never
 * recorded — which understates traffic and bounce rate slightly rather than
 * overstating them. Measured at ~17ms after DOMContentLoaded on a quiet page
 * and ~700ms on a busy one, capped by the 2s idle timeout in index.ts.
 */

import type { HeaderConfig } from '../config';

interface HeaderEvent {
  event: 'ucf_header_interaction';
  ucf_action: string;
  ucf_target?: string | null;
  ucf_host: string;
  ucf_version: string;
}

declare global {
  interface Window {
    dataLayer?: unknown[];
  }
}

function dataLayer(): unknown[] {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function track(cfg: HeaderConfig, action: string, target: string | null = null): void {
  const payload: HeaderEvent = {
    event: 'ucf_header_interaction',
    ucf_action: action,
    ucf_target: target,
    ucf_host: window.location.hostname,
    ucf_version: cfg.version,
  };
  dataLayer().push(payload);
}

function loadGa(gaId: string, doc: Document): void {
  const dl = dataLayer();

  // gtag.js distinguishes a real `arguments` object from an array when it reads
  // the queue, so this has to stay a function declaration pushing `arguments` —
  // the documented snippet, not a stylistic choice.
  function gtag() {
    // biome-ignore lint/complexity/noArguments: required by gtag's queue contract.
    dl.push(arguments);
  }

  const s = doc.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  doc.head.appendChild(s);

  (gtag as (...a: unknown[]) => void)('js', new Date());
  // Page views are on, matching v3. This is what makes the header's own
  // property a census of where the bar actually runs: with page views off, a
  // pageview where nobody touches the header reports nothing at all, and the
  // stream degrades to "pages where someone clicked the bar".
  //
  // It does mean the header counts a page view on sites that also run their own
  // GA4. That is a known duplication, accepted for the MVP pending the wider
  // analytics strategy.
  (gtag as (...a: unknown[]) => void)('config', gaId);
}

export function initAnalytics(root: ShadowRoot, cfg: HeaderConfig, doc: Document = document): void {
  if (cfg.gaId) loadGa(cfg.gaId, doc);

  root.addEventListener('click', (e) => {
    const path = e.composedPath();
    const hit = (sel: string) => path.some((n) => n instanceof Element && n.matches(sel));

    if (hit('.myucf')) track(cfg, 'myucf_click');
    else if (hit('.home')) track(cfg, 'home_click');
    else if (hit('.search-toggle')) {
      const open = root.querySelector('.search')?.classList.contains('is-open');
      track(cfg, open ? 'search_open' : 'search_close');
    }
  });

  root.addEventListener('submit', (e) => {
    const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>('.search-input');
    // Presence only. The raw query text never leaves the page.
    track(cfg, 'search_submit', input?.value.trim() ? 'has_query' : 'empty_query');
  });
}
