'use client';

import { useId, useState, type CSSProperties, type ReactNode } from 'react';
import './before-after-wipe.css';

export interface BeforeAfterWipeProps {
  before: ReactNode;
  after: ReactNode;
  beforeLabel?: string;
  afterLabel?: string;
  /** Starting position of the divider, 0–100. */
  defaultValue?: number;
  className?: string;
}

/**
 * Two stacked states with a divider between them. The divider is a native
 * range input stretched over the image, so dragging, touch, arrow keys,
 * Home and End all work without extra code.
 */
export function BeforeAfterWipe({
  before,
  after,
  beforeLabel = 'Before',
  afterLabel = 'After',
  defaultValue = 50,
  className = '',
}: BeforeAfterWipeProps) {
  const [value, setValue] = useState(defaultValue);
  const id = useId();
  return (
    <div
      className={`mg-wipe ${className}`}
      style={{ '--mg-split': `${value}%` } as CSSProperties}
    >
      <div className='mg-wipe__layer'>{before}</div>
      <div className='mg-wipe__layer mg-wipe__layer--after'>{after}</div>
      <span className='mg-wipe__tag mg-wipe__tag--before' aria-hidden='true'>
        {beforeLabel}
      </span>
      <span className='mg-wipe__tag mg-wipe__tag--after' aria-hidden='true'>
        {afterLabel}
      </span>
      <input
        id={id}
        type='range'
        min={0}
        max={100}
        step={1}
        value={value}
        className='mg-wipe__range'
        aria-label={`Compare ${beforeLabel.toLowerCase()} and ${afterLabel.toLowerCase()}`}
        aria-valuetext={`${100 - value}% ${afterLabel.toLowerCase()}, ${value}% ${beforeLabel.toLowerCase()}`}
        onChange={(event) => setValue(Number(event.target.value))}
      />
      <span className='mg-wipe__handle' aria-hidden='true' />
    </div>
  );
}
