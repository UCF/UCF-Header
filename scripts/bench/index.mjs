/**
 * v3 vs v4 load-performance benchmark.
 *
 * Runs the production v3 header and this branch's v4 header on byte-identical
 * host pages, served from one local in-memory origin, uncached, N times each,
 * under emulated network conditions — and reports the distribution rather than
 * a single number.
 *
 * The headline metric is `headerPainted`: the first animation frame in which
 * `#ucfhb` has non-zero layout height. That is version-neutral by construction.
 * For v3 it cannot happen until `bar.css` has arrived, because the bar's markup
 * is inserted with `#ucfhb-inner` display:none and only the stylesheet reveals
 * it. For v4 it happens as soon as the shadow root is mounted. Neither version
 * is asked to report on itself.
 *
 * Fairness rules, all deliberate:
 *  - Both versions are served from the same process, over the same connection,
 *    with gzip, so only the header's architecture differs.
 *  - Analytics is disabled on both by default. v3 injects gtag from
 *    googletagmanager.com and v4 defers its own behind requestIdleCallback;
 *    leaving either on would import third-party network variance into a
 *    twenty-run comparison. Use `--analytics` to measure them as shipped.
 *  - Variants are interleaved and rotated so that machine drift during the run
 *    cannot land on one version.
 *  - Every load gets a fresh browser context with the HTTP cache disabled, and
 *    the server sends `no-store`. This is the first-visit case; in production
 *    the header is cached across ucf.edu subdomains, so this is the worst case
 *    for both, and the case the extra round trips actually hit.
 *
 * Usage:
 *   npm run bench
 *   npm run bench -- --runs=20 --profiles=none,4g,3g
 *   npm run bench -- --flags= --analytics --refresh
 */
