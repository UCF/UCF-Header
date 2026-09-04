/**
 * The profile model.
 *
 * Deliberately tiny, and deliberately cosmetic. The header uses this to decide
 * which button to draw and what name to put on it. Nothing here is a capability
 * and nothing downstream should treat it as proof of anything — a signed-in
 * payload says "this browser presented a valid session to us", not "grant
 * access". Every consumer must re-authenticate for itself.
 *
 * Keep it small for a second reason: this payload is on the critical path for
 * the personalised render, and every field costs bytes on hundreds of sites.
 */

export interface QuickLink {
  label: string;
  href: string;
}

/** Wire format for `GET /api/session`. Matches `src/features/session.ts`. */
export type SessionPayload =
  | { v: 1; signedIn: false; ttl: number }
  | {
      v: 1;
      signedIn: true;
      /** Given name, for "Hi, Jim". */
      firstName: string;
      /** Two-letter fallback for the avatar slot. */
      initials: string;
      /** Personalised destinations, already ordered. Capped, see MAX_LINKS. */
      links: QuickLink[];
      /** Seconds the header may reuse this payload before refetching. */
      ttl: number;
    };

/** More than this and the dropdown stops being a shortcut and starts being a menu. */
export const MAX_LINKS = 6;

/**
 * Where profile data comes from.
 *
 * The mock source is what ships today. A Pathify source slots in here later:
 * it receives the verified Principal and returns the same shape, so neither
 * the endpoint nor the header changes when it lands.
 */
export interface ProfileSource {
  readonly name: string;
  /** Must resolve quickly or not at all — see PROFILE_TIMEOUT_MS at the call site. */
  get(principalId: string, signal: AbortSignal): Promise<ProfileData | null>;
}

export interface ProfileData {
  firstName: string;
  lastName?: string;
  links?: QuickLink[];
}
