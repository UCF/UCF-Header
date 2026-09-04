/**
 * Phase 2 seam — architected now, not shipped now.
 *
 * The whole module is behind the `__UCFHB_SESSION__` build flag, which is
 * `false` for 4.0.0, so esbuild eliminates it from the bundle entirely. What
 * ships in Phase 1 is the shape: a provider interface, the abort/timeout
 * plumbing, and a render path that takes a Session rather than assuming one.
 *
 * Three layers keep this off the critical path, in order of how often each
 * one wins:
 *
 *   1. No hint cookie -> signed out, no request. On a public UCF page nobody
 *      is signed in, so the overwhelmingly common case costs nothing at all.
 *   2. Fresh local copy -> render from `localStorage`, no request. Keyed on
 *      the hint, so signing out invalidates every site's copy at once.
 *   3. Otherwise fetch, with a hard timeout and a fail-closed catch.
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
 * Readable marker cookie set by the login flow on `.ucf.edu`, and refreshed or
 * cleared by `/api/session`. It holds no secret and grants nothing — it says
 * only "a session exists, and this is its generation".
 *
 * Because every embedding site shares the `ucf.edu` registrable domain, this
 * is a same-site cookie rather than a third-party one, so neither Safari's ITP
 * nor Chrome's third-party cookie restrictions apply to it. A site outside
 * ucf.edu simply will not see it and renders signed out, which is correct.
 */
export const HINT_COOKIE = 'ucfhb_h';

const STORE_KEY = 'ucfhb.session';

/**
 * Ceiling on the server-declared TTL. The server tunes cache lifetime without
 * a header redeploy, but it cannot ask a browser to hold a stale name for a
 * day — a bad config value should degrade to "slightly chatty", never to
 * "wrong name pinned indefinitely".
 */
const MAX_TTL_MS = 2 * 60 * 60 * 1000;

interface Cached {
  /** Hint value this entry was fetched under. A mismatch means discard. */
  k: string;
  /** Absolute expiry, epoch ms. */
  e: number;
  s: Session;
}

export function readHint(doc: Document = document): string | null {
  // Deliberately a substring scan rather than a split-and-parse: it runs on
  // every page load and the cookie jar on some UCF sites is long.
  const jar = doc.cookie;
  const needle = `${HINT_COOKIE}=`;

  for (let at = jar.indexOf(needle); at !== -1; at = jar.indexOf(needle, at + 1)) {
    // A hit can be the tail of a longer cookie name — `other_ucfhb_h=`
    // contains `ucfhb_h=`. Keep scanning rather than giving up, or one
    // unrelated cookie on the host page hides the real one.
    const before = jar[at - 1];
    if (at > 0 && before !== ' ' && before !== ';') continue;

    const from = at + needle.length;
    const end = jar.indexOf(';', from);
    const value = (end === -1 ? jar.slice(from) : jar.slice(from, end)).trim();
    if (value) return value;
  }

  return null;
}

/**
 * Every storage access is wrapped: Safari in Lockdown Mode and private
 * browsing throw on `localStorage` access rather than returning null, and an
 * exception here would take the whole deferred block down with it.
 */
function readCache(hint: string, now: number): Session | null {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;

    const entry = JSON.parse(raw) as Cached;
    if (entry?.k !== hint || typeof entry.e !== 'number' || entry.e <= now) return null;
    return entry.s;
  } catch {
    return null;
  }
}

function writeCache(hint: string, session: Session, ttlSeconds: number, now: number): void {
  try {
    const ttl = Math.min(Math.max(ttlSeconds, 0) * 1000, MAX_TTL_MS);
    if (ttl <= 0) return;
    const entry: Cached = { k: hint, e: now + ttl, s: session };
    localStorage.setItem(STORE_KEY, JSON.stringify(entry));
  } catch {
    // Quota exceeded or storage disabled. The header still works, it just
    // refetches next time.
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    // Nothing to do — see writeCache.
  }
}

/** Narrows an untrusted JSON body to a Session, with its server-declared TTL. */
function parse(data: unknown): { session: Session; ttl: number } {
  const d = data as Partial<Extract<Session, { signedIn: true }>> & { ttl?: unknown };
  const ttl = typeof d?.ttl === 'number' && d.ttl > 0 ? d.ttl : 0;

  if (!d?.signedIn || typeof d.firstName !== 'string') return { session: SIGNED_OUT, ttl };

  return {
    session: {
      signedIn: true,
      firstName: d.firstName,
      initials: typeof d.initials === 'string' ? d.initials : '',
      links: Array.isArray(d.links) ? d.links : [],
    },
    ttl,
  };
}

/**
 * Fails closed to signed-out on timeout, network error, or any unexpected
 * shape. This is cosmetic state only — it decides which button is drawn and
 * must never be treated by a downstream system as proof of authentication.
 */
export function createSessionProvider(endpoint: string, doc: Document = document): SessionProvider {
  return {
    async get(signal: AbortSignal): Promise<Session> {
      const now = Date.now();
      const hint = readHint(doc);

      if (!hint) {
        // Signed out, and cheaply certain of it. Drop any copy left over from
        // a session that has since ended.
        clearCache();
        return SIGNED_OUT;
      }

      const cached = readCache(hint, now);
      if (cached) return cached;

      try {
        // Only CORS-safelisted request headers are sent, so this stays a
        // simple request and skips the preflight round trip. Adding any
        // custom header here would silently double the endpoint's latency.
        const res = await fetch(endpoint, {
          credentials: 'include',
          signal,
          headers: { Accept: 'application/json' },
        });
        if (!res.ok) return SIGNED_OUT;

        const { session, ttl } = parse(await res.json());
        writeCache(hint, session, ttl, now);
        return session;
      } catch {
        return SIGNED_OUT;
      }
    },
  };
}
