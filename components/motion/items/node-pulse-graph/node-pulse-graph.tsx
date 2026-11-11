'use client';

import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './node-pulse-graph.css';

export interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
}

export interface NodePulseGraphProps {
  nodes: GraphNode[];
  edges: [string, string][];
  /** The node the pulse starts from. */
  source: string;
  /** Change this value to send a new pulse. */
  run: number;
  /** Called with the nodes reached at each step, for a text summary. */
  onComplete?: (levels: string[][]) => void;
  viewBox: string;
  label: string;
  className?: string;
}

const HOP = 520;

/** Breadth-first levels from the source: who is reached at each hop. */
function levelsFrom(source: string, edges: [string, string][]) {
  const seen = new Set([source]);
  const levels: string[][] = [[source]];
  while (true) {
    const next: string[] = [];
    for (const id of levels[levels.length - 1])
      for (const [a, b] of edges) {
        const other = a === id ? b : b === id ? a : null;
        if (other && !seen.has(other)) {
          seen.add(other);
          next.push(other);
        }
      }
    if (next.length === 0) return levels;
    levels.push(next);
  }
}

/**
 * Sends a pulse out from one node along every edge, a hop at a time. Each
 * node rings when the pulse reaches it. `onComplete` reports the order, so
 * you can describe the result in words.
 */
export function NodePulseGraph({
  nodes,
  edges,
  source,
  run,
  onComplete,
  viewBox,
  label,
  className = '',
}: NodePulseGraphProps) {
  const reduced = useReducedMotion();
  const levels = useMemo(() => levelsFrom(source, edges), [source, edges]);
  const [t, setT] = useState(-1);
  const byId = useMemo(
    () => Object.fromEntries(nodes.map((n) => [n.id, n])),
    [nodes]
  );
  const depth = useMemo(() => {
    const map: Record<string, number> = {};
    levels.forEach((level, i) => level.forEach((id) => (map[id] = i)));
    return map;
  }, [levels]);

  useEffect(() => {
    if (!run) return;
    const total = (levels.length - 1) * HOP;
    if (reduced) {
      setT(total);
      onComplete?.(levels);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      setT(Math.min(elapsed, total));
      if (elapsed < total) frame = requestAnimationFrame(tick);
      else onComplete?.(levels);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
    // onComplete is a callback; a new pulse starts only when `run` changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [run, levels, reduced]);

  const hop = t < 0 ? -1 : t / HOP;
  const pulses = edges.flatMap(([a, b]) => {
    const [from, to] = depth[a] < depth[b] ? [a, b] : [b, a];
    if (depth[to] !== depth[from] + 1) return [];
    const local = hop - depth[from];
    if (local <= 0 || local >= 1) return [];
    const p = byId[from];
    const q = byId[to];
    return [
      {
        key: `${from}-${to}`,
        x: p.x + (q.x - p.x) * local,
        y: p.y + (q.y - p.y) * local,
      },
    ];
  });

  return (
    <svg
      className={`mg-pulse ${className}`}
      viewBox={viewBox}
      role='img'
      aria-label={label}
    >
      {edges.map(([a, b]) => (
        <line
          key={`${a}-${b}`}
          className='mg-pulse__edge'
          x1={byId[a].x}
          y1={byId[a].y}
          x2={byId[b].x}
          y2={byId[b].y}
        />
      ))}
      {nodes.map((node) => {
        const reached = hop >= 0 && hop >= (depth[node.id] ?? Infinity);
        return (
          <g
            key={node.id}
            className='mg-pulse__node'
            data-reached={reached}
            data-source={node.id === source}
          >
            <circle className='mg-pulse__ring' cx={node.x} cy={node.y} r='16' />
            <circle className='mg-pulse__dot' cx={node.x} cy={node.y} r='9' />
            <text x={node.x} y={node.y + 26} textAnchor='middle'>
              {node.label}
            </text>
          </g>
        );
      })}
      {pulses.map((p) => (
        <circle
          key={p.key}
          className='mg-pulse__spark'
          cx={p.x}
          cy={p.y}
          r='5'
        />
      ))}
    </svg>
  );
}
