'use client';

import { useEffect, useState, type CSSProperties } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './bounded-confetti-burst.css';

export interface ConfettiBurstProps {
  /** Increase this number to fire a burst. 0 fires nothing. */
  fire: number;
  /** Particles per burst, capped at 60. */
  count?: number;
  colors?: string[];
  className?: string;
}

interface Piece {
  id: number;
  style: CSSProperties;
}

const DEFAULT_COLORS = ['#164cff', '#b6ff3b', '#0c1738', '#7f9bff'];

/** Small seeded generator so every burst looks the same. */
function random(seed: number) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r = (r + Math.imul(r ^ (r >>> 7), 61 | r)) ^ r;
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * A short burst of confetti that stays inside its parent (give the parent
 * `position: relative` and `overflow: hidden`). It is decoration only: pair
 * it with a visible success message. Nothing renders with reduced motion.
 */
export function ConfettiBurst({
  fire,
  count = 36,
  colors = DEFAULT_COLORS,
  className = '',
}: ConfettiBurstProps) {
  const reduced = useReducedMotion();
  const [pieces, setPieces] = useState<Piece[]>([]);

  useEffect(() => {
    if (!fire || reduced) return;
    const rand = random(fire * 97);
    const total = Math.min(60, Math.max(1, count));
    setPieces(
      Array.from({ length: total }, (_, i) => {
        const angle = -Math.PI / 2 + (rand() - 0.5) * Math.PI * 1.1;
        const speed = 70 + rand() * 90;
        return {
          id: fire * 1000 + i,
          style: {
            '--mg-x': `${Math.cos(angle) * speed}px`,
            '--mg-y': `${Math.sin(angle) * speed}px`,
            '--mg-r': `${(rand() - 0.5) * 720}deg`,
            '--mg-delay': `${rand() * 80}ms`,
            background: colors[i % colors.length],
            width: rand() > 0.5 ? 6 : 8,
            height: rand() > 0.5 ? 10 : 6,
          } as CSSProperties,
        };
      })
    );
    const timer = window.setTimeout(() => setPieces([]), 1400);
    return () => window.clearTimeout(timer);
  }, [fire, count, colors, reduced]);

  if (pieces.length === 0) return null;
  return (
    <div className={`mg-confetti ${className}`} aria-hidden='true'>
      {pieces.map((piece) => (
        <span
          key={piece.id}
          className='mg-confetti__piece'
          style={piece.style}
        />
      ))}
    </div>
  );
}
