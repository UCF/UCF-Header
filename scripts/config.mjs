import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const OUT_DIR = resolve(ROOT, 'dist');
export const BUNDLE = resolve(OUT_DIR, 'bar/js/university-header.js');

/** Minimal .env reader so local dev needs no extra dependency. */
function dotenv() {
  const file = resolve(ROOT, '.env');
  if (!existsSync(file)) return {};
  const out = {};
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, '');
  }
  return out;
}

export function buildEnv() {
  const env = { ...dotenv(), ...process.env };
  const pkg = JSON.parse(readFileSync(resolve(ROOT, 'package.json'), 'utf8'));

  return {
    version: pkg.version,
    // Origin the header is served from. Reserved for the Phase 2 session endpoint.
    rootUrl: env.ROOT_URL || 'universityheader.ucf.edu',
    // GTM container ID. Empty is valid — analytics simply does not load.
    gtm: env.GTM || '',
    // Where the search form submits. Note this is search.ucf.edu, the Google
    // Custom Search page — NOT search.cm.ucf.edu, the data API hub.
    searchUrl: env.SEARCH_URL || 'https://search.ucf.edu/',
    // Phase 2 signed-in view. False here tree-shakes the whole seam out.
    session: env.UCFHB_SESSION === '1',
  };
}

export function defines(env) {
  return {
    __UCFHB_VERSION__: JSON.stringify(env.version),
    __UCFHB_ROOT_URL__: JSON.stringify(env.rootUrl),
    __UCFHB_GTM__: JSON.stringify(env.gtm),
    __UCFHB_SEARCH_URL__: JSON.stringify(env.searchUrl),
    __UCFHB_SESSION__: String(env.session),
  };
}
