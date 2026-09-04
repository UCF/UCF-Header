/**
 * Derives the session-hint value.
 *
 * Requirements, in order of importance:
 *   1. It must change whenever the session or the profile changes, so that a
 *      sign-out or a name change invalidates every embedding site's cache.
 *   2. It must not leak the session identifier. It travels in a readable
 *      cookie on every request to *.ucf.edu.
 *   3. It must be short. Same reason.
 *
 * A truncated keyed hash gets all three. Truncation is fine here because this
 * value is not a credential — forging it buys an attacker nothing but a cache
 * key, and the endpoint re-verifies the real session on every call.
 */

import { createHmac } from 'node:crypto';

/**
 * Rotating this string invalidates every client cache at once. That is the
 * lever to pull if a bad payload ever ships to production.
 */
const SALT = process.env.HINT_SALT ?? 'ucfhb-v1';

export function hintFor(principalId: string, generation = ''): string {
  return createHmac('sha256', SALT)
    .update(`${principalId} ${generation}`)
    .digest('base64url')
    .slice(0, 16);
}
