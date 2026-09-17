import mark from './brand/ucf-stacked.svg';
import type { HeaderConfig } from './config';
import { type SearchScope, scopedQuery, siteDomain } from './features/search';
import type { Session } from './features/session';
import closeIcon from './icons/close.svg';
import lockIcon from './icons/lock.svg';
import plusIcon from './icons/plus.svg';
import searchIcon from './icons/search.svg';

export const HOME_URL = 'https://www.ucf.edu';
export const MYUCF_URL = 'https://my.ucf.edu';

/**
 * Sent as `src` with every search, so the results side can tell a search that
 * started in the header from one typed into a site's own search box. The
 * referrer cannot do this: cross-origin, browsers send only the origin, which
 * is the same for both.
 *
 * Deliberately not a UTM parameter. GA4 treats UTM values on a link between
 * our own properties as a new campaign, which restarts the visitor's session
 * and overwrites where they actually came from.
 */
export const SEARCH_SOURCE = 'ucfhb';

/**
 * The four campus services behind the sign-in tray, in the order v3 showed
 * them.
 *
 * v3 drew each label as a slice of a spritesheet, which is why the two-tone
 * lockups — gold "UCF" against light "my", gold "web" against light "courses" —
 * were baked into a PNG. Here a lockup is two spans and a single-part label is
 * bare text; either way it is real anchor text, so the labels are selectable,
 * translatable, scalable, and readable by a crawler. `bold` marks the gold
 * half, and its position in `parts` is the position on screen.
 */
interface Service {
  href: string;
  parts: { text: string; bold?: boolean }[];
}

const SERVICES: Service[] = [
  { href: 'https://workday.ucf.edu/', parts: [{ text: 'workday' }] },
  { href: MYUCF_URL, parts: [{ text: 'my' }, { text: 'UCF', bold: true }] },
  { href: 'https://webmail.ucf.edu/', parts: [{ text: 'Email' }] },
  {
    href: 'https://webcourses.ucf.edu',
    parts: [{ text: 'web', bold: true }, { text: 'courses' }],
  },
];

function service(s: Service): string {
  // The weight split is what makes a lockup a lockup: light only reads as
  // deliberate opposite a bold half. "workday" and "Email" have no second half,
  // so they are plain labels at the bar's own weight rather than the light half
  // of a two-tone pair that is not there.
  const lockup = s.parts.length > 1;

  // No aria-label: the parts concatenate to exactly the right accessible name
  // ("myUCF", "webcourses"), so adding one would only risk drifting from it.
  const label = s.parts
    .map((p) =>
      lockup ? `<span class="${p.bold ? 't-bold' : 't-light'}">${p.text}</span>` : p.text,
    )
    .join('');

  return `<a class="service" href="${s.href}">${label}</a>`;
}

/**
 * The signed-out right-hand zone: the sign-in button and the tray it opens.
 *
 * Phase 2 adds a signed-in branch here. It renders into the same slot, so
 * resolving a session swaps the slot's contents without moving anything else
 * in the bar.
 */
function actions(session: Session): string {
  // Phase 2 branches here on session.signedIn, replacing the sign-in button
  // with the avatar and the tray with the session's own quick links. `.zone` is
  // the slot that gets swapped; nothing outside it needs to change.
  const state = session.signedIn ? 'in' : 'out';

  return (
    `<div class="zone" data-state="${state}">` +
    '<button class="signin" part="signin" type="button" aria-expanded="false"' +
    ' aria-controls="ucfhb-services">' +
    `<span class="i-lock">${lockIcon}</span>` +
    '<span class="signin-label"><span class="t-light">UCF</span>' +
    '<span class="t-bold">SIGN IN</span></span>' +
    `<span class="i-plus">${plusIcon}</span>` +
    '</button>' +
    '<div class="services" part="services" id="ucfhb-services">' +
    SERVICES.map(service).join('') +
    '</div>' +
    '</div>'
  );
}

/**
 * The UCF / Site toggle. On desktop it sits in the row, left of the field; on a
 * phone the row has no room for it and CSS moves it onto a shelf below the bar.
 * It only exists visually while the search is open.
 *
 * Buttons in a radiogroup rather than `<input type="radio">`: a radio needs a
 * `name` to group with its sibling, and any named control inside this form is
 * sent to search.ucf.edu as a query parameter. The form sends exactly `q` and
 * the `src` marker, and nothing else.
 *
 * Nothing is rendered when there is no usable domain to scope to.
 */
function scopePicker(domain: string | null, scope: SearchScope): string {
  if (!domain) return '';

  const option = (value: SearchScope, text: string) =>
    `<button class="scope-opt" type="button" role="radio" data-scope="${value}"` +
    ` aria-checked="${value === scope}" tabindex="${value === scope ? 0 : -1}">${text}</button>`;

  return (
    // `.scope` is the positioning box — the shelf on a phone — and `.scope-track`
    // is the switch itself, so the control looks the same wherever it sits.
    '<div class="scope" part="search-scope" role="radiogroup" aria-label="Search scope">' +
    '<div class="scope-track">' +
    option('ucf', 'UCF') +
    option('site', 'Site') +
    '</div></div>'
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
  const fieldLabel = scope === 'site' ? `Search ${domain}` : 'Search UCF';

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
    actions(session) +
    `<div class="search" part="search" data-scope="${scope}">` +
    // A real action + name="q" means the browser performs the GET itself.
    // No submit handler is needed for the search to work at all — the site
    // scope rewrites `q` on the way out, and the deferred analytics layer
    // only listens in to record the event.
    `<form class="search-form" role="search" action="${cfg.searchUrl}" method="get">` +
    `<label class="visually-hidden" for="ucfhb-q">${fieldLabel}</label>` +
    // Before the input, so DOM order matches the desktop row it sits in.
    scopePicker(domain, scope) +
    '<input class="search-input" id="ucfhb-q" name="q" type="search"' +
    ` placeholder="${fieldLabel}" autocomplete="off" tabindex="-1">` +
    // After the field, so `q` stays the first parameter and the first input.
    `<input type="hidden" name="src" value="${SEARCH_SOURCE}">` +
    '</form>' +
    '<button class="search-toggle" type="button" aria-expanded="false"' +
    ' aria-controls="ucfhb-q" aria-label="Open search">' +
    `<span class="i-search">${searchIcon}</span><span class="i-close">${closeIcon}</span>` +
    '</button>' +
    '</div>' +
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
  url.searchParams.set('src', SEARCH_SOURCE);
  return url.toString();
}
