/**
 * Runs the local stack: static watcher, Functions host, Static Web Apps emulator.
 *
 * Three processes rather than the two `swa start --api-location` would give
 * you, because the SWA CLI spawns the Functions host as `func start --cors "*"`
 * and that flag is not overridable — not by `local.settings.json`, not by a
 * second `--cors`. A wildcard `Access-Control-Allow-Origin` is illegal on a
 * credentialed request, so every browser rejects the session response and the
 * bar silently stays signed out. Starting `func` here without `--cors` and
 * attaching the emulator with `--api-devserver-url` leaves the API's own CORS
 * headers intact, which is how it behaves in Azure.
 *
 * `npm run dev & npm run dev:api` would not work either, for two more reasons:
 *
 *   1. Ordering. `npm run dev` starts by deleting dist/ — the very directory
 *      the emulator serves. Start them at the same moment and the emulator
 *      either 404s every asset or serves a half-written bundle.
 *
 *   2. Cleanup. `&` backgrounds the watcher into a job Ctrl-C never reaches,
 *      and each half spawns grandchildren — esbuild, func, the language
 *      worker. Killing the direct children strands those on their ports, and
 *      the next run fails with a conflict that has no visible cause.
 */

import { spawn } from 'node:child_process';
import { stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { BUNDLE, buildEnv, OUT_DIR } from './config.mjs';

const watch = !process.argv.includes('--no-watch');

const STATIC_PORT = Number(process.env.PORT || 4321);
const API_PORT = Number(process.env.API_PORT || 4280);
const FUNC_PORT = Number(process.env.FUNC_PORT || 7071);

/** Long enough for a cold build on a slow machine, short enough to notice. */
const BUILD_TIMEOUT_MS = 60_000;
/** The Functions host is the slow one; a cold start pulls in the .NET runtime. */
const API_TIMEOUT_MS = 90_000;
/** Grace period between asking a process group to stop and forcing it. */
const KILL_GRACE_MS = 3_000;
const HEALTH_INTERVAL_MS = 2_000;
/** Consecutive failures before tearing down. Three rides out a blip, not an outage. */
const HEALTH_FAILURES = 3;

const health = (port) => `http://localhost:${port}/api/health`;

const children = [];
let stopping = false;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/**
 * Starts a child in its own process group.
 *
 * `detached` is what makes teardown work: it puts the child and everything it
 * spawns into one group we can signal as a unit. It also means Ctrl-C reaches
 * only this script — the children are no longer in the foreground group — so
 * shutdown happens once, here, rather than racing.
 */
function start(name, args) {
  const child = spawn('npm', args, { stdio: 'inherit', detached: true });
  // With `detached` the child leads its own group, so its pid is the group id.
  // Kept separately because the group outlives the leader: npm exits the moment
  // it is signalled, while esbuild and func are still shutting down.
  children.push({ name, pgid: child.pid, child });

  child.on('exit', (code, signal) => {
    if (stopping) return;
    console.error(`\n  ${name} exited (${signal ?? `code ${code}`}) — stopping the rest.`);
    shutdown(code ?? 1);
  });

  child.on('error', (err) => {
    console.error(`\n  ${name} failed to start: ${err.message}`);
    shutdown(1);
  });

  return child;
}

/** True while any process remains in the group. Signal 0 tests, never delivers. */
function groupAlive(pgid) {
  try {
    process.kill(-pgid, 0);
    return true;
  } catch (err) {
    // EPERM means the group exists but is not ours to signal; ESRCH means empty.
    return err.code === 'EPERM';
  }
}

function signalGroup({ name, pgid }, signal) {
  try {
    // Negative pid targets the whole group, which is where the grandchildren
    // are. Signalling the npm pid alone is what leaves func holding 7071.
    process.kill(-pgid, signal);
  } catch (err) {
    if (err.code !== 'ESRCH') console.error(`  could not ${signal} ${name}: ${err.message}`);
  }
}

/**
 * Stops everything and does not return until the process groups are empty.
 *
 * Waiting on the direct children is not enough, and getting it wrong is silent:
 * npm exits the instant it is signalled, so a shutdown that waits only for it
 * quits while esbuild and func still hold their ports — and once this process
 * is gone, nothing is left to escalate to SIGKILL.
 */
async function shutdown(code) {
  if (stopping) return;
  stopping = true;

  for (const entry of children) signalGroup(entry, 'SIGTERM');

  const deadline = Date.now() + KILL_GRACE_MS;
  while (Date.now() < deadline && children.some((e) => groupAlive(e.pgid))) await sleep(100);

  for (const entry of children.filter((e) => groupAlive(e.pgid))) {
    console.error(`  ${entry.name} ignored SIGTERM — forcing.`);
    signalGroup(entry, 'SIGKILL');
  }

  // SIGKILL is immediate but reaping is not; give the kernel a moment so the
  // ports are free by the time the shell prompt comes back.
  for (let i = 0; i < 20 && children.some((e) => groupAlive(e.pgid)); i++) await sleep(50);

  process.exit(code);
}

async function exists(path) {
  try {
    return (await stat(path)).size > 0;
  } catch {
    return false;
  }
}

/**
 * Waits for a build the emulator can actually serve.
 *
 * The bundle is written first and the site/ copy lands after it, so requiring
 * both means dist/ is complete rather than merely being written into.
 */
async function waitForBuild() {
  const index = resolve(OUT_DIR, 'index.html');
  const deadline = Date.now() + BUILD_TIMEOUT_MS;

  while (Date.now() < deadline) {
    if (stopping) return false;
    if ((await exists(BUNDLE)) && (await exists(index))) return true;
    await sleep(150);
  }

  console.error(`\n  Timed out after ${BUILD_TIMEOUT_MS / 1000}s waiting for dist/ to be built.`);
  return false;
}

async function healthy(port) {
  try {
    return (await fetch(health(port), { signal: AbortSignal.timeout(1_500) })).ok;
  } catch {
    return false;
  }
}

async function waitForPort(port, label) {
  const deadline = Date.now() + API_TIMEOUT_MS;
  while (Date.now() < deadline) {
    if (stopping) return false;
    if (await healthy(port)) return true;
    await sleep(500);
  }
  console.error(`\n  Timed out after ${API_TIMEOUT_MS / 1000}s waiting for ${label}.`);
  return false;
}

/** Runs a command to completion. Used for the one-off build in --no-watch mode. */
function once(name, args) {
  return new Promise((done) => {
    const child = spawn('npm', args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code) {
        console.error(`\n  ${name} failed (code ${code}).`);
        process.exit(code);
      }
      done();
    });
  });
}

