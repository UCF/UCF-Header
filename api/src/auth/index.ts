/** Verifier selection. The one place that knows which identity system is live. */

import { config } from '../lib/config.js';
import { createJwksVerifier } from './jwks.js';
import { createMockVerifier } from './mock.js';
import type { Verifier } from './types.js';

let instance: Verifier | null = null;

export function getVerifier(): Verifier {
  if (instance) return instance;

  switch (config.verifier) {
    case 'jwks':
      instance = createJwksVerifier({
        jwksUri: config.jwksUri,
        issuer: config.jwtIssuer,
        audience: config.jwtAudience,
      });
      break;
    case 'mock':
      instance = createMockVerifier();
      break;
    default:
      throw new Error(`Unknown AUTH_VERIFIER "${config.verifier}". Expected "mock" or "jwks".`);
  }

  return instance;
}
