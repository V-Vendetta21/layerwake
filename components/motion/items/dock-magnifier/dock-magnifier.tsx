'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import './dock-magnifier.css';

export interface DockItem {
  id: string;
  label: string;
  icon: ReactNode;
  onSelect?: () => void;
}

export interface DockProps {
  items: DockItem[];
  /** Accessible name for the toolbar. */
  label: string;
  /** Resting size of an item, in pixels. */
  size?: number;
  /** Scale of the item directly under the pointer. */
  magnify?: number;
  /** Distance over which neighbours are affected, in pixels. */
  range?: number;
  className?: string;
}

const GAP = 8;

/** Items grow as the pointer nears them. Focused items grow for keyboards. */
export function Dock({
  items,
  label,
  size = 44,
  magnify = 1.6,
  range = 110,
  className = '',
}: DockProps) {
  const dock = useRef<HTMLDivElement>(null);
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);

  // Scale every item from the pointer's x position, or reset with null.
  const apply = (pointerX: number | null) => {
    const el = dock.current;
    if (!el) return;
    const reduced = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const rect = el.getBoundingClientRect();
    const center = rect.left + rect.width / 2;
    buttons.current.forEach((button, index) => {
      if (!button) return;
      let scale = 1;
      if (pointerX !== null && !reduced) {
        // Resting centers, so growing items do not chase the pointer.
        const rest = center + (index - (items.length - 1) / 2) * (size + GAP);
        const near = Math.max(0, 1 - Math.abs(pointerX - rest) / range);
        scale = 1 + (magnify - 1) * near * near;
      }
      button.style.setProperty(
        '--mg-dock-size',
        `${(size * scale).toFixed(1)}px`
      );
    });
  };

  const centerOf = (index: number) => {
    const rect = dock.current!.getBoundingClientRect();
    return (
      rect.left +
      rect.width / 2 +
      (index - (items.length - 1) / 2) * (size + GAP)
    );
  };

  return (
    <div
      ref={dock}
      role='toolbar'
      aria-label={label}
      className={`mg-dock ${className}`}
      style={{ height: size * magnify + 16, gap: GAP }}
      onPointerMove={(event) =>
        event.pointerType !== 'touch' && apply(event.clientX)
      }
      onPointerLeave={() => apply(null)}
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          ref={(el) => {
            buttons.current[index] = el;
          }}
          type='button'
          className='mg-dock__item'
          aria-label={item.label}
          title={item.label}
          style={{ '--mg-dock-size': `${size}px` } as CSSProperties}
          onFocus={() => apply(centerOf(index))}
          onBlur={() => apply(null)}
          onClick={item.onSelect}
        >
          <span aria-hidden='true'>{item.icon}</span>
        </button>
      ))}
    </div>
  );
}
