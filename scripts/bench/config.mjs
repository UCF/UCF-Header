/**
 * Shared benchmark configuration.
 *
 * Everything the benchmark touches lives under `.bench/` rather than `dist/`,
 * because `scripts/build.mjs` wipes `dist/` on every build and the vendored v3
 * assets are downloaded once and reused.
 */
import { resolve } from 'node:path';
import { ROOT } from '../config.mjs';

export const BENCH_DIR = resolve(ROOT, '.bench');
/** Raw, unmodified downloads of the production v3 assets. Kept so repeat runs are offline. */
export const CACHE_DIR = resolve(BENCH_DIR, 'cache');
/** Document root the benchmark server serves. Rebuilt on every run. */
export const WWW_DIR = resolve(BENCH_DIR, 'www');
export const RESULTS_DIR = resolve(BENCH_DIR, 'results');

export const LEGACY_ORIGIN = 'universityheader.ucf.edu';

/**
 * Load conditions. `network` is applied over CDP; `cpu` and `device` are
 * optional and only the `mobile` profile uses them.
 *
 * On loopback the round trip is effectively free, which is precisely the cost
 * being measured — v3's paint is gated on a second and third round trip.
 * Without throttling the comparison flatters v3 in a way no real visitor ever
 * experiences, so `none` is reported as a floor rather than as the result.
 *
 * latency is in ms, throughput in bytes/sec.
 */
const kbps = (k) => (k * 1024) / 8;

export const PROFILES = {
  none: { network: null },
  cable: {
    network: { latency: 20, downloadThroughput: (20 * 1e6) / 8, uploadThroughput: (5 * 1e6) / 8 },
  },
  '4g': {
    network: { latency: 70, downloadThroughput: (9 * 1e6) / 8, uploadThroughput: (1.5 * 1e6) / 8 },
  },
  '3g': {
    network: {
      latency: 300,
      downloadThroughput: (1.6 * 1e6) / 8,
      uploadThroughput: (750 * 1e3) / 8,
    },
  },
  /*
   * What PageSpeed Insights' mobile run tests on: Lighthouse's "slow 4G" and a
   * 4x CPU slowdown on a Moto G Power-sized screen. Lighthouse itself simulates
   * this throttling; applied over DevTools it uses the values below instead
   * (its own `requestLatencyMs` / `downloadThroughputKbps` multipliers), which
   * is how this profile applies it. The closest lab analogue to the numbers
   * Google reports for a page, and the profile to quote.
   */
  mobile: {
    network: {
      latency: 150 * 3.75,
      downloadThroughput: kbps(1.6 * 1024 * 0.9),
      uploadThroughput: kbps(750 * 0.9),
    },
    cpu: 4,
    device: {
      viewport: { width: 412, height: 823 },
      deviceScaleFactor: 1.75,
      isMobile: true,
      hasTouch: true,
    },
  },
};

/**
 * Google's Core Web Vitals thresholds, judged at the 75th percentile of page
 * loads. INP needs a real visitor's input, so a lab run cannot produce it; TBT
 * is the lab proxy Lighthouse uses in its place, with Lighthouse's own bounds.
 */
export const THRESHOLDS = {
  lcp: { good: 2500, poor: 4000 },
  cls: { good: 0.1, poor: 0.25 },
  tbt: { good: 200, poor: 600 },
};

export const DEFAULTS = {
  port: 4322,
  runs: 20,
  warmup: 2,
  profiles: ['mobile', 'none', '4g', '3g'],
  flags: 'use-1200-breakpoint=1',
  viewport: { width: 1440, height: 900 },
};
