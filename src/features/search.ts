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

  const isOpen = () => wrap.classList.contains('is-open');

  const open = (): void => {
    if (isOpen()) return;
    wrap.classList.add('is-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', 'Close search');
    // Only tabbable while visible.
    input.removeAttribute('tabindex');
    input.focus();
  };

  const close = (returnFocus = false): void => {
    if (!isOpen()) return;
    wrap.classList.remove('is-open');
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
