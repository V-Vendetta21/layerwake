'use client';

import { useRef, type CSSProperties, type ElementType } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './gradient-sweep-text.css';

export interface GradientSweepTextProps {
  text: string;
  as?: ElementType;
  /** One pass of the color band, in milliseconds. */
  duration?: number;
  direction?: 'left' | 'right';
  paused?: boolean;
  className?: string;
}

/**
 * A band of color crosses stationary lettering. The solid base text keeps
 * full contrast underneath; the band is a decorative copy on top.
 */
export function GradientSweepText({
  text,
  as: Tag = 'span',
  duration = 2600,
  direction = 'right',
  paused = false,
  className = '',
}: GradientSweepTextProps) {
  const root = useRef<HTMLElement>(null);
  const playing = usePlayback(root, paused);
  return (
    <Tag
      ref={root}
      className={`mg-sweeptext ${className}`}
      data-playing={playing}
      data-direction={direction}
      style={{ '--mg-duration': `${duration}ms` } as CSSProperties}
    >
      {text}
      <span className='mg-sweeptext__band' aria-hidden='true'>
        {text}
      </span>
    </Tag>
  );
}
