'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import {
  REVEAL_EASING,
  REVEAL_MS,
  revealCircle,
} from '../../shared/circle-reveal';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import { MoonIcon, SunIcon } from './theme-icons';
import './theme-transition-panel.css';

export interface ThemeTransitionPanelProps {
  /** Renders the panel's contents for a theme. Called once per theme layer. */
  children: (theme: 'light' | 'dark') => ReactNode;
  theme: 'light' | 'dark';
  onThemeChange: (theme: 'light' | 'dark') => void;
  className?: string;
}

/**
 * Switching theme reveals the new one as a circle growing out of the toggle.
 * The effect is confined to this panel, so the page around it keeps its own
 * theme: the state is yours and `onThemeChange` fires when the circle has
 * filled the panel. To theme a whole page instead, see ThemeToggle in
 * site-theme-toggle.tsx, which uses the same circle. With reduced motion the
 * theme simply switches.
 */
export function ThemeTransitionPanel({
  children,
  theme,
  onThemeChange,
  className = '',
}: ThemeTransitionPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const [reveal, setReveal] = useState<{
    to: 'light' | 'dark';
    x: number;
    y: number;
    r: number;
    key: number;
  } | null>(null);
  const reduced = useReducedMotion();

  const flip = () => {
    if (reveal) return; // finish the current reveal first
    const next = theme === 'light' ? 'dark' : 'light';
    if (reduced || !panel.current || !toggle.current) {
      onThemeChange(next);
      return;
    }
    const p = panel.current.getBoundingClientRect();
    const t = toggle.current.getBoundingClientRect();
    const { x, y, r } = revealCircle(t, p);
    setReveal({ to: next, x, y, r, key: Date.now() });
  };

  return (
    <div ref={panel} className={`mg-theme ${className}`}>
      <div className='mg-theme__layer' data-theme={theme}>
        {children(theme)}
      </div>
      {reveal ? (
        <div
          key={reveal.key}
          className='mg-theme__layer mg-theme__layer--reveal'
          data-theme={reveal.to}
          aria-hidden='true'
          style={
            {
              '--mg-x': `${reveal.x}px`,
              '--mg-y': `${reveal.y}px`,
              '--mg-r': `${reveal.r}px`,
              '--mg-reveal-ms': `${REVEAL_MS}ms`,
              '--mg-reveal-easing': REVEAL_EASING,
            } as CSSProperties
          }
          onAnimationEnd={() => {
            onThemeChange(reveal.to);
            setReveal(null);
          }}
        >
          {children(reveal.to)}
        </div>
      ) : null}
      <button
        ref={toggle}
        type='button'
        className='mg-theme__toggle'
        data-theme={theme}
        aria-pressed={theme === 'dark'}
        aria-label='Dark theme'
        onClick={flip}
      >
        {theme === 'dark' ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
