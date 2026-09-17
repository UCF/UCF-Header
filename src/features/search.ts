/**
 * The pop-out search. This and the sign-in tray are the only interactive
 * behaviour on the critical path — everything else waits until after first
 * paint.
 *
 * Submission itself needs no JavaScript: the form carries a real action and a
 * `name="q"` input, so the browser performs the GET natively. The site scope
 * below is the one thing layered on top of that, and it is additive — with
 * scripting broken the field still submits, just unscoped.
 */

import type { Disclosure } from './disclosure';

/** Which corpus the visitor is searching. */
export type SearchScope = 'ucf' | 'site';

export interface SearchController extends Disclosure {
  /** The scope currently selected. Exposed for tests. */
  scope(): SearchScope;
}

/**
 * The host page's domain, or null when there is not a usable one (a `file://`
 * page, say) and the scope picker should not be offered at all.
 *
 * Deliberately the exact hostname, with no `www.` stripping. `site:` is a
 * prefix match, so `site:ucf.edu` would match every subdomain of the university
 * — which is the UCF-wide search the visitor just chose to narrow away from.
 */
export function siteDomain(loc: Pick<Location, 'hostname'> = window.location): string | null {
  return loc.hostname || null;
}

/**
 * The string actually sent as `q`.
 *
 * A query that already carries a `site:` operator is left alone: the visitor
 * has been more specific than the picker can be, and stacking two operators
 * returns nothing.
 */
export function scopedQuery(query: string, domain: string | null, scope: SearchScope): string {
  const q = query.trim();
  if (scope !== 'site' || !domain || !q || /(^|\s)site:/i.test(q)) return query;
  return `site:${domain} ${q}`;
}

