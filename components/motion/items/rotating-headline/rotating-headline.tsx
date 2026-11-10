'use client';

import { useEffect, useState } from 'react';
import './rotating-headline.css';

export interface RotatingHeadlineProps {
  /** Text that stays put, shown before the rotating phrase. */
  prefix: string;
  /** Keep this array stable (define it outside the component). */
  phrases: string[];
  /** Time each phrase stays on screen, in milliseconds. */
  interval?: number;
  className?: string;
}

/** Swaps through a set of phrases. With reduced motion the swap is instant. */
export function RotatingHeadline({
  prefix,
  phrases,
  interval = 2200,
  className = '',
}: RotatingHeadlineProps) {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(
      () => setIndex((current) => (current + 1) % phrases.length),
      interval
    );
    return () => window.clearInterval(timer);
  }, [phrases, interval]);

  return (
    <p className={`mg-rotate ${className}`}>
      <span className='mg-rotate__sr'>
        {prefix} {phrases.join(', ')}
      </span>
      <span aria-hidden='true'>
        {prefix}{' '}
        <span className='mg-rotate__window'>
          <span key={index} className='mg-rotate__phrase'>
            {phrases[index]}
          </span>
        </span>
      </span>
    </p>
  );
}
