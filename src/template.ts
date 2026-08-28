import mark from './brand/ucf-stacked.svg';
import type { HeaderConfig } from './config';
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
    actions(session) +
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
