/**
 * The normalized component model. A validated capture is turned into a tree
 * of nodes with readable names, layout declarations and design tokens.
 * The live preview and every export are generated from this one model, so
 * they always agree.
 */

import { formatColor, parseColor, parsePx, px } from './css-values';
import { placeholderText } from './placeholder';
import {
  CORNERS,
  INHERITED_PROPS,
  SIDES,
  TEXT_RUN_TAG,
  type Box,
  type Capture,
  type CaptureNode,
  type Slot,
  type Truncation,
} from './schema';

export type Part = string | { token: string };
export interface Decl {
  prop: string;
  parts: Part[];
}

export type TokenGroup = 'color' | 'fontSize' | 'space' | 'radius' | 'shadow';

export interface Token {
  /** Stable key, independent of display order (e.g. "space:16"). */
  id: string;
  group: TokenGroup;
  /** Readable name without the variable prefix (e.g. "space-3"). */
  name: string;
  cssVar: string;
  /** Measured value. Colors are hex, sizes are px. */
  original: string;
  uses: { nodeId: string; prop: string }[];
  /** Editing bounds for numeric tokens, in px. */
  min?: number;
  max?: number;
}

export type LayoutKind =
  | 'row'
  | 'column'
  | 'grid'
  | 'stack'
  | 'inline'
  | 'leaf'
  | 'simplified';

export interface Note {
  nodeId: string;
  text: string;
}

export interface ModelNode {
  id: string;
  parentId: string | null;
  depth: number;
  /** Inferred, readable and unique within the component. */
  name: string;
  /** Sanitized tag from the capture. */
  sourceTag: string;
  /** Element used in the preview and the exported HTML. */
  tag: string;
  slot: Slot;
  box: Box;
  /** Validated computed styles exactly as captured. */
  measured: Record<string, string>;
  /** Inherited typography resolved through the captured ancestors. */
  effective: Record<string, string>;
  omitted: string[];
  layout: { kind: LayoutKind; label: string; detail: string };
  decls: Decl[];
  notes: string[];
  textLength: number;
  placeholder: string;
  children: ModelNode[];
}

export interface Model {
  root: ModelNode;
  byId: Record<string, ModelNode>;
  /** Node ids in document order. */
  order: string[];
  tokens: Token[];
  tokenById: Record<string, Token>;
  notes: Note[];
  viewport: Capture['viewport'];
  truncation: Truncation;
}

export interface Edits {
  /** Token id → edited value (hex color or px length). */
  tokens: Record<string, string>;
  /** Node id → edited placeholder text. */
  text: Record<string, string>;
}

export const EMPTY_EDITS: Edits = { tokens: {}, text: {} };

export const VAR_PREFIX = '--lw-';

const BLOCK_TAGS = [
  'div',
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'section',
  'article',
  'header',
  'footer',
  'nav',
  'aside',
  'figure',
  'figcaption',
];
const INLINE_TAGS = ['span', 'a', 'strong', 'em', 'small', 'label'];

const IMAGE_PLACEHOLDER =
  'repeating-linear-gradient(135deg, #dce4f7 0 6px, #edf1fb 6px 12px)';

const num = (value: string | undefined): number => {
  if (value === undefined) return 0;
  return parsePx(value) ?? 0;
};

const sameParts = (a: Part[], b: Part[]) =>
  JSON.stringify(a) === JSON.stringify(b);

/** Collapse [top, right, bottom, left] into the shortest CSS shorthand. */
function shorthand(values: Part[][]): Part[] {
  const [t, r, b, l] = values;
  let keep: Part[][];
  if (sameParts(t, r) && sameParts(t, b) && sameParts(t, l)) keep = [t];
  else if (sameParts(t, b) && sameParts(r, l)) keep = [t, r];
  else if (sameParts(r, l)) keep = [t, r, b];
  else keep = [t, r, b, l];
  return keep.flatMap((parts, i) => (i === 0 ? parts : [' ', ...parts]));
}

function renderTagFor(node: CaptureNode, isRoot: boolean): string {
  const { tag, slot } = node;
  if (tag === TEXT_RUN_TAG) return 'span';
  if (slot === 'image' || slot === 'control') return 'div';
  if (tag === 'button') return 'button';
  if (tag === 'time') return isRoot ? 'div' : 'span';
  if (tag === 'main' || tag === 'form') return 'div';
  if (BLOCK_TAGS.includes(tag) || INLINE_TAGS.includes(tag)) return tag;
  return 'div';
}

