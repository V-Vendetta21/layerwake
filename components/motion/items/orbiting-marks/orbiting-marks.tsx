'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './orbiting-marks.css';

export interface OrbitingMarksProps {
  /** The content in the middle. It never moves. */
  children: ReactNode;
  /** Marks on the inner and outer orbit. */
  inner?: number;
  outer?: number;
  /** 1 is normal speed; 2 is twice as fast. */
  speed?: number;
  paused?: boolean;
  className?: string;
}

/**
 * Small decorative marks circle a still centerpiece on two orbits, in
 * opposite directions. They are hidden from assistive technology, stop when
 * paused, off screen or in a hidden tab, and stay still with reduced motion.
 */
export function OrbitingMarks({
  children,
  inner = 3,
  outer = 5,
  speed = 1,
  paused = false,
  className = '',
}: OrbitingMarksProps) {
  const root = useRef<HTMLDivElement>(null);
  const playing = usePlayback(root, paused);
  const ring = (count: number, which: 'inner' | 'outer') => (
    <div
      className={`mg-orbit__ring mg-orbit__ring--${which}`}
      aria-hidden='true'
    >
      {Array.from({ length: count }, (_, i) => (
        <span
          key={i}
          className='mg-orbit__arm'
          style={{ '--mg-angle': `${(360 / count) * i}deg` } as CSSProperties}
        >
          <span className='mg-orbit__mark' />
        </span>
      ))}
    </div>
  );
  return (
    <div
      ref={root}
      className={`mg-orbit ${className}`}
      data-playing={playing}
      style={{ '--mg-speed': speed } as CSSProperties}
    >
      {ring(outer, 'outer')}
      {ring(inner, 'inner')}
      <div className='mg-orbit__center'>{children}</div>
    </div>
  );
}
