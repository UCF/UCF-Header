import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearCache,
  createSessionProvider,
  HINT_COOKIE,
  readHint,
} from '../../src/features/session';

const ENDPOINT = 'https://universityheader.test/api/session';

/** jsdom implements no Cookie Store API, and document.cookie is exactly the
 *  surface readHint reads in a real browser — so the write goes through here,
 *  once, rather than being suppressed at every call site. */
function writeCookie(pair: string): void {
  // biome-ignore lint/suspicious/noDocumentCookie: see above.
  document.cookie = pair;
}

function setHint(value: string | null): void {
  writeCookie(`${HINT_COOKIE}=; Max-Age=0; path=/`);
  if (value) writeCookie(`${HINT_COOKIE}=${value}; path=/`);
}

function respond(body: unknown, ok = true) {
  return vi.fn().mockResolvedValue({ ok, json: async () => body });
}

const SIGNED_IN = {
  v: 1,
  signedIn: true,
  firstName: 'Alex',
  initials: 'AR',
  links: [{ label: 'myUCF', href: 'https://my.ucf.edu/' }],
  ttl: 3600,
};

beforeEach(() => {
  setHint(null);
  clearCache();
  vi.unstubAllGlobals();
});

describe('readHint', () => {
  it('finds the cookie among others without matching a name suffix', () => {
    writeCookie('other_ucfhb_h=decoy; path=/');
    writeCookie(`${HINT_COOKIE}=abc123; path=/`);

    expect(readHint()).toBe('abc123');
  });

  it('returns null when absent', () => {
    expect(readHint()).toBeNull();
  });
});

describe('createSessionProvider', () => {
  // The point of the hint cookie: the common case on a public UCF page is an
  // anonymous visitor, and they must not generate a request at all.
  it('makes no network request when there is no hint cookie', async () => {
    const fetchMock = respond(SIGNED_IN);
    vi.stubGlobal('fetch', fetchMock);

    const session = await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    expect(fetchMock).not.toHaveBeenCalled();
    expect(session).toEqual({ signedIn: false });
  });

  it('fetches and caches when a hint is present', async () => {
    setHint('h1');
    const fetchMock = respond(SIGNED_IN);
    vi.stubGlobal('fetch', fetchMock);

    const provider = createSessionProvider(ENDPOINT);
    const first = await provider.get(new AbortController().signal);
    const second = await provider.get(new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(1);
    expect(first).toEqual({
      signedIn: true,
      firstName: 'Alex',
      initials: 'AR',
      links: [{ label: 'myUCF', href: 'https://my.ucf.edu/' }],
    });
    expect(second).toEqual(first);
  });

  it('sends only CORS-safelisted headers, so no preflight is triggered', async () => {
    setHint('h1');
    const fetchMock = respond(SIGNED_IN);
    vi.stubGlobal('fetch', fetchMock);

    await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
    expect(Object.keys(init.headers as Record<string, string>)).toEqual(['Accept']);
    expect(init.credentials).toBe('include');
  });

  // A changed hint is how sign-out and profile edits invalidate every
  // embedding site's copy without any of them being told.
  it('ignores a cached entry stored under a different hint', async () => {
    setHint('h1');
    const fetchMock = respond(SIGNED_IN);
    vi.stubGlobal('fetch', fetchMock);
    await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    setHint('h2');
    await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('drops the cached entry once the hint cookie disappears', async () => {
    setHint('h1');
    vi.stubGlobal('fetch', respond(SIGNED_IN));
    await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    setHint(null);
    const session = await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    expect(session).toEqual({ signedIn: false });
    expect(localStorage.getItem('ucfhb.session')).toBeNull();
  });

  it('caps a server TTL beyond the two-hour ceiling', async () => {
    setHint('h1');
    vi.stubGlobal('fetch', respond({ ...SIGNED_IN, ttl: 86_400 }));
    await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    const entry = JSON.parse(localStorage.getItem('ucfhb.session') as string);
    expect(entry.e - Date.now()).toBeLessThanOrEqual(2 * 60 * 60 * 1000);
  });

  it('does not cache a response that declares no TTL', async () => {
    setHint('h1');
    const fetchMock = respond({ ...SIGNED_IN, ttl: 0 });
    vi.stubGlobal('fetch', fetchMock);

    const provider = createSessionProvider(ENDPOINT);
    await provider.get(new AbortController().signal);
    await provider.get(new AbortController().signal);

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('falls back to signed out on a network error, a non-2xx, or a bad shape', async () => {
    setHint('h1');

    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('offline')));
    expect(await createSessionProvider(ENDPOINT).get(new AbortController().signal)).toEqual({
      signedIn: false,
    });

    vi.stubGlobal('fetch', respond(SIGNED_IN, false));
    expect(await createSessionProvider(ENDPOINT).get(new AbortController().signal)).toEqual({
      signedIn: false,
    });

    vi.stubGlobal('fetch', respond({ signedIn: true, ttl: 60 }));
    expect(await createSessionProvider(ENDPOINT).get(new AbortController().signal)).toEqual({
      signedIn: false,
    });
  });

  it('survives localStorage throwing, as it does in Safari Lockdown Mode', async () => {
    setHint('h1');
    vi.stubGlobal('fetch', respond(SIGNED_IN));
    const spy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('denied');
    });

    const session = await createSessionProvider(ENDPOINT).get(new AbortController().signal);

    expect(session).toMatchObject({ signedIn: true, firstName: 'Alex' });
    spy.mockRestore();
  });
});
