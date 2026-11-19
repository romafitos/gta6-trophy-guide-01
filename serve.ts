// Tiny static file server for local development of the trophy guide.
//
// Serves only the app/ folder beside this file, on localhost, port
// 8080 by default (pass another port as the first argument). It sends
// correct media types for the files a browser needs, refuses any path
// that would escape the guide folder, answers 404 for anything that
// is not a file, and sends no-store caching so edits show up at once.
// Development convenience only, not a production server.
//
//   node serve.ts [port]

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const here = fileURLToPath(new URL('.', import.meta.url));
const appDir = resolve(join(here, 'app'));
const port = Number(process.argv[2] ?? 8080);

const mediaTypes: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
};

const server = createServer((req, res) => {
  const rawPath = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const relPath = rawPath === '/' ? 'index.html' : rawPath.replace(/^\/+/, '');
  const target = resolve(join(appDir, normalize(relPath)));

  // Refuse anything that escapes the guide folder.
  if (target !== appDir && !target.startsWith(appDir + sep)) {
    res.writeHead(403, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('forbidden\n');
    return;
  }
  if (!existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain; charset=utf-8' });
    res.end('not found\n');
    return;
  }

  res.writeHead(200, {
    'content-type': mediaTypes[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'cache-control': 'no-store',
  });
  createReadStream(target).pipe(res);
});

server.listen(port, '127.0.0.1', () => {
  console.log(`trophy guide serving app/ at http://localhost:${port}`);
});
