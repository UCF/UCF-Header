/**
 * GET /api/session — who is this, and what should the header draw.
 *
 * The whole endpoint is one origin check, one session verification, and one
 * profile lookup with a hard timeout. There is no database on the hot path and
 * nothing here retries. The header is already rendered by the time this is
 * called; the only thing that matters is that the answer arrives before the
 * user has stopped looking at the page.
 */

import {
  app,
  type HttpRequest,
  type HttpResponseInit,
  type InvocationContext,
} from '@azure/functions';
import { getVerifier } from '../auth/index.js';
import { type AuthRequest, parseCookies } from '../auth/types.js';
import { config } from '../lib/config.js';
import { corsHeaders, isAllowedOrigin, preflight } from '../lib/cors.js';
import { hintFor } from '../lib/hint.js';
import { clearHint, json, setHint } from '../lib/http.js';
import { buildPayload } from '../profile/index.js';
import type { SessionPayload } from '../profile/types.js';

/**
 * Signed-out responses carry a short TTL. A user who signs in should not wait
 * an hour for the header to notice, and the hint cookie means they normally
 * will not — this is the belt to that braces.
 */
const SIGNED_OUT_TTL = 300;

function signedOut(ttl: number): SessionPayload {
  return { v: 1, signedIn: false, ttl };
}

export async function session(req: HttpRequest, ctx: InvocationContext): Promise<HttpResponseInit> {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    if (!origin || !isAllowedOrigin(origin)) return { status: 403 };
    return { status: 204, headers: preflight(origin) };
  }

  // A request with no Origin is same-origin, a health check, or a non-browser
  // client. It is served, but gets no CORS headers, so no cross-origin page
  // can read it. A request with a disallowed Origin is refused outright —
  // without ACAO the browser would block it anyway, but failing here keeps the
  // verifier and the profile source off the path for unknown callers.
  if (origin && !isAllowedOrigin(origin)) {
    ctx.warn(`session: rejected origin ${origin}`);
    return json(403, { v: 1, error: 'origin_not_allowed' });
  }

  const cors = origin ? corsHeaders(origin) : { Vary: 'Origin, Cookie' };

  const authReq: AuthRequest = {
    cookies: parseCookies(req.headers.get('cookie')),
    header: (name) => req.headers.get(name),
  };

  let principal = null;
  try {
    principal = await getVerifier().verify(authReq);
  } catch (err) {
    // A verifier that throws is a misconfiguration, not a signed-out user, and
    // it should be visible in logs — but the header still gets an answer.
    ctx.error('session: verifier threw', err);
  }

  if (!principal) {
    // Clearing the hint matters: it is how a signed-out browser that still
    // carries a stale hint stops asking on every page.
    return json(200, signedOut(SIGNED_OUT_TTL), cors, {
      maxAge: 0,
      cookies: [clearHint()],
    });
  }

  const payload = await buildPayload(principal, config.sessionTtl);
  const hint = hintFor(principal.id, payload.signedIn ? payload.firstName : '');

  return json(200, payload, cors, {
    maxAge: config.httpMaxAge,
    // Refreshing the hint on every call is what keeps it in step with the real
    // session's lifetime, and repairs it if a login flow ever fails to set it.
    cookies: [setHint(hint, config.sessionTtl)],
  });
}

app.http('session', {
  methods: ['GET', 'OPTIONS'],
  authLevel: 'anonymous',
  route: 'session',
  handler: session,
});
