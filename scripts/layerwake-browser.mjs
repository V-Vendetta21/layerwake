// Shared helpers for the Layerwake browser scripts.
// Playwright is not a project dependency. Install it once to run these:
//   npm i --no-save playwright && npx playwright install chromium
import { build } from 'esbuild';
import { readFile, stat } from 'node:fs/promises';
import { createServer } from 'node:http';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..'
);

export function loadPlaywright() {
  const require = createRequire(import.meta.url);
  try {
    return require('playwright');
  } catch {
    console.error(
      'Playwright is required for this script.\n' +
        '  npm i --no-save playwright && npx playwright install chromium'
    );
    process.exit(1);
  }
}

/** The exact capture code the extension runs, bundled for injection. */
export async function collectBundle() {
  const result = await build({
    entryPoints: [path.join(root, 'lib/layerwake/collect.ts')],
    bundle: true,
    format: 'iife',
    globalName: 'LayerwakeCollect',
    write: false,
    logLevel: 'silent',
  });
  return result.outputFiles[0].text;
}

const TYPES = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain',
};

/** Serves the static build in ./out on a free local port. */
export async function serveOut() {
  const dir = path.join(root, 'out');
  await stat(path.join(dir, 'index.html')).catch(() => {
    console.error('No static build found. Run "npm run build" first.');
    process.exit(1);
  });
  const server = createServer(async (req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    const candidates = [url, `${url}.html`, path.join(url, 'index.html')];
    for (const candidate of candidates) {
      const file = path.join(dir, candidate);
      if (!file.startsWith(dir)) break;
      try {
        if ((await stat(file)).isFile()) {
          res.writeHead(200, {
            'content-type':
              TYPES[path.extname(file)] ?? 'application/octet-stream',
          });
          res.end(await readFile(file));
          return;
        }
      } catch {}
    }
    res.writeHead(404).end('not found');
  });
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  return {
    base: `http://127.0.0.1:${server.address().port}`,
    close: () => server.close(),
  };
}
