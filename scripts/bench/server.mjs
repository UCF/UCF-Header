/**
 * Benchmark-only static server.
 *
 * Deliberately not `scripts/serve.mjs`, for two reasons that matter to the
 * measurement:
 *
 *  1. It negotiates gzip. Real origins compress, and the whole v3/v4 payload
 *     trade (fewer requests, more bytes) only reads correctly at wire size —
 *     uncompressed, v4 looks 8 KB heavier than it actually is on the wire.
 *  2. It serves from memory. Every file is read and compressed once at startup,
 *     so disk I/O does not vary across the twenty runs being compared.
 *
 * `no-store` on everything keeps each load genuinely uncached, alongside the
 * fresh browser context and disabled cache in the runner.
 */
import { readdir, readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, posix, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.svg', '.json', '.map']);

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(full);
    else if (entry.isFile()) yield full;
  }
}

async function load(root) {
  const files = new Map();
  for await (const full of walk(root)) {
    const ext = extname(full);
    const raw = await readFile(full);
    files.set(`/${posix.join(...relative(root, full).split(/[\\/]/))}`, {
      raw,
      gz: COMPRESSIBLE.has(ext) ? gzipSync(raw, { level: 9 }) : null,
      type: TYPES[ext] || 'application/octet-stream',
    });
  }
  return files;
}

/**
 * @returns {Promise<{origin: string, close: () => Promise<void>}>}
 */
export async function startServer(root, port) {
  const files = await load(resolve(root));

  const server = createServer((req, res) => {
    // Strip the query string — v3 cache-busts its stylesheets with one, and
    // the host pages carry the flags on the header src.
    const path = (req.url || '/').split('?')[0];
    const file = files.get(decodeURIComponent(path));

    if (!file) {
      res.writeHead(404, { 'Cache-Control': 'no-store' }).end('Not found');
      return;
    }

    const gzip = file.gz && /\bgzip\b/.test(req.headers['accept-encoding'] || '');
    const body = gzip ? file.gz : file.raw;

    res.writeHead(200, {
      'Content-Type': file.type,
      'Content-Length': body.length,
      'Cache-Control': 'no-store',
      Vary: 'Accept-Encoding',
      ...(gzip ? { 'Content-Encoding': 'gzip' } : {}),
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  });

  await new Promise((ok, fail) => {
    server.once('error', fail);
    server.listen(port, '127.0.0.1', ok);
  });

  return {
    origin: `http://localhost:${port}`,
    close: () => new Promise((ok) => server.close(ok)),
  };
}
