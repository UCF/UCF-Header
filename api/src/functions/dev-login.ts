/**
 * GET /api/dev/login?as=student-1&return=<url> — mint a mock session.
 * GET /api/dev/logout?return=<url> — clear it.
 *
 * Never in production: both are gated on ENABLE_DEV_LOGIN and refuse to run
 * when NODE_ENV=production.
 *
 * These stand in for the real SSO's post-login and post-logout steps, and
 * demonstrate the one thing that integration has to do beyond managing its own
 * session cookie: set the readable hint cookie, and clear it on logout.
 * Without that the header cannot tell a signed-in browser from an anonymous
 * one without a network request, and the zero-request anonymous path — the
 * single biggest thing in the design — disappears.
 *
 * The redirect back to the embedding page is deliberate rather than answering
 * with JSON: it is the shape a real SSO round trip has, and it proves the
 * cookie survives a cross-origin navigation back to a *.ucf.edu site.
 */

import { app, type HttpRequest, type HttpResponseInit } from '@azure/functions';
import { MOCK_COOKIE } from '../auth/mock.js';
import { config } from '../lib/config.js';
import { isAllowedOrigin } from '../lib/cors.js';
import { hintFor } from '../lib/hint.js';
import { clearHint, json, setHint } from '../lib/http.js';

/**
 * Principal id used when no `as` is given. Deliberately not one of the profile
 * fixtures, so the demo exercises the DEFAULT_NAME fallback — a valid session
 * that no profile source has a record for.
 */
const DEFAULT_PRINCIPAL = 'demo';

function guard(): HttpResponseInit | null {
  if (!config.enableDevLogin || process.env.NODE_ENV === 'production') {
    return json(404, { v: 1, error: 'not_found' });
  }
  return null;
}

/**
 * Validates `?return=` against the same allowlist that gates CORS.
 *
 * A login endpoint that redirects wherever it is told is an open redirect, and
 * an open redirect on the identity domain is worth real money to a phisher —
 * `universityheader.ucf.edu/api/...` is a plausible-looking link that lands the
 * victim anywhere. Reusing isAllowedOrigin keeps the two lists from drifting.
 */
function safeReturn(raw: string | null): string | null {
  if (!raw) return null;

  try {
    const url = new URL(raw);
    return isAllowedOrigin(url.origin) ? url.toString() : null;
  } catch {
    return null;
  }
}

/** 302 back to the embedding page, or JSON when there is nowhere to go. */
function finish(
  returnTo: string | null,
  body: Record<string, unknown>,
  cookies: string[],
): HttpResponseInit {
  const res = json(returnTo ? 302 : 200, body, {}, { maxAge: 0, cookies });
  if (returnTo && res.headers) (res.headers as Record<string, string>).Location = returnTo;
  return res;
}

app.http('devLogin', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dev/login',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const blocked = guard();
    if (blocked) return blocked;

    const id = req.query.get('as') || DEFAULT_PRINCIPAL;
    const encoded = Buffer.from(JSON.stringify({ id }), 'utf8').toString('base64url');

    // The two cookies are deliberately scoped differently, and it matters:
    //
    //   ucfhb_mock  host-only to this API. Nothing outside it ever needs to
    //               see the session, and a *.ucf.edu-wide session cookie would
    //               ride along on every request to every site that embeds the
    //               header.
    //   ucfhb_h     Domain=.ucf.edu, because the header's script — running on
    //               www.ucf.edu, cah.ucf.edu, anywhere — has to read it.
    //
    // Host-only still reaches us: the fetch to universityheader.ucf.edu is
    // same-site, so SameSite=Lax sends it.
    return finish(safeReturn(req.query.get('return')), { v: 1, ok: true, signedInAs: id }, [
      `${MOCK_COOKIE}=${encoded}; Path=/; Max-Age=${config.sessionTtl}; Secure; SameSite=Lax; HttpOnly`,
      setHint(hintFor(id), config.sessionTtl),
    ]);
  },
});

app.http('devLogout', {
  methods: ['GET'],
  authLevel: 'anonymous',
  route: 'dev/logout',
  handler: async (req: HttpRequest): Promise<HttpResponseInit> => {
    const blocked = guard();
    if (blocked) return blocked;

    return finish(safeReturn(req.query.get('return')), { v: 1, ok: true }, [
      `${MOCK_COOKIE}=; Path=/; Max-Age=0; Secure; SameSite=Lax; HttpOnly`,
      clearHint(),
    ]);
  },
});
