/**
 * DOM capture. Runs inside the page (from the extension's content script) and
 * reads only what the capture format allows: generic tag names, boxes and an
 * allowlist of computed styles. It never reads text content, attributes,
 * form values, URLs, scripts or stylesheets.
 */

import {
  color as normalizeHex,
  sanitizeStyle,
  STYLE_PROPS,
} from './css-values';
import {
  CAPTURE_FORMAT,
  CONTROL_TAGS,
  IMAGE_TAGS,
  INHERITED_PROPS,
  LIMITS,
  SCHEMA_VERSION,
  SIDES,
  TAGS,
  TEXT_RUN_TAG,
  type Box,
  type Capture,
  type CaptureNode,
  type Slot,
} from './schema';

/** Elements that are never captured, not even as an empty box. */
const SKIPPED_TAGS = [
  'script',
  'style',
  'link',
  'meta',
  'template',
  'noscript',
  'head',
  'title',
  'base',
  'br',
  'wbr',
  'datalist',
  'option',
  'optgroup',
  'source',
  'track',
  'param',
  'slot',
];

const FRAME_TAGS = ['iframe', 'frame', 'object', 'embed'];

const COLOR_PROPS = [
  'color',
  'background-color',
  ...SIDES.map((side) => `border-${side}-color`),
];

const round = (n: number) => Math.round(n * 100) / 100;

export type CaptureFailure =
  | 'no-size'
  | 'frame'
  | 'not-rendered'
  | 'unsupported-element';

export class CaptureProblem extends Error {
  constructor(public reason: CaptureFailure) {
    super(reason);
  }
}

export const CAPTURE_PROBLEM_TEXT: Record<CaptureFailure, string> = {
  'no-size': 'That element has no visible size. Pick something you can see.',
  frame:
    'That is an embedded frame. Its content is not accessible, so it cannot be captured.',
  'not-rendered': 'That element is hidden, so there is nothing to measure.',
  'unsupported-element':
    'That element cannot be captured. Pick a different one.',
};

interface Context {
  win: Window;
  origin: DOMRect;
  budget: number;
  count: number;
  truncation: Capture['truncation'];
  canvas: CanvasRenderingContext2D | null | undefined;
}

function genericTag(el: Element): string {
  const name = el.localName.toLowerCase();
  if (FRAME_TAGS.includes(name)) return 'iframe';
  return TAGS.includes(name) && name !== TEXT_RUN_TAG ? name : 'div';
}

/** Normalize any CSS color the browser understands to something we accept. */
function readColor(ctx: Context, value: string): string | null {
  const direct = normalizeHex(value);
  if (direct) return direct;
  try {
    if (ctx.canvas === undefined) {
      const canvas = ctx.win.document.createElement('canvas');
      canvas.width = canvas.height = 1;
      ctx.canvas = canvas.getContext('2d', { willReadFrequently: true });
    }
    const c = ctx.canvas;
    if (!c) return null;
    c.clearRect(0, 0, 1, 1);
    c.fillStyle = '#000';
    c.fillStyle = value;
    c.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = c.getImageData(0, 0, 1, 1).data;
    if (a === 0) return '#00000000';
    const alpha = a / 255;
    return normalizeHex(
      `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(b)}, ${Math.round(alpha * 1000) / 1000})`
    );
  } catch {
    return null;
  }
}

function isDefault(prop: string, value: string): boolean {
  if (/^(padding|margin)-/.test(prop)) return value === '0px';
  if (/-radius$/.test(prop)) return value === '0px';
  switch (prop) {
    case 'position':
      return value === 'static';
    case 'float':
      return value === 'none';
    case 'box-shadow':
    case 'background-image':
    case 'text-decoration-line':
      return value === 'none';
    case 'opacity':
      return value === '1';
    case 'text-overflow':
      return value === 'clip';
    case 'overflow-x':
    case 'overflow-y':
      return value === 'visible';
    case 'align-self':
      return value === 'auto';
    default:
      return false;
  }
}

