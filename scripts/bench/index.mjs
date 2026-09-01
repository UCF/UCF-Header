/**
 * v3 vs v4 load-performance benchmark.
 *
 * Runs the production v3 header and this branch's v4 header on byte-identical
 * host pages, served from one local in-memory origin, uncached, N times each,
 * under emulated network conditions — and reports the distribution rather than
 * a single number.
 *
 * This is a tool for answering a question, not a gate. It is deliberately not
 * wired into CI: it takes minutes, and it reports numbers to read rather than a
 * threshold to trip. The payload budget in `npm run size` is the CI gate.
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
 *  - v3's gtag injection is always stripped. It is not part of what is being
 *    compared, and a third-party request would add network variance to a
 *    twenty-run measurement.
 *  - Variants are interleaved and rotated so that machine drift during the run
 *    cannot land on one version.
 *  - Every load gets a fresh browser context with the HTTP cache disabled, and
 *    the server sends `no-store`. This is the first-visit case; in production
 *    the header is cached across ucf.edu subdomains, so this is the worst case
 *    for both, and the case the extra round trips actually hit.
 *
 * `--gtm` builds v4 with a real container, so a run can confirm what GTM costs
 * the initial page load. Measured, it costs nothing: `initAnalytics` runs inside
 * requestIdleCallback, and the container is not fetched until after the load
 * event has already fired. The flag exists to verify that rather than assume it.
 * What the container does afterwards is out of scope — the run stops measuring
 * once the header's own assets are quiet.
 *
 * Usage:
 *   npm run bench
 *   npm run bench -- --runs=20 --profiles=none,4g,3g
 *   npm run bench -- --gtm=GTM-XXXXXXX
 *   npm run bench -- --flags= --refresh
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
  // Container ID for the v4 build. Absent means the analytics seam compiles out
  // entirely, which is the right default for comparing the two headers.
  gtm: opt('gtm', null),
  refresh: flag('refresh'),
};

/*
 * Every option is validated up front. A bad `--variants` name would otherwise
 * surface as a navigation to `undefined`, and a non-numeric `--runs` as a loop
 * that never executes and a table of empty cells — both a long way from the
 * typo that caused them.
 */
function fail(message) {
  console.error(`  ${message}`);
  process.exit(1);
}

for (const p of options.profiles) {
  if (!(p in PROFILES)) {
    fail(`unknown profile "${p}" — expected one of ${Object.keys(PROFILES).join(', ')}`);
  }
}

for (const v of options.variants) {
  if (!(v in VARIANTS)) {
    fail(`unknown variant "${v}" — expected one of ${Object.keys(VARIANTS).join(', ')}`);
  }
}

if (!options.variants.length) fail('no variants selected');
if (!options.profiles.length) fail('no profiles selected');

// `runs` must be positive; `warmup` may legitimately be zero.
for (const [name, value, min] of [
  ['runs', options.runs, 1],
  ['warmup', options.warmup, 0],
  ['port', options.port, 1],
]) {
  if (!Number.isInteger(value) || value < min) {
    fail(`--${name} must be an integer >= ${min}, got "${opt(name, '')}"`);
  }
}

if (options.port > 65535) fail(`--port must be <= 65535, got ${options.port}`);

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

  // Both header trees are served under a `/bar/` path segment, which is also
  // what the byte counter and the settle wait key on.
  const header = performance.getEntriesByType('resource').filter((r) => r.name.includes('/bar/'));

  return {
    ttfb: nav.responseStart,
    dcl: nav.domContentLoadedEventEnd,
    load: nav.loadEventEnd,
    fcp: fcp ? fcp.startTime : null,
    lcp: window.__bench.lcp,
    headerPainted: window.__bench.headerPainted,
    headerHeight: window.__bench.headerHeight,
    headerRequests: header.length,
    headerSettled: header.reduce((t, r) => Math.max(t, r.responseEnd), 0),
  };
}

// -------------------------------------------------------------------- setup

function run(command, args, { env, cwd = ROOT } = {}) {
  return new Promise((ok, fail) => {
    const child = spawn(command, args, { cwd, stdio: 'inherit', env });
    child.on('error', fail);
    child.on('exit', (code) =>
      code === 0 ? ok() : fail(new Error(`${command} ${args.join(' ')} exited ${code}`)),
    );
  });
}

