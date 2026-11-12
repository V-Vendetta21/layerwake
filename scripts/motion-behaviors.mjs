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
      await range.press('Home');
      await range.press('ArrowRight');
      await c
        .locator('[aria-valuetext="99% night, 1% noon"]')
        .waitFor({ timeout: 2000 })
        .catch(() => {});
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
      await stage.press('Enter');
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
      await c.locator('.mg-dragok[data-done="false"]').waitFor();
      await thumb.press('End');
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
          parseInt(pct) >= 90 &&
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
      const value = async (v) => {
        await c
          .locator(`[role="separator"][aria-valuenow="${v}"]`)
          .waitFor({ timeout: 2000 })
          .catch(() => {});
        return sep.getAttribute('aria-valuenow');
      };
      await sep.press('ArrowRight');
      const step = await value(45);
      await sep.press('End');
      const max = await value(80);
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
      await area.press('Shift+F10');
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
      await input.press('Tab');
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

export async function checkpointTwo(page, check) {
  const { run, drag, focused, wait } = helpers(page, check);
  const wheelIn = async (locator, total, step = 120) => {
    await locator.hover();
    for (let moved = 0; moved < total; moved += step) {
      await page.mouse.wheel(0, step);
      await wait(16);
    }
  };

  await run(
    'sticky-section-story',
    'step buttons jump; the picture follows; page stays put',
    async (c) => {
      const y = await page.evaluate(() => scrollY);
      await c.getByRole('button', { name: 'Step 3: Open water' }).click();
      await wait(900);
      const now = await c.locator('.mg-story__now').innerText();
      return [
        now === 'Step 3 of 4: Open water' &&
          (await page.evaluate(() => scrollY)) === y,
        now,
      ];
    }
  );

  await run(
    'scroll-velocity-skew',
    'fast scrolling leans the bands, then they settle',
    async (c) => {
      const region = c.getByRole('region', { name: 'Passage notes' });
      let peak = 0;
      await region.hover();
      for (let i = 0; i < 6; i++) {
        await page.mouse.wheel(0, 160);
        await wait(16);
        peak = Math.max(
          peak,
          Math.abs(
            parseFloat(
              await region.evaluate((el) =>
                el.style.getPropertyValue('--mg-skew')
              )
            ) || 0
          )
        );
      }
      await wait(1200);
      const rest = await region.evaluate((el) =>
        el.style.getPropertyValue('--mg-skew')
      );
      const text = await region
        .locator('p')
        .first()
        .evaluate((el) => getComputedStyle(el).transform);
      return [
        peak > 0.5 && rest === '0deg' && text === 'none',
        `peak ${peak.toFixed(2)}°, rest ${rest}`,
      ];
    }
  );

  await run(
    'parallax-layers',
    'layers drift at different speeds inside the viewport',
    async (c) => {
      const y = await page.evaluate(() => scrollY);
      const region = c.getByRole('region', { name: 'Coastline stops' });
      await wheelIn(region, 240, 60);
      await wait(200);
      const shifts = await c
        .locator('.mg-parallax__layer')
        .evaluateAll((els) =>
          els.map((el) => new DOMMatrix(getComputedStyle(el).transform).m42)
        );
      return [
        shifts[0] < shifts[2] &&
          shifts[0] < 0 &&
          (await page.evaluate(() => scrollY)) === y,
        shifts.map((s) => s.toFixed(0)).join(', '),
      ];
    }
  );

  await run(
    'scroll-snap-story-rail',
    'Next and Previous land on snap points',
    async (c) => {
      await c.getByRole('button', { name: 'Next →' }).click();
      await wait(700);
      await c.getByRole('button', { name: 'Next →' }).click();
      await wait(700);
      const a = await c.getByRole('status').innerText();
      await c.getByRole('button', { name: '← Previous' }).click();
      await wait(700);
      const b = await c.getByRole('status').innerText();
      return [a === '3 of 5' && b === '2 of 5', `${a} / ${b}`];
    }
  );

  await run(
    'scroll-scrub-frames',
    'the slider and scrolling both pick frames',
    async (c) => {
      await c.getByRole('slider').focus();
      await page.keyboard.press('End');
      const end = await c.getByRole('img').getAttribute('aria-label');
      await page.keyboard.press('Home');
      await wheelIn(c.getByRole('region'), 360, 120);
      await wait(250);
      const label = await c.locator('.mg-scrub__slider').innerText();
      return [
        end.includes('100% risen') && !label.startsWith('Frame 1 of'),
        `${label}`,
      ];
    }
  );

  await run(
    'path-tracer',
    'the slider scrubs the route; Play advances it',
    async (c) => {
      await c.getByRole('slider').focus();
      await page.keyboard.press('End');
      const full = await c.getByRole('img').getAttribute('aria-label');
      await page.keyboard.press('Home');
      await c.getByRole('button', { name: 'Play' }).click();
      await wait(600);
      const partway = await c.getByRole('img').getAttribute('aria-label');
      return [
        full.endsWith('100% travelled') && !partway.endsWith(' 0% travelled'),
        partway,
      ];
    }
  );

  await run(
    'node-pulse-graph',
    'a pulse reaches every node and is described',
    async (c) => {
      await c.getByRole('button', { name: 'Pulse from Light' }).click();
      await wait(1600);
      const reached = await c.locator('[data-reached="true"]').count();
      const text = await c.getByRole('status').innerText();
      return [
        reached === 5 && text.startsWith('From Light: step 1 reached Pier'),
        text,
      ];
    }
  );

  await run(
    'animated-bar-chart',
    'bars move to the new dataset and print values',
    async (c) => {
      await c.getByRole('button', { name: 'Last week' }).click();
      await wait(650);
      const values = await c.locator('.mg-bars__value').allInnerTexts();
      const scale = await c
        .locator('.mg-bars__bar')
        .first()
        .evaluate((el) => new DOMMatrix(getComputedStyle(el).transform).d);
      return [
        values[0] === '20 kn' && Math.abs(scale - 20 / 30) < 0.02,
        `${values.join(' ')} · ${scale.toFixed(2)}`,
      ];
    }
  );

  await run(
    'trend-line-morph',
    'the line morphs and a point reads out exactly',
    async (c) => {
      const before = await c.locator('.mg-trend__line').getAttribute('d');
      await c.getByRole('button', { name: 'Air temperature' }).click();
      await c.getByRole('button', { name: 'Jun' }).click();
      await wait(700);
      const after = await c.locator('.mg-trend__line').getAttribute('d');
      const readout = await c.locator('.mg-trend__readout').innerText();
      return [before !== after && readout === 'Jun: 20 °C', readout];
    }
  );

  await run(
    'heatmap-brush',
    'keyboard and drag selections are summed in words',
    async (c) => {
      const grid = c.locator('.mg-heat__grid');
      await grid.press('ArrowRight');
      await page.keyboard.press('Shift+ArrowDown');
      await page.keyboard.press('Shift+ArrowRight');
      const keyed = await c.locator('.mg-heat__summary').innerText();
      const a = await c.locator('[data-r="0"][data-c="0"]').boundingBox();
      const b = await c.locator('[data-r="1"][data-c="2"]').boundingBox();
      await page.mouse.move(a.x + 5, a.y + 5);
      await page.mouse.down();
      await page.mouse.move(b.x + 5, b.y + 5, { steps: 6 });
      await page.mouse.up();
      const dragged = await c.locator('.mg-heat__summary').innerText();
      return [
        keyed.includes('Thu–Fri, Week 2–Week 3: 4 cells') &&
          dragged.includes('Mon–Wed, Week 1–Week 2: 6 cells'),
        `${keyed} | ${dragged}`,
      ];
    }
  );

  await run(
    'dual-thumb-range',
    'thumbs move independently and cannot cross',
    async (c) => {
      const low = c.getByRole('slider', { name: 'Lowest wind' });
      await low.press('End');
      const text = await low.getAttribute('aria-valuetext');
      const high = await c
        .getByRole('slider', { name: 'Highest wind' })
        .getAttribute('aria-valuetext');
      return [text === '16 kn' && high === '18 kn', `${text} – ${high}`];
    }
  );

  await run(
    'inertia-drag-surface',
    'a fling keeps gliding after release, then rests',
    async (c) => {
      const puck = c.locator('.mg-inertia__puck');
      const box = await puck.boundingBox();
      await page.mouse.move(box.x + 10, box.y + 10);
      await page.mouse.down();
      await page.mouse.move(box.x + 40, box.y + 10, { steps: 2 });
      await page.mouse.move(box.x + 70, box.y + 10, { steps: 2 });
      await page.mouse.up();
      const released = await c.getByRole('status').innerText();
      await wait(1500);
      const rest = await c.getByRole('status').innerText();
      const x0 = Number(/x (\d+)/.exec(released)?.[1]);
      const x1 = Number(/x (\d+)/.exec(rest)?.[1]);
      return [
        released.startsWith('Moving') &&
          rest.startsWith('At rest') &&
          x1 !== x0,
        `${released} → ${rest}`,
      ];
    }
  );

  await run(
    'rotary-dial',
    'keys, pointer and reset set exact values',
    async (c) => {
      const knob = c.getByRole('slider', { name: 'Radio volume' });
      await knob.press('ArrowUp');
      await page.keyboard.press('ArrowUp');
      const keyed = await knob.getAttribute('aria-valuenow');
      const box = await knob.boundingBox();
      await knob.click({ position: { x: 4, y: box.height / 2 } });
      const pointed = await knob.getAttribute('aria-valuenow');
      await c.getByRole('button', { name: 'Reset to 4' }).click();
      return [
        keyed === '6' &&
          pointed === '2' &&
          (await knob.getAttribute('aria-valuenow')) === '4',
        `${keyed} ${pointed}`,
      ];
    }
  );

  await run(
    'pinch-zoom-canvas',
    'buttons, keys and Ctrl+wheel zoom and pan inside the box',
    async (c) => {
      await c.getByRole('button', { name: 'Zoom in' }).click();
      const zoom = await c.getByRole('status').innerText();
      const box = c.getByRole('group', { name: /Harbor approach chart/ });
      await box.focus();
      const t0 = await c
        .locator('.mg-pinch__content')
        .evaluate((el) => el.style.transform);
      await page.keyboard.press('ArrowRight');
      const t1 = await c
        .locator('.mg-pinch__content')
        .evaluate((el) => el.style.transform);
      await page.keyboard.press('0');
      await box.hover();
      await page.keyboard.down('Control');
      await page.mouse.wheel(0, -200);
      await page.keyboard.up('Control');
      await wait(100);
      const wheel = await c.getByRole('status').innerText();
      return [
        zoom === '125%' && t0 !== t1 && parseInt(wheel) > 100,
        `${zoom} ${wheel}`,
      ];
    }
  );

  await run(
    'drag-to-duplicate-tile',
    'tap and drag both add copies',
    async (c) => {
      await c.getByRole('button', { name: 'Add buoy' }).click();
      const canvas = await c
        .getByRole('region', { name: /Canvas/ })
        .boundingBox();
      const src = await c
        .getByRole('button', { name: 'Add marker' })
        .boundingBox();
      await page.mouse.move(src.x + 20, src.y + 20);
      await page.mouse.down();
      await page.mouse.move(
        canvas.x + canvas.width / 2,
        canvas.y + canvas.height / 2,
        { steps: 12 }
      );
      await page.mouse.up();
      const status = await c.getByRole('status').innerText();
      return [
        status === '2 tiles on the canvas' &&
          (await c.getByRole('img', { name: 'marker' }).count()) === 1,
        status,
      ];
    }
  );

  await run(
    'star-rating-fill',
    'hover previews; a choice commits',
    async (c) => {
      await c.locator('.mg-stars__star').nth(2).hover();
      const preview = await c.locator('.mg-stars__text').innerText();
      await c.locator('.mg-stars__star').nth(3).click();
      await page.mouse.move(0, 0);
      const set = await c.locator('.mg-stars__text').innerText();
      await page.keyboard.press('ArrowRight');
      const keyed = await c.locator('.mg-stars__text').innerText();
      return [
        preview === 'Preview: 3 of 5' &&
          set === 'Your rating: 4 of 5' &&
          keyed === 'Your rating: 5 of 5',
        `${preview} / ${set} / ${keyed}`,
      ];
    }
  );

  await run(
    'verification-code-slots',
    'typing, a wrong code, correction and paste',
    async (c) => {
      const input = c.getByLabel(/Test code/);
      await input.click();
      await page.keyboard.type('123');
      const active = await c
        .locator('.mg-otp__slot[data-active="true"]')
        .evaluate((el) => [...el.parentElement.children].indexOf(el));
      await page.keyboard.type('456');
      const error = await c.getByRole('alert').innerText();
      for (let i = 0; i < 6; i++) await page.keyboard.press('Backspace');
      await page.evaluate(() => navigator.clipboard.writeText('482916'));
      await page.keyboard.press('Control+V');
      await wait(100);
      const ok = await c.getByRole('status').innerText();
      return [
        active === 3 &&
          error.includes('does not match') &&
          ok.includes('accepted'),
        `${active} ${ok}`,
      ];
    }
  );

  await run(
    'token-chip-entry',
    'adds, refuses duplicates, deletes by keyboard',
    async (c) => {
      const input = c.getByLabel('Trip tags');
      await input.click();
      await page.keyboard.type('Fishing');
      await page.keyboard.press('Enter');
      const added = await c.locator('.mg-chips__chip').count();
      await page.keyboard.type('sailing');
      await page.keyboard.press('Enter');
      const dupe = await c.getByRole('status').innerText();
      await input.fill('');
      await page.keyboard.press('Backspace');
      await wait(300);
      return [
        added === 3 &&
          dupe.includes('already added') &&
          (await c.locator('.mg-chips__chip').count()) === 2,
        dupe,
      ];
    }
  );

  await run(
    'calendar-month-slide',
    'keyboard crosses months with a directional slide',
    async (c) => {
      await c.locator('td button[tabindex="0"]').focus();
      await page.keyboard.press('PageDown');
      const title = await c.locator('.mg-cal__head h4').innerText();
      const dir = await c
        .locator('.mg-cal__grid')
        .getAttribute('data-direction');
      await wait(150);
      await page.keyboard.press('ArrowRight');
      await wait(150);
      await page.keyboard.press('Enter');
      const status = await c.getByRole('status').innerText();
      return [
        title === 'December 2026' &&
          dir === 'next' &&
          status.includes('December 15'),
        `${title} ${status}`,
      ];
    }
  );

  await run(
    'nested-menu-drilldown',
    'slides in and out with focus kept in place',
    async (c) => {
      const trigger = c.getByRole('button', { name: /^Settings/ });
      await trigger.click();
      const first = await focused();
      await page.keyboard.press('ArrowRight');
      const inside = await focused();
      const path = await c.locator('.mg-drill__path').innerText();
      await page.keyboard.press('Escape');
      const backOn = await focused();
      await page.keyboard.press('Escape');
      const closed =
        (await c.getByRole('menu').count()) === 0 &&
        (await trigger.evaluate((el) => el === document.activeElement));
      await trigger.click();
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('ArrowDown');
      await page.keyboard.press('ArrowRight');
      await page.keyboard.press('Enter');
      const status = await c.getByRole('status').innerText();
      return [
        first.startsWith('Display') &&
          inside === 'Night mode' &&
          path === 'Settings › Display' &&
          backOn.startsWith('Display') &&
          closed &&
          status === 'Chose: Display › Units › Metres',
        `${inside} / ${status}`,
      ];
    }
  );
}

