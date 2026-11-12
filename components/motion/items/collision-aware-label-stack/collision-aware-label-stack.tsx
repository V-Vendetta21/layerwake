'use client';

import './collision-aware-label-stack.css';

export interface LabelPoint {
  id: string;
  label: string;
  /** Position in the chart's own units. */
  x: number;
  y: number;
}

export interface CollisionAwareLabelStackProps {
  points: LabelPoint[];
  width: number;
  height: number;
  label: string;
  /** Label box height in chart units. */
  rowHeight?: number;
  className?: string;
}

/**
 * Labels sit to the right of their points. When two would overlap, the later
 * one is pushed down (and then the stack is pulled back inside the chart),
 * with a leader line connecting each label to its point. Positions glide as
 * the points move. Exact values are listed separately below the chart.
 */
export function CollisionAwareLabelStack({
  points,
  width,
  height,
  label,
  rowHeight = 18,
  className = '',
}: CollisionAwareLabelStackProps) {
  // Simple, stable placement: sort by y, push down to clear the one above.
  const sorted = [...points].sort((a, b) => a.y - b.y);
  const placed: Record<string, number> = {};
  let floor = -Infinity;
  for (const p of sorted) {
    const y = Math.max(p.y, floor + rowHeight);
    placed[p.id] = y;
    floor = y;
  }
  const overflow = floor + rowHeight / 2 - height;
  if (overflow > 0) for (const id in placed) placed[id] -= overflow;

  const labelX = width - 92;
  return (
    <figure className={`mg-labels ${className}`}>
      <svg viewBox={`0 0 ${width} ${height}`} role='img' aria-label={label}>
        {points.map((p) => (
          <g
            key={p.id}
            className='mg-labels__item'
            data-moved={Math.abs(placed[p.id] - p.y) > 0.5}
          >
            <path
              className='mg-labels__leader'
              d={`M${p.x} ${p.y} L${labelX - 6} ${placed[p.id]}`}
            />
            <circle className='mg-labels__point' cx={p.x} cy={p.y} r='4' />
            <g
              className='mg-labels__tag'
              style={{ transform: `translate(${labelX}px, ${placed[p.id]}px)` }}
            >
              <rect
                x='0'
                y={-rowHeight / 2 + 2}
                width='86'
                height={rowHeight - 4}
                rx='4'
              />
              <text x='6' y='4'>
                {p.label}
              </text>
            </g>
          </g>
        ))}
      </svg>
      <figcaption>
        <ul className='mg-labels__values'>
          {points.map((p) => (
            <li key={p.id}>
              {p.label}: x {Math.round(p.x)}, y {Math.round(p.y)}
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