import { spawn } from 'node:child_process';
import { cp, mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { chromium } from '@playwright/test';
import { BUNDLE, ROOT } from '../config.mjs';
import { DEFAULTS, PROFILES, RESULTS_DIR, WWW_DIR } from './config.mjs';
import { VARIANTS, writePages } from './pages.mjs';
import { startServer } from './server.mjs';
import { vendorLegacy } from './vendor.mjs';

// ---------------------------------------------------------------- arguments

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const opt = (name, fallback) => {
  const hit = argv.find((a) => a.startsWith(`--${name}=`));
  return hit === undefined ? fallback : hit.slice(name.length + 3);
};

const options = {
  runs: Number(opt('runs', DEFAULTS.runs)),
  warmup: Number(opt('warmup', DEFAULTS.warmup)),
  port: Number(opt('port', DEFAULTS.port)),
  // Empty string is meaningful here: the bare embed, with no flags at all.
  flags: opt('flags', DEFAULTS.flags),
  profiles: opt('profiles', DEFAULTS.profiles.join(',')).split(',').filter(Boolean),
  variants: opt('variants', Object.keys(VARIANTS).join(',')).split(',').filter(Boolean),
  analytics: flag('analytics'),
  refresh: flag('refresh'),
};

for (const p of options.profiles) {
  if (!(p in PROFILES)) {
    console.error(`  unknown profile "${p}" — expected one of ${Object.keys(PROFILES).join(', ')}`);
    process.exit(1);
  }
}

// ------------------------------------------------------------------- probe

/**
 * Installed before any page script runs. Everything it records is read off the
 * page's own performance timeline, so the numbers are the browser's, not ours.
 */
function probe() {
  const bench = { lcp: null, headerPainted: null, headerHeight: 0 };
  window.__bench = bench;

  try {
    new PerformanceObserver((list) => {
      const entries = list.getEntries();
      bench.lcp = entries[entries.length - 1].startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  } catch {
    // Firefox and WebKit lack LCP. The run still yields every other metric.
  }

  // rAF callbacks run after layout and before the paint of that same frame, so
  // this timestamp is the moment the bar became paintable — the closest honest
  // answer to "when did the header appear" that does not depend on either
  // version instrumenting itself.
  const frame = () => {
    const el = document.getElementById('ucfhb');
    const height = el ? el.getBoundingClientRect().height : 0;
    if (height > 0) {
      bench.headerPainted = performance.now();
      bench.headerHeight = height;
      return;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

function collect() {
  const nav = performance.getEntriesByType('navigation')[0];
  const paint = performance.getEntriesByType('paint');
  const fcp = paint.find((e) => e.name === 'first-contentful-paint');

  const header = performance
    .getEntriesByType('resource')
    .filter((r) => r.name.includes('/legacy/') || r.name.includes('/v4/'));

  return {
    ttfb: nav.responseStart,
    dcl: nav.domContentLoadedEventEnd,
    load: nav.loadEventEnd,
    fcp: fcp ? fcp.startTime : null,
    lcp: window.__bench.lcp,
    headerPainted: window.__bench.headerPainted,
    headerHeight: window.__bench.headerHeight,
    headerRequests: header.length,
    // transferSize is wire bytes including response headers, which is what the
    // throttled bandwidth is actually spending.
    headerBytes: header.reduce((n, r) => n + r.transferSize, 0),
    headerSettled: header.reduce((t, r) => Math.max(t, r.responseEnd), 0),
  };
}

// -------------------------------------------------------------------- setup

function run(command, args, env) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, { cwd: ROOT, stdio: 'inherit', env });
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? ok() : fail(new Error(`${command} ${args.join(' ')} exited ${code}`)),
    );
  });
}

async function buildV4() {
  // GA is forced empty unless --analytics, so the deferred analytics seam is
  // compiled out and v4 is measured on the same terms as the neutered v3.
  const env = { ...process.env, ...(options.analytics ? {} : { GA: '' }) };
  await run(process.execPath, [resolve(ROOT, 'scripts/build.mjs')], env);

  const out = resolve(WWW_DIR, 'v4/bar/js/university-header.js');
  await mkdir(dirname(out), { recursive: true });
  await cp(BUNDLE, out);
}

// --------------------------------------------------------------- statistics

const percentile = (sorted, p) =>
  sorted[Math.min(sorted.length - 1, Math.max(0, Math.ceil(p * sorted.length) - 1))];

function summarize(values) {
  const clean = values.filter((v) => typeof v === 'number' && Number.isFinite(v));
  if (!clean.length) return null;
  const sorted = [...clean].sort((a, b) => a - b);
  return {
    n: sorted.length,
    min: sorted[0],
    p50: percentile(sorted, 0.5),
    p90: percentile(sorted, 0.9),
    max: sorted[sorted.length - 1],
    mean: clean.reduce((a, b) => a + b, 0) / clean.length,
  };
}

// ------------------------------------------------------------------ measure

async function measure(browser, url, profile) {
  // A fresh context per load is the real cache guarantee — contexts do not
  // share storage — with CDP and `no-store` closing the remaining gaps.
  const context = await browser.newContext({
    viewport: DEFAULTS.viewport,
    deviceScaleFactor: 1,
  });
  try {
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Network.enable');
    await cdp.send('Network.setCacheDisabled', { cacheDisabled: true });
    if (profile) {
      await cdp.send('Network.emulateNetworkConditions', { offline: false, ...profile });
    }

    await page.addInitScript(probe);
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });

    if (!url.endsWith('control.html')) {
      await page.waitForFunction(() => window.__bench.headerPainted !== null, null, {
        timeout: 30_000,
      });
    }
    // Collect at network idle, not at `load`. v3 discovers its spritesheet only
    // after bar.css parses, so on a slow link that request is still in flight
    // when `load` fires — collecting there silently undercounts v3's requests
    // and bytes. The timing metrics are read from the page's own timeline and
    // are unaffected by waiting longer; only the resource totals need this.
    await page.waitForLoadState('networkidle', { timeout: 30_000 }).catch(() => {
      // A stuck request should not void an otherwise good sample; the resource
      // totals for that run are simply reported as of this moment.
    });
    // Let the last paint and LCP entries settle before reading the timeline.
    await page.waitForTimeout(200);

    return await page.evaluate(collect);
  } finally {
    await context.close();
  }
}

// ------------------------------------------------------------------- report

const ms = (v) => (v === null || v === undefined ? '—' : `${v.toFixed(0)} ms`);
const kb = (v) => (v === null || v === undefined ? '—' : `${(v / 1024).toFixed(1)} KB`);

const METRICS = [
  ['headerPainted', 'header painted', ms],
  ['fcp', 'first contentful paint', ms],
  ['lcp', 'largest contentful paint', ms],
  ['dcl', 'DOMContentLoaded', ms],
  ['load', 'load event', ms],
  ['headerSettled', 'header assets done', ms],
  ['headerRequests', 'header requests', (v) => (v === null ? '—' : String(v))],
  ['headerBytes', 'header wire bytes', kb],
];