function defaultDisplay(tag: string): 'block' | 'inline' | 'inline-block' {
  if (tag === 'button') return 'inline-block';
  return INLINE_TAGS.includes(tag) ? 'inline' : 'block';
}

interface Build {
  nodes: ModelNode[];
  tokens: Map<string, Token & { roles: string[]; sort: number }>;
  notes: Note[];
}

function createNodes(
  source: CaptureNode,
  parent: ModelNode | null,
  build: Build
): ModelNode {
  const id = `n${build.nodes.length + 1}`;
  const effective: Record<string, string> = {};
  for (const prop of INHERITED_PROPS) {
    const value = source.styles[prop] ?? parent?.effective[prop];
    if (value !== undefined) effective[prop] = value;
  }
  const node: ModelNode = {
    id,
    parentId: parent?.id ?? null,
    depth: parent ? parent.depth + 1 : 0,
    name: '',
    sourceTag: source.tag,
    tag: renderTagFor(source, parent === null),
    slot: source.slot,
    box: source.box,
    measured: source.styles,
    effective,
    omitted: source.omitted ?? [],
    layout: { kind: 'leaf', label: '', detail: '' },
    decls: [],
    notes: [],
    textLength: source.textLength ?? 0,
    placeholder: '',
    children: [],
  };
  build.nodes.push(node);
  node.children = source.children.map((child) =>
    createNodes(child, node, build)
  );
  return node;
}

const hasText = (node: ModelNode): boolean =>
  node.slot === 'text' || node.children.some(hasText);

function displayKind(node: ModelNode): LayoutKind {
  if (node.slot !== 'container') return 'leaf';
  const display = node.measured.display ?? 'block';
  if (display === 'flex' || display === 'inline-flex')
    return (node.measured['flex-direction'] ?? 'row').startsWith('column')
      ? 'column'
      : 'row';
  if (display === 'grid' || display === 'inline-grid') return 'grid';
  if (display.startsWith('table') || display === 'contents')
    return 'simplified';
  if (display === 'inline') return 'inline';
  return 'stack';
}

/* ------------------------------------------------------------------ names */

function nameNodes(build: Build) {
  const textNodes = build.nodes.filter((n) => n.slot === 'text');
  const sizes = textNodes.map((n) => num(n.effective['font-size']));
  const maxSize = Math.max(0, ...sizes);
  const minSize = Math.min(maxSize, ...sizes);
  let headlineTaken = false;
  const used = new Map<string, number>();

  for (const node of build.nodes) {
    let base: string;
    const m = node.measured;
    const size = num(node.effective['font-size']);
    if (node.parentId === null) base = 'root';
    else if (node.sourceTag === TEXT_RUN_TAG) base = 'text';
    else if (node.slot === 'image')
      base = node.box.width <= 40 && node.box.height <= 40 ? 'icon' : 'image';
    else if (node.slot === 'control') base = 'field';
    else if (node.sourceTag === 'button' || node.sourceTag === 'a')
      base = 'action';
    else if (node.slot === 'text') {
      const filled = m['background-color'] !== undefined;
      const rounded = CORNERS.some((c) => m[`border-${c}-radius`]);
      if (filled && rounded && node.textLength <= 28) base = 'badge';
      else if (size === maxSize && maxSize > minSize && !headlineTaken) {
        base = 'headline';
        headlineTaken = true;
      } else if (/^h[1-6]$/.test(node.sourceTag)) base = 'heading';
      else if (
        node.textLength <= 32 &&
        (node.effective['text-transform'] === 'uppercase' || size <= 12)
      )
        base = 'label';
      else if (node.sourceTag === 'p' || node.textLength > 60) base = 'body';
      else base = 'text';
    } else if (['header', 'footer', 'nav', 'figure'].includes(node.sourceTag))
      base = node.sourceTag;
    else if (node.sourceTag === 'ul' || node.sourceTag === 'ol') base = 'list';
    else if (node.sourceTag === 'li') base = 'item';
    else {
      const kind = displayKind(node);
      base = kind === 'row' ? 'row' : kind === 'grid' ? 'grid' : 'group';
    }
    const count = (used.get(base) ?? 0) + 1;
    used.set(base, count);
    node.name = count === 1 ? base : `${base}-${count}`;
  }
}