async function buildV4() {
  // A blank GTM compiles the analytics seam out, so the default run measures
  // the header and nothing else.
  const env = { ...process.env, GTM: options.gtm ?? '' };
  await run(process.execPath, [resolve(ROOT, 'scripts/build.mjs')], { env });

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

/**
 * First line of whatever was thrown.
 *
 * Not everything that reaches a catch block is an Error — a bare string or a
 * rejected object both land here — and reading `.message` off one of those and
 * calling `.split` on the result throws a second time, burying the original
 * failure behind a TypeError.
 */
const firstLine = (error) => String(error?.message ?? error).split('\n')[0];

/**
 * One sample, with retries. A single stalled load should cost one retry, not
 * every sample collected so far.
 */
async function attempt(browser, url, profile, tries = 3) {
  for (let i = 1; i <= tries; i++) {
    try {
      return await measure(browser, url, profile);
    } catch (error) {
      if (i === tries) {
        console.log(`\n  dropped a load of ${url}: ${firstLine(error)}`);
        return null;
      }
    }
  }
  return null;
}

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

    /*
     * Header requests are tracked over CDP for two things at once: their wire
     * bytes (`encodedDataLength` is the transport's own count, with none of
     * Resource Timing's estimated header overhead) and when they go quiet.
     */
    const inFlight = new Set();
    let bytes = 0;
    let lastActivity = Date.now();

    cdp.on('Network.requestWillBeSent', (e) => {
      if (!e.request.url.includes('/bar/')) return;
      inFlight.add(e.requestId);
      lastActivity = Date.now();
    });
    const finish = (e, encoded = 0) => {
      if (!inFlight.has(e.requestId)) return;
      inFlight.delete(e.requestId);
      bytes += encoded;
      lastActivity = Date.now();
    };
    cdp.on('Network.loadingFinished', (e) => finish(e, e.encodedDataLength));
    cdp.on('Network.loadingFailed', (e) => finish(e));

    await page.addInitScript(probe);
    await page.goto(url, { waitUntil: 'load', timeout: 60_000 });

    if (!url.endsWith('control.html')) {
      await page.waitForFunction(() => window.__bench.headerPainted !== null, null, {
        timeout: 30_000,
      });
    }

    /*
     * Wait for the header's own assets to settle — not for network idle, which
     * would also wait out the deferred tag chain that this benchmark does not
     * measure.
     *
     * "Nothing in flight" alone is not enough: v3 discovers its assets in three
     * stages (JS, then the stylesheets it injects, then the spritesheet the CSS
     * references), so there are real gaps mid-chain. The quiet window is what
     * distinguishes a gap from the end.
     */
    const deadline = Date.now() + 20_000;
    while (Date.now() < deadline) {
      if (inFlight.size === 0 && Date.now() - lastActivity > 400) break;
      await page.waitForTimeout(50);
    }

    // Let the last paint and LCP entries settle before reading the timeline.
    await page.waitForTimeout(200);

    return { ...(await page.evaluate(collect)), headerBytes: bytes };
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
  console.log(`  GTM:      ${options.gtm ?? 'not loaded'}\n`);

  const host = `localhost:${options.port}`;
  console.log('  building v4…');
  await buildV4();

  console.log('  vendoring v3 from production…');
  const { bytes } = await vendorLegacy({ host, refresh: options.refresh });
  const urls = await writePages(options.flags);

  const server = await startServer(WWW_DIR, options.port);
  const browser = await chromium.launch();
  const results = {};

  try {
    for (const profileName of options.profiles) {
      const profile = PROFILES[profileName];
      const samples = Object.fromEntries(options.variants.map((n) => [n, []]));

      // Warmups go through the same retry path as real samples — a warmup is
      // the least valuable load in the run to abort the whole thing on.
      for (const name of options.variants) {
        for (let i = 0; i < options.warmup; i++) {
          await attempt(browser, `${server.origin}${urls[name]}`, profile);
        }
      }

      const dropped = Object.fromEntries(options.variants.map((n) => [n, 0]));

      for (let i = 0; i < options.runs; i++) {
        // Rotate the order every iteration so a machine that slows down partway
        // through the run cannot penalise one variant systematically.
        const order = options.variants.map(
          (_, k) => options.variants[(k + i) % options.variants.length],
        );
        for (const name of order) {
          const sample = await attempt(browser, `${server.origin}${urls[name]}`, profile);
          if (sample) samples[name].push(sample);
          else dropped[name]++;
        }
        process.stdout.write(`\r  ${profileName}: ${i + 1}/${options.runs} runs`);
      }
      process.stdout.write('\n');

      // Reported rather than swallowed: a variant that lost samples has a
      // thinner distribution than the others, and the reader needs to know
      // before comparing percentiles across columns.
      for (const [name, n] of Object.entries(dropped)) {
        if (n) console.log(`  ${name}: ${n} load(s) dropped after repeated failures`);
      }

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
  console.error(`\n  benchmark failed: ${firstLine(error)}\n`);
  // The stack is what actually locates a harness bug, and it is lost by the
  // time the message alone reaches the terminal.
  if (error instanceof Error && error.stack) console.error(`${error.stack}\n`);
  process.exit(1);
});