/**
 * Watches the stack itself, not just the processes we spawned.
 *
 * Child exit is not a reliable signal: npm does not propagate a grandchild's
 * death through nested layers, so killing the emulator leaves this script none
 * the wiser while esbuild and func keep holding their ports. Polling the
 * endpoint catches that, and every other way the stack can die, without caring
 * which process was responsible.
 */
async function supervise() {
  let failures = 0;
  while (!stopping) {
    await sleep(HEALTH_INTERVAL_MS);
    if (stopping) return;

    failures = (await healthy(API_PORT)) ? 0 : failures + 1;
    if (failures >= HEALTH_FAILURES) {
      console.error(`\n  ${health(API_PORT)} stopped responding — stopping everything.`);
      shutdown(1);
      return;
    }
  }
}

for (const signal of ['SIGINT', 'SIGTERM', 'SIGHUP']) {
  process.on(signal, () => shutdown(0));
}

const env = buildEnv();

// Both mistakes are slow to diagnose by hand, because the bar renders and the
// API is up either way — only the personalised state silently never arrives.
if (!env.session) {
  console.warn(
    '\n  ⚠ UCFHB_SESSION=0 — the signed-in seam is compiled out, so the bar will' +
      '\n    render the MyUCF button and never call the API. Set it to 1 in .env.',
  );
} else if (!env.rootUrl.endsWith(`:${API_PORT}`)) {
  console.warn(
    `\n  ⚠ ROOT_URL is "${env.rootUrl}" but /api is served on ${API_PORT}.` +
      `\n    Set ROOT_URL=localhost:${API_PORT} in .env, or the session endpoint will not resolve.`,
  );
}

if (watch) {
  console.log('\n  starting static dev server…');
  start('dev', ['run', 'dev']);
} else {
  console.log('\n  building static assets…');
  await once('build', ['run', 'build']);
}

if (!(await waitForBuild())) shutdown(1);

console.log(`  dist/ ready — starting the Functions host on ${FUNC_PORT}…`);
start('func', ['--prefix', 'api', 'run', 'dev:func']);
if (!(await waitForPort(FUNC_PORT, `the Functions host on ${FUNC_PORT}`))) shutdown(1);

console.log(`  functions up — starting the emulator on ${API_PORT}…`);
start('swa', ['--prefix', 'api', 'run', 'dev:swa']);

if (await waitForPort(API_PORT, `the emulator on ${API_PORT}`)) {
  if (watch) {
    console.log(`\n  static only   http://localhost:${STATIC_PORT}   (live rebuild, no /api)`);
  }
  console.log(`  full stack    http://localhost:${API_PORT}   <- use this one\n`);
  supervise();
} else {
  shutdown(1);
}