/* ----------------------------------------------------------------- tokens */

function tokenRef(
  build: Build,
  group: TokenGroup,
  value: string,
  node: ModelNode,
  prop: string,
  role = ''
): Part {
  const id = `${group}:${value}`;
  let token = build.tokens.get(id);
  if (!token) {
    token = {
      id,
      group,
      name: '',
      cssVar: '',
      original: value,
      uses: [],
      roles: [],
      sort: parsePx(value) ?? build.tokens.size,
    };
    build.tokens.set(id, token);
  }
  token.uses.push({ nodeId: node.id, prop });
  if (role) token.roles.push(role);
  return { token: id };
}

const spacePart = (
  build: Build,
  value: number,
  node: ModelNode,
  prop: string
): Part[] => [
  value > 0 ? tokenRef(build, 'space', px(value), node, prop) : '0',
];

function finalizeTokens(build: Build, root: ModelNode): Token[] {
  const all = [...build.tokens.values()];
  const result: Token[] = [];
  const surface = root.measured['background-color'];

  const colorCounts = new Map<string, number>();
  for (const token of all.filter((t) => t.group === 'color')) {
    let name: string;
    if (token.original === surface) name = 'color-surface';
    else {
      const tally = (role: string) =>
        token.roles.filter((r) => r === role).length;
      const role = ['fill', 'text', 'border'].reduce((best, r) =>
        tally(r) > tally(best) ? r : best
      );
      const n = (colorCounts.get(role) ?? 0) + 1;
      colorCounts.set(role, n);
      name = `color-${role}-${n}`;
    }
    result.push({ ...strip(token), name });
  }

  const numeric = (group: TokenGroup, label: string, cap: number) => {
    all
      .filter((t) => t.group === group)
      .sort((a, b) => a.sort - b.sort)
      .forEach((token, index) => {
        const value = parsePx(token.original) ?? 0;
        result.push({
          ...strip(token),
          name: `${label}-${index + 1}`,
          min: group === 'fontSize' ? 8 : 0,
          max: Math.max(cap, Math.ceil(value)),
        });
      });
  };
  numeric('fontSize', 'font-size', 96);
  numeric('space', 'space', 96);
  numeric('radius', 'radius', 64);

  all
    .filter((t) => t.group === 'shadow')
    .forEach((token, index) =>
      result.push({ ...strip(token), name: `shadow-${index + 1}` })
    );

  for (const token of result) token.cssVar = `${VAR_PREFIX}${token.name}`;
  return result;
}

function strip(token: Token & { roles: string[]; sort: number }): Token {
  const { roles: _roles, sort: _sort, ...rest } = token;
  return rest;
}

/* ----------------------------------------------------------- declarations */

