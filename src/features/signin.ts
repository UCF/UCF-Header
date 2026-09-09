/**
 * The sign-in tray: a disclosure button that slides the four campus service
 * links out to its right.
 *
 * Like the search, this is on the critical path — a visitor who clicks the
 * button in the first 200ms should get the tray, not nothing. It is small
 * enough that keeping it there costs less than the machinery to defer it.
 *
 * There is no JavaScript fallback to worry about: with no script the tray never
 * renders in the first place, and the links it holds are all reachable from
 * ucf.edu anyway.
 */

import type { Disclosure } from './disclosure';

export function initSignin(root: ShadowRoot, doc: Document = document): Disclosure | null {
  const zoneEl = root.querySelector<HTMLElement>('.zone');
  const toggleEl = root.querySelector<HTMLButtonElement>('.signin');

  if (!zoneEl || !toggleEl) return null;

  const zone = zoneEl;
  const toggle = toggleEl;
  // Mirrored onto `.inner` for the same reason the search does it: iOS Safari
  // does not reliably re-evaluate a `:has()` ancestor when script changes a
  // descendant's class inside a shadow root. See features/search.ts. The two
  // panels use different flags because the layouts they force are different —
  // only the search has to spend the wordmark at phone widths.
  const inner = root.querySelector<HTMLElement>('.inner');

  let before: (() => void) | null = null;

  const isOpen = () => zone.classList.contains('is-open');

  const open = (): void => {
    if (isOpen()) return;
    before?.();
    zone.classList.add('is-open');
    inner?.classList.add('is-tray');
    toggle.setAttribute('aria-expanded', 'true');
  };

  const close = (returnFocus = false): void => {
    if (!isOpen()) return;
    zone.classList.remove('is-open');
    inner?.classList.remove('is-tray');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  };

  /*
   * The explicit focus() is a Safari workaround, not a nicety. WebKit does not
   * focus a <button> when it is clicked, so on macOS and iOS the tray opened
   * with focus still on <body> — outside the shadow root — and the Escape
   * listener below never saw a key. The search does not need this because it
   * moves focus into its input on open; the tray has nowhere to send it.
   *
   * It costs a mouse user nothing: `:focus-visible` does not match a pointer
   * click, so no ring appears.
   */
  const onToggle = () => {
    toggle.focus();
    if (isOpen()) close(true);
    else open();
  };

  const onKeydown = (e: Event) => {
    if ((e as KeyboardEvent).key === 'Escape' && isOpen()) close(true);
  };

  // composedPath sees through the shadow boundary, so a click on the tray's own
  // links counts as inside — the navigation wins and the tray goes with the page.
  const onDocClick = (e: Event) => {
    if (isOpen() && !e.composedPath().includes(zone)) close();
  };

  toggle.addEventListener('click', onToggle);
  root.addEventListener('keydown', onKeydown);
  doc.addEventListener('click', onDocClick);

  return {
    open,
    close: () => close(),
    onOpen(fn) {
      before = fn;
    },
    destroy() {
      toggle.removeEventListener('click', onToggle);
      root.removeEventListener('keydown', onKeydown);
      doc.removeEventListener('click', onDocClick);
    },
  };
}
