'use client';

import { useRef, useState, type PointerEvent } from 'react';
import './canvas-selection-marquee.css';

export interface MarqueeShape {
  id: string;
  label: string;
  x: number;
  y: number;
  w: number;
  h: number;
  kind: 'rect' | 'circle';
}

export interface CanvasSelectionMarqueeProps {
  shapes: MarqueeShape[];
  selected: string[];
  onSelect: (ids: string[]) => void;
  label: string;
  className?: string;
}

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Normalises a drag from any corner into a box with positive size. */
export const boxFrom = (
  x0: number,
  y0: number,
  x1: number,
  y1: number
): Box => ({
  x: Math.min(x0, x1),
  y: Math.min(y0, y1),
  w: Math.abs(x1 - x0),
  h: Math.abs(y1 - y0),
});

const hits = (a: Box, b: Box) =>
  a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

/**
 * Drag across the canvas in any direction to draw a selection box; every
 * shape it touches is selected as you drag. A checkbox list selects the same
 * shapes by keyboard, and Clear empties the selection.
 */
export function CanvasSelectionMarquee({
  shapes,
  selected,
  onSelect,
  label,
  className = '',
}: CanvasSelectionMarqueeProps) {
  const canvas = useRef<HTMLDivElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const [box, setBox] = useState<Box | null>(null);

  const local = (event: PointerEvent) => {
    const rect = canvas.current!.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(rect.width, event.clientX - rect.left)),
      y: Math.max(0, Math.min(rect.height, event.clientY - rect.top)),
    };
  };

  return (
    <div className={`mg-marquee-sel ${className}`}>
      <div
        ref={canvas}
        className='mg-marquee-sel__canvas'
        role='img'
        aria-label={`${label}. ${selected.length} of ${shapes.length} selected.`}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          start.current = local(event);
          setBox({ ...start.current, w: 0, h: 0 });
          onSelect([]);
        }}
        onPointerMove={(event) => {
          if (!start.current) return;
          const p = local(event);
          const next = boxFrom(start.current.x, start.current.y, p.x, p.y);
          setBox(next);
          onSelect(shapes.filter((s) => hits(next, s)).map((s) => s.id));
        }}
        onPointerUp={() => {
          start.current = null;
          setBox(null);
        }}
        onPointerCancel={() => {
          start.current = null;
          setBox(null);
        }}
      >
        {shapes.map((s) => (
          <span
            key={s.id}
            className='mg-marquee-sel__shape'
            data-kind={s.kind}
            data-selected={selected.includes(s.id)}
            style={{ left: s.x, top: s.y, width: s.w, height: s.h }}
          />
        ))}
        {box ? (
          <span
            className='mg-marquee-sel__box'
            style={{ left: box.x, top: box.y, width: box.w, height: box.h }}
          />
        ) : null}
      </div>
      <fieldset className='mg-marquee-sel__list'>
        <legend>Shapes</legend>
        {shapes.map((s) => (
          <label key={s.id}>
            <input
              type='checkbox'
              checked={selected.includes(s.id)}
              onChange={(event) =>
                onSelect(
                  event.target.checked
                    ? [...selected, s.id]
                    : selected.filter((id) => id !== s.id)
                )
              }
            />
            {s.label}
          </label>
        ))}
        <button
          type='button'
          onClick={() => onSelect([])}
          disabled={selected.length === 0}
        >
          Clear selection
        </button>
      </fieldset>
      <p className='mg-marquee-sel__status' role='status'>
        {selected.length} of {shapes.length} selected
      </p>
    </div>
  );
}
