/**
 * Layerwake picker. Injected into the active tab only after the user clicks
 * "Capture component". Everything it adds to the page lives in one shadow
 * root and is removed on capture, cancel or error.
 */

import {
  CAPTURE_EXCLUDES,
  CAPTURE_INCLUDES,
  CAPTURE_PROBLEM_TEXT,
  CaptureProblem,
  captureElement,
  type CaptureResult,
} from '../../lib/layerwake/collect';
import { formatBytes } from '../../lib/layerwake/validate';

const FLAG = '__layerwakePickerActive';

const STYLES = `
:host { all: initial; }
* { box-sizing: border-box; }
.layer {
  position: fixed; inset: 0; z-index: 2147483647; pointer-events: none;
  font: 13px/1.45 system-ui, -apple-system, "Segoe UI", sans-serif; color: #ffffff;
}
/* A snow-white outline with a dark halo reads on light and dark pages alike. */
.outline {
  position: fixed; left: 0; top: 0; width: 0; height: 0; display: none;
  border: 2px solid #dce9f7; border-radius: 3px;
  background: rgba(234, 242, 251, 0.1);
  box-shadow: 0 0 0 1px #080808, 0 0 0 4px rgba(220, 233, 247, 0.45);
}
.outline.locked { background: transparent; }
.tag {
  position: absolute; left: -2px; top: -22px; padding: 1px 6px;
  background: #eaf2fb; color: #080808; border-radius: 3px 3px 0 0;
  font: 11px/18px ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap;
}
.bar, .panel {
  pointer-events: auto; background: #121212; border: 1px solid #303030;
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.55); border-radius: 10px;
}
.bar {
  position: fixed; left: 50%; top: 12px; transform: translateX(-50%);
  display: flex; align-items: center; gap: 10px; padding: 8px 8px 8px 12px;
  max-width: calc(100vw - 24px);
}
.bar strong { font-weight: 650; }
.bar span { color: #b8b8b8; }
.message {
  position: fixed; left: 50%; top: 64px; transform: translateX(-50%);
  max-width: min(420px, calc(100vw - 24px)); padding: 8px 12px; border-radius: 8px;
  background: #ffffff; color: #080808; pointer-events: none;
}
.message:empty { display: none; }
.panel {
  position: fixed; right: 16px; top: 16px; width: min(340px, calc(100vw - 32px));
  max-height: calc(100vh - 32px); overflow: auto; padding: 16px;
}
h2 { margin: 0 0 10px; font-size: 15px; font-weight: 650; }
h3 {
  margin: 12px 0 4px; font-size: 11px; font-weight: 600; letter-spacing: 0.06em;
  text-transform: uppercase; color: #b8b8b8;
}
dl { display: grid; grid-template-columns: auto 1fr; gap: 2px 12px; margin: 0; }
dt { color: #b8b8b8; }
dd { margin: 0; font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; }
ul { margin: 0; padding-left: 18px; color: #b8b8b8; }
/* Warning: dashed outline. Done: snow outline. The words say which. */
.warn {
  margin: 10px 0 0; padding: 8px 10px; border-radius: 8px;
  background: #1b1b1b; border: 1px dashed #b8b8b8;
}
.done {
  margin: 10px 0 0; padding: 8px 10px; border-radius: 8px;
  background: #1e2329; border: 1px solid #dce9f7;
}
.actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; }
button {
  font: inherit; font-weight: 600; padding: 7px 12px; border-radius: 8px; cursor: pointer;
  border: 1px solid #474747; background: #1b1b1b; color: #ffffff;
}
button:hover { border-color: #8f8f8f; background: #262626; }
button.primary { background: #eaf2fb; border-color: #eaf2fb; color: #080808; }
button.primary:hover { background: #ffffff; border-color: #ffffff; }
button:focus-visible { outline: 2px solid #dce9f7; outline-offset: 2px; }
kbd {
  padding: 0 5px; border: 1px solid #474747; border-radius: 4px; background: #1b1b1b;
  font: 11px ui-monospace, monospace; color: #ffffff;
}
@media (prefers-reduced-motion: no-preference) {
  .outline { transition: left 60ms, top 60ms, width 60ms, height 60ms; }
}
`;

