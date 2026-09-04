import { beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * `config` freezes process.env at module load, so each scenario needs a fresh
 * module registry rather than a mutated object.
 */
async function load(env: Record<string, string>) {
  vi.resetModules();
  for (const [k, v] of Object.entries(env)) vi.stubEnv(k, v);
  return import('../src/lib/cors.js');
}

beforeEach(() => {
  vi.unstubAllEnvs();
});

describe('isAllowedOrigin', () => {
  it('admits ucf.edu subdomains and the apex', async () => {
    const { isAllowedOrigin } = await load({ ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu' });

    expect(isAllowedOrigin('https://www.ucf.edu')).toBe(true);
    expect(isAllowedOrigin('https://ucf.edu')).toBe(true);
    expect(isAllowedOrigin('https://cah.sciences.ucf.edu')).toBe(true);
  });

  // The reason the suffix is stored with a leading dot. `endsWith('ucf.edu')`
  // would admit every one of these, and all of them are registrable by anyone.
  it('rejects lookalike domains that merely end in the suffix text', async () => {
    const { isAllowedOrigin } = await load({ ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu' });

    expect(isAllowedOrigin('https://evil-ucf.edu')).toBe(false);
    expect(isAllowedOrigin('https://notucf.edu')).toBe(false);
    expect(isAllowedOrigin('https://ucf.edu.attacker.com')).toBe(false);
  });

  it('rejects plaintext, opaque and malformed origins', async () => {
    const { isAllowedOrigin } = await load({ ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu' });

    expect(isAllowedOrigin('http://www.ucf.edu')).toBe(false);
    expect(isAllowedOrigin('null')).toBe(false);
    expect(isAllowedOrigin('')).toBe(false);
    expect(isAllowedOrigin(null)).toBe(false);
    expect(isAllowedOrigin('https://')).toBe(false);
  });

  it('honours the exact-match list for domains outside ucf.edu', async () => {
    const { isAllowedOrigin } = await load({
      ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu',
      ALLOWED_ORIGINS: 'https://ucffoundation.org',
    });

    expect(isAllowedOrigin('https://ucffoundation.org')).toBe(true);
    expect(isAllowedOrigin('https://sub.ucffoundation.org')).toBe(false);
  });

  it('admits localhost only when explicitly enabled', async () => {
    const off = await load({ ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu' });
    expect(off.isAllowedOrigin('http://localhost:4321')).toBe(false);

    const on = await load({ ALLOWED_ORIGIN_SUFFIXES: '.ucf.edu', ALLOW_LOCALHOST: '1' });
    expect(on.isAllowedOrigin('http://localhost:4321')).toBe(true);
    expect(on.isAllowedOrigin('http://127.0.0.1:8080')).toBe(true);
  });
});

describe('corsHeaders', () => {
  it('echoes the origin and varies on it', async () => {
    const { corsHeaders } = await load({});
    const h = corsHeaders('https://cah.ucf.edu');

    expect(h['Access-Control-Allow-Origin']).toBe('https://cah.ucf.edu');
    expect(h['Access-Control-Allow-Credentials']).toBe('true');
    // Without this a cache can hand one embedder's ACAO to another.
    expect(h.Vary).toContain('Origin');
  });

  it('never emits a wildcard, which is illegal with credentials', async () => {
    const { corsHeaders } = await load({});
    expect(corsHeaders('https://cah.ucf.edu')['Access-Control-Allow-Origin']).not.toBe('*');
  });
});
