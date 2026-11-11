'use client';

import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import './pinch-zoom-canvas.css';

export interface PinchZoomCanvasProps {
  children: ReactNode;
  label: string;
  minZoom?: number;
  maxZoom?: number;
  className?: string;
}

interface View {
  zoom: number;
  x: number;
  y: number;
}

/**
 * Pinch with two fingers (or Ctrl + wheel) to zoom, drag to pan. Buttons and
 * the keyboard (arrows, + and −, 0) do the same. All gestures stay inside
 * the box: page zoom and page scrolling elsewhere are untouched.
 */
export function PinchZoomCanvas({
  children,
  label,
  minZoom = 1,
  maxZoom = 4,
  className = '',
}: PinchZoomCanvasProps) {
  const box = useRef<HTMLDivElement>(null);
  const [view, setView] = useState<View>({ zoom: 1, x: 0, y: 0 });
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    view: View;
    dist: number;
    mid: { x: number; y: number };
  } | null>(null);
  const latest = useRef(view);
  latest.current = view;

  // Keep the content covering the box: no empty edges.
  const fit = (v: View): View => {
    const el = box.current;
    const zoom = Math.max(minZoom, Math.min(maxZoom, v.zoom));
    if (!el) return { ...v, zoom };
    const w = el.clientWidth;
    const h = el.clientHeight;
    return {
      zoom,
      x: Math.min(0, Math.max(w - w * zoom, v.x)),
      y: Math.min(0, Math.max(h - h * zoom, v.y)),
    };
  };

  const zoomAt = (factor: number, cx?: number, cy?: number) =>
    setView((v) => {
      const el = box.current!;
      const px = cx ?? el.clientWidth / 2;
      const py = cy ?? el.clientHeight / 2;
      const zoom = Math.max(minZoom, Math.min(maxZoom, v.zoom * factor));
      const k = zoom / v.zoom;
      return fit({ zoom, x: px - (px - v.x) * k, y: py - (py - v.y) * k });
    });

  useEffect(() => {
    const el = box.current;
    if (!el) return;
    const onWheel = (event: WheelEvent) => {
      if (!event.ctrlKey) return; // plain wheel keeps scrolling the page
      event.preventDefault();
      const rect = el.getBoundingClientRect();
      zoomAt(
        Math.exp(-event.deltaY * 0.01),
        event.clientX - rect.left,
        event.clientY - rect.top
      );
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
    // zoomAt only reads refs and setState.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const local = (event: PointerEvent) => {
    const rect = box.current!.getBoundingClientRect();
    return { x: event.clientX - rect.left, y: event.clientY - rect.top };
  };
  const startGesture = () => {
    const pts = [...pointers.current.values()];
    const mid =
      pts.length > 1
        ? { x: (pts[0].x + pts[1].x) / 2, y: (pts[0].y + pts[1].y) / 2 }
        : pts[0];
    const dist =
      pts.length > 1 ? Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y) : 0;
    gesture.current = { view: latest.current, dist, mid };
  };

  const onKeyDown = (event: KeyboardEvent) => {
    const step = 40;
    const pan: Record<string, [number, number]> = {
      ArrowLeft: [step, 0],
      ArrowRight: [-step, 0],
      ArrowUp: [0, step],
      ArrowDown: [0, -step],
    };
    if (pan[event.key]) {
      event.preventDefault();
      setView((v) =>
        fit({ ...v, x: v.x + pan[event.key][0], y: v.y + pan[event.key][1] })
      );
    } else if (event.key === '+' || event.key === '=') {
      event.preventDefault();
      zoomAt(1.25);
    } else if (event.key === '-') {
      event.preventDefault();
      zoomAt(0.8);
    } else if (event.key === '0') {
      event.preventDefault();
      setView({ zoom: 1, x: 0, y: 0 });
    }
  };

  return (
    <div className={`mg-pinch ${className}`}>
      <div
        ref={box}
        className='mg-pinch__box'
        tabIndex={0}
        role='group'
        aria-label={`${label}. Drag to pan, pinch to zoom; arrow keys pan, plus and minus zoom, 0 resets.`}
        onKeyDown={onKeyDown}
        onPointerDown={(event) => {
          event.currentTarget.setPointerCapture(event.pointerId);
          pointers.current.set(event.pointerId, local(event));
          startGesture();
        }}
        onPointerMove={(event) => {
          if (!pointers.current.has(event.pointerId) || !gesture.current)
            return;
          pointers.current.set(event.pointerId, local(event));
          const pts = [...pointers.current.values()];
          const g = gesture.current;
          if (pts.length > 1) {
            const mid = {
              x: (pts[0].x + pts[1].x) / 2,
              y: (pts[0].y + pts[1].y) / 2,
            };
            const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y);
            const zoom = Math.max(
              minZoom,
              Math.min(maxZoom, g.view.zoom * (dist / Math.max(1, g.dist)))
            );
            const k = zoom / g.view.zoom;
            setView(
              fit({
                zoom,
                x: mid.x - (g.mid.x - g.view.x) * k,
                y: mid.y - (g.mid.y - g.view.y) * k,
              })
            );
          } else {
            setView(
              fit({
                ...g.view,
                x: g.view.x + pts[0].x - g.mid.x,
                y: g.view.y + pts[0].y - g.mid.y,
              })
            );
          }
        }}
        onPointerUp={(event) => {
          pointers.current.delete(event.pointerId);
          if (pointers.current.size) startGesture();
          else gesture.current = null;
        }}
        onPointerCancel={(event) => {
          pointers.current.delete(event.pointerId);
          gesture.current = null;
        }}
      >
        <div
          className='mg-pinch__content'
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`,
          }}
        >
          {children}
        </div>
      </div>
      <div className='mg-pinch__controls'>
        <button
          type='button'
          aria-label='Zoom out'
          onClick={() => zoomAt(0.8)}
          disabled={view.zoom <= minZoom}
        >
          −
        </button>
        <span role='status'>{Math.round(view.zoom * 100)}%</span>
        <button
          type='button'
          aria-label='Zoom in'
          onClick={() => zoomAt(1.25)}
          disabled={view.zoom >= maxZoom}
        >
          +
        </button>
        <button type='button' onClick={() => setView({ zoom: 1, x: 0, y: 0 })}>
          Reset view
        </button>
      </div>
    </div>
  );
}
