// Builds the Layerwake capture extension into extension/dist.
// Load that folder with chrome://extensions → Developer mode → Load unpacked.
import { build } from 'esbuild';
import { cp, mkdir, rm } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const source = path.join(root, 'extension');
const out = path.join(source, 'dist');

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

await build({
  entryPoints: {
    content: path.join(source, 'src/content.ts'),
    popup: path.join(source, 'src/popup.ts'),
  },
  outdir: out,
  bundle: true,
  format: 'iife',
  target: 'chrome111',
  legalComments: 'none',
  logLevel: 'info',
});

for (const file of ['manifest.json', 'popup.html', 'popup.css', 'icons'])
  await cp(path.join(source, file), path.join(out, file), { recursive: true });

console.log(`Extension built: ${path.relative(root, out)}`);
