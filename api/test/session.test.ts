import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = {
  ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu',
  AUTH_VERIFIER: 'mock',
  SESSION_TTL: '3600',
  HTTP_MAX_AGE: '300',
};

function mockCookie(id: string): string {
  return `ucfhb_mock=${Buffer.from(JSON.stringify({ id }), 'utf8').toString('base64url')}`;
}

/** Minimal stand-ins for the pieces of the Functions runtime the handler touches. */
function request(opts: { method?: string; origin?: string; cookie?: string } = {}) {
  const headers = new Map<string, string>();
  if (opts.origin) headers.set('origin', opts.origin);
  if (opts.cookie) headers.set('cookie', opts.cookie);

  return {
    method: opts.method ?? 'GET',
    headers: { get: (n: string) => headers.get(n.toLowerCase()) ?? null },
    query: new URLSearchParams(),
  };
}

const ctx = { warn: vi.fn(), error: vi.fn(), log: vi.fn() };

async function load(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [k, v] of Object.entries({ ...BASE, ...env })) vi.stubEnv(k, v);
  // Importing the function module runs app.http(); the SDK tolerates that
  // outside a host, but the handler is exported directly so we can call it.
  const mod = await import('../src/functions/session.js');
  return mod.session;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  ctx.warn.mockClear();
  ctx.error.mockClear();
});

describe('GET /api/session', () => {
  it('returns signed-out with CORS headers for an allowed origin', async () => {
    const session = await load();
    const res = await session(request({ origin: 'https://cah.ucf.edu' }) as never, ctx as never);

    expect(res.status ?? 200).toBe(200);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBe('https://cah.ucf.edu');
    expect(res.jsonBody).toMatchObject({ v: 1, signedIn: false });
  });

  it('refuses an origin outside the allowlist and emits no CORS headers', async () => {
    const session = await load();
    const res = await session(request({ origin: 'https://evil.example' }) as never, ctx as never);

    expect(res.status).toBe(403);
    expect(res.headers?.['Access-Control-Allow-Origin']).toBeUndefined();
    expect(ctx.warn).toHaveBeenCalled();
  });

  it('returns a profile and sets the hint cookie when signed in', async () => {
    const session = await load();
    const res = await session(
      request({ origin: 'https://cah.ucf.edu', cookie: mockCookie('student-1') }) as never,
      ctx as never,
    );

    expect(res.jsonBody).toMatchObject({
      v: 1,
      signedIn: true,
      firstName: 'Alex',
      initials: 'AR',
      ttl: 3600,
    });

    const hint = res.cookies?.find((c) => c.name === 'ucfhb_h');
    expect(hint?.value).toBeTruthy();
    expect(hint?.sameSite).toBe('Lax');
    expect(hint?.secure).toBe(true);
    // The header has to read this from script; HttpOnly would defeat it.
    expect(hint?.httpOnly).toBeFalsy();
  });

  it('clears a stale hint cookie when the session is gone', async () => {
    const session = await load();
    const res = await session(request({ origin: 'https://cah.ucf.edu' }) as never, ctx as never);

    const hint = res.cookies?.find((c) => c.name === 'ucfhb_h');
    expect(hint?.maxAge).toBe(0);
  });

  it('marks signed-in responses private so no shared cache retains them', async () => {
    const session = await load();
    const res = await session(
      request({ origin: 'https://cah.ucf.edu', cookie: mockCookie('staff-1') }) as never,
      ctx as never,
    );

    expect(res.headers?.['Cache-Control']).toBe('private, max-age=300');
    expect(res.headers?.Vary).toContain('Cookie');
  });

  it('answers a preflight only for allowed origins', async () => {
    const session = await load();

    const ok = await session(
      request({ method: 'OPTIONS', origin: 'https://med.ucf.edu' }) as never,
      ctx as never,
    );
    expect(ok.status).toBe(204);
    expect(ok.headers?.['Access-Control-Max-Age']).toBe('86400');

    const no = await session(
      request({ method: 'OPTIONS', origin: 'https://evil.example' }) as never,
      ctx as never,
    );
    expect(no.status).toBe(403);
  });

  it('changes the hint when the identity changes, so caches invalidate', async () => {
    const session = await load();
    const hint = async (id: string) => {
      const res = await session(
        request({ origin: 'https://cah.ucf.edu', cookie: mockCookie(id) }) as never,
        ctx as never,
      );
      return res.cookies?.find((c) => c.name === 'ucfhb_h')?.value;
    };

    expect(await hint('student-1')).not.toBe(await hint('staff-1'));
  });

  it('drops profile links that are not absolute https URLs', async () => {
    vi.resetModules();
    for (const [k, v] of Object.entries(BASE)) vi.stubEnv(k, v);

    const { setProfileSource } = await import('../src/profile/index.js');
    setProfileSource({
      name: 'test',
      async get() {
        return {
          firstName: 'Sam',
          links: [
            { label: 'ok', href: 'https://my.ucf.edu/' },
            { label: 'xss', href: 'javascript:alert(1)' },
            { label: 'rel', href: '/dashboard' },
          ],
        };
      },
    });

    const { session } = await import('../src/functions/session.js');
    const res = await session(
      request({ origin: 'https://cah.ucf.edu', cookie: mockCookie('x') }) as never,
      ctx as never,
    );

    expect((res.jsonBody as { links: unknown[] }).links).toEqual([
      { label: 'ok', href: 'https://my.ucf.edu/' },
    ]);
    setProfileSource(null);
  });
});
