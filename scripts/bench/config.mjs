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
 * Chromium network profiles, applied over CDP. On loopback the round trip is
 * effectively free, which is precisely the cost being measured — v3's paint is
 * gated on a second and third round trip. Without throttling the comparison
 * flatters v3 in a way no real visitor ever experiences, so `none` is reported
 * as a floor rather than as the result.
 *
 * latency is in ms, throughput in bytes/sec.
 */
export const PROFILES = {
  none: null,
  cable: { latency: 20, downloadThroughput: (20 * 1e6) / 8, uploadThroughput: (5 * 1e6) / 8 },
  '4g': { latency: 70, downloadThroughput: (9 * 1e6) / 8, uploadThroughput: (1.5 * 1e6) / 8 },
  '3g': { latency: 300, downloadThroughput: (1.6 * 1e6) / 8, uploadThroughput: (750 * 1e3) / 8 },
};

export const DEFAULTS = {
  port: 4322,
  runs: 20,
  warmup: 2,
  profiles: ['none', '4g', '3g'],
  flags: 'use-1200-breakpoint=1',
  viewport: { width: 1440, height: 900 },
};
