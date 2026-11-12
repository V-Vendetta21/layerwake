'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import './image-focus-lens.css';

export interface ImageFocusLensProps {
  /** The image. It is drawn twice: once normally, once inside the lens. */
  children: ReactNode;
  /** Accessible name for the keyboard-operable stage. */
  label: string;
  zoom?: number;
  /** Lens diameter, in pixels. */
  size?: number;
  className?: string;
}

/**
 * A round magnifier follows the pointer over the image. Keyboard users press
 * Enter or Space on the image to show the lens and move it with the arrow
 * keys. The image outside the lens is untouched.
 */
export function ImageFocusLens({
  children,
  label,
  zoom = 2.2,
  size = 110,
  className = '',
}: ImageFocusLensProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 0.5, y: 0.5 });
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const shown = hover || pinned;

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const measure = () => setFrame({ w: el.clientWidth, h: el.clientHeight });
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPos({
      x: clamp((event.clientX - rect.left) / rect.width),
      y: clamp((event.clientY - rect.top) / rect.height),
    });
    setHover(true);
  };
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 0.2 : 0.06;
    const moves: Record<string, [number, number]> = {
      ArrowLeft: [-step, 0],
      ArrowRight: [step, 0],
      ArrowUp: [0, -step],
      ArrowDown: [0, step],
    };
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setPinned((p) => !p);
    } else if (event.key === 'Escape') {
      setPinned(false);
    } else if (moves[event.key]) {
      event.preventDefault();
      setPinned(true);
      const [dx, dy] = moves[event.key];
      setPos((p) => ({ x: clamp(p.x + dx), y: clamp(p.y + dy) }));
    }
  };

  // Keep the whole lens inside the image.
  const half = size / 2;
  const cx = Math.max(half, Math.min(frame.w - half, pos.x * frame.w));
  const cy = Math.max(half, Math.min(frame.h - half, pos.y * frame.h));

  return (
    <div
      ref={stage}
      className={`mg-lens ${className}`}
      tabIndex={0}
      role='group'
      aria-label={`${label}. Press Enter to ${pinned ? 'hide' : 'show'} the magnifier, then use the arrow keys to move it.`}
      onPointerMove={onPointerMove}
      onPointerLeave={() => setHover(false)}
      onKeyDown={onKeyDown}
    >
      {children}
      {shown && frame.w > 0 ? (
        <div
          className='mg-lens__glass'
          aria-hidden='true'
          style={{
            width: size,
            height: size,
            transform: `translate(${cx - half}px, ${cy - half}px)`,
          }}
        >
          <div
            className='mg-lens__zoom'
            style={{
              width: frame.w,
              height: frame.h,
              transform: `translate(${half - cx * zoom}px, ${half - cy * zoom}px) scale(${zoom})`,
            }}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  );
}
