'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './gradient-mesh-drift.css';

export interface GradientMeshDriftProps {
  /** Four colors for the drifting fields. */
  palette: [string, string, string, string];
  children: ReactNode;
  paused?: boolean;
  className?: string;
}

/**
 * Four soft color fields drift slowly behind a panel. The foreground sits on
 * a solid card for contrast. The drift pauses off screen, in a hidden tab
 * or when paused, and is still with reduced motion.
 */
export function GradientMeshDrift({
  palette,
  children,
  paused = false,
  className = '',
}: GradientMeshDriftProps) {
  const root = useRef<HTMLDivElement>(null);
  const playing = usePlayback(root, paused);
  return (
    <div
      ref={root}
      className={`mg-mesh ${className}`}
      data-playing={playing}
      style={palette.reduce(
        (s, c, i) => ({ ...s, [`--mg-c${i + 1}`]: c }),
        {} as CSSProperties
      )}
    >
      <span className='mg-mesh__blob mg-mesh__blob--1' aria-hidden='true' />
      <span className='mg-mesh__blob mg-mesh__blob--2' aria-hidden='true' />
      <span className='mg-mesh__blob mg-mesh__blob--3' aria-hidden='true' />
      <span className='mg-mesh__blob mg-mesh__blob--4' aria-hidden='true' />
      <div className='mg-mesh__panel'>{children}</div>
    </div>
  );
}
