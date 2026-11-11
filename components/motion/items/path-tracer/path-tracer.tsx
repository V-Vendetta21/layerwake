'use client';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import './path-tracer.css';

export interface PathTracerProps {
  /** SVG path data for the route. */
  d: string;
  viewBox: string;
  /** How much of the route is drawn, 0–1. */
  progress: number;
  startLabel: string;
  endLabel: string;
  /** Accessible description of the whole route. */
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Draws a route along an SVG path up to `progress` and keeps a marker at the
 * tip. Drive `progress` from a slider, a timer or real data. The start and
 * end labels never move.
 */
export function PathTracer({
  d,
  viewBox,
  progress,
  startLabel,
  endLabel,
  label,
  className = '',
}: PathTracerProps) {
  const path = useRef<SVGPathElement>(null);
  const [geo, setGeo] = useState<{
    length: number;
    start: DOMPoint;
    end: DOMPoint;
  } | null>(null);
  const p = Math.max(0, Math.min(1, progress));

  useIsomorphicLayoutEffect(() => {
    const el = path.current;
    if (!el) return;
    const length = el.getTotalLength();
    setGeo({
      length,
      start: el.getPointAtLength(0),
      end: el.getPointAtLength(length),
    });
  }, [d]);

  const tip =
    geo && path.current ? path.current.getPointAtLength(geo.length * p) : null;
  return (
    <svg
      className={`mg-tracer ${className}`}
      viewBox={viewBox}
      role='img'
      aria-label={`${label}: ${Math.round(p * 100)}% travelled`}
    >
      <path className='mg-tracer__route' d={d} />
      <path
        ref={path}
        className='mg-tracer__done'
        d={d}
        pathLength={1}
        style={{ strokeDashoffset: 1 - p }}
      />
      {geo ? (
        <>
          <circle
            className='mg-tracer__end'
            cx={geo.start.x}
            cy={geo.start.y}
            r='5'
          />
          <circle
            className='mg-tracer__end'
            cx={geo.end.x}
            cy={geo.end.y}
            r='5'
          />
          <text
            className='mg-tracer__label'
            x={geo.start.x}
            y={geo.start.y + 18}
            textAnchor='middle'
          >
            {startLabel}
          </text>
          <text
            className='mg-tracer__label'
            x={geo.end.x}
            y={geo.end.y - 12}
            textAnchor='middle'
          >
            {endLabel}
          </text>
        </>
      ) : null}
      {tip ? (
        <circle className='mg-tracer__marker' cx={tip.x} cy={tip.y} r='7' />
      ) : null}
    </svg>
  );
}
