'use client';

import { useRef, type PointerEvent as ReactPointerEvent } from 'react';

export interface DragState {
  /** Distance from where the drag started, in pixels. */
  dx: number;
  dy: number;
  /** Pointer position in viewport coordinates. */
  clientX: number;
  clientY: number;
  /** Smoothed velocity in pixels per millisecond. */
  vx: number;
  vy: number;
}

export interface PointerDragOptions {
  /** Return false to ignore this press. */
  onStart?: (event: ReactPointerEvent<HTMLElement>) => boolean | void;
  onMove?: (drag: DragState) => void;
  /**
   * `cancelled` is true when the browser took the gesture over, for example
   * to scroll the page on touch.
   */
  onEnd?: (drag: DragState, cancelled: boolean) => void;
}

interface Active {
  id: number;
  startX: number;
  startY: number;
  lastX: number;
  lastY: number;
  lastTime: number;
  vx: number;
  vy: number;
}

/**
 * Pointer-capture dragging for mouse, pen and touch. Spread the returned
 * handlers on the element that starts the drag. Pair it with a CSS
 * `touch-action` that leaves the scroll axis you still want to the browser.
 */
export function usePointerDrag(options: PointerDragOptions) {
  const latest = useRef(options);
  latest.current = options;
  const active = useRef<Active | null>(null);

  const snapshot = (a: Active, x: number, y: number): DragState => ({
    dx: x - a.startX,
    dy: y - a.startY,
    clientX: x,
    clientY: y,
    vx: a.vx,
    vy: a.vy,
  });

  const finish = (
    event: ReactPointerEvent<HTMLElement>,
    cancelled: boolean
  ) => {
    const a = active.current;
    if (!a || a.id !== event.pointerId) return;
    active.current = null;
    if (event.currentTarget.hasPointerCapture?.(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    // A pause before release means the pointer was not really flung.
    if (event.timeStamp - a.lastTime > 80) {
      a.vx = 0;
      a.vy = 0;
    }
    latest.current.onEnd?.(
      snapshot(a, event.clientX, event.clientY),
      cancelled
    );
  };

  return {
    onPointerDown(event: ReactPointerEvent<HTMLElement>) {
      if (event.button !== 0 || active.current) return;
      if (latest.current.onStart?.(event) === false) return;
      event.currentTarget.setPointerCapture?.(event.pointerId);
      active.current = {
        id: event.pointerId,
        startX: event.clientX,
        startY: event.clientY,
        lastX: event.clientX,
        lastY: event.clientY,
        lastTime: event.timeStamp,
        vx: 0,
        vy: 0,
      };
    },
    onPointerMove(event: ReactPointerEvent<HTMLElement>) {
      const a = active.current;
      if (!a || a.id !== event.pointerId) return;
      const dt = Math.max(1, event.timeStamp - a.lastTime);
      a.vx = a.vx * 0.6 + ((event.clientX - a.lastX) / dt) * 0.4;
      a.vy = a.vy * 0.6 + ((event.clientY - a.lastY) / dt) * 0.4;
      a.lastX = event.clientX;
      a.lastY = event.clientY;
      a.lastTime = event.timeStamp;
      latest.current.onMove?.(snapshot(a, event.clientX, event.clientY));
    },
    onPointerUp(event: ReactPointerEvent<HTMLElement>) {
      finish(event, false);
    },
    onPointerCancel(event: ReactPointerEvent<HTMLElement>) {
      finish(event, true);
    },
  };
}
