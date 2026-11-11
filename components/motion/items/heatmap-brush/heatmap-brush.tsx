'use client';

import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
} from 'react';
import './heatmap-brush.css';

export interface HeatmapBrushProps {
  /** values[row][column] */
  values: number[][];
  rowLabels: string[];
  columnLabels: string[];
  label: string;
  unit?: string;
  className?: string;
}

interface Range {
  r0: number;
  c0: number;
  r1: number;
  c1: number;
}

/**
 * A grid of values with a rectangular selection whose outline glides to each
 * new range. Drag across cells, or focus the grid: arrow keys move, Shift +
 * arrow keys stretch. A sentence below sums up the selection.
 */
export function HeatmapBrush({
  values,
  rowLabels,
  columnLabels,
  label,
  unit = '',
  className = '',
}: HeatmapBrushProps) {
  const rows = values.length;
  const cols = values[0]?.length ?? 0;
  const max = Math.max(...values.flat());
  const [anchor, setAnchor] = useState({ r: 0, c: 0 });
  const [focus, setFocus] = useState({ r: 1, c: 2 });
  const grid = useRef<HTMLDivElement>(null);
  const brushing = useRef(false);
  const id = useId();

  const range: Range = {
    r0: Math.min(anchor.r, focus.r),
    r1: Math.max(anchor.r, focus.r),
    c0: Math.min(anchor.c, focus.c),
    c1: Math.max(anchor.c, focus.c),
  };
  const picked = values
    .slice(range.r0, range.r1 + 1)
    .flatMap((row) => row.slice(range.c0, range.c1 + 1));
  const total = picked.reduce((a, b) => a + b, 0);
  const span = (labels: string[], a: number, b: number) =>
    a === b ? labels[a] : `${labels[a]}–${labels[b]}`;

  const cellAt = (event: PointerEvent) => {
    const el = document
      .elementFromPoint(event.clientX, event.clientY)
      ?.closest<HTMLElement>('[data-r]');
    return el && grid.current?.contains(el)
      ? { r: Number(el.dataset.r), c: Number(el.dataset.c) }
      : null;
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const moves: Record<string, [number, number]> = {
      ArrowUp: [-1, 0],
      ArrowDown: [1, 0],
      ArrowLeft: [0, -1],
      ArrowRight: [0, 1],
    };
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const next = {
      r: Math.max(0, Math.min(rows - 1, focus.r + move[0])),
      c: Math.max(0, Math.min(cols - 1, focus.c + move[1])),
    };
    setFocus(next);
    if (!event.shiftKey) setAnchor(next);
  };

  return (
    <div className={`mg-heat ${className}`}>
      <div
        className='mg-heat__head'
        aria-hidden='true'
        style={{ '--mg-cols': cols } as CSSProperties}
      >
        <span />
        {columnLabels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
      <div className='mg-heat__body'>
        <div className='mg-heat__rows' aria-hidden='true'>
          {rowLabels.map((l) => (
            <span key={l}>{l}</span>
          ))}
        </div>
        <div
          ref={grid}
          className='mg-heat__grid'
          tabIndex={0}
          role='group'
          aria-label={`${label}. Arrow keys move the selection; Shift and arrow keys stretch it.`}
          aria-describedby={id}
          style={{ '--mg-cols': cols, '--mg-rows': rows } as CSSProperties}
          onKeyDown={onKeyDown}
          onPointerDown={(event) => {
            const cell = cellAt(event);
            if (!cell) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            brushing.current = true;
            setAnchor(cell);
            setFocus(cell);
          }}
          onPointerMove={(event) => {
            if (!brushing.current) return;
            const cell = cellAt(event);
            if (cell) setFocus(cell);
          }}
          onPointerUp={() => (brushing.current = false)}
          onPointerCancel={() => (brushing.current = false)}
        >
          {values.map((row, r) =>
            row.map((v, c) => (
              <span
                key={`${r}-${c}`}
                className='mg-heat__cell'
                data-r={r}
                data-c={c}
                data-dark={v / max > 0.55}
                style={{ '--mg-heat': v / max } as CSSProperties}
              >
                {v}
              </span>
            ))
          )}
          <span
            className='mg-heat__brush'
            aria-hidden='true'
            style={{
              left: `${(range.c0 / cols) * 100}%`,
              top: `${(range.r0 / rows) * 100}%`,
              width: `${((range.c1 - range.c0 + 1) / cols) * 100}%`,
              height: `${((range.r1 - range.r0 + 1) / rows) * 100}%`,
            }}
          />
        </div>
      </div>
      <p id={id} className='mg-heat__summary' aria-live='polite'>
        {span(columnLabels, range.c0, range.c1)},{' '}
        {span(rowLabels, range.r0, range.r1)}: {picked.length}{' '}
        {picked.length === 1 ? 'cell' : 'cells'}, total {total}
        {unit}, average {(total / picked.length).toFixed(1)}
        {unit}
      </p>
    </div>
  );
}
