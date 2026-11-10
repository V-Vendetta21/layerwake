// Regenerates lib/layerwake/demo-capture.json by capturing the real demo card
// with the same code the extension uses.
//   npm run dev            (in another terminal)
//   npm run demo:capture   [-- http://localhost:3000]
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import { collectBundle, loadPlaywright, root } from './layerwake-browser.mjs';

const base = process.argv[2] ?? 'http://localhost:3000';
const { chromium } = loadPlaywright();
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });
  await page.goto(`${base}/layerwake/demo`, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: await collectBundle() });
  const json = await page.evaluate(() => {
    const card = document.querySelector('[data-demo-component]');
    return window.LayerwakeCollect.captureElement(card, window).json;
  });
  const capture = JSON.parse(json);
  delete capture.capturedAt;
  const file = path.join(root, 'lib/layerwake/demo-capture.json');
  await writeFile(file, JSON.stringify(capture, null, 2) + '\n');
  console.log(`Wrote ${path.relative(root, file)} (${json.length} bytes)`);
} finally {
  await browser.close();
}
