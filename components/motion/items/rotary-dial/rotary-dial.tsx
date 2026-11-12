'use client';

import { useRef, type KeyboardEvent, type PointerEvent } from 'react';
import './rotary-dial.css';

export interface RotaryDialProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  label: string;
  format?: (value: number) => string;
  className?: string;
}

const SWEEP = 270;

/**
 * A knob with discrete stops. Drag around it, or focus it and use the arrow
 * keys, Page Up/Down, Home and End. The exact value is always printed.
 */
export function RotaryDial({
  value,
  onChange,
  min = 0,
  max = 10,
  label,
  format = String,
  className = '',
}: RotaryDialProps) {
  const knob = useRef<HTMLDivElement>(null);
  const turning = useRef(false);
  const steps = max - min;
  const angle = -SWEEP / 2 + ((value - min) / steps) * SWEEP;

  const fromPointer = (event: PointerEvent) => {
    const rect = knob.current!.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    // 0° points up; positive is clockwise.
    let deg = (Math.atan2(dx, -dy) * 180) / Math.PI;
    deg = Math.max(-SWEEP / 2, Math.min(SWEEP / 2, deg));
    onChange(Math.round(min + ((deg + SWEEP / 2) / SWEEP) * steps));
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const next: Record<string, number> = {
      ArrowUp: value + 1,
      ArrowRight: value + 1,
      ArrowDown: value - 1,
      ArrowLeft: value - 1,
      PageUp: value + 3,
      PageDown: value - 3,
      Home: min,
      End: max,
    };
    if (!(event.key in next)) return;
    event.preventDefault();
    onChange(Math.max(min, Math.min(max, next[event.key])));
  };

  return (
    <div className={`mg-dial ${className}`}>
      <div
        ref={knob}
        className='mg-dial__knob'
        role='slider'
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={format(value)}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          turning.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          fromPointer(event);
        }}
        onPointerMove={(event) => turning.current && fromPointer(event)}
        onPointerUp={() => (turning.current = false)}
        onPointerCancel={() => (turning.current = false)}
      >
        {Array.from({ length: steps + 1 }, (_, i) => (
          <span
            key={i}
            className='mg-dial__tick'
            data-on={min + i <= value}
            aria-hidden='true'
            style={{
              transform: `rotate(${-SWEEP / 2 + (i / steps) * SWEEP}deg)`,
            }}
          />
        ))}
        <span
          className='mg-dial__cap'
          aria-hidden='true'
          style={{ transform: `rotate(${angle}deg)` }}
        >
          <span className='mg-dial__pointer' />
        </span>
      </div>
      <output className='mg-dial__value'>{format(value)}</output>
    </div>
  );
}