export async function checkpointTwoCalm(page, check) {
  const { run, wait } = helpers(page, check);
  await run(
    'parallax-layers',
    'reduced motion: layers stay still',
    async (c) => {
      await c.getByRole('region', { name: 'Coastline stops' }).hover();
      await page.mouse.wheel(0, 200);
      await wait(200);
      const t = await c
        .locator('.mg-parallax__layer')
        .evaluateAll((els) => els.map((el) => getComputedStyle(el).transform));
      return [t.every((v) => v === 'none'), t.join()];
    }
  );
  await run(
    'scroll-velocity-skew',
    'reduced motion: bands never lean',
    async (c) => {
      await c.getByRole('region', { name: 'Passage notes' }).hover();
      await page.mouse.wheel(0, 300);
      await wait(30);
      return (
        (await c
          .locator('.mg-velocity__strip')
          .first()
          .evaluate((el) => getComputedStyle(el).transform)) === 'none'
      );
    }
  );
  await run(
    'scroll-scrub-frames',
    'reduced motion: first frame holds; the slider still works',
    async (c) => {
      const before = await c.locator('.mg-scrub__slider').innerText();
      await c.getByRole('slider').focus();
      await page.keyboard.press('End');
      const after = await c.locator('.mg-scrub__slider').innerText();
      return [
        before.startsWith('Frame 1 of 8') && after.startsWith('Frame 8 of 8'),
        `${before} → ${after}`,
      ];
    }
  );
  await run(
    'node-pulse-graph',
    'reduced motion: result is immediate',
    async (c) => {
      await c.getByRole('button', { name: 'Pulse from Rock' }).click();
      await wait(80);
      return (await c.locator('[data-reached="true"]').count()) === 5;
    }
  );
}

