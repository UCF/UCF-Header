/**
 * The pop-out search. This is the only interactive behaviour on the critical
 * path — everything else waits until after first paint.
 *
 * Submission itself needs no JavaScript: the form carries a real action and a
 * `name="q"` input, so the browser performs the GET natively. The site scope
 * below is the one thing layered on top of that, and it is additive — with
 * scripting broken the field still submits, just unscoped.
 */

/** Which corpus the visitor is searching. */
export type SearchScope = 'ucf' | 'site';

export interface SearchController {
  open(): void;
  close(): void;
  /** The scope currently selected. Exposed for tests and for analytics. */
  scope(): SearchScope;
  destroy(): void;
}

/**
 * The host page's domain, or null when there is not a usable one (a `file://`
 * page, say) and the scope picker should not be offered at all.
 *
 * Deliberately the exact hostname, with no `www.` stripping. `site:` is a
 * prefix match in every engine that supports it, so `site:ucf.edu` would match
 * every subdomain of the university — which is the UCF-wide search the visitor
 * just chose to narrow away from. `site:www.cah.ucf.edu` is the point.
 */
export function siteDomain(loc: Pick<Location, 'hostname'> = window.location): string | null {
  return loc.hostname || null;
}

/**
 * The string actually sent as `q`.
 *
 * A query that already carries a `site:` operator is left alone: the visitor
 * has been more specific than the toggle can be, and stacking two operators
 * yields nothing on any engine.
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

  const isOpen = () => wrap.classList.contains('is-open');

  /**
   * Writes the current scope back out to the DOM: the checked radio, the roving
   * tab stop, and the field's own name. Naming the field after the domain is
   * what makes the mode legible — "Search cah.ucf.edu" says what pressing Enter
   * will do far better than a highlighted pill does on its own.
   */
  const applyScope = (): void => {
    wrap.dataset.scope = scope;

    for (const opt of options) {
      const on = opt.dataset.scope === scope;
      opt.setAttribute('aria-checked', on ? 'true' : 'false');
      // One tab stop for the whole group, and none at all while collapsed —
      // the same rule the input follows.
      opt.tabIndex = on && isOpen() ? 0 : -1;
    }

    const text = scope === 'site' && domain ? `Search ${domain}` : 'Search UCF';
    input.placeholder = text;
    if (label) label.textContent = text;
  };

  const setScope = (next: SearchScope, focusOption = false): void => {
    scope = next;
    applyScope();
    if (focusOption) options.find((o) => o.dataset.scope === next)?.focus();
  };

  const open = (): void => {
    if (isOpen()) return;
    wrap.classList.add('is-open');
    inner?.classList.add('is-searching');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close search');
    // Only tabbable while visible.
    input.removeAttribute('tabindex');
    applyScope();
    input.focus();
  };

  const close = (returnFocus = false): void => {
    if (!isOpen()) return;
    wrap.classList.remove('is-open');
    inner?.classList.remove('is-searching');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Open search');
    input.setAttribute('tabindex', '-1');
    applyScope();
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

  const onScopeClick = (e: Event) => {
    const hit = (e.target as Element | null)?.closest<HTMLButtonElement>('.scope-opt');
    const next = hit?.dataset.scope;
    if (next === 'ucf' || next === 'site') setScope(next);
  };

  /*
   * Arrow keys move between radios and select as they go, which is the
   * radiogroup pattern's expected behaviour. Space and Enter come free: these
   * are real <button> elements, so the browser fires click for both.
   */
  const onScopeKeydown = (e: Event) => {
    const key = (e as KeyboardEvent).key;
    const step =
      key === 'ArrowRight' || key === 'ArrowDown'
        ? 1
        : key === 'ArrowLeft' || key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;

    const at = options.findIndex((o) => o.dataset.scope === scope);
    if (at < 0) return;

    e.preventDefault();
    const next = options[(at + step + options.length) % options.length]?.dataset.scope;
    if (next === 'ucf' || next === 'site') setScope(next, true);
  };

  /*
   * Scoping happens at submit time rather than by keeping a second hidden field
   * in sync, so there is exactly one source of truth for what gets sent.
   *
   * The browser builds the form's entry list synchronously while this handler's
   * task is still running, so restoring the field on the next tick still
   * submits the scoped query — and leaves the visitor looking at what they
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

  applyScope();

  return {
    open,
    close: () => close(),
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
