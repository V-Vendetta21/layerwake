/**
 * The narrow CSS allowlist. Every style value that enters the app — from the
 * extension or from an imported file — passes through `sanitizeStyle`.
 * Validators return a normalized value, or null when the value is rejected.
 */

import { CORNERS, SIDES } from './schema';

const MAX_VALUE_LENGTH = 400;

/** Anything that could make a browser fetch something, or escape a value. */
const RESOURCE_PATTERN =
  /url\s*\(|image-set|image\s*\(|element\s*\(|src\s*\(|paint\s*\(|expression|javascript:|data:|@import|@font-face|\\|\/\*|[;{}<>]/i;

export function isResourceValue(value: unknown): boolean {
  return typeof value === 'string' && RESOURCE_PATTERN.test(value);
}

type Validator = (value: string) => string | null;

const round = (n: number, places = 2) => {
  const f = 10 ** places;
  return Math.round(n * f) / f;
};

export function parsePx(value: string): number | null {
  if (value === '0') return 0;
  const m = /^(-?\d{1,6}(?:\.\d{1,6})?)px$/.exec(value);
  if (!m) return null;
  const n = Number(m[1]);
  return Number.isFinite(n) ? n : null;
}

export const px = (n: number) => (n === 0 ? '0px' : `${round(n)}px`);

const length =
  (opts: { negative?: boolean } = {}): Validator =>
  (value) => {
    const n = parsePx(value);
    if (n === null) return null;
    if (n < 0 && !opts.negative) return null;
    if (Math.abs(n) > 100_000) return null;
    return px(n);
  };

const oneOf =
  (...allowed: string[]): Validator =>
  (value) =>
    allowed.includes(value) ? value : null;

const numberIn =
  (min: number, max: number): Validator =>
  (value) => {
    if (!/^-?\d{1,6}(\.\d{1,6})?$/.test(value)) return null;
    const n = Number(value);
    return n >= min && n <= max ? String(round(n, 4)) : null;
  };

const firstOf =
  (...validators: Validator[]): Validator =>
  (value) => {
    for (const v of validators) {
      const out = v(value);
      if (out !== null) return out;
    }
    return null;
  };

/* ------------------------------------------------------------------ color */

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const hex2 = (n: number) =>
  Math.max(0, Math.min(255, Math.round(n)))
    .toString(16)
    .padStart(2, '0');

export function toHex({ r, g, b, a }: Rgba): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`;
  return a >= 1 ? base : `${base}${hex2(a * 255)}`;
}

export function parseColor(input: string): Rgba | null {
  const value = input.trim().toLowerCase();
  if (value === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };

  const hex = /^#([0-9a-f]{3,8})$/.exec(value);
  if (hex) {
    const h = hex[1];
    if (h.length === 3 || h.length === 4) {
      const [r, g, b, a] = h.split('').map((c) => parseInt(c + c, 16));
      return { r, g, b, a: a === undefined ? 1 : a / 255 };
    }
    if (h.length === 6 || h.length === 8) {
      const n = (i: number) => parseInt(h.slice(i, i + 2), 16);
      return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 };
    }
    return null;
  }

  const fn =
    /^rgba?\(\s*(\d{1,3}(?:\.\d+)?)\s*[, ]\s*(\d{1,3}(?:\.\d+)?)\s*[, ]\s*(\d{1,3}(?:\.\d+)?)\s*(?:[,/]\s*(\d(?:\.\d+)?|\.\d+|\d{1,3}(?:\.\d+)?%)\s*)?\)$/.exec(
      value
    );
  if (fn) {
    const [r, g, b] = [fn[1], fn[2], fn[3]].map(Number);
    if (r > 255 || g > 255 || b > 255) return null;
    let a = 1;
    if (fn[4] !== undefined) {
      a = fn[4].endsWith('%')
        ? Number(fn[4].slice(0, -1)) / 100
        : Number(fn[4]);
      if (!(a >= 0 && a <= 1)) return null;
    }
    return { r, g, b, a };
  }
  return null;
}

/** Colors are normalized to #rrggbb or #rrggbbaa. */
export const color: Validator = (value) => {
  const rgba = parseColor(value);
  return rgba ? toHex(rgba) : null;
};

/** Human-friendly color for generated CSS: hex when opaque, rgba otherwise. */
export function formatRgba(rgba: Rgba): string {
  if (rgba.a >= 1) return toHex(rgba);
  return `rgba(${Math.round(rgba.r)}, ${Math.round(rgba.g)}, ${Math.round(rgba.b)}, ${round(rgba.a, 3)})`;
}

export function formatColor(hex: string): string {
  const rgba = parseColor(hex);
  return rgba ? formatRgba(rgba) : hex;
}

/* ----------------------------------------------------------- compound values */

/** Split on commas that are not inside parentheses. */
function splitTopLevel(value: string, separator: ',' | ' '): string[] | null {
  const parts: string[] = [];
  let depth = 0;
  let current = '';
  for (const ch of value) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth < 0) return null;
    if (depth === 0 && ch === separator) {
      if (current.trim()) parts.push(current.trim());
      current = '';
    } else {
      current += ch;
    }
  }
  if (depth !== 0) return null;
  if (current.trim()) parts.push(current.trim());
  return parts;
}

const boxShadow: Validator = (value) => {
  if (value === 'none') return 'none';
  const layers = splitTopLevel(value, ',');
  if (!layers || layers.length === 0 || layers.length > 6) return null;
  const out: string[] = [];
  for (const layer of layers) {
    const tokens = splitTopLevel(layer, ' ');
    if (!tokens) return null;
    let inset = false;
    let shadowColor: string | null = null;
    const lengths: string[] = [];
    for (const token of tokens) {
      if (token === 'inset') {
        inset = true;
      } else if (parsePx(token) !== null) {
        lengths.push(px(parsePx(token)!));
      } else {
        const c = parseColor(token);
        if (!c || shadowColor) return null;
        shadowColor = formatRgba(c);
      }
    }
    if (lengths.length < 2 || lengths.length > 4) return null;
    out.push(
      [inset ? 'inset' : '', ...lengths, shadowColor ?? '#000000']
        .filter(Boolean)
        .join(' ')
    );
  }
  return out.join(', ');
};

const GRADIENT_FUNCTIONS = [
  'linear-gradient',
  'radial-gradient',
  'conic-gradient',
  'repeating-linear-gradient',
  'repeating-radial-gradient',
  'repeating-conic-gradient',
  'rgb',
  'rgba',
];

const backgroundImage: Validator = (value) => {
  if (value === 'none') return 'none';
  if (!/^[a-z0-9#%.,()\s-]+$/i.test(value)) return null;
  if (splitTopLevel(value, ',') === null) return null;
  if (!/^(repeating-)?(linear|radial|conic)-gradient\(/.test(value))
    return null;
  const functions = value.match(/[a-z-]+(?=\()/gi) ?? [];
  if (!functions.every((f) => GRADIENT_FUNCTIONS.includes(f.toLowerCase())))
    return null;
  return value.replace(/\s+/g, ' ').trim();
};

const fontFamily: Validator = (value) => {
  if (value.length > 200) return null;
  if (!/^[\w\s,"'.-]+$/.test(value)) return null;
  // Quotes must be balanced so the value cannot run on into what follows it.
  if ((value.match(/"/g) ?? []).length % 2 !== 0) return null;
  if ((value.match(/'/g) ?? []).length % 2 !== 0) return null;
  return value.replace(/\s+/g, ' ').trim();
};

const fontWeight: Validator = (value) => {
  if (value === 'normal') return '400';
  if (value === 'bold') return '700';
  if (!/^\d{1,4}$/.test(value)) return null;
  const n = Number(value);
  return n >= 1 && n <= 1000 ? String(n) : null;
};

const gridTracks: Validator = (value) => {
  if (value === 'none') return 'none';
  const tracks = value.split(/\s+/);
  if (tracks.length > 24) return null;
  const ok = tracks.every(
    (t) => t === 'auto' || /^\d{1,5}(\.\d{1,4})?(px|fr)$/.test(t)
  );
  return ok ? tracks.join(' ') : null;
};

const gridLine: Validator = (value) =>
  /^(auto|-?\d{1,3}|span \d{1,3})$/.test(value) ? value : null;

const radius: Validator = (value) => {
  const parts = value.split(/\s+/);
  if (parts.length < 1 || parts.length > 2) return null;
  const out: string[] = [];
  for (const part of parts) {
    const n = parsePx(part);
    if (n !== null && n >= 0) out.push(px(n));
    else if (/^\d{1,3}(\.\d{1,3})?%$/.test(part)) out.push(part);
    else return null;
  }
  if (out.length === 2 && out[0] === out[1]) out.pop();
  return out.join(' ');
};

const textDecorationLine: Validator = (value) => {
  const parts = value.split(/\s+/);
  const allowed = ['none', 'underline', 'overline', 'line-through'];
  return parts.length <= 3 && parts.every((p) => allowed.includes(p))
    ? parts.join(' ')
    : null;
};

const flexBasis = firstOf(oneOf('auto', 'content'), length(), (v) =>
  /^\d{1,3}(\.\d{1,3})?%$/.test(v) ? v : null
);

const alignment = oneOf(
  'normal',
  'stretch',
  'flex-start',
  'flex-end',
  'start',
  'end',
  'center',
  'baseline',
  'first baseline',
  'last baseline',
  'self-start',
  'self-end',
  'space-between',
  'space-around',
  'space-evenly',
  'left',
  'right'
);

const borderStyle = oneOf(
  'none',
  'solid',
  'dashed',
  'dotted',
  'double',
  'hidden'
);

const overflow = oneOf('visible', 'hidden', 'clip', 'auto', 'scroll');

const VALIDATORS: Record<string, Validator> = {
  display: oneOf(
    'block',
    'inline',
    'inline-block',
    'flex',
    'inline-flex',
    'grid',
    'inline-grid',
    'flow-root',
    'list-item',
    'contents',
    'table',
    'inline-table',
    'table-row',
    'table-cell',
    'table-row-group',
    'table-header-group',
    'table-footer-group',
    'table-caption'
  ),
  position: oneOf('static', 'relative', 'absolute', 'fixed', 'sticky'),
  float: oneOf('none', 'left', 'right', 'inline-start', 'inline-end'),

  'flex-direction': oneOf('row', 'row-reverse', 'column', 'column-reverse'),
  'flex-wrap': oneOf('nowrap', 'wrap', 'wrap-reverse'),
  'justify-content': alignment,
  'align-items': alignment,
  'align-content': alignment,
  'align-self': firstOf(oneOf('auto'), alignment),
  'flex-grow': numberIn(0, 1000),
  'flex-shrink': numberIn(0, 1000),
  'flex-basis': flexBasis,
  'row-gap': firstOf(oneOf('normal'), length()),
  'column-gap': firstOf(oneOf('normal'), length()),
  'grid-template-columns': gridTracks,
  'grid-column-start': gridLine,
  'grid-column-end': gridLine,
  'grid-row-start': gridLine,
  'grid-row-end': gridLine,

  color,
  'background-color': color,
  'background-image': backgroundImage,
  opacity: numberIn(0, 1),
  'box-shadow': boxShadow,

  'font-family': fontFamily,
  'font-size': length(),
  'font-weight': fontWeight,
  'font-style': oneOf('normal', 'italic', 'oblique'),
  'line-height': firstOf(oneOf('normal'), length(), numberIn(0, 10)),
  'letter-spacing': firstOf(oneOf('normal'), length({ negative: true })),
  'text-align': oneOf(
    'left',
    'right',
    'center',
    'justify',
    'start',
    'end',
    '-webkit-left',
    '-webkit-right',
    '-webkit-center'
  ),
  'text-transform': oneOf('none', 'uppercase', 'lowercase', 'capitalize'),
  'text-decoration-line': textDecorationLine,
  'white-space': oneOf(
    'normal',
    'nowrap',
    'pre',
    'pre-wrap',
    'pre-line',
    'break-spaces'
  ),
  'text-overflow': oneOf('clip', 'ellipsis'),
  'overflow-x': overflow,
  'overflow-y': overflow,
  'list-style-type': oneOf('none', 'disc', 'circle', 'square', 'decimal'),
};

for (const side of SIDES) {
  VALIDATORS[`padding-${side}`] = length();
  VALIDATORS[`margin-${side}`] = length({ negative: true });
  VALIDATORS[`border-${side}-width`] = length();
  VALIDATORS[`border-${side}-style`] = borderStyle;
  VALIDATORS[`border-${side}-color`] = color;
}
for (const corner of CORNERS) {
  VALIDATORS[`border-${corner}-radius`] = radius;
}

/** Every computed-style property a capture may contain. */
export const STYLE_PROPS: readonly string[] = Object.keys(VALIDATORS);

export type StyleCheck =
  | { status: 'ok'; value: string }
  | { status: 'unknown-property' }
  | { status: 'invalid-value' }
  | { status: 'resource' };

export function checkStyle(prop: string, value: unknown): StyleCheck {
  if (isResourceValue(value)) return { status: 'resource' };
  if (!Object.prototype.hasOwnProperty.call(VALIDATORS, prop))
    return { status: 'unknown-property' };
  if (typeof value !== 'string' || value.length > MAX_VALUE_LENGTH)
    return { status: 'invalid-value' };
  const normalized = VALIDATORS[prop](value.trim());
  if (normalized === null || isResourceValue(normalized))
    return { status: 'invalid-value' };
  return { status: 'ok', value: normalized };
}

/** Returns the normalized value, or null if the pair is not allowed. */
export function sanitizeStyle(prop: string, value: unknown): string | null {
  const result = checkStyle(prop, value);
  return result.status === 'ok' ? result.value : null;
}
