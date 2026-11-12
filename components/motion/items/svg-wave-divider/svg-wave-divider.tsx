'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayback } from '../../shared/use-playback';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './svg-wave-divider.css';

export interface SvgWaveDividerProps {
  /** Peak height of the wave, in pixels (kept within the divider's height). */
  amplitude?: number;
  /** Wave cycles per second. */
  speed?: number;
  /** Fixed height of the divider, in pixels. */
  height?: number;
  /** Color of the section below the divider. */
  fill?: string;
  paused?: boolean;
  className?: string;
}

/**
 * A shallow, moving wave between two sections. Its height never changes, so
 * nothing around it shifts. Paused, off screen, hidden or with reduced
 * motion it holds a still curve.
 */
export function SvgWaveDivider({
  amplitude = 10,
  speed = 0.25,
  height = 48,
  fill = '#0047ff',
  paused = false,
  className = '',
}: SvgWaveDividerProps) {
  const root = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const playing = usePlayback(root, paused || reduced);
  const [phase, setPhase] = useState(0);
  const amp = Math.min(amplitude, height / 2 - 2);

  useEffect(() => {
    if (!playing) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      setPhase(
        (p) => (p + ((now - last) / 1000) * speed * Math.PI * 2) % (Math.PI * 2)
      );
      last = now;
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing, speed]);

  const W = 400;
  const mid = height / 2;
  const points = Array.from({ length: 41 }, (_, i) => {
    const x = (i / 40) * W;
    const y = mid + Math.sin((i / 40) * Math.PI * 4 + phase) * amp;
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  });

  return (
    <svg
      ref={root}
      className={`mg-wave ${className}`}
      viewBox={`0 0 ${W} ${height}`}
      preserveAspectRatio='none'
      style={{ height }}
      aria-hidden='true'
    >
      <path
        d={`M${points.join(' L')} L${W} ${height} L0 ${height}Z`}
        fill={fill}
      />
    </svg>
  );
}