export async function checkpointThree(page, check) {
  const { run, drag, focused, wait } = helpers(page, check);

  await run(
    'stacked-dialog-depth',
    'second dialog stacks; Escape unwinds with focus return',
    async (c) => {
      const opener = c.getByRole('button', { name: 'Edit crew list' });
      await opener.click();
      const first = page.getByRole('dialog', { name: 'Crew list' });
      await first.getByRole('button', { name: 'Remove the deckhand…' }).click();
      const covered = await first.getAttribute('data-covered');
      const top = page.getByRole('dialog', { name: 'Remove deckhand?' });
      await page.keyboard.press('Tab');
      const inTop = await page.evaluate(() =>
        document.activeElement
          ?.closest('dialog')
          ?.getAttribute('aria-labelledby')
      );
      const topId = await top.getAttribute('aria-labelledby');
      await page.keyboard.press('Escape');
      await wait(100);
      const backOn = await focused();
      const stillFirst = await first.evaluate((d) => d.open);
      await page.keyboard.press('Escape');
      await wait(100);
      const onOpener = await opener.evaluate(
        (el) => el === document.activeElement
      );
      return [
        covered === 'true' &&
          inTop === topId &&
          backOn === 'Remove the deckhand…' &&
          stillFirst &&
          onOpener,
        `${backOn} ${onOpener}`,
      ];
    }
  );

  await run(
    'list-to-detail-transition',
    'opens detail with focus on its title; back keeps list position',
    async (c) => {
      const list = c.locator('.mg-l2d__list');
      const start = await list.evaluate((el) => {
        el.scrollTop = el.scrollHeight;
        return el.scrollTop;
      });
      await c.getByRole('button', { name: /Long Strand/ }).click();
      await wait(50);
      const title = await page.evaluate(
        () =>
          document.activeElement?.tagName +
          ':' +
          document.activeElement?.textContent
      );
      await c.getByRole('button', { name: '‹ Back to list' }).click();
      await wait(50);
      const pos = await c
        .locator('.mg-l2d__list')
        .evaluate((el) => el.scrollTop);
      const back = await focused();
      return [
        title === 'H3:Long Strand' &&
          start > 0 &&
          pos === start &&
          back.startsWith('Long Strand'),
        `${title} ${pos} ${back.slice(0, 20)}`,
      ];
    }
  );

  await run(
    'collapsing-app-header',
    'condenses past the threshold and keeps its action',
    async (c) => {
      const pageEl = c.getByRole('region', { name: 'Logbook page' });
      await pageEl.evaluate((el) => el.scrollTo(0, 120));
      await wait(350);
      const compact = await pageEl.getAttribute('data-compact');
      const h = (await c.locator('.mg-appbar__header').boundingBox()).height;
      await c.getByRole('button', { name: 'Log entry' }).click();
      const sub = await c.locator('.mg-appbar__titles p').textContent();
      await pageEl.evaluate((el) => el.scrollTo(0, 40));
      await wait(50);
      const hysteresis = await pageEl.getAttribute('data-compact');
      return [
        compact === 'true' &&
          h < 70 &&
          sub.includes('1 new entry') &&
          hysteresis === 'true',
        `${h} ${sub}`,
      ];
    }
  );

  await run(
    'selection-toolbar',
    'selecting text shows the bar; Bold applies to the selection',
    async (c) => {
      await c.locator('.mg-seltb__text').evaluate((el) => {
        const node = el.querySelector('span').firstChild;
        const range = document.createRange();
        range.setStart(node, 9);
        range.setEnd(node, 18);
        const sel = getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
      });
      await c
        .getByRole('toolbar', { name: 'Format selection' })
        .waitFor({ timeout: 2000 });
      await c.getByRole('button', { name: 'Bold' }).click();
      const bold = await c.locator('[data-marks~="bold"]').innerText();
      return [bold === 'red marks', bold];
    }
  );

  await run(
    'route-transition-curtain',
    'rapid navigation ends on the last view with focus on its heading',
    async (c) => {
      await c.getByRole('button', { name: 'Crew' }).click();
      await c.getByRole('button', { name: 'Kit' }).click();
      await c.getByRole('button', { name: 'Crew' }).click();
      await wait(700);
      const heading = await c.locator('.mg-curtain__view h3').innerText();
      const onHeading = await c
        .locator('.mg-curtain__view h3')
        .evaluate((el) => el === document.activeElement);
      const phase = await c
        .locator('.mg-curtain__cloth')
        .getAttribute('data-phase');
      return [
        heading === 'Crew' && onHeading && phase === 'idle',
        `${heading} ${phase}`,
      ];
    }
  );

  const loop = async (slug, name, root, pauseName = 'Pause') =>
    run(slug, name, async (c) => {
      const el = c.locator(root);
      const before = await el.getAttribute('data-playing');
      await c.getByRole('button', { name: pauseName }).click();
      const after = await el.getAttribute('data-playing');
      return [before === 'true' && after === 'false', `${before} → ${after}`];
    });

  await loop(
    'orbiting-marks',
    'orbits run in view and Pause stops them',
    '.mg-orbit'
  );

  await run(
    'svg-wave-divider',
    'the wave moves; height stays fixed; Pause holds it',
    async (c) => {
      const path = c.locator('.mg-wave path');
      const a = await path.getAttribute('d');
      await wait(250);
      const b = await path.getAttribute('d');
      const h1 = (await c.locator('.mg-wave').boundingBox()).height;
      await c.getByRole('slider').first().press('End');
      const h2 = (await c.locator('.mg-wave').boundingBox()).height;
      await c.getByRole('button', { name: 'Pause' }).click();
      const p1 = await path.getAttribute('d');
      await wait(250);
      return [
        a !== b && h1 === h2 && p1 === (await path.getAttribute('d')),
        `${h1}/${h2}`,
      ];
    }
  );

  await run(
    'gradient-mesh-drift',
    'palette switches and Pause stops the drift',
    async (c) => {
      const root = c.locator('.mg-mesh');
      await c.getByRole('button', { name: 'Graphite' }).click();
      const color = await root.evaluate((el) =>
        el.style.getPropertyValue('--mg-c2')
      );
      await c.getByRole('button', { name: 'Pause' }).click();
      return [
        color === '#5c5c5c' &&
          (await root.getAttribute('data-playing')) === 'false',
        color,
      ];
    }
  );

  await run(
    'scanline-sweep',
    'one pass, then the result; replays on demand',
    async (c) => {
      await wait(2300);
      const done = await c
        .locator('.mg-scan__result')
        .evaluate((el) => getComputedStyle(el).opacity);
      await c.getByRole('button', { name: 'Scan again' }).click();
      await wait(80);
      const again = await c
        .locator('.mg-scan__result')
        .evaluate((el) => getComputedStyle(el).opacity);
      return [done === '1' && Number(again) < 0.5, `${done} → ${again}`];
    }
  );

  await run(
    'pointer-trail',
    'moving draws a capped trail; Stop clears it',
    async (c) => {
      const area = c.getByRole('group', { name: /pointer trail/ });
      const box = await area.boundingBox();
      await page.mouse.move(box.x + 20, box.y + 40);
      await page.mouse.move(box.x + box.width - 20, box.y + 120, { steps: 80 });
      const painted = await c.locator('canvas').evaluate((cv) => {
        const d = cv
          .getContext('2d')
          .getImageData(0, 0, cv.width, cv.height).data;
        let n = 0;
        for (let i = 3; i < d.length; i += 4) if (d[i]) n++;
        return n;
      });
      await c.getByRole('button', { name: 'Stop trail' }).click();
      const cleared = await c.locator('canvas').evaluate((cv) => {
        const d = cv
          .getContext('2d')
          .getImageData(0, 0, cv.width, cv.height).data;
        return d.every((v, i) => i % 4 !== 3 || v === 0);
      });
      return [painted > 50 && cleared, `${painted} px`];
    }
  );

  await run(
    'kaleidoscope-tiles',
    'segment count changes the mirror; Pause stops it',
    async (c) => {
      await c.getByRole('slider').press('End');
      const wedges = await c.locator('.mg-kaleido__wedge').count();
      await c.getByRole('button', { name: 'Pause' }).click();
      return [
        wedges === 16 &&
          (await c.locator('.mg-kaleido').getAttribute('data-playing')) ===
            'false',
        `${wedges}`,
      ];
    }
  );

  await run(
    'pixel-dissolve',
    'reveals over a described image; the order repeats',
    async (c) => {
      const order = () =>
        c.locator('.mg-dissolve__tiles span').evaluateAll((els) =>
          els
            .slice(0, 10)
            .map((e) => e.style.getPropertyValue('--mg-delay'))
            .join()
        );
      const a = await order();
      await c.getByRole('button', { name: 'Dissolve again' }).click();
      const b = await order();
      const tiles = await c.locator('.mg-dissolve__tiles span').count();
      return [
        a === b &&
          tiles === 96 &&
          (await c.getByRole('img', { name: /lighthouse/ }).count()) === 1,
        `${tiles} tiles`,
      ];
    }
  );

  await run(
    'waveform-equalizer',
    'levels move with a text summary; Pause says so',
    async (c) => {
      const a = await c
        .locator('.mg-eq__bars span')
        .first()
        .evaluate((el) => el.style.getPropertyValue('--mg-level'));
      await wait(300);
      const b = await c
        .locator('.mg-eq__bars span')
        .first()
        .evaluate((el) => el.style.getPropertyValue('--mg-level'));
      await c.getByRole('button', { name: 'Pause' }).click();
      const status = await c.getByRole('status').innerText();
      return [a !== b && status.includes('Paused'), status];
    }
  );

  await run(
    'morphing-blob',
    'choosing a shape morphs the path around a fixed center',
    async (c) => {
      const d0 = await c.locator('.mg-blob__shape').getAttribute('d');
      const center = await c.locator('.mg-blob__center').getAttribute('cx');
      await c.getByRole('radio', { name: 'star' }).click();
      await wait(700);
      const label = await c.getByRole('img').getAttribute('aria-label');
      return [
        d0 !== (await c.locator('.mg-blob__shape').getAttribute('d')) &&
          label.endsWith('star') &&
          center === (await c.locator('.mg-blob__center').getAttribute('cx')),
        label,
      ];
    }
  );

  await run(
    'ascii-glimmer-panel',
    'one wave runs; the real text stays readable',
    async (c) => {
      const decorative = await c
        .locator('.mg-ascii__grid')
        .getAttribute('aria-hidden');
      const text = await c.locator('.mg-ascii__content').innerText();
      await c.getByRole('button', { name: 'Replay wave' }).click();
      const iterations = await c
        .locator('.mg-ascii__grid span')
        .first()
        .evaluate((el) => getComputedStyle(el).animationIterationCount);
      return [
        decorative === 'true' &&
          text.includes('Weather station online') &&
          iterations === '1',
        iterations,
      ];
    }
  );

  await run(
    'live-log-stream',
    'keeps your place while reading; Jump to latest catches up',
    async (c) => {
      const list = c.getByRole('list', { name: 'Engine room log' });
      await wait(1000);
      await list.evaluate((el) => (el.scrollTop = 0));
      await list.dispatchEvent('scroll');
      await wait(2000);
      const held = await list.evaluate((el) => el.scrollTop);
      const jump = c.getByRole('button', { name: /Jump to latest/ });
      const label = await jump.innerText();
      await jump.click();
      const bottom = await list.evaluate(
        (el) => el.scrollHeight - el.scrollTop - el.clientHeight < 8
      );
      await c.getByRole('button', { name: 'Pause stream' }).click();
      return [held === 0 && /\(\d+ new\)/.test(label) && bottom, label];
    }
  );

  await run(
    'chat-typing-relay',
    'typing, then the message, as plain list items',
    async (c) => {
      await c.getByRole('button', { name: 'Next speaker types' }).click();
      const typing = await c
        .getByRole('listitem', { name: 'Harbor office is typing' })
        .count();
      await c.getByRole('button', { name: 'Deliver message' }).click();
      const items = await c
        .getByRole('list')
        .getByRole('listitem')
        .allInnerTexts();
      return [
        typing === 1 && items.length === 1 && items[0].includes('Berth B14'),
        items.join(' | '),
      ];
    }
  );

  await run(
    'theme-transition-panel',
    'the circular reveal ends on the new theme',
    async (c) => {
      const toggle = c.getByRole('button', { name: 'Dark theme' });
      await toggle.click();
      const clip = await c
        .locator('.mg-theme__layer--reveal')
        .evaluate((el) => getComputedStyle(el).clipPath)
        .catch(() => '');
      await wait(800);
      return [
        clip.startsWith('circle') &&
          (await toggle.getAttribute('aria-pressed')) === 'true' &&
          (await c.getByRole('status').innerText()) === 'Theme: dark',
        clip,
      ];
    }
  );

  await run(
    'collision-aware-label-stack',
    'crowded labels separate and keep leader lines',
    async (c) => {
      await c.getByRole('button', { name: 'Bunch at the mark' }).click();
      await wait(500);
      const tops = await c
        .locator('.mg-labels__tag')
        .evaluateAll((els) =>
          els.map((e) => e.getBoundingClientRect().top).sort((a, b) => a - b)
        );
      const gaps = tops.slice(1).map((t, i) => t - tops[i]);
      const moved = await c.locator('[data-moved="true"]').count();
      const values = await c.locator('.mg-labels__values li').count();
      return [
        gaps.every((g) => g >= 14) && moved >= 3 && values === 4,
        gaps.map((g) => g.toFixed(0)).join(','),
      ];
    }
  );

  await run(
    'canvas-selection-marquee',
    'boxes drawn in any direction select the same shapes',
    async (c) => {
      const cv = await c.locator('.mg-marquee-sel__canvas').boundingBox();
      const sel = async (x0, y0, x1, y1) => {
        await page.mouse.move(cv.x + x0, cv.y + y0);
        await page.mouse.down();
        await page.mouse.move(cv.x + x1, cv.y + y1, { steps: 6 });
        await page.mouse.up();
        return c.getByRole('status').innerText();
      };
      const down = await sel(10, 10, 140, 80);
      const up = await sel(140, 80, 10, 10);
      await c.getByRole('checkbox', { name: 'Slipway' }).check();
      const plus = await c.getByRole('status').innerText();
      await c.getByRole('button', { name: 'Clear selection' }).click();
      const cleared = await c.getByRole('status').innerText();
      return [
        down === '2 of 5 selected' &&
          up === down &&
          plus === '3 of 5 selected' &&
          cleared === '0 of 5 selected',
        `${down} / ${up} / ${plus}`,
      ];
    }
  );
}

