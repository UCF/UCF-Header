/** Response construction: caching policy and the session-hint cookie. */

import type { Cookie, HttpResponseInit } from '@azure/functions';
import { config } from './config.js';

/**
 * The cookie the header reads before it decides whether to make a request.
 *
 * It is intentionally *not* HttpOnly — that is the entire point. It carries no
 * secret and grants nothing; it is an opaque marker meaning "a session exists,
 * and this is its generation". The header uses it two ways:
 *
 *   - absent  -> render signed out and make no network request at all. This is
 *                the common case on a public UCF page and it costs zero.
 *   - present -> use it as the local cache key. When the user signs out or
 *                their profile changes the value changes, so every embedding
 *                site's cached copy is invalidated at once without any of them
 *                having to talk to us.
 *
 * That second property is what makes an hour-plus client cache safe. Without
 * it, a signed-out user keeps seeing their name until the TTL lapses.
 */
export const HINT_COOKIE = 'ucfhb_h';

/**
 * Because the embedders and this API share the `ucf.edu` registrable domain,
 * this cookie is same-site everywhere it matters. SameSite=Lax is therefore
 * sufficient and — unlike SameSite=None — is not subject to third-party cookie
 * blocking in Safari or Chrome. If the header is ever embedded on a domain
 * outside ucf.edu, this cookie will simply not be there and that site degrades
 * to the signed-out render. That is the intended failure mode.
 */
function cookieAttrs(maxAge: number): string {
  const parts = [`Path=/`, `Max-Age=${maxAge}`, 'Secure', 'SameSite=Lax'];
  if (config.cookieDomain) parts.splice(1, 0, `Domain=${config.cookieDomain}`);
  return parts.join('; ');
}

export function setHint(value: string, maxAge: number): string {
  return `${HINT_COOKIE}=${encodeURIComponent(value)}; ${cookieAttrs(maxAge)}`;
}

export function clearHint(): string {
  return `${HINT_COOKIE}=; ${cookieAttrs(0)}`;
}

/**
 * JSON response.
 *
 * `private` keeps this out of any shared cache — it is per-user data and a CDN
 * holding one user's name and handing it to the next is the worst failure this
 * endpoint could have. `max-age` here is deliberately much shorter than the
 * `ttl` in the payload: the browser HTTP cache absorbs bursts (several tabs,
 * a quick back-navigation) while the header's own store, keyed on the hint
 * cookie, does the long-lived caching where we can invalidate it.
 */
export function json(
  status: number,
  body: unknown,
  headers: Record<string, string> = {},
  opts: { maxAge?: number; cookies?: string[] } = {},
): HttpResponseInit {
  const cache =
    opts.maxAge && opts.maxAge > 0
      ? `private, max-age=${opts.maxAge}`
      : 'no-store, no-cache, must-revalidate';

  const out: Record<string, string> = {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': cache,
    // This endpoint is read by script from other origins by design; it should
    // never be interpreted as a document by anything.
    'X-Content-Type-Options': 'nosniff',
    ...headers,
  };

  const res: HttpResponseInit = { status, headers: out, jsonBody: body };

  if (opts.cookies?.length) {
    // Azure Functions v4 models multiple Set-Cookie values through `cookies`
    // rather than the header bag, which cannot hold duplicates.
    res.cookies = opts.cookies.map(parseSetCookie);
  }

  return res;
}

/** Splits a Set-Cookie string into the shape @azure/functions expects. */
function parseSetCookie(raw: string): Cookie {
  const [pair = '', ...attrs] = raw.split(';').map((s) => s.trim());
  const eq = pair.indexOf('=');
  const cookie: Cookie = { name: pair.slice(0, eq), value: pair.slice(eq + 1) };

  for (const attr of attrs) {
    const [k = '', v] = attr.split('=').map((s) => s.trim());
    switch (k.toLowerCase()) {
      case 'path':
        cookie.path = v;
        break;
      case 'domain':
        cookie.domain = v;
        break;
      case 'max-age':
        cookie.maxAge = Number(v);
        break;
      case 'secure':
        cookie.secure = true;
        break;
      case 'httponly':
        cookie.httpOnly = true;
        break;
      case 'samesite':
        cookie.sameSite = v as Cookie['sameSite'];
        break;
    }
  }

  return cookie;
}
