'use client';

import { useLayoutEffect, useEffect, useRef, useState } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './card-transfer-board.css';

export interface BoardCard {
  id: string;
  title: string;
  column: string;
}

export interface BoardColumn {
  id: string;
  title: string;
}

export interface CardTransferBoardProps {
  columns: BoardColumn[];
  cards: BoardCard[];
  onMove: (cardId: string, columnId: string) => void;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Drag a card into another column, or use its "Move to" button. Cards in
 * both columns glide to close the gap and make room (measured positions
 * before and after the change, then animated between them).
 */
export function CardTransferBoard({
  columns,
  cards,
  onMove,
  className = '',
}: CardTransferBoardProps) {
  const board = useRef<HTMLDivElement>(null);
  const positions = useRef(new Map<string, DOMRect>());
  const [dragging, setDragging] = useState<{
    id: string;
    x: number;
    y: number;
    over: string | null;
  } | null>(null);
  const [message, setMessage] = useState('');
  const reduced = useReducedMotion();

  const snapshot = () => {
    const map = new Map<string, DOMRect>();
    board.current
      ?.querySelectorAll<HTMLElement>('[data-card]')
      .forEach((el) => map.set(el.dataset.card!, el.getBoundingClientRect()));
    return map;
  };

  useIsomorphicLayoutEffect(() => {
    const before = positions.current;
    const after = snapshot();
    if (!reduced)
      after.forEach((rect, id) => {
        const old = before.get(id);
        const el = board.current?.querySelector<HTMLElement>(
          `[data-card="${id}"]`
        );
        if (!old || !el?.animate) return;
        const dx = old.left - rect.left;
        const dy = old.top - rect.top;
        if (dx || dy)
          el.animate(
            [
              { transform: `translate(${dx}px, ${dy}px)` },
              { transform: 'none' },
            ],
            {
              duration: 360,
              easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)',
            }
          );
      });
    positions.current = after;
  }, [cards]);

  const transfer = (id: string, column: string) => {
    const card = cards.find((c) => c.id === id);
    if (!card || card.column === column) return;
    positions.current = snapshot();
    onMove(id, column);
    setMessage(
      `Moved “${card.title}” to ${columns.find((c) => c.id === column)?.title}.`
    );
  };

  const columnAt = (x: number, y: number) => {
    const el = document
      .elementFromPoint(x, y)
      ?.closest<HTMLElement>('[data-column]');
    return el && board.current?.contains(el) ? el.dataset.column! : null;
  };

  const dragId = useRef('');
  const drag = usePointerDrag({
    onStart: (event) => {
      if ((event.target as HTMLElement).closest('button')) return false;
      dragId.current = (event.currentTarget as HTMLElement).dataset.card!;
      setDragging({ id: dragId.current, x: 0, y: 0, over: null });
    },
    onMove: ({ dx, dy, clientX, clientY }) =>
      setDragging({
        id: dragId.current,
        x: dx,
        y: dy,
        over: columnAt(clientX, clientY),
      }),
    onEnd: ({ clientX, clientY }, cancelled) => {
      const over = cancelled ? null : columnAt(clientX, clientY);
      // Start the glide from where the card was dropped.
      positions.current = snapshot();
      setDragging(null);
      if (over) transfer(dragId.current, over);
    },
  });

  return (
    <div ref={board} className={`mg-board ${className}`}>
      {columns.map((column) => {
        const list = cards.filter((card) => card.column === column.id);
        return (
          <section
            key={column.id}
            className='mg-board__column'
            data-column={column.id}
            data-over={dragging?.over === column.id}
            aria-label={`${column.title}, ${list.length} ${list.length === 1 ? 'card' : 'cards'}`}
          >
            <h4>
              {column.title} <span>{list.length}</span>
            </h4>
            <ul>
              {list.map((card) => {
                const other = columns.find((c) => c.id !== column.id)!;
                const held = dragging?.id === card.id;
                return (
                  <li
                    key={card.id}
                    data-card={card.id}
                    data-held={held}
                    className='mg-board__card'
                    style={
                      held
                        ? {
                            transform: `translate(${dragging!.x}px, ${dragging!.y}px) rotate(2deg)`,
                          }
                        : undefined
                    }
                    {...drag}
                  >
                    <span>{card.title}</span>
                    <button
                      type='button'
                      aria-label={`Move ${card.title} to ${other.title}`}
                      onClick={() => transfer(card.id, other.id)}
                    >
                      {column.id === columns[0].id ? '→' : '←'}
                    </button>
                  </li>
                );
              })}
              {list.length === 0 ? (
                <li className='mg-board__empty'>Drop a card here</li>
              ) : null}
            </ul>
          </section>
        );
      })}
      <p className='mg-board__status' role='status'>
        {message}
      </p>
    </div>
  );
}
