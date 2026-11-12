'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import './undo-banner.css';

export interface UndoBannerProps {
  message: string;
  onUndo: () => void;
  /** Called when the banner is closed or runs out of time. */
  onDismiss: () => void;
  /** Time before it disappears, in milliseconds. Paused while hovered or focused. */
  duration?: number;
  className?: string;
}

/**
 * An inline notice with Undo after something is removed. It never takes
 * focus; it counts down (paused while the pointer or focus is on it) and then
 * goes away by itself.
 */
export function UndoBanner({
  message,
  onUndo,
  onDismiss,
  duration = 6000,
  className = '',
}: UndoBannerProps) {
  const [held, setHeld] = useState(false);
  const left = useRef(duration);
  const dismiss = useRef(onDismiss);
  dismiss.current = onDismiss;

  useEffect(() => {
    if (held) return;
    const started = Date.now();
    const timer = window.setTimeout(() => dismiss.current(), left.current);
    return () => {
      window.clearTimeout(timer);
      left.current = Math.max(0, left.current - (Date.now() - started));
    };
  }, [held]);

  return (
    <div
      className={`mg-undo ${className}`}
      role='status'
      data-held={held}
      style={{ '--mg-duration': `${duration}ms` } as CSSProperties}
      onPointerEnter={() => setHeld(true)}
      onPointerLeave={() => setHeld(false)}
      onFocus={() => setHeld(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node))
          setHeld(false);
      }}
    >
      <span className='mg-undo__text'>{message}</span>
      <button type='button' className='mg-undo__undo' onClick={onUndo}>
        Undo
      </button>
      <button
        type='button'
        className='mg-undo__close'
        aria-label='Dismiss'
        onClick={onDismiss}
      >
        <svg width='16' height='16' viewBox='0 0 16 16' aria-hidden='true'>
          <path
            d='M4 4l8 8M12 4l-8 8'
            fill='none'
            stroke='currentColor'
            strokeWidth='1.75'
            strokeLinecap='round'
          />
        </svg>
      </button>
      <span className='mg-undo__timer' aria-hidden='true' />
    </div>
  );
}
