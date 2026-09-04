/**
 * GET /api/health — readiness and configuration echo.
 *
 * Reports which verifier and profile source are live so a bad deployment is
 * obvious without reading logs. It reports names only, never secrets or the
 * allowlist contents.
 */

import { app, type HttpResponseInit } from '@azure/functions';
import { getVerifier } from '../auth/index.js';
import { config } from '../lib/config.js';
import { json } from '../lib/http.js';
import { getProfileSource } from '../profile/index.js';

app.http('health', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'health',
  handler: async (): Promise<HttpResponseInit> => {
    let verifier: string;
    try {
      verifier = getVerifier().name;
    } catch (err) {
      // A misconfigured verifier makes /api/session useless, so health must
      // fail rather than report OK.
      return json(503, { v: 1, ok: false, error: (err as Error).message });
    }

    return json(200, {
      v: 1,
      ok: true,
      verifier,
      profileSource: getProfileSource().name,
      sessionTtl: config.sessionTtl,
      httpMaxAge: config.httpMaxAge,
      devLogin: config.enableDevLogin,
    });
  },
});
