'use client';

import { useEffect, useState, type RefObject } from 'react';

/**
 * Whether a continuous effect should run: its element is on screen, the
 * browser tab is visible and the caller has not paused it. Loops should stop
 * (or set `animation-play-state: paused`) whenever this returns false.
 */
export function usePlayback(
  ref: RefObject<Element | null>,
  paused = false
): boolean {
  const [onScreen, setOnScreen] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      setOnScreen(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) =>
      setOnScreen(entry.isIntersecting)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [ref]);

  useEffect(() => {
    const update = () => setPageVisible(document.visibilityState !== 'hidden');
    update();
    document.addEventListener('visibilitychange', update);
    return () => document.removeEventListener('visibilitychange', update);
  }, []);

  return onScreen && pageVisible && !paused;
}
