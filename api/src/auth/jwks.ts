/**
 * JWT verifier, wired but inert until JWKS_URI is configured.
 *
 * Reads a bearer token, or the session cookie when the IdP writes a JWT into
 * one. Signature and claim validation are delegated to `jose` rather than hand
 * rolled — `alg: none`, key confusion, and unbounded `kid` fetches are all
 * things a library has already got right and this file should not relitigate.
 *
 * `jose` is imported lazily so the mock path never pays to load it, and so a
 * deployment that has not chosen this verifier does not need the dependency
 * resolved at cold start.
 */

import type { AuthRequest, Principal, Verifier } from './types.js';

export const SESSION_COOKIE = 'ucfhb_session';

interface JoseModule {
  createRemoteJWKSet: (url: URL, opts?: unknown) => unknown;
  jwtVerify: (token: string, key: unknown, opts?: unknown) => Promise<{ payload: Claims }>;
}

interface Claims {
  sub?: string;
  oid?: string;
  eppn?: string;
  name?: string;
  given_name?: string;
  affiliations?: unknown;
  [k: string]: unknown;
}

export interface JwksOptions {
  jwksUri: string;
  issuer: string;
  audience: string;
}

export function createJwksVerifier(opts: JwksOptions): Verifier {
  if (!opts.jwksUri || !opts.issuer || !opts.audience) {
    throw new Error('AUTH_VERIFIER=jwks requires JWKS_URI, JWT_ISSUER and JWT_AUDIENCE.');
  }

  // Resolved once and reused. The JWKS itself is cached inside `jose`, which
  // also rate-limits refetches when an unknown `kid` appears — the property
  // that keeps a bogus-kid flood from turning into outbound traffic per request.
  let keys: Promise<{ jose: JoseModule; jwks: unknown }> | null = null;

  function ready() {
    if (!keys) {
      keys = (async () => {
        const jose = (await import('jose')) as unknown as JoseModule;
        return {
          jose,
          jwks: jose.createRemoteJWKSet(new URL(opts.jwksUri), {
            cacheMaxAge: 600_000,
            cooldownDuration: 30_000,
          }),
        };
      })();
    }
    return keys;
  }

  return {
    name: 'jwks',
    async verify(req: AuthRequest): Promise<Principal | null> {
      const authz = req.header('authorization');
      const token = authz?.toLowerCase().startsWith('bearer ')
        ? authz.slice(7).trim()
        : req.cookies.get(SESSION_COOKIE);

      if (!token) return null;

      try {
        const { jose, jwks } = await ready();
        const { payload } = await jose.jwtVerify(token, jwks, {
          issuer: opts.issuer,
          audience: opts.audience,
          clockTolerance: 60,
        });

        const id = payload.oid ?? payload.sub ?? payload.eppn;
        if (typeof id !== 'string' || !id) return null;

        return {
          id,
          displayName:
            typeof payload.given_name === 'string'
              ? payload.given_name
              : typeof payload.name === 'string'
                ? payload.name
                : undefined,
          affiliations: Array.isArray(payload.affiliations)
            ? payload.affiliations.filter((a): a is string => typeof a === 'string')
            : undefined,
        };
      } catch {
        // Expired, wrong audience, bad signature, unreachable JWKS — all of it
        // means the same thing to the header: draw the signed-out state.
        return null;
      }
    },
  };
}
