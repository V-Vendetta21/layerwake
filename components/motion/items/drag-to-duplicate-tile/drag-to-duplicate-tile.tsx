'use client';

import { useRef, useState, type ReactNode } from 'react';
import { usePointerDrag } from '../../shared/use-pointer-drag';
import './drag-to-duplicate-tile.css';

export interface TileKind {
  id: string;
  label: string;
  render: () => ReactNode;
}

export interface PlacedTile {
  key: number;
  kind: string;
  x: number;
  y: number;
}

export interface DragToDuplicateTileProps {
  kinds: TileKind[];
  tiles: PlacedTile[];
  onAdd: (tile: Omit<PlacedTile, 'key'>) => void;
  className?: string;
}

const SIZE = 44;

/**
 * Drag a tile from the palette onto the canvas to drop a copy there; the
 * original stays in the palette for the next copy. Clicking a palette tile
 * (or pressing Enter on it) adds a copy at the next free spot.
 */
export function DragToDuplicateTile({
  kinds,
  tiles,
  onAdd,
  className = '',
}: DragToDuplicateTileProps) {
  const root = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{
    kind: string;
    x: number;
    y: number;
    over: boolean;
  } | null>(null);
  const dragged = useRef(false);
  const kind = useRef('');

  const toCanvas = (clientX: number, clientY: number) => {
    const rect = canvas.current!.getBoundingClientRect();
    return {
      x: clientX - rect.left - SIZE / 2,
      y: clientY - rect.top - SIZE / 2,
      inside:
        clientX >= rect.left &&
        clientX <= rect.right &&
        clientY >= rect.top &&
        clientY <= rect.bottom,
      w: rect.width,
      h: rect.height,
    };
  };

  const drag = usePointerDrag({
    onStart: (event) => {
      kind.current = (event.currentTarget as HTMLElement).dataset.kind!;
      dragged.current = false;
    },
    onMove: ({ dx, dy, clientX, clientY }) => {
      if (Math.abs(dx) + Math.abs(dy) > 6) dragged.current = true;
      if (!dragged.current) return;
      const r = root.current!.getBoundingClientRect();
      setGhost({
        kind: kind.current,
        x: clientX - r.left - SIZE / 2,
        y: clientY - r.top - SIZE / 2,
        over: toCanvas(clientX, clientY).inside,
      });
    },
    onEnd: ({ clientX, clientY }, cancelled) => {
      setGhost(null);
      if (!dragged.current || cancelled) return;
      const at = toCanvas(clientX, clientY);
      if (at.inside)
        onAdd({
          kind: kind.current,
          x: Math.max(0, Math.min(at.w - SIZE, at.x)),
          y: Math.max(0, Math.min(at.h - SIZE, at.y)),
        });
    },
  });

  const nextSpot = () => {
    const w = canvas.current?.clientWidth ?? 200;
    const perRow = Math.max(1, Math.floor((w - 12) / (SIZE + 8)));
    const i = tiles.length;
    return {
      x: 12 + (i % perRow) * (SIZE + 8),
      y: 12 + Math.floor(i / perRow) * (SIZE + 8),
    };
  };

  const kindOf = (id: string) => kinds.find((k) => k.id === id)!;
  return (
    <div ref={root} className={`mg-dup ${className}`}>
      <div className='mg-dup__palette' role='group' aria-label='Palette'>
        {kinds.map((k) => (
          <button
            key={k.id}
            type='button'
            data-kind={k.id}
            className='mg-dup__source'
            aria-label={`Add ${k.label}`}
            onClick={() => {
              if (dragged.current) {
                dragged.current = false;
                return;
              }
              onAdd({ kind: k.id, ...nextSpot() });
            }}
            {...drag}
          >
            {k.render()}
          </button>
        ))}
      </div>
      <div
        ref={canvas}
        className='mg-dup__canvas'
        data-over={ghost?.over ?? false}
        role='region'
        aria-label={`Canvas, ${tiles.length} ${tiles.length === 1 ? 'tile' : 'tiles'}`}
      >
        {tiles.length === 0 ? (
          <span className='mg-dup__hint'>Drop tiles here</span>
        ) : null}
        {tiles.map((t) => (
          <span
            key={t.key}
            className='mg-dup__tile'
            role='img'
            aria-label={kindOf(t.kind).label}
            style={{ transform: `translate(${t.x}px, ${t.y}px)` }}
          >
            <span className='mg-dup__pop'>{kindOf(t.kind).render()}</span>
          </span>
        ))}
      </div>
      {ghost ? (
        <span
          className='mg-dup__ghost'
          aria-hidden='true'
          style={{ transform: `translate(${ghost.x}px, ${ghost.y}px)` }}
        >
          {kindOf(ghost.kind).render()}
        </span>
      ) : null}
      <p className='mg-dup__status' role='status'>
        {tiles.length} {tiles.length === 1 ? 'tile' : 'tiles'} on the canvas
      </p>
    </div>
  );
}
