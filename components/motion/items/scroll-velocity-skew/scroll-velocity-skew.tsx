'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './scroll-velocity-skew.css';

export interface VelocityScrollerProps {
  children: ReactNode;
  /** Accessible name for the scroll area. */
  label: string;
  /** Largest skew, in degrees. */
  maxSkew?: number;
  className?: string;
}

/**
 * A scroll area that measures how fast it is moving. Fast scrolling leans
 * the decorative `SkewStrip`s inside it (up to `maxSkew`), and they ease
 * back to straight when scrolling stops. Body text is never transformed.
 */
export function VelocityScroller({
  children,
  label,
  maxSkew = 6,
  className = '',
}: VelocityScrollerProps) {
  const el = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useEffect(() => {
    const node = el.current;
    if (!node || reduced) {
      node?.style.setProperty('--mg-skew', '0deg');
      return;
    }
    let last = node.scrollTop;
    let lastTime = performance.now();
    let skew = 0;
    let target = 0;
    let frame = 0;
    const tick = () => {
      // Ease toward the target, and let the target relax to zero.
      skew += (target - skew) * 0.2;
      target *= 0.88;
      node.style.setProperty('--mg-skew', `${skew.toFixed(2)}deg`);
      frame =
        Math.abs(skew) > 0.02 || Math.abs(target) > 0.02
          ? requestAnimationFrame(tick)
          : 0;
      if (!frame) node.style.setProperty('--mg-skew', '0deg');
    };
    const onScroll = () => {
      const now = performance.now();
      const velocity = (node.scrollTop - last) / Math.max(8, now - lastTime);
      last = node.scrollTop;
      lastTime = now;
      target = Math.max(-maxSkew, Math.min(maxSkew, velocity * 3));
      if (!frame) frame = requestAnimationFrame(tick);
    };
    node.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      node.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [maxSkew, reduced]);

  return (
    <div
      ref={el}
      className={`mg-velocity ${className}`}
      tabIndex={0}
      role='region'
      aria-label={label}
    >
      {children}
    </div>
  );
}

/** A decorative band that leans with scroll speed. Hidden from assistive tech. */
export function SkewStrip({ children }: { children?: ReactNode }) {
  return (
    <div className='mg-velocity__strip' aria-hidden='true'>
      {children}
    </div>
  );
}
