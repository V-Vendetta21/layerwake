'use client';

import './rolling-counter.css';

export interface RollingCounterProps {
  /** A whole number, zero or greater. */
  value: number;
  /** Pad with leading zeros up to this many digits. */
  minDigits?: number;
  className?: string;
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

/** Each digit is a reel that rolls to its new position when `value` changes. */
export function RollingCounter({
  value,
  minDigits = 1,
  className = '',
}: RollingCounterProps) {
  const safe = Math.max(0, Math.floor(value));
  const digits = String(safe).padStart(minDigits, '0').split('');
  return (
    <span
      className={`mg-counter ${className}`}
      role='img'
      aria-label={String(safe)}
    >
      {digits.map((digit, index) => (
        // Keyed from the right so the ones place keeps its reel.
        <span
          key={digits.length - index}
          className='mg-counter__slot'
          aria-hidden='true'
        >
          <span
            className='mg-counter__reel'
            style={{ transform: `translateY(-${Number(digit) * 10}%)` }}
          >
            {DIGITS.map((n) => (
              <span key={n}>{n}</span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}
