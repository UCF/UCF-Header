/**
 * Vendors the production v3 header so both versions can be served from one
 * local origin under identical conditions.
 *
 * Benchmarking v4 locally against v3 on the live CDN would measure Azure and
 * the network, not the two headers. Pulling v3 down and serving it from the
 * same process as v4 leaves exactly one difference between the two runs: how
 * the header is built.
 *
 * v3's JS hardcodes `//universityheader.ucf.edu/bar/css/…`, so the origin
 * string is rewritten to point at the local server. It is plain concatenation
 * in the bundle, so a replacement carrying a path segment (`host/legacy`)
 * resolves correctly and keeps the two trees symmetric: `/legacy/bar/…` and
 * `/v4/bar/…`.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { CACHE_DIR, LEGACY_ORIGIN, WWW_DIR } from './config.mjs';

/**
 * The v3 critical path in full. The stylesheets are discovered only after the
 * JS executes, and the spritesheets only after the CSS parses — a three-step
 * dependency chain that the request count alone does not convey.
 */
const ASSETS = [
  'bar/js/university-header.js',
  'bar/css/bar.css',
  'bar/css/bar-bootstrap.css',
  'bar/css/1200-breakpoint.css',
  'bar/css/full-width.css',
  'bar/img/spritesheet-v2.png',
  'bar/img/spritesheet-r-v2.png',
];

async function cached(path, { refresh }) {
  const file = resolve(CACHE_DIR, path);
  if (!refresh) {
    const hit = await readFile(file).catch(() => null);
    if (hit) return hit;
  }
  const url = `https://${LEGACY_ORIGIN}/${path}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} responded ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, buf);
  return buf;
}

/**
 * Rewrites the vendored bundle. Both edits assert that they matched, because a
 * silent no-op here would produce a benchmark that quietly measures the live
 * CDN (or live analytics) instead of the local server.
 *
 * v3's gtag account is always blanked. Analytics is not what this benchmark
 * compares, and v3's measurement ID is a live property that a hundred-odd
 * benchmark loads have no business writing into.
 */
function rewrite(source, { host }) {
  let js = source;

  const origin = js.split(LEGACY_ORIGIN).length - 1;
  if (origin === 0) throw new Error(`v3 bundle no longer references ${LEGACY_ORIGIN}`);
  js = js.replaceAll(LEGACY_ORIGIN, `${host}/legacy`);

  const ga = /UCFHB_GA_ACCOUNT\s*=\s*"[^"]*"/;
  if (!ga.test(js)) throw new Error('v3 bundle no longer assigns UCFHB_GA_ACCOUNT');
  // A falsy account short-circuits v3's own guard, so gtag is never injected.
  js = js.replace(ga, 'UCFHB_GA_ACCOUNT=""');

  return js;
}

/**
 * @returns {Promise<{bytes: Record<string, number>}>} raw size of each vendored asset
 */
export async function vendorLegacy({ host, refresh = false }) {
  const bytes = {};

  for (const path of ASSETS) {
    const buf = await cached(path, { refresh });
    bytes[path] = buf.length;

    const out = resolve(WWW_DIR, 'legacy', path);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(
      out,
      path.endsWith('university-header.js') ? rewrite(buf.toString('utf8'), { host }) : buf,
    );
  }

  return { bytes };
}