export async function checkpointThreeCalm(page, check) {
  const { run, wait } = helpers(page, check);
  await run(
    'orbiting-marks',
    'reduced motion: orbits stay still',
    async (c) =>
      (await c
        .locator('.mg-orbit__ring')
        .first()
        .evaluate((el) => getComputedStyle(el).animationName)) === 'none'
  );
  await run(
    'theme-transition-panel',
    'reduced motion: theme switches directly',
    async (c) => {
      await c.getByRole('button', { name: 'Dark theme' }).click();
      await wait(50);
      return (
        (await c.locator('.mg-theme__layer--reveal').count()) === 0 &&
        (await c.getByRole('status').innerText()) === 'Theme: dark'
      );
    }
  );
  await run(
    'pixel-dissolve',
    'reduced motion: image shown without tiles',
    async (c) =>
      (await c
        .locator('.mg-dissolve__tiles')
        .evaluate((el) => getComputedStyle(el).display)) === 'none'
  );
  await run(
    'svg-wave-divider',
    'reduced motion: the wave holds still',
    async (c) => {
      const a = await c.locator('.mg-wave path').getAttribute('d');
      await wait(300);
      return a === (await c.locator('.mg-wave path').getAttribute('d'));
    }
  );
  await run(
    'route-transition-curtain',
    'reduced motion: views swap with focus on the heading',
    async (c) => {
      await c.getByRole('button', { name: 'Kit' }).click();
      await wait(50);
      return (
        (await c.locator('.mg-curtain__view h3').innerText()) === 'Kit' &&
        (await c
          .locator('.mg-curtain__view h3')
          .evaluate((el) => el === document.activeElement))
      );
    }
  );
}
