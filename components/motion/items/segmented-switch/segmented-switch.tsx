'use client';

import { useRef, type CSSProperties, type KeyboardEvent } from 'react';
import './segmented-switch.css';

export interface SegmentedSwitchProps {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  /** Accessible name for the group. */
  label: string;
  className?: string;
}

/** A radio group whose thumb slides to the chosen option. */
export function SegmentedSwitch({
  options,
  value,
  onChange,
  label,
  className = '',
}: SegmentedSwitchProps) {
  const group = useRef<HTMLDivElement>(null);
  const index = Math.max(
    0,
    options.findIndex((option) => option.value === value)
  );

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step =
      event.key === 'ArrowRight' || event.key === 'ArrowDown'
        ? 1
        : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
          ? -1
          : 0;
    if (!step) return;
    event.preventDefault();
    const next = options[(index + step + options.length) % options.length];
    onChange(next.value);
    group.current
      ?.querySelector<HTMLElement>(`[data-value="${next.value}"]`)
      ?.focus();
  };

  return (
    <div
      ref={group}
      role='radiogroup'
      aria-label={label}
      className={`mg-segmented ${className}`}
      style={
        { '--mg-count': options.length, '--mg-index': index } as CSSProperties
      }
      onKeyDown={onKeyDown}
    >
      <span className='mg-segmented__thumb' aria-hidden='true' />
      {options.map((option) => (
        <button
          key={option.value}
          type='button'
          role='radio'
          data-value={option.value}
          aria-checked={option.value === value}
          tabIndex={option.value === value ? 0 : -1}
          className='mg-segmented__option'
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
