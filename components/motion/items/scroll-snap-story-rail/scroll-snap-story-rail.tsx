'use client';

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '../../shared/use-reduced-motion';
import './scroll-snap-story-rail.css';

export interface ScrollSnapStoryRailProps {
  slides: ReactNode[];
  label: string;
  className?: string;
}

/**
 * A horizontal story using the browser's own scroll snapping, so swipes,
 * trackpads and Shift+wheel all land on a slide. Previous and Next scroll
 * to the same snap points, and a bar shows how far through you are.
 */
export function ScrollSnapStoryRail({
  slides,
  label,
  className = '',
}: ScrollSnapStoryRailProps) {
  const track = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const items = Array.from(el.children) as HTMLElement[];
      let best = 0;
      items.forEach((item, i) => {
        if (
          Math.abs(item.offsetLeft - el.scrollLeft) <
          Math.abs(items[best].offsetLeft - el.scrollLeft)
        )
          best = i;
      });
      if (el.scrollLeft + el.clientWidth >= el.scrollWidth - 2)
        best = items.length - 1;
      setIndex(best);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      el.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(frame);
    };
  }, [slides.length]);

  const go = (next: number) => {
    const el = track.current;
    const target = el?.children[next] as HTMLElement | undefined;
    if (el && target)
      el.scrollTo({
        left: target.offsetLeft,
        behavior: reduced ? 'auto' : 'smooth',
      });
  };

  return (
    <div
      className={`mg-snap ${className}`}
      role='region'
      aria-roledescription='carousel'
      aria-label={label}
      style={{ '--mg-progress': (index + 1) / slides.length } as CSSProperties}
    >
      <div
        ref={track}
        className='mg-snap__track'
        tabIndex={0}
        aria-label={`${label} slides`}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            className='mg-snap__slide'
            role='group'
            aria-roledescription='slide'
            aria-label={`${i + 1} of ${slides.length}`}
          >
            {slide}
          </div>
        ))}
      </div>
      <div className='mg-snap__bar' aria-hidden='true'>
        <span />
      </div>
      <div className='mg-snap__controls'>
        <button
          type='button'
          onClick={() => go(index - 1)}
          disabled={index === 0}
        >
          ← Previous
        </button>
        <span role='status'>
          {index + 1} of {slides.length}
        </span>
        <button
          type='button'
          onClick={() => go(index + 1)}
          disabled={index === slides.length - 1}
        >
          Next →
        </button>
      </div>
    </div>
  );
}