function table(profileName, byVariant) {
  const names = options.variants;
  const width = 26;
  const col = 17;

  console.log(
    `\n  ── network: ${profileName} ${'─'.repeat(Math.max(0, 46 - profileName.length))}\n`,
  );
  console.log(
    `  ${'metric'.padEnd(width)}${names.map((n) => n.padStart(col)).join('')}${'v4 vs v3'.padStart(col)}`,
  );
  console.log(`  ${'-'.repeat(width + col * (names.length + 1))}`);

  for (const [key, label, format] of METRICS) {
    const cells = names.map((n) => {
      const stat = byVariant[n]?.[key];
      return (stat ? format(stat.p50) : '—').padStart(col);
    });

    const v3 = byVariant.legacy?.[key]?.p50;
    const v4 = byVariant.v4?.[key]?.p50;
    let delta = '—';
    if (typeof v3 === 'number' && typeof v4 === 'number' && v3 !== 0) {
      const pct = ((v4 - v3) / v3) * 100;
      const sign = v4 <= v3 ? '' : '+';
      delta = `${sign}${pct.toFixed(0)}%`;
    }
    console.log(`  ${label.padEnd(width)}${cells.join('')}${delta.padStart(col)}`);
  }

  // The median hides the tail, and the tail is where a blocked paint lives.
  console.log(`\n  ${'header painted (min/p50/p90/max)'.padEnd(width)}`);
  for (const n of names) {
    const s = byVariant[n]?.headerPainted;
    if (!s) continue;
    console.log(
      `  ${`  ${n}`.padEnd(width)}${[s.min, s.p50, s.p90, s.max].map((v) => ms(v).padStart(col / 2 + 3)).join('')}`,
    );
  }
}

// --------------------------------------------------------------------- main

async function main() {
  console.log(`\n  UCF header benchmark — ${options.runs} uncached loads per variant`);
  console.log(`  variants: ${options.variants.join(', ')}`);
  console.log(`  flags:    ${options.flags || '(none)'}`);
  console.log(`  analytics: ${options.analytics ? 'as shipped' : 'disabled on both'}\n`);

  const host = `localhost:${options.port}`;
  console.log('  building v4…');
  await buildV4();
  console.log('  vendoring v3 from production…');
  const { bytes } = await vendorLegacy({
    host,
    analytics: options.analytics,
    refresh: options.refresh,
  });
  const urls = await writePages(options.flags);

  const server = await startServer(WWW_DIR, options.port);
  const browser = await chromium.launch();
  const results = {};

  try {
    for (const profileName of options.profiles) {
      const profile = PROFILES[profileName];
      const samples = Object.fromEntries(options.variants.map((n) => [n, []]));

      for (const name of options.variants) {
        for (let i = 0; i < options.warmup; i++) {
          await measure(browser, `${server.origin}${urls[name]}`, profile);
        }
      }

      for (let i = 0; i < options.runs; i++) {
        // Rotate the order every iteration so a machine that slows down partway
        // through the run cannot penalise one variant systematically.
        const order = options.variants.map(
          (_, k) => options.variants[(k + i) % options.variants.length],
        );
        for (const name of order) {
          samples[name].push(await measure(browser, `${server.origin}${urls[name]}`, profile));
        }
        process.stdout.write(`\r  ${profileName}: ${i + 1}/${options.runs} runs`);
      }
      process.stdout.write('\n');

      results[profileName] = Object.fromEntries(
        Object.entries(samples).map(([name, runs]) => [
          name,
          Object.fromEntries(METRICS.map(([key]) => [key, summarize(runs.map((r) => r[key]))])),
        ]),
      );

      table(profileName, results[profileName]);
    }
  } finally {
    await browser.close();
    await server.close();
  }

  await mkdir(RESULTS_DIR, { recursive: true });
  const file = resolve(RESULTS_DIR, `${new Date().toISOString().replace(/[:.]/g, '-')}.json`);
  await writeFile(
    file,
    `${JSON.stringify({ options, legacyAssetBytes: bytes, results }, null, 2)}\n`,
  );

  console.log(`\n  raw results → ${file.replace(`${ROOT}/`, '')}`);
  console.log('  note: dist/ now holds the benchmark build; run `npm run build` to restore it.\n');
}

main().catch((error) => {
  console.error(`\n  benchmark failed: ${error.message}\n`);
  process.exit(1);
});
