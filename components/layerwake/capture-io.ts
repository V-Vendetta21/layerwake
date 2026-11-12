import demoCapture from '@/lib/layerwake/demo-capture.json';
import { buildModel, type Model } from '@/lib/layerwake/model';
import { LIMITS, type Capture } from '@/lib/layerwake/schema';
import {
  parseCaptureText,
  tooLargeMessage,
  validateCapture,
  type ValidationResult,
} from '@/lib/layerwake/validate';

export const STORAGE_KEY = 'layerwake.import';
export const DEMO_NAME = 'Coastal card';
export const WORKSPACE_PATH = '/workspace';

export interface Loaded {
  source: 'demo' | 'import';
  label: string;
  capture: Capture;
  model: Model;
  warnings: string[];
}

export type LoadResult =
  | { ok: true; loaded: Loaded; text?: string }
  | { ok: false; error: string };

function toLoaded(
  result: ValidationResult,
  source: Loaded['source'],
  label: string
): LoadResult {
  if (!result.ok) return result;
  return {
    ok: true,
    loaded: {
      source,
      label,
      capture: result.capture,
      model: buildModel(result.capture),
      warnings: result.warnings,
    },
  };
}

/** The demo goes through the same validation as any imported file. */
export function loadDemo(): LoadResult {
  return toLoaded(validateCapture(demoCapture), 'demo', DEMO_NAME);
}

export function loadText(text: string, label: string): LoadResult {
  const result = toLoaded(parseCaptureText(text), 'import', label);
  return result.ok ? { ...result, text } : result;
}

/** Reads a user-chosen file. The size is checked before any of it is read. */
export async function loadFile(file: File): Promise<LoadResult> {
  if (file.size > LIMITS.maxBytes)
    return { ok: false, error: tooLargeMessage(file.size) };
  let text: string;
  try {
    text = await file.text();
  } catch {
    return { ok: false, error: 'This file could not be read.' };
  }
  return loadText(text, file.name.slice(0, 80));
}

export function remember(text: string, label: string) {
  try {
    window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ text, label }));
  } catch {
    // Storage can be unavailable (private mode, quota). The import still works.
  }
}

export function forget() {
  try {
    window.sessionStorage.removeItem(STORAGE_KEY);
  } catch {}
}

export function recall(): LoadResult | null {
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as { text?: unknown; label?: unknown };
    if (typeof saved.text !== 'string') return null;
    return loadText(
      saved.text,
      typeof saved.label === 'string'
        ? saved.label.slice(0, 80)
        : 'Imported capture'
    );
  } catch {
    return null;
  }
}

export function downloadText(filename: string, text: string, type: string) {
  const url = URL.createObjectURL(new Blob([text], { type }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
