'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './pointer-trail.css';

export interface PointerTrailProps {
  children?: ReactNode;
  /** When false, the trail stops and clears. */
  active: boolean;
  /** Most dots alive at once. */
  max?: number;
  /** How long a dot lasts, in milliseconds. */
  life?: number;
  label: string;
  className?: string;
}

interface Dot {
  x: number;
  y: number;
  born: number;
}

/**
 * Leaves a short trail of fading dots behind the pointer (mouse, pen or
 * touch) inside its own area, drawn on a canvas. The dot count is capped and
 * the animation loop stops as soon as the last dot has faded.
 */
export function PointerTrail({
  children,
  active,
  max = 40,
  life = 600,
  label,
  className = '',
}: PointerTrailProps) {
  const area = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const dots = useRef<Dot[]>([]);
  const frame = useRef(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!active || reduced) {
      dots.current = [];
      cancelAnimationFrame(frame.current);
      frame.current = 0;
      const c = canvas.current;
      c?.getContext('2d')?.clearRect(0, 0, c.width, c.height);
    }
  }, [active, reduced]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const draw = () => {
    const c = canvas.current;
    const ctx = c?.getContext('2d');
    if (!c || !ctx) return;
    const now = performance.now();
    dots.current = dots.current.filter((d) => now - d.born < life);
    ctx.clearRect(0, 0, c.width, c.height);
    const ratio = c.width / c.clientWidth;
    dots.current.forEach((d, i) => {
      const t = 1 - (now - d.born) / life;
      ctx.beginPath();
      ctx.fillStyle =
        i % 3 === 0 ? `rgba(182, 255, 59, ${t})` : `rgba(22, 76, 255, ${t})`;
      ctx.arc(d.x * ratio, d.y * ratio, (2 + 6 * t) * ratio, 0, Math.PI * 2);
      ctx.fill();
    });
    frame.current = dots.current.length ? requestAnimationFrame(draw) : 0;
  };

  return (
    <div
      ref={area}
      className={`mg-trail ${className}`}
      data-active={active}
      role='group'
      aria-label={label}
      onPointerMove={(event) => {
        if (!active || reduced) return;
        const c = canvas.current!;
        const rect = c.getBoundingClientRect();
        if (c.width !== Math.round(rect.width * devicePixelRatio)) {
          c.width = Math.round(rect.width * devicePixelRatio);
          c.height = Math.round(rect.height * devicePixelRatio);
        }
        dots.current.push({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          born: performance.now(),
        });
        if (dots.current.length > max)
          dots.current.splice(0, dots.current.length - max);
        if (!frame.current) frame.current = requestAnimationFrame(draw);
      }}
    >
      <canvas ref={canvas} className='mg-trail__canvas' aria-hidden='true' />
      <div className='mg-trail__content'>{children}</div>
    </div>
  );
}
