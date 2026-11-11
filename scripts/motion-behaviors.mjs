// One focused browser check per gallery component added after the first 24:
// trigger the demo's primary interaction and look for its visible result.
// Used by scripts/motion-e2e.mjs.

export function helpers(page, check) {
  const card = async (slug) => {
    const c = page.locator(`#${slug}`);
    await c.scrollIntoViewIfNeeded();
    await c
      .locator('.mgx-stage > :not(.mgx-loading)')
      .first()
      .waitFor({ state: 'attached', timeout: 6000 });
    return c;
  };
  const run = async (slug, name, fn) => {
    try {
      const result = await fn(await card(slug));
      const [ok, detail] = Array.isArray(result) ? result : [result, ''];
      check(`${slug}: ${name}`, Boolean(ok), detail ?? '');
    } catch (error) {
      check(`${slug}: ${name}`, false, String(error.message).split('\n')[0]);
    }
  };
  const drag = async (locator, dx, dy, { steps = 10, hold = 0 } = {}) => {
    const box = await locator.boundingBox();
    const x = box.x + box.width / 2;
    const y = box.y + box.height / 2;
    await page.mouse.move(x, y);
    await page.mouse.down();
    if (hold) await page.waitForTimeout(hold);
    await page.mouse.move(x + dx, y + dy, { steps });
    await page.mouse.up();
  };
  const focused = () =>
    page.evaluate(() => document.activeElement?.textContent?.trim() ?? '');
  const wait = (ms) => page.waitForTimeout(ms);
  return { card, run, drag, focused, wait };
}

