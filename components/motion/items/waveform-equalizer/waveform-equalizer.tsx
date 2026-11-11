'use client';

import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { usePlayback } from '../../shared/use-playback';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './waveform-equalizer.css';

export interface WaveformEqualizerProps {
  /** Number of bars, capped at 32. */
  bars?: number;
  /** Multiplies the signal; 1 is normal. */
  sensitivity?: number;
  paused?: boolean;
  label: string;
  className?: string;
}

/**
 * Bars driven by a locally generated signal (no microphone, no audio). Each
 * bar eases toward its next level. A text line gives the overall level, and
 * reduced motion updates it once a second without animating the bars.
 */
export function WaveformEqualizer({
  bars = 16,
  sensitivity = 1,
  paused = false,
  label,
  className = '',
}: WaveformEqualizerProps) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const playing = usePlayback(root, paused);
  const count = Math.max(1, Math.min(32, bars));
  const [levels, setLevels] = useState(() =>
    Array.from({ length: count }, () => 0.2)
  );

  useEffect(() => {
    if (!playing) return;
    const start = performance.now();
    const tick = () => {
      const t = (performance.now() - start) / 1000;
      setLevels(
        Array.from({ length: count }, (_, i) => {
          // A few slow sines plus a little noise: a believable fake signal.
          const base =
            0.45 +
            0.25 * Math.sin(t * 2.1 + i * 0.5) +
            0.15 * Math.sin(t * 5.3 + i * 1.7);
          return Math.max(
            0.04,
            Math.min(1, (base + (Math.random() - 0.5) * 0.15) * sensitivity)
          );
        })
      );
    };
    tick();
    const timer = window.setInterval(tick, reduced ? 1000 : 110);
    return () => window.clearInterval(timer);
  }, [playing, count, sensitivity, reduced]);

  const average = levels.reduce((a, b) => a + b, 0) / levels.length;
  const word = !playing
    ? 'Paused'
    : average > 0.7
      ? 'Loud'
      : average > 0.4
        ? 'Moderate'
        : 'Quiet';

  return (
    <div ref={root} className={`mg-eq ${className}`} data-playing={playing}>
      <div className='mg-eq__bars' aria-hidden='true'>
        {levels.map((level, i) => (
          <span key={i} style={{ '--mg-level': level } as CSSProperties} />
        ))}
      </div>
      <p
        className='mg-eq__status'
        role='status'
        aria-label={`${label}: ${word}, ${Math.round(average * 100)}%`}
      >
        {label}: <strong>{word}</strong> · {Math.round(average * 100)}%
      </p>
    </div>
  );
}
