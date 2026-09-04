/**
 * The seam between "who is this" and "what do we show them".
 *
 * Everything downstream of a Verifier deals in Principal, never in cookies,
 * tokens, or headers. Swapping Entra ID for Shibboleth — or for the mock —
 * is meant to be a one-line change in `auth/index.ts` and nothing else.
 */

/** The minimum a verified identity must supply. Deliberately small. */
export interface Principal {
  /** Stable opaque identifier. NID, oid, eppn — whatever the IdP guarantees. */
  id: string;
  /** Optional display name straight from the IdP, when it offers one. */
  displayName?: string;
  /** Optional affiliations (`student`, `staff`, `faculty`), for later routing. */
  affiliations?: string[];
}

export interface Verifier {
  /** Name, for logging and the health endpoint. */
  readonly name: string;
  /**
   * Resolves the caller's identity, or null when the caller is anonymous.
   *
   * Must never throw for an unauthenticated or malformed request: an anonymous
   * caller and a garbage token are the same answer, and the endpoint's job is
   * to say "signed out" quickly rather than to explain why.
   */
  verify(req: AuthRequest): Promise<Principal | null>;
}

/** The slice of the HTTP request a verifier is allowed to see. */
export interface AuthRequest {
  cookies: ReadonlyMap<string, string>;
  header(name: string): string | null;
}

/** Parses a `Cookie` header. Tolerant of the whitespace variations in the wild. */
export function parseCookies(raw: string | null | undefined): Map<string, string> {
  const out = new Map<string, string>();
  if (!raw) return out;

  for (const part of raw.split(';')) {
    const eq = part.indexOf('=');
    if (eq < 1) continue;
    const name = part.slice(0, eq).trim();
    if (!name) continue;
    let value = part.slice(eq + 1).trim();
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    try {
      out.set(name, decodeURIComponent(value));
    } catch {
      // A malformed percent-escape is not worth failing the whole request over.
      out.set(name, value);
    }
  }
  return out;
}
