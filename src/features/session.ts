/**
 * Phase 2 seam — architected now, not shipped now.
 *
 * The whole module is behind the `__UCFHB_SESSION__` build flag, which is
 * `false` for 4.0.0, so esbuild eliminates it from the bundle entirely. What
 * ships in Phase 1 is the shape: a provider interface, the abort/timeout
 * plumbing, and a render path that takes a Session rather than assuming one.
 */

export interface QuickLink {
  label: string;
  href: string;
}

export type Session =
  | { signedIn: false }
  | { signedIn: true; firstName: string; initials: string; links: QuickLink[] };

export const SIGNED_OUT: Session = { signedIn: false };

export interface SessionProvider {
  get(signal: AbortSignal): Promise<Session>;
}

/** Short enough that the bar never appears to wait on it. */
export const SESSION_TIMEOUT_MS = 800;

/**
 * Fails closed to signed-out on timeout, network error, or any unexpected
 * shape. This is cosmetic state only — it decides which button is drawn and
 * must never be treated by a downstream system as proof of authentication.
 */
export function createSessionProvider(endpoint: string): SessionProvider {
  return {
    async get(signal: AbortSignal): Promise<Session> {
      try {
        const res = await fetch(endpoint, {
          credentials: 'include',
          signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return SIGNED_OUT;

        const data = (await res.json()) as Partial<Extract<Session, { signedIn: true }>>;
        if (!data?.signedIn || typeof data.firstName !== 'string') return SIGNED_OUT;

        return {
          signedIn: true,
          firstName: data.firstName,
          initials: typeof data.initials === 'string' ? data.initials : '',
          links: Array.isArray(data.links) ? data.links : [],
        };
      } catch {
        return SIGNED_OUT;
      }
    },
  };
}
