import type { ReactNode } from 'react';
import './scanline-sweep.css';

export interface ScanlineSweepProps {
  /** The diagram being scanned. */
  children: ReactNode;
  /** Shown when the scan finishes, for example "No faults found". */
  result: string;
  /** Change this value to scan again. */
  playKey?: number | string;
  /** One pass, in milliseconds. */
  duration?: number;
  className?: string;
}

/**
 * A single line passes once down a diagram, then a small result label
 * settles in. It runs one pass per `playKey`, never loops, and with reduced
 * motion the result appears right away.
 */
export function ScanlineSweep({
  children,
  result,
  playKey = 0,
  duration = 1800,
  className = '',
}: ScanlineSweepProps) {
  return (
    <div
      key={playKey}
      className={`mg-scan ${className}`}
      style={{ ['--mg-duration' as string]: `${duration}ms` }}
    >
      {children}
      <span className='mg-scan__line' aria-hidden='true' />
      <span className='mg-scan__result' role='status'>
        ✓ {result}
      </span>
    </div>
  );
}
