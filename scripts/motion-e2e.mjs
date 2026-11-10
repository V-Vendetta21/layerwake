// Browser checks for the Motion Gallery and the site scrollbars.
//
//   npm run build
//   npm run verify:motion                         (serves ./out itself)
//   npm run verify:motion -- http://localhost:3000
//
// Part 1 drives /motion. Part 2 takes the code exactly as the Code tab offers
// it, builds each component in an empty folder outside this repository, and
// checks that it runs there with nothing but React.
import { build } from 'esbuild';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
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
const sources = JSON.parse(
  await readFile(
    path.join(root, 'components/motion/sources.generated.json'),
    'utf8'
  )
);
const slugs = Object.keys(sources);
const tmp = await mkdtemp(path.join(os.tmpdir(), 'layerwake-motion-'));
const browser = await chromium.launch();
const errors = [];
const watch = (page) => {
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
};

try {
  /* ---------------------------------------------------------------- gallery */
  const context = await browser.newContext({
    viewport: { width: 1360, height: 900 },
  });
  const page = await context.newPage();
  watch(page);
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  check(
    'home has a nav link and a small link to the gallery',
    (await page.locator('a[href="/motion"]').count()) >= 2
  );
  check(
    'home still leads with Try demo and Import capture',
    (await page.getByRole('link', { name: 'Try demo' }).isVisible()) &&
      (await page.getByRole('button', { name: 'Import capture' }).isVisible())
  );
  await page.locator('.lw-home__links a[href="/motion"]').click();
  await page.waitForURL('**/motion');
  await page.locator('.mgx-entry').first().waitFor();

  const entries = page.locator('.mgx-entry');
  check(
    'gallery lists 24 entries',
    (await entries.count()) === 24 && slugs.length === 24,
    `${await entries.count()} cards`
  );

  const first = page.locator('#staggered-text');
  check(
    'previews stay idle until they are in view',
    (await page.locator('#scroll-reveal .mgx-stage > *').count()) === 0 &&
      (await first.locator('.mgx-stage > *').count()) === 1
  );

  const missing = [];
  for (const slug of slugs) {
    const card = page.locator(`#${slug}`);
    await card.scrollIntoViewIfNeeded();
    const demo = card.locator('.mgx-stage [class*="mg-"]').first();
    const ok =
      (await demo.waitFor({ state: 'attached', timeout: 4000 }).then(
        () => true,
        () => false
      )) &&
      (await card.locator('.mgx-entry__head h2').innerText()).length > 3 &&
      (await card.locator('.mgx-entry__head p').innerText()).length > 10 &&
      (await card.locator('.mgx-cue').innerText()).length > 5;
    if (!ok) missing.push(`${slug} (preview)`);

    await card.getByRole('tab', { name: 'Code' }).click();
    const copies = await card.locator('.mgx-copy').allInnerTexts();
    const shown = await card.locator('.mgx-code code').allTextContents();
    const exact =
      shown[0] === sources[slug].usage &&
      shown[1] === sources[slug].component &&
      shown[2] === sources[slug].css;
    if (copies.join('|') !== 'Copy usage|Copy component|Copy CSS' || !exact)
      missing.push(`${slug} (code)`);
    if ((await card.locator('.mgx-stage > *').count()) !== 0)
      missing.push(`${slug} (preview kept running under Code)`);
    await card.getByRole('tab', { name: 'Preview' }).click();
  }
  check(
    'all 24 render a working preview with name, purpose and cue',
    !missing.some((m) => m.includes('preview')),
    missing.join(', ')
  );
  check(
    'all 24 show exact source, CSS and usage with separate copy buttons',
    !missing.some((m) => m.includes('code')),
    missing.join(', ')
  );
  check(
    'offscreen previews are unmounted',
    (await first.locator('.mgx-stage > *').count()) === 0
  );

  await page.evaluate(() => window.scrollTo(0, 0));
  await first.locator('.mg-stagger').waitFor();

  // Tabs
  const previewTab = first.getByRole('tab', { name: 'Preview' });
  await previewTab.focus();
  await page.keyboard.press('ArrowRight');
  check(
    'arrow keys switch Preview / Code',
    (await first
      .getByRole('tab', { name: 'Code' })
      .getAttribute('aria-selected')) === 'true' &&
      (await first.locator('.mgx-code').first().isVisible())
  );
  await page.waitForTimeout(350);
  const underline = await first
    .getByRole('tab', { name: 'Code' })
    .evaluate((el) => getComputedStyle(el, '::after').transform);
  check(
    'active tab has an underline',
    underline !== 'matrix(0, 0, 0, 1, 0, 0)',
    underline
  );

  // Copy
  await first.getByRole('button', { name: 'Copy usage' }).click();
  await first
    .locator('.mgx-copy__hint')
    .waitFor({ timeout: 3000 })
    .catch(() => {});
  const selected = await page.evaluate(
    () => window.getSelection()?.toString() ?? ''
  );
  check(
    'copy without clipboard access selects the code for manual copy',
    selected.trim() === sources['staggered-text'].usage.trim()
  );
  await context.grantPermissions(['clipboard-read', 'clipboard-write'], {
    origin: base,
  });
  const clips = [];
  for (const label of ['Copy usage', 'Copy component', 'Copy CSS']) {
    await first.locator('.mgx-copy', { hasText: label }).click();
    await first
      .locator('.mgx-copy[data-state="copied"]')
      .waitFor({ timeout: 3000 })
      .catch(() => {});
    clips.push(await page.evaluate(() => navigator.clipboard.readText()));
    await first
      .locator('.mgx-copy[data-state="copied"]')
      .waitFor({ state: 'detached', timeout: 4000 })
      .catch(() => {});
  }
  const s = sources['staggered-text'];
  check(
    'usage, component and CSS each copy their own file',
    clips[0] === s.usage && clips[1] === s.component && clips[2] === s.css
  );
  await page.keyboard.press('Home');
  await first.getByRole('tab', { name: 'Preview' }).click();

  // Replay
  await first
    .locator('.mg-stagger')
    .evaluate((el) => (el.dataset.mark = 'old'));
  await first.getByRole('button', { name: /Replay/ }).click();
  check(
    'Replay restarts the entrance',
    (await first.locator('.mg-stagger[data-mark]').count()) === 0 &&
      (await first.locator('.mg-stagger').count()) === 1
  );

  // A few behaviors, end to end
  const counter = page.locator('#rolling-counter');
  await counter.scrollIntoViewIfNeeded();
  const before = await counter.getByRole('img').getAttribute('aria-label');
  await counter.getByRole('button', { name: 'Increase' }).click();
  check(
    'Rolling Counter responds to input',
    Number(await counter.getByRole('img').getAttribute('aria-label')) ===
      Number(before) + 1
  );

  const sheet = page.locator('#slide-over-sheet');
  await sheet.scrollIntoViewIfNeeded();
  const opener = sheet.getByRole('button', { name: 'Open passage plan' });
  await opener.click();
  await sheet.getByRole('dialog').waitFor();
  const inside = await page.evaluate(() =>
    document.activeElement?.getAttribute('role')
  );
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  const trapped = await page.evaluate(
    () => !!document.activeElement?.closest('[role="dialog"]')
  );
  await page.keyboard.press('Escape');
  await page.waitForTimeout(450);
  const restored = await opener.evaluate((el) => el === document.activeElement);
  check(
    'Slide-over Sheet moves, traps and restores focus',
    inside === 'dialog' && trapped && restored,
    `in:${inside} trapped:${trapped} restored:${restored}`
  );

  const tabs = page.locator('#animated-tabs');
  await tabs.scrollIntoViewIfNeeded();
  const bar = () =>
    tabs.locator('.mg-tabs__bar').evaluate((el) => el.style.transform);
  const barBefore = await bar();
  await tabs.getByRole('tab', { name: 'Tomorrow' }).click();
  await page.waitForTimeout(250);
  check('Animated Tabs indicator moves', (await bar()) !== barBefore);

  const reveal = page.locator('#scroll-reveal');
  await reveal.scrollIntoViewIfNeeded();
  await reveal.locator('.mg-reveal').first().waitFor();
  await page.waitForTimeout(300);
  const pageY = await page.evaluate(() => window.scrollY);
  const hiddenBefore = await reveal
    .locator('.mg-reveal[data-visible="false"]')
    .count();
  await reveal.locator('[role="group"]').hover();
  for (let i = 0; i < 12; i++) {
    await page.mouse.wheel(0, 60);
    await page.waitForTimeout(80);
  }
  await page.waitForTimeout(400);
  check(
    'Scroll Reveal works in its own scroll area without moving the page',
    hiddenBefore > 0 &&
      (await reveal.locator('.mg-reveal[data-visible="false"]').count()) ===
        0 &&
      (await page.evaluate(() => window.scrollY)) === pageY,
    `hidden before:${hiddenBefore} after:${await reveal.locator('.mg-reveal[data-visible="false"]').count()} page:${pageY}->${await page.evaluate(() => window.scrollY)}`
  );

  // Search, filters, empty state, anchors
  await page.evaluate(() => window.scrollTo(0, 0));
  const search = page.getByRole('searchbox');
  await search.fill('toast');
  check(
    'search narrows the grid',
    (await entries.count()) === 1 &&
      (await entries.first().getAttribute('id')) === 'toast-stack'
  );
  await search.fill('zzzz');
  check(
    'empty state explains and offers to clear',
    (await page.locator('.mgx-empty').isVisible()) &&
      (await page
        .locator('.mgx-empty')
        .getByRole('button', { name: 'Clear filters' })
        .isVisible())
  );
  await page
    .locator('.mgx-empty')
    .getByRole('button', { name: 'Clear filters' })
    .click();
  check('Clear filters restores all 24', (await entries.count()) === 24);
  const counts = [];
  for (const name of [
    'Text and numbers',
    'Cards and buttons',
    'Layout and controls',
    'Status and feedback',
  ]) {
    await page
      .getByRole('group', { name: 'Filter by category' })
      .getByRole('button', { name })
      .click();
    counts.push(await entries.count());
  }
  check(
    'each category filter shows 6',
    counts.join() === '6,6,6,6',
    counts.join()
  );
  await page.goto(`${base}/motion#progress-ring`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(400);
  check(
    'each component has a shareable anchor',
    await page.locator('#progress-ring').evaluate((el) => {
      const r = el.getBoundingClientRect();
      return el.matches(':target') && r.top >= 0 && r.top < innerHeight;
    })
  );

  /* ------------------------------------------------------------- scrollbars */
  // Overlay path (headless default): standard properties only, so the
  // system's overlay and auto-hide behavior is left alone.
  await page.goto(`${base}/motion`, { waitUntil: 'networkidle' });
  await page
    .locator('#staggered-text')
    .getByRole('tab', { name: 'Code' })
    .click();
  const overlay = await page.evaluate(() => ({
    mode: document.documentElement.dataset.lwScrollbars,
    root: getComputedStyle(document.documentElement).scrollbarColor,
    code: getComputedStyle(document.querySelector('.mgx-code')).scrollbarColor,
    thumb: getComputedStyle(
      document.documentElement,
      '::-webkit-scrollbar-thumb'
    ).backgroundColor,
    gutter: innerWidth - document.documentElement.clientWidth,
  }));
  check(
    'overlay scrollbars: colored with standard properties, still overlay',
    overlay.mode === 'overlay' &&
      overlay.root === 'rgb(22, 76, 255) rgb(225, 232, 251)' &&
      overlay.code === 'rgb(127, 155, 255) rgb(26, 39, 82)' &&
      overlay.thumb !== 'rgb(22, 76, 255)' &&
      overlay.gutter === 0,
    JSON.stringify(overlay)
  );
  await context.close();

  // Classic path: a second Chromium with always-visible scrollbars.
  const classicBrowser = await chromium.launch({
    ignoreDefaultArgs: ['--hide-scrollbars'],
  });
  const classic = await classicBrowser.newContext({
    viewport: { width: 1360, height: 900 },
  });
  const sb = await classic.newPage();
  watch(sb);
  await sb.goto(`${base}/motion`, { waitUntil: 'networkidle' });
  await sb
    .locator('#staggered-text')
    .getByRole('tab', { name: 'Code' })
    .click();
  const bars = await sb.evaluate(() => {
    const thumb = (el) =>
      getComputedStyle(el, '::-webkit-scrollbar-thumb').backgroundColor;
    const size = (el) => getComputedStyle(el, '::-webkit-scrollbar').width;
    const html = document.documentElement;
    const code = document.querySelector('.mgx-code');
    return {
      mode: html.dataset.lwScrollbars,
      root: thumb(html),
      rootRadius: getComputedStyle(html, '::-webkit-scrollbar-thumb')
        .borderTopLeftRadius,
      rootWidth: size(html),
      gutter: innerWidth - html.clientWidth,
      code: thumb(code),
      codeTrack: getComputedStyle(code, '::-webkit-scrollbar-track')
        .backgroundColor,
      codeHeight: getComputedStyle(code, '::-webkit-scrollbar').height,
    };
  });
  check(
    'document scrollbar: rounded cobalt thumb (Chromium)',
    bars.mode === 'classic' &&
      ['rgb(22, 76, 255)', 'rgb(15, 58, 214)'].includes(bars.root) &&
      bars.rootRadius !== '0px' &&
      bars.rootWidth === '14px' &&
      bars.gutter === 14,
    JSON.stringify(bars)
  );
  check(
    'code panes use the dark-track variant, both axes',
    bars.code === 'rgb(127, 155, 255)' &&
      bars.codeTrack === 'rgb(26, 39, 82)' &&
      bars.codeHeight === '14px'
  );

  // Dragging the real scrollbar thumb still scrolls the page.
  await sb.mouse.move(1360 - 7, 40);
  await sb.mouse.down();
  await sb.mouse.move(1360 - 7, 300, { steps: 5 });
  await sb.mouse.up();
  const dragged = await sb.evaluate(() => window.scrollY);
  await sb.keyboard.press('End');
  await sb.waitForTimeout(300);
  const keyed = await sb.evaluate(() => window.scrollY);
  await sb.mouse.wheel(0, -600);
  await sb.waitForTimeout(300);
  const wheeled = await sb.evaluate(() => window.scrollY);
  check(
    'scrollbar dragging, keyboard and wheel scrolling still work',
    dragged > 200 && keyed > dragged && wheeled < keyed,
    `drag:${dragged} End:${keyed} wheel:${wheeled}`
  );

  await sb.goto(`${base}/workspace?demo=1`, { waitUntil: 'networkidle' });
  await sb.getByRole('tree').waitFor();
  await sb.setViewportSize({ width: 1360, height: 420 });
  const ws = await sb.evaluate(() => {
    const thumb = (el) =>
      getComputedStyle(el, '::-webkit-scrollbar-thumb').backgroundColor;
    const left = document.querySelector('.lw-col--left');
    const right = document.querySelector('.lw-col--right');
    const render = document.querySelector('.lw-render');
    const child = render.querySelector('[data-lw-node]');
    return {
      left: thumb(left),
      right: thumb(right),
      scrolls:
        left.scrollHeight > left.clientHeight &&
        right.scrollHeight > right.clientHeight,
      gutter: left.offsetWidth - left.clientWidth,
      render: thumb(render),
      child: thumb(child),
      renderColor: getComputedStyle(render).scrollbarColor,
    };
  });
  check(
    'workspace layer tree and inspector scrollbars are styled',
    ws.left === 'rgb(22, 76, 255)' &&
      ws.right === 'rgb(22, 76, 255)' &&
      ws.scrolls &&
      ws.gutter >= 14,
    JSON.stringify(ws)
  );
  check(
    'captured component previews keep their own scrollbars',
    ws.render !== 'rgb(22, 76, 255)' &&
      ws.child !== 'rgb(22, 76, 255)' &&
      ws.renderColor === 'auto'
  );
  await sb.screenshot({ path: path.join(tmp, 'scrollbars-workspace.png') });
  await classicBrowser.close();

  // Forced colors: Layerwake's scrollbar colors step aside.
  const forced = await browser.newContext({ forcedColors: 'active' });
  const forcedPage = await forced.newPage();
  await forcedPage.goto(`${base}/motion`, { waitUntil: 'networkidle' });
  const forcedThumb = await forcedPage.evaluate(
    () =>
      getComputedStyle(document.documentElement, '::-webkit-scrollbar-thumb')
        .backgroundColor
  );
  check(
    'forced colors: custom scrollbar colors are not applied',
    forcedThumb !== 'rgb(22, 76, 255)',
    forcedThumb
  );
  await forced.close();

  /* --------------------------------------------------------- reduced motion */
  const calm = await browser.newContext({
    reducedMotion: 'reduce',
    viewport: { width: 1360, height: 900 },
  });
  const calmPage = await calm.newPage();
  watch(calmPage);
  await calmPage.goto(`${base}/motion`, { waitUntil: 'networkidle' });
  await calmPage.locator('#staggered-text .mg-stagger__word').first().waitFor();
  const still = await calmPage.evaluate(() => {
    const word = document.querySelector('.mg-stagger__word');
    const scramble = document.querySelector('.mg-scramble [aria-hidden]');
    return {
      animation: getComputedStyle(word).animationName,
      opacity: getComputedStyle(word).opacity,
      scramble: scramble?.textContent,
    };
  });
  check(
    'reduced motion: text is static and readable',
    still.animation === 'none' &&
      still.opacity === '1' &&
      still.scramble === 'SIGNAL ACQUIRED 0427',
    JSON.stringify(still)
  );
  const calmCounter = calmPage.locator('#rolling-counter');
  await calmCounter.scrollIntoViewIfNeeded();
  const calmBefore = await calmCounter
    .getByRole('img')
    .getAttribute('aria-label');
  await calmCounter.getByRole('button', { name: 'Increase' }).click();
  const calmAfter = await calmCounter
    .getByRole('img')
    .getAttribute('aria-label');
  const calmExpand = calmPage.locator('#expandable-card');
  await calmExpand.scrollIntoViewIfNeeded();
  await calmExpand.locator('.mg-expand__toggle').click();
  await calmPage.waitForTimeout(200);
  const calmOpen =
    (await calmExpand
      .locator('.mg-expand__toggle')
      .getAttribute('aria-expanded')) === 'true' &&
    (await calmExpand
      .locator('.mg-expand__body')
      .evaluate(
        (el) =>
          getComputedStyle(el.parentElement).visibility === 'visible' &&
          el.parentElement.offsetHeight > 20
      ));
  const calmToast = calmPage.locator('#toast-stack');
  await calmToast.scrollIntoViewIfNeeded();
  await calmToast.getByRole('button', { name: 'Send a notice' }).click();
  await calmToast.locator('.mg-toasts__toast').waitFor();
  await calmToast.locator('.mg-toasts__close').click();
  await calmToast
    .locator('.mg-toasts__toast')
    .waitFor({ state: 'detached', timeout: 3000 })
    .catch(() => {});
  const calmToasts = await calmToast.locator('.mg-toasts__toast').count();
  check(
    'reduced motion: components keep working',
    Number(calmAfter) === Number(calmBefore) + 1 &&
      calmOpen &&
      calmToasts === 0,
    `counter:${calmBefore}->${calmAfter} open:${calmOpen} toasts:${calmToasts}`
  );
  await calm.close();

  /* ----------------------------------------------------------------- mobile */
  const phone = await browser.newContext({
    viewport: { width: 390, height: 800 },
    hasTouch: true,
    isMobile: true,
  });
  const phonePage = await phone.newPage();
  watch(phonePage);
  await phonePage.goto(`${base}/motion`, { waitUntil: 'networkidle' });
  await phonePage.locator('#staggered-text .mg-stagger').waitFor();
  await phonePage
    .locator('#staggered-text')
    .getByRole('tab', { name: 'Code' })
    .tap();
  const mobile = await phonePage.evaluate(() => ({
    fits: document.documentElement.scrollWidth <= innerWidth,
    columns: getComputedStyle(
      document.querySelector('.mgx-grid')
    ).gridTemplateColumns.split(' ').length,
    small: [
      ...document.querySelectorAll(
        '.mgx-tabs button, .mgx-filters button, .mgx-copy'
      ),
    ].filter((b) => b.getBoundingClientRect().height < 36).length,
    codeScrolls: (() => {
      const c = document.querySelector('.mgx-code');
      return c.scrollWidth > c.clientWidth;
    })(),
  }));
  check(
    'mobile: one column, no page overflow, touch-sized controls',
    mobile.fits && mobile.columns === 1 && mobile.small === 0,
    JSON.stringify(mobile)
  );
  await phonePage.screenshot({ path: path.join(tmp, 'mobile.png') });
  for (const route of ['/', '/demo']) {
    await phonePage.goto(`${base}${route}`, { waitUntil: 'networkidle' });
    check(
      `mobile: ${route} still fits with the extra nav link`,
      await phonePage.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth
      )
    );
  }
  await phone.close();

  /* ------------------------------------- copied code, outside this project */
  const failures = [];
  const standalone = await browser.newContext({
    viewport: { width: 800, height: 600 },
  });
  for (const slug of slugs) {
    const dir = path.join(tmp, 'standalone', slug);
    await mkdir(dir, { recursive: true });
    await writeFile(path.join(dir, `${slug}.tsx`), sources[slug].component);
    await writeFile(path.join(dir, `${slug}.css`), sources[slug].css);
    await writeFile(path.join(dir, 'usage.tsx'), sources[slug].usage);
    await writeFile(
      path.join(dir, 'main.tsx'),
      "import { createRoot } from 'react-dom/client';\nimport Demo from './usage';\ncreateRoot(document.getElementById('root')!).render(<Demo />);\n"
    );
    try {
      await build({
        entryPoints: [path.join(dir, 'main.tsx')],
        outfile: path.join(dir, 'bundle.js'),
        bundle: true,
        jsx: 'automatic',
        // Only React may come from outside the copied files.
        nodePaths: [path.join(root, 'node_modules')],
        define: { 'process.env.NODE_ENV': '"production"' },
        logLevel: 'silent',
      });
    } catch (error) {
      failures.push(
        `${slug}: build failed (${error.errors?.[0]?.text ?? error.message})`
      );
      continue;
    }
    await writeFile(
      path.join(dir, 'index.html'),
      '<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="bundle.css"><body style="font-family:system-ui;padding:40px"><div id="root"></div><script src="bundle.js"></script>'
    );
    const tab = await standalone.newPage();
    const tabErrors = [];
    tab.on('pageerror', (e) => tabErrors.push(e.message));
    tab.on('console', (m) => m.type() === 'error' && tabErrors.push(m.text()));
    await tab.goto(pathToFileURL(path.join(dir, 'index.html')).href);
    await tab.waitForTimeout(250);
    const state = await tab.evaluate(() => {
      const el = document.querySelector('#root [class*="mg-"]');
      const box = el?.getBoundingClientRect();
      const root = document.getElementById('root').getBoundingClientRect();
      return {
        found: !!el,
        visible: root.width > 0 && root.height > 0,
        sheets: document.styleSheets.length,
      };
    });
    if (!state.found || !state.visible || tabErrors.length)
      failures.push(`${slug}: ${JSON.stringify(state)} ${tabErrors[0] ?? ''}`);
    await tab.close();
  }
  await standalone.close();
  check(
    'all 24 copied examples build and run outside Layerwake with only React',
    failures.length === 0,
    failures.join(' | ')
  );
  check(
    'no console or page errors',
    errors.length === 0,
    errors.slice(0, 3).join(' | ')
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
