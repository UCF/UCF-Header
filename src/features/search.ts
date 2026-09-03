/**
 * The pop-out search. This is the only interactive behaviour on the critical
 * path — everything else waits until after first paint.
 *
 * Submission itself needs no JavaScript: the form carries a real action and a
 * `name="q"` input, so the browser performs the GET natively.
 */

export interface SearchController {
  open(): void;
  close(): void;
  destroy(): void;
}

export function initSearch(root: ShadowRoot, doc: Document = document): SearchController | null {
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

  const isOpen = () => wrap.classList.contains('is-open');

  const open = (): void => {
    if (isOpen()) return;
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

  toggle.addEventListener('click', onToggle);
  root.addEventListener('keydown', onKeydown);
  doc.addEventListener('click', onDocClick);

  return {
    open,
    close: () => close(),
    destroy() {
      toggle.removeEventListener('click', onToggle);
      root.removeEventListener('keydown', onKeydown);
      doc.removeEventListener('click', onDocClick);
    },
  };
}
