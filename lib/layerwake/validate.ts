/**
 * Import validation. A capture file is untrusted input: this module checks
 * its size, schema, structure and every style value, and returns a freshly
 * built object containing only known fields.
 */

import { checkStyle } from './css-values';
import {
  CAPTURE_FORMAT,
  CONTROL_TAGS,
  IMAGE_TAGS,
  LIMITS,
  SCHEMA_VERSION,
  SLOTS,
  TAGS,
  TEXT_RUN_TAG,
  type Box,
  type Capture,
  type CaptureNode,
  type Slot,
} from './schema';

export type ValidationResult =
  | { ok: true; capture: Capture; warnings: string[] }
  | { ok: false; error: string };

class CaptureError extends Error {}

const fail = (message: string): never => {
  throw new CaptureError(message);
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function finite(value: unknown, label: string, min: number, max: number) {
  if (typeof value !== 'number' || !Number.isFinite(value))
    return fail(`${label} must be a number.`);
  if (value < min || value > max)
    return fail(`${label} is out of range (${min} to ${max}).`);
  return value;
}

function readBox(value: unknown, path: string): Box {
  if (!isRecord(value)) return fail(`${path} is missing its box.`);
  const max = LIMITS.maxCoordinate;
  return {
    x: finite(value.x, `${path} box.x`, -max, max),
    y: finite(value.y, `${path} box.y`, -max, max),
    width: finite(value.width, `${path} box.width`, 0, max),
    height: finite(value.height, `${path} box.height`, 0, max),
  };
}

interface Counters {
  nodes: number;
  unknownProps: number;
  invalidValues: number;
  droppedChildren: number;
}

function readNode(
  value: unknown,
  path: string,
  depth: number,
  counters: Counters
): CaptureNode {
  if (!isRecord(value)) return fail(`${path} is not a node object.`);
  if (depth > LIMITS.maxDepth)
    return fail(
      `The capture is nested deeper than ${LIMITS.maxDepth} levels (at ${path}).`
    );
  counters.nodes += 1;
  if (counters.nodes > LIMITS.maxNodes)
    return fail(`The capture has more than ${LIMITS.maxNodes} nodes.`);

  const tag = value.tag;
  if (typeof tag !== 'string' || !TAGS.includes(tag))
    return fail(`${path} has an unsupported tag name.`);

  const slot = value.slot as Slot;
  if (typeof slot !== 'string' || !SLOTS.includes(slot))
    return fail(`${path} has an unknown slot type.`);
  if (IMAGE_TAGS.includes(tag) && slot !== 'image')
    return fail(`${path} is a <${tag}> but is not marked as an image slot.`);
  if (CONTROL_TAGS.includes(tag) && slot !== 'control')
    return fail(`${path} is a <${tag}> but is not marked as a control slot.`);
  if (tag === TEXT_RUN_TAG && slot !== 'text')
    return fail(`${path} is a text run but is not marked as a text slot.`);

  const box = readBox(value.box, path);

  const styles: Record<string, string> = {};
  const rawStyles = value.styles ?? {};
  if (!isRecord(rawStyles)) return fail(`${path} styles must be an object.`);
  const entries = Object.entries(rawStyles);
  if (entries.length > 120) return fail(`${path} has too many style entries.`);
  for (const [prop, raw] of entries) {
    const result = checkStyle(prop, raw);
    if (result.status === 'ok') styles[prop] = result.value;
    else if (result.status === 'resource')
      return fail(
        `${path} contains a value that could load an outside resource ("${prop.slice(0, 40)}"). Layerwake rejects these files.`
      );
    else if (result.status === 'unknown-property') counters.unknownProps += 1;
    else counters.invalidValues += 1;
  }

  const node: CaptureNode = { tag, slot, box, styles, children: [] };

  if (value.textLength !== undefined) {
    const n = finite(value.textLength, `${path} textLength`, 0, 1_000_000);
    node.textLength = Math.min(Math.floor(n), LIMITS.maxTextLength);
  }

  if (value.omitted !== undefined) {
    if (!Array.isArray(value.omitted))
      return fail(`${path} omitted must be a list.`);
    node.omitted = value.omitted
      .filter((p): p is string => typeof p === 'string')
      .filter((p) => /^[a-z-]{1,40}$/.test(p))
      .slice(0, 20);
  }

  const children = value.children ?? [];
  if (!Array.isArray(children)) return fail(`${path} children must be a list.`);
  if (slot === 'container') {
    node.children = children.map((child, index) =>
      readNode(child, `${path} › ${index + 1}`, depth + 1, counters)
    );
  } else {
    counters.droppedChildren += children.length;
  }
  return node;
}

function readFlag(value: unknown): boolean {
  return value === true;
}

export function validateCapture(data: unknown): ValidationResult {
  try {
    if (!isRecord(data))
      fail('This file is not a Layerwake capture (expected a JSON object).');
    const input = data as Record<string, unknown>;
    if (input.format !== CAPTURE_FORMAT)
      fail(
        'This file is not a Layerwake capture (the "format" field is missing or wrong).'
      );
    if (input.schemaVersion !== SCHEMA_VERSION)
      fail(
        typeof input.schemaVersion === 'number'
          ? `This capture uses schema version ${input.schemaVersion}. This app reads version ${SCHEMA_VERSION}.`
          : 'This capture has no schema version.'
      );

    const viewport = input.viewport;
    if (!isRecord(viewport)) return fail('The capture has no viewport size.');
    const max = LIMITS.maxCoordinate;

    const counters: Counters = {
      nodes: 0,
      unknownProps: 0,
      invalidValues: 0,
      droppedChildren: 0,
    };
    const root = readNode(input.root, 'root', 0, counters);
    if (root.tag === TEXT_RUN_TAG)
      fail('The capture root must be an element, not a text run.');
    if (root.box.width <= 0 || root.box.height <= 0)
      fail('The captured component has no visible size.');

    const rawTruncation = isRecord(input.truncation) ? input.truncation : {};
    const count = (v: unknown) =>
      typeof v === 'number' && Number.isFinite(v) && v > 0
        ? Math.min(Math.floor(v), 1_000_000)
        : 0;

    const capture: Capture = {
      format: CAPTURE_FORMAT,
      schemaVersion: SCHEMA_VERSION,
      viewport: {
        width: finite(viewport.width, 'viewport.width', 1, max),
        height: finite(viewport.height, 'viewport.height', 1, max),
        devicePixelRatio:
          typeof viewport.devicePixelRatio === 'number' &&
          viewport.devicePixelRatio > 0 &&
          viewport.devicePixelRatio <= 16
            ? viewport.devicePixelRatio
            : 1,
      },
      limits: {
        maxDepth: LIMITS.maxDepth,
        maxNodes: LIMITS.maxNodes,
        maxBytes: LIMITS.maxBytes,
      },
      truncation: {
        depth: readFlag(rawTruncation.depth),
        nodes: readFlag(rawTruncation.nodes),
        bytes: readFlag(rawTruncation.bytes),
        omittedNodes: count(rawTruncation.omittedNodes),
        inaccessibleFrames: count(rawTruncation.inaccessibleFrames),
      },
      root,
    };
    if (
      typeof input.capturedAt === 'string' &&
      /^\d{4}-\d{2}-\d{2}T[\d:.]{5,12}Z$/.test(input.capturedAt)
    )
      capture.capturedAt = input.capturedAt;

    const warnings: string[] = [];
    const plural = (n: number, one: string, many: string) =>
      `${n} ${n === 1 ? one : many}`;
    if (counters.unknownProps)
      warnings.push(
        `${plural(counters.unknownProps, 'style property is', 'style properties are')} not on the supported list and ${counters.unknownProps === 1 ? 'was' : 'were'} ignored.`
      );
    if (counters.invalidValues)
      warnings.push(
        `${plural(counters.invalidValues, 'style value', 'style values')} could not be read and ${counters.invalidValues === 1 ? 'was' : 'were'} ignored.`
      );
    if (counters.droppedChildren)
      warnings.push(
        `${plural(counters.droppedChildren, 'child', 'children')} of text, image or control slots ${counters.droppedChildren === 1 ? 'was' : 'were'} ignored.`
      );
    return { ok: true, capture, warnings };
  } catch (error) {
    if (error instanceof CaptureError)
      return { ok: false, error: error.message };
    return { ok: false, error: 'This file could not be read as a capture.' };
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

export function tooLargeMessage(bytes: number): string {
  return `This file is ${formatBytes(bytes)}. Layerwake captures are limited to ${formatBytes(LIMITS.maxBytes)}.`;
}

/** Validate the text of a capture file. Checks size before parsing. */
export function parseCaptureText(text: string): ValidationResult {
  if (typeof text !== 'string')
    return { ok: false, error: 'This file could not be read.' };
  // UTF-16 length is a lower bound for byte length; check it first, cheaply.
  const bytes =
    text.length > LIMITS.maxBytes
      ? text.length
      : new TextEncoder().encode(text).length;
  if (bytes > LIMITS.maxBytes)
    return { ok: false, error: tooLargeMessage(bytes) };
  if (text.trim() === '') return { ok: false, error: 'This file is empty.' };
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    return {
      ok: false,
      error:
        'This file is not valid JSON, so it cannot be a Layerwake capture.',
    };
  }
  return validateCapture(data);
}
