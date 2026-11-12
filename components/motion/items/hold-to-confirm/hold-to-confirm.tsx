'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
} from 'react';
import './hold-to-confirm.css';

export interface HoldToConfirmProps {
  /** Shown before and during the hold, for example "Hold to delete". */
  label: string;
  /** Shown once confirmed, for example "Deleted". */
  doneLabel: string;
  /** Called exactly once when the hold completes. */
  onConfirm: () => void;
  /** How long to hold, in milliseconds. */
  duration?: number;
  /** Clear the confirmed state (for example after an undo). */
  resetKey?: number | string;
  className?: string;
}

type Phase = 'idle' | 'holding' | 'done';

/**
 * Press and hold (pointer, Space or Enter) until the track fills. Letting go
 * early, or moving focus away, cancels. A second, clearly labelled button
 * offers a two-tap confirmation for anyone who cannot hold.
 */
export function HoldToConfirm({
  label,
  doneLabel,
  onConfirm,
  duration = 1200,
  resetKey = 0,
  className = '',
}: HoldToConfirmProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [armed, setArmed] = useState(false);
  const fill = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);
  const start = useRef(0);
  const confirmRef = useRef(onConfirm);
  confirmRef.current = onConfirm;

  useEffect(() => {
    setPhase('idle');
    setArmed(false);
  }, [resetKey]);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const setProgress = (value: number) =>
    fill.current?.style.setProperty('--mg-progress', String(value));

  const commit = () => {
    cancelAnimationFrame(frame.current);
    setProgress(1);
    setPhase('done');
    setArmed(false);
    confirmRef.current();
  };

  const begin = () => {
    if (phase !== 'idle') return;
    setPhase('holding');
    start.current = performance.now();
    const tick = (now: number) => {
      const progress = Math.min(1, (now - start.current) / duration);
      setProgress(progress);
      if (progress >= 1) commit();
      else frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };

  const cancel = () => {
    if (phase !== 'holding') return;
    cancelAnimationFrame(frame.current);
    setProgress(0);
    setPhase('idle');
  };

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      begin();
    }
  };
  const onKeyUp = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === ' ' || event.key === 'Enter') cancel();
  };

  return (
    <div className={`mg-hold ${className}`} data-phase={phase}>
      <button
        type='button'
        className='mg-hold__button'
        disabled={phase === 'done'}
        onPointerDown={(event) => {
          if (event.button === 0) begin();
        }}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        onPointerCancel={cancel}
        onBlur={cancel}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onContextMenu={(event) => event.preventDefault()}
      >
        <span
          ref={fill}
          className='mg-hold__fill'
          aria-hidden='true'
          style={{ '--mg-progress': 0 } as CSSProperties}
        />
        <span className='mg-hold__label'>
          {phase === 'done'
            ? `✓ ${doneLabel}`
            : phase === 'holding'
              ? 'Keep holding…'
              : label}
        </span>
      </button>
      {phase !== 'done' ? (
        <button
          type='button'
          className='mg-hold__alt'
          onClick={() => (armed ? commit() : setArmed(true))}
          onBlur={() => setArmed(false)}
        >
          {armed ? 'Tap again to confirm' : 'Confirm without holding'}
        </button>
      ) : null}
      <span className='mg-hold__sr' role='status'>
        {phase === 'done' ? doneLabel : ''}
      </span>
    </div>
  );
}
