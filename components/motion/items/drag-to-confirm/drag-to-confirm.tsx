'use client';

import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
} from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import './drag-to-confirm.css';

export interface DragToConfirmProps {
  label: string;
  doneLabel: string;
  onConfirm: () => void;
  /** Clear the confirmed state. */
  resetKey?: number | string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Slide the thumb to the end of the track to confirm; let go short and it
 * snaps back. The thumb is a slider for keyboards (arrow keys, End), and a
 * labelled button below confirms with two taps.
 */
export function DragToConfirm({
  label,
  doneLabel,
  onConfirm,
  resetKey = 0,
  className = '',
}: DragToConfirmProps) {
  const track = useRef<HTMLDivElement>(null);
  const [travel, setTravel] = useState(0);
  const [value, setValue] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [done, setDone] = useState(false);
  const [armed, setArmed] = useState(false);
  const startValue = useRef(0);
  const latest = useRef(0);
  latest.current = value;

  useIsomorphicLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const measure = () => setTravel(el.clientWidth - 52);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    setDone(false);
    setValue(0);
    setArmed(false);
  }, [resetKey]);

  const confirm = () => {
    setValue(1);
    setDone(true);
    setArmed(false);
    onConfirm();
  };

  const drag = usePointerDrag({
    onStart: () => {
      if (done) return false;
      startValue.current = value;
      setDragging(true);
    },
    onMove: ({ dx }) =>
      setValue(
        Math.max(0, Math.min(1, startValue.current + dx / Math.max(1, travel)))
      ),
    onEnd: (_, cancelled) => {
      setDragging(false);
      if (!cancelled && latest.current >= 0.92) confirm();
      else setValue(0);
    },
  });

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (done) return;
    const step = {
      ArrowRight: 0.25,
      ArrowUp: 0.25,
      ArrowLeft: -0.25,
      ArrowDown: -0.25,
    }[event.key];
    if (event.key === 'End') {
      event.preventDefault();
      confirm();
    } else if (event.key === 'Home') {
      event.preventDefault();
      setValue(0);
    } else if (step !== undefined) {
      event.preventDefault();
      const next = Math.max(0, Math.min(1, value + step));
      if (next >= 1) confirm();
      else setValue(next);
    }
  };

  return (
    <div
      className={`mg-dragok ${className}`}
      data-done={done}
      data-dragging={dragging}
    >
      <div ref={track} className='mg-dragok__track'>
        <span
          className='mg-dragok__fill'
          style={{ width: 52 + value * travel }}
          aria-hidden='true'
        />
        <span className='mg-dragok__text' aria-hidden='true'>
          {done ? `✓ ${doneLabel}` : `${label} →`}
        </span>
        <div
          role='slider'
          tabIndex={done ? -1 : 0}
          aria-label={label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(value * 100)}
          aria-valuetext={done ? doneLabel : `${Math.round(value * 100)}%`}
          aria-disabled={done}
          className='mg-dragok__thumb'
          style={{ transform: `translateX(${value * travel}px)` }}
          onKeyDown={onKeyDown}
          {...drag}
        >
          <span aria-hidden='true'>{done ? '✓' : '›'}</span>
        </div>
      </div>
      {!done ? (
        <button
          type='button'
          className='mg-dragok__alt'
          onClick={() => (armed ? confirm() : setArmed(true))}
          onBlur={() => setArmed(false)}
        >
          {armed ? 'Tap again to confirm' : 'Confirm without sliding'}
        </button>
      ) : null}
      <span className='mg-dragok__sr' role='status'>
        {done ? doneLabel : ''}
      </span>
    </div>
  );
}