export async function checkpointOne(page, check) {
  const { run, drag, focused, wait } = helpers(page, check);

  await run(
    'masked-line-reveal',
    'lines re-split when the text narrows',
    async (c) => {
      await wait(300);
      const wide = await c.locator('.mg-lines__mask').count();
      await c.getByRole('slider').focus();
      await page.keyboard.press('Home');
      await wait(300);
      const narrow = await c.locator('.mg-lines__mask').count();
      const text = await c.locator('.mg-lines__sr').innerText();
      return [
        wide >= 2 && narrow > wide && text.startsWith('Charts are drawn'),
        `${wide} → ${narrow} lines`,
      ];
    }
  );

  await run(
    'variable-weight-ramp',
    'sweeps, pauses to a static ramp',
    async (c) => {
      const root = c.locator('.mg-weight');
      const playing = await root.getAttribute('data-playing');
      await c.getByRole('button', { name: 'Pause' }).click();
      const weights = await c
        .locator('.mg-weight__letter')
        .evaluateAll((els) =>
          els.map((e) => Number(getComputedStyle(e).fontWeight))
        );
      return [
        playing === 'true' &&
          (await root.getAttribute('data-playing')) === 'false' &&
          weights[0] < weights.at(-1),
        `weights ${weights[0]} → ${weights.at(-1)}`,
      ];
    }
  );

  await run(
    'glitch-split-text',
    'one accessible heading; replay restarts layers',
    async (c) => {
      const heading = await c
        .getByRole('heading', { name: 'Signal found', exact: true })
        .count();
      await c
        .locator('.mg-glitch__layer')
        .first()
        .evaluate((el) => (el.dataset.mark = '1'));
      await c.getByRole('button', { name: 'Glitch again' }).click();
      return (
        heading === 1 &&
        (await c.locator('.mg-glitch__layer[data-mark]').count()) === 0
      );
    }
  );

  await run(
    'gradient-sweep-text',
    'pause and direction controls work',
    async (c) => {
      const root = c.locator('.mg-sweeptext');
      const before = await root.getAttribute('data-playing');
      await c.getByRole('button', { name: /Direction/ }).click();
      await c.getByRole('button', { name: 'Pause' }).click();
      return (
        before === 'true' &&
        (await root.getAttribute('data-playing')) === 'false' &&
        (await root.getAttribute('data-direction')) === 'left'
      );
    }
  );

  await run(
    'per-word-emphasis',
    'Next moves the highlight to the next word',
    async (c) => {
      await c.getByRole('button', { name: 'Next word' }).click();
      const status = await c.getByRole('status').innerText();
      const active = await c.locator('[data-active="true"]').innerText();
      return [status.includes('Word 2 of 9') && active === 'the', status];
    }
  );

  await run(
    'text-marquee',
    'one readable list; Pause stops the track',
    async (c) => {
      const items = await c
        .getByRole('list', { name: 'Ports of call' })
        .getByRole('listitem')
        .count();
      const state = () =>
        c
          .locator('.mg-marquee__track')
          .evaluate((el) => el.getAnimations()[0]?.playState);
      const before = await state();
      await c.getByRole('button', { name: 'Pause' }).click();
      await wait(100);
      return [
        items === 7 && before === 'running' && (await state()) === 'paused',
        `${items} items, ${before}`,
      ];
    }
  );

  await run(
    'pointer-tilt-card',
    'tilts toward the pointer; button demonstrates',
    async (c) => {
      const hit = c.locator('.mg-tilt');
      const box = await hit.boundingBox();
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.move(box.x + 14, box.y + 12);
      const rx = await c
        .locator('.mg-tilt__card')
        .evaluate((el) => el.style.getPropertyValue('--mg-rx'));
      await page.mouse.move(0, 0);
      await c.getByRole('button', { name: 'Demonstrate tilt' }).click();
      await wait(200);
      const demo = await c
        .locator('.mg-tilt__card')
        .getAttribute('data-tracking');
      await c.getByRole('button', { name: 'Stop demonstration' }).click();
      return [parseFloat(rx) > 3 && demo === 'true', `rx ${rx}`];
    }
  );

  await run(
    'image-shutter-reveal',
    'opens over a described image; replays',
    async (c) => {
      const img = await c.getByRole('img', { name: /sailboat/ }).count();
      await wait(1600);
      const open = await c
        .locator('.mg-shutter__slat')
        .last()
        .evaluate((el) => getComputedStyle(el).transform);
      await c.getByRole('button', { name: 'Close and reopen' }).click();
      await wait(60);
      const closed = await c
        .locator('.mg-shutter__slat')
        .last()
        .evaluate((el) => getComputedStyle(el).transform);
      return [
        img === 1 && open.startsWith('matrix(0,') && closed !== open,
        `${open} / ${closed}`,
      ];
    }
  );

  await run(
    'before-after-wipe',
    'arrow keys move the divider and its value',
    async (c) => {
      const range = c.getByRole('slider');
      await range.focus();
      await page.keyboard.press('Home');
      await page.keyboard.press('ArrowRight');
      const text = await range.getAttribute('aria-valuetext');
      const split = await c
        .locator('.mg-wipe')
        .evaluate((el) => el.style.getPropertyValue('--mg-split'));
      return [text === '99% night, 1% noon' && split === '1%', text];
    }
  );

  await run(
    'image-focus-lens',
    'Enter shows the lens; arrows move it',
    async (c) => {
      const stage = c.locator('.mg-lens');
      await stage.focus();
      await page.keyboard.press('Enter');
      const glass = c.locator('.mg-lens__glass');
      const a = await glass.evaluate((el) => el.style.transform);
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowRight');
      const b = await glass.evaluate((el) => el.style.transform);
      return [a !== b, `${a} → ${b}`];
    }
  );

  await run(
    'peel-corner-card',
    'the corner toggles and keeps the label readable',
    async (c) => {
      await c.getByRole('button', { name: /Peel back/ }).click();
      return (
        (await c
          .getByRole('button', { name: /Peel back/ })
          .getAttribute('aria-expanded')) === 'true' &&
        (await c.locator('.mg-peel').getAttribute('data-open')) === 'true' &&
        (await c.locator('.mg-peel__under').innerText()).includes('Members')
      );
    }
  );

  await run(
    'flip-card',
    'flips, moves focus to the back, makes the front inert',
    async (c) => {
      await c.getByRole('button', { name: /Show tide times/ }).click();
      await wait(50);
      const now = await focused();
      const inert = await c
        .locator('.mg-flip__face')
        .first()
        .evaluate((el) => el.hasAttribute('inert'));
      return [
        (await c.locator('.mg-flip').getAttribute('data-flipped')) === 'true' &&
          now.includes('Show summary') &&
          inert,
        now,
      ];
    }
  );

  await run(
    'hold-to-confirm',
    'a short press cancels; a full hold and the two-tap path confirm',
    async (c) => {
      const button = c.locator('.mg-hold__button');
      const box = await button.boundingBox();
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await wait(250);
      await page.mouse.up();
      await wait(300);
      const early = await c.locator('.mg-hold').getAttribute('data-phase');
      await page.mouse.down();
      await wait(1500);
      await page.mouse.up();
      const held = await button.innerText();
      await c.getByRole('button', { name: 'Reset', exact: true }).click();
      await c.getByRole('button', { name: 'Confirm without holding' }).click();
      await c.getByRole('button', { name: 'Tap again to confirm' }).click();
      const twoTap = await c.locator('.mg-hold').getAttribute('data-phase');
      return [
        early === 'idle' && held.includes('Route deleted') && twoTap === 'done',
        `${early} / ${held} / ${twoTap}`,
      ];
    }
  );

  await run(
    'drag-to-confirm',
    'short drag snaps back; full drag and End confirm',
    async (c) => {
      const thumb = c.getByRole('slider');
      await drag(thumb, 40, 0);
      await wait(400);
      const short = await thumb.getAttribute('aria-valuenow');
      await drag(thumb, 320, 0, { steps: 16 });
      await wait(100);
      const dragged = await c.locator('.mg-dragok').getAttribute('data-done');
      await c.getByRole('button', { name: 'Reset', exact: true }).click();
      await thumb.focus();
      await page.keyboard.press('End');
      const keyed = await c.locator('.mg-dragok').getAttribute('data-done');
      return [
        short === '0' && dragged === 'true' && keyed === 'true',
        `${short} ${dragged} ${keyed}`,
      ];
    }
  );

  await run(
    'toggle-icon-morph',
    'keeps its name and reports expanded state',
    async (c) => {
      const button = c.getByRole('button', { name: 'Add waypoint' });
      const size = await button.boundingBox();
      await button.click();
      const after = await button.boundingBox();
      return (
        (await button.getAttribute('aria-expanded')) === 'true' &&
        (await c.locator('#waypoint-form').isVisible()) &&
        size.width === after.width
      );
    }
  );

  await run(
    'animated-checkbox',
    'one child makes the parent mixed; parent checks all',
    async (c) => {
      await c.getByLabel('Navigator').check();
      const parent = c.getByLabel(/All crew/);
      const mixed = await parent.evaluate((el) => el.indeterminate);
      await parent.check();
      const all = await c.locator('input:checked').count();
      return [mixed && all === 4, `mixed ${mixed}, checked ${all}`];
    }
  );

  await run(
    'copy-confirmation-button',
    'confirms a real copy and shows a failure',
    async (c) => {
      const button = c.locator('.mg-copyok__button');
      await button.click();
      await wait(150);
      const ok = await button.innerText();
      const clip = await page
        .evaluate(() => navigator.clipboard.readText())
        .catch(() => '');
      await c.getByLabel('Simulate a blocked clipboard').check();
      await button.click();
      await wait(150);
      const fail = await button.innerText();
      return [
        ok.includes('Copied') &&
          clip === 'BERTH-B14' &&
          fail.includes('Copy failed'),
        `${ok} / ${fail}`,
      ];
    }
  );

  await run(
    'split-action-button',
    'menu keys, choice, Escape and focus return',
    async (c) => {
      const caret = c.getByRole('button', { name: 'More save options' });
      await caret.click();
      const first = await focused();
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      const status = await c.getByRole('status').innerText();
      const back = await caret.evaluate((el) => el === document.activeElement);
      await caret.click();
      await page.keyboard.press('Escape');
      const closed = await c
        .getByRole('menu', { includeHidden: true })
        .isHidden();
      return [
        first === 'Save as draft' &&
          status.includes('shared') &&
          back &&
          closed,
        `${first} / ${status}`,
      ];
    }
  );

  await run(
    'breadcrumb-collapse',
    'collapses into a menu and expands with room',
    async (c) => {
      const more = c.getByRole('button', { name: /hidden level/ });
      const collapsed = await more.count();
      await more.click();
      const items = await c.getByRole('menuitem').count();
      await page.keyboard.press('Escape');
      const back = await more.evaluate((el) => el === document.activeElement);
      await c.getByRole('slider').focus();
      await page.keyboard.press('End');
      await wait(300);
      const crumbs = await c.locator('.mg-crumbs__list > li').count();
      return [
        collapsed === 1 &&
          items >= 1 &&
          back &&
          (await more.count()) === 0 &&
          crumbs === 5,
        `menu ${items}, crumbs ${crumbs}`,
      ];
    }
  );

  await run(
    'expanding-search-field',
    'opens with focus, filters, Escape restores focus',
    async (c) => {
      await c.getByRole('button', { name: 'Search harbors' }).click();
      const tag = await page.evaluate(() => document.activeElement?.tagName);
      await page.keyboard.type('br');
      const hits = await c.locator('#harbor-results li').count();
      await page.keyboard.press('Escape');
      const back = await c
        .getByRole('button', { name: 'Search harbors' })
        .evaluate((el) => el === document.activeElement);
      return [tag === 'INPUT' && hits === 1 && back, `${tag} ${hits} ${back}`];
    }
  );

  await run(
    'command-palette',
    'shortcut opens; Enter runs; focus returns',
    async (c) => {
      const open = c.getByRole('button', { name: /Open command palette/ });
      await open.click();
      await page.keyboard.type('log');
      await page.keyboard.press('Enter');
      const status = await c.getByRole('status').innerText();
      const back = await open.evaluate((el) => el === document.activeElement);
      await page.keyboard.press('Control+k');
      const viaKey = await page.locator('dialog.mg-cmdk[open]').count();
      await page.keyboard.press('Escape');
      const closed = await page.locator('dialog.mg-cmdk[open]').count();
      return [
        status === 'Ran: Open the logbook' &&
          back &&
          viaKey === 1 &&
          closed === 0,
        status,
      ];
    }
  );

  await run(
    'reading-progress-rail',
    'section jump scrolls only the article',
    async (c) => {
      const y = await page.evaluate(() => scrollY);
      await c.getByRole('button', { name: 'Return' }).click();
      await wait(900);
      const current = await c.locator('[aria-current="location"]').innerText();
      const pct = await c.locator('.mg-read__pct').innerText();
      return [
        current === 'Return' &&
          pct === '100% read' &&
          (await page.evaluate(() => scrollY)) === y,
        `${current} ${pct}`,
      ];
    }
  );

  await run(
    'sliding-pagination',
    'pages slide in the direction of travel',
    async (c) => {
      await c.getByRole('button', { name: 'Next page' }).click();
      const fwd = await c
        .locator('.mg-pages__list')
        .getAttribute('data-direction');
      const status = await c.getByRole('status').innerText();
      await c.getByRole('button', { name: 'Page 1', exact: true }).click();
      const back = await c
        .locator('.mg-pages__list')
        .getAttribute('data-direction');
      return [
        fwd === 'forward' && back === 'back' && status === 'Page 2 of 3',
        `${status}`,
      ];
    }
  );

  await run(
    'swipe-action-row',
    'swipe uncovers actions; ⋯ does the same',
    async (c) => {
      await drag(c.locator('.mg-swipe__front').first(), -150, 0);
      await wait(350);
      await c
        .locator('.mg-swipe')
        .first()
        .getByRole('button', { name: 'Archive' })
        .click();
      const status = await c.getByRole('status').innerText();
      const more = c.getByRole('button', {
        name: 'Show actions for Harbor fees for March',
      });
      await more.click();
      await wait(50);
      return [
        status === 'Archived: Ferry times changed' &&
          (await focused()) === 'Archive',
        status,
      ];
    }
  );

  await run(
    'drag-reorder-list',
    'dragging and Move buttons reorder and announce',
    async (c) => {
      await drag(c.locator('.mg-reorder__handle').first(), 0, 112, {
        steps: 14,
      });
      await wait(300);
      const dragged = await c.getByRole('status').innerText();
      await c.getByRole('button', { name: 'Move Fish market up' }).click();
      const moved = await c.getByRole('status').innerText();
      const order = await c.locator('.mg-reorder__label').allInnerTexts();
      return [
        dragged.includes('“Fuel dock” to position 3 of 4') &&
          moved.includes('“Fish market” to position 3 of 4'),
        order.join(', '),
      ];
    }
  );

  await run(
    'card-transfer-board',
    'button and drag move cards between columns',
    async (c) => {
      await c
        .getByRole('button', { name: 'Move Bilge pump to Checked' })
        .click();
      const done = c.getByRole('region', { name: /Checked/ });
      const afterButton = await done.getAttribute('aria-label');
      const card = c.locator('[data-card="b"]');
      const from = await card.boundingBox();
      const to = await done.boundingBox();
      await page.mouse.move(from.x + 20, from.y + from.height / 2);
      await page.mouse.down();
      await page.mouse.move(to.x + to.width / 2, to.y + to.height - 20, {
        steps: 12,
      });
      await page.mouse.up();
      await wait(450);
      return [
        afterButton.includes('2 cards') &&
          (await done.getAttribute('aria-label')).includes('3 cards'),
        afterButton,
      ];
    }
  );

  await run(
    'resizable-split-pane',
    'keyboard and drag resize within bounds',
    async (c) => {
      const sep = c.getByRole('separator');
      await sep.focus();
      await page.keyboard.press('ArrowRight');
      const step = await sep.getAttribute('aria-valuenow');
      await page.keyboard.press('End');
      const max = await sep.getAttribute('aria-valuenow');
      await wait(300);
      await drag(sep, -400, 0);
      const min = await sep.getAttribute('aria-valuenow');
      return [
        step === '45' && max === '80' && min === '20',
        `${step} ${max} ${min}`,
      ];
    }
  );

  await run(
    'swipe-deck',
    'Next, a drag and Previous move through the stack',
    async (c) => {
      await c.getByRole('button', { name: 'Next →' }).click();
      const a = await c.getByRole('status').innerText();
      await drag(c.locator('.mg-deck__card[data-top="true"]'), -170, 0);
      await wait(100);
      const b = await c.getByRole('status').innerText();
      await c.getByRole('button', { name: '← Previous' }).click();
      const d = await c.getByRole('status').innerText();
      return [
        a === 'Card 2 of 4' && b === 'Card 3 of 4' && d === 'Card 2 of 4',
        `${a} / ${b} / ${d}`,
      ];
    }
  );

  await run(
    'anchored-popover',
    'stays inside its box; Escape returns focus',
    async (c) => {
      const trigger = c.getByRole('button', { name: 'Tide info' });
      await trigger.click();
      await wait(250);
      const panel = await c
        .getByRole('dialog', { name: 'Tide information' })
        .boundingBox();
      const bounds = await c.locator('[data-popover-boundary]').boundingBox();
      const inside =
        panel.x >= bounds.x &&
        panel.y >= bounds.y &&
        panel.x + panel.width <= bounds.x + bounds.width + 1 &&
        panel.y + panel.height <= bounds.y + bounds.height + 1;
      await page.keyboard.press('Escape');
      const back = await trigger.evaluate(
        (el) => el === document.activeElement
      );
      return [
        inside && back && (await c.getByRole('dialog').count()) === 0,
        JSON.stringify(panel),
      ];
    }
  );

  await run(
    'context-menu',
    'opens at the pointer and by keyboard, inside its area',
    async (c) => {
      const area = c.getByRole('group', { name: /^Chart/ });
      const box = await area.boundingBox();
      await page.mouse.click(box.x + box.width - 10, box.y + box.height - 10, {
        button: 'right',
      });
      const menu = await c.getByRole('menu').boundingBox();
      const inside =
        menu.x + menu.width <= box.x + box.width + 1 &&
        menu.y + menu.height <= box.y + box.height + 1;
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('Enter');
      const status = await c.getByRole('status').innerText();
      await area.focus();
      await page.keyboard.press('Shift+F10');
      const keyed = await c.getByRole('menu').count();
      await page.keyboard.press('Escape');
      return [
        inside && status === 'Chose: Measure from here' && keyed === 1,
        status,
      ];
    }
  );

  await run(
    'bounded-confetti-burst',
    'a capped burst plus a static success message',
    async (c) => {
      await c.getByRole('button', { name: 'Log the last 3 miles' }).click();
      await wait(120);
      const pieces = await c.locator('.mg-confetti__piece').count();
      const text = await c.getByRole('status').innerText();
      return [
        pieces > 0 &&
          pieces <= 60 &&
          text.includes('100 nautical miles logged'),
        `${pieces} pieces`,
      ];
    }
  );

  await run(
    'indeterminate-loader',
    'Finish completes the bar and says so',
    async (c) => {
      await c.getByRole('button', { name: 'Finish' }).click();
      return (
        (await c.getByRole('progressbar').getAttribute('aria-valuenow')) ===
          '100' &&
        (await c.locator('.mg-loader__text').innerText()) ===
          'Syncing charts: done'
      );
    }
  );

  await run(
    'inline-validation',
    'error then success, linked, without layout jumps',
    async (c) => {
      const input = c.getByLabel('Boat name');
      const msg = c.locator('.mg-valid__message');
      const h1 = (await msg.boundingBox()).height;
      await c.getByRole('button', { name: 'Br', exact: true }).click();
      await input.focus();
      await page.keyboard.press('Tab');
      const err = await msg.innerText();
      const invalid = await input.getAttribute('aria-invalid');
      await c.getByRole('button', { name: 'Cormorant' }).click();
      const ok = await msg.innerText();
      const h2 = (await msg.boundingBox()).height;
      const linked =
        (await input.getAttribute('aria-describedby')) ===
        (await msg.getAttribute('id'));
      return [
        err.includes('at least 3') &&
          invalid === 'true' &&
          ok.startsWith('OK') &&
          h1 === h2 &&
          linked,
        `${err} / ${ok}`,
      ];
    }
  );

  await run(
    'upload-queue-preview',
    'files finish or fail; Retry recovers',
    async (c) => {
      const crew = c
        .locator('[data-status]')
        .filter({ hasText: 'crew-list.csv' });
      await c.locator('li[data-status="failed"]').waitFor({ timeout: 9000 });
      await c.getByRole('button', { name: 'Retry crew-list.csv' }).click();
      await c
        .locator('li[data-status="completed"]')
        .nth(1)
        .waitFor({ timeout: 9000 });
      return (await crew.getAttribute('data-status')) === 'completed';
    }
  );

  await run(
    'checkmark-draw',
    'draws on completion with matching text',
    async (c) => {
      await c.getByRole('button', { name: 'Pay mooring fee' }).click();
      return (
        (await c.locator('.mg-checkmark').getAttribute('data-done')) ===
          'true' &&
        (await c.getByRole('status').innerText()) ===
          'Mooring paid for 3 nights'
      );
    }
  );

  await run(
    'undo-banner',
    'archive keeps focus in the list; Undo restores the spot',
    async (c) => {
      await c
        .getByRole('button', { name: 'Archive Fill the water tanks' })
        .click();
      await wait(80);
      const inList = await page.evaluate(
        () => !!document.activeElement?.closest('ul')
      );
      const banner = await c.locator('.mg-undo').innerText();
      await c.getByRole('button', { name: 'Undo', exact: true }).click();
      const tasks = await c.locator('li').allInnerTexts();
      return [
        inList &&
          banner.includes('Fill the water tanks') &&
          tasks[1].startsWith('Fill the water tanks'),
        banner,
      ];
    }
  );
}

