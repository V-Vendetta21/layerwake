'use client';

import { useRef, type CSSProperties } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './variable-weight-ramp.css';

export interface VariableWeightRampProps {
  text: string;
  /** Lightest weight in the sweep (1–1000). */
  min?: number;
  /** Heaviest weight in the sweep (1–1000). */
  max?: number;
  /** One full sweep, in milliseconds. */
  duration?: number;
  /** Freeze on a static left-to-right ramp instead of sweeping. */
  paused?: boolean;
  className?: string;
}

/**
 * A wave of font weight that travels through each letter. It is smooth with a
 * variable font (any font with a "wght" axis) and steps between the
 * available weights otherwise. Paused, off screen or with reduced motion, it
 * shows a static ramp from light to heavy.
 */
export function VariableWeightRamp({
  text,
  min = 200,
  max = 800,
  duration = 2400,
  paused = false,
  className = '',
}: VariableWeightRampProps) {
  const root = useRef<HTMLSpanElement>(null);
  const playing = usePlayback(root, paused);
  const letters = Array.from(text);
  const last = Math.max(1, letters.length - 1);

  return (
    <span
      ref={root}
      className={`mg-weight ${className}`}
      data-playing={playing}
      style={
        {
          '--mg-min': min,
          '--mg-max': max,
          '--mg-duration': `${duration}ms`,
        } as CSSProperties
      }
    >
      <span className='mg-weight__sr'>{text}</span>
      <span aria-hidden='true'>
        {letters.map((letter, index) => (
          <span
            key={index}
            className='mg-weight__letter'
            style={
              {
                // Static ramp position and wave delay for this letter.
                '--mg-at': index / last,
                '--mg-delay': `${(-duration * (last - index)) / last / 2}ms`,
              } as CSSProperties
            }
          >
            {letter === ' ' ? ' ' : letter}
          </span>
        ))}
      </span>
    </span>
  );
}
