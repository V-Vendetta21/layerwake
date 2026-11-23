// Browser check of the site-wide theme switch: the circular reveal, saved
// choice, first paint, tab sync, fallbacks, and that nothing the visitor has
// done is lost when the theme changes.
//
//   npm run build
//   npm run verify:theme            (serves ./out itself)
//   npm run verify:theme -- http://localhost:3000
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
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

const KEY = 'layerwake.theme';
const served = process.argv[2] ? null : await serveOut();
const base = process.argv[2] ?? served.base;
const tmp = await mkdtemp(path.join(os.tmpdir(), 'layerwake-theme-'));
const browser = await chromium.launch();
const errors = [];

const DESKTOP = { width: 1280, height: 800 };
const PHONE = { width: 390, height: 844 };

async function open(contextOptions = {}, init) {
  const context = await browser.newContext({
    viewport: DESKTOP,
    acceptDownloads: true,
    ...contextOptions,
  });
  if (init) await context.addInitScript(init);
  return context;
}
async function visit(context, route) {
  const page = await context.newPage();
  page.on('pageerror', (e) => errors.push(`${route}: ${e.message}`));
  page.on(
    'console',
    (m) => m.type() === 'error' && errors.push(`${route}: ${m.text()}`)
  );
  await page.goto(base + route, { waitUntil: 'networkidle' });
  return page;
}

const toggle = (page) =>
  page.getByRole('button', { name: /^Switch to (light|dark) theme$/ });
const state = (page) =>
  page.evaluate((key) => {
    const meta = document.querySelector('meta[name="theme-color"]');
    let saved = null;
    try {
      saved = localStorage.getItem(key);
    } catch {}
    const button = document.querySelector('.lw-theme-toggle');
    return {
      theme: document.documentElement.dataset.theme,
      saved,
      meta: meta?.getAttribute('content'),
      label: button?.getAttribute('aria-label'),
      bg: getComputedStyle(document.querySelector('.lw-app')).backgroundColor,
      styles: [...document.head.querySelectorAll('style')].filter((s) =>
        s.textContent.includes('view-transition')
      ).length,
      running: document
        .getAnimations()
        .filter((a) => a.effect?.pseudoElement?.startsWith('::view-transition'))
        .length,
    };
  }, KEY);
const settle = (page) =>
  page.waitForFunction(
    () =>
      !document
        .getAnimations()
        .some((a) =>
          a.effect?.pseudoElement?.startsWith('::view-transition')
        ) &&
      ![...document.head.querySelectorAll('style')].some((s) =>
        s.textContent.includes('view-transition')
      ),
    null,
    { timeout: 5000 }
  );

/** Reads the circle from the running view transition. */
async function readCircle(page) {
  return page
    .waitForFunction(
      () => {
        const a = document
          .getAnimations()
          .find(
            (x) => x.effect?.pseudoElement === '::view-transition-new(root)'
          );
        return a ? a.effect.getKeyframes().map((k) => k.clipPath) : null;
      },
      null,
      { timeout: 3000, polling: 10 }
    )
    .then((h) => h.jsonValue());
}
const parseCircle = (text) => {
  const m = /circle\(([\d.]+)px at ([\d.]+)px ([\d.]+)px\)/.exec(text);
  return m ? { r: +m[1], x: +m[2], y: +m[3] } : null;
};

