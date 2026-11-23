import { afterEach, describe, expect, it, vi } from 'vitest';
import { revealCircle } from '../../components/motion/shared/circle-reveal';
import {
  createSiteTheme,
  parseTheme,
} from '../../components/motion/items/theme-transition-panel/site-theme';
import { themeInitScript } from '../../components/motion/items/theme-transition-panel/site-theme-script';

const KEY = 'test.theme';
const COLORS = { dark: '#080808', light: '#f5f5f5' };

/** Runs the pre-paint script against a fake document and storage. */
function runInitScript(storage: () => string | null) {
  const attributes: Record<string, string> = {};
  const meta = {
    content: '',
    setAttribute: (_: string, v: string) => (meta.content = v),
  };
  const document = {
    documentElement: {
      setAttribute: (name: string, value: string) => (attributes[name] = value),
    },
    querySelector: (selector: string) =>
      selector === 'meta[name="theme-color"]' ? meta : null,
  };
  const localStorage = { getItem: () => storage() };
  new Function(
    'document',
    'localStorage',
    themeInitScript({ storageKey: KEY, colors: COLORS })
  )(document, localStorage);
  return { theme: attributes['data-theme'], color: meta.content };
}

describe('themeInitScript (the first paint)', () => {
  it('defaults first-time visitors to dark', () => {
    expect(runInitScript(() => null)).toEqual({
      theme: 'dark',
      color: '#080808',
    });
  });
  it('restores a saved light choice, and its browser color', () => {
    expect(runInitScript(() => 'light')).toEqual({
      theme: 'light',
      color: '#f5f5f5',
    });
  });
  it('ignores anything that is not a theme', () => {
    expect(runInitScript(() => '<script>')).toEqual({
      theme: 'dark',
      color: '#080808',
    });
    expect(runInitScript(() => 'undefined').theme).toBe('dark');
  });
  it('still sets a theme when storage throws', () => {
    expect(
      runInitScript(() => {
        throw new Error('blocked');
      })
    ).toEqual({ theme: 'dark', color: '#080808' });
  });
});

describe('parseTheme', () => {
  it('accepts only the two themes', () => {
    expect(parseTheme('light')).toBe('light');
    expect(parseTheme('dark')).toBe('dark');
    expect(parseTheme('auto')).toBeNull();
    expect(parseTheme(null)).toBeNull();
  });
});

describe('createSiteTheme', () => {
  afterEach(() => vi.unstubAllGlobals());

  function setup(options: { blocked?: boolean } = {}) {
    const store = new Map<string, string>();
    const meta = {
      content: '',
      setAttribute: (_: string, v: string) => (meta.content = v),
    };
    const listeners: Record<string, (e: unknown) => void> = {};
    const root = { dataset: {} as Record<string, string> };
    vi.stubGlobal('document', {
      documentElement: root,
      querySelector: () => meta,
    });
    vi.stubGlobal('window', {
      localStorage: {
        setItem: (k: string, v: string) => {
          if (options.blocked) throw new Error('blocked');
          store.set(k, v);
        },
      },
      addEventListener: (name: string, fn: (e: unknown) => void) =>
        (listeners[name] = fn),
      removeEventListener: (name: string) => delete listeners[name],
    });
    return {
      store,
      meta,
      listeners,
      root,
      theme: createSiteTheme({ storageKey: KEY, colors: COLORS }),
    };
  }

  it('reads the document, and defaults to dark', () => {
    const { theme, root } = setup();
    expect(theme.get()).toBe('dark');
    root.dataset.theme = 'light';
    expect(theme.get()).toBe('light');
  });

  it('switches, saves and tells subscribers in one step', () => {
    const { theme, store, meta, root } = setup();
    const seen: string[] = [];
    theme.subscribe(() => seen.push(theme.get()));
    theme.set('light');
    expect(root.dataset.theme).toBe('light');
    expect(store.get(KEY)).toBe('light');
    expect(meta.content).toBe('#f5f5f5');
    expect(seen).toEqual(['light']);
  });

  it('keeps working when storage is blocked', () => {
    const { theme, root } = setup({ blocked: true });
    expect(() => theme.set('light')).not.toThrow();
    expect(root.dataset.theme).toBe('light');
  });

  it('follows a choice made in another tab, and ignores other keys', () => {
    const { theme, listeners, root } = setup();
    const unsubscribe = theme.subscribe(() => {});
    listeners.storage({ key: 'something.else', newValue: 'light' });
    expect(theme.get()).toBe('dark');
    listeners.storage({ key: KEY, newValue: 'nonsense' });
    expect(theme.get()).toBe('dark');
    listeners.storage({ key: KEY, newValue: 'light' });
    expect(root.dataset.theme).toBe('light');
    unsubscribe();
    expect(listeners.storage).toBeUndefined();
  });
});

describe('revealCircle', () => {
  const view = { left: 0, top: 0, width: 1000, height: 600 };

  it('is centred on the trigger', () => {
    const c = revealCircle({ left: 940, top: 12, width: 40, height: 40 }, view);
    expect(c.x).toBe(960);
    expect(c.y).toBe(32);
  });

  it('reaches the farthest corner, wherever the trigger is', () => {
    for (const [x, y] of [
      [20, 20],
      [980, 20],
      [500, 300],
      [20, 580],
      [980, 580],
    ]) {
      const c = revealCircle(
        { left: x - 20, top: y - 20, width: 40, height: 40 },
        view
      );
      const farthest = Math.max(
        ...[
          [0, 0],
          [1000, 0],
          [0, 600],
          [1000, 600],
        ].map(([cx, cy]) => Math.hypot(cx - x, cy - y))
      );
      expect(c.r).toBeGreaterThanOrEqual(farthest);
      expect(c.r).toBeLessThanOrEqual(farthest + 2);
    }
  });

  it('measures inside a box that is not at the page origin', () => {
    const panel = { left: 200, top: 300, width: 320, height: 200 };
    const c = revealCircle(
      { left: 468, top: 312, width: 44, height: 44 },
      panel
    );
    expect(c.x).toBe(290);
    expect(c.y).toBe(34);
    expect(c.r).toBeGreaterThanOrEqual(Math.hypot(290, 166));
  });
});
