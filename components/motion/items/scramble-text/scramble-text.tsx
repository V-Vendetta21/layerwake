'use client';

import { useEffect, useState } from 'react';
import './scramble-text.css';

export interface ScrambleTextProps {
  text: string;
  /** Time for the whole string to resolve, in milliseconds. */
  duration?: number;
  /** Characters used while a letter is unresolved. */
  charset?: string;
  className?: string;
}

/** Letters resolve left to right. Change `text` or remount to replay. */
export function ScrambleText({
  text,
  duration = 1100,
  charset = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#%&',
  className = '',
}: ScrambleTextProps) {
  const [output, setOutput] = useState(text);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setOutput(text);
      return;
    }
    let frame = 0;
    let last = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      if (now - last > 40 || progress === 1) {
        last = now;
        const settled = Math.floor(progress * text.length);
        setOutput(
          text
            .split('')
            .map((char, index) =>
              index < settled || char === ' '
                ? char
                : charset[Math.floor(Math.random() * charset.length)]
            )
            .join('')
        );
      }
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [text, duration, charset]);

  return (
    <span className={`mg-scramble ${className}`}>
      <span className='mg-scramble__sr'>{text}</span>
      <span aria-hidden='true'>{output}</span>
    </span>
  );
}