/** The circle must start at the button and reach the farthest corner. */
async function checkReveal(page, label, from) {
  const button = toggle(page);
  const box = await button.boundingBox();
  const view = await page.evaluate(() => ({
    w: window.innerWidth,
    h: window.innerHeight,
  }));
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const farthest = Math.hypot(
    Math.max(cx, view.w - cx),
    Math.max(cy, view.h - cy)
  );
  await button.click();
  const [start, end] = (await readCircle(page)).map(parseCircle);
  check(
    `${label}: circle starts at the button`,
    start &&
      start.r === 0 &&
      Math.abs(start.x - cx) < 1.5 &&
      Math.abs(start.y - cy) < 1.5,
    JSON.stringify({ start, cx, cy })
  );
  check(
    `${label}: circle reaches the farthest corner`,
    end && end.r >= farthest && end.r <= farthest + 3,
    `${end?.r} vs ${farthest.toFixed(1)}`
  );
  await settle(page);
  const s = await state(page);
  check(
    `${label}: ends in ${from === 'dark' ? 'light' : 'dark'}, in sync`,
    s.theme === (from === 'dark' ? 'light' : 'dark') &&
      s.saved === s.theme &&
      s.label ===
        (s.theme === 'dark'
          ? 'Switch to light theme'
          : 'Switch to dark theme') &&
      s.meta === (s.theme === 'dark' ? '#080808' : '#f5f5f5') &&
      s.styles === 0 &&
      s.running === 0,
    JSON.stringify(s)
  );
}

