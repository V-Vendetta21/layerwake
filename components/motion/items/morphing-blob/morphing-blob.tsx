'use client';

import { useEffect, useRef, useState } from 'react';
import { usePlayback } from '../../shared/use-playback';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './morphing-blob.css';

export type BlobShape = 'circle' | 'drop' | 'shell' | 'star';

export interface MorphingBlobProps {
  shape: BlobShape;
  /** Gently wobble between shapes on its own while visible. */
  ambient?: boolean;
  size?: number;
  label: string;
  className?: string;
}

const POINTS = 12;

/** Radius (0–1) of each shape at each of 12 evenly spaced angles. */
const SHAPES: Record<BlobShape, number[]> = {
  circle: Array(POINTS).fill(0.8),
  drop: [0.95, 0.85, 0.7, 0.62, 0.6, 0.62, 0.66, 0.62, 0.6, 0.62, 0.7, 0.85],
  shell: [0.9, 0.7, 0.88, 0.7, 0.88, 0.7, 0.88, 0.7, 0.88, 0.7, 0.88, 0.7],
  star: [0.95, 0.5, 0.95, 0.5, 0.95, 0.5, 0.95, 0.5, 0.95, 0.5, 0.95, 0.5],
};

/** A smooth closed curve through the points (Catmull-Rom to Bézier). */
function pathFor(radii: number[], size: number) {
  const c = size / 2;
  const pts = radii.map((r, i) => {
    const a = (i / POINTS) * Math.PI * 2 - Math.PI / 2;
    return [c + Math.cos(a) * r * c, c + Math.sin(a) * r * c];
  });
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < POINTS; i++) {
    const p0 = pts[(i - 1 + POINTS) % POINTS];
    const p1 = pts[i];
    const p2 = pts[(i + 1) % POINTS];
    const p3 = pts[(i + 2) % POINTS];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d + 'Z';
}

/**
 * One SVG shape morphs between compatible outlines (all built from the same
 * 12 points) around a fixed center. Ambient wobble stops when the shape is
 * off screen, the tab is hidden, or reduced motion is on.
 */
export function MorphingBlob({
  shape,
  ambient = true,
  size = 180,
  label,
  className = '',
}: MorphingBlobProps) {
  const svg = useRef<SVGSVGElement>(null);
  const reduced = useReducedMotion();
  const playing = usePlayback(svg, !ambient || reduced);
  const [radii, setRadii] = useState(SHAPES[shape]);
  const current = useRef(radii);

  useEffect(() => {
    const from = current.current;
    const to = SHAPES[shape];
    if (reduced) {
      current.current = to;
      setRadii(to);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 600);
      const e = 1 - Math.pow(1 - k, 3);
      const next = to.map((r, i) => from[i] + (r - from[i]) * e);
      current.current = next;
      setRadii(next);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [shape, reduced]);

  const [wobble, setWobble] = useState(0);
  useEffect(() => {
    if (!playing) {
      setWobble(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setWobble((now - start) / 1000);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [playing]);

  const shown = radii.map(
    (r, i) => r + (wobble ? Math.sin(wobble * 1.6 + i * 1.3) * 0.03 : 0)
  );
  return (
    <svg
      ref={svg}
      className={`mg-blob ${className}`}
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role='img'
      aria-label={`${label}: ${shape}`}
    >
      <path className='mg-blob__shape' d={pathFor(shown, size)} />
      <circle className='mg-blob__center' cx={size / 2} cy={size / 2} r='4' />
    </svg>
  );
}
