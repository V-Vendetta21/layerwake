// End-to-end check of the Layerwake loop in a real browser:
// capture → import → inspect → rebuild → export → open the exported file.
//
//   npm run build && npm run build:extension
//   npm run verify:layerwake            (serves ./out itself)
//   npm run verify:layerwake -- http://localhost:3000   (or use a running app)
import { createServer } from 'node:http';
import { mkdtemp, readFile, stat, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadPlaywright, root, serveOut } from './layerwake-browser.mjs';

const { chromium } = loadPlaywright();
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(
    `${ok ? '  ok  ' : ' FAIL '} ${name}${detail ? ` — ${detail}` : ''}`
  );
};

const served = process.argv[2] ? null : await serveOut();
const base = process.argv[2] ?? served.base;
const tmp = await mkdtemp(path.join(os.tmpdir(), 'layerwake-e2e-'));
const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width: 1360, height: 900 },
  acceptDownloads: true,
});

// The picker UI lives in a closed shadow root. Open it for this test only.
await context.addInitScript(() => {
  const attach = Element.prototype.attachShadow;
  Element.prototype.attachShadow = function (init) {
    return attach.call(this, { ...init, mode: 'open' });
  };
});

const outside = [];
context.on('request', (request) => {
  const url = request.url();
  if (
    !url.startsWith(base) &&
    !url.startsWith('data:') &&
    !url.startsWith('blob:') &&
    !url.startsWith('file:')
  )
    outside.push(url);
});
const pageErrors = [];

