'use client';

import { useEffect, useRef, type RefObject } from 'react';

export type DismissReason = 'escape' | 'outside';

/**
 * While `active`, calls `onDismiss` when Escape is pressed or when a pointer
 * goes down outside every element in `refs`. Decide where focus goes in
 * `onDismiss`: back to the trigger after Escape, left alone after an
 * outside press.
 */
export function useDismiss(
  active: boolean,
  refs: RefObject<HTMLElement | null>[],
  onDismiss: (reason: DismissReason) => void
) {
  const callback = useRef(onDismiss);
  callback.current = onDismiss;
  const inside = useRef(refs);
  inside.current = refs;

  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      callback.current('escape');
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (inside.current.some((ref) => ref.current?.contains(target))) return;
      callback.current('outside');
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [active]);
}
