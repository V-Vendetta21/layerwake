'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './inertia-drag-surface.css';

export interface InertiaDragSurfaceProps {
  /** Accessible name for the stage. */
  label: string;
  /** Size of the object, in pixels. */
  size?: number;
  /** How quickly a throw slows down (0–1; higher glides longer). */
  friction?: number;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Drag the puck and let go: it keeps moving, slows down and stops inside the
 * stage, bouncing softly off the edges. Arrow buttons nudge it and Reset
 * centers it. With reduced motion it stops where you let go.
 */
export function InertiaDragSurface({
  label,
  size = 48,
  friction = 0.94,
  className = '',
}: InertiaDragSurfaceProps) {
  const stage = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState({ w: 0, h: 0 });
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [moving, setMoving] = useState(false);
  const frame = useRef(0);
  const origin = useRef(pos);
  // The live position, updated synchronously so a throw starts exactly
  // where the pointer let go, even before React re-renders.
  const latest = useRef(pos);
  const place = (p: { x: number; y: number }) => {
    latest.current = p;
    setPos(p);
  };
  const reduced = useReducedMotion();

  useIsomorphicLayoutEffect(() => {
    const el = stage.current;
    if (!el) return;
    const w = el.clientWidth - size;
    const h = el.clientHeight - size;
    setBounds({ w, h });
    place({ x: w / 2, y: h / 2 });
  }, [size]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const clamp = (p: { x: number; y: number }) => ({
    x: Math.max(0, Math.min(bounds.w, p.x)),
    y: Math.max(0, Math.min(bounds.h, p.y)),
  });

  const glide = (vx: number, vy: number) => {
    cancelAnimationFrame(frame.current);
    if (reduced) return;
    let v = { x: vx * 12, y: vy * 12 };
    let p = { ...latest.current };
    setMoving(true);
    const tick = () => {
      p = { x: p.x + v.x, y: p.y + v.y };
      if (p.x < 0 || p.x > bounds.w) v.x *= -0.5;
      if (p.y < 0 || p.y > bounds.h) v.y *= -0.5;
      p = clamp(p);
      v = { x: v.x * friction, y: v.y * friction };
      place(p);
      if (Math.hypot(v.x, v.y) > 0.15)
        frame.current = requestAnimationFrame(tick);
      else setMoving(false);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const drag = usePointerDrag({
    onStart: () => {
      cancelAnimationFrame(frame.current);
      setMoving(false);
      origin.current = latest.current;
    },
    onMove: ({ dx, dy }) =>
      place(clamp({ x: origin.current.x + dx, y: origin.current.y + dy })),
    onEnd: ({ vx, vy }) => glide(vx, vy),
  });

  const nudge = (dx: number, dy: number) => {
    if (reduced)
      place(
        clamp({ x: latest.current.x + dx * 40, y: latest.current.y + dy * 40 })
      );
    else glide(dx * 0.6, dy * 0.6);
  };

  return (
    <div className={`mg-inertia ${className}`}>
      <div
        ref={stage}
        className='mg-inertia__stage'
        role='group'
        aria-label={label}
      >
        <div
          className='mg-inertia__puck'
          data-moving={moving}
          style={{
            width: size,
            height: size,
            transform: `translate(${pos.x}px, ${pos.y}px)`,
          }}
          aria-hidden='true'
          {...drag}
        />
      </div>
      <div className='mg-inertia__controls'>
        <button
          type='button'
          aria-label='Throw left'
          onClick={() => nudge(-1, 0)}
        >
          ←
        </button>
        <button
          type='button'
          aria-label='Throw up'
          onClick={() => nudge(0, -1)}
        >
          ↑
        </button>
        <button
          type='button'
          aria-label='Throw down'
          onClick={() => nudge(0, 1)}
        >
          ↓
        </button>
        <button
          type='button'
          aria-label='Throw right'
          onClick={() => nudge(1, 0)}
        >
          →
        </button>
        <button
          type='button'
          onClick={() => {
            cancelAnimationFrame(frame.current);
            setMoving(false);
            place({ x: bounds.w / 2, y: bounds.h / 2 });
          }}
        >
          Reset
        </button>
        <span className='mg-inertia__pos' role='status'>
          {moving ? 'Moving' : 'At rest'} · x {Math.round(pos.x)}, y{' '}
          {Math.round(pos.y)}
        </span>
      </div>
    </div>
  );
}
