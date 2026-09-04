/**
 * Development verifier. Trusts a cookie's contents outright.
 *
 * This exists so the header, the cache layer, and the CORS allowlist can be
 * exercised end to end without standing up an IdP. It is gated behind
 * AUTH_VERIFIER=mock and refuses to load when NODE_ENV is production.
 */

import type { AuthRequest, Principal, Verifier } from './types.js';

export const MOCK_COOKIE = 'ucfhb_mock';

export function createMockVerifier(): Verifier {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('The mock verifier must never be selected in production. Set AUTH_VERIFIER.');
  }

  return {
    name: 'mock',
    async verify(req: AuthRequest): Promise<Principal | null> {
      const raw = req.cookies.get(MOCK_COOKIE);
      if (!raw) return null;

      try {
        const parsed = JSON.parse(Buffer.from(raw, 'base64url').toString('utf8')) as Principal;
        return typeof parsed?.id === 'string' && parsed.id ? parsed : null;
      } catch {
        return null;
      }
    },
  };
}
