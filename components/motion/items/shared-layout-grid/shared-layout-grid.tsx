'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type ReactNode,
} from 'react';
import './shared-layout-grid.css';

export interface LayoutGridProps<T extends { id: string }> {
  items: T[];
  renderItem: (item: T) => ReactNode;
  columns?: number;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Items glide to their new positions when the list changes (FLIP: measure,
 * re-render, then animate from the old position). New items scale in.
 */
export function LayoutGrid<T extends { id: string }>({
  items,
  renderItem,
  columns = 3,
  className = '',
}: LayoutGridProps<T>) {
  const elements = useRef(new Map<string, HTMLElement>());
  const positions = useRef(new Map<string, { left: number; top: number }>());

  useIsomorphicLayoutEffect(() => {
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const next = new Map<string, { left: number; top: number }>();
    elements.current.forEach((el, id) => {
      const now = { left: el.offsetLeft, top: el.offsetTop };
      next.set(id, now);
      if (reduced || typeof el.animate !== 'function') return;
      const before = positions.current.get(id);
      if (!before) {
        el.animate(
          [
            { opacity: 0, transform: 'scale(0.8)' },
            { opacity: 1, transform: 'none' },
          ],
          { duration: 260, easing: 'ease-out' }
        );
        return;
      }
      const dx = before.left - now.left;
      const dy = before.top - now.top;
      if (dx || dy)
        el.animate(
          [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: 'none' }],
          { duration: 420, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' }
        );
    });
    positions.current = next;
  }, [items]);

  return (
    <ul
      className={`mg-layout ${className}`}
      style={{ '--mg-columns': columns } as CSSProperties}
    >
      {items.map((item) => (
        <li
          key={item.id}
          className='mg-layout__item'
          ref={(el) => {
            if (el) elements.current.set(item.id, el);
            else elements.current.delete(item.id);
          }}
        >
          {renderItem(item)}
        </li>
      ))}
    </ul>
  );
}
