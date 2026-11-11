'use client';

import { useState, type ReactNode } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './swipe-deck.css';

export interface SwipeDeckProps<T> {
  items: T[];
  renderCard: (item: T) => ReactNode;
  /** Index of the top card. */
  index: number;
  onIndexChange: (index: number) => void;
  /** Accessible name, for example "Destinations". */
  label: string;
  className?: string;
}

/**
 * A stack of cards. Drag the top card sideways to throw it off and reveal
 * the next; a short drag springs back. Vertical swipes still scroll the
 * page. Previous and Next do the same with buttons.
 */
export function SwipeDeck<T>({
  items,
  renderCard,
  index,
  onIndexChange,
  label,
  className = '',
}: SwipeDeckProps<T>) {
  const [dx, setDx] = useState<number | null>(null);
  const [leaving, setLeaving] = useState<{ index: number; dir: 1 | -1 } | null>(
    null
  );
  const reduced = useReducedMotion();
  const done = index >= items.length;

  const next = (dir: 1 | -1 = 1) => {
    if (done) return;
    if (!reduced) setLeaving({ index, dir });
    onIndexChange(index + 1);
  };

  const drag = usePointerDrag({
    onMove: ({ dx: x }) => setDx(x),
    onEnd: ({ dx: x, vx }, cancelled) => {
      setDx(null);
      if (cancelled) return;
      if (Math.abs(x) > 90 || Math.abs(vx) > 0.6) next(x < 0 ? -1 : 1);
    },
  });

  return (
    <div
      className={`mg-deck ${className}`}
      role='region'
      aria-roledescription='card stack'
      aria-label={label}
    >
      <div className='mg-deck__stack'>
        {done ? (
          <div className='mg-deck__end'>
            <strong>All {items.length} seen</strong>
            <span>Go back, or start again.</span>
          </div>
        ) : null}
        {items.map((item, i) => {
          const depth = i - index;
          if (depth < 0 && leaving?.index !== i) return null;
          if (depth > 2) return null;
          const top = depth === 0;
          const out = leaving?.index === i;
          return (
            <div
              key={i}
              className='mg-deck__card'
              data-top={top}
              data-leaving={out}
              aria-hidden={!top}
              style={
                out
                  ? {
                      transform: `translateX(${leaving!.dir * 130}%) rotate(${leaving!.dir * 18}deg)`,
                      opacity: 0,
                    }
                  : {
                      zIndex: 10 - depth,
                      transform:
                        top && dx !== null
                          ? `translateX(${dx}px) rotate(${dx / 18}deg)`
                          : `translateY(${depth * 10}px) scale(${1 - depth * 0.05})`,
                      transition: top && dx !== null ? 'none' : undefined,
                    }
              }
              onTransitionEnd={() => out && setLeaving(null)}
              {...(top ? drag : {})}
            >
              {renderCard(item)}
            </div>
          );
        })}
      </div>
      <div className='mg-deck__controls'>
        <button
          type='button'
          onClick={() => onIndexChange(Math.max(0, index - 1))}
          disabled={index === 0}
        >
          ← Previous
        </button>
        <span role='status'>
          {done ? 'End of stack' : `Card ${index + 1} of ${items.length}`}
        </span>
        {done ? (
          <button type='button' onClick={() => onIndexChange(0)}>
            Start again
          </button>
        ) : (
          <button type='button' onClick={() => next(1)}>
            Next →
          </button>
        )}
      </div>
    </div>
  );
}
