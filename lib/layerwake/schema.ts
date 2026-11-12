/**
 * Layerwake capture format — shared by the browser extension (which writes
 * captures) and the web app (which validates and reads them).
 *
 * See docs/layerwake/capture-format.md for the human-readable version.
 */

export const CAPTURE_FORMAT = 'layerwake-capture';
export const SCHEMA_VERSION = 1;

export const LIMITS = {
  /** Root is depth 0. Elements deeper than this are not captured. */
  maxDepth: 8,
  /** Total nodes in one capture, including the root. */
  maxNodes: 200,
  /** Size of the serialized JSON file in bytes. */
  maxBytes: 512 * 1024,
  /** Largest text length hint stored for a text slot. */
  maxTextLength: 2000,
  /** Largest accepted viewport edge or box coordinate, in CSS pixels. */
  maxCoordinate: 100_000,
} as const;

export type Slot = 'container' | 'text' | 'image' | 'control';
export const SLOTS: readonly Slot[] = ['container', 'text', 'image', 'control'];

/** Tag used for a run of text that sits beside element siblings. */
export const TEXT_RUN_TAG = '#text';

/**
 * Generic tag names a capture may contain. Anything else (custom elements,
 * unknown tags) is recorded as `div` by the extension.
 */
export const TAGS: readonly string[] = [
  'div',
  'span',
  'p',
  'a',
  'button',
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
  'main',
  'aside',
  'figure',
  'figcaption',
  'label',
  'strong',
  'em',
  'small',
  'time',
  'form',
  'img',
  'svg',
  'picture',
  'video',
  'canvas',
  'iframe',
  'input',
  'textarea',
  'select',
  TEXT_RUN_TAG,
];

/** Tags captured as an image slot. Their contents are never read. */
export const IMAGE_TAGS: readonly string[] = [
  'img',
  'svg',
  'picture',
  'video',
  'canvas',
  'iframe',
];

/** Tags captured as a control slot. Their values are never read. */
export const CONTROL_TAGS: readonly string[] = ['input', 'textarea', 'select'];

export interface Box {
  /** Offset from the captured root's top-left corner, in CSS pixels. */
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CaptureNode {
  tag: string;
  slot: Slot;
  box: Box;
  /** Allowlisted computed styles. Defaults and inherited repeats are omitted. */
  styles: Record<string, string>;
  /** Length of the text the element held. The text itself is never stored. */
  textLength?: number;
  /** Properties that were present but deliberately left out (e.g. asset URLs). */
  omitted?: string[];
  children: CaptureNode[];
}

export interface Truncation {
  depth: boolean;
  nodes: boolean;
  bytes: boolean;
  /** Elements skipped because of the limits above. */
  omittedNodes: number;
  /** Frames inside the selection whose content was not read. */
  inaccessibleFrames: number;
}

export interface Capture {
  format: typeof CAPTURE_FORMAT;
  schemaVersion: typeof SCHEMA_VERSION;
  capturedAt?: string;
  viewport: { width: number; height: number; devicePixelRatio: number };
  limits: { maxDepth: number; maxNodes: number; maxBytes: number };
  truncation: Truncation;
  root: CaptureNode;
}

/**
 * Typography properties that inherit. The extension stores them on the root
 * and then only where a node differs from its parent.
 */
export const INHERITED_PROPS: readonly string[] = [
  'color',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'line-height',
  'letter-spacing',
  'text-align',
  'text-transform',
  'white-space',
];

export const SIDES = ['top', 'right', 'bottom', 'left'] as const;
export const CORNERS = [
  'top-left',
  'top-right',
  'bottom-right',
  'bottom-left',
] as const;
