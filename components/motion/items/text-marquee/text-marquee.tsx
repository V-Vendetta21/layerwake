'use client';

import {
  useLayoutEffect,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from 'react';
import { usePlayback } from '../../shared/use-playback';
import './text-marquee.css';

export interface TextMarqueeProps {
  items: string[];
  /** Accessible name for the list. */
  label: string;
  /** Pixels per second. */
  speed?: number;
  direction?: 'left' | 'right';
  paused?: boolean;
  className?: string;
}

const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

/**
 * Labels scroll through a track forever. The moving track is two decorative
 * copies; assistive technology reads one plain list. It stops when paused,
 * off screen, in a hidden tab, or with reduced motion (it then wraps).
 */
export function TextMarquee({
  items,
  label,
  speed = 60,
  direction = 'left',
  paused = false,
  className = '',
}: TextMarqueeProps) {
  const root = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLUListElement>(null);
  const [width, setWidth] = useState(0);
  const playing = usePlayback(root, paused);

  useIsomorphicLayoutEffect(() => {
    const el = copy.current;
    if (!el) return;
    const measure = () => setWidth(el.offsetWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [items]);

  const duration = width > 0 ? width / Math.max(1, speed) : 20;
  const list = (hidden: boolean) => (
    <ul
      ref={hidden ? undefined : copy}
      className='mg-marquee__copy'
      aria-hidden='true'
    >
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );

  return (
    <div
      ref={root}
      className={`mg-marquee ${className}`}
      data-playing={playing}
      data-direction={direction}
      style={{ '--mg-duration': `${duration}s` } as CSSProperties}
    >
      <ul className='mg-marquee__sr' aria-label={label}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      <div className='mg-marquee__track'>
        {list(false)}
        {list(true)}
      </div>
    </div>
  );
}
