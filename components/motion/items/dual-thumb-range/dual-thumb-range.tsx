'use client';

import { useState, type CSSProperties } from 'react';
import './dual-thumb-range.css';

export interface DualThumbRangeProps {
  value: [number, number];
  onChange: (value: [number, number]) => void;
  min: number;
  max: number;
  step?: number;
  /** Smallest allowed distance between the thumbs. */
  minGap?: number;
  /** Accessible names for the two thumbs. */
  labels: [string, string];
  format?: (value: number) => string;
  className?: string;
}

/**
 * Two native range inputs share one track, so each thumb works with drag,
 * touch and arrow keys on its own. The thumbs cannot cross, and each shows
 * its exact value above it.
 */
export function DualThumbRange({
  value,
  onChange,
  min,
  max,
  step = 1,
  minGap = 0,
  labels,
  format = String,
  className = '',
}: DualThumbRangeProps) {
  const [low, high] = value;
  const [active, setActive] = useState<0 | 1 | null>(null);
  const pct = (v: number) => ((v - min) / (max - min)) * 100;

  return (
    <div
      className={`mg-dual ${className}`}
      data-active={active ?? 'none'}
      style={
        {
          '--mg-low': `${pct(low)}%`,
          '--mg-high': `${pct(high)}%`,
        } as CSSProperties
      }
    >
      <div className='mg-dual__track' aria-hidden='true'>
        <span className='mg-dual__fill' />
      </div>
      <output
        className='mg-dual__bubble mg-dual__bubble--low'
        aria-hidden='true'
      >
        {format(low)}
      </output>
      <output
        className='mg-dual__bubble mg-dual__bubble--high'
        aria-hidden='true'
      >
        {format(high)}
      </output>
      <input
        type='range'
        className='mg-dual__input'
        aria-label={labels[0]}
        aria-valuetext={format(low)}
        min={min}
        max={max}
        step={step}
        value={low}
        onFocus={() => setActive(0)}
        onBlur={() => setActive(null)}
        onChange={(event) =>
          onChange([Math.min(Number(event.target.value), high - minGap), high])
        }
      />
      <input
        type='range'
        className='mg-dual__input'
        aria-label={labels[1]}
        aria-valuetext={format(high)}
        min={min}
        max={max}
        step={step}
        value={high}
        onFocus={() => setActive(1)}
        onBlur={() => setActive(null)}
        onChange={(event) =>
          onChange([low, Math.max(Number(event.target.value), low + minGap)])
        }
      />
    </div>
  );
}
