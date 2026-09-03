/**
 * Runs the visual suite inside the pinned Playwright container.
 *
 * Font rasterization differs enough between macOS and Linux CI that baselines
 * generated on a developer's machine produce permanent false diffs against CI.
 * The container is the authority; this script is how you reproduce or update it
 * locally. Pass --update-snapshots to re-baseline.
 */
import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { ROOT } from './config.mjs';

const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
const version = pkg.devDependencies['@playwright/test'].replace(/^[^0-9]*/, '');
const image = `mcr.microsoft.com/playwright:v${version}-noble`;

// Every project whose baselines are committed. The iOS ones are WebKit plus a
// device descriptor (viewport, DPR 3, mobile UA, touch), so they rasterize in
// the container for the same reason the desktop ones do.
const PROJECTS = [
  'visual-chromium',
  'visual-firefox',
  'visual-webkit',
  'visual-ios-se',
  'visual-ios-14',
  'visual-ios-max',
];

const passthrough = process.argv.slice(2);

const args = [
  'run',
  '--rm',
  '--init',
  '--ipc=host',
  '-v',
  `${ROOT}:/work`,
  // Anonymous volume so the container's `npm ci` writes Linux binaries into its
  // own node_modules instead of clobbering the host's platform-native ones.
  '-v',
  '/work/node_modules',
  '-w',
  '/work',
  image,
  'sh',
  '-c',
  `npm ci --no-audit --no-fund && npx playwright test ${PROJECTS.map((p) => `--project=${p}`).join(' ')} ${passthrough.join(' ')}`,
];

console.log(`  running visual suite in ${image}\n`);
const res = spawnSync('docker', args, { stdio: 'inherit' });

if (res.error?.code === 'ENOENT') {
  console.error('\n  Docker is not available. Baselines must be generated in the container:');
  console.error('  font rasterization differs between macOS and Linux CI, so locally');
  console.error('  generated baselines diff against CI forever.\n');
  process.exit(1);
}
process.exit(res.status ?? 1);
