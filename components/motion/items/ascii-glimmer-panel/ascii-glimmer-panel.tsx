import { useMemo, type CSSProperties, type ReactNode } from 'react';
import './ascii-glimmer-panel.css';

export interface AsciiGlimmerPanelProps {
  /** The real content, shown above the decorative grid. */
  children: ReactNode;
  columns?: number;
  rows?: number;
  /** Change this value to run the wave again. */
  playKey?: number | string;
  className?: string;
}

const CHARS = '.:-=+*~';

/**
 * A decorative grid of characters lights up in one diagonal wave and then
 * rests. The grid is hidden from assistive technology; the real content sits
 * on a solid panel above it, so contrast never depends on the effect.
 */
export function AsciiGlimmerPanel({
  children,
  columns = 32,
  rows = 9,
  playKey = 0,
  className = '',
}: AsciiGlimmerPanelProps) {
  const grid = useMemo(
    () =>
      Array.from({ length: rows }, (_, r) =>
        Array.from(
          { length: columns },
          (_, c) => CHARS[(r * 7 + c * 3 + ((r * c) % 5)) % CHARS.length]
        )
      ),
    [rows, columns]
  );
  return (
    <div className={`mg-ascii ${className}`}>
      <div
        key={playKey}
        className='mg-ascii__grid'
        aria-hidden='true'
        style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
      >
        {grid.flatMap((row, r) =>
          row.map((ch, c) => (
            <span
              key={`${r}-${c}`}
              style={{ '--mg-delay': `${(r + c) * 22}ms` } as CSSProperties}
            >
              {ch}
            </span>
          ))
        )}
      </div>
      <div className='mg-ascii__content'>{children}</div>
    </div>
  );
}