export function initSearch(
  root: ShadowRoot,
  doc: Document = document,
  domain: string | null = siteDomain(),
): SearchController | null {
  const wrapEl = root.querySelector<HTMLElement>('.search');
  const toggleEl = root.querySelector<HTMLButtonElement>('.search-toggle');
  const inputEl = root.querySelector<HTMLInputElement>('.search-input');

  if (!wrapEl || !toggleEl || !inputEl) return null;

  const wrap = wrapEl;
  const toggle = toggleEl;
  const input = inputEl;
  /*
   * The mobile layout has to shrink the wordmark to give the open field room,
   * which means styling an ANCESTOR of `.search` from `.search`'s state. That
   * is what `:has()` is for, and `.inner:has(.search.is-open)` is what this
   * used to rely on — but iOS Safari does not reliably re-evaluate a `:has()`
   * ancestor when script mutates a descendant's class list inside a shadow
   * root. The selector matched on first paint and then went stale, so the
   * wordmark kept its width and squeezed the input down to the caret.
   *
   * Mirroring the state onto `.inner` costs one classList call and turns every
   * dependent rule into a plain descendant selector, with no invalidation
   * subtlety on any engine. `.inner` may be absent in a unit-test stub, so it
   * is optional throughout.
   */
  const inner = root.querySelector<HTMLElement>('.inner');

  const form = root.querySelector<HTMLFormElement>('.search-form');
  const label = root.querySelector<HTMLElement>(`label[for="${input.id}"]`);
  // Absent by design when there is no usable domain — see siteDomain().
  const group = root.querySelector<HTMLElement>('.scope');
  const options = [...root.querySelectorAll<HTMLButtonElement>('.scope-opt')];

  let scope: SearchScope = wrap.dataset.scope === 'site' ? 'site' : 'ucf';
  let before: (() => void) | null = null;

  const isOpen = () => wrap.classList.contains('is-open');

  /**
   * Writes the scope back out to the DOM: the checked option, the roving tab
   * stop, and the field's own name. Naming the field after the domain is what
   * makes the mode legible — "Search cah.ucf.edu" says what pressing Enter will
   * do far better than a highlighted pill does on its own.
   *
   * The closed toggle is `visibility: hidden`, which takes both options out of
   * the tab order on its own, so the tab stop never has to track open state.
   */
  const setScope = (next: SearchScope): void => {
    scope = next;
    wrap.dataset.scope = scope;

    for (const opt of options) {
      const on = opt.dataset.scope === scope;
      opt.setAttribute('aria-checked', String(on));
      opt.tabIndex = on ? 0 : -1;
    }

    const text = scope === 'site' && domain ? `Search ${domain}` : 'Search UCF';
    input.placeholder = text;
    if (label) label.textContent = text;
  };

  const open = (): void => {
    if (isOpen()) return;
    before?.();
    wrap.classList.add('is-open');
    inner?.classList.add('is-searching');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close search');
    // Only tabbable while visible.
    input.removeAttribute('tabindex');
    input.focus();
  };

  const close = (returnFocus = false): void => {
    if (!isOpen()) return;
    wrap.classList.remove('is-open');
    inner?.classList.remove('is-searching');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open search');
    input.setAttribute('tabindex', '-1');
    if (returnFocus) toggle.focus();
  };

  const onToggle = () => (isOpen() ? close(true) : open());

  const onKeydown = (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape' && isOpen()) close(true);
  };

  // composedPath sees through the shadow boundary, so this correctly treats a
  // click on the bar's own controls as "inside".
  const onDocClick = (e: Event) => {
    if (isOpen() && !e.composedPath().includes(wrap)) close();
  };

  /*
   * A pointer click hands focus back to the field, so choosing a scope never
   * interrupts typing — and it keeps focus inside the shadow root on WebKit,
   * which does not focus a clicked <button> and would otherwise strand Escape.
   * A keyboard click (Space or Enter, `detail` 0) leaves focus where it is.
   */
  const onScopeClick = (e: Event) => {
    const next = (e.target as Element | null)?.closest<HTMLElement>('.scope-opt')?.dataset.scope;
    if (next !== 'ucf' && next !== 'site') return;
    setScope(next);
    if ((e as MouseEvent).detail > 0) input.focus();
  };

  // Arrow keys move between the options and select as they go — the radiogroup
  // pattern. With two options every arrow lands on the other one.
  const onScopeKeydown = (e: Event) => {
    if (!/^Arrow(Left|Right|Up|Down)$/.test((e as KeyboardEvent).key)) return;
    e.preventDefault();
    setScope(scope === 'site' ? 'ucf' : 'site');
    options.find((o) => o.dataset.scope === scope)?.focus();
  };

  /*
   * Scoping happens at submit time rather than by keeping a second hidden field
   * in sync, so there is exactly one source of truth for what gets sent — and
   * any named control in this form would reach search.ucf.edu as a stray
   * parameter.
   *
   * The browser builds the form's entry list synchronously while this handler's
   * task is still running, so restoring the field on the next tick still
   * submits the scoped query, and leaves the visitor looking at what they
   * actually typed if the page comes back from the bfcache.
   */
  const onSubmit = (): void => {
    const typed = input.value;
    const scoped = scopedQuery(typed, domain, scope);
    if (scoped === typed) return;

    input.value = scoped;
    setTimeout(() => {
      input.value = typed;
    }, 0);
  };

  toggle.addEventListener('click', onToggle);
  root.addEventListener('keydown', onKeydown);
  doc.addEventListener('click', onDocClick);
  group?.addEventListener('click', onScopeClick);
  group?.addEventListener('keydown', onScopeKeydown);
  form?.addEventListener('submit', onSubmit);

  return {
    open,
    close: () => close(),
    onOpen(fn) {
      before = fn;
    },
    scope: () => scope,
    destroy() {
      toggle.removeEventListener('click', onToggle);
      root.removeEventListener('keydown', onKeydown);
      doc.removeEventListener('click', onDocClick);
      group?.removeEventListener('click', onScopeClick);
      group?.removeEventListener('keydown', onScopeKeydown);
      form?.removeEventListener('submit', onSubmit);
    },
  };
}
