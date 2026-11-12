'use client';

import {
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useDismiss } from '../../shared/use-dismiss';
import './anchored-popover.css';

export interface AnchoredPopoverProps {
  /** Text on the trigger button. */
  label: string;
  /** Accessible name of the popover itself. */
  title: string;
  children: ReactNode;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * A small panel that opens beside its trigger and grows out of the corner
 * nearest to it. It flips above or shifts sideways to stay inside the
 * nearest ancestor marked `data-popover-boundary` (or the viewport). Escape
 * or an outside press closes it; Escape returns focus to the trigger.
 */
export function AnchoredPopover({
  label,
  title,
  children,
  className = '',
}: AnchoredPopoverProps) {
  const root = useRef<HTMLSpanElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const panel = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState({
    x: 0,
    y: 0,
    origin: 'top left',
    above: false,
  });
  const id = useId();

  useIsomorphicLayoutEffect(() => {
    if (!open || !root.current || !panel.current || !trigger.current) return;
    const anchor = trigger.current.getBoundingClientRect();
    // offsetWidth/Height ignore the opening scale animation.
    const box = {
      width: panel.current.offsetWidth,
      height: panel.current.offsetHeight,
    };
    const boundaryEl = root.current.closest('[data-popover-boundary]');
    const bounds = boundaryEl
      ? boundaryEl.getBoundingClientRect()
      : new DOMRect(0, 0, window.innerWidth, window.innerHeight);
    const gap = 8;
    const above =
      anchor.bottom + gap + box.height > bounds.bottom &&
      anchor.top - gap - box.height >= bounds.top;
    let left = anchor.left;
    left = Math.min(left, bounds.right - box.width - 4);
    left = Math.max(left, bounds.left + 4);
    const top = above ? anchor.top - gap - box.height : anchor.bottom + gap;
    const own = root.current.getBoundingClientRect();
    const originX = anchor.left + anchor.width / 2 - left;
    setPlace({
      x: left - own.left,
      y: top - own.top,
      origin: `${Math.max(0, Math.min(box.width, originX))}px ${above ? '100%' : '0%'}`,
      above,
    });
    panel.current
      .querySelector<HTMLElement>(
        'button, a[href], input, [tabindex]:not([tabindex="-1"])'
      )
      ?.focus();
  }, [open]);

  const close = (refocus: boolean) => {
    setOpen(false);
    if (refocus) trigger.current?.focus();
  };
  useDismiss(open, [root], (reason) => close(reason === 'escape'));

  return (
    <span ref={root} className={`mg-pop ${className}`}>
      <button
        ref={trigger}
        type='button'
        className='mg-pop__trigger'
        aria-expanded={open}
        aria-controls={id}
        onClick={() => (open ? close(false) : setOpen(true))}
      >
        {label}
      </button>
      {open ? (
        <div
          ref={panel}
          id={id}
          role='dialog'
          aria-label={title}
          className='mg-pop__panel'
          data-above={place.above}
          style={
            {
              transform: `translate(${place.x}px, ${place.y}px)`,
              '--mg-origin': place.origin,
            } as CSSProperties
          }
        >
          {children}
          <button
            type='button'
            className='mg-pop__close'
            onClick={() => close(true)}
          >
            Done
          </button>
        </div>
      ) : null}
    </span>
  );
}
