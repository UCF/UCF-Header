/** Builds the wire payload from a verified principal. */

import type { Principal } from '../auth/types.js';
import { createMockProfileSource } from './mock-source.js';
import { MAX_LINKS, type ProfileSource, type QuickLink, type SessionPayload } from './types.js';

/**
 * The profile lookup is allowed to fail. If Pathify is slow or down, a
 * signed-in user should still get a signed-in header with their IdP name
 * rather than a spinner or a signed-out bar — so this budget is short and
 * blowing it is not an error.
 */
export const PROFILE_TIMEOUT_MS = 400;

/**
 * Shown when a session is valid but no profile source has a name for it.
 * A verified user should never see a signed-out bar just because Pathify
 * has nothing on them, so there is always a name to fall back to.
 */
export const DEFAULT_NAME = 'Lulu';

let source: ProfileSource | null = null;

export function getProfileSource(): ProfileSource {
  if (!source) source = createMockProfileSource();
  return source;
}

/** Test seam. Also how a Pathify source gets installed later. */
export function setProfileSource(next: ProfileSource | null): void {
  source = next;
}

/** First letter of given and family name, uppercased. Falls back to one letter. */
function initialsOf(first: string, last?: string): string {
  const a = first.trim().charAt(0);
  const b = (last ?? '').trim().charAt(0);
  return `${a}${b}`.toUpperCase();
}

/** Drops anything that is not an absolute https URL. Links land in the DOM. */
function safeLinks(links: QuickLink[] | undefined): QuickLink[] {
  if (!Array.isArray(links)) return [];

  return links
    .filter((l): l is QuickLink => typeof l?.label === 'string' && typeof l?.href === 'string')
    .filter((l) => {
      try {
        return new URL(l.href).protocol === 'https:';
      } catch {
        return false;
      }
    })
    .slice(0, MAX_LINKS);
}

export async function buildPayload(principal: Principal, ttl: number): Promise<SessionPayload> {
  let data = null;
  try {
    data = await getProfileSource().get(principal.id, AbortSignal.timeout(PROFILE_TIMEOUT_MS));
  } catch {
    // Deliberately swallowed — see PROFILE_TIMEOUT_MS.
  }

  const firstName = data?.firstName || principal.displayName || DEFAULT_NAME;

  return {
    v: 1,
    signedIn: true,
    firstName,
    initials: initialsOf(firstName, data?.lastName),
    links: safeLinks(data?.links),
    ttl,
  };
}
