'use client';

import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './trend-line-morph.css';

export interface TrendLineMorphProps {
  /** Same length as `labels`. Changing it morphs the line. */
  values: number[];
  labels: string[];
  /** Fixed axis range, so both series share one scale. */
  min: number;
  max: number;
  unit?: string;
  /** Index of the point to read out. */
  selected: number;
  onSelect: (index: number) => void;
  label: string;
  className?: string;
}

const W = 300;
const H = 150;
const PAD = 24;

/**
 * Morphs a line between series on fixed axes. A row of buttons picks a
 * point and shows its exact value, so nothing depends on hovering.
 */
export function TrendLineMorph({
  values,
  labels,
  min,
  max,
  unit = '',
  selected,
  onSelect,
  label,
  className = '',
}: TrendLineMorphProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(values);
  const current = useRef(values);

  useEffect(() => {
    const from = current.current;
    if (reduced || from.length !== values.length) {
      current.current = values;
      setShown(values);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 600);
      const ease = 1 - Math.pow(1 - k, 3);
      const next = values.map((v, i) => from[i] + (v - from[i]) * ease);
      current.current = next;
      setShown(next);
      if (k < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [values, reduced]);

  const x = (i: number) => PAD + (i * (W - PAD * 2)) / (values.length - 1);
  const y = (v: number) => H - PAD - ((v - min) / (max - min)) * (H - PAD * 2);
  const d = shown
    .map((v, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(v).toFixed(1)}`)
    .join(' ');
  const ticks = [min, (min + max) / 2, max];

  return (
    <div className={`mg-trend ${className}`}>
      <svg viewBox={`0 0 ${W} ${H}`} role='img' aria-label={label}>
        {ticks.map((t) => (
          <g key={t}>
            <line
              className='mg-trend__grid'
              x1={PAD}
              x2={W - PAD}
              y1={y(t)}
              y2={y(t)}
            />
            <text
              className='mg-trend__axis'
              x={PAD - 4}
              y={y(t) + 4}
              textAnchor='end'
            >
              {t}
            </text>
          </g>
        ))}
        <path className='mg-trend__line' d={d} />
        {shown.map((v, i) => (
          <circle
            key={i}
            className='mg-trend__point'
            data-selected={i === selected}
            cx={x(i)}
            cy={y(v)}
            r={i === selected ? 6 : 3.5}
          />
        ))}
      </svg>
      <div className='mg-trend__picker' role='group' aria-label='Read a point'>
        {labels.map((l, i) => (
          <button
            key={l}
            type='button'
            aria-pressed={i === selected}
            onClick={() => onSelect(i)}
          >
            {l}
          </button>
        ))}
      </div>
      <p className='mg-trend__readout' aria-live='polite'>
        {labels[selected]}:{' '}
        <strong>
          {values[selected]}
          {unit}
        </strong>
      </p>
    </div>
  );
}