try {
  const page = await context.newPage();
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (m) => m.type() === 'error' && pageErrors.push(m.text()));

  /* ------------------------------------------------ capture (extension code) */
  const contentScript = path.join(root, 'extension/dist/content.js');
  await page.goto(`${base}/demo`, { waitUntil: 'networkidle' });
  const host = page.locator('[data-layerwake]');
  const card = page.locator('[data-demo-component]');

  await page.addScriptTag({ path: contentScript });
  await card.hover();
  check(
    'picker shows an outline on hover',
    await host.locator('.outline').isVisible()
  );
  await page.keyboard.press('Escape');
  check('Escape cancels and removes the picker', (await host.count()) === 0);

  await page.addScriptTag({ path: contentScript });
  await card.click({ position: { x: 6, y: 6 } });
  const panel = host.getByRole('dialog', { name: 'Capture ready' });
  await panel.waitFor();
  const summary = await panel.innerText();
  check(
    'capture summary lists size and layers',
    /340 × \d+ px/.test(summary) && /20 \(/.test(summary),
    summary.split('\n').slice(1, 9).join(' | ')
  );
  check(
    'summary says what the file includes and excludes',
    /includes/i.test(summary) && /never includes/i.test(summary)
  );
  const [captureDownload] = await Promise.all([
    page.waitForEvent('download'),
    panel.getByRole('button', { name: 'Download Layerwake JSON' }).click(),
  ]);
  const captureFile = path.join(tmp, 'capture.json');
  await captureDownload.saveAs(captureFile);
  const captureText = await readFile(captureFile, 'utf8');
  check(
    'capture file downloads with a schema version',
    JSON.parse(captureText).schemaVersion === 1,
    captureDownload.suggestedFilename()
  );
  check(
    'capture file contains no page copy or URLs',
    !/Calm seas|Harbor|Tide chart|http|coast-card/i.test(captureText)
  );
  await panel.getByRole('button', { name: 'Close' }).click();
  check('picker cleans up after capture', (await host.count()) === 0);

  /* ----------------------------------------------------------------- import */
  await page.goto(`${base}/workspace`, { waitUntil: 'networkidle' });
  check(
    'workspace starts empty with both actions',
    (await page.getByRole('button', { name: 'Try demo' }).isVisible()) &&
      (await page
        .getByRole('button', { name: 'Import capture' })
        .first()
        .isVisible())
  );

  const fileInput = page.locator('input[type=file]');
  const status = page.locator('.lw-status');
  const alert = page.locator('.lw-alert');

  await fileInput.setInputFiles({
    name: 'broken.json',
    mimeType: 'application/json',
    buffer: Buffer.from('{ not json'),
  });
  await alert
    .filter({ hasText: 'not valid JSON' })
    .waitFor({ timeout: 3000 })
    .catch(() => {});
  check(
    'malformed file fails with a clear error',
    /not valid JSON/.test(await alert.innerText())
  );
  await fileInput.setInputFiles({
    name: 'huge.json',
    mimeType: 'application/json',
    buffer: Buffer.alloc(700 * 1024, 32),
  });
  await alert
    .filter({ hasText: 'limited to' })
    .waitFor({ timeout: 3000 })
    .catch(() => {});
  check(
    'oversized file fails with a clear error',
    /limited to 512 KB/.test(await alert.innerText()),
    (await alert.innerText()).replace(/\n/g, ' ')
  );
  const hostile = JSON.parse(captureText);
  hostile.root.styles['background-image'] =
    'url(https://example.com/track.png)';
  await fileInput.setInputFiles({
    name: 'hostile.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(hostile)),
  });
  await alert
    .filter({ hasText: 'outside resource' })
    .waitFor({ timeout: 3000 })
    .catch(() => {});
  check(
    'resource-loading value is rejected',
    /outside resource/.test(await alert.innerText())
  );

  await fileInput.setInputFiles(captureFile);
  await page.getByRole('tree').waitFor();
  check(
    'valid capture imports',
    /Imported capture\.json: 20 layers/.test(await status.innerText()),
    await status.innerText()
  );

  /* ---------------------------------------------------------------- inspect */
  const tree = page.getByRole('tree');
  const preview = page.locator('.lw-render');
  await tree.getByRole('treeitem', { name: /headline/ }).click();
  check(
    'tree selection highlights the preview',
    (await page.locator('.lw-outline__tag').innerText()) === 'headline'
  );
  await preview.locator('button').click();
  check(
    'preview selection highlights the tree',
    /action/.test(await tree.locator('[aria-selected=true]').innerText())
  );
  await tree.locator('[aria-selected=true]').focus();
  await page.keyboard.press('Home');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  const focused = await page.evaluate(
    () => document.activeElement?.textContent
  );
  check(
    'arrow keys move through the tree',
    /label/.test(focused ?? ''),
    focused ?? ''
  );
  check(
    'measured and inferred values are labelled',
    (await page.locator('.lw-chip--measured').count()) > 0 &&
      (await page.locator('.lw-chip--inferred').count()) > 1
  );

  /* ---------------------------------------------------------------- rebuild */
  await page.keyboard.press('Home');
  const rootEl = preview.locator('[data-lw-node]').first();
  const radius = () =>
    rootEl.evaluate((el) => getComputedStyle(el).borderTopLeftRadius);
  check('preview starts at the measured radius', (await radius()) === '20px');
  const radiusInput = page.getByRole('spinbutton', {
    name: 'Corner radius in pixels',
  });
  await radiusInput.fill('4');
  check('editing a token updates the preview', (await radius()) === '4px');
  await radiusInput.fill('5000');
  check(
    'out-of-range input is clamped with feedback',
    (await radius()) === '64px' &&
      /Kept within 0–64 px/.test(
        await page.locator('.lw-col--right').innerText()
      )
  );
  const slider = page.getByRole('slider', { name: /Corner radius/ });
  await slider.focus();
  await page.keyboard.press('ArrowLeft');
  check('sliders respond to the keyboard', (await radius()) === '63px');
  await radiusInput.fill('4');

  await tree.getByRole('treeitem', { name: /action/ }).click();
  await page.getByRole('textbox', { name: 'Fill hex value' }).fill('#e2452b');
  const actionBg = () =>
    preview
      .locator('button')
      .evaluate((el) => getComputedStyle(el).backgroundColor);
  check(
    'palette edit updates the preview',
    (await actionBg()) === 'rgb(226, 69, 43)'
  );
  await page
    .getByRole('textbox', { name: 'Placeholder text' })
    .fill('<b>Go & "see"</b>');

  await page.getByRole('button', { name: 'As measured' }).click();
  check(
    'original measurements stay available for comparison',
    (await radius()) === '20px'
  );
  await page.getByRole('button', { name: 'Your edits' }).click();

  await page.getByRole('button', { name: /Compact/ }).click();
  await page.waitForTimeout(500);
  const checks = await page.locator('.lw-checks').innerText();
  check(
    'compact-width test reports overflow status',
    /overflow at 240px/i.test(checks),
    checks.split('\n').find((l) => /overflow/i.test(l))
  );

  /* ----------------------------------------------------------------- export */
  await page.getByRole('tab', { name: 'Export' }).first().click();
  await page.getByRole('button', { name: 'Copy CSS variables' }).click();
  await page
    .getByRole('textbox', { name: 'CSS variables to copy' })
    .waitFor({ timeout: 3000 })
    .catch(() => {});
  check(
    'copy without clipboard access falls back to manual copy',
    await page
      .getByRole('textbox', { name: 'CSS variables to copy' })
      .isVisible(),
    (await status.innerText()).slice(0, 60)
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: base,
  });
  await page.getByRole('button', { name: 'Copy CSS variables' }).click();
  const clip = await page
    .evaluate(() => navigator.clipboard.readText())
    .catch(() => '');
  check(
    'Copy CSS variables copies the edited tokens',
    /--lw-radius-\d: 4px;/.test(clip) && /copied/.test(await status.innerText())
  );

  const [tokensDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download tokens JSON' }).click(),
  ]);
  const tokensFile = path.join(tmp, tokensDownload.suggestedFilename());
  await tokensDownload.saveAs(tokensFile);
  const tokens = JSON.parse(await readFile(tokensFile, 'utf8'));
  check(
    'tokens JSON holds edited and measured values',
    Object.values(tokens.tokens.radius).some(
      (t) => t.value === '4px' && t.measured === '20px' && t.edited
    )
  );

  await page.getByRole('textbox', { name: /Component name/ }).fill('My <card>');
  const [htmlDownload] = await Promise.all([
    page.waitForEvent('download'),
    page.getByRole('button', { name: 'Download HTML/CSS' }).click(),
  ]);
  const htmlFile = path.join(tmp, htmlDownload.suggestedFilename());
  await htmlDownload.saveAs(htmlFile);
  check(
    'HTML/CSS downloads with a readable name',
    htmlDownload.suggestedFilename() === 'my-card.html',
    htmlDownload.suggestedFilename()
  );
  const codeView = await page.locator('.lw-code').innerText();
  check(
    'code view matches the export',
    codeView.includes('class="my-card__action"')
  );

  /* ------------------------------------------- the exported file on its own */
  const outsideBefore = outside.length;
  const standalone = await context.newPage();
  const fileRequests = [];
  standalone.on('request', (r) => fileRequests.push(r.url()));
  await standalone.goto(pathToFileURL(htmlFile).href);
  const exported = await standalone.evaluate(() => {
    const rootNode = document.querySelector('.my-card');
    const action = document.querySelector('.my-card__action');
    return {
      radius: getComputedStyle(rootNode).borderTopLeftRadius,
      bg: getComputedStyle(action).backgroundColor,
      text: action.textContent,
      children: action.children.length,
      title: document.title,
      scripts: document.scripts.length,
      width: rootNode.getBoundingClientRect().width,
    };
  });
  check(
    'exported HTML shows the edited radius and color',
    exported.radius === '4px' && exported.bg === 'rgb(226, 69, 43)',
    JSON.stringify(exported)
  );
  check(
    'edited strings are escaped in the export',
    exported.text === '<b>Go & "see"</b>' &&
      exported.children === 0 &&
      exported.title === 'My <card>' &&
      exported.scripts === 0
  );
  check(
    'exported file loads nothing else',
    fileRequests.length === 1 && outside.length === outsideBefore,
    fileRequests.join(', ')
  );
  await standalone.screenshot({ path: path.join(tmp, 'exported.png') });
  await standalone.close();

  /* ------------------------------------------------------------------ reset */
  await page.getByRole('tab', { name: 'Preview' }).first().click();
  await page.getByRole('button', { name: /Reset changes/ }).click();
  check(
    'Reset changes restores the measured values',
    (await radius()) === '20px' && (await actionBg()) === 'rgb(22, 76, 255)'
  );

  /* ------------------------------------------------ demo without extension */
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.locator('.lw-sample .lw-render button').click();
  check(
    'home sample is interactive',
    (await page.locator('.lw-sample__name').innerText()) === 'action'
  );
  await page.getByRole('link', { name: 'Try demo' }).click();
  await page.getByRole('tree').waitFor();
  check(
    'Try demo works without the extension',
    (await page.getByRole('treeitem').count()) === 20 &&
      /Demo loaded/.test(await status.innerText())
  );

  /* ---------------------------------------------------------- narrow layout */
  await page.setViewportSize({ width: 390, height: 780 });
  const tabs = page.getByRole('tablist', { name: 'Workspace panels' });
  await tabs.getByRole('tab', { name: 'Inspect' }).click();
  const narrowOk =
    (await page.locator('.lw-col--right').isVisible()) &&
    !(await page.locator('.lw-col--left').isVisible()) &&
    (await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth
    ));
  check(
    'narrow layout switches panels with tabs and has no page overflow',
    narrowOk
  );
  await tabs.getByRole('tab', { name: 'Preview' }).click();
  await page.waitForTimeout(400);
  const aligned = await page.evaluate(() => {
    const a = document.querySelector('.lw-outline').getBoundingClientRect();
    const b = document
      .querySelector('.lw-render [data-lw-node]')
      .getBoundingClientRect();
    return Math.abs(a.left - b.left) < 2 && Math.abs(a.top - b.top) < 2;
  });
  check('selection outline tracks the layer after a panel switch', aligned);
  await page.screenshot({ path: path.join(tmp, 'narrow.png') });
  for (const route of ['/', '/demo']) {
    await page.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    check(
      `${route} fits a 390px screen`,
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth
      )
    );
  }

  check(
    'no requests left the app origin',
    outside.length === 0,
    outside.slice(0, 3).join(', ')
  );
  check(
    'no console or page errors',
    pageErrors.length === 0,
    pageErrors.slice(0, 3).join(' | ')
  );
} finally {
  await browser.close();
  served?.close();
}

const failed = results.filter((r) => !r.ok);
console.log(
  `\n${results.length - failed.length}/${results.length} checks passed. Artifacts: ${tmp}`
);
process.exit(failed.length ? 1 : 0);
