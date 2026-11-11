import { useMemo, type CSSProperties, type ReactNode } from 'react';
import './pixel-dissolve.css';

export interface PixelDissolveProps {
  /** The image to reveal. Give it its own alternative text. */
  children: ReactNode;
  columns?: number;
  rows?: number;
  /** Same seed, same pattern: every replay looks identical. */
  seed?: number;
  /** Change this value to play the reveal again. */
  playKey?: number | string;
  /** Total reveal time, in milliseconds. */
  duration?: number;
  className?: string;
}

/** Deterministic shuffle so the dissolve order is the same on every replay. */
function order(count: number, seed: number) {
  let t = seed >>> 0;
  const rand = () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
  const list = Array.from({ length: count }, (_, i) => i);
  for (let i = count - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * Covers an image with a grid of tiles (capped at 400) that vanish in a
 * seeded random order. With reduced motion the image is simply shown.
 */
export function PixelDissolve({
  children,
  columns = 12,
  rows = 8,
  seed = 7,
  playKey = 0,
  duration = 1200,
  className = '',
}: PixelDissolveProps) {
  const cols = Math.max(1, Math.min(20, columns));
  const rws = Math.max(1, Math.min(20, rows));
  const sequence = useMemo(() => order(cols * rws, seed), [cols, rws, seed]);
  return (
    <div className={`mg-dissolve ${className}`}>
      {children}
      <div
        key={playKey}
        className='mg-dissolve__tiles'
        aria-hidden='true'
        style={{
          gridTemplateColumns: `repeat(${cols}, 1fr)`,
          gridTemplateRows: `repeat(${rws}, 1fr)`,
        }}
      >
        {sequence.map((rank, i) => (
          <span
            key={i}
            style={
              {
                '--mg-delay': `${(rank / sequence.length) * duration}ms`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    </div>
  );
}
