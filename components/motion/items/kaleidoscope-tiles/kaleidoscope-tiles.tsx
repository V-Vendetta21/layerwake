'use client';

import { useRef, type CSSProperties } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './kaleidoscope-tiles.css';

export interface KaleidoscopeTilesProps {
  /** Mirrored wedges around the circle (an even number from 4 to 16). */
  segments?: number;
  paused?: boolean;
  size?: number;
  className?: string;
}

/**
 * A few original shapes drawn in one wedge, mirrored into every other wedge,
 * with the shapes turning slowly inside. Decorative only. Paused, off screen,
 * hidden or with reduced motion it shows the still pattern.
 */
export function KaleidoscopeTiles({
  segments = 8,
  paused = false,
  size = 200,
  className = '',
}: KaleidoscopeTilesProps) {
  const root = useRef<HTMLDivElement>(null);
  const playing = usePlayback(root, paused);
  const n = Math.max(4, Math.min(16, Math.round(segments / 2) * 2));
  const angle = 360 / n;
  const half = (angle / 2) * (Math.PI / 180);
  // The wedge, as a clip path from the center out to the edge.
  const wedge = `polygon(50% 50%, ${50 + 60 * Math.sin(-half)}% ${50 - 60 * Math.cos(half)}%, ${50 + 60 * Math.sin(half)}% ${50 - 60 * Math.cos(half)}%)`;

  return (
    <div
      ref={root}
      className={`mg-kaleido ${className}`}
      data-playing={playing}
      style={{ width: size, height: size } as CSSProperties}
      aria-hidden='true'
    >
      {Array.from({ length: n }, (_, i) => (
        <div
          key={i}
          className='mg-kaleido__wedge'
          style={{
            transform: `rotate(${i * angle}deg) scaleX(${i % 2 ? -1 : 1})`,
            clipPath: wedge,
          }}
        >
          <div className='mg-kaleido__shapes'>
            <span className='mg-kaleido__a' />
            <span className='mg-kaleido__b' />
            <span className='mg-kaleido__c' />
          </div>
        </div>
      ))}
    </div>
  );
}