function readStyles(
  ctx: Context,
  el: Element,
  parentStyles: CSSStyleDeclaration | null,
  tag: string
): { styles: Record<string, string>; omitted: string[] } {
  const computed = ctx.win.getComputedStyle(el);
  const styles: Record<string, string> = {};
  const omitted: string[] = [];
  const display = computed.display;
  const isFlex = display === 'flex' || display === 'inline-flex';
  const isGrid = display === 'grid' || display === 'inline-grid';
  const parentDisplay = parentStyles?.display ?? '';
  const inFlex = parentDisplay === 'flex' || parentDisplay === 'inline-flex';
  const inGrid = parentDisplay === 'grid' || parentDisplay === 'inline-grid';

  for (const prop of STYLE_PROPS) {
    let value = computed.getPropertyValue(prop).trim();
    if (!value) continue;

    // Keep the file small: record a property only where it can matter.
    if (['flex-direction', 'flex-wrap'].includes(prop) && !isFlex) continue;
    if (
      [
        'justify-content',
        'align-items',
        'align-content',
        'row-gap',
        'column-gap',
      ].includes(prop) &&
      !isFlex &&
      !isGrid
    )
      continue;
    if (prop === 'grid-template-columns' && !isGrid) continue;
    if (['flex-grow', 'flex-shrink', 'flex-basis'].includes(prop) && !inFlex)
      continue;
    if (
      /^grid-(row|column)-(start|end)$/.test(prop) &&
      (!inGrid || value === 'auto')
    )
      continue;
    if (prop === 'align-self' && !inFlex && !inGrid) continue;
    if (prop === 'list-style-type' && tag !== 'ul' && tag !== 'ol') continue;
    if (
      parentStyles &&
      INHERITED_PROPS.includes(prop) &&
      parentStyles.getPropertyValue(prop).trim() === value
    )
      continue;
    const border = /^border-(top|right|bottom|left)-(width|style|color)$/.exec(
      prop
    );
    if (border) {
      const width = computed.getPropertyValue(`border-${border[1]}-width`);
      const style = computed.getPropertyValue(`border-${border[1]}-style`);
      if (width === '0px' || style === 'none' || style === 'hidden') continue;
    }
    if (isDefault(prop, value)) continue;

    if (COLOR_PROPS.includes(prop)) {
      const hex = readColor(ctx, value);
      if (!hex) {
        omitted.push(prop);
        continue;
      }
      if (prop === 'background-color' && hex.length === 9 && hex.endsWith('00'))
        continue;
      value = hex;
    }

    const safe = sanitizeStyle(prop, value);
    if (safe === null) {
      // Present, but not something a capture may contain (e.g. an image URL).
      omitted.push(prop);
      continue;
    }
    styles[prop] = safe;
  }
  return { styles, omitted };
}

function relativeBox(ctx: Context, rect: DOMRect): Box {
  return {
    x: round(rect.left - ctx.origin.left),
    y: round(rect.top - ctx.origin.top),
    width: round(rect.width),
    height: round(rect.height),
  };
}

const textLengthOf = (text: string | null) =>
  Math.min(
    (text ?? '').replace(/\s+/g, ' ').trim().length,
    LIMITS.maxTextLength
  );

function isRendered(ctx: Context, el: Element): boolean {
  const style = ctx.win.getComputedStyle(el);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

interface Pending {
  el: Element;
  node: CaptureNode;
  depth: number;
}

function makeNode(
  ctx: Context,
  el: Element,
  parentEl: Element | null
): CaptureNode {
  const tag = genericTag(el);
  const slot: Slot = IMAGE_TAGS.includes(tag)
    ? 'image'
    : CONTROL_TAGS.includes(tag)
      ? 'control'
      : 'container';
  const parentStyles = parentEl ? ctx.win.getComputedStyle(parentEl) : null;
  const { styles, omitted } = readStyles(ctx, el, parentStyles, tag);
  const node: CaptureNode = {
    tag,
    slot,
    box: relativeBox(ctx, el.getBoundingClientRect()),
    styles,
    children: [],
  };
  if (omitted.length) node.omitted = omitted;
  if (FRAME_TAGS.includes(el.localName.toLowerCase()))
    ctx.truncation.inaccessibleFrames += 1;
  ctx.count += 1;
  return node;
}

function collect(ctx: Context, rootEl: Element): CaptureNode {
  const root = makeNode(ctx, rootEl, null);
  const queue: Pending[] = [{ el: rootEl, node: root, depth: 0 }];

  // Breadth-first, so a node limit trims the deepest detail first.
  while (queue.length) {
    const { el, node, depth } = queue.shift()!;
    if (node.slot !== 'container') continue;

    const elements: Element[] = [];
    const textRuns: Text[] = [];
    let directText = 0;
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === 1) {
        const childEl = child as Element;
        if (SKIPPED_TAGS.includes(childEl.localName.toLowerCase())) continue;
        if (!isRendered(ctx, childEl)) continue;
        elements.push(childEl);
      } else if (child.nodeType === 3) {
        const length = textLengthOf(child.nodeValue);
        if (length > 0) {
          directText += length;
          textRuns.push(child as Text);
        }
      }
    }

    if (elements.length === 0) {
      if (directText > 0) {
        node.slot = 'text';
        node.textLength = Math.min(directText, LIMITS.maxTextLength);
      }
      continue;
    }

    const skip = (reason: 'depth' | 'nodes', amount: number) => {
      ctx.truncation[reason] = true;
      ctx.truncation.omittedNodes += amount;
    };
    if (depth + 1 > LIMITS.maxDepth) {
      skip('depth', elements.length + textRuns.length);
      continue;
    }

    // Keep document order between elements and loose text runs.
    for (const child of Array.from(el.childNodes)) {
      const isElement = elements.includes(child as Element);
      const isText = textRuns.includes(child as Text);
      if (!isElement && !isText) continue;
      if (ctx.count >= ctx.budget) {
        skip('nodes', 1);
        continue;
      }
      if (isText) {
        const range = ctx.win.document.createRange();
        range.selectNodeContents(child);
        node.children.push({
          tag: TEXT_RUN_TAG,
          slot: 'text',
          box: relativeBox(ctx, range.getBoundingClientRect()),
          styles: {},
          textLength: textLengthOf(child.nodeValue),
          children: [],
        });
        ctx.count += 1;
      } else {
        const childNode = makeNode(ctx, child as Element, el);
        node.children.push(childNode);
        queue.push({ el: child as Element, node: childNode, depth: depth + 1 });
      }
    }
  }
  return root;
}

