'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
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
 * The effect is confined to this panel, not the page. With reduced motion the
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
    const next = theme === 'light' ? 'dark' : 'light';
    if (reduced || !panel.current || !toggle.current) {
      onThemeChange(next);
      return;
    }
    const p = panel.current.getBoundingClientRect();
    const t = toggle.current.getBoundingClientRect();
    const x = t.left + t.width / 2 - p.left;
    const y = t.top + t.height / 2 - p.top;
    const r = Math.hypot(Math.max(x, p.width - x), Math.max(y, p.height - y));
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
        disabled={reveal !== null}
        onClick={flip}
      >
        {theme === 'dark' ? (
          <svg width='20' height='20' viewBox='0 0 20 20' aria-hidden='true'>
            <path
              d='M15.5 12.5A6.5 6.5 0 0 1 7.5 4.5a6.5 6.5 0 1 0 8 8Z'
              fill='currentColor'
            />
          </svg>
        ) : (
          <svg
            width='20'
            height='20'
            viewBox='0 0 20 20'
            aria-hidden='true'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.6'
            strokeLinecap='round'
          >
            <circle cx='10' cy='10' r='3.5' />
            <path d='M10 2v2M10 16v2M2 10h2M16 10h2M4.3 4.3l1.4 1.4M14.3 14.3l1.4 1.4M4.3 15.7l1.4-1.4M14.3 5.7l1.4-1.4' />
          </svg>
        )}
      </button>
    </div>
  );
}
