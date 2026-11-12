'use client';

import { useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import './resizable-split-pane.css';

export interface ResizableSplitPaneProps {
  start: ReactNode;
  end: ReactNode;
  /** Width of the first pane, in percent. */
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Accessible name for the separator. */
  label: string;
  className?: string;
}

/**
 * Two panes and a draggable separator. The separator is focusable: arrow
 * keys move it 5% (Shift for 10%), Home and End jump to the limits, and its
 * current position is exposed as a value.
 */
export function ResizableSplitPane({
  start,
  end,
  value,
  onChange,
  min = 20,
  max = 80,
  label,
  className = '',
}: ResizableSplitPaneProps) {
  const root = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const origin = useRef(value);
  const clamp = (v: number) => Math.round(Math.max(min, Math.min(max, v)));

  const drag = usePointerDrag({
    onStart: () => {
      origin.current = value;
      setDragging(true);
    },
    onMove: ({ dx }) => {
      const width = root.current?.clientWidth ?? 1;
      onChange(clamp(origin.current + (dx / width) * 100));
    },
    onEnd: () => setDragging(false),
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const step = event.shiftKey ? 10 : 5;
    const next: Record<string, number> = {
      ArrowLeft: value - step,
      ArrowDown: value - step,
      ArrowRight: value + step,
      ArrowUp: value + step,
      Home: min,
      End: max,
    };
    if (event.key in next) {
      event.preventDefault();
      onChange(clamp(next[event.key]));
    }
  };

  return (
    <div
      ref={root}
      className={`mg-split-pane ${className}`}
      data-dragging={dragging}
      style={{ gridTemplateColumns: `${value}fr 12px ${100 - value}fr` }}
    >
      <div className='mg-split-pane__pane'>{start}</div>
      <div
        role='separator'
        tabIndex={0}
        aria-orientation='vertical'
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-valuetext={`${value}% and ${100 - value}%`}
        className='mg-split-pane__handle'
        onKeyDown={onKeyDown}
        {...drag}
      >
        <span aria-hidden='true' />
      </div>
      <div className='mg-split-pane__pane'>{end}</div>
    </div>
  );
}
