/** Minimal static file server for fixtures and the docs page. No dependency needed. */
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
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
  if (path.includes('..')) {
    res.writeHead(403).end('Forbidden');
    return;
  }

  let file = resolve(join(OUT_DIR, path));
  try {
    if ((await stat(file)).isDirectory()) file = join(file, 'index.html');
  } catch {
    res.writeHead(404).end('Not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(file).pipe(res);
}).listen(PORT, () => console.log(`  serving dist/ on http://localhost:${PORT}`));
