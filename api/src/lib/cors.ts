/**
 * Origin allowlisting.
 *
 * This is the only thing standing between "hundreds of UCF sites can read a
 * user's name" and "any site on the internet can". Two rules matter:
 *
 *  1. Never reflect an arbitrary Origin. `Access-Control-Allow-Origin: *` is
 *     illegal alongside credentials, and reflecting whatever arrives is the
 *     same hole with extra steps.
 *  2. Suffix matching must be anchored to a dot. `endsWith('ucf.edu')` also
 *     matches `notucf.edu` and `evil-ucf.edu`, both of which are registrable
 *     by anyone. Suffixes are therefore required to begin with `.`, and the
 *     bare apex is matched separately.
 */

import { config } from './config.js';

const LOCAL_HOSTS = new Set(['localhost', '127.0.0.1', '[::1]']);

/**
 * True when `origin` may read a credentialed response from this API.
 *
 * `origin` is the raw `Origin` request header. It is attacker-controlled in the
 * sense that any client can send anything, but browsers set it honestly — which
 * is all CORS ever protects. Non-browser callers are not in scope here.
 */
export function isAllowedOrigin(origin: string | null | undefined): boolean {
  if (!origin) return false;

  let url: URL;
  try {
    url = new URL(origin);
  } catch {
    return false;
  }

  // An opaque origin serializes to the string "null" and parses as no URL at
  // all; sandboxed iframes and `file://` pages send it. Never trust it.
  const host = url.hostname.toLowerCase();
  if (!host) return false;

  if (url.protocol === 'http:' && config.allowLocalhost && LOCAL_HOSTS.has(host)) return true;

  // Everything else must be https. A plaintext embedder cannot keep the
  // response confidential anyway, and the session cookie is Secure.
  if (url.protocol !== 'https:') return false;

  if (config.originsExact.has(origin.toLowerCase())) return true;

  return config.originSuffixes.some((suffix) => {
    // `.ucf.edu` should also admit the apex `ucf.edu`, but must not admit
    // `evil-ucf.edu`. Comparing against the suffix with its leading dot
    // stripped gets the apex; the dotted form gets true subdomains.
    const apex = suffix.startsWith('.') ? suffix.slice(1) : suffix;
    return host === apex || host.endsWith(suffix.startsWith('.') ? suffix : `.${suffix}`);
  });
}

/**
 * CORS headers for an allowed origin.
 *
 * `Vary: Origin` is not optional: without it a cache that saw a response for
 * one embedder can hand its `Access-Control-Allow-Origin` to another, and the
 * second embedder's browser rejects a response it should have accepted.
 */
export function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Credentials': 'true',
    Vary: 'Origin, Cookie',
  };
}

/**
 * Preflight response.
 *
 * Note that the header's actual request does not trigger one: it is a GET
 * carrying only `Accept: application/json`, which is CORS-safelisted. That
 * saves a full round trip per signed-in page view and is worth preserving —
 * adding any custom request header to the client would silently double the
 * latency of this endpoint.
 */
export function preflight(origin: string): Record<string, string> {
  return {
    ...corsHeaders(origin),
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Accept, Authorization',
    'Access-Control-Max-Age': '86400',
  };
}