export interface CaptureResult {
  capture: Capture;
  json: string;
  bytes: number;
  nodeCount: number;
  depth: number;
}

function depthOf(node: CaptureNode): number {
  return node.children.length ? 1 + Math.max(...node.children.map(depthOf)) : 0;
}

/**
 * Capture `rootEl` and a bounded subtree. Throws `CaptureProblem` when the
 * element cannot produce a useful capture.
 */
export function captureElement(rootEl: Element, win: Window): CaptureResult {
  const name = rootEl.localName?.toLowerCase() ?? '';
  if (FRAME_TAGS.includes(name)) throw new CaptureProblem('frame');
  if (SKIPPED_TAGS.includes(name) || name === 'html')
    throw new CaptureProblem('unsupported-element');
  if (!isRendered({ win } as Context, rootEl))
    throw new CaptureProblem('not-rendered');
  const origin = rootEl.getBoundingClientRect();
  if (origin.width < 1 || origin.height < 1)
    throw new CaptureProblem('no-size');

  let budget: number = LIMITS.maxNodes;
  let bytesTruncated = false;
  for (let attempt = 0; ; attempt++) {
    const ctx: Context = {
      win,
      origin,
      budget,
      count: 0,
      canvas: undefined,
      truncation: {
        depth: false,
        nodes: false,
        bytes: bytesTruncated,
        omittedNodes: 0,
        inaccessibleFrames: 0,
      },
    };
    const root = collect(ctx, rootEl);
    const capture: Capture = {
      format: CAPTURE_FORMAT,
      schemaVersion: SCHEMA_VERSION,
      capturedAt: new Date().toISOString(),
      viewport: {
        width: win.innerWidth,
        height: win.innerHeight,
        devicePixelRatio: round(win.devicePixelRatio || 1),
      },
      limits: {
        maxDepth: LIMITS.maxDepth,
        maxNodes: LIMITS.maxNodes,
        maxBytes: LIMITS.maxBytes,
      },
      truncation: ctx.truncation,
      root,
    };
    const json = JSON.stringify(capture, null, 2);
    const bytes = new TextEncoder().encode(json).length;
    if (bytes <= LIMITS.maxBytes || budget <= 1 || attempt >= 12)
      return {
        capture,
        json,
        bytes,
        nodeCount: ctx.count,
        depth: depthOf(root),
      };
    // Too large: capture again with fewer nodes and say so in the file.
    bytesTruncated = true;
    budget = Math.max(1, Math.floor(budget * 0.6));
  }
}

/** Plain-language summary of what a capture file does and does not hold. */
export const CAPTURE_INCLUDES = [
  'Viewport size and each layer’s position and size',
  'Generic tag names (div, button, h2 …)',
  'Layout, spacing, color, type, border, radius and shadow values',
  'How long each piece of text is — not the text',
];

export const CAPTURE_EXCLUDES = [
  'Page text, form values and attributes',
  'Page address, links, image or font URLs',
  'Scripts, stylesheets, cookies or history',
];
