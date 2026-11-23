'use client';

import { useEffect, useRef, useSyncExternalStore } from 'react';
import { revealDocument } from '../../shared/circle-reveal';
import type { SiteTheme, Theme } from './site-theme';
import { MoonIcon, SunIcon } from './theme-icons';
import './theme-transition-panel.css';

/** The theme on screen, kept in step with the store on every render. */
export function useSiteTheme(store: SiteTheme): Theme {
  // The server and the first client render use the default so they agree.
  return useSyncExternalStore(store.subscribe, store.get, () => 'dark');
}

export interface ThemeToggleProps {
  theme: Theme;
  /**
   * Called at the moment the new theme should take effect, inside the reveal.
   * It should switch the theme synchronously (see createSiteTheme).
   */
  onThemeChange: (theme: Theme) => void | Promise<void>;
  className?: string;
}

/**
 * A sun/moon button that reveals the new theme across the whole page as a
 * circle growing from the button. It shows the action that is available: the
 * sun while dark, the moon while light.
 *
 * Fast repeated clicks are handled in order: the last click decides the final
 * theme, each step finishes before the next starts, and the button is never
 * disabled, so keyboard focus stays where it was.
 */
export function ThemeToggle({
  theme,
  onThemeChange,
  className = '',
}: ThemeToggleProps) {
  const button = useRef<HTMLButtonElement>(null);
  const shown = useRef(theme);
  const wanted = useRef(theme);
  const busy = useRef(false);
  shown.current = theme;

  useEffect(() => {
    // Follow outside changes (another tab) while nothing is animating.
    if (!busy.current) wanted.current = theme;
  }, [theme]);

  const click = async () => {
    wanted.current = wanted.current === 'dark' ? 'light' : 'dark';
    if (busy.current) return; // the running loop picks up the latest wish
    busy.current = true;
    let applied = shown.current;
    try {
      while (applied !== wanted.current) {
        const goal = wanted.current;
        applied = goal;
        await revealDocument(() => onThemeChange(goal), button.current);
      }
    } finally {
      busy.current = false;
      wanted.current = applied;
    }
  };

  return (
    <button
      ref={button}
      type='button'
      className={`mg-theme-btn ${className}`}
      aria-label={
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      }
      onClick={click}
    >
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  );
}
