'use client';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './drag-reorder-list.css';

export interface ReorderItem {
  id: string;
  label: string;
}

export interface DragReorderListProps {
  items: ReorderItem[];
  onReorder: (items: ReorderItem[]) => void;
  /** Accessible name for the list. */
  label: string;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

const move = <T,>(list: T[], from: number, to: number) => {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
};

/**
 * Drag a row by its handle; the other rows slide aside to show where it will
 * land. Every row also has Move up and Move down buttons, and each move is
 * announced with the new position.
 */
export function DragReorderList({
  items,
  onReorder,
  label,
  className = '',
}: DragReorderListProps) {
  const list = useRef<HTMLOListElement>(null);
  const [drag, setDrag] = useState<{
    from: number;
    to: number;
    dy: number;
    slot: number;
  } | null>(null);
  const [message, setMessage] = useState('');
  const dragRef = useRef(drag);
  dragRef.current = drag;
  const dropped = useRef<{ id: string; offset: number } | null>(null);
  const focusAfter = useRef<string | null>(null);
  const reduced = useReducedMotion();

  // Settle the dropped row from where it was let go.
  useIsomorphicLayoutEffect(() => {
    const done = dropped.current;
    dropped.current = null;
    if (done && !reduced) {
      const el = list.current?.querySelector<HTMLElement>(
        `[data-id="${done.id}"]`
      );
      el?.animate?.(
        [{ transform: `translateY(${done.offset}px)` }, { transform: 'none' }],
        {
          duration: 220,
          easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
        }
      );
    }
    if (focusAfter.current) {
      list.current?.querySelector<HTMLElement>(focusAfter.current)?.focus();
      focusAfter.current = null;
    }
  }, [items]);

  const commit = (from: number, to: number) => {
    if (from === to) return;
    const next = move(items, from, to);
    onReorder(next);
    setMessage(
      `Moved “${items[from].label}” to position ${to + 1} of ${items.length}.`
    );
  };

  // One drag controller for the whole list; the handle tells it which row.
  const active = useRef(0);
  const dragger = usePointerDrag({
    onStart: (event) => {
      const row = (event.currentTarget as HTMLElement).closest<HTMLElement>(
        '[data-index]'
      );
      if (!row) return false;
      active.current = Number(row.dataset.index);
      const slot =
        row.offsetHeight +
        parseFloat(getComputedStyle(list.current!).rowGap || '0');
      setDrag({ from: active.current, to: active.current, dy: 0, slot });
    },
    onMove: ({ dy }) =>
      setDrag((d) =>
        d
          ? {
              ...d,
              dy,
              to: Math.max(
                0,
                Math.min(items.length - 1, d.from + Math.round(dy / d.slot))
              ),
            }
          : d
      ),
    onEnd: () => {
      const d = dragRef.current;
      setDrag(null);
      if (!d) return;
      dropped.current = {
        id: items[d.from].id,
        offset: d.dy - (d.to - d.from) * d.slot,
      };
      commit(d.from, d.to);
    },
  });

  const shift = (index: number) => {
    if (!drag || index === drag.from) return 0;
    if (drag.from < drag.to && index > drag.from && index <= drag.to)
      return -drag.slot;
    if (drag.from > drag.to && index < drag.from && index >= drag.to)
      return drag.slot;
    return 0;
  };

  return (
    <div className={`mg-reorder ${className}`} data-dragging={drag !== null}>
      <ol ref={list} className='mg-reorder__list' aria-label={label}>
        {items.map((item, index) => {
          const dragging = drag?.from === index;
          return (
            <li
              key={item.id}
              data-id={item.id}
              data-index={index}
              data-dragging={dragging}
              className='mg-reorder__row'
              style={{
                transform: `translateY(${dragging ? drag!.dy : shift(index)}px)`,
              }}
            >
              <span
                className='mg-reorder__handle'
                aria-hidden='true'
                title='Drag to reorder'
                {...dragger}
              >
                ⋮⋮
              </span>
              <span className='mg-reorder__label'>{item.label}</span>
              <button
                type='button'
                className='mg-reorder__move'
                data-move='up'
                aria-label={`Move ${item.label} up`}
                disabled={index === 0}
                onClick={() => {
                  focusAfter.current = `[data-id="${item.id}"] [data-move="${index - 1 === 0 ? 'down' : 'up'}"]`;
                  commit(index, index - 1);
                }}
              >
                ↑
              </button>
              <button
                type='button'
                className='mg-reorder__move'
                data-move='down'
                aria-label={`Move ${item.label} down`}
                disabled={index === items.length - 1}
                onClick={() => {
                  focusAfter.current = `[data-id="${item.id}"] [data-move="${index + 1 === items.length - 1 ? 'up' : 'down'}"]`;
                  commit(index, index + 1);
                }}
              >
                ↓
              </button>
            </li>
          );
        })}
      </ol>
      <p className='mg-reorder__status' role='status'>
        {message}
      </p>
    </div>
  );
}
