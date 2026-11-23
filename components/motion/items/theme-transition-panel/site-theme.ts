import { flushSync } from 'react-dom';

export type Theme = 'light' | 'dark';

export interface SiteThemeOptions {
  /** localStorage key for the visitor's explicit choice. */
  storageKey: string;
  /** Browser UI colour (<meta name="theme-color">) for each theme. */
  colors: { light: string; dark: string };
}

export interface SiteTheme {
  options: SiteThemeOptions;
  /** The theme on screen right now. Read from <html data-theme>. */
  get: () => Theme;
  /** Switches immediately, saves the choice and tells subscribers. */
  set: (theme: Theme) => void;
  subscribe: (listener: () => void) => () => void;
}

export function parseTheme(value: unknown): Theme | null {
  return value === 'light' || value === 'dark' ? value : null;
}

/**
 * One theme for the whole page. The document is the source of truth
 * (`<html data-theme>`), so every control on every route agrees, and a theme
 * change repaints through CSS without remounting anything.
 *
 * The choice is saved only when the visitor makes one. If storage is blocked
 * the switch still works for the current session. A choice made in another
 * tab is picked up through the `storage` event.
 */
export function createSiteTheme(options: SiteThemeOptions): SiteTheme {
  const listeners = new Set<() => void>();
  let watching = false;

  const get = (): Theme =>
    typeof document !== 'undefined' &&
    document.documentElement.dataset.theme === 'light'
      ? 'light'
      : 'dark';

  const paint = (theme: Theme) => {
    document.documentElement.dataset.theme = theme;
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', options.colors[theme]);
  };

  const notify = () => {
    // Flush now, so a view transition captures the finished new state.
    try {
      flushSync(() => listeners.forEach((listener) => listener()));
    } catch {
      listeners.forEach((listener) => listener());
    }
  };

  const set = (theme: Theme) => {
    paint(theme);
    try {
      window.localStorage.setItem(options.storageKey, theme);
    } catch {
      // Storage can be blocked (private mode, policy). The session still works.
    }
    notify();
  };

  const onStorage = (event: StorageEvent) => {
    if (event.key !== options.storageKey) return;
    const theme = parseTheme(event.newValue);
    if (theme && theme !== get()) {
      paint(theme);
      notify();
    }
  };

  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    if (!watching) {
      watching = true;
      window.addEventListener('storage', onStorage);
    }
    return () => {
      listeners.delete(listener);
      if (listeners.size === 0 && watching) {
        watching = false;
        window.removeEventListener('storage', onStorage);
      }
    };
  };

  return { options, get, set, subscribe };
}