/** Reduced-motion spot checks for the checkpoint-one components. */
export async function checkpointOneCalm(page, check) {
  const { run, wait } = helpers(page, check);
  await run(
    'masked-line-reveal',
    'reduced motion: lines appear without sliding',
    async (c) =>
      (await c
        .locator('.mg-lines__line')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)) === 'none'
  );
  await run(
    'text-marquee',
    'reduced motion: still, wrapped, one copy',
    async (c) => {
      const anim = await c
        .locator('.mg-marquee__track')
        .evaluate((el) => getComputedStyle(el).animationName);
      const copies = await c
        .locator('.mg-marquee__copy')
        .evaluateAll(
          (els) =>
            els.filter((e) => getComputedStyle(e).display !== 'none').length
        );
      return [anim === 'none' && copies === 1, `${anim} ${copies}`];
    }
  );
  await run('flip-card', 'reduced motion: swaps faces instantly', async (c) => {
    await c.getByRole('button', { name: /Show tide times/ }).click();
    await wait(100);
    const faces = await c
      .locator('.mg-flip__face')
      .evaluateAll((els) => els.map((el) => getComputedStyle(el).visibility));
    const transform = await c
      .locator('.mg-flip__inner')
      .evaluate((el) => getComputedStyle(el).transform);
    return [
      faces.join() === 'hidden,visible' && transform === 'none',
      `${faces} ${transform}`,
    ];
  });
  await run(
    'bounded-confetti-burst',
    'reduced motion: success text, no particles',
    async (c) => {
      await c.getByRole('button', { name: 'Log the last 3 miles' }).click();
      await wait(50);
      return (
        (await c.locator('.mg-confetti__piece').count()) === 0 &&
        (await c.getByRole('status').innerText()).includes('100 nautical')
      );
    }
  );
  await run(
    'hold-to-confirm',
    'reduced motion: hold still works',
    async (c) => {
      const box = await c.locator('.mg-hold__button').boundingBox();
      await page.mouse.move(box.x + 20, box.y + 20);
      await page.mouse.down();
      await wait(1500);
      await page.mouse.up();
      return (
        (await c.locator('.mg-hold').getAttribute('data-phase')) === 'done'
      );
    }
  );
}
