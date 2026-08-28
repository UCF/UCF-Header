/**
 * Payload budget gate.
 *
 * The header's whole value proposition is that it is small and loads in one
 * request. That is easy to assert once and then erode a kilobyte at a time, so
 * it is a CI failure rather than a note in a README.
 */
import { readFile } from 'node:fs/promises';
import { brotliCompressSync, gzipSync } from 'node:zlib';
import { BUNDLE, ROOT } from './config.mjs';

const BUDGET = { gzip: 9216, brotli: 8192 };

const buf = await readFile(BUNDLE);
const sizes = {
  raw: buf.length,
  gzip: gzipSync(buf, { level: 9 }).length,
  brotli: brotliCompressSync(buf).length,
};

const pct = (n, of) => `${Math.round((n / of) * 100)}%`;
const rel = BUNDLE.replace(`${ROOT}/`, '');

console.log(`\n  ${rel}\n`);
console.log(`  raw     ${String(sizes.raw).padStart(6)} B`);
console.log(
  `  gzip    ${String(sizes.gzip).padStart(6)} B   ${pct(sizes.gzip, BUDGET.gzip)} of ${BUDGET.gzip} B budget`,
);
console.log(
  `  brotli  ${String(sizes.brotli).padStart(6)} B   ${pct(sizes.brotli, BUDGET.brotli)} of ${BUDGET.brotli} B budget\n`,
);

const over = Object.entries(BUDGET).filter(([k, limit]) => sizes[k] > limit);
if (over.length) {
  for (const [k, limit] of over) {
    console.error(`  OVER BUDGET: ${k} is ${sizes[k]} B, limit is ${limit} B`);
  }
  process.exit(1);
}
