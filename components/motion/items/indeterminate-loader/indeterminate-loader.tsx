'use client';

import { useRef } from 'react';
import { usePlayback } from '../../shared/use-playback';
import './indeterminate-loader.css';

export interface IndeterminateLoaderProps {
  /** Accessible name, for example "Loading charts". */
  label: string;
  /** False shows a full, finished bar. */
  active?: boolean;
  className?: string;
}

/**
 * A bar for work of unknown length: a segment runs across it while active.
 * Off screen or in a hidden tab the loop pauses; with reduced motion the
 * bar is still and a "Loading…" label carries the message.
 */
export function IndeterminateLoader({
  label,
  active = true,
  className = '',
}: IndeterminateLoaderProps) {
  const root = useRef<HTMLDivElement>(null);
  const playing = usePlayback(root, !active);
  return (
    <div
      ref={root}
      className={`mg-loader ${className}`}
      data-active={active}
      data-playing={playing}
    >
      <div
        className='mg-loader__track'
        role='progressbar'
        aria-label={label}
        aria-busy={active}
        aria-valuemin={active ? undefined : 0}
        aria-valuemax={active ? undefined : 100}
        aria-valuenow={active ? undefined : 100}
      >
        <span className='mg-loader__bar' />
      </div>
      <span className='mg-loader__text'>
        {active ? `${label}…` : `${label}: done`}
      </span>
    </div>
  );
}