try {
  /* ---------------------------------------------------------- first visit */
  {
    const context = await open();
    const page = await visit(context, '/');
    const s = await state(page);
    check(
      'first visit is dark, with the dark browser color',
      s.theme === 'dark' &&
        s.meta === '#080808' &&
        s.bg === 'rgb(8, 8, 8)' &&
        s.saved === null,
      JSON.stringify(s)
    );
    check(
      'the button is named for its action and shows the sun',
      s.label === 'Switch to light theme' &&
        (await toggle(page).locator('circle').count()) === 1
    );
    check(
      'nothing is saved until the visitor chooses',
      (await page.evaluate((k) => localStorage.getItem(k), KEY)) === null
    );
    await context.close();
  }

  /* ------------------------------------------- reveal geometry, both ways */
  {
    const context = await open();
    const page = await visit(context, '/');
    await checkReveal(page, 'desktop home', 'dark');
    await checkReveal(page, 'desktop home', 'light');
    await context.close();
  }
  {
    const context = await open();
    const page = await visit(context, '/motion');
    await page.mouse.wheel(0, 1400);
    await page.waitForFunction(() => window.scrollY > 800);
    check(
      'the header stays in view after scrolling',
      await toggle(page).isVisible()
    );
    await checkReveal(page, 'desktop gallery, scrolled', 'dark');
    await context.close();
  }
  {
    const context = await open({
      viewport: PHONE,
      hasTouch: true,
      isMobile: true,
      deviceScaleFactor: 2,
    });
    const page = await visit(context, '/');
    const box = await toggle(page).boundingBox();
    check(
      'touch target is at least 44px',
      box.width >= 44 && box.height >= 44,
      `${box.width}x${box.height}`
    );
    await page.evaluate(() => window.scrollTo(0, 600));
    await checkReveal(page, 'phone home, scrolled', 'dark');
    await page.screenshot({ path: path.join(tmp, 'phone-light.png') });
    await checkReveal(page, 'phone home, scrolled', 'light');
    await context.close();
  }
  {
    const context = await open({
      viewport: PHONE,
      hasTouch: true,
      isMobile: true,
    });
    const page = await visit(context, '/workspace?demo=1');
    // On a phone the layers sit behind a tab, so wait for the preview.
    await page.locator('.lw-render').waitFor();
    const box = await toggle(page).boundingBox();
    check(
      'phone workspace toolbar fits the button without overflow',
      box.x >= 0 &&
        box.x + box.width <= PHONE.width &&
        (await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth
        )),
      JSON.stringify(box)
    );
    await checkReveal(page, 'phone workspace', 'dark');
    await context.close();
  }

  /* ------------------------------- persistence, first paint, route changes */
  {
    const context = await open({}, () => {
      // Record the theme at the moment the body starts to parse.
      new MutationObserver(() => {
        if (document.body && window.__atBody === undefined)
          window.__atBody = document.documentElement.dataset.theme;
      }).observe(document, { childList: true, subtree: true });
    });
    const first = await visit(context, '/');
    await toggle(first).click();
    await settle(first);
    for (const route of ['/', '/motion', '/demo', '/workspace']) {
      const page = await context.newPage();
      await page.goto(base + route, { waitUntil: 'networkidle' });
      const early = await page.evaluate(() => window.__atBody);
      const s = await state(page);
      check(
        `${route} opens light, set before the page paints`,
        early === 'light' &&
          s.theme === 'light' &&
          s.bg === 'rgb(245, 245, 245)' &&
          s.meta === '#f5f5f5',
        `${early} ${JSON.stringify(s)}`
      );
      check(
        `${route} button says Switch to dark theme`,
        s.label === 'Switch to dark theme'
      );
      await page.close();
    }

    // Client-side navigation keeps the theme and the same document.
    const page = await visit(context, '/');
    await page.evaluate(() => (window.__same = true));
    await page.getByRole('link', { name: 'Motion Gallery' }).first().click();
    await page.waitForURL('**/motion');
    await page.getByRole('link', { name: 'Workspace' }).first().click();
    await page.waitForURL('**/workspace');
    const s = await state(page);
    check(
      'navigating between routes keeps one theme and one document',
      s.theme === 'light' &&
        (await page.evaluate(() => window.__same === true)),
      JSON.stringify(s)
    );

    // Another open tab follows.
    const a = await visit(context, '/motion');
    const b = await visit(context, '/demo');
    await toggle(a).click();
    await settle(a);
    await b
      .waitForFunction(
        () => document.documentElement.dataset.theme === 'dark',
        null,
        { timeout: 4000 }
      )
      .catch(() => {});
    const bs = await state(b);
    check(
      'a choice in one tab reaches another',
      bs.theme === 'dark' &&
        bs.label === 'Switch to light theme' &&
        bs.meta === '#080808',
      JSON.stringify(bs)
    );
    await context.close();
  }

  /* ----------------------------------------------- keyboard and focus */
  {
    const context = await open();
    const page = await visit(context, '/motion');
    await page.getByRole('button', { name: 'Navigation and overlays' }).click();
    await page.getByRole('searchbox').fill('a');
    await page.mouse.wheel(0, 700);
    await page.waitForFunction(() => window.scrollY > 400);
    await page.evaluate(() => {
      window.__node = document.querySelector('.mgx-entry');
      window.__scroll = window.scrollY;
    });
    const filterBefore = await page
      .getByRole('button', { name: 'Navigation and overlays' })
      .getAttribute('aria-pressed');
    const countBefore = await page.locator('.mgx-count').innerText();
    await toggle(page).focus();
    await page.keyboard.press('Enter');
    await settle(page);
    const after = await page.evaluate(() => ({
      same: window.__node === document.querySelector('.mgx-entry'),
      scrollMoved: Math.abs(window.scrollY - window.__scroll),
      focused: document.activeElement?.classList.contains('lw-theme-toggle'),
      hash: location.pathname,
    }));
    check(
      'Enter switches theme and keeps focus on the button',
      after.focused === true && (await state(page)).theme === 'light'
    );
    check(
      'scroll, route, filters and search survive the switch',
      after.scrollMoved <= 1 &&
        after.hash === '/motion' &&
        filterBefore === 'true' &&
        (await page
          .getByRole('button', { name: 'Navigation and overlays' })
          .getAttribute('aria-pressed')) === 'true' &&
        (await page.getByRole('searchbox').inputValue()) === 'a' &&
        (await page.locator('.mgx-count').innerText()) === countBefore
    );
    check('the page is not remounted', after.same === true);
    await page.keyboard.press('Space');
    await settle(page);
    check('Space switches back', (await state(page)).theme === 'dark');
    await context.close();
  }

  /* ------------------------------------ fallbacks and rapid activation */
  {
    // Reduced motion: no view transition at all.
    const context = await open({ reducedMotion: 'reduce' }, () => {
      window.__vt = 0;
      const original = document.startViewTransition?.bind(document);
      if (original)
        document.startViewTransition = (cb) => {
          window.__vt++;
          return original(cb);
        };
    });
    const page = await visit(context, '/');
    await toggle(page).click();
    await settle(page);
    const s = await state(page);
    check(
      'reduced motion switches at once, without a transition',
      s.theme === 'light' && (await page.evaluate(() => window.__vt)) === 0,
      JSON.stringify(s)
    );
    await context.close();
  }
  {
    // No View Transitions API.
    const context = await open({}, () => {
      Object.defineProperty(Document.prototype, 'startViewTransition', {
        value: undefined,
        configurable: true,
      });
    });
    const page = await visit(context, '/');
    await toggle(page).click();
    await settle(page);
    const s = await state(page);
    check(
      'without the View Transitions API the theme still switches',
      s.theme === 'light' && s.saved === 'light' && s.styles === 0,
      JSON.stringify(s)
    );
    await context.close();
  }
  {
    // Storage that throws.
    const context = await open({}, () => {
      const block = () => {
        throw new DOMException('blocked', 'SecurityError');
      };
      Object.defineProperty(window, 'localStorage', { get: block });
    });
    const page = await visit(context, '/');
    const before = await state(page);
    await toggle(page).click();
    await settle(page);
    const s = await state(page);
    check(
      'with storage blocked the switch works for the session',
      before.theme === 'dark' &&
        s.theme === 'light' &&
        s.label === 'Switch to dark theme',
      JSON.stringify(s)
    );
    await page.getByRole('link', { name: 'Demo page' }).first().click();
    await page.waitForURL('**/demo');
    check(
      'and the theme holds while navigating',
      (await state(page)).theme === 'light'
    );
    await context.close();
  }
  for (const [name, stub] of [
    [
      'a transition that fails',
      () => {
        document.startViewTransition = (cb) => {
          Promise.resolve().then(cb);
          const failed = Promise.reject(new Error('boom'));
          failed.catch(() => {});
          return { ready: failed, finished: failed, skipTransition() {} };
        };
      },
    ],
    [
      'a transition that never runs the update',
      () => {
        document.startViewTransition = () => {
          const failed = Promise.reject(new Error('skipped'));
          failed.catch(() => {});
          return { ready: failed, finished: failed, skipTransition() {} };
        };
      },
    ],
    [
      'a transition that throws',
      () => {
        document.startViewTransition = () => {
          throw new Error('unsupported');
        };
      },
    ],
  ]) {
    const context = await open({}, stub);
    const page = await visit(context, '/');
    await toggle(page).click();
    await page
      .waitForFunction(
        () => document.documentElement.dataset.theme === 'light',
        null,
        { timeout: 4000 }
      )
      .catch(() => {});
    const s = await state(page);
    check(
      `recovers to a usable theme after ${name}`,
      s.theme === 'light' &&
        s.saved === 'light' &&
        s.styles === 0 &&
        s.label === 'Switch to dark theme',
      JSON.stringify(s)
    );
    await context.close();
  }
  {
    const context = await open();
    const page = await visit(context, '/');
    const button = toggle(page);
    for (let i = 0; i < 5; i++) await button.click({ noWaitAfter: true });
    await page.waitForTimeout(300);
    await settle(page);
    await page.waitForTimeout(200);
    let s = await state(page);
    check(
      'five rapid clicks end on the fifth click’s theme, all in sync',
      s.theme === 'light' &&
        s.saved === 'light' &&
        s.label === 'Switch to dark theme' &&
        s.meta === '#f5f5f5' &&
        s.running === 0,
      JSON.stringify(s)
    );
    for (let i = 0; i < 2; i++) await button.click({ noWaitAfter: true });
    await page.waitForTimeout(300);
    await settle(page);
    await page.waitForTimeout(200);
    s = await state(page);
    check(
      'two rapid clicks cancel out',
      s.theme === 'light' && s.saved === 'light' && s.styles === 0,
      JSON.stringify(s)
    );
    await context.close();
  }

  /* ------------------------------ edits and exports survive a switch */
  {
    const context = await open();
    const page = await visit(context, '/workspace');
    const capture = path.join(root, 'lib/layerwake/demo-capture.json');
    await page.locator('input[type=file]').setInputFiles(capture);
    const tree = page.getByRole('tree');
    await tree.waitFor();
    await tree.getByRole('treeitem').first().click();
    await page
      .getByRole('spinbutton', { name: 'Corner radius in pixels' })
      .fill('6');
    await tree.getByRole('treeitem', { name: /action/ }).click();
    await page.getByRole('textbox', { name: 'Fill hex value' }).fill('#dce9f7');
    await tree.getByRole('treeitem', { name: /headline/ }).click();

    const preview = page.locator('.lw-render');
    const snapshot = () =>
      page.evaluate(() => {
        const nodes = document.querySelectorAll('.lw-render [data-lw-node]');
        return {
          radius: getComputedStyle(nodes[0]).borderTopLeftRadius,
          colors: [...nodes].map((n) => {
            const cs = getComputedStyle(n);
            return `${cs.backgroundColor}|${cs.color}|${cs.borderTopColor}`;
          }),
          selected: document.querySelector(
            '[role=treeitem][aria-selected=true]'
          )?.textContent,
          reset: document.body.innerText.match(/Reset changes \((\d+)\)/)?.[1],
        };
      });
    const exportHtml = async (name) => {
      await page.getByRole('tab', { name: 'Export' }).first().click();
      const [download] = await Promise.all([
        page.waitForEvent('download'),
        page.getByRole('button', { name: 'Download HTML/CSS' }).click(),
      ]);
      const file = path.join(tmp, name);
      await download.saveAs(file);
      await page.getByRole('tab', { name: 'Preview' }).first().click();
      return file;
    };
    const before = await snapshot();
    const darkFile = await exportHtml('before.html');
    await toggle(page).click();
    await settle(page);
    const after = await snapshot();
    check(
      'edits, selected layer and imported colors are unchanged by a theme switch',
      JSON.stringify(before) === JSON.stringify(after) &&
        before.radius === '6px' &&
        before.reset === '2',
      JSON.stringify({ before, after })
    );
    const lightFile = await exportHtml('after.html');
    check(
      'the export is identical before and after the switch',
      (await readFile(darkFile, 'utf8')) === (await readFile(lightFile, 'utf8'))
    );
    const standalone = await context.newPage();
    await standalone.goto(pathToFileURL(lightFile).href);
    const exported = await standalone.evaluate(() => {
      const card = document.querySelector('[class$="__action"], button');
      return {
        radius: getComputedStyle(
          document.body.firstElementChild ?? document.body
        ).borderTopLeftRadius,
        bg: getComputedStyle(card).backgroundColor,
      };
    });
    check(
      'the exported component keeps its edited colors',
      exported.bg === 'rgb(220, 233, 247)',
      JSON.stringify(exported)
    );
    await page.screenshot({ path: path.join(tmp, 'workspace-light.png') });
    await context.close();
  }

  /* --------------------------------------------- the starred gallery entry */
  for (const theme of ['dark', 'light']) {
    const context = await open();
    await context.addInitScript(
      `try{localStorage.setItem(${JSON.stringify(KEY)},${JSON.stringify(theme)})}catch(e){}`
    );
    const page = await visit(context, '/motion#theme-transition-panel');
    const entry = page.locator('#theme-transition-panel');
    await entry.scrollIntoViewIfNeeded();
    const badge = entry.getByText('Used in this site', { exact: true });
    check(
      `${theme}: the starred entry says exactly “Used in this site”`,
      (await badge.count()) === 1 &&
        (await badge.locator('svg').count()) === 1 &&
        (await badge.locator('svg').getAttribute('aria-hidden')) === 'true'
    );
    const description = await badge.getAttribute('title');
    const describedBy = await badge.getAttribute('aria-describedby');
    check(
      `${theme}: the badge explains itself`,
      description === "Powers Layerwake's site-wide theme switcher." &&
        (await page.locator(`[id="${describedBy}"]`).innerText()) ===
          description
    );
    check(
      `${theme}: only that component carries the star`,
      (await page.getByText('Used in this site', { exact: true }).count()) === 1
    );
    const contrast = await badge.evaluate((el) => {
      const lum = (c) => {
        const [r, g, b] = c
          .match(/[\d.]+/g)
          .map(Number)
          .map((v) => {
            v /= 255;
            return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
          });
        return 0.2126 * r + 0.7152 * g + 0.0722 * b;
      };
      let bg = el;
      while (bg && getComputedStyle(bg).backgroundColor === 'rgba(0, 0, 0, 0)')
        bg = bg.parentElement;
      const a = lum(getComputedStyle(el).color);
      const b = lum(getComputedStyle(bg).backgroundColor);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    check(
      `${theme}: the label is shown as written, not capitalised`,
      (await badge.evaluate((el) => getComputedStyle(el).textTransform)) ===
        'none'
    );
    check(
      `${theme}: the badge is readable`,
      contrast >= 4.5,
      contrast.toFixed(1)
    );
    await entry.screenshot({
      path: path.join(tmp, `gallery-entry-${theme}.png`),
    });

    // The panel demo is local: it flips on its own and leaves the site alone.
    const panel = entry.locator('.mg-theme');
    const layer = () =>
      panel.locator('.mg-theme__layer').first().getAttribute('data-theme');
    const before = await layer();
    await panel.getByRole('button', { name: 'Dark theme' }).click();
    await page.waitForFunction(
      (b) =>
        document
          .querySelector('#theme-transition-panel .mg-theme__layer')
          ?.getAttribute('data-theme') !== b,
      before
    );
    check(
      `${theme}: the standalone panel runs its own transition`,
      (await layer()) !== before && (await state(page)).theme === theme
    );
    await entry.getByRole('button', { name: /^Reset / }).click();
    check(
      `${theme}: Reset returns the panel to its start`,
      (await layer()) === before
    );
    await context.close();
  }
  {
    const context = await open();
    const page = await visit(context, '/motion');
    check(
      'the gallery still lists exactly 100 components',
      (await page.locator('.mgx-entry').count()) === 100 &&
        /Showing 100 of 100/.test(await page.locator('.mgx-count').innerText())
    );
    await page.getByRole('searchbox').fill('dark mode');
    check(
      'the entry is still found by search',
      (await page.locator('#theme-transition-panel').count()) === 1 &&
        (
          await page.locator('#theme-transition-panel h2').innerText()
        ).startsWith('Theme Transition Panel')
    );
    const entry = page.locator('#theme-transition-panel');
    await entry.getByRole('tab', { name: 'Code' }).click();
    const names = await entry.locator('.mgx-file__name').allInnerTexts();
    const copies = await entry.locator('.mgx-copy').allInnerTexts();
    check(
      'Code lists the standalone usage, the site usage and every file it needs',
      [
        'usage.tsx',
        'usage-site.tsx',
        'theme-transition-panel.tsx',
        'theme-transition-panel.css',
        'site-theme-toggle.tsx',
        'site-theme.ts',
        'site-theme-script.ts',
        'theme-icons.tsx',
        'circle-reveal.ts',
      ].every((n) => names.includes(n)) &&
        copies.some((c) => /Copy site usage/.test(c)),
      names.join(', ')
    );
    check(
      'the steps count only the files to copy, not the example',
      /all 8 files/.test(await entry.locator('.mgx-steps').innerText()),
      (await entry.locator('.mgx-steps li').nth(1).innerText()).slice(0, 80)
    );
    await context.close();
  }

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
