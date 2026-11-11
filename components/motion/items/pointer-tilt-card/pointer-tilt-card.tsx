'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type HTMLAttributes,
  type PointerEvent,
} from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './pointer-tilt-card.css';

export interface PointerTiltCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Largest tilt on each axis, in degrees. */
  max?: number;
  /**
   * When true the card sweeps through a slow tilt on its own. Use it for a
   * touch or keyboard demonstration; set it back to false to stop.
   */
  demonstrate?: boolean;
}

/**
 * The card leans toward the pointer on two axes and springs back to flat
 * when the pointer leaves. The outer wrapper never moves, so the area that
 * responds to the pointer stays stable while the card tilts.
 */
export function PointerTiltCard({
  max = 10,
  demonstrate = false,
  className = '',
  children,
  style,
  ...rest
}: PointerTiltCardProps) {
  const reduced = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0, tracking: false });
  const frame = useRef(0);

  useEffect(() => {
    if (!demonstrate || reduced) {
      setTilt({ x: 0, y: 0, tracking: false });
      return;
    }
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1400;
      setTilt({
        x: Math.sin(t) * max * 0.8,
        y: Math.cos(t) * max * 0.8,
        tracking: true,
      });
      frame.current = requestAnimationFrame(loop);
    };
    frame.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame.current);
  }, [demonstrate, reduced, max]);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (reduced || demonstrate || event.pointerType === 'touch') return;
    const rect = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: px * 2 * max, y: -py * 2 * max, tracking: true });
  };

  return (
    <div
      className={`mg-tilt ${className}`}
      onPointerMove={onPointerMove}
      onPointerLeave={() =>
        !demonstrate && setTilt({ x: 0, y: 0, tracking: false })
      }
      style={style}
      {...rest}
    >
      <div
        className='mg-tilt__card'
        data-tracking={tilt.tracking}
        style={
          {
            '--mg-rx': `${tilt.y.toFixed(2)}deg`,
            '--mg-ry': `${tilt.x.toFixed(2)}deg`,
          } as CSSProperties
        }
      >
        {children}
      </div>
    </div>
  );
}
