import mark from './brand/ucf-stacked.svg';
import { type HeaderConfig, rootUrlFor } from './config';
import type { Session } from './features/session';
import closeIcon from './icons/close.svg';
import searchIcon from './icons/search.svg';
import userIcon from './icons/user.svg';

export const HOME_URL = 'https://www.ucf.edu';
export const MYUCF_URL = 'https://my.ucf.edu';

/** Mock SSO endpoints. Real ones replace these without changing the markup. */
export const LOGIN_PATH = 'api/dev/login';

/**
 * Escapes text interpolated into the markup string.
 *
 * `firstName` arrives from the network. Every other value in this file is a
 * build-time constant or a URL that has already been through `new URL()`, so
 * this is the one place untrusted text reaches innerHTML — and the bar renders
 * inside hundreds of host pages, where an injection would be ours, not theirs.
 */
function esc(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Where the Login button sends the browser.
 *
 * `return` brings the user back to the page they were on. The API validates it
 * against the same allowlist that gates CORS before honouring it — a login
 * endpoint that redirects wherever it is told is an open redirect.
 */
export function loginUrl(cfg: HeaderConfig, loc: Location = window.location): string {
  return `${rootUrlFor(cfg, LOGIN_PATH, loc)}?return=${encodeURIComponent(loc.href)}`;
}

/**
 * The swappable right-hand zone.
 *
 * Three states, and which two are reachable depends on the build. With the
 * session seam compiled out there is only the MyUCF button, exactly as in
 * 4.0.0 — that branch is what the visual baselines and e2e suite assert, and
 * esbuild eliminates the rest.
 *
 * Signed out is an ordinary anchor carrying a real href, not a button with a
 * click handler. Same reasoning as the search form: the browser performs the
 * navigation itself, so login works before any deferred script has run.
 */
export function actions(cfg: HeaderConfig, session: Session): string {
  const state = session.signedIn ? 'in' : 'out';

  let inner: string;
  if (!__UCFHB_SESSION__) {
    inner = `<a class="myucf" part="myucf" href="${MYUCF_URL}">${userIcon}<span>MyUCF</span></a>`;
  } else if (session.signedIn) {
    // Mock-up: the eventual account menu lives here. For now it is the proof
    // that the cookie round-tripped and the session verified.
    inner = `<span class="greeting" part="greeting">Hi, ${esc(session.firstName)}</span>`;
  } else {
    inner = `<a class="login" part="login" href="${loginUrl(cfg)}">${userIcon}<span>Login</span></a>`;
  }

  return `<div class="zone" data-state="${state}">${inner}</div>`;
}

export function barMarkup(cfg: HeaderConfig, session: Session = { signedIn: false }): string {
  const mode = `${cfg.wideBreakpoint ? ' is-wide' : ''}${cfg.fullWidth ? ' is-full' : ''}`;

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
    '<div class="search" part="search">' +
    // A real action + name="q" means the browser performs the GET itself.
    // No submit handler is needed for the search to work at all — the
    // deferred analytics layer only listens in to record the event.
    `<form class="search-form" role="search" action="${cfg.searchUrl}" method="get">` +
    '<label class="visually-hidden" for="ucfhb-q">Search UCF</label>' +
    '<input class="search-input" id="ucfhb-q" name="q" type="search"' +
    ' placeholder="Search UCF" autocomplete="off" tabindex="-1">' +
    '</form>' +
    '<button class="search-toggle" type="button" aria-expanded="false"' +
    ' aria-controls="ucfhb-q" aria-label="Open search">' +
    `<span class="i-search">${searchIcon}</span><span class="i-close">${closeIcon}</span>` +
    '</button>' +
    '</div>' +
    actions(cfg, session) +
    '</div>' +
    '</div>' +
    '</div>'
  );
}

export function searchDestination(cfg: HeaderConfig, query: string): string {
  const url = new URL(cfg.searchUrl, HOME_URL);
  url.searchParams.set('q', query);
  return url.toString();
}