function lineHeightRatio(node: ModelNode): number | null {
  const value = node.effective['line-height'];
  if (!value || value === 'normal') return null;
  const size = num(node.effective['font-size']);
  const asPx = parsePx(value);
  if (asPx !== null) return size > 0 ? asPx / size : null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

const trim = (n: number, places = 3) => String(Number(n.toFixed(places)));

function gridColumns(value: string): { css: string; count: number } | null {
  if (value === 'none') return null;
  const tracks = value.split(' ');
  const sizes = tracks.map((t) => parseFloat(t));
  if (tracks.some((t) => t === 'auto') || sizes.some((s) => !(s > 0)))
    return {
      css: `repeat(${tracks.length}, minmax(0, 1fr))`,
      count: tracks.length,
    };
  const min = Math.min(...sizes);
  const max = Math.max(...sizes);
  if (max - min <= 1)
    return {
      css:
        tracks.length === 1
          ? 'minmax(0, 1fr)'
          : `repeat(${tracks.length}, minmax(0, 1fr))`,
      count: tracks.length,
    };
  return {
    css: sizes.map((s) => `minmax(0, ${trim(s / min, 2)}fr)`).join(' '),
    count: tracks.length,
  };
}

function buildDecls(node: ModelNode, parent: ModelNode | null, build: Build) {
  const m = node.measured;
  const decls: Decl[] = [];
  const add = (prop: string, ...parts: Part[]) => decls.push({ prop, parts });
  const note = (text: string) => {
    node.notes.push(text);
    build.notes.push({ nodeId: node.id, text });
  };

  const kind = displayKind(node);
  const display = m.display ?? 'block';
  const parentKind = parent ? displayKind(parent) : null;
  const inFlex = parentKind === 'row' || parentKind === 'column';
  const position = m.position ?? 'static';
  const absolute = position === 'absolute' || position === 'fixed';
  const isTextRun = node.sourceTag === TEXT_RUN_TAG;

  /* layout label */
  if (node.slot === 'text') node.layout = { kind, label: 'Text', detail: '' };
  else if (node.slot === 'image')
    node.layout = { kind, label: 'Image slot', detail: '' };
  else if (node.slot === 'control')
    node.layout = { kind, label: 'Control slot', detail: '' };
  else if (kind === 'row' || kind === 'column') {
    const bits = [];
    if (m['flex-wrap'] === 'wrap') bits.push('wraps');
    const justify = m['justify-content'];
    if (justify && justify !== 'normal' && justify !== 'flex-start')
      bits.push(`justify ${justify}`);
    const align = m['align-items'];
    if (align && align !== 'normal' && align !== 'stretch')
      bits.push(`align ${align}`);
    node.layout = {
      kind,
      label: kind === 'row' ? 'Flex row' : 'Flex column',
      detail: bits.join(' · '),
    };
  } else if (kind === 'grid') {
    const columns = gridColumns(m['grid-template-columns'] ?? 'none');
    node.layout = {
      kind,
      label: 'Grid',
      detail: columns
        ? `${columns.count} column${columns.count === 1 ? '' : 's'}`
        : '',
    };
  } else if (kind === 'simplified')
    node.layout = { kind, label: 'Simplified', detail: `was ${display}` };
  else if (kind === 'inline')
    node.layout = { kind, label: 'Inline', detail: '' };
  else
    node.layout = {
      kind,
      label: node.children.length > 1 ? 'Stack' : 'Block',
      detail: '',
    };

  if (isTextRun) {
    node.decls = decls;
    return;
  }

  /* limitations the user should see */
  if (kind === 'simplified')
    note(
      `"${display}" layout is not rebuilt. Its children are stacked as blocks instead.`
    );
  if (m.float && m.float !== 'none')
    note('Float is not rebuilt. This layer follows normal flow instead.');
  if (position === 'sticky')
    note('Sticky positioning is not rebuilt. This layer scrolls normally.');
  if (absolute)
    note(
      `${position === 'fixed' ? 'Fixed' : 'Absolute'} positioning is approximated with the measured offset inside its parent. It will not adapt when the component resizes.`
    );
  if (node.omitted.includes('background-image'))
    note(
      'A background image was left out of the capture. Asset URLs are never recorded.'
    );
  if (node.sourceTag === 'iframe')
    note(
      'Frame content is not accessible to a capture. Shown as an empty slot.'
    );

  /* position */
  const contentWidth = parent
    ? parent.box.width -
      num(parent.measured['padding-left']) -
      num(parent.measured['padding-right']) -
      num(parent.measured['border-left-width']) -
      num(parent.measured['border-right-width'])
    : 0;

  if (absolute && parent) {
    add('position', 'absolute');
    add(
      'left',
      px(node.box.x - parent.box.x - num(parent.measured['border-left-width']))
    );
    add(
      'top',
      px(node.box.y - parent.box.y - num(parent.measured['border-top-width']))
    );
    add('width', px(node.box.width));
    add('height', px(node.box.height));
  } else if (
    node.children.some((c) =>
      ['absolute', 'fixed'].includes(c.measured.position)
    )
  ) {
    add('position', 'relative');
  }

  /* display */
  const tagDefault = defaultDisplay(node.tag);
  let effectiveDisplay: string = tagDefault;
  if (kind === 'row' || kind === 'column')
    effectiveDisplay = display === 'inline-flex' ? 'inline-flex' : 'flex';
  else if (kind === 'grid')
    effectiveDisplay = display === 'inline-grid' ? 'inline-grid' : 'grid';
  else if (display === 'inline-block') effectiveDisplay = 'inline-block';
  else if (display === 'inline')
    effectiveDisplay = parent === null ? 'block' : 'inline';
  else effectiveDisplay = 'block';
  if (node.slot === 'image' || node.slot === 'control')
    effectiveDisplay = display.startsWith('inline') ? 'inline-block' : 'block';
  if (effectiveDisplay !== tagDefault) add('display', effectiveDisplay);

  /* container layout */
  if (kind === 'row' || kind === 'column' || kind === 'grid') {
    if (kind !== 'grid') {
      const direction = m['flex-direction'];
      if (direction && direction !== 'row') add('flex-direction', direction);
      const wrap = m['flex-wrap'];
      if (wrap && wrap !== 'nowrap') add('flex-wrap', wrap);
    } else {
      const columns = gridColumns(m['grid-template-columns'] ?? 'none');
      if (columns) add('grid-template-columns', columns.css);
    }
    const justify = m['justify-content'];
    if (justify && justify !== 'normal' && justify !== 'flex-start')
      add('justify-content', justify);
    const align = m['align-items'];
    if (align && align !== 'normal' && align !== 'stretch')
      add('align-items', align);
    const rowGap = num(m['row-gap']);
    const columnGap = num(m['column-gap']);
    if (rowGap > 0 || columnGap > 0) {
      const row = spacePart(build, rowGap, node, 'row-gap');
      const column = spacePart(build, columnGap, node, 'column-gap');
      add('gap', ...(sameParts(row, column) ? row : [...row, ' ', ...column]));
    }
  }

  /* placement inside the parent */
  const grow = Number(m['flex-grow'] ?? 0);
  const shrink = Number(m['flex-shrink'] ?? 1);
  if (inFlex && !absolute) {
    if (grow > 0) {
      const basis = m['flex-basis'] ?? 'auto';
      add(
        'flex',
        `${trim(grow)} ${trim(shrink)} ${basis === '0px' ? '0%' : basis}`
      );
    } else if (shrink === 0) add('flex', 'none');
    const self = m['align-self'];
    if (self && self !== 'auto' && self !== 'normal') add('align-self', self);
  }
  if (parentKind === 'grid' && !absolute) {
    for (const axis of ['column', 'row'] as const) {
      const start = m[`grid-${axis}-start`] ?? 'auto';
      const end = m[`grid-${axis}-end`] ?? 'auto';
      if (start !== 'auto' || end !== 'auto')
        add(`grid-${axis}`, end === 'auto' ? start : `${start} / ${end}`);
    }
  }

  /* size */
  const empty = node.slot === 'container' && node.children.length === 0;
  const fixedSlot = node.slot === 'image' || node.slot === 'control' || empty;
  const fills =
    parent !== null &&
    ((parentKind === 'row' && grow > 0) ||
      (parentKind !== 'row' &&
        parentKind !== 'grid' &&
        Math.abs(node.box.width - contentWidth) <= 1.5));
  const marginLeft = num(m['margin-left']);
  const marginRight = num(m['margin-right']);
  let centered = false;

  if (parent === null) {
    add('width', px(node.box.width));
    add('max-width', '100%');
  } else if (!absolute) {
    if (fixedSlot) {
      if (!fills && parentKind !== 'grid') {
        add('width', px(node.box.width));
        add('max-width', '100%');
      }
      if (node.slot === 'image' && node.box.height > 4 && !fills)
        add(
          'aspect-ratio',
          `${trim(node.box.width, 2)} / ${trim(node.box.height, 2)}`
        );
      else add('height', px(node.box.height));
      if (inFlex && grow === 0 && shrink !== 0 && node.slot === 'image')
        add('flex', 'none');
    } else if (inFlex && grow === 0 && shrink === 0) {
      add('width', px(node.box.width));
    } else if (
      (parentKind === 'stack' || parentKind === 'simplified') &&
      effectiveDisplay !== 'inline' &&
      effectiveDisplay !== 'inline-block' &&
      effectiveDisplay !== 'inline-flex' &&
      effectiveDisplay !== 'inline-grid' &&
      node.box.width < contentWidth - 1.5
    ) {
      add('width', px(node.box.width));
      add('max-width', '100%');
      centered = marginLeft > 1 && Math.abs(marginLeft - marginRight) <= 1;
    }
  }

  /* margin (never on the root: it belongs to the page, not the component) */
  if (parent !== null && !absolute) {
    const margins = SIDES.map((side) => num(m[`margin-${side}`]));
    if (centered) {
      if (margins[0] !== 0 || margins[2] !== 0)
        add('margin-block', px(margins[0]), ' ', px(margins[2]));
      add('margin-inline', 'auto');
    } else if (margins.some((v) => v !== 0)) {
      add('margin', ...shorthand(margins.map((v) => [v === 0 ? '0' : px(v)])));
    }
  }

  /* padding */
  const paddings = SIDES.map((side) => num(m[`padding-${side}`]));
  if (paddings.some((v) => v > 0))
    add(
      'padding',
      ...shorthand(
        paddings.map((v, i) => spacePart(build, v, node, `padding-${SIDES[i]}`))
      )
    );

  /* fill */
  const background = m['background-color'];
  if (background && (parseColor(background)?.a ?? 0) > 0)
    add(
      'background-color',
      tokenRef(build, 'color', background, node, 'background-color', 'fill')
    );
  const image = m['background-image'];
  if (image && image !== 'none') add('background-image', image);
  else if (node.slot === 'image') add('background-image', IMAGE_PLACEHOLDER);
  if (m.opacity !== undefined && Number(m.opacity) < 1)
    add('opacity', m.opacity);

  /* border */
  const borders = SIDES.map((side): Part[] | null => {
    const width = num(m[`border-${side}-width`]);
    const style = m[`border-${side}-style`] ?? 'none';
    if (width <= 0 || style === 'none' || style === 'hidden') return null;
    const borderColor = m[`border-${side}-color`];
    return [
      `${px(width)} ${style} `,
      borderColor
        ? tokenRef(
            build,
            'color',
            borderColor,
            node,
            `border-${side}-color`,
            'border'
          )
        : 'currentColor',
    ];
  });
  if (borders.every((b) => b !== null && sameParts(b, borders[0]!)))
    add('border', ...borders[0]!);
  else
    borders.forEach((border, i) => {
      if (border) add(`border-${SIDES[i]}`, ...border);
    });

  /* radius */
  const radii = CORNERS.map((corner): Part[] => {
    const value = m[`border-${corner}-radius`];
    if (!value) return ['0'];
    const asPx = parsePx(value);
    if (asPx === null) return [value];
    if (asPx === 0) return ['0'];
    return [
      tokenRef(build, 'radius', px(asPx), node, `border-${corner}-radius`),
    ];
  });
  if (radii.some((r) => r[0] !== '0')) {
    // An elliptical corner ("12px 8px") cannot sit inside the shorthand.
    if (radii.some((r) => typeof r[0] === 'string' && r[0].includes(' ')))
      radii.forEach((r, i) => {
        if (r[0] !== '0') add(`border-${CORNERS[i]}-radius`, ...r);
      });
    else add('border-radius', ...shorthand(radii));
  }

  /* shadow */
  const shadow = m['box-shadow'];
  if (shadow && shadow !== 'none')
    add('box-shadow', tokenRef(build, 'shadow', shadow, node, 'box-shadow'));

  /* clipping */
  const clips = (v?: string) => v === 'hidden' || v === 'clip';
  if (clips(m['overflow-x']) || clips(m['overflow-y']))
    add('overflow', 'hidden');
  if (m['text-overflow'] === 'ellipsis') add('text-overflow', 'ellipsis');

  /* typography: only where it changes, and only where there is text */
  if (hasText(node)) {
    const own = node.effective;
    const base = parent?.effective ?? {};
    const changed = (prop: string) =>
      own[prop] !== undefined && own[prop] !== base[prop];
    const rootDefault: Record<string, string[]> = {
      'text-align': ['start', 'left'],
      'text-transform': ['none'],
      'white-space': ['normal'],
      'font-style': ['normal'],
    };
    const emit = (prop: string) =>
      changed(prop) &&
      !(parent === null && rootDefault[prop]?.includes(own[prop]));

    if (changed('font-family')) add('font-family', own['font-family']);
    if (changed('font-size'))
      add(
        'font-size',
        tokenRef(build, 'fontSize', own['font-size'], node, 'font-size')
      );
    if (changed('font-weight')) add('font-weight', own['font-weight']);
    if (emit('font-style')) add('font-style', own['font-style']);

    const ratio = lineHeightRatio(node);
    const parentRatio = parent ? lineHeightRatio(parent) : null;
    if (
      ratio !== null &&
      (parentRatio === null || Math.abs(ratio - parentRatio) > 0.005)
    )
      add('line-height', trim(ratio));
    else if (ratio === null && parentRatio !== null)
      add('line-height', 'normal');

    const spacing = (n: ModelNode) => num(n.effective['letter-spacing']);
    if (spacing(node) !== (parent ? spacing(parent) : 0)) {
      const size = num(own['font-size']);
      add(
        'letter-spacing',
        spacing(node) === 0 || size === 0
          ? 'normal'
          : `${trim(spacing(node) / size)}em`
      );
    }
    if (changed('color'))
      add('color', tokenRef(build, 'color', own.color, node, 'color', 'text'));
    if (emit('text-align'))
      add('text-align', own['text-align'].replace('-webkit-', ''));
    if (emit('text-transform')) add('text-transform', own['text-transform']);
    if (emit('white-space')) add('white-space', own['white-space']);
  }
  const decoration = m['text-decoration-line'];
  if (decoration && decoration !== 'none') add('text-decoration', decoration);
  if (
    (node.sourceTag === 'ul' || node.sourceTag === 'ol') &&
    m['list-style-type']
  )
    if (m['list-style-type'] !== 'none')
      add('list-style', `${m['list-style-type']} outside`);

  node.decls = decls;
}

/* ------------------------------------------------------------------ build */

export function buildModel(capture: Capture): Model {
  const build: Build = { nodes: [], tokens: new Map(), notes: [] };
  const root = createNodes(capture.root, null, build);
  nameNodes(build);

  const byId: Record<string, ModelNode> = {};
  for (const node of build.nodes) byId[node.id] = node;
  build.nodes.forEach((node, index) => {
    if (node.slot === 'text')
      node.placeholder = placeholderText(node.textLength, index);
    buildDecls(node, node.parentId ? byId[node.parentId] : null, build);
  });

  const tokens = finalizeTokens(build, root);
  const tokenById: Record<string, Token> = {};
  for (const token of tokens) tokenById[token.id] = token;

  return {
    root,
    byId,
    order: build.nodes.map((n) => n.id),
    tokens,
    tokenById,
    notes: build.notes,
    viewport: capture.viewport,
    truncation: capture.truncation,
  };
}

/* ---------------------------------------------------------------- resolve */

/** Current value of a token, formatted for CSS. */
export function tokenValue(token: Token, edits: Edits): string {
  const value = edits.tokens[token.id] ?? token.original;
  return token.group === 'color' ? formatColor(value) : value;
}

export const isEdited = (token: Token, edits: Edits) =>
  edits.tokens[token.id] !== undefined &&
  edits.tokens[token.id] !== token.original;

/** Declaration value with tokens written as CSS variable references. */
export function declValue(decl: Decl, model: Model): string {
  return decl.parts
    .map((part) =>
      typeof part === 'string'
        ? part
        : `var(${model.tokenById[part.token].cssVar})`
    )
    .join('');
}

/** CSS variable name → current value, for every token in the model. */
export function tokenVariables(
  model: Model,
  edits: Edits
): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const token of model.tokens)
    vars[token.cssVar] = tokenValue(token, edits);
  return vars;
}

export function nodeText(node: ModelNode, edits: Edits): string {
  return edits.text[node.id] ?? node.placeholder;
}

/** Tokens referenced by a node's declarations, keyed by declaration. */
export function tokensForNode(
  node: ModelNode,
  model: Model
): { prop: string; token: Token }[] {
  const seen = new Set<string>();
  const out: { prop: string; token: Token }[] = [];
  for (const decl of node.decls)
    for (const part of decl.parts)
      if (typeof part !== 'string' && !seen.has(`${decl.prop}|${part.token}`)) {
        seen.add(`${decl.prop}|${part.token}`);
        out.push({ prop: decl.prop, token: model.tokenById[part.token] });
      }
  return out;
}

export function countNodes(model: Model): number {
  return model.order.length;
}

export function maxDepth(model: Model): number {
  return Math.max(...model.order.map((id) => model.byId[id].depth));
}
