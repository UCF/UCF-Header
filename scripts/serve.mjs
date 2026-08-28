/** Minimal static file server for fixtures and the docs page. No dependency needed. */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { OUT_DIR } from './config.mjs';

const PORT = Number(process.env.PORT || 4321);

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.map': 'application/json',
  '.txt': 'text/plain; charset=utf-8',
};

createServer(async (req, res) => {
  // Strip the query string — fixtures request the bundle with flags attached.
  const path = normalize(decodeURIComponent((req.url || '/').split('?')[0]));

  // Resolve first, then assert containment. Checking for '..' before resolving
  // is not a real guard: normalize() has already collapsed those segments away.
  let file = resolve(OUT_DIR, `.${path.startsWith('/') ? path : `/${path}`}`);
  if (file !== OUT_DIR && !file.startsWith(`${OUT_DIR}${sep}`)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  // Only the stat calls are guarded. A broader try would swallow programming
  // errors in here and report them as a 404, which is how a bug hides.
  const statOrNull = (f) => stat(f).catch(() => null);

  let info = await statOrNull(file);
  if (info?.isDirectory()) {
    file = join(file, 'index.html');
    info = await statOrNull(file);
  }
  if (!info?.isFile()) {
    res.writeHead(404).end('Not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`  serving dist/ on http://localhost:${PORT}`));
