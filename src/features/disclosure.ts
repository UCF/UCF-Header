/**
 * The shape shared by the bar's two expanding panels — the sign-in tray and
 * the search field.
 *
 * They are separate modules because their internals have nothing in common: one
 * moves focus into an input and manages a tabindex, the other only toggles a
 * class. What they share is a contract, and that contract is what lets
 * index.ts wire them against each other without either importing the other.
 *
 * Type-only, so it costs nothing in the bundle.
 */
export interface Disclosure {
  open(): void;
  close(): void;
  /** Called immediately before the panel opens. Single slot; last call wins. */
  onOpen(fn: () => void): void;
  destroy(): void;
}
