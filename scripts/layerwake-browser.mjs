// Shared helpers for the Layerwake browser scripts.
// Playwright is not a project dependency. Install it once to run these:
//   npm i --no-save playwright && npx playwright install chromium
import { build } from 'esbuild';
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
