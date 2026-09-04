/**
 * Environment is read once, at module load, and frozen.
 *
 * Every value here is on the per-request hot path. Parsing comma-separated
 * lists and coercing integers on each invocation is small, but this endpoint
 * exists to be fast and there is no reason to pay for it repeatedly.
 */

function list(name: string): string[] {
  return (process.env[name] ?? '')
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function int(name: string, fallback: number): number {
  const n = Number.parseInt(process.env[name] ?? '', 10);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

function bool(name: string): boolean {
  return process.env[name] === '1' || process.env[name]?.toLowerCase() === 'true';
}

export interface ApiConfig {
  /** Registrable-domain suffixes an Origin may end with, e.g. `.ucf.edu`. */
  originSuffixes: string[];
  /** Fully-qualified origins allowed verbatim, e.g. `https://ucffoundation.org`. */
  originsExact: ReadonlySet<string>;
  /** Permit `http://localhost:*` and `http://127.0.0.1:*`. Never enable in production. */
  allowLocalhost: boolean;
  /** Which verifier backs `/api/session`. */
  verifier: string;
  jwksUri: string;
  jwtIssuer: string;
  jwtAudience: string;
  /** How long the header may reuse a session payload from its own store. */
  sessionTtl: number;
  /** How long the browser's HTTP cache may reuse the response. */
  httpMaxAge: number;
  enableDevLogin: boolean;
  /** Domain attribute for cookies the dev-login endpoint sets. Empty = host-only. */
  cookieDomain: string;
}

export const config: Readonly<ApiConfig> = Object.freeze({
  // `.ucf.edu` covers every embedder by default. Because the embedders and this
  // API share the registrable domain, the session cookie is same-site — it is
  // not a third-party cookie, so ITP and third-party cookie phase-out do not
  // touch it. That property is the reason the suffix list exists at all.
  originSuffixes: list('ALLOWED_ORIGIN_SUFFIXES').length
    ? list('ALLOWED_ORIGIN_SUFFIXES')
    : ['.ucf.edu'],
  originsExact: new Set(list('ALLOWED_ORIGINS')),
  allowLocalhost: bool('ALLOW_LOCALHOST'),
  verifier: (process.env.AUTH_VERIFIER ?? 'mock').toLowerCase(),
  jwksUri: process.env.JWKS_URI ?? '',
  jwtIssuer: process.env.JWT_ISSUER ?? '',
  jwtAudience: process.env.JWT_AUDIENCE ?? '',
  sessionTtl: int('SESSION_TTL', 3600),
  httpMaxAge: int('HTTP_MAX_AGE', 300),
  enableDevLogin: bool('ENABLE_DEV_LOGIN'),
  cookieDomain: process.env.COOKIE_DOMAIN ?? '',
});
