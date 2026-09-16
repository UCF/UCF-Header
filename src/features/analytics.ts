/**
 * Deferred layer. Nothing here runs until after first paint.
 *
 * Two audiences: whatever GTM/GA4 the host site already runs (which can build
 * triggers off the dataLayer events) and the header's own Tag Manager
 * container, which gives the central team a census of usage without depending
 * on every department configuring analytics correctly.
 *
 * All of this is deferred until after first paint, so loading GTM never blocks
 * the bar from rendering. That costs a little page-view fidelity at the very
 * fast tail — a visitor who leaves before the idle callback fires is never
 * recorded — which understates traffic and bounce rate slightly rather than
 * overstating them. Measured at ~17ms after DOMContentLoaded on a quiet page
 * and ~700ms on a busy one, capped by the 2s idle timeout in index.ts.
 */

import type { HeaderConfig } from '../config';

/**
 * Every action reads `{type}_{name}` — the verb first, so a report groups by
 * what was done rather than scattering the same gesture across four names.
 *
 * The template literal type is what keeps that true after this file stops being
 * the only one anybody reads: `tray_click` is a type error, `click_tray` is not.
 */
type Interaction = 'click' | 'open' | 'close' | 'submit';
type Action = `${Interaction}_${string}`;

interface HeaderEvent {
  event: 'ucf_header_interaction';
  ucf_action: Action;
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

export function track(cfg: HeaderConfig, action: Action, target: string | null = null): void {
  const payload: HeaderEvent = {
    event: 'ucf_header_interaction',
    ucf_action: action,
    ucf_target: target,
    ucf_host: window.location.hostname,
    ucf_version: cfg.version,
  };
  dataLayer().push(payload);
}

/**
 * The standard Tag Manager bootstrap, minus two things it normally carries.
 *
 * There is no `<noscript>` iframe fallback: the bar is built entirely in JS, so
 * a visitor without it has no header to report on in the first place.
 *
 * And there is no `config` call. Under gtag the header set its own page-view
 * behaviour in code; under GTM that is a property of the container — a GA4
 * Configuration tag on the All Pages trigger, which the `gtm.js` event pushed
 * here is what fires. Page views are therefore still on, but they are on
 * because the container says so, and turning them off no longer shows up as a
 * change to this file.
 */
function loadGtm(gtmId: string, doc: Document): void {
  dataLayer().push({ 'gtm.start': Date.now(), event: 'gtm.js' });

  const s = doc.createElement('script');
  s.async = true;
  s.src = `https://www.googletagmanager.com/gtm.js?id=${gtmId}`;
  doc.head.appendChild(s);
}

export function initAnalytics(root: ShadowRoot, cfg: HeaderConfig, doc: Document = document): void {
  if (cfg.gtmId) loadGtm(cfg.gtmId, doc);

  root.addEventListener('click', (e) => {
    const path = e.composedPath();
    const hit = (sel: string) => path.some((n) => n instanceof Element && n.matches(sel));

    if (hit('.home')) track(cfg, 'click_home');
    // The service links are the reason the tray exists, so which one was taken
    // matters more than that the tray was opened. Reported by hostname, which
    // is stable across the redirect chains these all sit behind.
    else if (hit('.service')) {
      const link = path.find((n): n is HTMLAnchorElement => n instanceof HTMLAnchorElement);
      track(cfg, 'click_service', link ? new URL(link.href).hostname : null);
    } else if (hit('.signin')) {
      const open = root.querySelector('.zone')?.classList.contains('is-open');
      track(cfg, open ? 'open_signin' : 'close_signin');
    } else if (hit('.search-toggle')) {
      const open = root.querySelector('.search')?.classList.contains('is-open');
      track(cfg, open ? 'open_search' : 'close_search');
    }
  });

  root.addEventListener('submit', (e) => {
    const input = (e.target as HTMLFormElement).querySelector<HTMLInputElement>('.search-input');
    // Presence only. The raw query text never leaves the page.
    track(cfg, 'submit_search', input?.value.trim() ? 'has_query' : 'empty_query');
  });
}
