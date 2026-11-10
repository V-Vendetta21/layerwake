// Collects the source of every Motion Gallery component into one JSON file.
// The gallery's Code tab shows these strings, and its Preview tab renders the
// very same files, so the two cannot drift apart.
//   npm run motion:sources          write the file
//   npm run motion:sources -- --check   fail if it is out of date
import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const items = path.join(root, 'components/motion/items');
const target = path.join(root, 'components/motion/sources.generated.json');

export async function collectSources() {
  const sources = {};
  for (const slug of (await readdir(items)).sort()) {
    const read = (file) => readFile(path.join(items, slug, file), 'utf8');
    sources[slug] = {
      component: await read(`${slug}.tsx`),
      css: await read(`${slug}.css`),
      usage: await read('demo.tsx'),
    };
  }
  return JSON.stringify(sources, null, 2) + '\n';
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const next = await collectSources();
  if (process.argv.includes('--check')) {
    const current = await readFile(target, 'utf8').catch(() => '');
    if (current !== next) {
      console.error(
        'sources.generated.json is out of date. Run "npm run motion:sources".'
      );
      process.exit(1);
    }
    console.log('Motion sources are up to date.');
  } else {
    await writeFile(target, next);
    console.log(
      `Wrote ${path.relative(root, target)} (${Object.keys(JSON.parse(next)).length} components)`
    );
  }
}