function start() {
  const flags = window as unknown as Record<string, boolean>;
  if (flags[FLAG]) return;
  flags[FLAG] = true;

  const doc = document;
  const host = doc.createElement('div');
  host.setAttribute('data-layerwake', '');
  const shadow = host.attachShadow({ mode: 'closed' });

  try {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(STYLES);
    shadow.adoptedStyleSheets = [sheet];
  } catch {
    const style = doc.createElement('style');
    style.textContent = STYLES;
    shadow.appendChild(style);
  }

  const el = <K extends keyof HTMLElementTagNameMap>(
    tag: K,
    className = '',
    text = ''
  ) => {
    const node = doc.createElement(tag);
    if (className) node.className = className;
    if (text) node.textContent = text;
    return node;
  };

  const layer = el('div', 'layer');
  const outline = el('div', 'outline');
  const tag = el('div', 'tag');
  outline.appendChild(tag);
  const bar = el('div', 'bar');
  bar.setAttribute('role', 'status');
  bar.append(
    el('strong', '', 'Click a component to capture'),
    el('span', '', '↑ parent · ↓ child · Enter to pick')
  );
  const cancelButton = el('button', '', 'Cancel (Esc)');
  cancelButton.type = 'button';
  bar.appendChild(cancelButton);
  const message = el('div', 'message');
  message.setAttribute('role', 'alert');
  layer.append(outline, bar, message);
  shadow.appendChild(layer);
  (doc.documentElement ?? doc.body).appendChild(host);

  let target: Element | null = null;
  let picking = false;
  let panel: HTMLElement | null = null;
  let messageTimer = 0;

  const isOurs = (node: EventTarget | null) => node === host;

  function showOutline(element: Element | null) {
    if (!element) {
      outline.style.display = 'none';
      return;
    }
    const rect = element.getBoundingClientRect();
    outline.style.display = 'block';
    outline.style.left = `${rect.left}px`;
    outline.style.top = `${rect.top}px`;
    outline.style.width = `${rect.width}px`;
    outline.style.height = `${rect.height}px`;
    tag.textContent = `${element.localName} · ${Math.round(rect.width)} × ${Math.round(rect.height)}`;
    tag.style.top = rect.top < 24 ? '0' : '-22px';
  }

  function say(text: string) {
    message.textContent = text;
    window.clearTimeout(messageTimer);
    if (text)
      messageTimer = window.setTimeout(() => (message.textContent = ''), 4500);
  }

  function setTarget(element: Element | null) {
    if (!element || isOurs(element) || element === doc.documentElement) return;
    target = element;
    showOutline(element);
  }

  /* ----------------------------------------------------------- listeners */

  const swallow = (event: Event) => {
    if (isOurs(event.target)) return;
    event.preventDefault();
    event.stopImmediatePropagation();
  };

  const onMove = (event: MouseEvent) => {
    if (isOurs(event.target)) return;
    setTarget(event.target as Element);
  };

  const onClick = (event: MouseEvent) => {
    if (isOurs(event.target)) return;
    swallow(event);
    setTarget(event.target as Element);
    choose();
  };

  const onKey = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopImmediatePropagation();
      cleanup();
      return;
    }
    if (!picking || isOurs(event.target)) return;
    if (event.key === 'ArrowUp' && target?.parentElement) {
      swallow(event);
      setTarget(target.parentElement);
    } else if (event.key === 'ArrowDown' && target?.firstElementChild) {
      swallow(event);
      setTarget(target.firstElementChild);
    } else if (event.key === 'Enter' && target) {
      swallow(event);
      choose();
    }
  };

  const onViewportChange = () => showOutline(target);

  const pickEvents = [
    'mousedown',
    'mouseup',
    'pointerdown',
    'pointerup',
    'dblclick',
    'contextmenu',
  ];

  function startPicking() {
    if (picking) return;
    picking = true;
    outline.classList.remove('locked');
    bar.style.display = 'flex';
    doc.addEventListener('mousemove', onMove, true);
    doc.addEventListener('click', onClick, true);
    for (const type of pickEvents) doc.addEventListener(type, swallow, true);
  }

  function stopPicking() {
    if (!picking) return;
    picking = false;
    doc.removeEventListener('mousemove', onMove, true);
    doc.removeEventListener('click', onClick, true);
    for (const type of pickEvents) doc.removeEventListener(type, swallow, true);
  }

  function cleanup() {
    stopPicking();
    window.clearTimeout(messageTimer);
    doc.removeEventListener('keydown', onKey, true);
    window.removeEventListener('scroll', onViewportChange, true);
    window.removeEventListener('resize', onViewportChange, true);
    host.remove();
    flags[FLAG] = false;
  }

  /* ------------------------------------------------------------- capture */

  function choose() {
    if (!target) {
      say('Nothing is selected yet. Hover a component and click it.');
      return;
    }
    let result: CaptureResult;
    try {
      result = captureElement(target, window);
    } catch (error) {
      if (error instanceof CaptureProblem) {
        // A selection that cannot be captured: say why and keep picking.
        say(CAPTURE_PROBLEM_TEXT[error.reason]);
        return;
      }
      stopPicking();
      showOutline(null);
      bar.style.display = 'none';
      showFailure();
      return;
    }
    stopPicking();
    bar.style.display = 'none';
    outline.classList.add('locked');
    say('');
    showSummary(result);
  }

  function openPanel(title: string): HTMLElement {
    panel?.remove();
    panel = el('div', 'panel');
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', title);
    panel.appendChild(el('h2', '', title));
    layer.appendChild(panel);
    return panel;
  }

  function action(label: string, onPress: () => void, primary = false) {
    const button = el('button', primary ? 'primary' : '', label);
    button.type = 'button';
    button.addEventListener('click', onPress);
    return button;
  }

  function showFailure() {
    const box = openPanel('Capture failed');
    box.appendChild(
      el(
        'p',
        '',
        'Layerwake could not read this component. Nothing was saved. You can try a different element.'
      )
    );
    const actions = el('div', 'actions');
    actions.append(
      action(
        'Pick again',
        () => {
          panel?.remove();
          startPicking();
        },
        true
      ),
      action('Close', cleanup)
    );
    box.appendChild(actions);
  }

  function list(title: string, items: string[]) {
    const fragment = doc.createDocumentFragment();
    fragment.appendChild(el('h3', '', title));
    const ul = el('ul');
    for (const item of items) ul.appendChild(el('li', '', item));
    fragment.appendChild(ul);
    return fragment;
  }

  function showSummary(result: CaptureResult) {
    const { capture, bytes, nodeCount, depth } = result;
    const box = openPanel('Capture ready');

    const facts = el('dl');
    const row = (term: string, value: string) =>
      facts.append(el('dt', '', term), el('dd', '', value));
    row(
      'Component',
      `${Math.round(capture.root.box.width)} × ${Math.round(capture.root.box.height)} px`
    );
    row(
      'Layers',
      `${nodeCount} (${depth} level${depth === 1 ? '' : 's'} deep)`
    );
    row(
      'Viewport',
      `${capture.viewport.width} × ${capture.viewport.height} px`
    );
    row('File size', formatBytes(bytes));
    box.appendChild(facts);

    const { truncation, limits } = capture;
    const trimmed: string[] = [];
    if (truncation.nodes) trimmed.push(`the ${limits.maxNodes}-layer limit`);
    if (truncation.depth)
      trimmed.push(`the ${limits.maxDepth}-level depth limit`);
    if (truncation.bytes)
      trimmed.push(`the ${formatBytes(limits.maxBytes)} file limit`);
    if (trimmed.length)
      box.appendChild(
        el(
          'p',
          'warn',
          `Trimmed to fit ${trimmed.join(' and ')}: ${truncation.omittedNodes} layer${truncation.omittedNodes === 1 ? ' was' : 's were'} left out. Pick a smaller component for full detail.`
        )
      );
    if (truncation.inaccessibleFrames)
      box.appendChild(
        el(
          'p',
          'warn',
          `${truncation.inaccessibleFrames} embedded frame${truncation.inaccessibleFrames === 1 ? '' : 's'} inside this component could not be read and will appear as an empty slot.`
        )
      );

    box.appendChild(list('The file includes', CAPTURE_INCLUDES));
    box.appendChild(list('It never includes', CAPTURE_EXCLUDES));

    const done = el('p', 'done');
    done.setAttribute('role', 'status');
    done.style.display = 'none';
    box.appendChild(done);

    const actions = el('div', 'actions');
    const download = action(
      'Download Layerwake JSON',
      () => {
        try {
          const stamp = new Date()
            .toISOString()
            .replace(/[:.]/g, '-')
            .slice(0, 19);
          const url = URL.createObjectURL(
            new Blob([result.json], { type: 'application/json' })
          );
          const link = doc.createElement('a');
          link.href = url;
          link.download = `layerwake-capture-${stamp}.json`;
          shadow.appendChild(link);
          link.click();
          link.remove();
          window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
          done.textContent =
            'Saved to your downloads. Open Layerwake and choose “Import capture”.';
        } catch {
          done.textContent =
            'The download was blocked by this page. Nothing was saved.';
        }
        done.style.display = 'block';
      },
      true
    );
    actions.append(
      download,
      action('Pick again', () => {
        panel?.remove();
        panel = null;
        startPicking();
      }),
      action('Close', cleanup)
    );
    box.appendChild(actions);
    download.focus();
  }

  cancelButton.addEventListener('click', cleanup);
  doc.addEventListener('keydown', onKey, true);
  window.addEventListener('scroll', onViewportChange, true);
  window.addEventListener('resize', onViewportChange, true);

  try {
    startPicking();
  } catch {
    cleanup();
  }
}

start();
