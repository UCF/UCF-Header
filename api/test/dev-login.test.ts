import { beforeEach, describe, expect, it, vi } from 'vitest';

const BASE = {
  ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu',
  AUTH_VERIFIER: 'mock',
  ENABLE_DEV_LOGIN: '1',
  SESSION_TTL: '3600',
};

const ctx = { warn: vi.fn(), error: vi.fn(), log: vi.fn() };

function request(query: Record<string, string> = {}, cookie?: string) {
  const headers = new Map<string, string>();
  if (cookie) headers.set('cookie', cookie);
  return {
    method: 'GET',
    headers: { get: (n: string) => headers.get(n.toLowerCase()) ?? null },
    query: new URLSearchParams(query),
  };
}

/** The v4 model registers handlers on import; capture them as they go past. */
async function routes(env: Record<string, string> = {}) {
  vi.resetModules();
  for (const [k, v] of Object.entries({ ...BASE, ...env })) vi.stubEnv(k, v);

  const { app } = await import('@azure/functions');
  const found = new Map<string, (req: unknown, ctx: unknown) => Promise<Record<string, never>>>();
  const spy = vi.spyOn(app, 'http').mockImplementation(((_n: string, o: { route: string }) => {
    found.set(o.route, (o as unknown as { handler: never }).handler);
  }) as never);

  await import('../src/index.js');
  spy.mockRestore();
  return found;
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('GET /api/dev/login', () => {
  it('sets both cookies and redirects back to an allowed page', async () => {
    const r = await routes();
    const res = await (r.get('dev/login') as never as CallableFunction)(
      request({ return: 'https://cah.ucf.edu/programs' }),
      ctx,
    );

    expect(res.status).toBe(302);
    expect(res.headers.Location).toBe('https://cah.ucf.edu/programs');
    expect(res.cookies.map((c: { name: string }) => c.name)).toEqual(['ucfhb_mock', 'ucfhb_h']);
  });

  // An open redirect on the identity domain is worth real money to a phisher:
  // universityheader.ucf.edu/api/... is a plausible-looking link to anywhere.
  it('refuses to redirect off the allowlist, and signs in anyway', async () => {
    const r = await routes();

    for (const bad of [
      'https://evil-ucf.edu/',
      'https://phish.example/',
      '//evil.example',
      'javascript:alert(1)',
    ]) {
      const res = await (r.get('dev/login') as never as CallableFunction)(
        request({ return: bad }),
        ctx,
      );
      expect(res.status).toBe(200);
      expect(res.headers.Location).toBeUndefined();
    }
  });

  it('answers with JSON when no return is given', async () => {
    const r = await routes();
    const res = await (r.get('dev/login') as never as CallableFunction)(request(), ctx);

    expect(res.status).toBe(200);
    expect(res.jsonBody).toMatchObject({ ok: true, signedInAs: 'demo' });
  });

  it('is a 404 when disabled', async () => {
    const r = await routes({ ENABLE_DEV_LOGIN: '0' });
    const res = await (r.get('dev/login') as never as CallableFunction)(request(), ctx);

    expect(res.status).toBe(404);
    expect(res.cookies).toBeUndefined();
  });
});

describe('the session that dev login mints', () => {
  it('resolves to the default name when no profile source knows the user', async () => {
    const r = await routes();
    const login = await (r.get('dev/login') as never as CallableFunction)(request(), ctx);
    const mock = login.cookies.find((c: { name: string }) => c.name === 'ucfhb_mock');

    const res = await (r.get('session') as never as CallableFunction)(
      {
        ...request(),
        headers: { get: (n: string) => (n === 'cookie' ? `ucfhb_mock=${mock.value}` : null) },
      },
      ctx,
    );

    expect(res.jsonBody).toMatchObject({ signedIn: true, firstName: 'Lulu' });
  });

  it('still prefers a real profile when one exists', async () => {
    const r = await routes();
    const login = await (r.get('dev/login') as never as CallableFunction)(
      request({ as: 'student-1' }),
      ctx,
    );
    const mock = login.cookies.find((c: { name: string }) => c.name === 'ucfhb_mock');

    const res = await (r.get('session') as never as CallableFunction)(
      {
        ...request(),
        headers: { get: (n: string) => (n === 'cookie' ? `ucfhb_mock=${mock.value}` : null) },
      },
      ctx,
    );

    expect(res.jsonBody).toMatchObject({ signedIn: true, firstName: 'Alex' });
  });
});

describe('GET /api/dev/logout', () => {
  it('clears both cookies and redirects back', async () => {
    const r = await routes();
    const res = await (r.get('dev/logout') as never as CallableFunction)(
      request({ return: 'https://med.ucf.edu/' }),
      ctx,
    );

    expect(res.status).toBe(302);
    expect(res.headers.Location).toBe('https://med.ucf.edu/');
    expect(res.cookies.every((c: { maxAge: number }) => c.maxAge === 0)).toBe(true);
  });
});

/**
 * The server half of the round trip asserted in
 * tests/unit/signed-in/actions.test.ts. Those URLs and these are the contract.
 */
describe('returning the user to where they came from', () => {
  const cases = [
    'https://www.ucf.edu/news',
    'https://www.ucf.edu/news/some-story/',
    'https://www.ucf.edu/news?page=3&tag=research',
    'https://cah.ucf.edu/programs#admissions',
  ];

  it.each(cases)('redirects back to %s, not to the header site', async (href) => {
    const r = await routes();
    const res = await (r.get('dev/login') as never as CallableFunction)(
      request({ return: href }),
      ctx,
    );

    expect(res.status).toBe(302);
    expect(res.headers.Location).toBe(href);
  });
});
