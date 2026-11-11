'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import './swipe-action-row.css';

export interface SwipeAction {
  id: string;
  label: string;
  tone?: 'neutral' | 'danger';
}

export interface SwipeActionRowProps {
  children: ReactNode;
  /** Short name of the row, used in the "Show actions" button label. */
  name: string;
  actions: SwipeAction[];
  onAction: (id: string) => void;
  className?: string;
}

const ACTION_WIDTH = 84;

/**
 * Swipe the row left to uncover its actions; it snaps open or closed. Up and
 * down still scroll on touch. The "⋯" button does the same without a
 * gesture, and hidden actions stay out of the tab order.
 */
export function SwipeActionRow({
  children,
  name,
  actions,
  onAction,
  className = '',
}: SwipeActionRowProps) {
  const width = actions.length * ACTION_WIDTH;
  const [open, setOpen] = useState(false);
  const [offset, setOffset] = useState<number | null>(null);
  const first = useRef<HTMLButtonElement>(null);
  const toggle = useRef<HTMLButtonElement>(null);
  const viaButton = useRef(false);

  useEffect(() => {
    if (open && viaButton.current) first.current?.focus();
    viaButton.current = false;
  }, [open]);

  const drag = usePointerDrag({
    onStart: (event) => {
      if ((event.target as HTMLElement).closest('button')) return false;
    },
    onMove: ({ dx }) => {
      const base = open ? -width : 0;
      setOffset(Math.max(-width - 24, Math.min(0, base + dx)));
    },
    onEnd: ({ dx, vx }, cancelled) => {
      const base = open ? -width : 0;
      const end = base + dx;
      setOffset(null);
      if (cancelled) return;
      setOpen(vx < -0.4 || (vx <= 0.4 && end < -width / 2));
    },
  });

  const x = offset ?? (open ? -width : 0);
  return (
    <div
      className={`mg-swipe ${className}`}
      data-dragging={offset !== null}
      onKeyDown={(event) => {
        if (event.key === 'Escape' && open) {
          setOpen(false);
          toggle.current?.focus();
        }
      }}
    >
      <div className='mg-swipe__actions' style={{ width }}>
        {actions.map((action, index) => (
          <button
            key={action.id}
            ref={index === 0 ? first : undefined}
            type='button'
            tabIndex={open ? 0 : -1}
            aria-hidden={!open}
            data-tone={action.tone ?? 'neutral'}
            onClick={() => {
              setOpen(false);
              onAction(action.id);
            }}
          >
            {action.label}
          </button>
        ))}
      </div>
      <div
        className='mg-swipe__front'
        style={{ transform: `translateX(${x}px)` }}
        {...drag}
      >
        <div className='mg-swipe__content'>{children}</div>
        <button
          ref={toggle}
          type='button'
          className='mg-swipe__more'
          aria-expanded={open}
          aria-label={`${open ? 'Hide' : 'Show'} actions for ${name}`}
          onClick={() => {
            viaButton.current = true;
            setOpen((value) => !value);
          }}
        >
          ⋯
        </button>
      </div>
    </div>
  );
}
