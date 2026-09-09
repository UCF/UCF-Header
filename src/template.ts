import mark from './brand/ucf-stacked.svg';
import type { HeaderConfig } from './config';
import { type SearchScope, scopedQuery, siteDomain } from './features/search';
import type { Session } from './features/session';
import closeIcon from './icons/close.svg';
import searchIcon from './icons/search.svg';
import userIcon from './icons/user.svg';

export const HOME_URL = 'https://www.ucf.edu';
export const MYUCF_URL = 'https://my.ucf.edu';

/**
 * The signed-out right-hand zone.
 *
 * Phase 2 adds a signed-in branch here. It renders into the same fixed-width
 * slot so that resolving a session swaps the slot's contents without moving
 * anything else in the bar.
 */
function actions(session: Session): string {
  // Phase 2 branches here on session.signedIn, replacing the button with the
  // avatar and launcher. `.zone` is the slot that gets swapped; nothing outside
  // it needs to change.
  const state = session.signedIn ? 'in' : 'out';
  return (
    `<div class="zone" data-state="${state}">` +
    `<a class="myucf" part="myucf" href="${MYUCF_URL}">${userIcon}<span>MyUCF</span></a>` +
    '</div>'
  );
}

/**
 * The UCF / Site segmented control, rendered inside the field's own frame.
 *
 * Real buttons in a radiogroup rather than `<input type="radio">`: a radio
 * needs a `name` to group with its sibling, and any named control inside this
 * form gets sent to search.ucf.edu as a stray query parameter. Buttons carry
 * no form data, so the only thing that reaches the search engine is `q`.
 *
 * Nothing is rendered when there is no usable domain to scope to.
 */
function scopePicker(domain: string | null, scope: SearchScope): string {
  if (!domain) return '';

  const option = (value: SearchScope, text: string) =>
    `<button class="scope-opt" type="button" role="radio" data-scope="${value}"` +
    ` aria-checked="${value === scope}" tabindex="-1">${text}</button>`;

  return (
    '<div class="scope" part="search-scope" role="radiogroup" aria-label="Search scope">' +
    option('ucf', 'UCF') +
    option('site', 'Site') +
    '</div>'
  );
}

export function barMarkup(
  cfg: HeaderConfig,
  session: Session = { signedIn: false },
  domain: string | null = siteDomain(),
): string {
  const mode = `${cfg.wideBreakpoint ? ' is-wide' : ''}${cfg.fullWidth ? ' is-full' : ''}`;
  const scope: SearchScope = cfg.siteScopeDefault && domain ? 'site' : 'ucf';
  // Named after what pressing Enter will actually do. Kept in sync by initSearch.
  const fieldLabel = scope === 'site' && domain ? `Search ${domain}` : 'Search UCF';

  return (
    `<div class="bar${mode}" part="bar">` +
    '<div class="inner">' +
    `<a class="home" part="logo" href="${HOME_URL}">` +
    mark +
    // Real anchor text, not an aria-label: it is the descriptive link back
    // to ucf.edu that crawlers read. Hidden visually on narrow screens via
    // clipping rather than `display:none`, so it stays in the a11y tree.
    '<span class="wordmark"><span>University of</span><span>Central Florida</span></span>' +
    '</a>' +
    '<div class="actions">' +
    `<div class="search" part="search" data-scope="${scope}">` +
    // A real action + name="q" means the browser performs the GET itself.
    // No submit handler is needed for the search to work at all — the site
    // scope rewrites `q` on the way out, and the deferred analytics layer
    // only listens in to record the event.
    `<form class="search-form" role="search" action="${cfg.searchUrl}" method="get">` +
    `<label class="visually-hidden" for="ucfhb-q">${fieldLabel}</label>` +
    scopePicker(domain, scope) +
    '<input class="search-input" id="ucfhb-q" name="q" type="search"' +
    ` placeholder="${fieldLabel}" autocomplete="off" tabindex="-1">` +
    '</form>' +
    '<button class="search-toggle" type="button" aria-expanded="false"' +
    ' aria-controls="ucfhb-q" aria-label="Open search">' +
    `<span class="i-search">${searchIcon}</span><span class="i-close">${closeIcon}</span>` +
    '</button>' +
    '</div>' +
    actions(session) +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

/** Where a submitted search lands. The browser builds this itself; this is the
 * same URL expressed in one place so it can be asserted directly. */
export function searchDestination(
  cfg: HeaderConfig,
  query: string,
  domain: string | null = null,
  scope: SearchScope = 'ucf',
): string {
  const url = new URL(cfg.searchUrl, HOME_URL);
  url.searchParams.set('q', scopedQuery(query, domain, scope));
  return url.toString();
}
